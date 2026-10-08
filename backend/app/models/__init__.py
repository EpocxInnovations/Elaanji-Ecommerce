"""
Import every model here so Alembic's autogenerate and Base.metadata.create_all
can discover them via a single `from app.models import *`.
"""
from app.models.user import User, Address
from app.models.product import (
    Category,
    Brand,
    Product,
    ProductVariant,
    ProductImage,
)
from app.models.inventory import InventoryTransaction
from app.models.cart import Cart, CartItem
from app.models.wishlist import Wishlist, WishlistItem
from app.models.order import Order, OrderItem, OrderStatusHistory
from app.models.payment import Payment, Refund
from app.models.coupon import Coupon, CouponUsage
from app.models.review import Review
from app.models.content import Banner, HomepageSection, Notification, StoreSetting
from app.models.activity_log import AdminActivityLog
from app.models.password_reset_otp import PasswordResetOTP
from app.models.chat import KnowledgeChunk, ChatSession, ChatMessage

__all__ = [
    "User",
    "Address",
    "PasswordResetOTP",

    "Category",
    "Brand",
    "Product",
    "ProductVariant",
    "ProductImage",
    "InventoryTransaction",
    "Cart",
    "CartItem",
    "Wishlist",
    "WishlistItem",
    "Order",
    "OrderItem",
    "OrderStatusHistory",
    "Payment",
    "Refund",
    "Coupon",
    "CouponUsage",
    "Review",
    "Banner",
    "HomepageSection",
    "Notification",
    "StoreSetting",
    "AdminActivityLog",
    "KnowledgeChunk",
    "ChatSession",
    "ChatMessage",
]

