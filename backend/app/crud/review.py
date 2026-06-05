from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import Optional
from uuid import UUID
from ..models.review import Review
from ..schemas.review import ReviewCreate, ReviewUpdate


def _with_relations(q):
    return q.options(selectinload(Review.user), selectinload(Review.project))


async def list_reviews(
    db: AsyncSession,
    page: int = 1,
    size: int = 20,
    only_published: bool = True,
    user_id: Optional[UUID] = None,
) -> dict:
    q = select(Review)
    if only_published:
        q = q.where(Review.is_published.is_(True))
    if user_id is not None:
        q = q.where(Review.user_id == user_id)
    total_result = await db.execute(select(func.count()).select_from(q.subquery()))
    total = total_result.scalar()
    q = _with_relations(q).order_by(Review.created_at.desc()).offset((page - 1) * size).limit(size)
    result = await db.execute(q)
    return {"data": result.scalars().all(), "meta": {"page": page, "size": size, "total": total}}


async def get_review(db: AsyncSession, review_id: UUID) -> Optional[Review]:
    result = await db.execute(_with_relations(select(Review)).where(Review.id == review_id))
    return result.scalar_one_or_none()


async def create_review(db: AsyncSession, data: ReviewCreate, user_id: UUID) -> Review:
    review = Review(
        user_id=user_id,
        rating=data.rating,
        text=data.text,
        project_id=data.project_id,
        is_published=False,  # публикуется только после модерации администратором
    )
    db.add(review)
    await db.commit()
    return await get_review(db, review.id)


async def update_review(db: AsyncSession, review: Review, data: ReviewUpdate) -> Review:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(review, field, value)
    await db.commit()
    return await get_review(db, review.id)


async def delete_review(db: AsyncSession, review: Review):
    await db.delete(review)
    await db.commit()
