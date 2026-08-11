import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class AdminCustomerSummaryOut(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    phone: Optional[str] = None
    created_at: datetime
    total_orders: int
    total_spending: float
    last_order_at: Optional[datetime] = None
    is_active: bool


class AdminCustomerDetailOut(AdminCustomerSummaryOut):
    orders: list[dict] = []


class AdminCustomerStatusUpdateRequest(BaseModel):
    is_active: bool
