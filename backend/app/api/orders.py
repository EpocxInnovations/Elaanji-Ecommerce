import uuid

from fastapi import APIRouter, Depends, status, Request
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.rate_limit import limiter
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.order import OrderCreateRequest, OrderOut, OrderSummaryOut
from app.services import order_service

router = APIRouter(prefix="/api/orders", tags=["orders"])


class ReturnRequest(BaseModel):
    reason: str = Field(min_length=3, max_length=500)


@router.get("", response_model=list[OrderSummaryOut])
def list_my_orders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    orders = order_service.list_orders(db, current_user)
    return [
        {
            "id": o.id,
            "order_number": o.order_number,
            "status": o.status,
            "total_amount": float(o.total_amount),
            "item_count": sum(i.quantity for i in o.items),
            "created_at": o.created_at,
        }
        for o in orders
    ]


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
def place_order(
    request: Request,
    payload: OrderCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return order_service.create_order(
        db,
        current_user,
        payload.address_id,
        payload.delivery_method,
        payload.payment_method,
        payload.coupon_code,
    )


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return order_service.get_order_detail(db, current_user, order_id)


@router.post("/{order_id}/cancel", response_model=OrderOut)
def cancel_order(order_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return order_service.cancel_order(db, current_user, order_id)


@router.post("/{order_id}/return", response_model=OrderOut)
def request_return(
    order_id: uuid.UUID,
    payload: ReturnRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return order_service.request_return(db, current_user, order_id, payload.reason)
