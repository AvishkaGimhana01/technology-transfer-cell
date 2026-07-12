from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models.innovation_club import (
    InnovationClubApplication, ApplicationCreate, ApplicationRead, ApplicationStatusUpdate,
)
from app.models.user import User
from app.models.enums import UserRole
from app.core.deps import get_current_user, require_roles

router = APIRouter(prefix="/innovation-club", tags=["Innovation Club"])


@router.post("/apply", response_model=ApplicationRead)
def apply(payload: ApplicationCreate, session: Session = Depends(get_session)):
    application = InnovationClubApplication(**payload.dict())
    session.add(application)
    session.commit()
    session.refresh(application)
    return application


@router.get("/applications", response_model=List[ApplicationRead])
def list_applications(
    session: Session = Depends(get_session),
    _: User = Depends(require_roles(UserRole.super_admin, UserRole.ttc_staff)),
):
    return session.exec(select(InnovationClubApplication)).all()


@router.patch("/applications/{application_id}/status", response_model=ApplicationRead)
def review_application(
    application_id: int,
    payload: ApplicationStatusUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_roles(UserRole.super_admin, UserRole.ttc_staff)),
):
    application = session.get(InnovationClubApplication, application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    application.status = payload.status
    application.reviewed_by_id = current_user.id
    session.add(application)
    session.commit()
    session.refresh(application)
    return application
