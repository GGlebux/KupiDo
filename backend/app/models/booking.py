import uuid
from sqlalchemy import Column, Text, DateTime, Enum as SAEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..db.base import Base


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    unit_id = Column(UUID(as_uuid=True), ForeignKey("units.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status = Column(
        SAEnum("pending", "confirmed", "cancelled", name="booking_status"),
        default="pending",
    )
    payment_status = Column(
        SAEnum("not_paid", "deposit_paid", "fully_paid", name="payment_status"),
        default="not_paid",
    )
    payment_amount = Column(__import__('sqlalchemy').Numeric(15, 2), nullable=True)
    comment = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    unit = relationship("Unit", back_populates="bookings")
    user = relationship("User")
