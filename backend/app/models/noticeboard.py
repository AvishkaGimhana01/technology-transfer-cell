from datetime import date, datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class NoticeboardPostBase(SQLModel):
    title: str
    content: str
    category: Optional[str] = None
    is_published: bool = True
    publish_date: Optional[date] = None
    expiry_date: Optional[date] = None


class NoticeboardPost(NoticeboardPostBase, table=True):
    __tablename__ = "noticeboard_posts"
    id: Optional[int] = Field(default=None, primary_key=True)
    posted_by_id: Optional[int] = Field(default=None, foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)


class NoticeboardPostCreate(NoticeboardPostBase):
    pass


class NoticeboardPostRead(NoticeboardPostBase):
    id: int
    posted_by_id: Optional[int]
    created_at: datetime
