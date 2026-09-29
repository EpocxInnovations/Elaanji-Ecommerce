import uuid

from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.middleware.auth import require_admin
from app.models.user import User
from app.services import image_service, admin_product_service
from app.schemas.product import ProductImageOut

router = APIRouter(prefix="/api/admin/uploads", tags=["admin-uploads"])


@router.post("/products/{product_id}/images", response_model=ProductImageOut, status_code=201)
def upload_product_image(
    product_id: uuid.UUID,
    file: UploadFile = File(...),
    color: str | None = Form(default=None),
    variant_id: uuid.UUID | None = Form(default=None),
    is_hover_image: bool = Form(default=False),
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    image_url = image_service.upload_image(file, folder=f"elaanji/products/{product_id}")
    return admin_product_service.add_product_image(
        db, current_admin, product_id, image_url, color, is_hover_image, variant_id
    )


@router.post("/categories/image")
def upload_category_image(
    file: UploadFile = File(...),
    current_admin: User = Depends(require_admin),
):
    image_url = image_service.upload_image(file, folder="elaanji/categories")
    return {"image_url": image_url}


@router.post("/banners/image")
def upload_banner_image(
    file: UploadFile = File(...),
    current_admin: User = Depends(require_admin),
):
    image_url = image_service.upload_image(file, folder="elaanji/banners")
    return {"image_url": image_url}
