from fastapi import APIRouter
from pydantic import BaseModel, Field

from backend.services.learning_service import (
    generate_practice,
)


router = APIRouter(
    prefix="/learning",
    tags=["Learning"],
)


class PracticeRequest(BaseModel):

    mistakes: list[dict] = Field(
        default_factory=list
    )

    excluded_questions: list[str] = Field(
        default_factory=list
    )


@router.post("/practice")
def practice(
    request: PracticeRequest,
):

    return {
        "success": True,
        **generate_practice(
            request.mistakes,
            request.excluded_questions,
        ),
    }