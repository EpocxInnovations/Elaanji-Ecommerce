import logging
from sqlalchemy import text, inspect
from app.core.database import engine, Base, SessionLocal
from app import models  # noqa: F401 (registers all models)
import alembic.config

logger = logging.getLogger(__name__)

VALID_REVISONS = {"1ae1a9791451", "759770bd0e86", "b773403cf4a8"}


def sync_schema_columns():
    """Ensures all saree-specific columns exist on the products table."""
    print("Checking database columns for products table...")
    try:
        with engine.connect() as conn:
            inspector = inspect(conn)
            if inspector.has_table("products"):
                existing_cols = [c["name"] for c in inspector.get_columns("products")]
                missing_statements = []

                if "saree_type" not in existing_cols:
                    missing_statements.append("ALTER TABLE products ADD COLUMN IF NOT EXISTS saree_type VARCHAR(50)")
                if "occasion" not in existing_cols:
                    missing_statements.append("ALTER TABLE products ADD COLUMN IF NOT EXISTS occasion VARCHAR(50)")
                if "border_type" not in existing_cols:
                    missing_statements.append("ALTER TABLE products ADD COLUMN IF NOT EXISTS border_type VARCHAR(120)")
                if "pallu_style" not in existing_cols:
                    missing_statements.append("ALTER TABLE products ADD COLUMN IF NOT EXISTS pallu_style VARCHAR(120)")
                if "work_type" not in existing_cols:
                    missing_statements.append("ALTER TABLE products ADD COLUMN IF NOT EXISTS work_type VARCHAR(120)")
                if "saree_length_meters" not in existing_cols:
                    missing_statements.append("ALTER TABLE products ADD COLUMN IF NOT EXISTS saree_length_meters NUMERIC(4, 2) DEFAULT 6.3")
                if "blouse_piece_included" not in existing_cols:
                    missing_statements.append("ALTER TABLE products ADD COLUMN IF NOT EXISTS blouse_piece_included BOOLEAN DEFAULT true")
                if "blouse_stitched" not in existing_cols:
                    missing_statements.append("ALTER TABLE products ADD COLUMN IF NOT EXISTS blouse_stitched BOOLEAN DEFAULT false")

                for stmt in missing_statements:
                    try:
                        conn.execute(text(stmt))
                        conn.commit()
                        print(f"[PASS] Executed: {stmt}")
                    except Exception as col_err:
                        print(f"Notice on adding column: {col_err}")
    except Exception as e:
        print(f"Notice during column sync: {e}")


def auto_seed_catalog_if_empty():
    """Seeds default saree catalog if products table is empty."""
    db = SessionLocal()
    try:
        from app.models.product import Product
        count = db.query(Product).count()
        if count == 0:
            print("Database catalog is empty. Running catalog seeder...")
            import scripts.seed_catalog  # noqa: F401
            print("[PASS] Catalog seeded successfully!")
    except Exception as e:
        print(f"Notice during auto-seed: {e}")
    finally:
        db.close()


def run():
    print("=== STARTING DATABASE MIGRATION SYSTEM ===")
    try:
        # Create all tables if they don't exist yet
        Base.metadata.create_all(bind=engine)
        print("[PASS] Base.metadata.create_all executed successfully")
    except Exception as e:
        print(f"Warning during Base.metadata.create_all: {e}")

    # Synchronize missing columns on products table
    sync_schema_columns()

    try:
        with engine.connect() as conn:
            # Check if alembic_version table exists and contains a stale version
            result = conn.execute(text("SELECT version_num FROM alembic_version"))
            row = result.fetchone()
            if row:
                version = row[0]
                if version not in VALID_REVISONS:
                    print(f"Stale alembic revision '{version}' found in database. Fixing version_num to head 'b773403cf4a8'...")
                    conn.execute(text("UPDATE alembic_version SET version_num = 'b773403cf4a8'"))
                    conn.commit()
    except Exception as e:
        print(f"alembic_version table notice: {e}")

    try:
        print("Stamping alembic head...")
        alembic.config.main(argv=["stamp", "head"])
        print("[PASS] Alembic stamp head completed successfully")
    except Exception as e:
        print(f"Alembic stamp notice: {e}")

    # Auto seed catalog if DB is empty
    auto_seed_catalog_if_empty()


if __name__ == "__main__":
    run()
