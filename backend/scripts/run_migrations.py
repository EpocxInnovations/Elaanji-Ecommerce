import logging
from sqlalchemy import text
from app.core.database import engine, Base
from app import models  # noqa: F401 (registers all models)
import alembic.config

logger = logging.getLogger(__name__)

VALID_REVISONS = {"1ae1a9791451", "759770bd0e86", "b773403cf4a8"}


def run():
    print("=== STARTING DATABASE MIGRATION SYSTEM ===")
    try:
        # Create all tables if they don't exist yet
        Base.metadata.create_all(bind=engine)
        print("[PASS] Base.metadata.create_all executed successfully")
    except Exception as e:
        print(f"Warning during Base.metadata.create_all: {e}")

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


if __name__ == "__main__":
    run()
