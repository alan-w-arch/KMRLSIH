# app/config.py

from pydantic_settings import BaseSettings
from pydantic import Field, validator
from typing import Optional, List


class Settings(BaseSettings):
    ENV: str = Field(default="dev", description="Environment: dev/staging/prod")

    # Async DB (SQLAlchemy+asyncpg)
    DATABASE_URL: str = Field(..., description="Database connection string")

    # S3 / MinIO
    S3_ENDPOINT: str = "http://localhost:9000"
    S3_BUCKET: str = "kmrl-ingest"
    S3_ACCESS_KEY: str = "minioadmin"
    S3_SECRET_KEY: str = "minioadmin"
    S3_REGION: str = "us-east-1"
    S3_SECURE: bool = False

    # Email IMAP (connector testing)
    IMAP_HOST: str = "imap.gmail.com"
    IMAP_PORT: int = 993
    IMAP_USER: str = "demo@example.com"
    IMAP_PASSWORD: str = "changeme123"

    # RabbitMQ (optional)
    RABBITMQ_URL: Optional[str] = ""

    # CORS Middleware
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    # ---- Validators ----
    @validator("S3_ENDPOINT", pre=True)
    def ensure_no_trailing_slash(cls, v: str) -> str:
        return v.rstrip("/")

    @validator("DATABASE_URL")
    def validate_db(cls, v: str) -> str:
        if not v.startswith("postgresql+asyncpg://"):
            raise ValueError("DATABASE_URL must use asyncpg (postgresql+asyncpg://...)")
        return v


# Create settings instance
settings = Settings()


# Optional: safe settings for debugging/logging (hides secrets)
def get_safe_settings():
    data = settings.dict()
    hidden_keys = {"S3_SECRET_KEY", "IMAP_PASSWORD", "RABBITMQ_URL"}
    return {k: ("***" if k in hidden_keys else v) for k, v in data.items()}
