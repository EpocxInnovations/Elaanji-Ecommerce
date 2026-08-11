import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.order import OrderStatus
from app.schemas.order import OrderOut


class AdminOrderSummaryOut(BaseModel):
    id: uuid.UUID
    order_number: str
    customer_name: str
    customer_email: str
    customer_phone: Optional[str] = None
    status: OrderStatus
    total_amount: float
    payment_method: str
    payment_status: str
    item_count: int
    created_at: datetime


class AdminOrderStatusUpdateRequest(BaseModel):
    status: OrderStatus
    note: Optional[str] = None


# Admin sees the same full detail shape as the customer order view
AdminOrderDetailOut = OrderOut
