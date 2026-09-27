from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import WritingHistory


router = APIRouter(
    prefix="/history",
    tags=["History"],
)


@router.get("")
def get_history(
    user_id: int = 1,
    limit: int = 50,
    db: Session = Depends(get_db),
):

    limit = max(
        1,
        min(limit, 100),
    )

    items = (
        db.query(WritingHistory)
        .filter(
            WritingHistory.user_id
            == user_id
        )
        .order_by(
            WritingHistory.created_at.desc()
        )
        .limit(limit)
        .all()
    )

    return {
        "success": True,
        "items": [
            {
                "id": item.id,
                "text": item.original_text,
                "corrected_text": item.corrected_text,
                "mode": item.mode,
                "score": item.score,
                "grammar": item.grammar,
                "spelling": item.spelling,
                "punctuation": item.punctuation,
                "clarity": item.clarity,
                "vocabulary": item.vocabulary,
                "mistake_count": item.mistake_count,
                "date": item.created_at.isoformat(),
            }
            for item in items
        ],
    }


@router.get("/{history_id}")
def get_history_item(
    history_id: int,
    user_id: int = 1,
    db: Session = Depends(get_db),
):

    item = (
        db.query(WritingHistory)
        .filter(
            WritingHistory.id
            == history_id,
            WritingHistory.user_id
            == user_id,
        )
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="History item not found.",
        )

    return {
        "success": True,
        "item": {
            "id": item.id,
            "text": item.original_text,
            "corrected_text": item.corrected_text,
            "mode": item.mode,
            "score": item.score,
            "grammar": item.grammar,
            "spelling": item.spelling,
            "punctuation": item.punctuation,
            "clarity": item.clarity,
            "vocabulary": item.vocabulary,
            "mistake_count": item.mistake_count,
            "date": item.created_at.isoformat(),
        },
    }


@router.delete("/{history_id}")
def delete_history(
    history_id: int,
    user_id: int = 1,
    db: Session = Depends(get_db),
):

    item = (
        db.query(WritingHistory)
        .filter(
            WritingHistory.id
            == history_id,
            WritingHistory.user_id
            == user_id,
        )
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="History item not found.",
        )

    db.delete(item)
    db.commit()

    return {
        "success": True,
        "message": "History item deleted.",
    }


@router.delete("")
def clear_history(
    user_id: int = 1,
    db: Session = Depends(get_db),
):

    (
        db.query(WritingHistory)
        .filter(
            WritingHistory.user_id
            == user_id
        )
        .delete(
            synchronize_session=False
        )
    )

    db.commit()

    return {
        "success": True,
        "message": "Writing history cleared.",
    }