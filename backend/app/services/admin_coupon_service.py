import uuid

from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.models.coupon import Coupon, CouponUsage
from app.models.user import User
from app.services.activity_log_service import log_action


def _with_usage_count(db: Session, coupon: Coupon) -> dict:
    times_used = db.execute(select(func.count()).select_from(CouponUsage).where(CouponUsage.coupon_id == coupon.id)).scalar_one()
    return {
        "id": coupon.id,
        "code": coupon.code,
        "discount_type": coupon.discount_type,
        "discount_value": float(coupon.discount_value),
        "minimum_order_amount": float(coupon.minimum_order_amount),
        "maximum_discount_amount": float(coupon.maximum_discount_amount) if coupon.maximum_discount_amount else None,
        "start_date": coupon.start_date,
        "expiry_date": coupon.expiry_date,
        "usage_limit": coupon.usage_limit,
        "user_usage_limit": coupon.user_usage_limit,
        "is_active": coupon.is_active,
        "times_used": times_used,
    }


def list_coupons(db: Session):
    coupons = db.execute(select(Coupon).order_by(Coupon.created_at.desc())).scalars().all()
    return [_with_usage_count(db, c) for c in coupons]


def create_coupon(db: Session, admin: User, payload) -> dict:
    existing = db.execute(select(Coupon).where(func.upper(Coupon.code) == payload.code.upper())).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A coupon with this code already exists")

    coupon = Coupon(**{**payload.model_dump(), "code": payload.code.upper()})
    db.add(coupon)
    log_action(db, admin, "created coupon", "coupon", None, coupon.code)
    db.commit()
    db.refresh(coupon)
    return _with_usage_count(db, coupon)


def update_coupon(db: Session, admin: User, coupon_id: uuid.UUID, payload) -> dict:
    coupon = db.get(Coupon, coupon_id)
    if coupon is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coupon not found")

    for field, value in payload.model_dump().items():
        if field == "code":
            value = value.upper()
        setattr(coupon, field, value)

    log_action(db, admin, "updated coupon", "coupon", str(coupon.id), coupon.code)
    db.commit()
    db.refresh(coupon)
    return _with_usage_count(db, coupon)


def delete_coupon(db: Session, admin: User, coupon_id: uuid.UUID):
    coupon = db.get(Coupon, coupon_id)
    if coupon is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coupon not found")
    log_action(db, admin, "deleted coupon", "coupon", str(coupon.id), coupon.code)
    db.delete(coupon)
    db.commit()
