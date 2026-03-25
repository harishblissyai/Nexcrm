import math
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.activity import Activity
from app.schemas.activity import ActivityCreate, ActivityUpdate


def list_activities(db: Session, page: int, size: int, contact_id: int | None, lead_id: int | None, overdue_only: bool = False):
    q = db.query(Activity)
    if contact_id:
        q = q.filter(Activity.contact_id == contact_id)
    if lead_id:
        q = q.filter(Activity.lead_id == lead_id)
    if overdue_only:
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        q = q.filter(Activity.due_date < now, Activity.is_done == False)
    total = q.count()
    items = q.order_by(Activity.created_at.desc()).offset((page - 1) * size).limit(size).all()
    return {"items": items, "total": total, "page": page, "size": size, "pages": math.ceil(total / size) if total else 1}


def get_overdue_activities(db: Session) -> list[Activity]:
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    return (
        db.query(Activity)
        .filter(Activity.due_date < now, Activity.is_done == False)
        .order_by(Activity.due_date.asc())
        .all()
    )


def get_due_today_activities(db: Session) -> list[Activity]:
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    return (
        db.query(Activity)
        .filter(Activity.due_date >= today_start, Activity.due_date < today_end, Activity.is_done == False)
        .order_by(Activity.due_date.asc())
        .all()
    )


def mark_activity_done(db: Session, activity_id: int) -> Activity:
    activity = get_activity(db, activity_id)
    activity.is_done = True
    db.commit()
    db.refresh(activity)
    return activity


def create_activity(db: Session, data: ActivityCreate, user_id: int) -> Activity:
    activity = Activity(**data.model_dump(), created_by=user_id)
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


def get_activity(db: Session, activity_id: int) -> Activity:
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    return activity


def update_activity(db: Session, activity_id: int, data: ActivityUpdate) -> Activity:
    activity = get_activity(db, activity_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(activity, field, value)
    db.commit()
    db.refresh(activity)
    return activity


def delete_activity(db: Session, activity_id: int) -> None:
    activity = get_activity(db, activity_id)
    db.delete(activity)
    db.commit()
