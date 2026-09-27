from io import BytesIO
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi import File, UploadFile
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import WritingHistory
from backend.ollama_client import analyze_with_ollama
from backend.services.analysis_service import (
    build_analysis_result,
    build_fallback_result,
)


router = APIRouter(
    tags=["Analysis"],
)


MAX_ANALYSIS_CHARACTERS = 15000
MAX_RESUME_FILE_BYTES = 5 * 1024 * 1024
MAX_OCR_PAGES = 15


def extract_pdf_text(content: bytes) -> str:
    from pypdf import PdfReader

    reader = PdfReader(BytesIO(content))
    if reader.is_encrypted:
        raise HTTPException(
            status_code=400,
            detail="Password-protected PDF files are not supported.",
        )

    page_texts = [
        page.extract_text() or ""
        for page in reader.pages
    ]
    scanned_pages = [
        index
        for index, page_text in enumerate(page_texts)
        if not page_text.strip()
    ]

    if not scanned_pages:
        return "\n".join(page_texts)
    if len(scanned_pages) > MAX_OCR_PAGES:
        raise HTTPException(
            status_code=413,
            detail=f"This PDF has more than {MAX_OCR_PAGES} scanned pages. Upload a shorter section to review.",
        )

    try:
        import numpy as np
        import pymupdf
        from rapidocr_onnxruntime import RapidOCR
    except ImportError as error:
        raise HTTPException(
            status_code=503,
            detail="Scanned PDF support is not installed. Run pip install -r backend/requirements.txt, then restart the backend.",
        ) from error

    document = pymupdf.open(
        stream=content,
        filetype="pdf",
    )
    ocr = RapidOCR()

    for index in scanned_pages:
        pixmap = document[index].get_pixmap(
            matrix=pymupdf.Matrix(2, 2),
            alpha=False,
        )
        image = np.frombuffer(
            pixmap.samples,
            dtype=np.uint8,
        ).reshape(
            pixmap.height,
            pixmap.width,
            pixmap.n,
        )
        lines, _ = ocr(image)
        if lines:
            ordered_lines = sorted(
                lines,
                key=lambda item: min(
                    point[1]
                    for point in item[0]
                ),
            )
            page_texts[index] = "\n".join(
                str(item[1]).strip()
                for item in ordered_lines
                if len(item) > 1 and str(item[1]).strip()
            )

    document.close()
    return "\n".join(page_texts)


class AnalyzeRequest(BaseModel):

    text: str = Field(
        min_length=1,
        max_length=MAX_ANALYSIS_CHARACTERS,
    )

    mode: str = Field(
        default="General",
        max_length=50,
    )

    user_id: int = Field(
        default=1,
        ge=1,
    )


def perform_analysis(
    request: AnalyzeRequest,
    db: Session,
):

    text = request.text.strip()

    if not text:
        raise HTTPException(
            status_code=400,
            detail="Please enter some text to analyze.",
        )

    try:

        raw_result = analyze_with_ollama(
            text=text,
            mode=request.mode,
        )

        analysis = build_analysis_result(
            original_text=text,
            raw_result=raw_result,
            ai_available=True,
        )

    except Exception as error:

        print(
            f"Ollama analysis error: {error}"
        )

        analysis = build_fallback_result(
            text
        )

    if request.mode.lower() == "resume":
        analysis["summary"] = (
            "Review the listed corrections and confirm names, dates, links, "
            "and metrics against the original resume."
        )

    history = WritingHistory(
        user_id=request.user_id,
        original_text=text,
        corrected_text=analysis[
            "corrected_text"
        ],
        mode=request.mode,
        score=analysis["score"],
        grammar=analysis["grammar"],
        spelling=analysis["spelling"],
        punctuation=analysis[
            "punctuation"
        ],
        clarity=analysis["clarity"],
        vocabulary=analysis[
            "vocabulary"
        ],
        mistake_count=len(
            analysis["mistakes"]
        ),
    )

    db.add(history)
    db.commit()

    analysis["history_id"] = history.id

    return {
        "success": True,
        "analysis": analysis,
    }


@router.post("/analyze")
def analyze_compatibility(
    request: AnalyzeRequest,
    db: Session = Depends(get_db),
):

    return perform_analysis(
        request,
        db,
    )


@router.post("/analysis")
def analyze_modular(
    request: AnalyzeRequest,
    db: Session = Depends(get_db),
):

    return perform_analysis(
        request,
        db,
    )


@router.post("/resume/extract")
async def extract_resume(
    file: UploadFile = File(...),
):

    extension = Path(file.filename or "").suffix.lower()
    if extension not in {".pdf", ".docx", ".txt"}:
        raise HTTPException(
            status_code=400,
            detail="Upload a PDF, DOCX, or TXT resume file.",
        )

    content = await file.read(MAX_RESUME_FILE_BYTES + 1)
    if not content:
        raise HTTPException(
            status_code=400,
            detail="The selected resume file is empty.",
        )
    if len(content) > MAX_RESUME_FILE_BYTES:
        raise HTTPException(
            status_code=413,
            detail="Resume files must be 5 MB or smaller.",
        )

    try:
        if extension == ".txt":
            text = content.decode("utf-8-sig")
        elif extension == ".pdf":
            try:
                from pypdf import PdfReader
            except ImportError as error:
                raise HTTPException(
                    status_code=503,
                    detail="PDF resume support is not installed. Run pip install -r backend/requirements.txt, then restart the backend.",
                ) from error

            text = extract_pdf_text(content)
        else:
            try:
                from docx import Document
            except ImportError as error:
                raise HTTPException(
                    status_code=503,
                    detail="DOCX resume support is not installed. Run pip install -r backend/requirements.txt, then restart the backend.",
                ) from error

            document = Document(BytesIO(content))
            paragraphs = [
                paragraph.text
                for paragraph in document.paragraphs
                if paragraph.text.strip()
            ]
            table_rows = [
                " | ".join(cell.text.strip() for cell in row.cells)
                for table in document.tables
                for row in table.rows
            ]
            text = "\n".join(paragraphs + table_rows)
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail="We could not read this file. Check that it is a valid, text-based PDF, DOCX, or UTF-8 TXT file.",
        ) from error

    text = text.strip()
    if not text:
        raise HTTPException(
            status_code=400,
            detail="No readable text was found in this file. Check that the document contains clear, visible text.",
        )
    if len(text) > MAX_ANALYSIS_CHARACTERS:
        raise HTTPException(
            status_code=413,
            detail=f"This resume has more than {MAX_ANALYSIS_CHARACTERS:,} characters. Upload a shorter version or paste a section to review.",
        )

    return {
        "success": True,
        "filename": file.filename,
        "text": text,
    }