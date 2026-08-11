import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.middleware.auth import require_admin
from app.models.user import User
from app.schemas.admin_inventory import (
    InventoryRowOut,
    InventoryAdjustRequest,
    BulkInventoryAdjustRequest,
    InventoryTransactionOut,
)
from app.schemas.product import ProductVariantOut
from app.services import inventory_service

router = APIRouter(prefix="/api/admin/inventory", tags=["admin-inventory"])


@router.get("", response_model=list[InventoryRowOut])
def list_inventory(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
    low_stock_only: bool = False,
):
    return inventory_service.list_inventory(db, low_stock_only)


@router.post("/adjust", response_model=ProductVariantOut)
def adjust_stock(
    payload: InventoryAdjustRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    return inventory_service.adjust_stock(db, current_admin, payload.variant_id, payload.change_quantity, payload.note)


@router.post("/adjust/bulk", response_model=list[ProductVariantOut])
def bulk_adjust_stock(
    payload: BulkInventoryAdjustRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    return inventory_service.bulk_adjust_stock(db, current_admin, payload.items, payload.note)


@router.get("/{variant_id}/history", response_model=list[InventoryTransactionOut])
def variant_history(
    variant_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    return inventory_service.get_variant_history(db, variant_id)
