from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import Optional
from uuid import UUID
from ..models.unit import Unit
from ..schemas.unit import UnitCreate, UnitUpdate
from .photo import remove_files_for_unit, export_manifest


async def get_unit(db: AsyncSession, unit_id: UUID) -> Optional[Unit]:
    result = await db.execute(
        select(Unit)
        .options(selectinload(Unit.photos), selectinload(Unit.project))
        .where(Unit.id == unit_id)
    )
    return result.scalar_one_or_none()


async def list_units_by_project(
    db: AsyncSession,
    project_id: UUID,
    page: int = 1,
    size: int = 50,
    rooms: Optional[int] = None,
    status: Optional[str] = None,
    min_area=None,
    max_area=None,
    min_price=None,
    max_price=None,
) -> dict:
    q = select(Unit).where(Unit.project_id == project_id)
    if rooms is not None:
        q = q.where(Unit.rooms == rooms)
    if status:
        q = q.where(Unit.status == status)
    if min_area is not None:
        q = q.where(Unit.area >= min_area)
    if max_area is not None:
        q = q.where(Unit.area <= max_area)
    if min_price is not None:
        q = q.where(Unit.price >= min_price)
    if max_price is not None:
        q = q.where(Unit.price <= max_price)

    total_result = await db.execute(select(func.count()).select_from(q.subquery()))
    total = total_result.scalar()
    q = (
        q.options(selectinload(Unit.photos), selectinload(Unit.project))
        .order_by(Unit.price)
        .offset((page - 1) * size)
        .limit(size)
    )
    result = await db.execute(q)
    return {"data": result.scalars().all(), "meta": {"page": page, "size": size, "total": total}}


async def list_all_units(db: AsyncSession, page: int = 1, size: int = 20) -> dict:
    q = select(Unit)
    total_result = await db.execute(select(func.count()).select_from(q.subquery()))
    total = total_result.scalar()
    q = (
        q.options(selectinload(Unit.photos), selectinload(Unit.project))
        .order_by(Unit.created_at.desc())
        .offset((page - 1) * size)
        .limit(size)
    )
    result = await db.execute(q)
    return {"data": result.scalars().all(), "meta": {"page": page, "size": size, "total": total}}


async def create_unit(db: AsyncSession, data: UnitCreate) -> Unit:
    unit = Unit(**data.model_dump())
    db.add(unit)
    await db.commit()
    # photos/project подгружаем явно: UnitOut сериализует эти связи, а ленивая
    # подгрузка в async-сессии падает (MissingGreenlet) -> 500.
    await db.refresh(unit, attribute_names=["photos", "project"])
    return unit


async def update_unit(db: AsyncSession, unit: Unit, data: UnitUpdate) -> Unit:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(unit, field, value)
    await db.commit()
    await db.refresh(unit, attribute_names=["photos", "project"])
    return unit


async def delete_unit(db: AsyncSession, unit: Unit):
    # Сначала стираем файлы фото квартиры, потом саму квартиру.
    await remove_files_for_unit(db, unit.id)
    await db.delete(unit)
    await db.commit()
    await export_manifest(db)
