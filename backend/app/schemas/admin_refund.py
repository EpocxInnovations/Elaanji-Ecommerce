import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.payment import RefundStatus


class AdminRefundOut(BaseModel):
    id: uuid.UUID
    order_id: uuid.UUID
    order_number: str
    customer_name: str
    reason: str
    refund_amount: float
    status: RefundStatus
    admin_note: Optional[str] = None
    created_at: datetime


class AdminRefundActionRequest(BaseModel):
    admin_note: Optional[str] = None
