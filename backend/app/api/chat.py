"""
Chat API endpoint — authenticated, rate-limited, exactly like existing
order/checkout routes. Uses the same get_current_user dependency and
the same slowapi limiter pattern.
"""
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.rate_limit import limiter
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.chat import ChatRequest, ChatResponse
from app.services import chat_service

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
@limiter.limit("20/minute")
def send_chat_message(
    request: Request,
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Send a message to the Elaanji support chatbot.

    Rate-limited to 20 requests/minute per IP (same pattern as order
    placement). Requires a valid Bearer token. The session_id is optional
    on the first message — the server creates one and returns it.
    """
    result = chat_service.chat(
        db=db,
        user=current_user,
        message=payload.message,
        session_id=payload.session_id,
        confirm_action=payload.confirm_action,
    )
    return result
