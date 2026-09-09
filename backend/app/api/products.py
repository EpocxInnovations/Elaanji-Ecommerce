import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.database import get_db
from app.models.product import Product, ProductStatus
from app.schemas.product import ProductCardOut, ProductDetailOut
from app.schemas.common import PaginatedResponse
from app.services.product_service import list_products_paginated, to_card_dict

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("", response_model=PaginatedResponse[ProductCardOut])
def list_products(
    db: Session = Depends(get_db),
    search: Optional[str] = None,
    category: Optional[str] = Query(default=None, description="category slug"),
    gender: Optional[str] = None,
    saree_type: Optional[str] = Query(default=None, description="kanjivaram | banarasi | tussar | bandhani | chanderi | ..."),
    occasion: Optional[str] = Query(default=None, description="wedding | festive | casual | party | office | puja | reception"),
    color: Optional[list[str]] = Query(default=None),
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    brand: Optional[str] = Query(default=None, description="brand slug"),
    min_rating: Optional[float] = None,
    in_stock_only: bool = False,
    blouse_stitched: Optional[bool] = None,
    filter: Optional[str] = Query(default=None, description="new-arrivals | best-sellers | sale | trending | featured"),
    sort: str = "featured",
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=24, ge=1, le=100),
):
    cards, total, total_pages = list_products_paginated(
        db,
        search=search,
        category_slug=category,
        saree_type=saree_type,
        occasion=occasion,
        colors=color,
        min_price=min_price,
        max_price=max_price,
        brand_slug=brand,
        min_rating=min_rating,
        in_stock_only=in_stock_only,
        blouse_stitched=blouse_stitched,
        filter_flag=filter,
        sort=sort,
        page=page,
        page_size=page_size,
    )

    return PaginatedResponse(
        items=cards,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/{slug}", response_model=ProductDetailOut)
def get_product_detail(slug: str, db: Session = Depends(get_db)):
    product = db.execute(
        select(Product)
        .options(
            selectinload(Product.variants),
            selectinload(Product.images),
            selectinload(Product.category),
            selectinload(Product.brand),
        )
        .where(Product.slug == slug, Product.status == ProductStatus.active)
    ).scalar_one_or_none()

    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    product.view_count += 1
    db.commit()
    db.refresh(product)

    return product


@router.get("/{slug}/related", response_model=list[ProductCardOut])
def get_related_products(slug: str, db: Session = Depends(get_db), limit: int = Query(default=8, le=20)):
    product = db.execute(select(Product).where(Product.slug == slug)).scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    related = db.execute(
        select(Product)
        .options(selectinload(Product.images), selectinload(Product.variants), selectinload(Product.category), selectinload(Product.brand))
        .where(
            Product.category_id == product.category_id,
            Product.id != product.id,
            Product.status == ProductStatus.active,
        )
        .limit(limit)
    ).scalars().unique().all()

    return [to_card_dict(p) for p in related]
