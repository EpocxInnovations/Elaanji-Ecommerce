import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User, Address
from app.schemas.address import AddressCreateRequest, AddressUpdateRequest, AddressOut

router = APIRouter(prefix="/api/addresses", tags=["addresses"])


def _get_owned_address(db: Session, user: User, address_id: uuid.UUID) -> Address:
    address = db.get(Address, address_id)
    if address is None or address.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")
    return address


def _clear_other_defaults(db: Session, user: User, exclude_id: uuid.UUID | None = None):
    query = select(Address).where(Address.user_id == user.id, Address.is_default.is_(True))
    if exclude_id:
        query = query.where(Address.id != exclude_id)
    for addr in db.execute(query).scalars().all():
        addr.is_default = False


@router.get("", response_model=list[AddressOut])
def list_addresses(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.execute(
        select(Address).where(Address.user_id == current_user.id).order_by(Address.is_default.desc(), Address.created_at.desc())
    ).scalars().all()


@router.post("", response_model=AddressOut, status_code=status.HTTP_201_CREATED)
def create_address(
    payload: AddressCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    is_first_address = db.execute(
        select(Address).where(Address.user_id == current_user.id)
    ).first() is None

    address = Address(user_id=current_user.id, **payload.model_dump())
    if is_first_address:
        address.is_default = True

    if address.is_default:
        _clear_other_defaults(db, current_user)

    db.add(address)
    db.commit()
    db.refresh(address)
    return address


@router.put("/{address_id}", response_model=AddressOut)
def update_address(
    address_id: uuid.UUID,
    payload: AddressUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    address = _get_owned_address(db, current_user, address_id)
    for field, value in payload.model_dump().items():
        setattr(address, field, value)

    if address.is_default:
        _clear_other_defaults(db, current_user, exclude_id=address.id)

    db.commit()
    db.refresh(address)
    return address


@router.delete("/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_address(
    address_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    address = _get_owned_address(db, current_user, address_id)
    db.delete(address)
    db.commit()
    return None
