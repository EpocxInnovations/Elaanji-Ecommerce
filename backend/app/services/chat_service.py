"""
Chat orchestration service — Rule-Based Fallback.
Instant responses without LLM or Transformers.
"""
import logging
import uuid
from sqlalchemy.orm import Session

from app.models.chat import ChatSession, ChatMessage
from app.models.user import User
from app.services import order_service

logger = logging.getLogger(__name__)


def get_or_create_session(
    db: Session, user: User, session_id: uuid.UUID | None,
) -> ChatSession:
    if session_id:
        session = db.get(ChatSession, session_id)
        if session and session.user_id == user.id:
            return session
    session = ChatSession(user_id=user.id)
    db.add(session)
    db.flush()
    return session


def chat(
    db: Session,
    user: User,
    message: str,
    session_id: uuid.UUID | None = None,
    confirm_action: str | None = None,
) -> dict:
    session = get_or_create_session(db, user, session_id)

    # Save user message
    if message and confirm_action is None:
        user_msg = ChatMessage(session_id=session.id, role="user", content=message)
        db.add(user_msg)
        db.commit()

    lower_msg = message.lower().strip()
    
    response_text = "I'm a simple bot right now! Please choose one of the predefined options, or contact support@elaanji.com for complex queries."
    
    # Simple Rule-Based Matching
    if "return policy" in lower_msg:
        response_text = "We offer a 7-day return window for all unused sarees with original tags attached. Custom-stitched blouses cannot be returned. Refunds are processed to the original payment method within 5-7 business days."
    elif "shipping" in lower_msg:
        response_text = "Standard shipping is free on orders above ₹5000 (takes 5-7 days). Express shipping is available for ₹149 (takes 2-3 days). You'll receive a tracking link via email once shipped."
    elif "care for silk" in lower_msg or "care" in lower_msg:
        response_text = "For Kanjivaram and Banarasi silks, we strictly recommend dry cleaning only. Never wash silk sarees at home. Store them wrapped in a clean, soft cotton cloth (avoid plastic covers) and unfold them every few months to prevent zari breakage."
    elif "where is my order" in lower_msg or "order status" in lower_msg:
        orders = order_service.list_orders(db, user)
        if not orders:
            response_text = "You don't have any recent orders with us."
        else:
            # Show the most recent order status
            o = orders[0]
            response_text = f"Your most recent order ({o.order_number}) is currently **{o.status.value.upper()}**.\n\nTotal Amount: ₹{o.total_amount}\nPlaced on: {o.created_at.strftime('%Y-%m-%d')}"
    elif "cancel" in lower_msg or "return" in lower_msg:
        response_text = "To cancel an order or request a return, please visit the 'My Orders' section in your account dashboard and select the specific order."
        
    ast_msg = ChatMessage(
        session_id=session.id,
        role="assistant",
        content=response_text
    )
    db.add(ast_msg)
    db.commit()
    db.refresh(ast_msg)
    
    return {
        "session_id": session.id,
        "message": ast_msg,
        "requires_confirmation": False,
        "pending_action": None
    }
