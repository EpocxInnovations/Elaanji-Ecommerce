import math
import uuid

from fastapi import HTTPException, status
from sqlalchemy import select, func, case
from sqlalchemy.orm import Session

from app.models.order import Order, OrderStatus
from app.models.user import User, UserRole
from app.services.activity_log_service import log_action


def list_customers(db: Session, search: str | None, page: int = 1, page_size: int = 20):
    base = select(User).where(User.role == UserRole.customer)
    if search:
        like = f"%{search}%"
        base = base.where((User.name.ilike(like)) | (User.email.ilike(like)) | (User.phone.ilike(like)))

    # Count query
    count_query = select(func.count()).select_from(base.subquery())
    total = db.execute(count_query).scalar_one()

    # Main query with aggregated order stats via subquery
    order_stats = (
        select(
            Order.user_id,
            func.count(case((Order.status != OrderStatus.cancelled, 1))).label("total_orders"),
            func.coalesce(func.sum(case((Order.status != OrderStatus.cancelled, Order.total_amount))), 0).label("total_spending"),
            func.max(case((Order.status != OrderStatus.cancelled, Order.created_at))).label("last_order_at"),
        )
        .group_by(Order.user_id)
        .subquery()
    )

    query = (
        select(User, order_stats.c.total_orders, order_stats.c.total_spending, order_stats.c.last_order_at)
        .outerjoin(order_stats, User.id == order_stats.c.user_id)
        .where(User.role == UserRole.customer)
    )
    if search:
        like = f"%{search}%"
        query = query.where((User.name.ilike(like)) | (User.email.ilike(like)) | (User.phone.ilike(like)))
    query = query.order_by(User.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    rows = db.execute(query).all()

    items = [
        {
            "id": customer.id,
            "name": customer.name,
            "email": customer.email,
            "phone": customer.phone,
            "created_at": customer.created_at,
            "total_orders": total_orders or 0,
            "total_spending": float(total_spending or 0),
            "last_order_at": last_order_at,
            "is_active": customer.is_active,
        }
        for customer, total_orders, total_spending, last_order_at in rows
    ]
    return {"items": items, "total": total, "page": page, "page_size": page_size, "total_pages": math.ceil(total / page_size) if page_size else 0}


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
