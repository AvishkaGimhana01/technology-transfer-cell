from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field
from app.models.enums import ViolationStatus, ViolationSeverity


class IPRViolationBase(SQLModel):
    title: str
    description: str
    related_patent_or_project: Optional[str] = None
    severity: ViolationSeverity = Field(default=ViolationSeverity.medium)
    status: ViolationStatus = Field(default=ViolationStatus.reported)


class IPRViolationReport(IPRViolationBase, table=True):
    __tablename__ = "ipr_violation_reports"
    id: Optional[int] = Field(default=None, primary_key=True)
    reported_by_id: Optional[int] = Field(default=None, foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None


class IPRViolationCreate(IPRViolationBase):
    pass


class IPRViolationRead(IPRViolationBase):
    id: int
    reported_by_id: Optional[int]
    created_at: datetime
    resolved_at: Optional[datetime]


class IPRViolationStatusUpdate(SQLModel):
    status: ViolationStatus
