from datetime import datetime
from typing import Optional
from pydantic import BaseModel

from app.models.activity import ActivityType


class ActivityCreate(BaseModel):
    type: ActivityType
    subject: str
    body: Optional[str] = None
    contact_id: Optional[int] = None
    lead_id: Optional[int] = None


class ActivityUpdate(BaseModel):
    type: Optional[ActivityType] = None
    subject: Optional[str] = None
    body: Optional[str] = None
    contact_id: Optional[int] = None
    lead_id: Optional[int] = None


class ActivityOut(BaseModel):
    id: int
    type: ActivityType
    subject: str
    body: Optional[str] = None
    contact_id: Optional[int] = None
    lead_id: Optional[int] = None
    created_by: int
    created_at: datetime

    model_config = {"from_attributes": True}


class ActivityPage(BaseModel):
    items: list[ActivityOut]
    total: int
    page: int
    size: int
    pages: int
