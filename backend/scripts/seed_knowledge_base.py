"""
Seeds the knowledge_chunks table with Elaanji's shipping policy, return
policy, size guide, fabric care instructions, and FAQ content.

All content below is clearly marked as PLACEHOLDER — replace with real
policy copy before launch.

Run from the backend/ directory:
    python -m scripts.seed_knowledge_base
"""
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[0]))
sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.core.database import SessionLocal, engine
from app.models.chat import KnowledgeChunk
from app.services import rag_service
from sqlalchemy import text

# ─── PLACEHOLDER CONTENT (replace with real policy copy before launch) ─────

KNOWLEDGE_ENTRIES = [
    {
        "source": "shipping_policy",
        "content": """Shipping Policy — Elaanji Sarees [PLACEHOLDER]

We ship across India via trusted courier partners.

STANDARD SHIPPING:
- Free on orders above ₹999
- Delivery within 5–7 business days
- Flat rate of ₹79 for orders below ₹999

EXPRESS SHIPPING:
- Available for ₹149
- Delivery within 2–3 business days
- Available for most pin codes across India

TRACKING:
- Tracking details are shared via email and SMS once your order is shipped
- You can also check order status on your Orders page

IMPORTANT NOTES:
- Delivery to remote areas may take 1–2 additional business days
- We do not ship internationally at this time
- Orders placed after 2 PM IST are processed the next business day""",
    },
    {
        "source": "return_policy",
        "content": """Return & Refund Policy — Elaanji Sarees [PLACEHOLDER]

ELIGIBILITY:
- Returns accepted within 7 days of delivery
- Product must be unused, unwashed, and in original packaging with all tags attached
- Only delivered orders can be returned

HOW TO INITIATE A RETURN:
1. Go to your Orders page and select the order
2. Click "Request Return" and provide a reason
3. Our team will review and approve within 24–48 hours
4. Once approved, a pickup will be arranged at no extra cost

REFUND TIMELINE:
- Refunds are processed within 5–7 business days after we receive the returned item
- Refund is credited to the original payment method
- For COD orders, refund is sent via bank transfer (NEFT)

NON-RETURNABLE ITEMS:
- Customized/stitched blouses (unless defective)
- Items marked as "Final Sale"
- Gift cards

CANCELLATION:
- Orders can be cancelled before they are shipped
- Cancellable statuses: Pending, Confirmed, Processing, Packed
- Once shipped, the order cannot be cancelled — please initiate a return after delivery instead""",
    },
    {
        "source": "size_guide",
        "content": """Size Guide — Elaanji Sarees [PLACEHOLDER]

SAREE DIMENSIONS:
- Standard saree length: 5.5 meters (including pallu)
- With blouse piece: 6.3 meters total (0.8m unstitched blouse fabric)
- Width: approximately 1.1–1.2 meters

BLOUSE SIZE CHART (Pre-Stitched):
Size XS: Bust 32", Waist 26", Shoulder 13"
Size S:  Bust 34", Waist 28", Shoulder 13.5"
Size M:  Bust 36", Waist 30", Shoulder 14"
Size L:  Bust 38", Waist 32", Shoulder 14.5"
Size XL: Bust 40", Waist 34", Shoulder 15"
Size XXL: Bust 42", Waist 36", Shoulder 15.5"

TIPS:
- If between sizes, we recommend choosing the larger size
- For pre-stitched blouses, alterations of up to 2 inches are possible
- Unstitched blouse pieces can be tailored to your exact measurements
- Petticoat is not included — standard free-size petticoats work with all our sarees""",
    },
    {
        "source": "fabric_care",
        "content": """Fabric Care Guide — Elaanji Sarees [PLACEHOLDER]

SILK SAREES (Kanjivaram, Banarasi, Mysore Silk, Kanchipuram):
- Dry clean only for the first wash
- After that, gentle hand wash in cold water with mild detergent
- Never wring — roll in a towel to remove excess water
- Dry in shade, away from direct sunlight
- Store wrapped in muslin cloth or soft cotton
- Add neem leaves or silica gel packets to prevent moisture damage
- Iron on low heat with a pressing cloth

COTTON & LINEN SAREES:
- Hand wash or gentle machine wash in cold water
- Use mild detergent — avoid bleach
- Dry in shade to prevent color fading
- Iron while slightly damp for best results
- Can be starched lightly for a crisp look

GEORGETTE, CHIFFON & ORGANZA:
- Dry clean recommended
- If hand washing, use very cold water and gentle soap
- Do not twist or wring
- Hang dry on a padded hanger
- Steam instead of ironing when possible

GENERAL TIPS:
- Always separate dark and light colored sarees
- Store each saree individually to prevent color transfer
- Refold sarees every few months to prevent permanent crease lines
- Keep away from direct sunlight, dampness, and moths""",
    },
    {
        "source": "fabric_care",
        "content": """Zari & Embroidery Care — Elaanji Sarees [PLACEHOLDER]

ZARI WORK SAREES:
- Always dry clean
- Store with tissue paper between folds to prevent tarnishing
- Keep away from perfumes and deodorants — chemicals can blacken zari
- Wrap in red or blue cloth (acid-free) — never in plastic
- If zari darkens, gently rub with a soft cloth dipped in lemon juice

EMBROIDERED & STONE WORK SAREES:
- Strictly dry clean only
- Store inside-out to protect embellishments
- Avoid hanging for long periods — the weight can distort the fabric
- Use padded hangers if hanging is necessary""",
    },
    {
        "source": "faq",
        "content": """Frequently Asked Questions — Elaanji Sarees [PLACEHOLDER]

Q: How do I track my order?
A: Once shipped, you'll receive tracking details via email/SMS. You can also check your order status on the Orders page in your account.

Q: Can I change my delivery address after placing an order?
A: Address changes are possible only if the order hasn't been packed yet. Contact support@elaanji.com immediately.

Q: Do you offer gift wrapping?
A: Yes! Premium gift wrapping is available for ₹99. Select the option during checkout.

Q: Are the colors accurate in the photos?
A: We photograph all sarees in natural daylight for accuracy. However, slight variations may occur due to screen settings. The actual product color is closest to what you see on a calibrated monitor.

Q: Do you offer COD (Cash on Delivery)?
A: Yes, COD is available for orders within India.

Q: What payment methods do you accept?
A: We accept UPI, credit/debit cards, net banking, popular wallets, and Cash on Delivery (COD).

Q: How do I contact customer support?
A: Email: support@elaanji.com. You can also use the chat widget on our website.""",
    },
    {
        "source": "faq",
        "content": """Product & Shopping FAQ — Elaanji Sarees [PLACEHOLDER]

Q: What is the difference between Kanjivaram and Kanchipuram silk?
A: They are the same! Kanjivaram is the anglicized name of Kanchipuram, a city in Tamil Nadu famous for its handwoven silk sarees.

Q: How can I verify the authenticity of a silk saree?
A: All our silk sarees come with a silk mark certification tag. You can also perform the burn test — pure silk smells like burnt hair and leaves a powdery ash.

Q: Do your sarees come with a blouse piece?
A: Most sarees include a 0.8m unstitched blouse piece. Some premium sarees also offer pre-stitched blouse options. Check the product page for details.

Q: Can I request custom blouse stitching?
A: We offer pre-stitched blouse options in standard sizes (XS to XXL). For custom stitching, you can use the unstitched blouse piece with your local tailor.

Q: What is the weight of a typical Kanjivaram saree?
A: Authentic Kanjivaram sarees typically weigh between 500g to 800g depending on the zari work. Heavier sarees generally indicate more zari content.

Q: Do you offer bulk or wholesale pricing?
A: Yes, for orders of 10+ sarees, please contact sales@elaanji.com for wholesale pricing.""",
    },
]


