import json
import os
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from uuid import UUID as UUIDType
from ..models.photo import Photo
from ..models.project import BuildingProject
from ..models.unit import Unit
from ..core.config import settings

# Файлы каталога фото лежат в MEDIA_DIR (= bind-mount ./backend/media, коммитится
# в git). manifest.json рядом хранит привязку фото -> проект/объект по СТАБИЛЬНЫМ
# ключам (slug проекта, title/area объекта), а не по UUID. Поэтому после `down -v`
# или на другом ПК (где БД пустая, а UUID будут новыми) записи photos
# восстанавливаются из манифеста, а сами файлы уже на месте из репозитория.

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


async def list_photos_by_project(db: AsyncSession, project_id: UUIDType):
    # Only project-level photos (unit photos are managed separately so they
    # don't leak into the main project gallery on the home page).
    result = await db.execute(
        select(Photo)
        .where(Photo.project_id == project_id, Photo.unit_id.is_(None))
        .order_by(Photo.order)
    )
    return result.scalars().all()


async def list_photos_by_unit(db: AsyncSession, unit_id: UUIDType):
    result = await db.execute(
        select(Photo).where(Photo.unit_id == unit_id).order_by(Photo.order)
    )
    return result.scalars().all()


async def get_photo(db: AsyncSession, photo_id: UUIDType) -> Optional[Photo]:
    result = await db.execute(select(Photo).where(Photo.id == photo_id))
    return result.scalar_one_or_none()


async def create_photo(
    db: AsyncSession,
    project_id: UUIDType,
    filename: str,
    caption: Optional[str] = None,
    unit_id: Optional[UUIDType] = None,
    is_cover: bool = False,
) -> Photo:
    photo = Photo(
        project_id=project_id,
        unit_id=unit_id,
        url=f"/media/{filename}",
        caption=caption,
        is_cover=is_cover,
    )
    db.add(photo)
    await db.commit()
    await db.refresh(photo)
    await export_manifest(db)
    return photo


async def create_photo_from_url(
    db: AsyncSession,
    project_id: UUIDType,
    url: str,
    caption: Optional[str] = None,
    unit_id: Optional[UUIDType] = None,
    is_cover: bool = False,
) -> Photo:
    photo = Photo(
        project_id=project_id,
        unit_id=unit_id,
        url=url,
        caption=caption,
        is_cover=is_cover,
    )
    db.add(photo)
    await db.commit()
    await db.refresh(photo)
    await export_manifest(db)
    return photo


async def update_photo_order(db: AsyncSession, photo: Photo, order: int) -> Photo:
    photo.order = order
    await db.commit()
    await db.refresh(photo)
    await export_manifest(db)
    return photo


def remove_local_file(url: Optional[str]) -> None:
    """Удаляет локальный файл из MEDIA_DIR по url вида /media/<имя>.
    Внешние ссылки (http...) и пустые url игнорируются."""
    if not url or not url.startswith("/media/"):
        return
    filepath = os.path.join(settings.MEDIA_DIR, os.path.basename(url))
    if os.path.isfile(filepath):
        try:
            os.remove(filepath)
        except OSError:
            pass


async def delete_photo(db: AsyncSession, photo: Photo):
    remove_local_file(photo.url)
    await db.delete(photo)
    await db.commit()
    await export_manifest(db)


async def remove_files_for_project(db: AsyncSession, project_id: UUIDType) -> None:
    """Стирает с диска файлы всех фото проекта (включая фото его квартир —
    они тоже хранят project_id). Вызывать ДО удаления проекта: БД-каскад
    удалит строки photos, но сами файлы не тронет."""
    result = await db.execute(select(Photo.url).where(Photo.project_id == project_id))
    for url in result.scalars().all():
        remove_local_file(url)


async def remove_files_for_unit(db: AsyncSession, unit_id: UUIDType) -> None:
    """Стирает с диска файлы всех фото квартиры. Вызывать ДО удаления квартиры."""
    result = await db.execute(select(Photo.url).where(Photo.unit_id == unit_id))
    for url in result.scalars().all():
        remove_local_file(url)


# ---------------------------------------------------------------------------
# Манифест: синхронизация записей photos <-> файл manifest.json в репозитории
# ---------------------------------------------------------------------------

def _manifest_path() -> str:
    return os.path.join(settings.MEDIA_DIR, settings.MANIFEST_NAME)


def _read_manifest() -> dict:
    path = _manifest_path()
    if not os.path.isfile(path):
        return {"photos": []}
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        return data if isinstance(data, dict) else {"photos": []}
    except (OSError, ValueError):
        return {"photos": []}


