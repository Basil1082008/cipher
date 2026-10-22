"""Application configuration loaded from environment variables."""

from functools import lru_cache
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings with environment variable support."""

    mongodb_url: Optional[str] = None
    database_name: str = "contact_manager_db"
    frontend_origin: str = "http://localhost:5173"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        populate_by_name=True,
    )

    def validate_mongodb_url(self) -> str:
        """Validate and return the MongoDB URL, raising a helpful error if missing."""
        if not self.mongodb_url or not self.mongodb_url.strip():
            raise ValueError(
                "MongoDB connection string is missing. "
                "Please set MONGODB_URL in backend/.env with your MongoDB Atlas connection string. "
                "Refer to backend/.env.example for guidance."
            )
        if "YOUR_USERNAME" in self.mongodb_url or "YOUR_CLUSTER" in self.mongodb_url:
            raise ValueError(
                "MongoDB connection string still contains placeholder values. "
                "Please replace YOUR_USERNAME, YOUR_PASSWORD, and YOUR_CLUSTER with your actual MongoDB Atlas credentials in backend/.env."
            )
        return self.mongodb_url.strip()


@lru_cache()
def get_settings() -> Settings:
    """Return a cached instance of application settings."""
    return Settings()
