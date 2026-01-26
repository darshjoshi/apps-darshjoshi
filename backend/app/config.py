from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import model_validator
from typing import List, Union, Any


class Settings(BaseSettings):
    # API Configuration
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "Apps Dashboard API"

    # CORS Configuration - accepts both string and list
    BACKEND_CORS_ORIGINS: Union[str, List[str]] = "http://localhost:3000,http://localhost:8000,https://apps.darshjoshi.com"

    @model_validator(mode='before')
    @classmethod
    def parse_cors_origins(cls, values: Any) -> Any:
        """Parse CORS origins from comma-separated string to list"""
        if isinstance(values, dict):
            cors_origins = values.get('BACKEND_CORS_ORIGINS')
            if isinstance(cors_origins, str):
                values['BACKEND_CORS_ORIGINS'] = [
                    origin.strip() for origin in cors_origins.split(",")
                ]
        return values

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
