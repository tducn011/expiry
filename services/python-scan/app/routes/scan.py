from __future__ import annotations

import io
from typing import List, Optional

try:
    from fastapi import APIRouter, File, UploadFile, HTTPException, Header
    router = APIRouter()
except ImportError:
    router = None

from app.schemas.scan import ScanResult, DateCandidate, ScanRequest
from app.scanner.preprocessor import decode_image_bytes, preprocess_image
from app.scanner.date_parser import parse_date_candidates


def extract_ocr_text(image_bytes: bytes) -> str:
    """
    Attempts OCR using pytesseract if installed and tesseract engine is available.
    Returns extracted text string, or empty string on failure.
    """
    try:
        import pytesseract
        from PIL import Image
        img = Image.open(io.BytesIO(image_bytes))
        text = pytesseract.image_to_string(img)
        return text.strip()
    except Exception:
        # OCR engine not connected or not available in current environment
        return ""


if router:
    @router.post("/scan", response_model=ScanResult)
    async def scan_image(
        request: Optional[ScanRequest] = None,
        file: Optional[UploadFile] = File(None),
        x_correlation_id: Optional[str] = Header(None)
    ):
        raw_bytes = b""
        warnings: List[str] = []

        if file:
            raw_bytes = await file.read()
        elif request and request.image_base64:
            try:
                raw_bytes = decode_image_bytes(request.image_base64)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Invalid base64 payload: {e}")
        else:
            raise HTTPException(status_code=400, detail="Missing image file or image_base64 payload")

        processed_bytes, prep_warn = preprocess_image(raw_bytes)
        if prep_warn:
            warnings.append(prep_warn)

        ocr_text = extract_ocr_text(processed_bytes)
        if not ocr_text:
            warnings.append("No text recognized or OCR engine not available; returning empty candidates")

        candidates_raw = parse_date_candidates(ocr_text)
        candidates = [DateCandidate(**c) for c in candidates_raw]

        return ScanResult(
            raw_text=ocr_text,
            candidates=candidates,
            warnings=warnings
        )
