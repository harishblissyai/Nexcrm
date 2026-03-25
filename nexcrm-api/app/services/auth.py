from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, UpdateProfileRequest


def register_user(db: Session, data: RegisterRequest) -> User:
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    # First user becomes admin automatically
    is_first = db.query(User).count() == 0
    user = User(
        email=data.email,
        full_name=data.full_name,
        hashed_password=hash_password(data.password),
        role="admin" if is_first else "member",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user_profile(db: Session, user: User, data: UpdateProfileRequest) -> User:
    if data.full_name is not None:
        user.full_name = data.full_name.strip()
    if data.new_password:
        if not data.current_password:
            raise HTTPException(status_code=400, detail="Current password is required to set a new password")
        if not verify_password(data.current_password, user.hashed_password):
            raise HTTPException(status_code=400, detail="Current password is incorrect")
        if len(data.new_password) < 6:
            raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
        user.hashed_password = hash_password(data.new_password)
    db.commit()
    db.refresh(user)
    return user


def login_user(db: Session, data: LoginRequest) -> dict:
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}
