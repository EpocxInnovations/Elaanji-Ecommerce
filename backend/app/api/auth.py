"""
/api/auth/* — registration, login, token refresh, and the logged-in user's
own profile. Password-reset verification codes are delivered through the
configured email provider.
"""
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status, Request
from jose import JWTError
from sqlalchemy.orm import Session

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from app.core.config import settings
from app.core.database import get_db
from app.core.rate_limit import limiter
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    generate_otp,
    hash_otp,
    verify_otp,
    create_reset_authorization_token,
)
from app.middleware.auth import get_current_user
from app.models.user import User, UserRole
from app.models.password_reset_otp import PasswordResetOTP
from app.services.email_service import send_password_reset_otp_email
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    GoogleAuthRequest,
    RefreshRequest,
    ForgotPasswordRequest,
    VerifyOTPRequest,
    VerifyOTPResponse,
    ResetPasswordRequest,
    TokenResponse,
    UserPublic,
    AuthResponse,
)


router = APIRouter(prefix="/api/auth", tags=["auth"])


def _issue_tokens(user: User) -> TokenResponse:
    return TokenResponse(
        access_token=create_access_token(str(user.id), user.role.value),
        refresh_token=create_refresh_token(str(user.id), user.role.value),
    )


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def register(request: Request, payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email is already registered")

    if payload.phone:
        phone_taken = db.query(User).filter(User.phone == payload.phone).first()
        if phone_taken:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Phone number is already registered")

    user = User(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        hashed_password=hash_password(payload.password),
        role=UserRole.customer,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return AuthResponse(user=UserPublic.model_validate(user), tokens=_issue_tokens(user))


@router.post("/login", response_model=AuthResponse)
@limiter.limit("10/minute")
def login(request: Request, payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if user is None or not user.hashed_password or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")

    return AuthResponse(user=UserPublic.model_validate(user), tokens=_issue_tokens(user))


@router.post("/google", response_model=AuthResponse)
@limiter.limit("10/minute")
def google_login(request: Request, payload: GoogleAuthRequest, db: Session = Depends(get_db)):
    try:
        id_info = id_token.verify_oauth2_token(
            payload.credential,
            google_requests.Request(),
            settings.google_client_id if settings.google_client_id else None,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid Google token: {str(e)}"
        )

    google_sub = id_info.get("sub")
    email = id_info.get("email")
    name = id_info.get("name", email.split("@")[0] if email else "Google User")
    picture = id_info.get("picture")

    if not email or not google_sub:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account did not provide required user info"
        )

    user = db.query(User).filter((User.google_id == google_sub) | (User.email == email)).first()

    if user:
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")
        if not user.google_id:
            user.google_id = google_sub
        if picture and not user.profile_image_url:
            user.profile_image_url = picture
        db.commit()
        db.refresh(user)
    else:
        user = User(
            name=name,
            email=email,
            google_id=google_sub,
            profile_image_url=picture,
            hashed_password=None,
            role=UserRole.customer,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return AuthResponse(user=UserPublic.model_validate(user), tokens=_issue_tokens(user))


@router.post("/refresh", response_model=TokenResponse)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)):
    try:
        decoded = decode_token(payload.refresh_token)
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

    if decoded.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token required")

    user = db.get(User, uuid.UUID(decoded["sub"]))
    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

    return _issue_tokens(user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout():
    # Stateless JWTs: real invalidation needs a server-side denylist (e.g. Redis)
    # keyed by token jti, checked in get_current_user. Left as a follow-up.
    return None


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
@limiter.limit("5/minute")
def forgot_password(request: Request, payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    # Always return a generic response regardless of whether the email exists
    # to protect against account enumeration attacks.
    if user is not None and user.is_active:
        now_utc = datetime.now(timezone.utc)
        # Enforce 60-second resend cooldown
        recent_otp = (
            db.query(PasswordResetOTP)
            .filter(PasswordResetOTP.user_id == user.id, PasswordResetOTP.used == False)  # noqa: E712
            .order_by(PasswordResetOTP.created_at.desc())
            .first()
        )
        if recent_otp and recent_otp.created_at:
            created_at_utc = recent_otp.created_at
            if created_at_utc.tzinfo is None:
                created_at_utc = created_at_utc.replace(tzinfo=timezone.utc)
            if (now_utc - created_at_utc).total_seconds() < 60:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Please wait before requesting another code."
                )

        # Invalidate any previous unused OTPs for this user
        db.query(PasswordResetOTP).filter(
            PasswordResetOTP.user_id == user.id,
            PasswordResetOTP.used == False  # noqa: E712
        ).update({"used": True}, synchronize_session=False)

        # Generate cryptographically secure 6-digit OTP using secrets module
        raw_otp = generate_otp()
        hashed_otp_str = hash_otp(raw_otp)

        otp_record = PasswordResetOTP(
            user_id=user.id,
            otp_hash=hashed_otp_str,
            expires_at=now_utc + timedelta(minutes=5),
            attempt_count=0,
            used=False,
        )
        db.add(otp_record)
        db.commit()

        # Send OTP email via SMTP or Resend API
        send_password_reset_otp_email(user.email, raw_otp)

    # Always return the same response. In particular, never expose an OTP
    # when delivery fails and never reveal whether an account exists.
    return {"message": "If an account exists with this email, a verification code has been sent."}



@router.post("/verify-reset-otp", response_model=VerifyOTPResponse, status_code=status.HTTP_200_OK)
@limiter.limit("10/minute")
def verify_reset_otp(request: Request, payload: VerifyOTPRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code."
        )

    now_utc = datetime.now(timezone.utc)
    otp_record = (
        db.query(PasswordResetOTP)
        .filter(
            PasswordResetOTP.user_id == user.id,
            PasswordResetOTP.used == False,  # noqa: E712
            PasswordResetOTP.expires_at > now_utc
        )
        .order_by(PasswordResetOTP.created_at.desc())
        .first()
    )

    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code."
        )

    if otp_record.attempt_count >= 5:
        otp_record.used = True
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Too many attempts. Please request a new code."
        )

    otp_record.attempt_count += 1
    db.commit()

    if not verify_otp(payload.otp, otp_record.otp_hash):
        if otp_record.attempt_count >= 5:
            otp_record.used = True
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Too many attempts. Please request a new code."
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code."
        )

    # Invalidate OTP on successful verification
    otp_record.used = True
    db.commit()

    # Create short-lived reset authorization token
    reset_token = create_reset_authorization_token(str(user.id))
    return VerifyOTPResponse(
        message="Verification code confirmed successfully.",
        reset_token=reset_token
    )


@router.post("/reset-password", status_code=status.HTTP_200_OK)
@limiter.limit("5/minute")
def reset_password(request: Request, payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    try:
        decoded = decode_token(payload.reset_token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset session. Please request a new code."
        )

    if decoded.get("scope") != "password_reset":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reset session. Please request a new code."
        )

    user_id_str = decoded.get("sub")
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reset session."
        )

    user = db.get(User, uuid.UUID(user_id_str))
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found or account is disabled."
        )

    user.hashed_password = hash_password(payload.new_password)
    db.commit()
    return {"message": "Your password has been updated. You can now sign in with your new password."}



@router.get("/me", response_model=UserPublic)
def get_me(current_user: User = Depends(get_current_user)):
    return UserPublic.model_validate(current_user)
