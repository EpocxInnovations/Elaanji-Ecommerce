from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, or_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.content import Banner
from app.schemas.admin_content import BannerOut

router = APIRouter(prefix="/api/banners", tags=["banners"])


@router.get("", response_model=list[BannerOut])
def list_active_banners(db: Session = Depends(get_db), placement: str | None = Query(default=None)):
    now = datetime.now(timezone.utc)
    query = select(Banner).where(
        Banner.is_active.is_(True),
        or_(Banner.start_at.is_(None), Banner.start_at <= now),
        or_(Banner.end_at.is_(None), Banner.end_at >= now),
    )
    if placement:
        query = query.where(Banner.placement == placement)
    query = query.order_by(Banner.display_order)
    return db.execute(query).scalars().all()
