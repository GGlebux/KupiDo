from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class ReviewAuthorOut(BaseModel):
    id: UUID
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    model_config = {"from_attributes": True}


class ReviewProjectOut(BaseModel):
    id: UUID
    title: str
    slug: str
    model_config = {"from_attributes": True}


class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    text: str = Field(min_length=3, max_length=2000)
    project_id: Optional[UUID] = None


class ReviewUpdate(BaseModel):
    is_published: Optional[bool] = None
    rating: Optional[int] = Field(default=None, ge=1, le=5)
    text: Optional[str] = None


class ReviewOut(BaseModel):
    id: UUID
    rating: int
    text: str
    is_published: bool
    project_id: Optional[UUID] = None
    user_id: UUID
    user: Optional[ReviewAuthorOut] = None
    project: Optional[ReviewProjectOut] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ReviewListOut(BaseModel):
    data: List[ReviewOut]
    meta: dict
