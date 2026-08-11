"""
/api/cart — all routes require a logged-in user. Guest carts aren't in scope
for Phase 2; the frontend prompts login before adding to cart.
"""
import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.cart import CartItemAddRequest, CartItemUpdateRequest, CartSummaryOut
from app.services import cart_service

router = APIRouter(prefix="/api/cart", tags=["cart"])


@router.get("", response_model=CartSummaryOut)
def get_cart(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cart = cart_service.get_or_create_cart(db, current_user)
    return cart_service.build_summary(cart, db)


@router.post("/items", response_model=CartSummaryOut)
def add_cart_item(
    payload: CartItemAddRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cart = cart_service.add_item(db, current_user, payload.variant_id, payload.quantity)
    return cart_service.build_summary(cart, db)


@router.patch("/items/{item_id}", response_model=CartSummaryOut)
def update_cart_item(
    item_id: uuid.UUID,
    payload: CartItemUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cart = cart_service.update_item(db, current_user, item_id, payload.quantity, payload.saved_for_later)
    return cart_service.build_summary(cart, db)


@router.delete("/items/{item_id}", response_model=CartSummaryOut)
def remove_cart_item(
    item_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cart = cart_service.remove_item(db, current_user, item_id)
    return cart_service.build_summary(cart, db)
