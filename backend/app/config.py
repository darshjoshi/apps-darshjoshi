from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import BeforeValidator
from typing import List, Union, Annotated


def parse_cors_origins(v: Union[str, List[str]]) -> List[str]:
    """Parse CORS origins from comma-separated string or list"""
    if isinstance(v, str):
        return [origin.strip() for origin in v.split(",")]
    return v


class Settings(BaseSettings):
    # API Configuration
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "Apps Dashboard API"

    # CORS Configuration
    BACKEND_CORS_ORIGINS: Annotated[
        List[str],
        BeforeValidator(parse_cors_origins)
    ] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "https://apps.darshjoshi.com",
    ]

    # Database Configuration (uncomment and configure as needed)
    # DATABASE_URL: str = "postgresql://user:password@localhost/dbname"
    # MONGODB_URL: str = "mongodb://localhost:27017"
    # MONGODB_DB_NAME: str = "apps_db"

    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="allow"
    )


settings = Settings()
