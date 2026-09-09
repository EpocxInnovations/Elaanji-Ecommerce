import math
import uuid

from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.orm import Session, selectinload

from app.models.review import Review, ReviewStatus
from app.models.product import Product
from app.models.user import User
from app.services.activity_log_service import log_action


def _recompute_product_rating(db: Session, product_id: uuid.UUID):
    product = db.get(Product, product_id)
    if product is None:
        return
    approved = db.execute(
        select(Review.rating).where(Review.product_id == product_id, Review.status == ReviewStatus.approved)
    ).scalars().all()
    product.review_count = len(approved)
    product.average_rating = round(sum(approved) / len(approved), 2) if approved else 0


def list_reviews(db: Session, status_filter: ReviewStatus | None, page: int = 1, page_size: int = 20):
    query = select(Review).options(selectinload(Review.product), selectinload(Review.user))
    count_query = select(func.count()).select_from(Review)
    if status_filter:
        query = query.where(Review.status == status_filter)
        count_query = count_query.where(Review.status == status_filter)
    total = db.execute(count_query).scalar_one()
    reviews = db.execute(query.order_by(Review.created_at.desc()).offset((page - 1) * page_size).limit(page_size)).scalars().all()
    items = [
        {
            "id": r.id,
            "product_id": r.product_id,
            "product_name": r.product.name,
            "user_name": r.user.name,
            "rating": r.rating,
            "title": r.title,
            "comment": r.comment,
            "admin_response": r.admin_response,
            "status": r.status,
            "is_verified_purchase": r.is_verified_purchase,
            "created_at": r.created_at,
        }
        for r in reviews
    ]
    return {"items": items, "total": total, "page": page, "page_size": page_size, "total_pages": math.ceil(total / page_size) if page_size else 0}


def set_review_status(db: Session, admin: User, review_id: uuid.UUID, new_status: ReviewStatus):
    review = db.get(Review, review_id)
    if review is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")

    review.status = new_status
    _recompute_product_rating(db, review.product_id)
    log_action(db, admin, f"set review status to {new_status.value}", "review", str(review.id))
    db.commit()
    return _serialize(db, review)


def respond_to_review(db: Session, admin: User, review_id: uuid.UUID, response_text: str):
    review = db.get(Review, review_id)
    if review is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")

    review.admin_response = response_text
    log_action(db, admin, "responded to review", "review", str(review.id))
    db.commit()
    return _serialize(db, review)


def delete_review(db: Session, admin: User, review_id: uuid.UUID):
    review = db.get(Review, review_id)
    if review is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    product_id = review.product_id
    log_action(db, admin, "deleted review", "review", str(review.id))
    db.delete(review)
    db.flush()
    _recompute_product_rating(db, product_id)
    db.commit()


def _serialize(db: Session, review: Review) -> dict:
    db.refresh(review)
    return {
        "id": review.id,
        "product_id": review.product_id,
        "product_name": review.product.name,
        "user_name": review.user.name,
        "rating": review.rating,
        "title": review.title,
        "comment": review.comment,
        "admin_response": review.admin_response,
        "status": review.status,
        "is_verified_purchase": review.is_verified_purchase,
        "created_at": review.created_at,
    }
