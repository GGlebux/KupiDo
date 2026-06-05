from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from typing import Optional
from uuid import UUID
from ..models.consultation import ConsultationRequest
from ..models.user import User
from ..schemas.consultation import ConsultationCreate, ConsultationUpdate


async def create_consultation(
    db: AsyncSession, data: ConsultationCreate, user_id: Optional[UUID] = None
) -> ConsultationRequest:
    obj = ConsultationRequest(**data.model_dump(), user_id=user_id)
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return obj


async def list_consultations(
    db: AsyncSession,
    page: int = 1,
    size: int = 20,
    is_processed: Optional[bool] = None,
    user_id: Optional[UUID] = None,
    user_email: Optional[str] = None,
) -> dict:
    q = select(ConsultationRequest)
    if is_processed is not None:
        q = q.where(ConsultationRequest.is_processed == is_processed)
    # Заявки клиента: привязанные напрямую (user_id) либо по совпадению email.
    if user_id is not None and user_email:
        q = q.where(or_(ConsultationRequest.user_id == user_id, ConsultationRequest.email == user_email))
    elif user_id is not None:
        q = q.where(ConsultationRequest.user_id == user_id)

    total_result = await db.execute(select(func.count()).select_from(q.subquery()))
    total = total_result.scalar()
    q = q.order_by(ConsultationRequest.created_at.desc()).offset((page - 1) * size).limit(size)
    result = await db.execute(q)
    return {"data": result.scalars().all(), "meta": {"page": page, "size": size, "total": total}}


async def get_consultation(db: AsyncSession, consultation_id: UUID) -> Optional[ConsultationRequest]:
    result = await db.execute(select(ConsultationRequest).where(ConsultationRequest.id == consultation_id))
    return result.scalar_one_or_none()


async def update_consultation(db: AsyncSession, obj: ConsultationRequest, data: ConsultationUpdate) -> ConsultationRequest:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)
    await db.commit()
    await db.refresh(obj)
    return obj
