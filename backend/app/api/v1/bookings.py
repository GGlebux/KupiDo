from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import UUID
from ...core.deps import get_db, get_current_user, get_current_admin
from ...crud.booking import list_bookings, get_booking, get_active_booking, create_booking, update_booking, delete_booking
from ...schemas.booking import BookingCreate, BookingUpdate, BookingOut, BookingListOut

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.get("", response_model=BookingListOut)
async def list_bookings_ep(
    page: int = 1,
    size: int = 20,
    user_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    # Обычный клиент видит только свои брони; админ — все, либо конкретного клиента.
    if user.role == "admin":
        target_user_id = user_id
    else:
        target_user_id = user.id
    return await list_bookings(db, user_id=target_user_id, page=page, size=size)


@router.post("", response_model=BookingOut, status_code=201)
async def create_booking_ep(
    data: BookingCreate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    existing = await get_active_booking(db, user.id, data.unit_id)
    if existing:
        raise HTTPException(status_code=409, detail="Вы уже забронировали этот объект")
    return await create_booking(db, data, user.id)


@router.patch("/{booking_id}", response_model=BookingOut)
async def update_booking_ep(
    booking_id: UUID,
    data: BookingUpdate,
    db: AsyncSession = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    booking = await get_booking(db, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return await update_booking(db, booking, data)


@router.delete("/{booking_id}", status_code=204)
async def delete_booking_ep(
    booking_id: UUID,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    booking = await get_booking(db, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if str(booking.user_id) != str(user.id) and user.role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    await delete_booking(db, booking)
