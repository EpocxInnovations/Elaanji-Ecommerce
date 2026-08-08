"""
Central application settings, loaded from environment variables / .env file.
Nothing in this codebase should read os.environ directly outside this file -
import `settings` instead so every value has one source of truth.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Database
    database_url: str = "postgresql+psycopg2://garments_user:garments_pass@localhost:5432/garments_db"

    # JWT auth
    jwt_secret_key: str = "dev-secret-change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 7

    # CORS
    frontend_origins: str = "http://localhost:5173"

    # Cloudinary
    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""

    # Razorpay
    razorpay_key_id: str = ""
    razorpay_key_secret: str = ""

    # Store defaults (overridden at runtime by store_settings table once seeded)
    free_shipping_threshold: float = 999
    default_shipping_fee: float = 79

    environment: str = "development"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
