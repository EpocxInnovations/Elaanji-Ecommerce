import enum
import uuid
from typing import Optional

from sqlalchemy import String, Text, Numeric, Boolean, Integer, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.mixins import UUIDPrimaryKeyMixin, TimestampMixin


class ProductStatus(str, enum.Enum):
    active = "active"
    draft = "draft"
    archived = "archived"
    out_of_stock = "out_of_stock"


class GenderCategory(str, enum.Enum):
    women = "women"
    kids = "kids"


class SareeType(str, enum.Enum):
    """The weave/tradition category — the primary way saree shoppers browse."""
    kanjivaram = "kanjivaram"
    banarasi = "banarasi"
    tussar = "tussar"
    bandhani = "bandhani"
    chanderi = "chanderi"
    kanchipuram_silk = "kanchipuram_silk"
    mysore_silk = "mysore_silk"
    linen = "linen"
    organza = "organza"
    georgette = "georgette"
    chiffon = "chiffon"
    cotton = "cotton"
    tissue = "tissue"
    designer = "designer"
    other = "other"


class Occasion(str, enum.Enum):
    wedding = "wedding"
    festive = "festive"
    casual = "casual"
    party = "party"
    office = "office"
    puja = "puja"
    reception = "reception"


class Category(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "categories"

    name: Mapped[str] = mapped_column(String(120), nullable=False)
    slug: Mapped[str] = mapped_column(String(140), unique=True, index=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    parent_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True
    )
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    products: Mapped[list["Product"]] = relationship(back_populates="category")
    children: Mapped[list["Category"]] = relationship(
        "Category", back_populates="parent", remote_side="Category.parent_id"
    )
    parent: Mapped[Optional["Category"]] = relationship(
        "Category", back_populates="children", remote_side="Category.id"
    )


class Brand(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "brands"

    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(140), unique=True, index=True, nullable=False)
    logo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    products: Mapped[list["Product"]] = relationship(back_populates="brand")


class Product(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "products"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(220), unique=True, index=True, nullable=False)
    sku: Mapped[str] = mapped_column(String(80), unique=True, index=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    category_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True
    )
    brand_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("brands.id"), nullable=True
    )

    gender: Mapped[GenderCategory] = mapped_column(Enum(GenderCategory, name="gender_category"), nullable=False)

    saree_type: Mapped[Optional[SareeType]] = mapped_column(Enum(SareeType, name="saree_type"), nullable=True)
    occasion: Mapped[Optional[Occasion]] = mapped_column(Enum(Occasion, name="occasion"), nullable=True)
    border_type: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)  # e.g. "Zari Border", "Temple Border"
    pallu_style: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    work_type: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)  # e.g. "Zari", "Embroidery", "Stone Work", "Plain"
    saree_length_meters: Mapped[Optional[float]] = mapped_column(Numeric(4, 2), default=6.3, nullable=True)
    blouse_piece_included: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    blouse_stitched: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    discount_price: Mapped[Optional[float]] = mapped_column(Numeric(10, 2), nullable=True)
    tax_percent: Mapped[float] = mapped_column(Numeric(5, 2), default=0, nullable=False)

    fabric: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    material: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    fit: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)
    care_instructions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    status: Mapped[ProductStatus] = mapped_column(
        Enum(ProductStatus, name="product_status"), default=ProductStatus.draft, nullable=False
    )

    is_new_arrival: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_best_seller: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_trending: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_on_sale: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    tags: Mapped[Optional[str]] = mapped_column(String(400), nullable=True)  # comma separated
    average_rating: Mapped[float] = mapped_column(Numeric(3, 2), default=0, nullable=False)
    review_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    view_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    category: Mapped["Category"] = relationship(back_populates="products")
    brand: Mapped[Optional["Brand"]] = relationship(back_populates="products")
    variants: Mapped[list["ProductVariant"]] = relationship(back_populates="product", cascade="all, delete-orphan")
    images: Mapped[list["ProductImage"]] = relationship(back_populates="product", cascade="all, delete-orphan")
    reviews: Mapped[list["Review"]] = relationship(back_populates="product")  # noqa: F821


class ProductVariant(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """One SKU per color (and, when the blouse is pre-stitched, blouse size).
    Color is the primary variant axis for sarees — size only applies when
    `blouse_stitched` is true on the parent product."""
    __tablename__ = "product_variants"

    product_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"))
    sku: Mapped[str] = mapped_column(String(80), unique=True, index=True, nullable=False)
    color: Mapped[str] = mapped_column(String(40), nullable=False)
    color_hex: Mapped[Optional[str]] = mapped_column(String(7), nullable=True)
    blouse_size: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)  # only when blouse_stitched=True

    price_override: Mapped[Optional[float]] = mapped_column(Numeric(10, 2), nullable=True)

    stock_quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    reserved_quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    low_stock_threshold: Mapped[int] = mapped_column(Integer, default=5, nullable=False)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    product: Mapped["Product"] = relationship(back_populates="variants")
    inventory_transactions: Mapped[list["InventoryTransaction"]] = relationship(  # noqa: F821
        back_populates="variant"
    )

    @property
    def available_quantity(self) -> int:
        return max(self.stock_quantity - self.reserved_quantity, 0)


class ProductImage(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "product_images"

    product_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"))
    image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    is_hover_image: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    color: Mapped[Optional[str]] = mapped_column(String(40), nullable=True)  # image tied to a color variant

    product: Mapped["Product"] = relationship(back_populates="images")
