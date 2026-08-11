"""
Admin-side order operations. Status changes go through a legal-transition
map so an order can't jump from 'pending' straight to 'delivered', and every
change writes both an OrderStatusHistory row and a customer-facing
Notification — never just a silent column update.
"""
import uuid

from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.orm import Session, selectinload

from app.models.content import Notification
from app.models.order import Order, OrderStatus, OrderItem
from app.models.payment import Payment
from app.models.user import User
from app.services.activity_log_service import log_action
from app.services.order_service import write_status_history

# What each status is legally allowed to move to next.
LEGAL_TRANSITIONS: dict[OrderStatus, set[OrderStatus]] = {
    OrderStatus.pending: {OrderStatus.confirmed, OrderStatus.cancelled},
    OrderStatus.confirmed: {OrderStatus.processing, OrderStatus.cancelled},
    OrderStatus.processing: {OrderStatus.packed, OrderStatus.cancelled},
    OrderStatus.packed: {OrderStatus.shipped, OrderStatus.cancelled},
    OrderStatus.shipped: {OrderStatus.out_for_delivery},
    OrderStatus.out_for_delivery: {OrderStatus.delivered},
    OrderStatus.delivered: set(),
    OrderStatus.cancelled: set(),
    OrderStatus.return_requested: set(),  # handled via the refund workflow
    OrderStatus.returned: set(),
    OrderStatus.refunded: set(),
}

STATUS_MESSAGES = {
    OrderStatus.confirmed: "Your order has been confirmed.",
    OrderStatus.processing: "Your order is being processed.",
    OrderStatus.packed: "Your order has been packed and is ready for dispatch.",
    OrderStatus.shipped: "Your order has been shipped.",
    OrderStatus.out_for_delivery: "Your order is out for delivery.",
    OrderStatus.delivered: "Your order has been delivered.",
    OrderStatus.cancelled: "Your order has been cancelled.",
}


def _load_order(db: Session, order_id: uuid.UUID) -> Order:
    order = db.execute(
        select(Order)
        .options(selectinload(Order.items), selectinload(Order.status_history), selectinload(Order.payment))
        .where(Order.id == order_id)
    ).scalar_one_or_none()
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order


def list_orders_admin(db: Session, status_filter: OrderStatus | None, search: str | None):
    query = select(Order).options(selectinload(Order.items), selectinload(Order.payment), selectinload(Order.user))
    if status_filter:
        query = query.where(Order.status == status_filter)
    if search:
        like = f"%{search}%"
        query = query.join(Order.user).where(
            (Order.order_number.ilike(like))
            | (User.name.ilike(like))
            | (User.email.ilike(like))
            | (User.phone.ilike(like))
        )
    query = query.order_by(Order.created_at.desc())
    orders = db.execute(query).scalars().unique().all()

    return [
        {
            "id": o.id,
            "order_number": o.order_number,
            "customer_name": o.user.name,
            "customer_email": o.user.email,
            "customer_phone": o.user.phone,
            "status": o.status,
            "total_amount": float(o.total_amount),
            "payment_method": o.payment.method.value if o.payment else "unknown",
            "payment_status": o.payment.status.value if o.payment else "unknown",
            "item_count": sum(i.quantity for i in o.items),
            "created_at": o.created_at,
        }
        for o in orders
    ]


def get_order_admin(db: Session, order_id: uuid.UUID) -> Order:
    return _load_order(db, order_id)


def update_order_status(db: Session, admin: User, order_id: uuid.UUID, new_status: OrderStatus, note: str | None) -> Order:
    order = _load_order(db, order_id)

    allowed = LEGAL_TRANSITIONS.get(order.status, set())
    if new_status not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot move an order from '{order.status.value}' to '{new_status.value}'",
        )

    order.status = new_status
    write_status_history(db, order, new_status, note=note or f"Status updated by admin")

    db.add(
        Notification(
            user_id=order.user_id,
            title=f"Order {order.order_number} update",
            message=note or STATUS_MESSAGES.get(new_status, f"Your order status is now {new_status.value}."),
            link_url=f"/orders/{order.id}",
        )
    )

    log_action(db, admin, f"changed order status to {new_status.value}", "order", str(order.id), order.order_number)
    db.commit()
    return _load_order(db, order_id)
