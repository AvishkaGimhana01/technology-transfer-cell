from sqlmodel import SQLModel, create_engine, Session

# Database URL for PostgreSQL running in Docker Desktop
# Connection URL format: postgresql://[user]:[password]@[host]:[port]/[database]
DATABASE_URL = "postgresql://postgres:postgrespassword@localhost:5432/ttc_db"

engine = create_engine(DATABASE_URL, echo=True)

def init_db():
    """Create database tables if they do not exist."""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Dependency generator to provide a database session for requests."""
    with Session(engine) as session:
        yield session
