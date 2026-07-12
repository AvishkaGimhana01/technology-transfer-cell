from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field
from app.models.enums import ApplicationStatus


class ApplicationBase(SQLModel):
    applicant_name: str
    applicant_email: str
    applicant_type: str = "student"  # student | faculty
    idea_title: str
    idea_description: Optional[str] = None
    status: ApplicationStatus = Field(default=ApplicationStatus.pending)


class InnovationClubApplication(ApplicationBase, table=True):
    __tablename__ = "innovation_club_applications"
    id: Optional[int] = Field(default=None, primary_key=True)
    reviewed_by_id: Optional[int] = Field(default=None, foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationRead(ApplicationBase):
    id: int
    reviewed_by_id: Optional[int]
    created_at: datetime


class ApplicationStatusUpdate(SQLModel):
    status: ApplicationStatus


class InnovationClubMember(SQLModel, table=True):
    __tablename__ = "innovation_club_members"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    role_in_club: str = "member"
    is_active: bool = True
    joined_at: datetime = Field(default_factory=datetime.utcnow)
