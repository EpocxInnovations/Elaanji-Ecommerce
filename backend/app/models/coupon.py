import enum
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import String, Numeric, Integer, Boolean, Enum, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.mixins import UUIDPrimaryKeyMixin, TimestampMixin


class DiscountType(str, enum.Enum):
    percentage = "percentage"
    flat = "flat"


class Coupon(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "coupons"

    code: Mapped[str] = mapped_column(String(40), unique=True, index=True, nullable=False)
    discount_type: Mapped[DiscountType] = mapped_column(Enum(DiscountType, name="discount_type"), nullable=False)
    discount_value: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    minimum_order_amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0, nullable=False)
    maximum_discount_amount: Mapped[Optional[float]] = mapped_column(Numeric(10, 2), nullable=True)
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    expiry_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    usage_limit: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    user_usage_limit: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    applicable_category_ids: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)  # comma-sep UUIDs
    applicable_product_ids: Mapped[Optional[str]] = mapped_column(String(2000), nullable=True)  # comma-sep UUIDs
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    usages: Mapped[list["CouponUsage"]] = relationship(back_populates="coupon", cascade="all, delete-orphan")


class CouponUsage(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "coupon_usage"

    coupon_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("coupons.id", ondelete="CASCADE"))
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    order_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("orders.id"))

    coupon: Mapped["Coupon"] = relationship(back_populates="usages")
