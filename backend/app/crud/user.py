from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional, List
from uuid import UUID
from ..models.user import User
from ..schemas.user import UserCreate, UserUpdate
from ..core.security import hash_password


async def get_user_by_id(db: AsyncSession, user_id: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def create_user(db: AsyncSession, data: UserCreate) -> User:
    user = User(
        email=data.email,
        password=hash_password(data.password),
        first_name=data.first_name,
        last_name=data.last_name,
        phone=data.phone,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def update_user(db: AsyncSession, user: User, data: UserUpdate) -> User:
    for field, value in data.model_dump(exclude_unset=True).items():
        if field == "password" and value:
            value = hash_password(value)
        setattr(user, field, value)
    await db.commit()
    await db.refresh(user)
    return user


async def list_users(db: AsyncSession, page: int = 1, size: int = 20, search: str = "") -> dict:
    q = select(User)
    if search:
        like = f"%{search}%"
        q = q.where(
            (User.email.ilike(like)) |
            (User.first_name.ilike(like)) |
            (User.last_name.ilike(like))
        )
    total_result = await db.execute(select(func.count()).select_from(q.subquery()))
    total = total_result.scalar()
    q = q.offset((page - 1) * size).limit(size)
    result = await db.execute(q)
    return {"data": result.scalars().all(), "meta": {"page": page, "size": size, "total": total}}


async def delete_user(db: AsyncSession, user: User):
    await db.delete(user)
    await db.commit()
