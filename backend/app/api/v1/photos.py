import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Optional
from ...core.deps import get_db, get_current_admin
from ...core.config import settings
from ...crud.photo import list_photos_by_project, list_photos_by_unit, get_photo, create_photo, create_photo_from_url, update_photo_order, delete_photo
from ...schemas.photo import PhotoOut, PhotoOrderUpdate


class PhotoFromUrl(BaseModel):
    project_id: UUID
    unit_id: Optional[UUID] = None
    url: str
    caption: Optional[str] = None
    is_cover: bool = False

router = APIRouter(tags=["photos"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


@router.get("/projects/{project_id}/photos")
async def list_photos(project_id: UUID, db: AsyncSession = Depends(get_db)):
    photos = await list_photos_by_project(db, project_id)
    return {"data": photos}


@router.get("/units/{unit_id}/photos")
async def list_unit_photos(unit_id: UUID, db: AsyncSession = Depends(get_db)):
    photos = await list_photos_by_unit(db, unit_id)
    return {"data": photos}


@router.post("/photos", response_model=PhotoOut, status_code=201)
async def upload_photo(
    project_id: UUID = Form(...),
    unit_id: UUID = Form(None),
    caption: str = Form(None),
    is_cover: bool = Form(False),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only jpg, png, webp allowed")

    content = await file.read()
    if len(content) > settings.MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    os.makedirs(settings.MEDIA_DIR, exist_ok=True)
    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(settings.MEDIA_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(content)

    return await create_photo(db, project_id, filename, caption, unit_id, is_cover)


@router.post("/photos/from-url", response_model=PhotoOut, status_code=201)
async def upload_photo_from_url(
    data: PhotoFromUrl,
    db: AsyncSession = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    return await create_photo_from_url(db, data.project_id, data.url, data.caption, unit_id=data.unit_id, is_cover=data.is_cover)


@router.patch("/photos/{photo_id}/order", response_model=PhotoOut)
async def update_order(
    photo_id: UUID,
    data: PhotoOrderUpdate,
    db: AsyncSession = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    photo = await get_photo(db, photo_id)
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    return await update_photo_order(db, photo, data.order)


@router.delete("/photos/{photo_id}", status_code=204)
async def delete_photo_ep(
    photo_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    photo = await get_photo(db, photo_id)
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    await delete_photo(db, photo)
