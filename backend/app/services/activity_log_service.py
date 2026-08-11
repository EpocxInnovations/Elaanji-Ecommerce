"""
Every mutating admin action writes one row here. Called from services, not
routers, so logging can't be skipped by forgetting a line in a router.
"""
from sqlalchemy.orm import Session

from app.models.activity_log import AdminActivityLog
from app.models.user import User


def log_action(db: Session, admin: User, action: str, entity_type: str, entity_id: str | None = None, details: str | None = None):
    db.add(
        AdminActivityLog(
            admin_id=admin.id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            details=details,
        )
    )
