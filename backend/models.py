from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from backend.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(180),
        unique=True,
        index=True,
        nullable=False,
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )


class WritingHistory(Base):
    __tablename__ = "writing_history"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        Integer,
        index=True,
        nullable=False,
    )

    original_text: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    corrected_text: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    mode: Mapped[str] = mapped_column(
        String(50),
        default="General",
        nullable=False,
    )

    score: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    grammar: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    spelling: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    punctuation: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    clarity: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    vocabulary: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    mistake_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )