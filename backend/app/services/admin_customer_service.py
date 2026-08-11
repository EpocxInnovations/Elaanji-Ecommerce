import uuid

from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.models.order import Order, OrderStatus
from app.models.user import User, UserRole
from app.services.activity_log_service import log_action


def list_customers(db: Session, search: str | None):
    query = select(User).where(User.role == UserRole.customer)
    if search:
        like = f"%{search}%"
        query = query.where((User.name.ilike(like)) | (User.email.ilike(like)) | (User.phone.ilike(like)))
    customers = db.execute(query.order_by(User.created_at.desc())).scalars().all()

    result = []
    for customer in customers:
        orders = db.execute(
            select(Order).where(Order.user_id == customer.id, Order.status != OrderStatus.cancelled)
        ).scalars().all()
        result.append(
            {
                "id": customer.id,
                "name": customer.name,
                "email": customer.email,
                "phone": customer.phone,
                "created_at": customer.created_at,
                "total_orders": len(orders),
                "total_spending": sum(float(o.total_amount) for o in orders),
                "last_order_at": max((o.created_at for o in orders), default=None),
                "is_active": customer.is_active,
            }
        )
    return result


def get_customer_detail(db: Session, customer_id: uuid.UUID):
    customer = db.get(User, customer_id)
    if customer is None or customer.role != UserRole.customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    orders = db.execute(
        select(Order).where(Order.user_id == customer.id).order_by(Order.created_at.desc())
    ).scalars().all()
    valid_orders = [o for o in orders if o.status != OrderStatus.cancelled]

    return {
        "id": customer.id,
        "name": customer.name,
        "email": customer.email,
        "phone": customer.phone,
        "created_at": customer.created_at,
        "total_orders": len(valid_orders),
        "total_spending": sum(float(o.total_amount) for o in valid_orders),
        "last_order_at": max((o.created_at for o in valid_orders), default=None),
        "is_active": customer.is_active,
        "orders": [
            {"id": str(o.id), "order_number": o.order_number, "status": o.status.value, "total_amount": float(o.total_amount), "created_at": o.created_at.isoformat()}
            for o in orders
        ],
    }


def set_customer_status(db: Session, admin: User, customer_id: uuid.UUID, is_active: bool):
    customer = db.get(User, customer_id)
    if customer is None or customer.role != UserRole.customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    customer.is_active = is_active
    log_action(db, admin, f"{'enabled' if is_active else 'disabled'} customer account", "user", str(customer.id), customer.email)
    db.commit()
    return get_customer_detail(db, customer_id)