def seed():
    """Seed knowledge chunks with embeddings from NVIDIA API."""
    db = SessionLocal()
    try:
        existing = db.query(KnowledgeChunk).count()
        if existing > 0:
            print(f"Knowledge base already has {existing} chunks. Skipping seed.")
            print("To re-seed, run: DELETE FROM knowledge_chunks;")
            return

        print(f"Seeding {len(KNOWLEDGE_ENTRIES)} knowledge chunks...")

        # Batch-embed all content via NVIDIA free API
        texts = [entry["content"] for entry in KNOWLEDGE_ENTRIES]
        print("Generating embeddings via NVIDIA API...")
        embeddings = rag_service.embed_texts(texts)
        print(f"Received {len(embeddings)} embeddings (dim={len(embeddings[0])})")

        for i, entry in enumerate(KNOWLEDGE_ENTRIES):
            chunk = KnowledgeChunk(
                content=entry["content"],
                embedding=embeddings[i],
                source=entry["source"],
                meta={"seeded": True, "placeholder": True},
            )
            db.add(chunk)
            print(
                f"  [{i + 1}/{len(KNOWLEDGE_ENTRIES)}] Added: "
                f"{entry['source']} ({len(entry['content'])} chars)"
            )

        db.commit()
        print(
            f"\n✓ Successfully seeded {len(KNOWLEDGE_ENTRIES)} knowledge "
            f"chunks with embeddings."
        )
    except Exception as exc:
        db.rollback()
        print(f"\n✗ Seeding failed: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
