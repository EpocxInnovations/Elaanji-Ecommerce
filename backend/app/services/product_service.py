"""
Product catalog service. Coordinates business rules and queries via ProductRepository.
"""
from typing import Optional, Tuple, List
from sqlalchemy.orm import Session

from app.models.product import Product
from app.repositories.product_repository import ProductRepository, SORT_OPTIONS


def build_product_query(db: Session, **kwargs):
    """Backward-compatible query builder wrapper."""
    repo = ProductRepository(db)
    items, _ = repo.search_and_filter(page=1, page_size=1000, **kwargs)
    return items


def list_products_paginated(
    db: Session,
    *,
    search: Optional[str] = None,
    category_slug: Optional[str] = None,
    saree_type: Optional[str] = None,
    occasion: Optional[str] = None,
    colors: Optional[list[str]] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    brand_slug: Optional[str] = None,
    min_rating: Optional[float] = None,
    in_stock_only: bool = False,
    blouse_stitched: Optional[bool] = None,
    filter_flag: Optional[str] = None,
    sort: str = "featured",
    page: int = 1,
    page_size: int = 24,
) -> Tuple[List[dict], int, int]:
    """Returns (card_dicts, total_count, total_pages) with SQL pagination."""
    repo = ProductRepository(db)
    products, total = repo.search_and_filter(
        search=search,
        category_slug=category_slug,
        saree_type=saree_type,
        occasion=occasion,
        colors=colors,
        min_price=min_price,
        max_price=max_price,
        brand_slug=brand_slug,
        min_rating=min_rating,
        in_stock_only=in_stock_only,
        blouse_stitched=blouse_stitched,
        filter_flag=filter_flag,
        sort=sort,
        page=page,
        page_size=page_size,
    )
    total_pages = max((total + page_size - 1) // page_size, 1)
    cards = [to_card_dict(p) for p in products]
    return cards, total, total_pages


def to_card_dict(product: Product) -> dict:
    primary_image = next((i for i in sorted(product.images, key=lambda x: x.display_order) if not i.is_hover_image), None)
    hover_image = next((i for i in product.images if i.is_hover_image), None)
    available = any(v.available_quantity > 0 and v.is_active for v in product.variants)

    return {
        "id": product.id,
        "name": product.name,
        "slug": product.slug,
        "price": float(product.price),
        "discount_price": float(product.discount_price) if product.discount_price else None,
        "category": product.category,
        "brand": product.brand,
        "saree_type": product.saree_type,
        "occasion": product.occasion,
        "average_rating": float(product.average_rating),
        "review_count": product.review_count,
        "is_new_arrival": product.is_new_arrival,
        "is_best_seller": product.is_best_seller,
        "is_featured": product.is_featured,
        "is_trending": product.is_trending,
        "is_on_sale": product.is_on_sale,
        "primary_image_url": primary_image.image_url if primary_image else (product.images[0].image_url if product.images else None),
        "hover_image_url": hover_image.image_url if hover_image else None,
        "status": product.status,
        "available": available,
    }
