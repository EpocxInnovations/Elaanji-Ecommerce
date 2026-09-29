"""
CLI script to create or promote an admin user.
Run from backend directory:
  python scripts/create_admin.py admin@elaanji.com MySecretPassword123 "Admin Name"
"""
import os
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.user import User, UserRole
from app.core.security import hash_password


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/create_admin.py <email> [<password>] [<name>] [<optional_db_url>]")
        sys.exit(1)

    email = sys.argv[1].strip()
    password = sys.argv[2] if len(sys.argv) > 2 and not sys.argv[2].startswith("postgresql") else "AdminPass123!"
    name = sys.argv[3] if len(sys.argv) > 3 and not sys.argv[3].startswith("postgresql") else "Admin User"

    # Support custom DB URL passed as positional arg or environment variable
    custom_db_url = os.getenv("DATABASE_URL")
    for arg in sys.argv[1:]:
        if arg.startswith("postgresql://") or arg.startswith("postgres://"):
            custom_db_url = arg

    if custom_db_url:
        if custom_db_url.startswith("postgres://"):
            custom_db_url = custom_db_url.replace("postgres://", "postgresql+psycopg2://", 1)
        elif custom_db_url.startswith("postgresql://") and not custom_db_url.startswith("postgresql+psycopg2://"):
            custom_db_url = custom_db_url.replace("postgresql://", "postgresql+psycopg2://", 1)
        engine = create_engine(custom_db_url)
        db = sessionmaker(bind=engine)()
        print(f"Connecting to database...")
    else:
        db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.role = UserRole.admin
            user.hashed_password = hash_password(password)
            db.commit()
            print(f"✅ Successfully updated password and promoted '{email}' to ADMIN role.")
        else:
            new_admin = User(
                name=name,
                email=email,
                hashed_password=hash_password(password),
                role=UserRole.admin,
                is_active=True,
            )
            db.add(new_admin)
            db.commit()
            print(f"✅ Successfully created new ADMIN account: '{email}' with password '{password}'.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
