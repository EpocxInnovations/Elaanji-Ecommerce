from pydantic import BaseModel, Field


class CouponValidateRequest(BaseModel):
    code: str = Field(min_length=1, max_length=40)
    cart_subtotal: float = Field(ge=0)


class CouponValidateResponse(BaseModel):
    valid: bool
    code: str | None = None
    discount_amount: float = 0
    message: str | None = None
