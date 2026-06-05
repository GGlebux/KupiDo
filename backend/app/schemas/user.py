from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional
from datetime import datetime
from uuid import UUID
from .validators import validate_phone


class UserBase(BaseModel):
    # На выходе (UserOut) email — обычная строка: служебные аккаунты вида
    # user@localhost не проходят строгую проверку email-validator.
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None

    _validate_phone = field_validator("phone")(validate_phone)


class UserCreate(UserBase):
    # При регистрации новых пользователей email проверяем строго.
    email: EmailStr
    password: str = Field(min_length=6)
    first_name: str = Field(min_length=1)
    last_name: str = Field(min_length=1)


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    # Лениво: служебный аккаунт user@localhost при редактировании профиля
    # не должен отклоняться. Формат проверяет фронтенд для реальных адресов.
    email: Optional[str] = None
    password: Optional[str] = Field(default=None, min_length=6)
    is_active: Optional[bool] = None
    role: Optional[str] = None

    _validate_phone = field_validator("phone")(validate_phone)


class UserOut(UserBase):
    id: UUID
    role: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: str
    password: str
