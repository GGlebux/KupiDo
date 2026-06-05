from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from ...core.deps import get_db, get_current_user
from ...crud.favorite import list_favorites, get_favorite, add_favorite, remove_favorite, find_favorite
from ...schemas.favorite import FavoriteCreate, FavoriteOut

router = APIRouter(prefix="/favorites", tags=["favorites"])


@router.get("", response_model=list[FavoriteOut])
async def list_ep(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    return await list_favorites(db, user.id)


@router.post("", response_model=FavoriteOut, status_code=201)
async def add_ep(
    data: FavoriteCreate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    return await add_favorite(db, user.id, data)


@router.delete("/{fav_id}", status_code=204)
async def remove_ep(
    fav_id: UUID,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    fav = await get_favorite(db, fav_id, user.id)
    if not fav:
        raise HTTPException(status_code=404, detail="Favorite not found")
    await remove_favorite(db, fav)


@router.delete("", status_code=204)
async def remove_by_target_ep(
    project_id: UUID | None = None,
    unit_id: UUID | None = None,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    # Удаление по объекту (удобно для кнопки-сердечка, когда id записи неизвестен).
    fav = await find_favorite(db, user.id, project_id, unit_id)
    if not fav:
        raise HTTPException(status_code=404, detail="Favorite not found")
    await remove_favorite(db, fav)
