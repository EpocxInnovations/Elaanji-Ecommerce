import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.content import Banner, HomepageSection
from app.models.user import User
from app.services.activity_log_service import log_action


# --- Banners ----------------------------------------------------------

def list_banners(db: Session):
    return db.execute(select(Banner).order_by(Banner.placement, Banner.display_order)).scalars().all()


def create_banner(db: Session, admin: User, payload) -> Banner:
    banner = Banner(**payload.model_dump())
    db.add(banner)
    log_action(db, admin, "created banner", "banner", None, banner.heading)
    db.commit()
    db.refresh(banner)
    return banner


def update_banner(db: Session, admin: User, banner_id: uuid.UUID, payload) -> Banner:
    banner = db.get(Banner, banner_id)
    if banner is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Banner not found")
    for field, value in payload.model_dump().items():
        setattr(banner, field, value)
    log_action(db, admin, "updated banner", "banner", str(banner.id))
    db.commit()
    db.refresh(banner)
    return banner


def delete_banner(db: Session, admin: User, banner_id: uuid.UUID):
    banner = db.get(Banner, banner_id)
    if banner is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Banner not found")
    log_action(db, admin, "deleted banner", "banner", str(banner.id))
    db.delete(banner)
    db.commit()


def reorder_banners(db: Session, admin: User, items):
    for item in items:
        banner = db.get(Banner, item.id)
        if banner is not None:
            banner.display_order = item.display_order
    log_action(db, admin, "reordered banners", "banner")
    db.commit()
    return list_banners(db)


# --- Homepage sections --------------------------------------------------

def list_homepage_sections(db: Session):
    return db.execute(select(HomepageSection).order_by(HomepageSection.display_order)).scalars().all()


def upsert_homepage_section(db: Session, admin: User, section_id: uuid.UUID | None, payload) -> HomepageSection:
    if section_id:
        section = db.get(HomepageSection, section_id)
        if section is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Homepage section not found")
        for field, value in payload.model_dump().items():
            setattr(section, field, value)
        log_action(db, admin, "updated homepage section", "homepage_section", str(section.id))
    else:
        section = HomepageSection(**payload.model_dump())
        db.add(section)
        log_action(db, admin, "created homepage section", "homepage_section")

    db.commit()
    db.refresh(section)
    return section


def delete_homepage_section(db: Session, admin: User, section_id: uuid.UUID):
    section = db.get(HomepageSection, section_id)
    if section is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Homepage section not found")
    log_action(db, admin, "deleted homepage section", "homepage_section", str(section.id))
    db.delete(section)
    db.commit()
