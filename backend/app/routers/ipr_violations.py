from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models.ipr_violation import (
    IPRViolationReport, IPRViolationCreate, IPRViolationRead, IPRViolationStatusUpdate,
)
from app.models.user import User
from app.models.enums import UserRole
from app.core.deps import get_current_user, require_roles

router = APIRouter(prefix="/ipr-violations", tags=["IPR Violation Repository"])


@router.post("", response_model=IPRViolationRead)
def report_violation(
    payload: IPRViolationCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    report = IPRViolationReport(**payload.dict(), reported_by_id=current_user.id)
    session.add(report)
    session.commit()
    session.refresh(report)
    return report


@router.get("", response_model=List[IPRViolationRead])
def list_violations(
    session: Session = Depends(get_session),
    _: User = Depends(require_roles(UserRole.super_admin, UserRole.ttc_staff)),
):
    # Access-controlled per the slide deck: only Super Admin / TTC Staff can view.
    return session.exec(select(IPRViolationReport)).all()


@router.patch("/{report_id}/status", response_model=IPRViolationRead)
def update_violation_status(
    report_id: int,
    payload: IPRViolationStatusUpdate,
    session: Session = Depends(get_session),
    _: User = Depends(require_roles(UserRole.super_admin, UserRole.ttc_staff)),
):
    report = session.get(IPRViolationReport, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    report.status = payload.status
    session.add(report)
    session.commit()
    session.refresh(report)
    return report
