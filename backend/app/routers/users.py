from typing import List
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.database import get_session
from app.models.user import User, UserRead
from app.models.enums import UserRole
from app.core.deps import get_current_user, require_roles

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserRead)
def read_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("", response_model=List[UserRead])
def list_users(
    session: Session = Depends(get_session),
    _: User = Depends(require_roles(UserRole.super_admin, UserRole.ttc_staff)),
):
    return session.exec(select(User)).all()
