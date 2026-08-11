"""
Public SEO endpoints. FRONTEND_ORIGIN doubles as the canonical site URL here
since this is a single-domain deployment (frontend and API share an origin
in production via reverse proxy) — adjust SITE_URL below if that changes.
"""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.product import Product, ProductStatus, Category

router = APIRouter(tags=["seo"])

SITE_URL = settings.frontend_origin.rstrip("/")


@router.get("/robots.txt")
def robots_txt():
    content = f"""User-agent: *
Allow: /
Disallow: /account
Disallow: /checkout
Disallow: /admin

Sitemap: {SITE_URL}/sitemap.xml
"""
    return Response(content=content, media_type="text/plain")


@router.get("/sitemap.xml")
def sitemap_xml(db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    static_urls = ["", "/shop", "/login", "/register"]

    products = db.execute(select(Product.slug, Product.updated_at).where(Product.status == ProductStatus.active)).all()
    categories = db.execute(select(Category.slug).where(Category.is_active.is_(True))).all()

    urls = [f"{SITE_URL}{path}" for path in static_urls]
    urls += [f"{SITE_URL}/products/{slug}" for slug, _ in products]
    urls += [f"{SITE_URL}/shop?category={slug}" for (slug,) in categories]

    entries = "\n".join(f"  <url><loc>{url}</loc><lastmod>{now}</lastmod></url>" for url in urls)
    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{entries}
</urlset>"""

    return Response(content=xml, media_type="application/xml")
