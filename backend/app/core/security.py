"""
Password hashing and JWT issuing/verification. This is the only place
tokens get minted or decoded — routers and dependencies call into here.
"""
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Literal


from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

import passlib.handlers.bcrypt

# Patch passlib bcrypt wrap bug check for compatibility with bcrypt >= 4.0.0
try:
    _orig_calc_checksum = passlib.handlers.bcrypt._BcryptCommon._calc_checksum

    def _safe_calc_checksum(self, secret):
        if isinstance(secret, str):
            secret = secret.encode("utf-8")
        if len(secret) > 72:
            secret = secret[:72]
        return _orig_calc_checksum(self, secret)

    passlib.handlers.bcrypt._BcryptCommon._calc_checksum = _safe_calc_checksum
except Exception:
    pass

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

TokenType = Literal["access", "refresh"]


def hash_password(plain_password: str) -> str:
    pwd_bytes = plain_password.encode("utf-8")[:72]
    return pwd_context.hash(pwd_bytes.decode("utf-8", errors="ignore"))


def verify_password(plain_password: str, hashed_password: str | None) -> bool:
    if hashed_password is None:
        return False  # Google-only account — no password set
    pwd_bytes = plain_password.encode("utf-8")[:72]
    return pwd_context.verify(pwd_bytes.decode("utf-8", errors="ignore"), hashed_password)



def create_token(subject: str, role: str, token_type: TokenType) -> str:
    now = datetime.now(timezone.utc)
    if token_type == "access":
        expire = now + timedelta(minutes=settings.access_token_expire_minutes)
    else:
        expire = now + timedelta(days=settings.refresh_token_expire_days)

    payload = {
        "sub": subject,
        "role": role,
        "type": token_type,
        "iat": now,
        "exp": expire,
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def create_access_token(user_id: str, role: str) -> str:
    return create_token(user_id, role, "access")


def create_refresh_token(user_id: str, role: str) -> str:
    return create_token(user_id, role, "refresh")


def decode_token(token: str) -> dict:
    """Raises jose.JWTError if the token is invalid, expired, or malformed."""
    try:
        return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    except JWTError as exc:
        raise exc


def generate_otp() -> str:
    """Generates a cryptographically secure 6-digit OTP using Python's secrets module."""
    return f"{secrets.randbelow(1_000_000):06d}"


def hash_otp(otp: str) -> str:
    """Hashes plain OTP securely using SHA-256 with JWT secret key."""
    return hashlib.sha256((otp + settings.jwt_secret_key).encode()).hexdigest()


def verify_otp(plain_otp: str, hashed_otp: str) -> bool:
    """Verifies plain OTP against stored OTP hash."""
    return hash_otp(plain_otp) == hashed_otp


def create_reset_authorization_token(user_id: str) -> str:
    """Issues a short-lived authorization token valid only for resetting password."""
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=15)
    payload = {
        "sub": user_id,
        "scope": "password_reset",
        "iat": now,
        "exp": expire,
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)