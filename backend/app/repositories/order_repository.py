"""
Order repository for transactional lookups, customer history, and state transitions.
"""
from typing import Optional, List
import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.order import Order, OrderStatus, OrderStatusHistory
from app.models.user import User


class OrderRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, order_id: uuid.UUID, for_update: bool = False) -> Optional[Order]:
        query = (
            select(Order)
            .options(
                selectinload(Order.items),
                selectinload(Order.status_history),
                selectinload(Order.payment),
                selectinload(Order.user),
            )
            .where(Order.id == order_id)
        )
        if for_update:
            query = query.with_for_update()
        return self.db.execute(query).scalar_one_or_none()

    def get_by_order_number(self, order_number: str) -> Optional[Order]:
        return self.db.execute(
            select(Order)
            .options(
                selectinload(Order.items),
                selectinload(Order.status_history),
                selectinload(Order.payment),
            )
            .where(Order.order_number == order_number)
        ).scalar_one_or_none()

    def list_by_user(self, user_id: uuid.UUID, limit: int = 50) -> List[Order]:
        return self.db.execute(
            select(Order)
            .options(selectinload(Order.items))
            .where(Order.user_id == user_id)
            .order_by(Order.created_at.desc())
            .limit(limit)
        ).scalars().all()

    def add_status_history(self, order_id: uuid.UUID, status: OrderStatus, note: Optional[str] = None, admin_id: Optional[uuid.UUID] = None) -> OrderStatusHistory:
        history = OrderStatusHistory(
            order_id=order_id,
            status=status,
            note=note,
            changed_by_admin_id=admin_id,
        )
        self.db.add(history)
        return history
