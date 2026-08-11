"""
Admin catalog mutations. Every function here takes the acting admin and
writes an activity log entry — nothing mutates the catalog silently.
"""
import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.product import Product, ProductVariant, ProductImage, Category, ProductStatus
from app.models.inventory import InventoryTransaction, InventoryTransactionType
from app.models.user import User
from app.services.activity_log_service import log_action


def _load_product(db: Session, product_id: uuid.UUID) -> Product:
    product = db.execute(
        select(Product)
        .options(selectinload(Product.variants), selectinload(Product.images), selectinload(Product.category), selectinload(Product.brand))
        .where(Product.id == product_id)
    ).scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


def get_product_admin(db: Session, product_id: uuid.UUID) -> Product:
    return _load_product(db, product_id)


def list_products_admin(db: Session, search: str | None, status_filter: ProductStatus | None, category_id: uuid.UUID | None):
    query = select(Product).options(
        selectinload(Product.variants), selectinload(Product.images), selectinload(Product.category), selectinload(Product.brand)
    )
    if search:
        query = query.where(Product.name.ilike(f"%{search}%"))
    if status_filter:
        query = query.where(Product.status == status_filter)
    if category_id:
        query = query.where(Product.category_id == category_id)
    query = query.order_by(Product.created_at.desc())
    return db.execute(query).scalars().unique().all()


def create_product(db: Session, admin: User, payload) -> Product:
    existing_slug = db.execute(select(Product).where(Product.slug == payload.slug)).scalar_one_or_none()
    if existing_slug:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A product with this slug already exists")
    existing_sku = db.execute(select(Product).where(Product.sku == payload.sku)).scalar_one_or_none()
    if existing_sku:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A product with this SKU already exists")

    data = payload.model_dump(exclude={"variants"})
    product = Product(**data)
    db.add(product)
    db.flush()

    for v in payload.variants:
        _upsert_variant(db, product.id, v)

    log_action(db, admin, "created product", "product", str(product.id), product.name)
    db.commit()
    return _load_product(db, product.id)


def update_product(db: Session, admin: User, product_id: uuid.UUID, payload) -> Product:
    product = _load_product(db, product_id)

    if payload.slug != product.slug:
        clash = db.execute(select(Product).where(Product.slug == payload.slug, Product.id != product_id)).scalar_one_or_none()
        if clash:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A product with this slug already exists")

    data = payload.model_dump(exclude={"variants"})
    for field, value in data.items():
        setattr(product, field, value)

    submitted_ids = {v.id for v in payload.variants if v.id}
    for existing in list(product.variants):
        if existing.id not in submitted_ids:
            db.delete(existing)

    for v in payload.variants:
        _upsert_variant(db, product.id, v)

    log_action(db, admin, "updated product", "product", str(product.id), product.name)
    db.commit()
    return _load_product(db, product_id)


def _upsert_variant(db: Session, product_id: uuid.UUID, v) -> ProductVariant:
    if v.id:
        variant = db.get(ProductVariant, v.id)
        if variant is None or variant.product_id != product_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Variant not found on this product")
        variant.sku = v.sku
        variant.color = v.color
        variant.color_hex = v.color_hex
        variant.blouse_size = v.blouse_size
        variant.price_override = v.price_override
        variant.low_stock_threshold = v.low_stock_threshold
        variant.is_active = v.is_active
        # stock_quantity is intentionally NOT settable here — use the
        # inventory adjust endpoint so every stock change is audited.
        return variant

    existing_sku = db.execute(select(ProductVariant).where(ProductVariant.sku == v.sku)).scalar_one_or_none()
    if existing_sku:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"SKU '{v.sku}' is already in use")

    variant = ProductVariant(
        product_id=product_id,
        sku=v.sku,
        color=v.color,
        color_hex=v.color_hex,
        blouse_size=v.blouse_size,
        price_override=v.price_override,
        stock_quantity=v.stock_quantity,
        low_stock_threshold=v.low_stock_threshold,
        is_active=v.is_active,
    )
    db.add(variant)
    db.flush()

    if v.stock_quantity > 0:
        db.add(
            InventoryTransaction(
                variant_id=variant.id,
                change_quantity=v.stock_quantity,
                resulting_stock=v.stock_quantity,
                transaction_type=InventoryTransactionType.stock_in,
                note="Initial stock on product creation",
            )
        )
    return variant


def set_product_status(db: Session, admin: User, product_id: uuid.UUID, new_status: ProductStatus) -> Product:
    product = _load_product(db, product_id)
    product.status = new_status
    log_action(db, admin, f"set product status to {new_status.value}", "product", str(product.id), product.name)
    db.commit()
    return _load_product(db, product_id)


