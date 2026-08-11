import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.inventory import InventoryTransactionType


class InventoryRowOut(BaseModel):
    variant_id: uuid.UUID
    product_id: uuid.UUID
    product_name: str
    sku: str
    color: str
    blouse_size: Optional[str] = None
    stock_quantity: int
    reserved_quantity: int
    available_quantity: int
    low_stock_threshold: int
    is_low_stock: bool


class InventoryAdjustRequest(BaseModel):
    variant_id: uuid.UUID
    change_quantity: int = Field(description="Positive to add stock, negative to remove")
    note: Optional[str] = Field(default=None, max_length=500)


class BulkInventoryAdjustItem(BaseModel):
    variant_id: uuid.UUID
    change_quantity: int


class BulkInventoryAdjustRequest(BaseModel):
    items: list[BulkInventoryAdjustItem]
    note: Optional[str] = Field(default=None, max_length=500)


class InventoryTransactionOut(BaseModel):
    id: uuid.UUID
    change_quantity: int
    resulting_stock: int
    transaction_type: InventoryTransactionType
    note: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}
