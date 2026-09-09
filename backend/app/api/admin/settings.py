from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field
from typing import Optional
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import hash_password, verify_password
from app.middleware.auth import require_admin
from app.models.user import User
from app.schemas.admin_settings import (
    AllSettingsOut,
    StoreInfoSettings,
    ShippingSettings,
    TaxSettings,
    PaymentSettings,
    NotificationSettings,
)
from app.schemas.auth import UserPublic
from app.core.rate_limit import limiter
from app.services import admin_settings_service
from app.services.activity_log_service import log_action

router = APIRouter(prefix="/api/admin/settings", tags=["admin-settings"])


@router.get("", response_model=AllSettingsOut)
def get_settings(db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    return admin_settings_service.get_all_settings(db)


@router.put("/store-info", response_model=StoreInfoSettings)
def update_store_info(payload: StoreInfoSettings, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    return admin_settings_service.update_settings_group(db, current_admin, "store_info", payload)


@router.put("/shipping", response_model=ShippingSettings)
def update_shipping(payload: ShippingSettings, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    return admin_settings_service.update_settings_group(db, current_admin, "shipping", payload)


@router.put("/tax", response_model=TaxSettings)
def update_tax(payload: TaxSettings, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    return admin_settings_service.update_settings_group(db, current_admin, "tax", payload)


@router.put("/payment", response_model=PaymentSettings)
def update_payment(payload: PaymentSettings, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    return admin_settings_service.update_settings_group(db, current_admin, "payment", payload)


@router.put("/notifications", response_model=NotificationSettings)
def update_notifications(payload: NotificationSettings, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    return admin_settings_service.update_settings_group(db, current_admin, "notifications", payload)


class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    phone: Optional[str] = Field(default=None, max_length=20)


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=128)


@router.put("/profile", response_model=UserPublic)
def update_profile(payload: ProfileUpdateRequest, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    if payload.name is not None:
        current_admin.name = payload.name
    if payload.phone is not None:
        current_admin.phone = payload.phone
    log_action(db, current_admin, "updated own profile", "user", str(current_admin.id))
    db.commit()
    db.refresh(current_admin)
    return current_admin


@router.post("/change-password")
@limiter.limit("5/minute")
def change_password(request: Request, payload: PasswordChangeRequest, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    if not verify_password(payload.current_password, current_admin.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")

    current_admin.hashed_password = hash_password(payload.new_password)
    log_action(db, current_admin, "changed own password", "user", str(current_admin.id))
    db.commit()
    return {"message": "Password updated successfully"}
