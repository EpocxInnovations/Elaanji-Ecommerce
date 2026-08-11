import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.middleware.auth import require_admin
from app.models.payment import RefundStatus
from app.models.user import User
from app.schemas.admin_refund import AdminRefundOut, AdminRefundActionRequest
from app.services import admin_refund_service

router = APIRouter(prefix="/api/admin/refunds", tags=["admin-refunds"])


@router.get("", response_model=list[AdminRefundOut])
def list_refunds(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
    status: RefundStatus | None = None,
):
    return admin_refund_service.list_refunds(db, status)


@router.post("/{refund_id}/approve", response_model=AdminRefundOut)
def approve(refund_id: uuid.UUID, payload: AdminRefundActionRequest, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    return admin_refund_service.approve_refund(db, current_admin, refund_id, payload.admin_note)


@router.post("/{refund_id}/reject", response_model=AdminRefundOut)
def reject(refund_id: uuid.UUID, payload: AdminRefundActionRequest, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    return admin_refund_service.reject_refund(db, current_admin, refund_id, payload.admin_note)


@router.post("/{refund_id}/mark-received", response_model=AdminRefundOut)
def mark_received(refund_id: uuid.UUID, payload: AdminRefundActionRequest, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    return admin_refund_service.mark_item_received(db, current_admin, refund_id, payload.admin_note)


@router.post("/{refund_id}/complete", response_model=AdminRefundOut)
def complete(refund_id: uuid.UUID, payload: AdminRefundActionRequest, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    return admin_refund_service.complete_refund(db, current_admin, refund_id, payload.admin_note)
