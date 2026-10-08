import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    session_id: Optional[uuid.UUID] = None
    confirm_action: Optional[str] = None  # "yes" or "no" for confirmation gate


class ChatMessageOut(BaseModel):
    id: uuid.UUID
    role: str
    content: Optional[str] = None
    tool_calls: Optional[dict] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatResponse(BaseModel):
    session_id: uuid.UUID
    message: ChatMessageOut
    requires_confirmation: bool = False
    pending_action: Optional[dict] = None
