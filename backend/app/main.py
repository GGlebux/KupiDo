from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from .core.config import settings
from .api.v1 import router as api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs(settings.MEDIA_DIR, exist_ok=True)
    # 1) Восстанавливаем записи photos из manifest.json (после `down -v` / на
    #    другом ПК БД пустая, а файлы пришли с репозиторием).
    # 2) Подметаем осиротевшие картинки (нет ни записи в БД, ни в манифесте).
    try:
        from .db.session import async_session_factory
        from .crud.photo import sync_from_manifest, sweep_orphan_files
        async with async_session_factory() as db:
            restored = await sync_from_manifest(db)
            removed = await sweep_orphan_files(db)
        if restored:
            print(f"[media] restored {restored} photo record(s) from manifest", flush=True)
        if removed:
            print(f"[media] removed {removed} orphan file(s)", flush=True)
    except Exception as e:  # старт не должен падать из-за обслуживания медиа
        print(f"[media] maintenance skipped: {e}", flush=True)
    yield


app = FastAPI(
    title="КупиДо API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

os.makedirs(settings.MEDIA_DIR, exist_ok=True)
app.mount("/media", StaticFiles(directory=settings.MEDIA_DIR), name="media")


@app.get("/api/health")
async def health():
    return {"status": "ok"}
