from datetime import datetime, timezone

from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.models.coupon import Coupon, CouponUsage, DiscountType
from app.models.user import User


def validate_and_price(db: Session, user: User, code: str, cart_subtotal: float) -> dict:
    coupon = db.execute(select(Coupon).where(func.upper(Coupon.code) == code.upper())).scalar_one_or_none()

    if coupon is None:
        return {"valid": False, "message": "Invalid coupon code"}

    if not coupon.is_active:
        return {"valid": False, "message": "This coupon is no longer active"}

    now = datetime.now(timezone.utc)
    if now < coupon.start_date or now > coupon.expiry_date:
        return {"valid": False, "message": "This coupon has expired or is not yet active"}

    if cart_subtotal < float(coupon.minimum_order_amount):
        return {
            "valid": False,
            "message": f"Minimum order of ₹{coupon.minimum_order_amount:.0f} required for this coupon",
        }

    if coupon.usage_limit is not None:
        total_uses = db.execute(
            select(func.count()).select_from(CouponUsage).where(CouponUsage.coupon_id == coupon.id)
        ).scalar_one()
        if total_uses >= coupon.usage_limit:
            return {"valid": False, "message": "This coupon has reached its usage limit"}

    user_uses = db.execute(
        select(func.count())
        .select_from(CouponUsage)
        .where(CouponUsage.coupon_id == coupon.id, CouponUsage.user_id == user.id)
    ).scalar_one()
    if user_uses >= coupon.user_usage_limit:
        return {"valid": False, "message": "You've already used this coupon the maximum number of times"}

    if coupon.discount_type == DiscountType.percentage:
        discount = cart_subtotal * (float(coupon.discount_value) / 100)
        if coupon.maximum_discount_amount is not None:
            discount = min(discount, float(coupon.maximum_discount_amount))
    else:
        discount = float(coupon.discount_value)

    discount = min(discount, cart_subtotal)

    return {"valid": True, "code": coupon.code, "discount_amount": round(discount, 2)}
