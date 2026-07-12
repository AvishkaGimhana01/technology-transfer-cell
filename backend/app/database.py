from sqlmodel import SQLModel, create_engine, Session
from app.config import settings

engine = create_engine(settings.database_url, echo=False)


def get_session():
    """Dependency generator to provide a database session for requests."""
    with Session(engine) as session:
        yield session


def init_db():
    # import models so SQLModel metadata is aware of every table
    from app.models import (  # noqa: F401
        user, project, agreement, mou, innovation_club, noticeboard, ipr_violation
    )
    SQLModel.metadata.create_all(engine)
