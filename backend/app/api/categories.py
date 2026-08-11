from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.product import Category
from app.schemas.product import CategoryOut

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    categories = db.execute(
        select(Category).where(Category.is_active.is_(True)).order_by(Category.display_order)
    ).scalars().all()
    return categories
