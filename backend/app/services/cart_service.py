"""
Cart business logic. Stock is only ever validated here (against
ProductVariant.available_quantity) — the router never touches stock math,
and prices are always read fresh from the variant/product at request time
rather than trusted from anything the client sent.
"""
import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.config import settings
from app.models.cart import Cart, CartItem
from app.models.product import ProductVariant, Product, ProductImage
from app.models.user import User
from app.services.admin_settings_service import get_all_settings


def get_or_create_cart(db: Session, user: User) -> Cart:
    cart = db.execute(
        select(Cart)
        .options(
            selectinload(Cart.items)
            .selectinload(CartItem.variant)
            .selectinload(ProductVariant.product)
            .selectinload(Product.images)
        )
        .where(Cart.user_id == user.id)
    ).scalar_one_or_none()

    if cart is None:
        cart = Cart(user_id=user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
        cart.items = []  # freshly created, nothing to load

    return cart


def _unit_price(variant: ProductVariant) -> float:
    if variant.price_override is not None:
        return float(variant.price_override)
    product = variant.product
    return float(product.discount_price) if product.discount_price else float(product.price)


def add_item(db: Session, user: User, variant_id: uuid.UUID, quantity: int) -> Cart:
    variant = db.execute(
        select(ProductVariant)
        .options(selectinload(ProductVariant.product))
        .where(ProductVariant.id == variant_id)
    ).scalar_one_or_none()

    if variant is None or not variant.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="This item is not available")

    cart = get_or_create_cart(db, user)

    existing = next((i for i in cart.items if i.variant_id == variant_id and not i.saved_for_later), None)
    requested_total = quantity + (existing.quantity if existing else 0)

    if requested_total > variant.available_quantity:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Only {variant.available_quantity} left in stock for this option",
        )

    if existing:
        existing.quantity = requested_total
    else:
        db.add(CartItem(cart_id=cart.id, variant_id=variant_id, quantity=quantity))

    db.commit()
    return get_or_create_cart(db, user)


def update_item(db: Session, user: User, item_id: uuid.UUID, quantity: int | None, saved_for_later: bool | None) -> Cart:
    cart = get_or_create_cart(db, user)
    item = next((i for i in cart.items if i.id == item_id), None)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")

    if quantity is not None:
        if quantity > item.variant.available_quantity:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Only {item.variant.available_quantity} left in stock for this option",
            )
        item.quantity = quantity

    if saved_for_later is not None:
        item.saved_for_later = saved_for_later

    db.commit()
    return get_or_create_cart(db, user)


def remove_item(db: Session, user: User, item_id: uuid.UUID) -> Cart:
    cart = get_or_create_cart(db, user)
    item = next((i for i in cart.items if i.id == item_id), None)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")

    db.delete(item)
    db.commit()
    return get_or_create_cart(db, user)


def build_summary(cart: Cart, db: Session | None = None) -> dict:
    active_items = [i for i in cart.items if not i.saved_for_later]

    item_dicts = []
    subtotal = 0.0
    for item in cart.items:
        variant = item.variant
        product = variant.product
        unit_price = _unit_price(variant)
        line_total = unit_price * item.quantity
        if not item.saved_for_later:
            subtotal += line_total

        variant_image = next(
            (
                img for img in sorted(product.images, key=lambda x: x.display_order)
                if (img.variant_id == variant.id)
                or (img.color and variant.color and img.color.strip().lower() == variant.color.strip().lower())
            ),
            None,
        )
        primary_image = variant_image or (
            next(iter(sorted(product.images, key=lambda x: x.display_order)), None) if product.images else None
        )

        item_dicts.append(
            {
                "id": item.id,
                "variant": variant,
                "quantity": item.quantity,
                "saved_for_later": item.saved_for_later,
                "unit_price": unit_price,
                "line_total": line_total,
                "product_name": product.name,
                "product_slug": product.slug,
                "product_image_url": primary_image.image_url if primary_image else None,
            }
        )

    threshold = get_all_settings(db)["shipping"].free_shipping_threshold if db is not None else settings.free_shipping_threshold
    remaining = max(threshold - subtotal, 0)

    return {
        "items": item_dicts,
        "subtotal": subtotal,
        "item_count": sum(i.quantity for i in active_items),
        "free_shipping_threshold": threshold,
        "amount_remaining_for_free_shipping": remaining,
    }
