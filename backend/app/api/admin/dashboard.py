"""
Placeholder for /api/admin/dashboard — full KPI/chart implementation lands in
Phase 4. For now this proves the admin-only route protection works end to end.
"""
from fastapi import APIRouter, Depends

from app.middleware.auth import require_admin
from app.models.user import User

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/ping")
def admin_ping(current_admin: User = Depends(require_admin)):
    return {"message": f"Authenticated as admin: {current_admin.email}"}
