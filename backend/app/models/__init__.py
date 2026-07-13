from app.models.user import User, UserCreate, UserRead, UserLogin
from app.models.project import IndustryProject, ProjectCreate, ProjectRead, ProjectStatusUpdate
from app.models.agreement import Agreement, AgreementCreate, AgreementRead
from app.models.mou import Mou, MouCreate, MouRead
from app.models.innovation_club import (
    InnovationClubApplication, ApplicationCreate, ApplicationRead,
    ApplicationStatusUpdate, InnovationClubMember,
)
from app.models.noticeboard import NoticeboardPost, NoticeboardPostCreate, NoticeboardPostRead
from app.models.ipr_violation import (
    IPRViolationReport, IPRViolationCreate, IPRViolationRead, IPRViolationStatusUpdate,
)

# New IP Management Models
from app.models.disclosure import InventionDisclosure, DisclosureCreate, DisclosureRead, DisclosureStatusUpdate
from app.models.patent import Patent, PatentCreate, PatentRead, PatentStatusUpdate
from app.models.prosecution import ProsecutionEvent, ProsecutionEventCreate, ProsecutionEventRead
from app.models.deadline import Deadline, DeadlineCreate, DeadlineRead, DeadlineStatusUpdate
from app.models.license import License, LicenseCreate, LicenseRead, LicenseStatusUpdate

__all__ = [
    "User", "UserCreate", "UserRead", "UserLogin",
    "IndustryProject", "ProjectCreate", "ProjectRead", "ProjectStatusUpdate",
    "Agreement", "AgreementCreate", "AgreementRead",
    "Mou", "MouCreate", "MouRead",
    "InnovationClubApplication", "ApplicationCreate", "ApplicationRead",
    "ApplicationStatusUpdate", "InnovationClubMember",
    "NoticeboardPost", "NoticeboardPostCreate", "NoticeboardPostRead",
    "IPRViolationReport", "IPRViolationCreate", "IPRViolationRead", "IPRViolationStatusUpdate",
    
    # New IP Management Models
    "InventionDisclosure", "DisclosureCreate", "DisclosureRead", "DisclosureStatusUpdate",
    "Patent", "PatentCreate", "PatentRead", "PatentStatusUpdate",
    "ProsecutionEvent", "ProsecutionEventCreate", "ProsecutionEventRead",
    "Deadline", "DeadlineCreate", "DeadlineRead", "DeadlineStatusUpdate",
    "License", "LicenseCreate", "LicenseRead", "LicenseStatusUpdate",
]
