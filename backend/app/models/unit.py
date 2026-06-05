import uuid
from sqlalchemy import Column, String, Text, DateTime, Integer, Numeric, Enum as SAEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..db.base import Base


class Unit(Base):
    __tablename__ = "units"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("building_projects.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255))
    type = Column(SAEnum("apartment", "house", "studio", "penthouse", name="unit_type"))
    area = Column(Numeric(8, 2))
    floor = Column(Integer)
    rooms = Column(Integer)
    price = Column(Numeric(15, 2))
    status = Column(
        SAEnum("available", "booked", "sold", name="unit_status"),
        default="available",
    )
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("BuildingProject", back_populates="units")
    photos = relationship("Photo", back_populates="unit", cascade="all, delete-orphan", order_by="Photo.order")
    bookings = relationship("Booking", back_populates="unit")
