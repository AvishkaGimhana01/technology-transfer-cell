from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models.project import IndustryProject, ProjectCreate, ProjectRead, ProjectStatusUpdate
from app.models.enums import ProjectStatus
from app.models.user import User
from app.core.deps import get_current_user

router = APIRouter(prefix="/projects", tags=["Industry Projects & Consultancy"])


@router.get("", response_model=List[ProjectRead])
def list_projects(
    status: Optional[ProjectStatus] = None,
    session: Session = Depends(get_session),
):
    query = select(IndustryProject)
    if status:
        query = query.where(IndustryProject.status == status)
    return session.exec(query).all()


@router.post("", response_model=ProjectRead)
def create_project(
    payload: ProjectCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    project = IndustryProject(**payload.dict(), created_by_id=current_user.id)
    session.add(project)
    session.commit()
    session.refresh(project)
    return project


@router.get("/{project_id}", response_model=ProjectRead)
def get_project(project_id: int, session: Session = Depends(get_session)):
    project = session.get(IndustryProject, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.patch("/{project_id}/status", response_model=ProjectRead)
def update_project_status(
    project_id: int,
    payload: ProjectStatusUpdate,
    session: Session = Depends(get_session),
    _: User = Depends(get_current_user),
):
    project = session.get(IndustryProject, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    project.status = payload.status
    session.add(project)
    session.commit()
    session.refresh(project)
    return project
