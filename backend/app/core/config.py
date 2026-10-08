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
    frontend_origin: str = "http://localhost:5173"

    # Cloudinary
    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""

    # Razorpay
    razorpay_key_id: str = ""
    razorpay_key_secret: str = ""

    # Google OAuth
    google_client_id: str = ""

    # SMTP Email
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from_email: str = "noreply@elaanji.com"
    smtp_from_name: str = "Elaanji"

    # Store defaults (overridden at runtime by store_settings table once seeded)
    free_shipping_threshold: float = 999
    default_shipping_fee: float = 79

    environment: str = "development"
    api_v1_prefix: str = "/api/v1"
    log_level: str = "INFO"
    project_name: str = "Elaanji E-Commerce API"
    app_version: str = "1.0.0"

    # NVIDIA NIM (free LLM + Embedding API for chatbot)
    nvidia_api_key: str = ""
    nvidia_base_url: str = "https://integrate.api.nvidia.com/v1"
    nvidia_chat_model: str = "meta/llama-3.2-11b-vision-instruct"
    nvidia_embed_model: str = "nvidia/llama-3.2-nv-embedqa-1b-v1"


def get_settings() -> Settings:
    return Settings()


class SettingsProxy:
    def __getattr__(self, name):
        return getattr(get_settings(), name)


settings = SettingsProxy()