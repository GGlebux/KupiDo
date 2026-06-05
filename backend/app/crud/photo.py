import os
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from uuid import UUID as UUIDType
from ..models.photo import Photo
from ..core.config import settings


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
    return photo


async def update_photo_order(db: AsyncSession, photo: Photo, order: int) -> Photo:
    photo.order = order
    await db.commit()
    await db.refresh(photo)
    return photo


async def delete_photo(db: AsyncSession, photo: Photo):
    filepath = os.path.join(settings.MEDIA_DIR, os.path.basename(photo.url))
    if os.path.exists(filepath):
        os.remove(filepath)
    await db.delete(photo)
    await db.commit()
