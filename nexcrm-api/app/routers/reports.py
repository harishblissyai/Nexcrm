from collections import defaultdict
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.activity import Activity, ActivityType
from app.models.contact import Contact
from app.models.lead import Lead, LeadStatus
from app.models.user import User

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/overview")
def get_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total_contacts = db.query(Contact).count()
    total_leads = db.query(Lead).count()
    total_activities = db.query(Activity).count()

    won = db.query(Lead).filter(Lead.status == LeadStatus.ClosedWon).count()
    lost = db.query(Lead).filter(Lead.status == LeadStatus.ClosedLost).count()
    closed = won + lost
    win_rate = round((won / closed * 100), 1) if closed else 0

    total_value = db.query(Lead).filter(Lead.status == LeadStatus.ClosedWon).all()
    pipeline_value = sum(l.value or 0 for l in db.query(Lead).filter(
        Lead.status.in_([LeadStatus.New, LeadStatus.Contacted, LeadStatus.Qualified])
    ).all())
    won_value = sum(l.value or 0 for l in total_value)

    # New this month
    start_of_month = datetime.now().replace(day=1, hour=0, minute=0, second=0)
    new_contacts_this_month = db.query(Contact).filter(Contact.created_at >= start_of_month).count()
    new_leads_this_month = db.query(Lead).filter(Lead.created_at >= start_of_month).count()

    return {
        "total_contacts": total_contacts,
        "total_leads": total_leads,
        "total_activities": total_activities,
        "win_rate": win_rate,
        "pipeline_value": pipeline_value,
        "won_value": won_value,
        "new_contacts_this_month": new_contacts_this_month,
        "new_leads_this_month": new_leads_this_month,
    }


@router.get("/leads-by-month")
def leads_by_month(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Leads and contacts created per month for the last 6 months."""
    months = []
    now = datetime.now()
    for i in range(5, -1, -1):
        d = (now.replace(day=1) - timedelta(days=i * 28)).replace(day=1)
        months.append(d)

    result = []
    for m_start in months:
        if m_start.month == 12:
            m_end = m_start.replace(year=m_start.year + 1, month=1)
        else:
            m_end = m_start.replace(month=m_start.month + 1)

        leads_count = db.query(Lead).filter(
            Lead.created_at >= m_start, Lead.created_at < m_end
        ).count()
        contacts_count = db.query(Contact).filter(
            Contact.created_at >= m_start, Contact.created_at < m_end
        ).count()
        result.append({
            "month": m_start.strftime("%b %Y"),
            "leads": leads_count,
            "contacts": contacts_count,
        })

    return result


@router.get("/conversion-funnel")
def conversion_funnel(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lead counts per status stage."""
    order = [LeadStatus.New, LeadStatus.Contacted, LeadStatus.Qualified,
             LeadStatus.ClosedWon, LeadStatus.ClosedLost]
    labels = {"New": "New", "Contacted": "Contacted", "Qualified": "Qualified",
              "ClosedWon": "Closed Won", "ClosedLost": "Closed Lost"}
    colors = {"New": "#6366f1", "Contacted": "#3b82f6", "Qualified": "#f59e0b",
              "ClosedWon": "#22c55e", "ClosedLost": "#ef4444"}

    result = []
    for status in order:
        count = db.query(Lead).filter(Lead.status == status).count()
        result.append({
            "status": labels[status.value],
            "count": count,
            "fill": colors[status.value],
        })
    return result


@router.get("/activity-breakdown")
def activity_breakdown(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Count of activities per type."""
    colors = {"Call": "#3b82f6", "Email": "#8b5cf6", "Meeting": "#f59e0b", "Note": "#6b7280"}
    result = []
    for atype in ActivityType:
        count = db.query(Activity).filter(Activity.type == atype).count()
        result.append({"name": atype.value, "value": count, "fill": colors[atype.value]})
    return result


@router.get("/top-tags")
def top_tags(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Top 10 tags across contacts and leads."""
    tag_count: dict[str, int] = defaultdict(int)

    for contact in db.query(Contact).all():
        for tag in (contact.tags or []):
            tag_count[tag] += 1

    for lead in db.query(Lead).all():
        for tag in (lead.tags or []):
            tag_count[tag] += 1

    sorted_tags = sorted(tag_count.items(), key=lambda x: x[1], reverse=True)[:10]
    return [{"tag": t, "count": c} for t, c in sorted_tags]
