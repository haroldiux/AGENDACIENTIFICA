from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Agenda Cientifica UNITEPC"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "supersecretkey" # Change in production
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    
    POSTGRES_SERVER: str = "db"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "agenda_db"
    POSTGRES_PORT: str = "5432"
    
    DATABASE_URL: str | None = None
    REDIS_URL: str = "redis://redis:6379/0"

    class Config:
        env_file = ".env"

    @property
    def sync_database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

settings = Settings()
