# schemas.py

from typing import Any

from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):

    text: str = Field(
        min_length=1
    )

    mode: str = "General"


class ErrorItem(BaseModel):

    type: str

    original: str

    correction: str

    explanation: str


class SuggestionItem(BaseModel):

    original: str

    suggestion: str

    reason: str


class AnalysisResponse(BaseModel):

    id: int | None = None

    corrected_text: str

    score: int

    grammar_score: int = 0

    spelling_score: int = 0

    punctuation_score: int = 0

    clarity_score: int = 0

    vocabulary_score: int = 0

    errors: list[ErrorItem] = []

    suggestions: list[SuggestionItem] = []

    strengths: list[str] = []

    learning_topics: list[str] = []

    practice_question: str = ""