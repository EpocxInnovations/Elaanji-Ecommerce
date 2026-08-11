import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.product import Product
from app.models.wishlist import Wishlist, WishlistItem
from app.models.user import User
from app.services.product_service import to_card_dict


def get_or_create_wishlist(db: Session, user: User) -> Wishlist:
    wishlist = db.execute(
        select(Wishlist)
        .options(
            selectinload(Wishlist.items)
            .selectinload(WishlistItem.product)
            .selectinload(Product.images),
            selectinload(Wishlist.items)
            .selectinload(WishlistItem.product)
            .selectinload(Product.variants),
            selectinload(Wishlist.items)
            .selectinload(WishlistItem.product)
            .selectinload(Product.category),
            selectinload(Wishlist.items)
            .selectinload(WishlistItem.product)
            .selectinload(Product.brand),
        )
        .where(Wishlist.user_id == user.id)
    ).scalar_one_or_none()

    if wishlist is None:
        wishlist = Wishlist(user_id=user.id)
        db.add(wishlist)
        db.commit()
        db.refresh(wishlist)
        wishlist.items = []

    return wishlist


def add_item(db: Session, user: User, product_id: uuid.UUID) -> Wishlist:
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    wishlist = get_or_create_wishlist(db, user)
    already_saved = any(i.product_id == product_id for i in wishlist.items)
    if not already_saved:
        db.add(WishlistItem(wishlist_id=wishlist.id, product_id=product_id))
        db.commit()

    return get_or_create_wishlist(db, user)


def remove_item(db: Session, user: User, item_id: uuid.UUID) -> Wishlist:
    wishlist = get_or_create_wishlist(db, user)
    item = next((i for i in wishlist.items if i.id == item_id), None)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wishlist item not found")

    db.delete(item)
    db.commit()
    return get_or_create_wishlist(db, user)


def build_out(wishlist: Wishlist) -> dict:
    return {
        "items": [
            {"id": item.id, "product": to_card_dict(item.product)}
            for item in wishlist.items
        ]
    }
