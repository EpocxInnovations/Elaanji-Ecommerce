"""
The only place in the codebase that writes to ProductVariant.stock_quantity
directly. Every change goes through here so it's always paired with an
InventoryTransaction row — there is no other legitimate way to move stock.
"""
import math
import uuid

from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.orm import Session, selectinload

from app.models.inventory import InventoryTransaction, InventoryTransactionType
from app.models.product import ProductVariant, Product
from app.models.user import User
from app.services.activity_log_service import log_action


def list_inventory(db: Session, low_stock_only: bool = False, page: int = 1, page_size: int = 20):
    query = select(ProductVariant).options(selectinload(ProductVariant.product))
    count_query = select(func.count()).select_from(ProductVariant)

    if low_stock_only:
        low_stock_filter = (ProductVariant.stock_quantity - ProductVariant.reserved_quantity) <= ProductVariant.low_stock_threshold
        query = query.where(low_stock_filter)
        count_query = count_query.where(low_stock_filter)

    total = db.execute(count_query).scalar_one()
    rows = db.execute(query.order_by(ProductVariant.created_at.desc()).offset((page - 1) * page_size).limit(page_size)).scalars().all()

    items = [
        {
            "variant_id": v.id,
            "product_id": v.product_id,
            "product_name": v.product.name,
            "sku": v.sku,
            "color": v.color,
            "blouse_size": v.blouse_size,
            "stock_quantity": v.stock_quantity,
            "reserved_quantity": v.reserved_quantity,
            "available_quantity": v.available_quantity,
            "low_stock_threshold": v.low_stock_threshold,
            "is_low_stock": v.available_quantity <= v.low_stock_threshold,
        }
        for v in rows
    ]
    return {"items": items, "total": total, "page": page, "page_size": page_size, "total_pages": math.ceil(total / page_size) if page_size else 0}


def adjust_stock(db: Session, admin: User, variant_id: uuid.UUID, change_quantity: int, note: str | None) -> ProductVariant:
    variant = db.get(ProductVariant, variant_id)
    if variant is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Variant not found")

    new_stock = variant.stock_quantity + change_quantity
    if new_stock < 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Stock cannot go below zero")
    if new_stock < variant.reserved_quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot reduce stock below {variant.reserved_quantity} reserved units",
        )

    variant.stock_quantity = new_stock
    db.add(
        InventoryTransaction(
            variant_id=variant.id,
            change_quantity=change_quantity,
            resulting_stock=new_stock,
            transaction_type=InventoryTransactionType.stock_in if change_quantity > 0 else InventoryTransactionType.manual_adjustment,
            note=note,
            created_by_admin_id=admin.id,
        )
    )
    log_action(db, admin, f"adjusted stock by {change_quantity:+d}", "product_variant", str(variant.id), note)
    db.commit()
    db.refresh(variant)
    return variant


def bulk_adjust_stock(db: Session, admin: User, items, note: str | None):
    results = []
    for item in items:
        results.append(adjust_stock(db, admin, item.variant_id, item.change_quantity, note))
    return results


def get_variant_history(db: Session, variant_id: uuid.UUID):
    variant = db.get(ProductVariant, variant_id)
    if variant is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Variant not found")
    return db.execute(
        select(InventoryTransaction)
        .where(InventoryTransaction.variant_id == variant_id)
        .order_by(InventoryTransaction.created_at.desc())
    ).scalars().all()
