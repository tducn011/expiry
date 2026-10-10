from __future__ import annotations

try:
    from fastapi import APIRouter
    router = APIRouter()
except ImportError:
    router = None

from app.schemas.scan import HealthResponse

if router:
    @router.get("/health", response_model=HealthResponse)
    async def get_health():
        return HealthResponse(status="healthy", service="python-scan", version="1.0.0")
