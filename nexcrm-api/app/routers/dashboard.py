from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.activity import Activity
from app.models.contact import Contact
from app.models.lead import Lead, LeadStatus
from app.models.user import User
from app.schemas.activity import ActivityOut
from app.services.activities import get_overdue_activities, get_due_today_activities

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total_contacts = db.query(Contact).count()
    total_leads = db.query(Lead).count()

    leads_by_status = {}
    for status in LeadStatus:
        leads_by_status[status.value] = db.query(Lead).filter(Lead.status == status).count()

    recent = (
        db.query(Activity)
        .order_by(Activity.created_at.desc())
        .limit(5)
        .all()
    )

    overdue = get_overdue_activities(db)
    due_today = get_due_today_activities(db)

    return {
        "total_contacts": total_contacts,
        "total_leads": total_leads,
        "leads_by_status": leads_by_status,
        "recent_activities": [ActivityOut.model_validate(a) for a in recent],
        "overdue_count": len(overdue),
        "due_today_count": len(due_today),
        "overdue_tasks": [ActivityOut.model_validate(a) for a in overdue[:5]],
        "due_today_tasks": [ActivityOut.model_validate(a) for a in due_today[:5]],
    }
