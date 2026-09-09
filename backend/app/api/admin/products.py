import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.middleware.auth import require_admin
from app.models.product import ProductStatus
from app.models.user import User
from app.schemas.admin_product import (
    ProductCreateRequest,
    ProductUpdateRequest,
    ProductStatusUpdateRequest,
    ImageReorderRequest,
)
from app.schemas.common import PaginatedResponse
from app.schemas.product import ProductDetailOut
from app.services import admin_product_service

router = APIRouter(prefix="/api/admin/products", tags=["admin-products"])


@router.get("", response_model=PaginatedResponse[ProductDetailOut])
def list_products(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
    search: str | None = None,
    status: ProductStatus | None = None,
    category_id: uuid.UUID | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    return admin_product_service.list_products_admin(db, search, status, category_id, page, page_size)


@router.get("/{product_id}", response_model=ProductDetailOut)
def get_product(
    product_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    return admin_product_service.get_product_admin(db, product_id)


@router.post("", response_model=ProductDetailOut, status_code=201)
def create_product(
    payload: ProductCreateRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    return admin_product_service.create_product(db, current_admin, payload)


@router.put("/{product_id}", response_model=ProductDetailOut)
def update_product(
    product_id: uuid.UUID,
    payload: ProductUpdateRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    return admin_product_service.update_product(db, current_admin, product_id, payload)


@router.patch("/{product_id}/status", response_model=ProductDetailOut)
def update_status(
    product_id: uuid.UUID,
    payload: ProductStatusUpdateRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    return admin_product_service.set_product_status(db, current_admin, product_id, payload.status)


@router.post("/{product_id}/duplicate", response_model=ProductDetailOut, status_code=201)
def duplicate_product(
    product_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    return admin_product_service.duplicate_product(db, current_admin, product_id)


@router.delete("/{product_id}/images/{image_id}", status_code=204)
def delete_image(
    product_id: uuid.UUID,
    image_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    admin_product_service.delete_product_image(db, current_admin, product_id, image_id)
    return None


@router.put("/{product_id}/images/reorder", response_model=ProductDetailOut)
def reorder_images(
    product_id: uuid.UUID,
    payload: ImageReorderRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    return admin_product_service.reorder_images(db, current_admin, product_id, payload.images)