async def export_manifest(db: AsyncSession) -> None:
    """Перезаписывает manifest.json из текущего состояния таблицы photos.
    Вызывается после любой мутации фото; результат коммитится в git вместе
    с файлами картинок."""
    rows = (await db.execute(
        select(Photo, BuildingProject.slug, Unit.title, Unit.area)
        .join(BuildingProject, Photo.project_id == BuildingProject.id)
        .outerjoin(Unit, Photo.unit_id == Unit.id)
        .order_by(BuildingProject.slug, Photo.unit_id.is_(None).desc(),
                  Photo.unit_id, Photo.order)
    )).all()

    photos = []
    for photo, slug, unit_title, unit_area in rows:
        photos.append({
            "url": photo.url,
            "project": slug,
            "unit": None if photo.unit_id is None else {
                "title": unit_title,
                "area": float(unit_area) if unit_area is not None else None,
            },
            "caption": photo.caption,
            "order": photo.order or 0,
            "is_cover": bool(photo.is_cover),
        })

    os.makedirs(settings.MEDIA_DIR, exist_ok=True)
    path = _manifest_path()
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump({"photos": photos}, f, ensure_ascii=False, indent=2)
    os.replace(tmp, path)


async def _find_unit(db: AsyncSession, project_id, spec: dict):
    """Ищет объект по стабильным признакам (title, при неоднозначности — area)."""
    candidates = (await db.execute(
        select(Unit).where(Unit.project_id == project_id, Unit.title == spec.get("title"))
    )).scalars().all()
    if not candidates:
        return None
    area = spec.get("area")
    if area is not None and len(candidates) > 1:
        for c in candidates:
            if c.area is not None and abs(float(c.area) - area) < 0.01:
                return c
    return candidates[0]


async def sync_from_manifest(db: AsyncSession) -> int:
    """Восстанавливает записи photos из manifest.json (если их ещё нет в БД).
    Нужно на чистой БД (после `down -v` / на другом ПК): проекты создаются
    миграциями, файлы приходят с репозиторием, а связи фото — отсюда.
    Идемпотентно: существующие записи не дублирует. Возвращает число созданных."""
    data = _read_manifest()
    created = 0
    for e in data.get("photos", []):
        url, slug = e.get("url"), e.get("project")
        if not url or not slug:
            continue
        proj = (await db.execute(
            select(BuildingProject).where(BuildingProject.slug == slug)
        )).scalar_one_or_none()
        if not proj:
            continue

        unit_id = None
        if e.get("unit"):
            unit = await _find_unit(db, proj.id, e["unit"])
            if not unit:
                continue
            unit_id = unit.id

        # Для локального файла нужен сам файл (иначе не создаём «висячую» запись).
        if url.startswith("/media/"):
            fp = os.path.join(settings.MEDIA_DIR, os.path.basename(url))
            if not os.path.isfile(fp):
                continue

        unit_cond = Photo.unit_id.is_(None) if unit_id is None else Photo.unit_id == unit_id
        exists = (await db.execute(
            select(Photo.id).where(Photo.project_id == proj.id, unit_cond, Photo.url == url)
        )).first()
        if exists:
            continue

        db.add(Photo(
            project_id=proj.id, unit_id=unit_id, url=url,
            caption=e.get("caption"), order=e.get("order", 0),
            is_cover=bool(e.get("is_cover", False)),
        ))
        created += 1

    if created:
        await db.commit()
    return created


async def sweep_orphan_files(db: AsyncSession) -> int:
    """Удаляет из MEDIA_DIR картинки-сироты — те, на которые не ссылается ни
    запись photos, ни манифест. Манифест в «защищённых», чтобы случайно не
    удалить committed-файл, для которого запись в БД ещё не восстановлена.
    Неизображения (manifest.json, .gitkeep) не трогаются. Возвращает число удалённых."""
    if not os.path.isdir(settings.MEDIA_DIR):
        return 0
    referenced = {
        os.path.basename(url)
        for url in (await db.execute(select(Photo.url))).scalars().all()
        if url and url.startswith("/media/")
    }
    referenced |= {
        os.path.basename(e["url"])
        for e in _read_manifest().get("photos", [])
        if e.get("url", "").startswith("/media/")
    }
    removed = 0
    for name in os.listdir(settings.MEDIA_DIR):
        if os.path.splitext(name)[1].lower() not in IMAGE_EXTS:
            continue  # бережём manifest.json, .gitkeep и любые не-картинки
        if name in referenced:
            continue
        path = os.path.join(settings.MEDIA_DIR, name)
        if os.path.isfile(path):
            try:
                os.remove(path)
                removed += 1
            except OSError:
                pass
    return removed
