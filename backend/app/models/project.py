import uuid
from sqlalchemy import Column, String, Text, DateTime, Date, Numeric, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..db.base import Base


class BuildingProject(Base):
    __tablename__ = "building_projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    type = Column(SAEnum("multi_apartment", "private_house_group", name="project_type"))
    deal_type = Column(
        SAEnum("sale", "rent", name="deal_type"),
        default="sale",
        server_default="sale",
        nullable=False,
    )
    description = Column(Text)
    location = Column(String(255))
    address = Column(String(500))
    status = Column(
        SAEnum("active", "sold_out", "upcoming", name="project_status"),
        default="active",
    )
    price_from = Column(Numeric(15, 2))
    deadline = Column(Date)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    units = relationship("Unit", back_populates="project", cascade="all, delete-orphan")
    photos = relationship("Photo", back_populates="project", cascade="all, delete-orphan", order_by="Photo.order")
