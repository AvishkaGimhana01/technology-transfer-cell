from datetime import date, datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class ProsecutionEventBase(SQLModel):
    patent_id: int = Field(foreign_key="patents.id")
    event_title: str # e.g. "Provisional filing converted to PCT pathway"
    event_date: date
    notes: Optional[str] = None

class ProsecutionEvent(ProsecutionEventBase, table=True):
    __tablename__ = "prosecution_events"
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ProsecutionEventCreate(ProsecutionEventBase):
    pass

class ProsecutionEventRead(ProsecutionEventBase):
    id: int
    created_at: datetime
