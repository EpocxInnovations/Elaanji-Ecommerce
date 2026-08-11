import uuid
from typing import Optional

from pydantic import BaseModel, Field


class AddressCreateRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    phone: str = Field(min_length=10, max_length=20)
    address_line: str = Field(min_length=5, max_length=255)
    apartment: Optional[str] = Field(default=None, max_length=120)
    city: str = Field(min_length=2, max_length=100)
    state: str = Field(min_length=2, max_length=100)
    pin_code: str = Field(min_length=4, max_length=12)
    country: str = Field(default="India", max_length=100)
    is_default: bool = False


class AddressUpdateRequest(AddressCreateRequest):
    pass


class AddressOut(BaseModel):
    id: uuid.UUID
    full_name: str
    phone: str
    address_line: str
    apartment: Optional[str] = None
    city: str
    state: str
    pin_code: str
    country: str
    is_default: bool

    model_config = {"from_attributes": True}
