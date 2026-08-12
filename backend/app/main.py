from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

from app.core.config import settings
from app.core.rate_limit import limiter
from app.api import auth, products, categories, cart, wishlist, addresses, coupons, orders, payments, banners, seo
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

app = FastAPI(
    title="Elaanji API",
    description="Backend for the Elaanji saree storefront + admin panel.",
    version="0.1.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

cors_origins = [origin.strip() for origin in settings.frontend_origin.split(",") if origin.strip()]
if "https://elaanji-website.vercel.app" not in cors_origins:
    cors_origins.append("https://elaanji-website.vercel.app")
if "http://localhost:5173" not in cors_origins:
    cors_origins.append("http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
def health_check():
    return {"status": "ok", "environment": settings.environment}
