"""
Models for the customer-support chatbot feature:
- KnowledgeChunk: pgvector-embedded policy/FAQ content for RAG retrieval
- ChatSession: groups a conversation thread per authenticated user
- ChatMessage: individual messages within a session (user, assistant, tool roles)
"""
import uuid
from typing import Optional

from sqlalchemy import String, Text, ForeignKey, Index, Float
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.mixins import UUIDPrimaryKeyMixin, TimestampMixin


class KnowledgeChunk(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Embedded text chunks for RAG retrieval. Each row stores a passage of
    policy/FAQ text alongside its vector embedding for similarity search."""
    __tablename__ = "knowledge_chunks"

    content: Mapped[str] = mapped_column(Text, nullable=False)
    embedding: Mapped[list[float]] = mapped_column(ARRAY(Float), nullable=True)
    source: Mapped[str] = mapped_column(String(200), nullable=False)
    meta: Mapped[Optional[dict]] = mapped_column("metadata", JSONB, nullable=True)

    __table_args__ = (
        Index("ix_knowledge_chunks_source", "source"),
    )


class ChatSession(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """One conversation thread per user. Sessions are reusable across page
    visits — the frontend sends session_id to continue a conversation."""
    __tablename__ = "chat_sessions"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE")
    )

    messages: Mapped[list["ChatMessage"]] = relationship(
        back_populates="session", cascade="all, delete-orphan",
        order_by="ChatMessage.created_at",
    )

    __table_args__ = (
        Index("ix_chat_sessions_user_id", "user_id"),
    )


class ChatMessage(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """A single message in a chat session. role is one of:
    'user', 'assistant', 'system', 'tool'. Tool call metadata is stored
    in the tool_calls JSONB column."""
    __tablename__ = "chat_messages"

    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("chat_sessions.id", ondelete="CASCADE")
    )
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    tool_calls: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    session: Mapped["ChatSession"] = relationship(back_populates="messages")

    __table_args__ = (
        Index("ix_chat_messages_session_created", "session_id", "created_at"),
    )
