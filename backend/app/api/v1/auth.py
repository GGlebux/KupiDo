from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from ...core.deps import get_db, get_current_user
from ...core.security import verify_password, create_access_token
from ...crud.user import get_user_by_email, create_user
from ...schemas.user import UserCreate, UserOut, Token, LoginRequest

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=201)
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
    existing = await get_user_by_email(db, data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    return await create_user(db, data)


@router.post("/login", response_model=Token)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    user = await get_user_by_email(db, data.email)
    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account disabled")
    token = create_access_token(str(user.id))
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UserOut)
async def me(user=Depends(get_current_user)):
    return user


@router.patch("/me", response_model=UserOut)
async def update_me(data: dict, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    from ...schemas.user import UserUpdate
    from ...crud.user import update_user
    return await update_user(db, user, UserUpdate(**data))
