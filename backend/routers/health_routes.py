from fastapi import APIRouter

from backend.ollama_client import (
    MODEL_NAME,
    ollama_health,
)
from backend.database import engine
from sqlalchemy import text


router = APIRouter(
    prefix="/health",
    tags=["Health"],
)


@router.get("")
def health():

    database_online = True
    database_error = None

    try:
        with engine.connect() as connection:
            connection.execute(
                text("SELECT 1")
            )

    except Exception as error:
        database_online = False
        database_error = str(error)

    ollama_status = ollama_health()

    return {
        "status": (
            "healthy"
            if database_online
            and ollama_status["online"]
            else "degraded"
        ),
        "backend": "online",
        "database": {
            "online": database_online,
            "error": database_error,
        },
        "ollama": ollama_status,
        "model": MODEL_NAME,
    }