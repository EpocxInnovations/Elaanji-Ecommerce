"""
Thin wrapper around the Razorpay SDK. Signature verification is the only
thing that's allowed to mark a payment (and therefore an order) as paid —
the frontend reporting success is never trusted on its own.
"""
import hashlib
import hmac
import uuid

import razorpay
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.order import Order, OrderStatus
from app.models.payment import Payment, PaymentStatus
from app.models.user import User
from app.services.order_service import write_status_history


def _get_client() -> razorpay.Client:
    if not settings.razorpay_key_id or not settings.razorpay_key_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Payment gateway is not configured on this server yet",
        )
    return razorpay.Client(auth=(settings.razorpay_key_id, settings.razorpay_key_secret))


def create_razorpay_order(db: Session, user: User, order_id: uuid.UUID) -> dict:
    order = db.get(Order, order_id)
    if order is None or order.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if order.status != OrderStatus.pending:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This order is not awaiting payment")

    amount_in_paise = int(round(float(order.total_amount) * 100))
    client = _get_client()
    razorpay_order = client.order.create(
        {
            "amount": amount_in_paise,
            "currency": "INR",
            "receipt": order.order_number,
            "notes": {"order_id": str(order.id)},
        }
    )

    payment = order.payment
    if payment is not None:
        payment.provider_order_id = razorpay_order["id"]
        db.commit()

    return {
        "razorpay_order_id": razorpay_order["id"],
        "razorpay_key_id": settings.razorpay_key_id,
        "amount_in_paise": amount_in_paise,
        "currency": "INR",
    }


def verify_and_confirm_payment(
    db: Session,
    user: User,
    order_id: uuid.UUID,
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str,
) -> dict:
    order = db.get(Order, order_id)
    if order is None or order.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    payment: Payment | None = order.payment
    if payment is None or payment.provider_order_id != razorpay_order_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Payment record mismatch")

    expected_signature = hmac.new(
        key=settings.razorpay_key_secret.encode(),
        msg=f"{razorpay_order_id}|{razorpay_payment_id}".encode(),
        digestmod=hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected_signature, razorpay_signature):
        payment.status = PaymentStatus.failed
        db.commit()
        return {"verified": False, "message": "Payment signature verification failed"}

    payment.status = PaymentStatus.successful
    payment.provider_payment_id = razorpay_payment_id
    payment.provider_signature = razorpay_signature
    order.status = OrderStatus.confirmed
    write_status_history(db, order, OrderStatus.confirmed, note="Payment verified")
    db.commit()

    return {"verified": True, "message": "Payment verified successfully"}
