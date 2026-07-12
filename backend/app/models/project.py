from datetime import date, datetime
from typing import Optional
from sqlmodel import SQLModel, Field
from app.models.enums import ProjectStatus


class ProjectBase(SQLModel):
    title: str
    description: Optional[str] = None
    industry_partner_name: str
    faculty_lead_id: Optional[int] = Field(default=None, foreign_key="users.id")
    status: ProjectStatus = Field(default=ProjectStatus.proposed)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget: Optional[float] = None


class IndustryProject(ProjectBase, table=True):
    __tablename__ = "industry_projects"
    id: Optional[int] = Field(default=None, primary_key=True)
    created_by_id: Optional[int] = Field(default=None, foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ProjectCreate(ProjectBase):
    pass


class ProjectRead(ProjectBase):
    id: int
    created_by_id: Optional[int]
    created_at: datetime
    updated_at: datetime


class ProjectStatusUpdate(SQLModel):
    status: ProjectStatus
