from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import UUID
from ...core.deps import get_db, get_current_user, get_current_admin, get_optional_user
from ...crud.review import list_reviews, get_review, create_review, update_review, delete_review
from ...schemas.review import ReviewCreate, ReviewUpdate, ReviewOut, ReviewListOut

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.get("", response_model=ReviewListOut)
async def list_ep(
    page: int = 1,
    size: int = 20,
    all: bool = False,
    user_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_optional_user),
):
    # Неопубликованные отзывы (all=true) видит только администратор.
    is_admin = bool(user and user.role == "admin")
    only_published = not (all and is_admin)
    return await list_reviews(db, page, size, only_published=only_published, user_id=user_id)


@router.post("", response_model=ReviewOut, status_code=201)
async def create_ep(
    data: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    return await create_review(db, data, user.id)


@router.patch("/{review_id}", response_model=ReviewOut)
async def update_ep(
    review_id: UUID,
    data: ReviewUpdate,
    db: AsyncSession = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    review = await get_review(db, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return await update_review(db, review, data)


@router.delete("/{review_id}", status_code=204)
async def delete_ep(
    review_id: UUID,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    review = await get_review(db, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    # Автор может удалить свой отзыв, админ — любой.
    if str(review.user_id) != str(user.id) and user.role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    await delete_review(db, review)
