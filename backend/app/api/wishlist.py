import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.wishlist import WishlistItemAddRequest, WishlistOut
from app.services import wishlist_service

router = APIRouter(prefix="/api/wishlist", tags=["wishlist"])


@router.get("", response_model=WishlistOut)
def get_wishlist(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    wishlist = wishlist_service.get_or_create_wishlist(db, current_user)
    return wishlist_service.build_out(wishlist)


@router.post("/items", response_model=WishlistOut)
def add_wishlist_item(
    payload: WishlistItemAddRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    wishlist = wishlist_service.add_item(db, current_user, payload.product_id)
    return wishlist_service.build_out(wishlist)


@router.delete("/items/{item_id}", response_model=WishlistOut)
def remove_wishlist_item(
    item_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    wishlist = wishlist_service.remove_item(db, current_user, item_id)
    return wishlist_service.build_out(wishlist)
