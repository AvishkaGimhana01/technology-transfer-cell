from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models.agreement import Agreement, AgreementCreate, AgreementRead
from app.models.user import User
from app.core.deps import get_current_user

router = APIRouter(prefix="/agreements", tags=["Agreement Management"])


@router.get("", response_model=List[AgreementRead])
def list_agreements(session: Session = Depends(get_session)):
    return session.exec(select(Agreement)).all()


@router.post("", response_model=AgreementRead)
def create_agreement(
    payload: AgreementCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    agreement = Agreement(**payload.dict(), created_by_id=current_user.id)
    session.add(agreement)
    session.commit()
    session.refresh(agreement)
    return agreement


@router.get("/{agreement_id}", response_model=AgreementRead)
def get_agreement(agreement_id: int, session: Session = Depends(get_session)):
    agreement = session.get(Agreement, agreement_id)
    if not agreement:
        raise HTTPException(status_code=404, detail="Agreement not found")
    return agreement


@router.patch("/{agreement_id}", response_model=AgreementRead)
def update_agreement(
    agreement_id: int,
    payload: AgreementCreate,
    session: Session = Depends(get_session),
    _: User = Depends(get_current_user),
):
    agreement = session.get(Agreement, agreement_id)
    if not agreement:
        raise HTTPException(status_code=404, detail="Agreement not found")
    
    payload_data = payload.dict(exclude_unset=True)
    for key, value in payload_data.items():
        setattr(agreement, key, value)
    
    session.add(agreement)
    session.commit()
    session.refresh(agreement)
    return agreement


@router.delete("/{agreement_id}")
def delete_agreement(
    agreement_id: int,
    session: Session = Depends(get_session),
    _: User = Depends(get_current_user),
):
    agreement = session.get(Agreement, agreement_id)
    if not agreement:
        raise HTTPException(status_code=404, detail="Agreement not found")
    
    session.delete(agreement)
    session.commit()
    return {"message": "Agreement deleted successfully"}
