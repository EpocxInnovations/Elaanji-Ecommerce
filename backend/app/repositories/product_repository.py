"""
Product repository encapsulating SQL queries, filtering, sorting, and pagination.
"""
from typing import Optional, Tuple, List
import uuid

from sqlalchemy import select, func, or_
from sqlalchemy.orm import Session, selectinload

from app.models.product import (
    Product,
    ProductVariant,
    ProductImage,
    ProductStatus,
    SareeType,
    Occasion,
)

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


class ProductRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, product_id: uuid.UUID) -> Optional[Product]:
        return self.db.execute(
            select(Product)
            .options(
                selectinload(Product.variants),
                selectinload(Product.images),
                selectinload(Product.category),
                selectinload(Product.brand),
            )
            .where(Product.id == product_id)
        ).scalar_one_or_none()

    def get_by_slug(self, slug: str, active_only: bool = True) -> Optional[Product]:
        query = (
            select(Product)
            .options(
                selectinload(Product.variants),
                selectinload(Product.images),
                selectinload(Product.category),
                selectinload(Product.brand),
            )
            .where(Product.slug == slug)
        )
        if active_only:
            query = query.where(Product.status == ProductStatus.active)
        return self.db.execute(query).scalar_one_or_none()

    def search_and_filter(
        self,
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
    ) -> Tuple[List[Product], int]:
        """Executes optimized SQL query with database-level COUNT and LIMIT/OFFSET."""
        base_query = select(Product).where(Product.status == ProductStatus.active)

        if search:
            like = f"%{search}%"
            base_query = base_query.where(or_(Product.name.ilike(like), Product.tags.ilike(like)))

        if category_slug:
            base_query = base_query.join(Product.category).where(Product.category.has(slug=category_slug))

        if saree_type:
            try:
                base_query = base_query.where(Product.saree_type == SareeType(saree_type))
            except ValueError:
                pass

        if occasion:
            try:
                base_query = base_query.where(Product.occasion == Occasion(occasion))
            except ValueError:
                pass

        if blouse_stitched is not None:
            base_query = base_query.where(Product.blouse_stitched.is_(blouse_stitched))

        if brand_slug:
            base_query = base_query.where(Product.brand.has(slug=brand_slug))

        if min_price is not None:
            base_query = base_query.where(func.coalesce(Product.discount_price, Product.price) >= min_price)
        if max_price is not None:
            base_query = base_query.where(func.coalesce(Product.discount_price, Product.price) <= max_price)

        if min_rating is not None:
            base_query = base_query.where(Product.average_rating >= min_rating)

        if colors:
            base_query = base_query.where(Product.variants.any(ProductVariant.color.in_(colors)))
        if in_stock_only:
            base_query = base_query.where(
                Product.variants.any(
                    (ProductVariant.stock_quantity - ProductVariant.reserved_quantity) > 0
                )
            )

        flag_map = {
            "new-arrivals": Product.is_new_arrival,
            "best-sellers": Product.is_best_seller,
            "sale": Product.is_on_sale,
            "trending": Product.is_trending,
            "featured": Product.is_featured,
        }
        if filter_flag in flag_map:
            base_query = base_query.where(flag_map[filter_flag].is_(True))

        # Total count query in SQL
        count_query = select(func.count()).select_from(base_query.subquery())
        total = self.db.execute(count_query).scalar() or 0

        # Paginated items query in SQL
        items_query = (
            base_query.options(
                selectinload(Product.images),
                selectinload(Product.variants),
                selectinload(Product.category),
                selectinload(Product.brand),
            )
        )
        sort_fn = SORT_OPTIONS.get(sort, SORT_OPTIONS["featured"])
        items_query = sort_fn(items_query).offset((page - 1) * page_size).limit(page_size)

        items = self.db.execute(items_query).scalars().unique().all()
        return items, total
