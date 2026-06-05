from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime
from uuid import UUID
from .validators import validate_phone


class ConsultationCreate(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    project_id: Optional[UUID] = None
    message: Optional[str] = None

    _validate_phone = field_validator("phone")(validate_phone)

    @field_validator("email", mode="before")
    @classmethod
    def _empty_email_to_none(cls, v):
        # Формы присылают пустую строку, когда email не заполнен — приводим к None,
        # иначе EmailStr отклоняет "" и заявка не отправляется.
        if v is None or (isinstance(v, str) and v.strip() == ""):
            return None
        return v


class ConsultationUpdate(BaseModel):
    is_processed: Optional[bool] = None
    result: Optional[str] = None


class ConsultationOut(BaseModel):
    id: UUID
    name: str
    phone: str
    email: Optional[str] = None
    project_id: Optional[UUID] = None
    user_id: Optional[UUID] = None
    message: Optional[str] = None
    result: Optional[str] = None
    is_processed: bool
    created_at: datetime

    model_config = {"from_attributes": True}
