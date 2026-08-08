import enum
import uuid
from typing import Optional

from sqlalchemy import String, Numeric, Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.mixins import UUIDPrimaryKeyMixin, TimestampMixin


class PaymentMethod(str, enum.Enum):
    razorpay = "razorpay"
    upi = "upi"
    card = "card"
    net_banking = "net_banking"
    wallet = "wallet"
    cod = "cod"


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    successful = "successful"
    failed = "failed"
    refunded = "refunded"


class RefundStatus(str, enum.Enum):
    requested = "requested"
    approved = "approved"
    rejected = "rejected"
    item_received = "item_received"
    processing = "processing"
    completed = "completed"


class Payment(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "payments"

    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), unique=True
    )
    method: Mapped[PaymentMethod] = mapped_column(Enum(PaymentMethod, name="payment_method"), nullable=False)
    status: Mapped[PaymentStatus] = mapped_column(
        Enum(PaymentStatus, name="payment_status"), default=PaymentStatus.pending, nullable=False
    )
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    provider_order_id: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)  # razorpay_order_id
    provider_payment_id: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)  # razorpay_payment_id
    provider_signature: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    order: Mapped["Order"] = relationship(back_populates="payment")
    refunds: Mapped[list["Refund"]] = relationship(back_populates="payment")


class Refund(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "refunds"

    order_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("orders.id"))
    payment_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("payments.id"), nullable=True)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    refund_amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    status: Mapped[RefundStatus] = mapped_column(
        Enum(RefundStatus, name="refund_status"), default=RefundStatus.requested, nullable=False
    )
    admin_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    payment: Mapped[Optional["Payment"]] = relationship(back_populates="refunds")
    order: Mapped["Order"] = relationship()
