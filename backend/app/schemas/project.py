from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal
from uuid import UUID
from .photo import PhotoOut


class ProjectBase(BaseModel):
    title: str
    slug: str
    type: Optional[str] = None
    deal_type: str = "sale"
    description: Optional[str] = None
    location: Optional[str] = None
    address: Optional[str] = None
    status: str = "active"
    price_from: Optional[Decimal] = None
    deadline: Optional[date] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    type: Optional[str] = None
    deal_type: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    address: Optional[str] = None
    status: Optional[str] = None
    price_from: Optional[Decimal] = None
    deadline: Optional[date] = None


class ProjectOut(ProjectBase):
    id: UUID
    photos: List[PhotoOut] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProjectListOut(BaseModel):
    data: List[ProjectOut]
    meta: dict
