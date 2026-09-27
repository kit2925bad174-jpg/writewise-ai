from sqlalchemy.orm import Session

from backend.models import User, WritingHistory


def get_profile(
    db: Session,
    user_id: int,
) -> dict:

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise ValueError(
            "User not found."
        )

    histories = (
        db.query(WritingHistory)
        .filter(
            WritingHistory.user_id
            == user_id
        )
        .order_by(
            WritingHistory.created_at.desc()
        )
        .all()
    )

    scores = [
        item.score
        for item in histories
    ]

    mistakes = sum(
        item.mistake_count
        for item in histories
    )

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "created_at": user.created_at.isoformat(),
        "statistics": {
            "total_analyses": len(histories),
            "average_score": (
                round(
                    sum(scores) / len(scores),
                    1,
                )
                if scores
                else 0
            ),
            "best_score": (
                max(scores)
                if scores
                else 0
            ),
            "lowest_score": (
                min(scores)
                if scores
                else 0
            ),
            "total_mistakes": mistakes,
        },
    }