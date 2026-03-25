from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_admin_user
from app.models.user import User
from app.models.contact import Contact
from app.models.lead import Lead, LeadStatus
from app.models.activity import Activity
from app.schemas.auth import UserOut

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    return db.query(User).order_by(User.created_at.asc()).all()


@router.patch("/users/{user_id}/role")
def update_role(
    user_id: int,
    body: dict,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user),
):
    if user_id == current_admin.id:
        raise HTTPException(status_code=400, detail="Cannot change your own role")
    role = body.get("role")
    if role not in ("admin", "member"):
        raise HTTPException(status_code=400, detail="Role must be 'admin' or 'member'")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = role
    db.commit()
    db.refresh(user)
    return UserOut.model_validate(user)


@router.patch("/users/{user_id}/toggle-active")
def toggle_active(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user),
):
    if user_id == current_admin.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return UserOut.model_validate(user)


@router.get("/stats")
def admin_stats(
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    admins = db.query(User).filter(User.role == "admin").count()
    total_contacts = db.query(Contact).count()
    total_leads = db.query(Lead).count()
    total_activities = db.query(Activity).count()
    won = db.query(Lead).filter(Lead.status == LeadStatus.ClosedWon).count()
    lost = db.query(Lead).filter(Lead.status == LeadStatus.ClosedLost).count()

    # Per-user activity summary
    users = db.query(User).filter(User.is_active == True).all()
    user_summary = []
    for u in users:
        contacts = db.query(Contact).filter(Contact.created_by == u.id).count()
        leads = db.query(Lead).filter(Lead.created_by == u.id).count()
        activities = db.query(Activity).filter(Activity.created_by == u.id).count()
        user_summary.append({
            "id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "role": u.role,
            "is_active": u.is_active,
            "contacts": contacts,
            "leads": leads,
            "activities": activities,
        })

    return {
        "total_users": total_users,
        "active_users": active_users,
        "admins": admins,
        "total_contacts": total_contacts,
        "total_leads": total_leads,
        "total_activities": total_activities,
        "won_leads": won,
        "lost_leads": lost,
        "user_summary": user_summary,
    }
