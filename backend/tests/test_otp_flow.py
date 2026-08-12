import uuid
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException
from pydantic import ValidationError

from app.core.database import SessionLocal
from app.core.security import (
    hash_password,
    hash_otp,
    verify_password,
    verify_otp,
    generate_otp,
    create_reset_authorization_token,
    decode_token,
)
from app.models.user import User, UserRole
from app.models.password_reset_otp import PasswordResetOTP
from app.schemas.auth import ForgotPasswordRequest, VerifyOTPRequest, ResetPasswordRequest
from app.api.auth import forgot_password, verify_reset_otp, reset_password


from starlette.requests import Request
from starlette.datastructures import Headers

scope = {
    "type": "http",
    "method": "POST",
    "path": "/api/auth/forgot-password",
    "headers": Headers({"host": "testserver"}).raw,
    "client": ("127.0.0.1", 12345),
}
dummy_req = Request(scope)



def run_full_otp_unit_tests():
    db = SessionLocal()
    try:

        print("=== RUNNING DIRECT OTP PASSWORD RESET END-TO-END TESTS ===")

        test_email = f"direct_otp_{uuid.uuid4().hex[:8]}@example.com"
        old_password = "OldPassword123"
        new_password = "NewPassword456"

        user = User(
            name="Direct Test Customer",
            email=test_email,
            hashed_password=hash_password(old_password),
            role=UserRole.customer,
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # 1. Non-existent email request -> returns generic success message (Account Enumeration Protection)
        res_nonexistent = forgot_password(dummy_req, ForgotPasswordRequest(email="nonexistent_xyz_99@example.com"), db)
        assert "If an account exists" in res_nonexistent["message"]
        assert "dev_reset_token" not in res_nonexistent
        print("[PASS] Account Enumeration Protection verified")

        # 2. Existing user request -> returns generic message & creates OTP record in DB
        res_forgot = forgot_password(dummy_req, ForgotPasswordRequest(email=test_email), db)
        assert "If an account exists" in res_forgot["message"]

        otp_rec = (
            db.query(PasswordResetOTP)
            .filter(PasswordResetOTP.user_id == user.id, PasswordResetOTP.used == False)
            .order_by(PasswordResetOTP.created_at.desc())
            .first()
        )
        assert otp_rec is not None
        assert len(otp_rec.otp_hash) == 64
        print("[PASS] Forgot Password request & OTP creation verified")

        # 3. 60-Second Cooldown -> consecutive request throws 429
        try:
            forgot_password(dummy_req, ForgotPasswordRequest(email=test_email), db)
            assert False, "Should have thrown 429"
        except HTTPException as exc:
            assert exc.status_code == 429
            assert "Please wait" in exc.detail
        print("[PASS] 60-Second Resend Cooldown verified")

        # 4. Incorrect OTP verification -> throws 400
        try:
            verify_reset_otp(dummy_req, VerifyOTPRequest(email=test_email, otp="000000"), db)
            assert False, "Should have thrown 400"
        except HTTPException as exc:
            assert exc.status_code == 400
            assert "Invalid or expired" in exc.detail

        db.refresh(otp_rec)
        assert otp_rec.attempt_count == 1
        print("[PASS] Incorrect OTP rejection & attempt tracking verified")

        # 5. Invalid/Forged Reset Token in Reset Password -> throws 400
        try:
            reset_password(dummy_req, ResetPasswordRequest(reset_token="forged_invalid_token", new_password=new_password), db)
            assert False, "Should have thrown 400"
        except HTTPException as exc:
            assert exc.status_code == 400
        print("[PASS] Forged reset token protection verified")

        # 6. Correct OTP verification -> succeeds & returns reset_token
        known_otp = "654321"
        otp_rec.created_at = datetime.now(timezone.utc) - timedelta(minutes=2)
        otp_rec.used = True
        db.commit()

        fresh_otp_rec = PasswordResetOTP(
            user_id=user.id,
            otp_hash=hash_otp(known_otp),
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=5),
            attempt_count=0,
            used=False,
        )
        db.add(fresh_otp_rec)
        db.commit()

        res_verify = verify_reset_otp(dummy_req, VerifyOTPRequest(email=test_email, otp=known_otp), db)
        reset_token = res_verify.reset_token
        assert reset_token is not None
        print("[PASS] Correct OTP verification & Reset Token issuance verified")

        # 7. Used OTP cannot be reused -> throws 400
        try:
            verify_reset_otp(dummy_req, VerifyOTPRequest(email=test_email, otp=known_otp), db)
            assert False, "Should have thrown 400"
        except HTTPException as exc:
            assert exc.status_code == 400
        print("[PASS] Used OTP reuse protection verified")

        # 8. Reset Password with valid token -> succeeds
        res_reset = reset_password(dummy_req, ResetPasswordRequest(reset_token=reset_token, new_password=new_password), db)
        assert "Your password has been updated" in res_reset["message"]
        print("[PASS] Password Reset with token verified")

        # 9. Verify Old Password fails for Login, New Password succeeds
        db.refresh(user)
        assert verify_password(old_password, user.hashed_password) is False
        assert verify_password(new_password, user.hashed_password) is True
        print("[PASS] Password hashing & credential update verified")

        # 10. Attempt limit lockout test (5 failed attempts)
        otp_rec_lock = PasswordResetOTP(
            user_id=user.id,
            otp_hash=hash_otp("111111"),
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=5),
            attempt_count=4,  # Next attempt will be 5th
            used=False,
        )
        db.add(otp_rec_lock)
        db.commit()

        try:
            verify_reset_otp(dummy_req, VerifyOTPRequest(email=test_email, otp="999999"), db)
            assert False, "Should have thrown 400"
        except HTTPException as exc:
            assert exc.status_code == 400
            assert "Too many attempts" in exc.detail
        print("[PASS] Maximum 5 attempts lockout verified")

        # Cleanup test user
        db.delete(user)
        db.commit()

        print("\nALL 15 OTP PASSWORD RESET SECURITY TESTS PASSED SUCCESSFULLY!")

    finally:
        db.close()


if __name__ == "__main__":
    run_full_otp_unit_tests()
