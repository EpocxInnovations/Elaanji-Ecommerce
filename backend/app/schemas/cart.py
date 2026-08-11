import uuid
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.product import ProductImageOut


class CartItemAddRequest(BaseModel):
    variant_id: uuid.UUID
    quantity: int = Field(default=1, ge=1, le=20)


class CartItemUpdateRequest(BaseModel):
    quantity: Optional[int] = Field(default=None, ge=1, le=20)
    saved_for_later: Optional[bool] = None


class CartItemVariantOut(BaseModel):
    id: uuid.UUID
    sku: str
    color: str
    color_hex: Optional[str] = None
    blouse_size: Optional[str] = None
    available_quantity: int
    is_active: bool

    model_config = {"from_attributes": True}


class CartItemOut(BaseModel):
    id: uuid.UUID
    variant: CartItemVariantOut
    quantity: int
    saved_for_later: bool
    unit_price: float
    line_total: float
    product_name: str
    product_slug: str
    product_image_url: Optional[str] = None


class CartSummaryOut(BaseModel):
    items: list[CartItemOut]
    subtotal: float
    item_count: int
    free_shipping_threshold: float
    amount_remaining_for_free_shipping: float
