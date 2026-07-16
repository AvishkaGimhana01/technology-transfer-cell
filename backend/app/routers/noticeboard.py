from typing import List
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.database import get_session
from app.models.noticeboard import NoticeboardPost, NoticeboardPostCreate, NoticeboardPostRead
from app.models.user import User
from app.core.deps import get_current_user

router = APIRouter(prefix="/noticeboard", tags=["Virtual Noticeboard"])


@router.get("", response_model=List[NoticeboardPostRead])
def list_posts(session: Session = Depends(get_session)):
    return session.exec(
        select(NoticeboardPost).where(NoticeboardPost.is_published == True)  # noqa: E712
    ).all()


@router.post("", response_model=NoticeboardPostRead)
def create_post(
    payload: NoticeboardPostCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    post = NoticeboardPost(**payload.dict(), posted_by_id=current_user.id)
    session.add(post)
    session.commit()
    session.refresh(post)
    return post
