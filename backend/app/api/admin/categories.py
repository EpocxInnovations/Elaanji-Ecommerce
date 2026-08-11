import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.middleware.auth import require_admin
from app.models.user import User
from app.schemas.admin_product import CategoryCreateRequest, CategoryUpdateRequest, CategoryReorderRequest
from app.schemas.product import CategoryOut
from app.services import admin_product_service

router = APIRouter(prefix="/api/admin/categories", tags=["admin-categories"])


@router.get("", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    return admin_product_service.list_categories_admin(db)


@router.post("", response_model=CategoryOut, status_code=201)
def create_category(
    payload: CategoryCreateRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    return admin_product_service.create_category(db, current_admin, payload)


@router.put("/{category_id}", response_model=CategoryOut)
def update_category(
    category_id: uuid.UUID,
    payload: CategoryUpdateRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    return admin_product_service.update_category(db, current_admin, category_id, payload)


@router.delete("/{category_id}", status_code=204)
def delete_category(
    category_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    admin_product_service.delete_category(db, current_admin, category_id)
    return None


@router.put("/reorder", response_model=list[CategoryOut])
def reorder_categories(
    payload: CategoryReorderRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    return admin_product_service.reorder_categories(db, current_admin, payload.categories)
