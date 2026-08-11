import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.middleware.auth import require_admin
from app.models.user import User
from app.schemas.admin_content import BannerCreateRequest, BannerUpdateRequest, BannerOut, BannerReorderRequest
from app.services import admin_content_service

router = APIRouter(prefix="/api/admin/banners", tags=["admin-banners"])


@router.get("", response_model=list[BannerOut])
def list_banners(db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    return admin_content_service.list_banners(db)


@router.post("", response_model=BannerOut, status_code=201)
def create_banner(payload: BannerCreateRequest, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    return admin_content_service.create_banner(db, current_admin, payload)


@router.put("/{banner_id}", response_model=BannerOut)
def update_banner(banner_id: uuid.UUID, payload: BannerUpdateRequest, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    return admin_content_service.update_banner(db, current_admin, banner_id, payload)


@router.delete("/{banner_id}", status_code=204)
def delete_banner(banner_id: uuid.UUID, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    admin_content_service.delete_banner(db, current_admin, banner_id)
    return None


@router.put("/reorder", response_model=list[BannerOut])
def reorder_banners(payload: BannerReorderRequest, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    return admin_content_service.reorder_banners(db, current_admin, payload.banners)
