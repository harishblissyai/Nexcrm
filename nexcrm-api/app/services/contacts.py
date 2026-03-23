import math
from fastapi import HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.contact import Contact
from app.schemas.contact import ContactCreate, ContactUpdate


def list_contacts(db: Session, user_id: int, page: int, size: int, search: str | None):
    q = db.query(Contact)
    if search:
        term = f"%{search}%"
        q = q.filter(
            or_(
                Contact.name.ilike(term),
                Contact.email.ilike(term),
                Contact.company.ilike(term),
            )
        )
    total = q.count()
    items = q.order_by(Contact.created_at.desc()).offset((page - 1) * size).limit(size).all()
    return {"items": items, "total": total, "page": page, "size": size, "pages": math.ceil(total / size) if total else 1}


def create_contact(db: Session, data: ContactCreate, user_id: int) -> Contact:
    contact = Contact(**data.model_dump(), created_by=user_id)
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact


def get_contact(db: Session, contact_id: int) -> Contact:
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact


def update_contact(db: Session, contact_id: int, data: ContactUpdate) -> Contact:
    contact = get_contact(db, contact_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(contact, field, value)
    db.commit()
    db.refresh(contact)
    return contact


def delete_contact(db: Session, contact_id: int) -> None:
    contact = get_contact(db, contact_id)
    db.delete(contact)
    db.commit()
