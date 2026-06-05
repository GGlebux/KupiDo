from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from ...core.deps import get_db, get_current_admin
from ...crud.user import list_users, get_user_by_id, update_user, delete_user
from ...schemas.user import UserOut, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("")
async def list_ep(
    page: int = 1,
    size: int = 20,
    search: str = "",
    db: AsyncSession = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    return await list_users(db, page, size, search)


@router.get("/{user_id}", response_model=UserOut)
async def get_ep(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    user = await get_user_by_id(db, str(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/{user_id}", response_model=UserOut)
async def update_ep(
    user_id: UUID,
    data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    user = await get_user_by_id(db, str(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return await update_user(db, user, data)


@router.delete("/{user_id}", status_code=204)
async def delete_ep(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    user = await get_user_by_id(db, str(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await delete_user(db, user)
