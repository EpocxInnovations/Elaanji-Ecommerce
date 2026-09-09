import enum
import uuid
from typing import Optional

from sqlalchemy import String, Integer, Enum, ForeignKey, Text, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.mixins import UUIDPrimaryKeyMixin, TimestampMixin


class InventoryTransactionType(str, enum.Enum):
    stock_in = "stock_in"
    stock_out = "stock_out"
    order_reserved = "order_reserved"
    order_fulfilled = "order_fulfilled"
    order_cancelled_restock = "order_cancelled_restock"
    return_restock = "return_restock"
    manual_adjustment = "manual_adjustment"


class InventoryTransaction(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Immutable audit trail of every stock change for a variant."""
    __tablename__ = "inventory_transactions"

    variant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("product_variants.id", ondelete="CASCADE")
    )
    change_quantity: Mapped[int] = mapped_column(Integer, nullable=False)  # signed: +in, -out
    resulting_stock: Mapped[int] = mapped_column(Integer, nullable=False)
    transaction_type: Mapped[InventoryTransactionType] = mapped_column(
        Enum(InventoryTransactionType, name="inventory_transaction_type"), nullable=False
    )
    reference_order_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id"), nullable=True
    )
    note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_by_admin_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )

    variant: Mapped["ProductVariant"] = relationship(back_populates="inventory_transactions")  # noqa: F821

    __table_args__ = (
        Index("ix_inventory_transactions_variant_created", "variant_id", "created_at"),
    )
