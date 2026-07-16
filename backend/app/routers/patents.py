from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models.patent import Patent, PatentCreate, PatentRead, PatentStatusUpdate
from app.models.prosecution import ProsecutionEvent, ProsecutionEventCreate, ProsecutionEventRead
from app.models.user import User
from app.models.enums import UserRole
from app.core.deps import get_current_user, require_roles

router = APIRouter(prefix="/patents", tags=["Patent Portfolio"])

@router.get("", response_model=List[PatentRead])
def list_patents(
    status: Optional[str] = None,
    session: Session = Depends(get_session)
):
    query = select(Patent)
    if status:
        query = query.where(Patent.status == status)
    return session.exec(query).all()

@router.post("", response_model=PatentRead)
def create_patent(
    payload: PatentCreate,
    session: Session = Depends(get_session),
    current_user: Optional[User] = Depends(get_current_user)
):
    user_id = current_user.id if current_user else None
    patent = Patent(**payload.dict(), created_by_id=user_id)
    session.add(patent)
    session.commit()
    session.refresh(patent)
    return patent

@router.get("/{patent_id}", response_model=PatentRead)
def get_patent(patent_id: int, session: Session = Depends(get_session)):
    patent = session.get(Patent, patent_id)
    if not patent:
        raise HTTPException(status_code=404, detail="Patent not found")
    return patent

@router.patch("/{patent_id}/status", response_model=PatentRead)
def update_patent_status(
    patent_id: int,
    payload: PatentStatusUpdate,
    session: Session = Depends(get_session),
    _: Optional[User] = Depends(get_current_user)
):
    patent = session.get(Patent, patent_id)
    if not patent:
        raise HTTPException(status_code=404, detail="Patent not found")
    patent.status = payload.status
    session.add(patent)
    session.commit()
    session.refresh(patent)
    return patent

# Prosecution Timeline Events nested under Patents or stand-alone
@router.get("/{patent_id}/timeline", response_model=List[ProsecutionEventRead])
def get_patent_timeline(patent_id: int, session: Session = Depends(get_session)):
    query = select(ProsecutionEvent).where(ProsecutionEvent.patent_id == patent_id).order_by(ProsecutionEvent.event_date.asc())
    return session.exec(query).all()

@router.post("/{patent_id}/timeline", response_model=ProsecutionEventRead)
def add_patent_timeline_event(
    patent_id: int,
    payload: ProsecutionEventCreate,
    session: Session = Depends(get_session),
    _: Optional[User] = Depends(get_current_user)
):
    patent = session.get(Patent, patent_id)
    if not patent:
        raise HTTPException(status_code=404, detail="Patent not found")
    event = ProsecutionEvent(**payload.dict())
    event.patent_id = patent_id
    session.add(event)
    session.commit()
    session.refresh(event)
    return event


@router.patch("/{patent_id}", response_model=PatentRead)
def update_patent(
    patent_id: int,
    payload: PatentCreate,
    session: Session = Depends(get_session),
    _: Optional[User] = Depends(get_current_user),
):
    patent = session.get(Patent, patent_id)
    if not patent:
        raise HTTPException(status_code=404, detail="Patent not found")
    
    payload_data = payload.dict(exclude_unset=True)
    for key, value in payload_data.items():
        setattr(patent, key, value)
    
    session.add(patent)
    session.commit()
    session.refresh(patent)
    return patent


@router.delete("/{patent_id}")
def delete_patent(
    patent_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_roles(UserRole.super_admin, UserRole.ttc_staff)),
):
    patent = session.get(Patent, patent_id)
    if not patent:
        raise HTTPException(status_code=404, detail="Patent not found")
    
    # Cascade delete timeline events
    events = session.exec(select(ProsecutionEvent).where(ProsecutionEvent.patent_id == patent_id)).all()
    for event in events:
        session.delete(event)
        
    session.delete(patent)
    session.commit()
    return {"message": "Patent and related timeline events deleted successfully"}
