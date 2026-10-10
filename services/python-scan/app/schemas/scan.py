from __future__ import annotations

from typing import List, Optional
try:
    from pydantic import BaseModel, Field
except ImportError:
    # Minimal fallback dataclass shim if pydantic is not installed locally
    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
        def model_dump(self):
            return self.__dict__
    Field = lambda **kwargs: None


class HealthResponse(BaseModel):
    status: str = "healthy"
    service: str = "python-scan"
    version: str = "1.0.0"


class ScanRequest(BaseModel):
    image_base64: Optional[str] = None


class DateCandidate(BaseModel):
    raw_text: str
    parsed_date: Optional[str]
    certainty: str = "known"
    confidence: float = 0.8
    date_label_type: str = "unspecified"
    source: str = "printed_label"


class ScanResult(BaseModel):
    raw_text: str
    candidates: List[DateCandidate]
    warnings: List[str]
