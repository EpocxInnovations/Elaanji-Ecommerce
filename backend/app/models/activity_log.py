import uuid
from typing import Optional

from sqlalchemy import String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.mixins import UUIDPrimaryKeyMixin, TimestampMixin


class AdminActivityLog(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "admin_activity_logs"

    admin_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    action: Mapped[str] = mapped_column(String(200), nullable=False)  # e.g. "updated product price"
    entity_type: Mapped[str] = mapped_column(String(60), nullable=False)  # e.g. "product"
    entity_id: Mapped[Optional[str]] = mapped_column(String(60), nullable=True)
    details: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)

    admin: Mapped["User"] = relationship()  # noqa: F821
