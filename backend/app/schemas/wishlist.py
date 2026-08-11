import uuid

from pydantic import BaseModel

from app.schemas.product import ProductCardOut


class WishlistItemAddRequest(BaseModel):
    product_id: uuid.UUID


class WishlistItemOut(BaseModel):
    id: uuid.UUID
    product: ProductCardOut


class WishlistOut(BaseModel):
    items: list[WishlistItemOut]
