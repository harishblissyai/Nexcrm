from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.contact import Contact
from app.models.lead import Lead
from app.models.user import User
from app.schemas.contact import ContactOut
from app.schemas.lead import LeadOut

router = APIRouter(prefix="/search", tags=["search"])


@router.get("")
def search(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    term = f"%{q}%"

    contacts = (
        db.query(Contact)
        .filter(
            or_(
                Contact.name.ilike(term),
                Contact.email.ilike(term),
                Contact.company.ilike(term),
            )
        )
        .limit(10)
        .all()
    )

    leads = (
        db.query(Lead)
        .filter(
            or_(
                Lead.title.ilike(term),
                Lead.notes.ilike(term),
            )
        )
        .limit(10)
        .all()
    )

    return {
        "contacts": [ContactOut.model_validate(c) for c in contacts],
        "leads": [LeadOut.model_validate(l) for l in leads],
    }
