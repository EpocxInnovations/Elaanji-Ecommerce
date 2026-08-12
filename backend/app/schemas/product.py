import uuid
from typing import Optional

from pydantic import BaseModel

from app.models.product import ProductStatus, GenderCategory, SareeType, Occasion


class CategoryOut(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    parent_id: Optional[uuid.UUID] = None
    display_order: int
    is_active: bool

    model_config = {"from_attributes": True}


class BrandOut(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    logo_url: Optional[str] = None

    model_config = {"from_attributes": True}


class ProductImageOut(BaseModel):
    id: uuid.UUID
    image_url: str
    is_hover_image: bool
    display_order: int
    color: Optional[str] = None

    model_config = {"from_attributes": True}


class ProductVariantOut(BaseModel):
    id: uuid.UUID
    sku: str
    color: str
    color_hex: Optional[str] = None
    blouse_size: Optional[str] = None
    price_override: Optional[float] = None
    stock_quantity: int
    reserved_quantity: int
    available_quantity: int
    is_active: bool

    model_config = {"from_attributes": True}


class ProductCardOut(BaseModel):
    """Slim shape used in listing grids — avoids shipping full variant/image detail."""
    id: uuid.UUID
    name: str
    slug: str
    price: float
    discount_price: Optional[float] = None
    category: Optional[CategoryOut] = None
    brand: Optional[BrandOut] = None
    saree_type: Optional[SareeType] = None
    occasion: Optional[Occasion] = None
    average_rating: float
    review_count: int
    is_new_arrival: bool
    is_best_seller: bool
    is_featured: bool
    is_trending: bool
    is_on_sale: bool
    primary_image_url: Optional[str] = None
    hover_image_url: Optional[str] = None
    status: ProductStatus
    available: bool

    model_config = {"from_attributes": True}


class ProductDetailOut(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    sku: str
    description: Optional[str] = None
    category: Optional[CategoryOut] = None
    brand: Optional[BrandOut] = None
    gender: GenderCategory
    saree_type: Optional[SareeType] = None
    occasion: Optional[Occasion] = None
    border_type: Optional[str] = None
    pallu_style: Optional[str] = None
    work_type: Optional[str] = None
    saree_length_meters: Optional[float] = None
    blouse_piece_included: bool
    blouse_stitched: bool
    price: float
    discount_price: Optional[float] = None
    tax_percent: float
    fabric: Optional[str] = None
    material: Optional[str] = None
    fit: Optional[str] = None
    care_instructions: Optional[str] = None
    status: ProductStatus
    is_new_arrival: bool
    is_best_seller: bool
    is_featured: bool
    is_trending: bool
    is_on_sale: bool
    tags: Optional[str] = None
    average_rating: float
    review_count: int
    variants: list[ProductVariantOut]
    images: list[ProductImageOut]

    model_config = {"from_attributes": True}