def duplicate_product(db: Session, admin: User, product_id: uuid.UUID) -> Product:
    original = _load_product(db, product_id)

    copy_number = 1
    while True:
        new_slug = f"{original.slug}-copy{'' if copy_number == 1 else f'-{copy_number}'}"
        if not db.execute(select(Product).where(Product.slug == new_slug)).scalar_one_or_none():
            break
        copy_number += 1

    new_sku = f"{original.sku}-COPY-{uuid.uuid4().hex[:6].upper()}"

    duplicate = Product(
        name=f"{original.name} (Copy)",
        slug=new_slug,
        sku=new_sku,
        description=original.description,
        category_id=original.category_id,
        brand_id=original.brand_id,
        gender=original.gender,
        saree_type=original.saree_type,
        occasion=original.occasion,
        border_type=original.border_type,
        pallu_style=original.pallu_style,
        work_type=original.work_type,
        fabric=original.fabric,
        material=original.material,
        fit=original.fit,
        care_instructions=original.care_instructions,
        saree_length_meters=original.saree_length_meters,
        blouse_piece_included=original.blouse_piece_included,
        blouse_stitched=original.blouse_stitched,
        price=original.price,
        discount_price=original.discount_price,
        tax_percent=original.tax_percent,
        status=ProductStatus.draft,
        tags=original.tags,
    )
    db.add(duplicate)
    db.flush()

    for v in original.variants:
        db.add(
            ProductVariant(
                product_id=duplicate.id,
                sku=f"{v.sku}-COPY-{uuid.uuid4().hex[:6].upper()}",
                color=v.color,
                color_hex=v.color_hex,
                blouse_size=v.blouse_size,
                price_override=v.price_override,
                stock_quantity=0,
                low_stock_threshold=v.low_stock_threshold,
                is_active=v.is_active,
            )
        )

    for img in original.images:
        db.add(
            ProductImage(
                product_id=duplicate.id,
                image_url=img.image_url,
                is_hover_image=img.is_hover_image,
                display_order=img.display_order,
                color=img.color,
            )
        )

    log_action(db, admin, "duplicated product", "product", str(duplicate.id), f"from {original.name}")
    db.commit()
    return _load_product(db, duplicate.id)


def delete_product_image(db: Session, admin: User, product_id: uuid.UUID, image_id: uuid.UUID):
    image = db.get(ProductImage, image_id)
    if image is None or image.product_id != product_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")
    db.delete(image)
    log_action(db, admin, "deleted product image", "product", str(product_id))
    db.commit()


def add_product_image(db: Session, admin: User, product_id: uuid.UUID, image_url: str, color: str | None, is_hover_image: bool) -> ProductImage:
    product = _load_product(db, product_id)
    max_order = max((i.display_order for i in product.images), default=-1)
    image = ProductImage(
        product_id=product_id, image_url=image_url, color=color, is_hover_image=is_hover_image, display_order=max_order + 1
    )
    db.add(image)
    log_action(db, admin, "added product image", "product", str(product_id))
    db.commit()
    db.refresh(image)
    return image


def reorder_images(db: Session, admin: User, product_id: uuid.UUID, items) -> Product:
    product = _load_product(db, product_id)
    by_id = {img.id: img for img in product.images}
    for item in items:
        img = by_id.get(item.id)
        if img is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found on this product")
        img.display_order = item.display_order
        img.is_hover_image = item.is_hover_image
    log_action(db, admin, "reordered product images", "product", str(product_id))
    db.commit()
    return _load_product(db, product_id)


# --- Categories -----------------------------------------------------------

def list_categories_admin(db: Session):
    return db.execute(select(Category).order_by(Category.display_order)).scalars().all()


def create_category(db: Session, admin: User, payload) -> Category:
    existing = db.execute(select(Category).where(Category.slug == payload.slug)).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A category with this slug already exists")
    category = Category(**payload.model_dump())
    db.add(category)
    log_action(db, admin, "created category", "category", None, payload.name)
    db.commit()
    db.refresh(category)
    return category


def update_category(db: Session, admin: User, category_id: uuid.UUID, payload) -> Category:
    category = db.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    if payload.slug != category.slug:
        clash = db.execute(select(Category).where(Category.slug == payload.slug, Category.id != category_id)).scalar_one_or_none()
        if clash:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A category with this slug already exists")

    for field, value in payload.model_dump().items():
        setattr(category, field, value)

    log_action(db, admin, "updated category", "category", str(category_id), category.name)
    db.commit()
    db.refresh(category)
    return category


def delete_category(db: Session, admin: User, category_id: uuid.UUID):
    category = db.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    in_use = db.execute(select(Product).where(Product.category_id == category_id)).first()
    if in_use:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete a category that has products assigned to it")

    log_action(db, admin, "deleted category", "category", str(category_id), category.name)
    db.delete(category)
    db.commit()


def reorder_categories(db: Session, admin: User, items):
    for item in items:
        category = db.get(Category, item.id)
        if category is not None:
            category.display_order = item.display_order
    log_action(db, admin, "reordered categories", "category")
    db.commit()
    return list_categories_admin(db)
