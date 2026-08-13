import uuid
from typing import Optional

from pydantic import BaseModel, Field

from app.models.product import ProductStatus, GenderCategory, SareeType, Occasion


class VariantInput(BaseModel):
    """Used both for creating a new variant and updating an existing one
    (existing variants carry an `id`; new ones omit it)."""
    id: Optional[uuid.UUID] = None
    sku: str = Field(min_length=2, max_length=80)
    color: str = Field(min_length=1, max_length=40)
    color_hex: Optional[str] = Field(default=None, max_length=7)
    blouse_size: Optional[str] = Field(default=None, max_length=20)
    price_override: Optional[float] = Field(default=None, ge=0)
    stock_quantity: int = Field(default=0, ge=0)
    low_stock_threshold: int = Field(default=5, ge=0)
    is_active: bool = True


class ImageInput(BaseModel):
    image_url: str
    is_hover_image: bool = False
    color: Optional[str] = None


class ProductCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    slug: str = Field(min_length=2, max_length=220)
    sku: str = Field(min_length=2, max_length=80)
    description: Optional[str] = None
    category_id: uuid.UUID
    brand_id: Optional[uuid.UUID] = None
    gender: GenderCategory = GenderCategory.women
    saree_type: Optional[SareeType] = None
    occasion: Optional[Occasion] = None
    border_type: Optional[str] = Field(default=None, max_length=120)
    pallu_style: Optional[str] = Field(default=None, max_length=120)
    work_type: Optional[str] = Field(default=None, max_length=120)
    fabric: Optional[str] = Field(default=None, max_length=120)
    material: Optional[str] = Field(default=None, max_length=120)
    fit: Optional[str] = Field(default=None, max_length=80)
    care_instructions: Optional[str] = None
    saree_length_meters: Optional[float] = Field(default=6.3, ge=0)
    blouse_piece_included: bool = True
    blouse_stitched: bool = False
    price: float = Field(gt=0)
    discount_price: Optional[float] = Field(default=None, ge=0)
    tax_percent: float = Field(default=5, ge=0, le=100)
    status: ProductStatus = ProductStatus.draft
    is_new_arrival: bool = False
    is_best_seller: bool = False
    is_featured: bool = False
    is_trending: bool = False
    is_on_sale: bool = False
    tags: Optional[str] = Field(default=None, max_length=400)
    variants: list[VariantInput] = Field(default_factory=list)
    images: list[ImageInput] = Field(default_factory=list)


class ProductUpdateRequest(ProductCreateRequest):
    pass


class ProductStatusUpdateRequest(BaseModel):
    status: ProductStatus


class ImageReorderItem(BaseModel):
    id: uuid.UUID
    display_order: int
    is_hover_image: bool = False


class ImageReorderRequest(BaseModel):
    images: list[ImageReorderItem]


class CategoryCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    slug: str = Field(min_length=2, max_length=140)
    description: Optional[str] = None
    image_url: Optional[str] = None
    parent_id: Optional[uuid.UUID] = None
    display_order: int = 0
    is_active: bool = True


class CategoryUpdateRequest(CategoryCreateRequest):
    pass


class CategoryReorderItem(BaseModel):
    id: uuid.UUID
    display_order: int


class CategoryReorderRequest(BaseModel):
    categories: list[CategoryReorderItem]
