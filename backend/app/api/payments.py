from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.payment import (
    RazorpayOrderCreateRequest,
    RazorpayOrderCreateResponse,
    RazorpayVerifyRequest,
    RazorpayVerifyResponse,
)
from app.services import payment_service

router = APIRouter(prefix="/api/payments", tags=["payments"])


@router.post("/razorpay/order", response_model=RazorpayOrderCreateResponse)
def create_razorpay_order(
    payload: RazorpayOrderCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return payment_service.create_razorpay_order(db, current_user, payload.order_id)


@router.post("/razorpay/verify", response_model=RazorpayVerifyResponse)
def verify_razorpay_payment(
    payload: RazorpayVerifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return payment_service.verify_and_confirm_payment(
        db,
        current_user,
        payload.order_id,
        payload.razorpay_order_id,
        payload.razorpay_payment_id,
        payload.razorpay_signature,
    )
