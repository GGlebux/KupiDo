from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from uuid import UUID
from .photo import PhotoOut


class UnitProjectOut(BaseModel):
    id: UUID
    title: str
    slug: str
    model_config = {"from_attributes": True}


class UnitBase(BaseModel):
    project_id: UUID
    title: Optional[str] = None
    type: Optional[str] = None
    area: Optional[Decimal] = None
    floor: Optional[int] = None
    rooms: Optional[int] = None
    price: Optional[Decimal] = None
    status: str = "available"
    description: Optional[str] = None


class UnitCreate(UnitBase):
    pass


class UnitUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[str] = None
    area: Optional[Decimal] = None
    floor: Optional[int] = None
    rooms: Optional[int] = None
    price: Optional[Decimal] = None
    status: Optional[str] = None
    description: Optional[str] = None


class UnitOut(UnitBase):
    id: UUID
    photos: List[PhotoOut] = []
    project: Optional[UnitProjectOut] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class UnitListOut(BaseModel):
    data: List[UnitOut]
    meta: dict
