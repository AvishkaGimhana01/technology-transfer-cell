from datetime import date, datetime
from typing import Optional
from sqlmodel import SQLModel, Field
from app.models.enums import AgreementType, AgreementStatus


class AgreementBase(SQLModel):
    title: str
    agreement_type: AgreementType = Field(default=AgreementType.other)
    party_name: str
    project_id: Optional[int] = Field(default=None, foreign_key="industry_projects.id")
    file_path: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    reminder_date: Optional[date] = None
    status: AgreementStatus = Field(default=AgreementStatus.draft)


class Agreement(AgreementBase, table=True):
    __tablename__ = "agreements"
    id: Optional[int] = Field(default=None, primary_key=True)
    created_by_id: Optional[int] = Field(default=None, foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AgreementCreate(AgreementBase):
    pass


class AgreementRead(AgreementBase):
    id: int
    created_by_id: Optional[int]
    created_at: datetime
