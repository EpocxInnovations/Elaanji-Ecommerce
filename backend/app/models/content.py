import enum
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import String, Text, Integer, Boolean, DateTime, Enum, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.mixins import UUIDPrimaryKeyMixin, TimestampMixin


class Banner(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "banners"

    image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    mobile_image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    heading: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    cta_text: Mapped[Optional[str]] = mapped_column(String(60), nullable=True)
    cta_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    placement: Mapped[str] = mapped_column(String(40), default="hero", nullable=False)  # hero | promo | sale
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    start_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    end_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class HomepageSectionType(str, enum.Enum):
    new_arrivals = "new_arrivals"
    best_sellers = "best_sellers"
    trending = "trending"
    featured_categories = "featured_categories"
    sale_collection = "sale_collection"
    announcement_bar = "announcement_bar"


class HomepageSection(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "homepage_sections"

    section_type: Mapped[HomepageSectionType] = mapped_column(
        Enum(HomepageSectionType, name="homepage_section_type"), nullable=False
    )
    title: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    # Flexible payload: e.g. list of product/category IDs, or announcement text
    config: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class Notification(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "notifications"

    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True
    )  # null => broadcast to all admins
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    link_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)


class StoreSetting(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Single-row-per-key settings table, e.g. key='store_name', value='...' """
    __tablename__ = "store_settings"

    key: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    value: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    value_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
