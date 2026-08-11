import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.middleware.auth import require_admin
from app.models.user import User
from app.schemas.admin_content import HomepageSectionUpdateRequest, HomepageSectionOut
from app.services import admin_content_service

router = APIRouter(prefix="/api/admin/homepage-sections", tags=["admin-homepage"])


@router.get("", response_model=list[HomepageSectionOut])
def list_sections(db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    return admin_content_service.list_homepage_sections(db)


@router.post("", response_model=HomepageSectionOut, status_code=201)
def create_section(payload: HomepageSectionUpdateRequest, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    return admin_content_service.upsert_homepage_section(db, current_admin, None, payload)


@router.put("/{section_id}", response_model=HomepageSectionOut)
def update_section(section_id: uuid.UUID, payload: HomepageSectionUpdateRequest, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    return admin_content_service.upsert_homepage_section(db, current_admin, section_id, payload)


@router.delete("/{section_id}", status_code=204)
def delete_section(section_id: uuid.UUID, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    admin_content_service.delete_homepage_section(db, current_admin, section_id)
    return None
