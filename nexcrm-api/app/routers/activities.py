from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.activity import ActivityCreate, ActivityUpdate, ActivityOut, ActivityPage
from app.services import activities as svc

router = APIRouter(prefix="/activities", tags=["activities"])


@router.get("/overdue", response_model=list[ActivityOut])
def get_overdue(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return svc.get_overdue_activities(db)


@router.get("/due-today", response_model=list[ActivityOut])
def get_due_today(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return svc.get_due_today_activities(db)


@router.patch("/{activity_id}/done", response_model=ActivityOut)
def mark_done(
    activity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return svc.mark_activity_done(db, activity_id)


@router.get("", response_model=ActivityPage)
def list_activities(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    contact_id: Optional[int] = Query(None),
    lead_id: Optional[int] = Query(None),
    overdue_only: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return svc.list_activities(db, page, size, contact_id, lead_id, overdue_only)


@router.post("", response_model=ActivityOut, status_code=201)
def create_activity(
    data: ActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return svc.create_activity(db, data, current_user.id)


@router.get("/{activity_id}", response_model=ActivityOut)
def get_activity(
    activity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return svc.get_activity(db, activity_id)


@router.put("/{activity_id}", response_model=ActivityOut)
def update_activity(
    activity_id: int,
    data: ActivityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return svc.update_activity(db, activity_id, data)


@router.delete("/{activity_id}", status_code=204)
def delete_activity(
    activity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc.delete_activity(db, activity_id)
