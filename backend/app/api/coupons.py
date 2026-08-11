from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.coupon import CouponValidateRequest, CouponValidateResponse
from app.services import coupon_service

router = APIRouter(prefix="/api/coupons", tags=["coupons"])


@router.post("/validate", response_model=CouponValidateResponse)
def validate_coupon(
    payload: CouponValidateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = coupon_service.validate_and_price(db, current_user, payload.code, payload.cart_subtotal)
    return result
