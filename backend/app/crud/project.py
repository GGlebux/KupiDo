from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import Optional
from uuid import UUID
from ..models.project import BuildingProject
from ..schemas.project import ProjectCreate, ProjectUpdate


async def get_project(db: AsyncSession, project_id: UUID) -> Optional[BuildingProject]:
    result = await db.execute(
        select(BuildingProject).options(selectinload(BuildingProject.photos)).where(BuildingProject.id == project_id)
    )
    return result.scalar_one_or_none()


async def get_project_by_slug(db: AsyncSession, slug: str) -> Optional[BuildingProject]:
    result = await db.execute(
        select(BuildingProject).options(selectinload(BuildingProject.photos)).where(BuildingProject.slug == slug)
    )
    return result.scalar_one_or_none()


async def list_projects(
    db: AsyncSession,
    page: int = 1,
    size: int = 20,
    type: Optional[str] = None,
    status: Optional[str] = None,
    location: Optional[str] = None,
    price_min=None,
    price_max=None,
    deal_type: Optional[str] = None,
) -> dict:
    q = select(BuildingProject)
    if type:
        q = q.where(BuildingProject.type == type)
    if deal_type:
        q = q.where(BuildingProject.deal_type == deal_type)
    if status:
        q = q.where(BuildingProject.status == status)
    if location:
        q = q.where(BuildingProject.location.ilike(f"%{location}%"))
    if price_min is not None:
        q = q.where(BuildingProject.price_from >= price_min)
    if price_max is not None:
        q = q.where(BuildingProject.price_from <= price_max)

    total_result = await db.execute(select(func.count()).select_from(q.subquery()))
    total = total_result.scalar()
    q = q.options(selectinload(BuildingProject.photos)).order_by(BuildingProject.created_at.desc()).offset((page - 1) * size).limit(size)
    result = await db.execute(q)
    return {"data": result.scalars().all(), "meta": {"page": page, "size": size, "total": total}}


async def create_project(db: AsyncSession, data: ProjectCreate) -> BuildingProject:
    project = BuildingProject(**data.model_dump())
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project


async def update_project(db: AsyncSession, project: BuildingProject, data: ProjectUpdate) -> BuildingProject:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(project, field, value)
    await db.commit()
    await db.refresh(project)
    return project


async def delete_project(db: AsyncSession, project: BuildingProject):
    await db.delete(project)
    await db.commit()
