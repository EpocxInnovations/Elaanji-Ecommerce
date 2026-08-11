import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.order import OrderStatus, DeliveryMethod
from app.models.payment import PaymentMethod, PaymentStatus


class OrderCreateRequest(BaseModel):
    address_id: uuid.UUID
    delivery_method: DeliveryMethod = DeliveryMethod.standard
    payment_method: PaymentMethod
    coupon_code: Optional[str] = Field(default=None, max_length=40)


class OrderItemOut(BaseModel):
    id: uuid.UUID
    product_name: str
    product_image_url: Optional[str] = None
    sku: str
    size: Optional[str] = None
    color: str
    unit_price: float
    quantity: int
    line_total: float

    model_config = {"from_attributes": True}


class OrderStatusHistoryOut(BaseModel):
    status: OrderStatus
    note: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class PaymentOut(BaseModel):
    method: PaymentMethod
    status: PaymentStatus
    amount: float
    provider_order_id: Optional[str] = None

    model_config = {"from_attributes": True}


class OrderOut(BaseModel):
    id: uuid.UUID
    order_number: str
    status: OrderStatus
    delivery_method: DeliveryMethod
    shipping_name: str
    shipping_phone: str
    shipping_address_line: str
    shipping_apartment: Optional[str] = None
    shipping_city: str
    shipping_state: str
    shipping_pin_code: str
    shipping_country: str
    subtotal: float
    discount_amount: float
    coupon_discount_amount: float
    coupon_code: Optional[str] = None
    shipping_fee: float
    tax_amount: float
    total_amount: float
    items: list[OrderItemOut]
    status_history: list[OrderStatusHistoryOut]
    payment: Optional[PaymentOut] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class OrderSummaryOut(BaseModel):
    id: uuid.UUID
    order_number: str
    status: OrderStatus
    total_amount: float
    item_count: int
    created_at: datetime
