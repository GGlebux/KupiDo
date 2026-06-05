from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import Optional
from uuid import UUID
from ..models.favorite import Favorite
from ..models.project import BuildingProject
from ..models.unit import Unit
from ..schemas.favorite import FavoriteCreate


def _with_relations(q):
    return q.options(
        selectinload(Favorite.project).selectinload(BuildingProject.photos),
        selectinload(Favorite.unit).selectinload(Unit.photos),
    )


async def list_favorites(db: AsyncSession, user_id: UUID) -> list[Favorite]:
    result = await db.execute(
        _with_relations(select(Favorite))
        .where(Favorite.user_id == user_id)
        .order_by(Favorite.created_at.desc())
    )
    return result.scalars().all()


async def get_favorite(db: AsyncSession, fav_id: UUID, user_id: UUID) -> Optional[Favorite]:
    result = await db.execute(
        select(Favorite).where(Favorite.id == fav_id, Favorite.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def find_favorite(db: AsyncSession, user_id: UUID, project_id=None, unit_id=None) -> Optional[Favorite]:
    q = select(Favorite).where(Favorite.user_id == user_id)
    if project_id is not None:
        q = q.where(Favorite.project_id == project_id)
    if unit_id is not None:
        q = q.where(Favorite.unit_id == unit_id)
    result = await db.execute(q)
    return result.scalar_one_or_none()


async def add_favorite(db: AsyncSession, user_id: UUID, data: FavoriteCreate) -> Favorite:
    existing = await find_favorite(db, user_id, data.project_id, data.unit_id)
    if existing:
        return await _reload(db, existing.id)
    fav = Favorite(user_id=user_id, project_id=data.project_id, unit_id=data.unit_id)
    db.add(fav)
    await db.commit()
    return await _reload(db, fav.id)


async def _reload(db: AsyncSession, fav_id: UUID) -> Favorite:
    result = await db.execute(_with_relations(select(Favorite)).where(Favorite.id == fav_id))
    return result.scalar_one()


async def remove_favorite(db: AsyncSession, fav: Favorite):
    await db.delete(fav)
    await db.commit()
