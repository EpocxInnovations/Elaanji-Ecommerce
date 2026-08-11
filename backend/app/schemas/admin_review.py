import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.review import ReviewStatus


class AdminReviewOut(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    product_name: str
    user_name: str
    rating: int
    title: Optional[str] = None
    comment: Optional[str] = None
    admin_response: Optional[str] = None
    status: ReviewStatus
    is_verified_purchase: bool
    created_at: datetime


class ReviewStatusUpdateRequest(BaseModel):
    status: ReviewStatus


class ReviewRespondRequest(BaseModel):
    admin_response: str = Field(min_length=1, max_length=1000)
