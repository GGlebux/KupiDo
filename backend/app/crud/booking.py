from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import Optional
from uuid import UUID
from ..models.booking import Booking
from ..schemas.booking import BookingCreate, BookingUpdate


def _with_relations(q):
    return q.options(selectinload(Booking.user), selectinload(Booking.unit))


async def get_booking(db: AsyncSession, booking_id: UUID) -> Optional[Booking]:
    result = await db.execute(_with_relations(select(Booking)).where(Booking.id == booking_id))
    return result.scalar_one_or_none()


async def get_active_booking(db: AsyncSession, user_id: UUID, unit_id: UUID) -> Optional[Booking]:
    """Активная (не отменённая) бронь этого клиента на этот объект, если есть."""
    result = await db.execute(
        select(Booking).where(
            Booking.user_id == user_id,
            Booking.unit_id == unit_id,
            Booking.status != "cancelled",
        )
    )
    return result.scalars().first()


async def list_bookings(
    db: AsyncSession,
    user_id: Optional[UUID] = None,
    page: int = 1,
    size: int = 20,
) -> dict:
    q = select(Booking)
    if user_id:
        q = q.where(Booking.user_id == user_id)
    total_result = await db.execute(select(func.count()).select_from(q.subquery()))
    total = total_result.scalar()
    q = _with_relations(q).order_by(Booking.created_at.desc()).offset((page - 1) * size).limit(size)
    result = await db.execute(q)
    return {"data": result.scalars().all(), "meta": {"page": page, "size": size, "total": total}}


async def create_booking(db: AsyncSession, data: BookingCreate, user_id: UUID) -> Booking:
    booking = Booking(unit_id=data.unit_id, user_id=user_id, comment=data.comment)
    db.add(booking)
    await db.commit()
    # Перечитываем с подгруженными связями user/unit, иначе сериализация
    # BookingOut обращается к "ленивым" отношениям в async-сессии → MissingGreenlet.
    return await get_booking(db, booking.id)


async def update_booking(db: AsyncSession, booking: Booking, data: BookingUpdate) -> Booking:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(booking, field, value)
    await db.commit()
    return await get_booking(db, booking.id)


async def delete_booking(db: AsyncSession, booking: Booking):
    await db.delete(booking)
    await db.commit()
