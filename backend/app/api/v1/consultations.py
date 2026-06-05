from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import UUID
from ...core.deps import get_db, get_current_admin, get_current_user
from ...crud.consultation import (
    create_consultation, list_consultations, get_consultation, update_consultation,
)
from ...crud.user import get_user_by_id
from ...schemas.consultation import ConsultationCreate, ConsultationUpdate, ConsultationOut

router = APIRouter(prefix="/consultations", tags=["consultations"])


@router.post("", response_model=ConsultationOut, status_code=201)
async def create_ep(
    data: ConsultationCreate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    # Заявки оставляют только авторизованные пользователи — привязываем к клиенту.
    return await create_consultation(db, data, user_id=user.id)


@router.get("")
async def list_ep(
    page: int = 1,
    size: int = 20,
    is_processed: Optional[bool] = None,
    user_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    user_email = None
    if user_id is not None:
        u = await get_user_by_id(db, str(user_id))
        user_email = u.email if u else None
    return await list_consultations(db, page, size, is_processed, user_id, user_email)


@router.patch("/{consultation_id}", response_model=ConsultationOut)
async def update_ep(
    consultation_id: UUID,
    data: ConsultationUpdate,
    db: AsyncSession = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    obj = await get_consultation(db, consultation_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return await update_consultation(db, obj, data)
