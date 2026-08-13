"""
Admin actions on return/refund requests raised by customers in Phase 3.
Each action moves the Refund and the parent Order together so they never
drift out of sync, and item-received restocks inventory through the same
audited path everything else uses.
"""
import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.content import Notification
from app.models.inventory import InventoryTransaction, InventoryTransactionType
from app.models.order import Order, OrderStatus
from app.models.payment import Refund, RefundStatus, PaymentStatus
from app.models.product import ProductVariant
from app.models.user import User
from app.services.activity_log_service import log_action
from app.services.order_service import write_status_history


def _load_refund(db: Session, refund_id: uuid.UUID) -> Refund:
    refund = db.execute(
        select(Refund).options(selectinload(Refund.order).selectinload(Order.items), selectinload(Refund.order).selectinload(Order.user), selectinload(Refund.payment))
        .where(Refund.id == refund_id)
    ).scalar_one_or_none()
    if refund is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Refund request not found")
    return refund


def _serialize_refund(refund: Refund) -> dict:
    return {
        "id": refund.id,
        "order_id": refund.order_id,
        "order_number": refund.order.order_number,
        "customer_name": refund.order.user.name,
        "reason": refund.reason,
        "refund_amount": float(refund.refund_amount),
        "status": refund.status,
        "admin_note": refund.admin_note,
        "created_at": refund.created_at,
    }


def list_refunds(db: Session, status_filter: RefundStatus | None):
    query = select(Refund).options(selectinload(Refund.order).selectinload(Order.user))
    if status_filter:
        query = query.where(Refund.status == status_filter)
    query = query.order_by(Refund.created_at.desc())
    refunds = db.execute(query).scalars().unique().all()
    return [
        {
            "id": r.id,
            "order_id": r.order_id,
            "order_number": r.order.order_number,
            "customer_name": r.order.user.name,
            "reason": r.reason,
            "refund_amount": float(r.refund_amount),
            "status": r.status,
            "admin_note": r.admin_note,
            "created_at": r.created_at,
        }
        for r in refunds
    ]


def approve_refund(db: Session, admin: User, refund_id: uuid.UUID, note: str | None) -> Refund:
    refund = _load_refund(db, refund_id)
    if refund.status != RefundStatus.requested:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only newly requested refunds can be approved")

    refund.status = RefundStatus.approved
    refund.admin_note = note
    db.add(Notification(user_id=refund.order.user_id, title=f"Return approved: {refund.order.order_number}", message="Your return request has been approved. Please ship the item back."))
    log_action(db, admin, "approved refund", "refund", str(refund.id), refund.order.order_number)
    db.commit()
    return _serialize_refund(_load_refund(db, refund_id))


def reject_refund(db: Session, admin: User, refund_id: uuid.UUID, note: str | None) -> Refund:
    refund = _load_refund(db, refund_id)
    if refund.status != RefundStatus.requested:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only newly requested refunds can be rejected")

    refund.status = RefundStatus.rejected
    refund.admin_note = note
    order = refund.order
    order.status = OrderStatus.delivered
    write_status_history(db, order, OrderStatus.delivered, note="Return request rejected")
    db.add(Notification(user_id=order.user_id, title=f"Return rejected: {order.order_number}", message=note or "Your return request was not approved."))
    log_action(db, admin, "rejected refund", "refund", str(refund.id), order.order_number)
    db.commit()
    return _serialize_refund(_load_refund(db, refund_id))


def mark_item_received(db: Session, admin: User, refund_id: uuid.UUID, note: str | None) -> Refund:
    refund = _load_refund(db, refund_id)
    if refund.status != RefundStatus.approved:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Refund must be approved before marking the item received")

    refund.status = RefundStatus.item_received
    refund.admin_note = note
    order = refund.order
    order.status = OrderStatus.returned
    write_status_history(db, order, OrderStatus.returned, note="Returned item received")

    for item in order.items:
        variant = db.get(ProductVariant, item.variant_id)
        if variant is not None:
            variant.stock_quantity += item.quantity
            db.add(
                InventoryTransaction(
                    variant_id=variant.id,
                    change_quantity=item.quantity,
                    resulting_stock=variant.stock_quantity,
                    transaction_type=InventoryTransactionType.return_restock,
                    reference_order_id=order.id,
                    note=f"Returned item restocked from order {order.order_number}",
                    created_by_admin_id=admin.id,
                )
            )

    log_action(db, admin, "marked returned item received", "refund", str(refund.id), order.order_number)
    db.commit()
    return _serialize_refund(_load_refund(db, refund_id))


def complete_refund(db: Session, admin: User, refund_id: uuid.UUID, note: str | None) -> Refund:
    refund = _load_refund(db, refund_id)
    if refund.status not in (RefundStatus.item_received, RefundStatus.processing):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Refund isn't ready to be completed yet")

    refund.status = RefundStatus.completed
    refund.admin_note = note
    order = refund.order
    order.status = OrderStatus.refunded
    write_status_history(db, order, OrderStatus.refunded, note="Refund completed")

    if refund.payment:
        refund.payment.status = PaymentStatus.refunded
    elif order.payment:
        order.payment.status = PaymentStatus.refunded

    db.add(Notification(user_id=order.user_id, title=f"Refund completed: {order.order_number}", message=f"Your refund of ₹{refund.refund_amount:.0f} has been processed."))
    log_action(db, admin, "completed refund", "refund", str(refund.id), order.order_number)
    db.commit()
    return _serialize_refund(_load_refund(db, refund_id))
