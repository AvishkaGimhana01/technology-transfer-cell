from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field
from app.models.enums import UserRole


class UserBase(SQLModel):
    full_name: str
    email: str = Field(index=True, unique=True)
    role: UserRole = Field(default=UserRole.faculty)
    department: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool = True


class User(UserBase, table=True):
    __tablename__ = "users"
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    id: int
    created_at: datetime


class UserLogin(SQLModel):
    email: str
    password: str


class UserUpdate(SQLModel):
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

