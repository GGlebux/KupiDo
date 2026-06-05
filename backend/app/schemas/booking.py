from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from uuid import UUID


class BookingUserOut(BaseModel):
    id: UUID
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    model_config = {"from_attributes": True}


class BookingUnitOut(BaseModel):
    id: UUID
    type: Optional[str] = None
    area: Optional[Decimal] = None
    floor: Optional[int] = None
    rooms: Optional[int] = None
    price: Optional[Decimal] = None
    model_config = {"from_attributes": True}


class BookingCreate(BaseModel):
    unit_id: UUID
    comment: Optional[str] = None


class BookingUpdate(BaseModel):
    status: Optional[str] = None
    payment_status: Optional[str] = None
    payment_amount: Optional[Decimal] = None
    comment: Optional[str] = None


class BookingOut(BaseModel):
    id: UUID
    unit_id: UUID
    user_id: UUID
    status: str
    payment_status: str = "not_paid"
    payment_amount: Optional[Decimal] = None
    comment: Optional[str] = None
    user: Optional[BookingUserOut] = None
    unit: Optional[BookingUnitOut] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BookingListOut(BaseModel):
    data: List[BookingOut]
    meta: dict
