import enum
from datetime import datetime
from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ActivityType(str, enum.Enum):
    Call = "Call"
    Email = "Email"
    Meeting = "Meeting"
    Note = "Note"


class Activity(Base):
    __tablename__ = "activities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    type: Mapped[ActivityType] = mapped_column(Enum(ActivityType), nullable=False)
    subject: Mapped[str] = mapped_column(String, nullable=False)
    body: Mapped[str | None] = mapped_column(Text, nullable=True)
    due_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, index=True)
    is_done: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    contact_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("contacts.id"), nullable=True)
    lead_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("leads.id"), nullable=True)
    created_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    contact = relationship("Contact", back_populates="activities")
    lead = relationship("Lead", back_populates="activities")
