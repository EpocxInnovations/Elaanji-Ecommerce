import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.middleware.auth import require_admin
from app.models.order import OrderStatus
from app.models.user import User
from app.schemas.admin_order import AdminOrderSummaryOut, AdminOrderDetailOut, AdminOrderStatusUpdateRequest
from app.schemas.common import PaginatedResponse
from app.services import admin_order_service

router = APIRouter(prefix="/api/admin/orders", tags=["admin-orders"])


@router.get("", response_model=PaginatedResponse[AdminOrderSummaryOut])
def list_orders(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
    status: OrderStatus | None = None,
    search: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    return admin_order_service.list_orders_admin(db, status, search, page, page_size)


@router.get("/{order_id}", response_model=AdminOrderDetailOut)
def get_order(order_id: uuid.UUID, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    return admin_order_service.get_order_admin(db, order_id)


@router.patch("/{order_id}/status", response_model=AdminOrderDetailOut)
def update_status(
    order_id: uuid.UUID,
    payload: AdminOrderStatusUpdateRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    return admin_order_service.update_order_status(db, current_admin, order_id, payload.status, payload.note)
