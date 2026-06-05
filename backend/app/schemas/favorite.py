from pydantic import BaseModel, model_validator
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from uuid import UUID
from .photo import PhotoOut


class FavoriteCreate(BaseModel):
    project_id: Optional[UUID] = None
    unit_id: Optional[UUID] = None

    @model_validator(mode="after")
    def _one_target(self):
        if not self.project_id and not self.unit_id:
            raise ValueError("Нужно указать project_id или unit_id")
        if self.project_id and self.unit_id:
            raise ValueError("Укажите только project_id или только unit_id")
        return self


class FavProjectOut(BaseModel):
    id: UUID
    title: str
    slug: str
    location: Optional[str] = None
    price_from: Optional[Decimal] = None
    type: Optional[str] = None
    status: str
    photos: List[PhotoOut] = []
    model_config = {"from_attributes": True}


class FavUnitOut(BaseModel):
    id: UUID
    title: Optional[str] = None
    type: Optional[str] = None
    area: Optional[Decimal] = None
    floor: Optional[int] = None
    rooms: Optional[int] = None
    price: Optional[Decimal] = None
    status: str
    photos: List[PhotoOut] = []
    model_config = {"from_attributes": True}


class FavoriteOut(BaseModel):
    id: UUID
    project_id: Optional[UUID] = None
    unit_id: Optional[UUID] = None
    project: Optional[FavProjectOut] = None
    unit: Optional[FavUnitOut] = None
    created_at: datetime

    model_config = {"from_attributes": True}
