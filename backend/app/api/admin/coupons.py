import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.middleware.auth import require_admin
from app.models.user import User
from app.schemas.admin_coupon import CouponCreateRequest, CouponUpdateRequest, CouponOut
from app.services import admin_coupon_service

router = APIRouter(prefix="/api/admin/coupons", tags=["admin-coupons"])


@router.get("", response_model=list[CouponOut])
def list_coupons(db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    return admin_coupon_service.list_coupons(db)


@router.post("", response_model=CouponOut, status_code=201)
def create_coupon(payload: CouponCreateRequest, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    return admin_coupon_service.create_coupon(db, current_admin, payload)


@router.put("/{coupon_id}", response_model=CouponOut)
def update_coupon(coupon_id: uuid.UUID, payload: CouponUpdateRequest, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    return admin_coupon_service.update_coupon(db, current_admin, coupon_id, payload)


@router.delete("/{coupon_id}", status_code=204)
def delete_coupon(coupon_id: uuid.UUID, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    admin_coupon_service.delete_coupon(db, current_admin, coupon_id)
    return None
