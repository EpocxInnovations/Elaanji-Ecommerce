"""
StoreSetting is a single key/value table (one JSON blob per settings group,
e.g. key='store_info'). Reading falls back to schema defaults when a key
hasn't been saved yet, so the store works out of the box with no seed data.
"""
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.content import StoreSetting
from app.models.user import User
from app.services.activity_log_service import log_action
from app.schemas.admin_settings import (
    StoreInfoSettings,
    ShippingSettings,
    TaxSettings,
    PaymentSettings,
    NotificationSettings,
)

SETTINGS_SCHEMA_MAP = {
    "store_info": StoreInfoSettings,
    "shipping": ShippingSettings,
    "tax": TaxSettings,
    "payment": PaymentSettings,
    "notifications": NotificationSettings,
}


def _get_group(db: Session, key: str):
    schema_cls = SETTINGS_SCHEMA_MAP[key]
    row = db.execute(select(StoreSetting).where(StoreSetting.key == key)).scalar_one_or_none()
    if row is None or row.value_json is None:
        return schema_cls()
    return schema_cls(**row.value_json)


def get_all_settings(db: Session) -> dict:
    return {key: _get_group(db, key) for key in SETTINGS_SCHEMA_MAP}


def update_settings_group(db: Session, admin: User, key: str, payload) -> dict:
    row = db.execute(select(StoreSetting).where(StoreSetting.key == key)).scalar_one_or_none()
    if row is None:
        row = StoreSetting(key=key, value_json=payload.model_dump())
        db.add(row)
    else:
        row.value_json = payload.model_dump()

    log_action(db, admin, f"updated {key} settings", "store_setting", key)
    db.commit()
    return _get_group(db, key)
