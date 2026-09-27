from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.services.profile_service import (
    get_profile,
)


router = APIRouter(
    prefix="/profile",
    tags=["Profile"],
)


@router.get("")
def profile(
    user_id: int = 1,
    db: Session = Depends(get_db),
):

    try:
        return {
            "success": True,
            "profile": get_profile(
                db,
                user_id,
            ),
        }

    except ValueError as error:

        raise HTTPException(
            status_code=404,
            detail=str(error),
        )