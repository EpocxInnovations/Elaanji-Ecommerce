"""
Seeds a handful of realistic categories/brands/products so Phase 2 can be
tested against real data. Safe to re-run — clears and reseeds catalog tables
only (never touches users/orders).
"""
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.core.database import SessionLocal
from app.models.product import (
    Category,
    Brand,
    Product,
    ProductVariant,
    ProductImage,
    ProductStatus,
    GenderCategory,
    SareeType,
    Occasion,
)

db = SessionLocal()

# Clear existing catalog data (variants/images cascade via FK ondelete)
db.query(ProductImage).delete()
db.query(ProductVariant).delete()
db.query(Product).delete()
db.query(Category).delete()
db.query(Brand).delete()
db.commit()

silk = Category(name="Silk Sarees", slug="silk-sarees", display_order=1)
kanjivaram_cat = Category(name="Kanjivaram", slug="kanjivaram", display_order=1)
banarasi_cat = Category(name="Banarasi", slug="banarasi", display_order=2)
cotton = Category(name="Cotton Sarees", slug="cotton-sarees", display_order=2)
designer = Category(name="Designer Sarees", slug="designer-sarees", display_order=3)
db.add_all([silk, kanjivaram_cat, banarasi_cat, cotton, designer])
db.flush()
kanjivaram_cat.parent_id = silk.id
banarasi_cat.parent_id = silk.id

brand = Brand(name="Elaanji Signature", slug="elaanji-signature")
db.add(brand)
db.flush()

products_data = [
    {
        "name": "Royal Kanjivaram Silk Saree — Deep Maroon",
        "slug": "royal-kanjivaram-silk-maroon",
        "sku": "ELJ-KJ-001",
        "category": kanjivaram_cat,
        "saree_type": SareeType.kanjivaram,
        "occasion": Occasion.wedding,
        "fabric": "Pure Mulberry Silk",
        "border_type": "Temple Zari Border",
        "pallu_style": "Contrast Zari Pallu",
        "work_type": "Zari",
        "price": 18999,
        "discount_price": 15999,
        "colors": [("Deep Maroon", "#5C1A22"), ("Emerald Green", "#0B5D3B")],
        "is_featured": True,
        "is_new_arrival": True,
        "is_on_sale": True,
    },
    {
        "name": "Classic Banarasi Silk Saree — Royal Blue",
        "slug": "classic-banarasi-silk-royal-blue",
        "sku": "ELJ-BN-001",
        "category": banarasi_cat,
        "saree_type": SareeType.banarasi,
        "occasion": Occasion.festive,
        "fabric": "Pure Banarasi Silk",
        "border_type": "Gold Zari Border",
        "pallu_style": "Meenakari Pallu",
        "work_type": "Zari",
        "price": 12999,
        "discount_price": None,
        "colors": [("Royal Blue", "#1B3A6B"), ("Wine", "#6E2430")],
        "is_best_seller": True,
    },
    {
        "name": "Handwoven Cotton Saree — Mustard Yellow",
        "slug": "handwoven-cotton-mustard-yellow",
        "sku": "ELJ-CT-001",
        "category": cotton,
        "saree_type": SareeType.cotton,
        "occasion": Occasion.casual,
        "fabric": "Handloom Cotton",
        "border_type": "Simple Border",
        "pallu_style": "Self Pallu",
        "work_type": "Plain",
        "price": 2499,
        "discount_price": 1999,
        "colors": [("Mustard Yellow", "#C9962C"), ("Off White", "#F1EAD9")],
        "is_new_arrival": True,
        "is_on_sale": True,
    },
    {
        "name": "Designer Georgette Saree — Blush Pink",
        "slug": "designer-georgette-blush-pink",
        "sku": "ELJ-DS-001",
        "category": designer,
        "saree_type": SareeType.designer,
        "occasion": Occasion.party,
        "fabric": "Soft Georgette",
        "border_type": "Sequin Border",
        "pallu_style": "Embellished Pallu",
        "work_type": "Stone Work",
        "price": 7999,
        "discount_price": 6499,
        "colors": [("Blush Pink", "#E8B4B8")],
        "is_trending": True,
        "is_on_sale": True,
        "blouse_stitched": True,
        "blouse_sizes": ["S", "M", "L", "XL"],
    },
]

# A tiny transparent-ish placeholder image per product (Cloudinary wiring lands
# when real uploads are needed — Phase 4 admin panel). Using picsum for now so
# the storefront has something real to render against.
PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80"
PLACEHOLDER_IMG_2 = "https://images.unsplash.com/photo-1610030181087-540c3e1d0d3d?w=800&q=80"

for data in products_data:
    product = Product(
        name=data["name"],
        slug=data["slug"],
        sku=data["sku"],
        description=(
            f"A stunning {data['saree_type'].value.replace('_', ' ')} saree crafted from "
            f"{data['fabric']}, finished with a {data['border_type'].lower()} and "
            f"{data['pallu_style'].lower()}. Perfect for {data['occasion'].value} occasions."
        ),
        category_id=data["category"].id,
        brand_id=brand.id,
        gender=GenderCategory.women,
        saree_type=data["saree_type"],
        occasion=data["occasion"],
        border_type=data["border_type"],
        pallu_style=data["pallu_style"],
        work_type=data["work_type"],
        fabric=data["fabric"],
        saree_length_meters=6.3,
        blouse_piece_included=True,
        blouse_stitched=data.get("blouse_stitched", False),
        care_instructions="Dry clean only. Store away from direct sunlight.",
        price=data["price"],
        discount_price=data.get("discount_price"),
        tax_percent=5,
        status=ProductStatus.active,
        is_new_arrival=data.get("is_new_arrival", False),
        is_best_seller=data.get("is_best_seller", False),
        is_featured=data.get("is_featured", False),
        is_trending=data.get("is_trending", False),
        is_on_sale=data.get("is_on_sale", False),
        tags=f"{data['saree_type'].value},{data['occasion'].value}",
    )
    db.add(product)
    db.flush()

    for idx, (color_name, color_hex) in enumerate(data["colors"]):
        if data.get("blouse_stitched"):
            for size in data["blouse_sizes"]:
                db.add(
                    ProductVariant(
                        product_id=product.id,
                        sku=f"{data['sku']}-{color_name[:3].upper()}-{size}",
                        color=color_name,
                        color_hex=color_hex,
                        blouse_size=size,
                        stock_quantity=15,
                        reserved_quantity=0,
                    )
                )
        else:
            db.add(
                ProductVariant(
                    product_id=product.id,
                    sku=f"{data['sku']}-{color_name[:3].upper()}",
                    color=color_name,
                    color_hex=color_hex,
                    stock_quantity=20,
                    reserved_quantity=0,
                )
            )

        db.add(
            ProductImage(
                product_id=product.id,
                image_url=PLACEHOLDER_IMG,
                is_hover_image=False,
                display_order=idx * 2,
                color=color_name,
            )
        )
        db.add(
            ProductImage(
                product_id=product.id,
                image_url=PLACEHOLDER_IMG_2,
                is_hover_image=True,
                display_order=idx * 2 + 1,
                color=color_name,
            )
        )

db.commit()
print(f"Seeded {len(products_data)} products across {5} categories.")
db.close()
