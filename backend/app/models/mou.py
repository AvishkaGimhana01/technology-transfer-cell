from datetime import date, datetime
from typing import Optional
from sqlmodel import SQLModel, Field
from app.models.enums import MouStatus


class MouBase(SQLModel):
    title: str
    partner_organization: str
    signatory_internal: Optional[str] = None
    signatory_external: Optional[str] = None
    status: MouStatus = Field(default=MouStatus.draft)
    sign_date: Optional[date] = None
    expiry_date: Optional[date] = None
    file_path: Optional[str] = None


class Mou(MouBase, table=True):
    __tablename__ = "mous"
    id: Optional[int] = Field(default=None, primary_key=True)
    created_by_id: Optional[int] = Field(default=None, foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)


class MouCreate(MouBase):
    pass


class MouRead(MouBase):
    id: int
    created_by_id: Optional[int]
    created_at: datetime
