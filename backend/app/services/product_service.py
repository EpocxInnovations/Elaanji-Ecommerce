"""
Catalog query logic lives here rather than in the router, so the same
filtering/sorting rules can be reused by (future) admin product search
without duplicating the SQLAlchemy query construction.
"""
import uuid
from typing import Optional

from sqlalchemy import select, func, or_
from sqlalchemy.orm import Session, selectinload

from app.models.product import Product, ProductVariant, ProductImage, ProductStatus, SareeType, Occasion


SORT_OPTIONS = {
    "featured": lambda q: q.order_by(Product.is_featured.desc(), Product.created_at.desc()),
    "newest": lambda q: q.order_by(Product.created_at.desc()),
    "price_low_high": lambda q: q.order_by(
        func.coalesce(Product.discount_price, Product.price).asc()
    ),
    "price_high_low": lambda q: q.order_by(
        func.coalesce(Product.discount_price, Product.price).desc()
    ),
    "best_selling": lambda q: q.order_by(Product.is_best_seller.desc(), Product.review_count.desc()),
    "highest_rated": lambda q: q.order_by(Product.average_rating.desc()),
}


def build_product_query(
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
    filter_flag: Optional[str] = None,  # new-arrivals | best-sellers | sale | trending | featured
    sort: str = "featured",
):
    query = (
        select(Product)
        .options(selectinload(Product.images), selectinload(Product.variants), selectinload(Product.category), selectinload(Product.brand))
        .where(Product.status == ProductStatus.active)
    )

    if search:
        like = f"%{search}%"
        query = query.where(or_(Product.name.ilike(like), Product.tags.ilike(like)))

    if category_slug:
        query = query.join(Product.category).where(
            Product.category.has(slug=category_slug)
        )

    if saree_type:
        try:
            query = query.where(Product.saree_type == SareeType(saree_type))
        except ValueError:
            pass  # invalid saree_type value — ignore rather than 500

    if occasion:
        try:
            query = query.where(Product.occasion == Occasion(occasion))
        except ValueError:
            pass

    if blouse_stitched is not None:
        query = query.where(Product.blouse_stitched.is_(blouse_stitched))

    if brand_slug:
        query = query.where(Product.brand.has(slug=brand_slug))

    if min_price is not None:
        query = query.where(func.coalesce(Product.discount_price, Product.price) >= min_price)
    if max_price is not None:
        query = query.where(func.coalesce(Product.discount_price, Product.price) <= max_price)

    if min_rating is not None:
        query = query.where(Product.average_rating >= min_rating)

    if colors:
        query = query.where(Product.variants.any(ProductVariant.color.in_(colors)))
    if in_stock_only:
        query = query.where(Product.variants.any(ProductVariant.stock_quantity > 0))

    flag_map = {
        "new-arrivals": Product.is_new_arrival,
        "best-sellers": Product.is_best_seller,
        "sale": Product.is_on_sale,
        "trending": Product.is_trending,
        "featured": Product.is_featured,
    }
    if filter_flag in flag_map:
        query = query.where(flag_map[filter_flag].is_(True))

    sort_fn = SORT_OPTIONS.get(sort, SORT_OPTIONS["featured"])
    query = sort_fn(query)

    return query


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
