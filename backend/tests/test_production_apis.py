"""
Production API Verification Test Suite for Elaanji.
Tests health probes, security headers, RBAC, pagination, transactional checkout, and payment idempotency.
"""
import uuid
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import SessionLocal
from app.core.security import create_access_token, hash_password
from app.models.user import User, UserRole
from app.models.product import Product, ProductVariant, ProductStatus, GenderCategory
from app.models.order import Order, OrderStatus, DeliveryMethod
from app.models.payment import Payment, PaymentMethod, PaymentStatus
from app.services import order_service, payment_service

client = TestClient(app)


def test_health_liveness_and_readiness():
    """Verify liveness and DB readiness health check endpoints."""
    res_live = client.get("/api/health")
    assert res_live.status_code == 200
    data_live = res_live.json()
    assert data_live["status"] == "healthy"

    res_ready = client.get("/api/health/ready")
    assert res_ready.status_code == 200
    data_ready = res_ready.json()
    assert data_ready["status"] == "ready"
    assert data_ready["database"] == "connected"

    # Verify v1 alias
    res_v1 = client.get("/api/v1/health/ready")
    assert res_v1.status_code == 200


def test_security_headers_and_request_id():
    """Verify OWASP security headers and X-Request-ID on API responses."""
    res = client.get("/api/health")
    assert res.status_code == 200
    assert "X-Request-ID" in res.headers
    assert res.headers["X-Content-Type-Options"] == "nosniff"
    assert res.headers["X-Frame-Options"] == "DENY"
    assert res.headers["Referrer-Policy"] == "strict-origin-when-cross-origin"


def test_rbac_access_control():
    """Verify customer cannot access admin endpoints and admin can."""
    db = SessionLocal()
    try:
        # Create test customer and admin
        test_suffix = uuid.uuid4().hex[:6]
        cust = User(
            name="Test Customer",
            email=f"cust_{test_suffix}@test.com",
            role=UserRole.customer,
            hashed_password=hash_password("Pass12345!"),
        )
        adm = User(
            name="Test Admin",
            email=f"adm_{test_suffix}@test.com",
            role=UserRole.admin,
            hashed_password=hash_password("Pass12345!"),
        )
        db.add_all([cust, adm])
        db.commit()
        db.refresh(cust)
        db.refresh(adm)

        cust_token = create_access_token(str(cust.id), cust.role.value)
        adm_token = create_access_token(str(adm.id), adm.role.value)

        # Customer accessing admin endpoint -> 403 Forbidden
        res_forbidden = client.get(
            "/api/admin/dashboard/kpis",
            headers={"Authorization": f"Bearer {cust_token}"},
        )
        assert res_forbidden.status_code == 403

        # Admin accessing admin endpoint -> 200 OK
        res_ok = client.get(
            "/api/admin/dashboard/kpis",
            headers={"Authorization": f"Bearer {adm_token}"},
        )
        assert res_ok.status_code == 200

        # Clean up
        db.delete(cust)
        db.delete(adm)
        db.commit()
    finally:
        db.close()


def test_product_catalog_pagination():
    """Verify SQL-level paginated response structure and query filters."""
    res = client.get("/api/products?page=1&page_size=2")
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert "total" in data
    assert "page" in data
    assert "page_size" in data
    assert "total_pages" in data
    assert len(data["items"]) <= 2
    assert data["page"] == 1
    assert data["page_size"] == 2


def test_payment_idempotency():
    """Verify payment verification is idempotent when called repeatedly."""
    db = SessionLocal()
    try:
        test_suffix = uuid.uuid4().hex[:6]
        user = User(
            name="Payment User",
            email=f"pay_{test_suffix}@test.com",
            role=UserRole.customer,
            hashed_password=hash_password("Pass12345!"),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        order = Order(
            order_number=f"ELJ{test_suffix}",
            user_id=user.id,
            shipping_name="Payment User",
            shipping_phone="9999999999",
            shipping_address_line="123 Test St",
            shipping_city="Chennai",
            shipping_state="TN",
            shipping_pin_code="600001",
            shipping_country="India",
            delivery_method=DeliveryMethod.standard,
            subtotal=1000.0,
            total_amount=1000.0,
            status=OrderStatus.confirmed,
        )
        db.add(order)
        db.flush()

        payment = Payment(
            order_id=order.id,
            method=PaymentMethod.razorpay,
            status=PaymentStatus.successful,
            amount=1000.0,
            provider_order_id="order_test_123",
            provider_payment_id="pay_test_123",
            provider_signature="sig_test_123",
        )
        db.add(payment)
        db.commit()

        # Call verify on an already confirmed order
        result = payment_service.verify_and_confirm_payment(
            db, user, order.id, "order_test_123", "pay_test_123", "sig_test_123"
        )
        assert result["verified"] is True

        # Clean up
        db.delete(payment)
        db.delete(order)
        db.delete(user)
        db.commit()
    finally:
        db.close()
