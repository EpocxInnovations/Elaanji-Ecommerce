import warnings
warnings.filterwarnings("ignore", message=".*pkg_resources is deprecated.*")

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from sqlalchemy import text

from app.core.config import settings
from app.core.database import engine, get_db
from app.core.exceptions import register_exception_handlers
from app.core.logging import setup_logging, logger
from app.core.rate_limit import limiter
from app.middleware.security_headers import SecurityHeadersMiddleware

from app.api import (
    auth,
    products,
    categories,
    cart,
    wishlist,
    addresses,
    coupons,
    orders,
    payments,
    banners,
    seo,
)
from app.api.admin import (
    dashboard as admin_dashboard,
    products as admin_products,
    categories as admin_categories,
    inventory as admin_inventory,
    uploads as admin_uploads,
    orders as admin_orders,
    refunds as admin_refunds,
    customers as admin_customers,
    coupons as admin_coupons,
    reviews as admin_reviews,
    banners as admin_banners,
    homepage as admin_homepage,
    reports as admin_reports,
    settings as admin_settings,
)

# Initialize application logger
setup_logging(settings.log_level)

openapi_tags = [
    {"name": "health", "description": "Liveness and database readiness health probes"},
    {"name": "auth", "description": "User registration, authentication, OAuth, and token rotation"},
    {"name": "products", "description": "High-performance catalog search, filtering, and product details"},
    {"name": "categories", "description": "Category navigation and hierarchy"},
    {"name": "cart", "description": "Server-side price and stock verified shopping cart"},
    {"name": "orders", "description": "Transactional order checkout, order state machine, and customer order history"},
    {"name": "payments", "description": "Razorpay payment processing and idempotent verification"},
    {"name": "coupons", "description": "Coupon validation and discount rules"},
    {"name": "wishlist", "description": "Customer wishlist operations"},
    {"name": "addresses", "description": "Customer saved address book"},
    {"name": "admin-dashboard", "description": "Administrative KPI aggregations"},
    {"name": "admin-products", "description": "Administrative catalog management"},
    {"name": "admin-orders", "description": "Administrative order operations"},
    {"name": "admin-inventory", "description": "Administrative stock management"},
]

app = FastAPI(
    title="Elaanji Production E-Commerce API",
    description="Enterprise-grade REST API for Elaanji luxury saree storefront and administration panel.",
    version="1.0.0",
    openapi_tags=openapi_tags,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
register_exception_handlers(app)


@app.on_event("startup")
def on_startup():
    logger.info("Starting Elaanji API in %s mode...", settings.environment)
    try:
        from scripts.run_migrations import sync_schema_columns, auto_seed_catalog_if_empty
        sync_schema_columns()
        auto_seed_catalog_if_empty()
    except Exception as exc:
        logger.warning("Startup migration sync notice: %s", exc)


cors_origins = [origin.strip() for origin in settings.frontend_origin.split(",") if origin.strip()]
if "https://elaanji-website.vercel.app" not in cors_origins:
    cors_origins.append("https://elaanji-website.vercel.app")
if "http://localhost:5173" not in cors_origins:
    cors_origins.append("http://localhost:5173")

# Middleware stack
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID"],
)
app.add_middleware(SecurityHeadersMiddleware)


@app.middleware("http")
async def api_path_rewrite_middleware(request: Request, call_next):
    """
    Ensures seamless routing:
    - Rewrites non-prefixed paths to /api
    - Maps /api/v1 requests seamlessly
    """
    path = request.scope.get("path", "")
    if path.startswith("/api/v1/"):
        # Normalize /api/v1/... to /api/... internally for registered routers
        request.scope["path"] = path.replace("/api/v1", "/api", 1)
    elif not path.startswith("/api") and not path.startswith("/docs") and not path.startswith("/openapi.json") and not path.startswith("/redoc") and path != "/":
        request.scope["path"] = f"/api{path}"
    return await call_next(request)


# Include Customer Routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(categories.router)
app.include_router(cart.router)
app.include_router(wishlist.router)
app.include_router(addresses.router)
app.include_router(coupons.router)
app.include_router(orders.router)
app.include_router(payments.router)
app.include_router(banners.router)
app.include_router(seo.router)

# Include Admin Routers
app.include_router(admin_dashboard.router)
app.include_router(admin_products.router)
app.include_router(admin_categories.router)
app.include_router(admin_inventory.router)
app.include_router(admin_uploads.router)
app.include_router(admin_orders.router)
app.include_router(admin_refunds.router)
app.include_router(admin_customers.router)
app.include_router(admin_coupons.router)
app.include_router(admin_reviews.router)
app.include_router(admin_banners.router)
app.include_router(admin_homepage.router)
app.include_router(admin_reports.router)
app.include_router(admin_settings.router)


@app.get("/api/health", tags=["health"])
@app.get("/api/v1/health", tags=["health"])
def liveness_check():
    """Liveness probe to confirm API server process is alive."""
    return {
        "status": "healthy",
        "service": "elaanji-backend",
        "version": settings.app_version,
        "environment": settings.environment,
    }


@app.get("/api/health/ready", tags=["health"])
@app.get("/api/v1/health/ready", tags=["health"])
def readiness_check():
    """Readiness probe that pings the database connection."""
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {
            "status": "ready",
            "database": "connected",
            "environment": settings.environment,
            "version": settings.app_version,
        }
    except Exception as exc:
        logger.error("Readiness check database failure: %s", exc)
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unhealthy",
                "database": "disconnected",
                "detail": str(exc),
            },
        )
