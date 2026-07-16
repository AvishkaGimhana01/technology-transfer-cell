from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models.mou import Mou, MouCreate, MouRead
from app.models.user import User
from app.core.deps import get_current_user

router = APIRouter(prefix="/mous", tags=["MOU Signing"])


@router.get("", response_model=List[MouRead])
def list_mous(session: Session = Depends(get_session)):
    return session.exec(select(Mou)).all()


@router.post("", response_model=MouRead)
def create_mou(
    payload: MouCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    mou = Mou(**payload.dict(), created_by_id=current_user.id)
    session.add(mou)
    session.commit()
    session.refresh(mou)
    return mou


@router.get("/{mou_id}", response_model=MouRead)
def get_mou(mou_id: int, session: Session = Depends(get_session)):
    mou = session.get(Mou, mou_id)
    if not mou:
        raise HTTPException(status_code=404, detail="MOU not found")
    return mou
