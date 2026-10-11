from __future__ import annotations

import io
import json
import os
import shutil
import time
import pytesseract
from PIL import Image
from fastapi import APIRouter, Request
from starlette.datastructures import UploadFile
from starlette.concurrency import run_in_threadpool
from starlette.exceptions import HTTPException
from app.schemas.scan import ScanResult, ScanError
from app.scanner.preprocessor import MAX_IMAGE_BYTES, MAX_ENCODED_BYTES, decode_image_bytes, preprocess_image
from app.scanner.date_parser import normalized_candidates

router = APIRouter()
OCR_TIMEOUT_SECONDS = 2.5
MAX_REQUEST_BYTES = MAX_ENCODED_BYTES + 65536
SUPPORTED_MEDIA = {"image/jpeg", "image/png", "image/webp"}


def tesseract_available() -> bool:
    return shutil.which(pytesseract.pytesseract.tesseract_cmd) is not None


def extract_ocr_text(image_bytes: bytes) -> str:
    if not tesseract_available():
        raise ScanError(503, "OCR_ENGINE_UNAVAILABLE", "The OCR engine is unavailable.")
    try:
        with Image.open(io.BytesIO(image_bytes)) as image:
            return pytesseract.image_to_string(image, lang=os.environ.get("OCR_LANGUAGES", "eng+vie"), timeout=OCR_TIMEOUT_SECONDS).strip()
    except pytesseract.TesseractNotFoundError:
        raise ScanError(503, "OCR_ENGINE_UNAVAILABLE", "The OCR engine is unavailable.") from None
    except RuntimeError:
        raise ScanError(504, "OCR_TIMEOUT", "OCR exceeded its processing deadline.") from None
    except (pytesseract.TesseractError, OSError):
        raise ScanError(500, "OCR_FAILED", "The OCR engine could not process the image.") from None


def process_scan(raw_bytes: bytes) -> ScanResult:
    started = time.monotonic()
    processed, _warning = preprocess_image(raw_bytes)
    raw_text = extract_ocr_text(processed)
    if not raw_text.strip():
        raise ScanError(422, "NO_LEGIBLE_TEXT", "No legible text was detected in the image.")
    candidates, warnings = normalized_candidates(raw_text)
    return ScanResult(raw_text=raw_text, candidates=candidates, warnings=warnings, errors=[], execution_time_ms=int((time.monotonic() - started) * 1000))


@router.post("/scan", response_model=ScanResult)
async def scan_image(request: Request):
    declared_length = request.headers.get("content-length")
    if declared_length:
        try:
            if int(declared_length) > MAX_REQUEST_BYTES:
                raise ScanError(413, "IMAGE_TOO_LARGE", "Image request exceeds the size limit.")
        except ValueError:
            raise ScanError(400, "INVALID_REQUEST", "Invalid request length.") from None
    body = bytearray()
    async for chunk in request.stream():
        body.extend(chunk)
        if len(body) > MAX_REQUEST_BYTES:
            raise ScanError(413, "IMAGE_TOO_LARGE", "Image request exceeds the size limit.")
    # Bound the body before either JSON or multipart decoding. Starlette's form
    # parser reads Request.stream(), which now uses this bounded cached body.
    request._body = bytes(body)
    media_type = request.headers.get("content-type", "").split(";", 1)[0].strip().lower()
    if media_type == "application/json":
        try:
            payload = json.loads(body)
        except (ValueError, UnicodeDecodeError):
            raise ScanError(400, "INVALID_JSON", "The JSON request is malformed.") from None
        if not isinstance(payload, dict):
            raise ScanError(400, "INVALID_REQUEST", "An image_base64 object is required.")
        raw_bytes = decode_image_bytes(payload.get("image_base64"))
    elif media_type == "multipart/form-data":
        try:
            async with request.form(max_files=1, max_fields=0, max_part_size=MAX_IMAGE_BYTES + 1) as form:
                files = form.getlist("file")
                if len(files) != 1 or not isinstance(files[0], UploadFile):
                    raise ScanError(400, "INVALID_REQUEST", "One image file is required.")
                file = files[0]
                if file.content_type not in SUPPORTED_MEDIA:
                    raise ScanError(415, "UNSUPPORTED_MEDIA_TYPE", "Only JPEG, PNG and WebP images are supported.")
                raw_bytes = await file.read(MAX_IMAGE_BYTES + 1)
        except HTTPException:
            raise ScanError(400, "INVALID_MULTIPART", "The image upload is malformed.") from None
    else:
        raise ScanError(415, "UNSUPPORTED_MEDIA_TYPE", "Use multipart/form-data or application/json.")
    return await run_in_threadpool(process_scan, raw_bytes)
