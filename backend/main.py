from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import the database and models using the backend package
from backend.database import init_db
from backend import models

# Import all routers using the backend package
from backend.routers.auth_routes import router as auth_router
from backend.routers.analysis_routes import router as analysis_router
from backend.routers.health_routes import router as health_router
from backend.routers.history_routes import router as history_router
from backend.routers.learning_routes import router as learning_router
from backend.routers.profile_routes import router as profile_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Runs when the FastAPI application starts.
    Creates the SQLite database tables if they do not exist.
    """
    init_db()
    yield


app = FastAPI(
    title="WriteWise AI",
    description="AI-powered Grammar, Spell Checking and Writing Assistant",
    version="1.0.0",
    lifespan=lifespan,
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"^https?://(?:localhost|127\.0\.0\.1):(?:517[3-9]|51[89]\d)$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():
    return {
        "message": "WriteWise AI backend is running",
        "status": "success",
        "docs": "/docs",
    }


# =========================================================
# ROUTERS
# =========================================================

app.include_router(auth_router)
app.include_router(analysis_router)
app.include_router(health_router)
app.include_router(history_router)
app.include_router(learning_router)
app.include_router(profile_router)