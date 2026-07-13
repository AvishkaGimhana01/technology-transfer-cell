from datetime import date, datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class PatentBase(SQLModel):
    title: str
    patent_number: str = Field(index=True, unique=True) # e.g. PAT-8841
    jurisdiction: str # e.g. US / PCT, EP, IN
    assignee: str # e.g. Technology Transfer Cell
    attorney: str
    filing_date: Optional[date] = None
    next_due_date: Optional[date] = None
    status: str = Field(default="drafting") # office_action, filed, granted, drafting
    budget: Optional[float] = None
    claims_text: Optional[str] = None
    legal_notes: Optional[str] = None

class Patent(PatentBase, table=True):
    __tablename__ = "patents"
    id: Optional[int] = Field(default=None, primary_key=True)
    created_by_id: Optional[int] = Field(default=None, foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PatentCreate(PatentBase):
    pass

class PatentRead(PatentBase):
    id: int
    created_by_id: Optional[int]
    created_at: datetime

class PatentStatusUpdate(SQLModel):
    status: str
