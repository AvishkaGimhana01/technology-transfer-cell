from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.routers import (
    auth, users, projects, agreements, mous, innovation_club, noticeboard, ipr_violations,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Technology Transfer Cell Management System (TTC-MS)", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(projects.router)
app.include_router(agreements.router)
app.include_router(mous.router)
app.include_router(innovation_club.router)
app.include_router(noticeboard.router)
app.include_router(ipr_violations.router)


@app.get("/health")
def health():
    return {"status": "ok"}
