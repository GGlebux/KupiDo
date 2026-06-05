from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://kupido:kupido@postgresql:5432/kupido"
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    CORS_ORIGINS: str = '["http://localhost:3000","http://localhost:5173","http://localhost:5174"]'
    # Каталог фото = bind-mount на ./backend/media (коммитится в git).
    # Файлы фото едут с репозиторием; записи photos в БД восстанавливаются
    # из manifest.json при старте (см. app/crud/photo.py).
    MEDIA_DIR: str = "/app/media"
    MANIFEST_NAME: str = "manifest.json"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10 MB

    @property
    def cors_origins_list(self) -> List[str]:
        return json.loads(self.CORS_ORIGINS)

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
