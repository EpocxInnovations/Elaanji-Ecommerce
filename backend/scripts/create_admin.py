"""
CLI script to create or promote an admin user.
Run from backend directory:
  python scripts/create_admin.py admin@elaanji.com MySecretPassword123 "Admin Name"
"""
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.core.database import SessionLocal
from app.models.user import User, UserRole
from app.core.security import hash_password


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/create_admin.py <email> [<password>] [<name>]")
        sys.exit(1)

    email = sys.argv[1].strip()
    password = sys.argv[2] if len(sys.argv) > 2 else "AdminPass123!"
    name = sys.argv[3] if len(sys.argv) > 3 else "Admin User"

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.role = UserRole.admin
            db.commit()
            print(f"✅ Successfully promoted existing user '{email}' to ADMIN role.")
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
