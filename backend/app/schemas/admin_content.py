import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.content import HomepageSectionType


class BannerCreateRequest(BaseModel):
    image_url: str
    heading: Optional[str] = None
    description: Optional[str] = None
    cta_text: Optional[str] = None
    cta_url: Optional[str] = None
    placement: str = "hero"
    display_order: int = 0
    start_at: Optional[datetime] = None
    end_at: Optional[datetime] = None
    is_active: bool = True


class BannerUpdateRequest(BannerCreateRequest):
    pass


class BannerOut(BaseModel):
    id: uuid.UUID
    image_url: str
    heading: Optional[str] = None
    description: Optional[str] = None
    cta_text: Optional[str] = None
    cta_url: Optional[str] = None
    placement: str
    display_order: int
    start_at: Optional[datetime] = None
    end_at: Optional[datetime] = None
    is_active: bool

    model_config = {"from_attributes": True}


class BannerReorderItem(BaseModel):
    id: uuid.UUID
    display_order: int


class BannerReorderRequest(BaseModel):
    banners: list[BannerReorderItem]


class HomepageSectionUpdateRequest(BaseModel):
    section_type: HomepageSectionType
    title: Optional[str] = None
    config: Optional[dict] = None
    display_order: int = 0
    is_active: bool = True


class HomepageSectionOut(BaseModel):
    id: uuid.UUID
    section_type: HomepageSectionType
    title: Optional[str] = None
    config: Optional[dict] = None
    display_order: int
    is_active: bool

    model_config = {"from_attributes": True}
