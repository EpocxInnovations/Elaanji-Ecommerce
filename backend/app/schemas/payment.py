import uuid

from pydantic import BaseModel


class RazorpayOrderCreateRequest(BaseModel):
    order_id: uuid.UUID


class RazorpayOrderCreateResponse(BaseModel):
    razorpay_order_id: str
    razorpay_key_id: str
    amount_in_paise: int
    currency: str = "INR"


class RazorpayVerifyRequest(BaseModel):
    order_id: uuid.UUID
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class RazorpayVerifyResponse(BaseModel):
    verified: bool
    message: str
