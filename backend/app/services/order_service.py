"""
Every number on an order is recomputed here from the database — subtotal,
discount, tax, shipping, total. The frontend can display a preview, but this
module is the only source of truth once an order is actually placed.
"""
import random
import string
import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.config import settings
from app.models.cart import Cart, CartItem
from app.models.coupon import CouponUsage
from app.models.inventory import InventoryTransaction, InventoryTransactionType
from app.models.order import Order, OrderItem, OrderStatus, OrderStatusHistory, DeliveryMethod
from app.models.payment import Payment, PaymentMethod, PaymentStatus, Refund, RefundStatus
from app.models.product import ProductVariant, Product
from app.models.user import User, Address
from app.services import cart_service, coupon_service
from app.services.admin_settings_service import get_all_settings

EXPRESS_SHIPPING_FEE_FALLBACK = 149
CANCELLABLE_STATUSES = {OrderStatus.pending, OrderStatus.confirmed, OrderStatus.processing, OrderStatus.packed}
RETURNABLE_STATUSES = {OrderStatus.delivered}


def _generate_order_number() -> str:
    suffix = "".join(random.choices(string.digits, k=6))
    return f"ELJ{suffix}"


def write_status_history(db: Session, order: Order, status_value: OrderStatus, note: str | None = None):
    db.add(OrderStatusHistory(order_id=order.id, status=status_value, note=note))


def create_order(db: Session, user: User, address_id: uuid.UUID, delivery_method: DeliveryMethod, payment_method: PaymentMethod, coupon_code: str | None) -> Order:
    address = db.get(Address, address_id)
    if address is None or address.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")

    cart = cart_service.get_or_create_cart(db, user)
    active_items = [i for i in cart.items if not i.saved_for_later]
    if not active_items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Your cart is empty")

    # Re-validate stock and re-price every line from the database right now —
    # never trust anything the client sent about price or availability.
    subtotal = 0.0
    tax_amount = 0.0
    line_plans = []
    for item in active_items:
        variant = db.get(ProductVariant, item.variant_id)
        if variant is None or not variant.is_active:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"An item in your cart is no longer available")
        if item.quantity > variant.available_quantity:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Only {variant.available_quantity} left in stock for one of your items",
            )
        product = variant.product
        unit_price = float(variant.price_override) if variant.price_override else float(product.discount_price or product.price)
        line_total = unit_price * item.quantity
        line_tax = line_total * (float(product.tax_percent) / 100)
        subtotal += line_total
        tax_amount += line_tax
        line_plans.append({"variant": variant, "product": product, "quantity": item.quantity, "unit_price": unit_price, "line_total": line_total})

    coupon_discount = 0.0
    resolved_coupon_code = None
    if coupon_code:
        result = coupon_service.validate_and_price(db, user, coupon_code, subtotal)
        if not result["valid"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])
        coupon_discount = result["discount_amount"]
        resolved_coupon_code = result["code"]

    discounted_subtotal = max(subtotal - coupon_discount, 0)

    # Shipping fees and the free-shipping threshold are admin-configurable
    # (Settings > Shipping); fall back to the .env defaults if never saved.
    shipping_settings = get_all_settings(db)["shipping"]
    shipping_fee = 0.0
    if delivery_method == DeliveryMethod.express:
        shipping_fee = shipping_settings.express_shipping_fee
    elif discounted_subtotal < shipping_settings.free_shipping_threshold:
        shipping_fee = shipping_settings.default_shipping_fee

    total_amount = round(discounted_subtotal + shipping_fee + tax_amount, 2)

    order = Order(
        order_number=_generate_order_number(),
        user_id=user.id,
        shipping_name=address.full_name,
        shipping_phone=address.phone,
        shipping_address_line=address.address_line,
        shipping_apartment=address.apartment,
        shipping_city=address.city,
        shipping_state=address.state,
        shipping_pin_code=address.pin_code,
        shipping_country=address.country,
        delivery_method=delivery_method,
        subtotal=round(subtotal, 2),
        discount_amount=0,
        coupon_discount_amount=coupon_discount,
        coupon_code=resolved_coupon_code,
        shipping_fee=shipping_fee,
        tax_amount=round(tax_amount, 2),
        total_amount=total_amount,
        status=OrderStatus.confirmed if payment_method == PaymentMethod.cod else OrderStatus.pending,
    )
    db.add(order)
    db.flush()

    for plan in line_plans:
        variant = plan["variant"]
        product = plan["product"]
        primary_image = next((i for i in sorted(product.images, key=lambda x: x.display_order)), None)

        db.add(
            OrderItem(
                order_id=order.id,
                variant_id=variant.id,
                product_name=product.name,
                product_image_url=primary_image.image_url if primary_image else None,
                sku=variant.sku,
                size=variant.blouse_size,
                color=variant.color,
                unit_price=plan["unit_price"],
                quantity=plan["quantity"],
                line_total=round(plan["line_total"], 2),
            )
        )

        variant.reserved_quantity += plan["quantity"]
        db.add(
            InventoryTransaction(
                variant_id=variant.id,
                change_quantity=-plan["quantity"],
                resulting_stock=variant.stock_quantity - variant.reserved_quantity,
                transaction_type=InventoryTransactionType.order_reserved,
                reference_order_id=order.id,
                note=f"Reserved for order {order.order_number}",
            )
        )

    payment_status = PaymentStatus.successful if payment_method == PaymentMethod.cod else PaymentStatus.pending
    db.add(Payment(order_id=order.id, method=payment_method, status=payment_status, amount=total_amount))

    if resolved_coupon_code:
        from app.models.coupon import Coupon
        coupon_row = db.execute(select(Coupon).where(Coupon.code == resolved_coupon_code)).scalar_one()
        db.add(CouponUsage(coupon_id=coupon_row.id, user_id=user.id, order_id=order.id))

    write_status_history(db, order, order.status, note="Order placed")

    # Clear purchased items from the cart (leave saved-for-later items alone)
    for item in active_items:
        db.delete(item)

    db.commit()
    db.refresh(order)
    return get_order_detail(db, user, order.id)


