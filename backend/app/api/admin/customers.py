import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.middleware.auth import require_admin
from app.models.user import User
from app.schemas.admin_customer import AdminCustomerSummaryOut, AdminCustomerDetailOut, AdminCustomerStatusUpdateRequest
from app.schemas.common import PaginatedResponse
from app.services import admin_customer_service

router = APIRouter(prefix="/api/admin/customers", tags=["admin-customers"])


@router.get("", response_model=PaginatedResponse[AdminCustomerSummaryOut])
def list_customers(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
    search: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    return admin_customer_service.list_customers(db, search, page, page_size)


@router.get("/{customer_id}", response_model=AdminCustomerDetailOut)
def get_customer(customer_id: uuid.UUID, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    return admin_customer_service.get_customer_detail(db, customer_id)


@router.patch("/{customer_id}/status", response_model=AdminCustomerDetailOut)
def set_status(
    customer_id: uuid.UUID,
    payload: AdminCustomerStatusUpdateRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    return admin_customer_service.set_customer_status(db, current_admin, customer_id, payload.is_active)
