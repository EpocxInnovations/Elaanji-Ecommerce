import pytest
import uuid
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import SessionLocal
from app.models.user import User, UserRole, Address
from app.models.product import Product, ProductVariant, ProductImage, Category, ProductStatus, GenderCategory, SareeType, Occasion
from app.models.order import Order, OrderItem, OrderStatus, DeliveryMethod
from app.models.payment import PaymentMethod
from app.core.security import hash_password, create_token
from app.services import admin_product_service, cart_service, order_service

client = TestClient(app)


@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def admin_user(db_session):
    admin = db_session.query(User).filter(User.email == "test_admin_var@elaanji.com").first()
    if not admin:
        admin = User(
            name="Test Admin",
            email="test_admin_var@elaanji.com",
            hashed_password=hash_password("AdminPass123!"),
            role=UserRole.admin,
            is_active=True,
        )
        db_session.add(admin)
        db_session.commit()
        db_session.refresh(admin)
    return admin


@pytest.fixture
def customer_user(db_session):
    user = db_session.query(User).filter(User.email == "test_customer_var@elaanji.com").first()
    if not user:
        user = User(
            name="Test Customer",
            email="test_customer_var@elaanji.com",
            hashed_password=hash_password("CustomerPass123!"),
            role=UserRole.customer,
            is_active=True,
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
    return user


@pytest.fixture
def sample_category(db_session):
    cat = db_session.query(Category).filter(Category.slug == "test-silk-var").first()
    if not cat:
        cat = Category(name="Test Silk", slug="test-silk-var", display_order=1)
        db_session.add(cat)
        db_session.commit()
        db_session.refresh(cat)
    return cat


def test_create_product_with_variants_and_images(db_session, admin_user, sample_category):
    sku_prefix = f"TST-{uuid.uuid4().hex[:6].upper()}"
    slug = f"test-saree-{uuid.uuid4().hex[:6]}"

    # 1. Create product with Green and Pink variants
    token = create_token(str(admin_user.id), admin_user.role.value, "access")
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "name": "Kanchipuram Silk Saree Test",
        "slug": slug,
        "sku": f"{sku_prefix}-MAIN",
        "category_id": str(sample_category.id),
        "gender": "women",
        "saree_type": "kanjivaram",
        "occasion": "wedding",
        "price": 4999.0,
        "status": "active",
        "variants": [
            {
                "sku": f"{sku_prefix}-GRN",
                "color": "Green",
                "color_hex": "#1F6B45",
                "price_override": 4999.0,
                "stock_quantity": 10,
                "is_active": True,
            },
            {
                "sku": f"{sku_prefix}-PNK",
                "color": "Pink",
                "color_hex": "#E8B4B8",
                "price_override": 5199.0,
                "stock_quantity": 5,
                "is_active": True,
            },
            {
                "sku": f"{sku_prefix}-MRN",
                "color": "Maroon",
                "color_hex": "#5C1A22",
                "price_override": 4999.0,
                "stock_quantity": 0,
                "is_active": True,
            },
        ],
    }

    res = client.post("/api/admin/products", json=payload, headers=headers)
    assert res.status_code == 201
    data = res.json()
    product_id = data["id"]
    assert len(data["variants"]) == 3

    # Verify duplicate color rejection
    dup_payload = dict(payload)
    dup_payload["slug"] = f"{slug}-dup"
    dup_payload["sku"] = f"{sku_prefix}-DUP"
    dup_payload["variants"] = [
        {"sku": f"{sku_prefix}-G1", "color": "Green", "stock_quantity": 5},
        {"sku": f"{sku_prefix}-G2", "color": "green", "stock_quantity": 5},
    ]
    dup_res = client.post("/api/admin/products", json=dup_payload, headers=headers)
    assert dup_res.status_code == 409
    assert "Duplicate color variant" in dup_res.json()["detail"]

    # 2. Add variant-specific images
    green_var = next(v for v in data["variants"] if v["color"] == "Green")
    pink_var = next(v for v in data["variants"] if v["color"] == "Pink")

    img_green = admin_product_service.add_product_image(
        db_session, admin_user, uuid.UUID(product_id), "https://example.com/green.jpg", "Green", False, uuid.UUID(green_var["id"])
    )
    img_pink = admin_product_service.add_product_image(
        db_session, admin_user, uuid.UUID(product_id), "https://example.com/pink.jpg", "Pink", False, uuid.UUID(pink_var["id"])
    )

    # 3. Retrieve product details via public API
    pub_res = client.get(f"/api/products/{slug}")
    assert pub_res.status_code == 200
    pub_data = pub_res.json()
    assert len(pub_data["variants"]) == 3

    p_green = next(v for v in pub_data["variants"] if v["color"] == "Green")
    p_pink = next(v for v in pub_data["variants"] if v["color"] == "Pink")
    assert len(p_green["images"]) >= 1
    assert p_green["images"][0]["image_url"] == "https://example.com/green.jpg"
    assert len(p_pink["images"]) >= 1
    assert p_pink["images"][0]["image_url"] == "https://example.com/pink.jpg"
    assert p_pink["price"] == 5199.0