def get_order_detail(db: Session, user: User, order_id: uuid.UUID) -> Order:
    order = db.execute(
        select(Order)
        .options(
            selectinload(Order.items),
            selectinload(Order.status_history),
            selectinload(Order.payment),
        )
        .where(Order.id == order_id)
    ).scalar_one_or_none()

    if order is None or order.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order


def list_orders(db: Session, user: User) -> list[Order]:
    return db.execute(
        select(Order).where(Order.user_id == user.id).order_by(Order.created_at.desc())
    ).scalars().all()


def cancel_order(db: Session, user: User, order_id: uuid.UUID) -> Order:
    order = get_order_detail(db, user, order_id)
    if order.status not in CANCELLABLE_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Orders in '{order.status.value}' status can no longer be cancelled",
        )

    for item in order.items:
        variant = db.get(ProductVariant, item.variant_id)
        if variant is not None:
            variant.reserved_quantity = max(variant.reserved_quantity - item.quantity, 0)
            db.add(
                InventoryTransaction(
                    variant_id=variant.id,
                    change_quantity=item.quantity,
                    resulting_stock=variant.stock_quantity - variant.reserved_quantity,
                    transaction_type=InventoryTransactionType.order_cancelled_restock,
                    reference_order_id=order.id,
                    note=f"Restocked from cancelled order {order.order_number}",
                )
            )

    order.status = OrderStatus.cancelled
    write_status_history(db, order, OrderStatus.cancelled, note="Cancelled by customer")
    db.commit()
    return get_order_detail(db, user, order_id)


def request_return(db: Session, user: User, order_id: uuid.UUID, reason: str) -> Order:
    order = get_order_detail(db, user, order_id)
    if order.status not in RETURNABLE_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only delivered orders can be returned",
        )

    order.status = OrderStatus.return_requested
    write_status_history(db, order, OrderStatus.return_requested, note=reason)
    db.add(
        Refund(
            order_id=order.id,
            payment_id=order.payment.id if order.payment else None,
            reason=reason,
            refund_amount=order.total_amount,
            status=RefundStatus.requested,
        )
    )
    db.commit()
    return get_order_detail(db, user, order_id)
