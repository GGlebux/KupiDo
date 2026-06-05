from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import UUID
from ...core.deps import get_db, get_current_admin
from ...crud.unit import list_units_by_project, list_all_units, get_unit, create_unit, update_unit, delete_unit
from ...crud.project import get_project
from ...schemas.unit import UnitCreate, UnitUpdate, UnitOut, UnitListOut

router = APIRouter(tags=["units"])


@router.get("/projects/{project_id}/units")
async def list_project_units(
    project_id: UUID,
    page: int = 1,
    size: int = 50,
    rooms: Optional[int] = None,
    status: Optional[str] = None,
    min_area: Optional[float] = None,
    max_area: Optional[float] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    db: AsyncSession = Depends(get_db),
):
    return await list_units_by_project(db, project_id, page, size, rooms, status, min_area, max_area, min_price, max_price)


@router.get("/units", response_model=UnitListOut)
async def list_all_units_ep(page: int = 1, size: int = 20, db: AsyncSession = Depends(get_db)):
    return await list_all_units(db, page, size)


@router.get("/units/{unit_id}", response_model=UnitOut)
async def get_unit_ep(unit_id: UUID, db: AsyncSession = Depends(get_db)):
    unit = await get_unit(db, unit_id)
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    return unit


@router.post("/units", response_model=UnitOut, status_code=201)
async def create_unit_ep(
    data: UnitCreate,
    db: AsyncSession = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    return await create_unit(db, data)


@router.patch("/units/{unit_id}", response_model=UnitOut)
async def update_unit_ep(
    unit_id: UUID,
    data: UnitUpdate,
    db: AsyncSession = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    unit = await get_unit(db, unit_id)
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    return await update_unit(db, unit, data)


@router.delete("/units/{unit_id}", status_code=204)
async def delete_unit_ep(
    unit_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    unit = await get_unit(db, unit_id)
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    await delete_unit(db, unit)
