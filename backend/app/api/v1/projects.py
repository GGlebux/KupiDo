from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import UUID
from ...core.deps import get_db, get_current_admin
from ...crud.project import (
    list_projects, get_project, get_project_by_slug,
    create_project, update_project, delete_project,
)
from ...schemas.project import ProjectCreate, ProjectUpdate, ProjectOut

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("")
async def list_projects_ep(
    page: int = 1,
    size: int = 20,
    type: Optional[str] = None,
    status: Optional[str] = None,
    location: Optional[str] = None,
    price_min: Optional[float] = None,
    price_max: Optional[float] = None,
    deal_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    return await list_projects(db, page, size, type, status, location, price_min, price_max, deal_type)


@router.get("/{slug}", response_model=ProjectOut)
async def get_project_ep(slug: str, db: AsyncSession = Depends(get_db)):
    project = await get_project_by_slug(db, slug)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.post("", response_model=ProjectOut, status_code=201)
async def create_project_ep(
    data: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    return await create_project(db, data)


@router.patch("/{project_id}", response_model=ProjectOut)
async def update_project_ep(
    project_id: UUID,
    data: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    project = await get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return await update_project(db, project, data)


@router.delete("/{project_id}", status_code=204)
async def delete_project_ep(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    project = await get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    await delete_project(db, project)
