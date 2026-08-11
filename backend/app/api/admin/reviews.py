import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.middleware.auth import require_admin
from app.models.review import ReviewStatus
from app.models.user import User
from app.schemas.admin_review import AdminReviewOut, ReviewStatusUpdateRequest, ReviewRespondRequest
from app.services import admin_review_service

router = APIRouter(prefix="/api/admin/reviews", tags=["admin-reviews"])


@router.get("", response_model=list[AdminReviewOut])
def list_reviews(db: Session = Depends(get_db), current_admin: User = Depends(require_admin), status: ReviewStatus | None = None):
    return admin_review_service.list_reviews(db, status)


@router.patch("/{review_id}/status", response_model=AdminReviewOut)
def set_status(review_id: uuid.UUID, payload: ReviewStatusUpdateRequest, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    return admin_review_service.set_review_status(db, current_admin, review_id, payload.status)


@router.post("/{review_id}/respond", response_model=AdminReviewOut)
def respond(review_id: uuid.UUID, payload: ReviewRespondRequest, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    return admin_review_service.respond_to_review(db, current_admin, review_id, payload.admin_response)


@router.delete("/{review_id}", status_code=204)
def delete_review(review_id: uuid.UUID, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    admin_review_service.delete_review(db, current_admin, review_id)
    return None
