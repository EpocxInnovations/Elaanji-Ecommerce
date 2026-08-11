import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.coupon import DiscountType


class CouponCreateRequest(BaseModel):
    code: str = Field(min_length=2, max_length=40)
    discount_type: DiscountType
    discount_value: float = Field(gt=0)
    minimum_order_amount: float = Field(default=0, ge=0)
    maximum_discount_amount: Optional[float] = Field(default=None, ge=0)
    start_date: datetime
    expiry_date: datetime
    usage_limit: Optional[int] = Field(default=None, ge=1)
    user_usage_limit: int = Field(default=1, ge=1)
    applicable_category_ids: Optional[str] = None
    applicable_product_ids: Optional[str] = None
    is_active: bool = True


class CouponUpdateRequest(CouponCreateRequest):
    pass


class CouponOut(BaseModel):
    id: uuid.UUID
    code: str
    discount_type: DiscountType
    discount_value: float
    minimum_order_amount: float
    maximum_discount_amount: Optional[float] = None
    start_date: datetime
    expiry_date: datetime
    usage_limit: Optional[int] = None
    user_usage_limit: int
    is_active: bool
    times_used: int = 0

    model_config = {"from_attributes": True}
