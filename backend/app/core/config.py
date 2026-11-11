from pydantic_settings import BaseSettings
from pydantic import field_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "Agenda Cientifica UNITEPC"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "supersecretkey" # Change in production
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    
    POSTGRES_SERVER: str = "db"
    POSTGRES_USER: str = "user"
    POSTGRES_PASSWORD: str = "password"
    POSTGRES_DB: str = "agenda"
    POSTGRES_PORT: str = "5432"
    
    DATABASE_URL: str | None = None
    REDIS_URL: str = "redis://redis:6379/0"
    
    SUPER_ADMIN_EMAIL: str = "admin@unitepc.edu.bo"
    SUPER_ADMIN_PASSWORD: str = "admin123"
    
    NOTIFICATION_DAYS_AHEAD: int = 7
    WHATSAPP_API_TOKEN: str | None = None
    WHATSAPP_PHONE_ID: str | None = None
    TELEGRAM_BOT_TOKEN: str | None = None
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_TLS: bool = True
    SMTP_USER: str | None = None
    SMTP_PASSWORD: str | None = None
    EMAILS_FROM_NAME: str = "Agenda Cientifica UNITEPC"
    EMAILS_FROM_EMAIL: str | None = None

    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://127.0.0.1",
        "https://agenda.unitepc.pro",
        "http://agenda.unitepc.pro",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def _parse_cors_origins(cls, value):
        if isinstance(value, str):
            import json
            try:
                return json.loads(value)
            except Exception:
                return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @field_validator("SMTP_HOST", mode="before")
    @classmethod
    def _empty_smtp_host(cls, value):
        if not value:
            return "smtp.gmail.com"
        return value

    @field_validator("SMTP_PORT", mode="before")
    @classmethod
    def _empty_smtp_port(cls, value):
        if value == "" or value is None:
            return 587
        return value

    class Config:
        env_file = ".env"
        extra = "ignore"

    @property
    def sync_database_url(self) -> str:
        if self.DATABASE_URL:
            url = self.DATABASE_URL
            if url.startswith("postgresql://"):
                url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
            return url
        return f"postgresql+psycopg2://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

settings = Settings()
