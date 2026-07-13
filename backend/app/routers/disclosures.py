from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models.disclosure import InventionDisclosure, DisclosureCreate, DisclosureRead, DisclosureStatusUpdate
from app.models.user import User
from app.core.deps import get_current_user

router = APIRouter(prefix="/disclosures", tags=["Invention Disclosures"])

@router.get("", response_model=List[DisclosureRead])
def list_disclosures(
    status: Optional[str] = None,
    session: Session = Depends(get_session)
):
    query = select(InventionDisclosure)
    if status:
        query = query.where(InventionDisclosure.status == status)
    return session.exec(query).all()

@router.post("", response_model=DisclosureRead)
def create_disclosure(
    payload: DisclosureCreate,
    session: Session = Depends(get_session),
    current_user: Optional[User] = Depends(get_current_user)
):
    user_id = current_user.id if current_user else None
    disclosure = InventionDisclosure(**payload.dict(), created_by_id=user_id)
    session.add(disclosure)
    session.commit()
    session.refresh(disclosure)
    return disclosure

@router.get("/{disclosure_id}", response_model=DisclosureRead)
def get_disclosure(disclosure_id: int, session: Session = Depends(get_session)):
    disclosure = session.get(InventionDisclosure, disclosure_id)
    if not disclosure:
        raise HTTPException(status_code=404, detail="Disclosure not found")
    return disclosure

@router.patch("/{disclosure_id}/status", response_model=DisclosureRead)
def update_disclosure_status(
    disclosure_id: int,
    payload: DisclosureStatusUpdate,
    session: Session = Depends(get_session),
    _: Optional[User] = Depends(get_current_user)
):
    disclosure = session.get(InventionDisclosure, disclosure_id)
    if not disclosure:
        raise HTTPException(status_code=404, detail="Disclosure not found")
    disclosure.status = payload.status
    session.add(disclosure)
    session.commit()
    session.refresh(disclosure)
    return disclosure