def test_cart_and_order_with_variant(db_session, customer_user, sample_category):
    sku_prefix = f"ORD-{uuid.uuid4().hex[:6].upper()}"
    slug = f"ord-saree-{uuid.uuid4().hex[:6]}"

    product = Product(
        name="Order Variant Saree",
        slug=slug,
        sku=f"{sku_prefix}-MAIN",
        category_id=sample_category.id,
        gender=GenderCategory.women,
        price=3000.0,
        status=ProductStatus.active,
    )
    db_session.add(product)
    db_session.flush()

    var_blue = ProductVariant(
        product_id=product.id,
        sku=f"{sku_prefix}-BLU",
        color="Blue",
        color_hex="#0000FF",
        price_override=3200.0,
        stock_quantity=10,
        is_active=True,
    )
    var_zero = ProductVariant(
        product_id=product.id,
        sku=f"{sku_prefix}-ZER",
        color="ZeroStock",
        stock_quantity=0,
        is_active=True,
    )
    db_session.add_all([var_blue, var_zero])
    db_session.flush()

    img_blue = ProductImage(
        product_id=product.id,
        variant_id=var_blue.id,
        image_url="https://example.com/blue.jpg",
        display_order=0,
        color="Blue",
    )
    db_session.add(img_blue)
    db_session.commit()

    # 1. Add zero stock variant should fail
    with pytest.raises(Exception):
        cart_service.add_item(db_session, customer_user, var_zero.id, 1)

    # 2. Add valid blue variant with price override
    cart = cart_service.add_item(db_session, customer_user, var_blue.id, 2)
    summary = cart_service.build_summary(cart, db_session)
    assert len(summary["items"]) >= 1
    cart_item = next(i for i in summary["items"] if i["variant"].id == var_blue.id)
    assert cart_item["unit_price"] == 3200.0
    assert cart_item["product_image_url"] == "https://example.com/blue.jpg"

    # 3. Create address for user
    addr = Address(
        user_id=customer_user.id,
        full_name="Customer Name",
        phone="9876543210",
        address_line="123 Street",
        city="Chennai",
        state="Tamil Nadu",
        pin_code="600001",
        country="India",
    )
    db_session.add(addr)
    db_session.commit()

    # 4. Place order
    order = order_service.create_order(
        db_session, customer_user, addr.id, DeliveryMethod.standard, PaymentMethod.cod, None
    )
    assert order.status == OrderStatus.confirmed
    order_item = next(i for i in order.items if i.variant_id == var_blue.id)
    assert order_item.color == "Blue"
    assert order_item.unit_price == 3200.0
    assert order_item.product_image_url == "https://example.com/blue.jpg"
