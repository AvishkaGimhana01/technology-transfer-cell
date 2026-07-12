from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, text
from database import init_db, get_session

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize the database tables on startup
    try:
        init_db()
        print("Database initialized successfully.")
    except Exception as e:
        print(f"Error initializing database: {e}")
    yield

app = FastAPI(
    title="TTC API",
    description="Technology Transfer Cell API Backend",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration to allow local React frontend to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Technology Transfer Cell API!"}

@app.get("/db-health")
def db_health(session: Session = Depends(get_session)):
    """Verifies connection to the PostgreSQL database container."""
    try:
        result = session.exec(text("SELECT 1")).first()
        # Handle tuple/Row results returning (1,) by checking the first element if indexable
        val = result[0] if hasattr(result, "__getitem__") else result
        if val == 1:
            return {"status": "healthy", "database": "connected"}
        return {"status": "unhealthy", "database": f"unexpected response: {result}"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}
