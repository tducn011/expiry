from typing import Literal
from pydantic import BaseModel, Field


class ScanError(Exception):
    def __init__(self, status: int, code: str, message: str):
        super().__init__(message)
        self.status, self.code, self.message = status, code, message


class HealthResponse(BaseModel):
    status: str
    service: str = "python-scan"
    version: str = "1.0.0"
    tesseract_available: bool


class ExpiryCandidate(BaseModel):
    value: str | None = None
    date_certainty: Literal["exact", "inferred"] | None = None
    date_label_type: Literal["expiry", "best_before", "use_by", "manufactured", "unknown"] = "unknown"
    source_text: str = ""
    alternatives: list[str] = Field(default_factory=list)
    ambiguous: bool = False
    requires_confirmation: bool = True


class ManufacturedCandidate(BaseModel):
    value: str | None = None
    source_text: str = ""


class Candidates(BaseModel):
    food_name: str | None = None
    expiry_date: ExpiryCandidate = Field(default_factory=ExpiryCandidate)
    manufactured_date: ManufacturedCandidate = Field(default_factory=ManufacturedCandidate)


class ScanResult(BaseModel):
    raw_text: str
    candidates: Candidates
    warnings: list[str] = Field(default_factory=list)
    errors: list[str] = Field(default_factory=list)
    execution_time_ms: int
