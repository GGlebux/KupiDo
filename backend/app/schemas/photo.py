from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class PhotoOut(BaseModel):
    id: UUID
    project_id: UUID
    unit_id: Optional[UUID] = None
    url: str
    caption: Optional[str] = None
    order: int
    is_cover: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class PhotoOrderUpdate(BaseModel):
    order: int
