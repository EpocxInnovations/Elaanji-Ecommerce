"""
SQLAlchemy engine/session wiring. Every request gets one Session via the
`get_db` dependency, which is closed automatically when the request ends.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.core.config import settings

engine = create_engine(settings.database_url, pool_pre_ping=True, future=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)


class Base(DeclarativeBase):
    """Shared declarative base for every ORM model in the app."""
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
