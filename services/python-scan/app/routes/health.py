from fastapi import APIRouter
from app.schemas.scan import HealthResponse
from app.routes.scan import tesseract_available

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def get_health():
    available = tesseract_available()
    return HealthResponse(status="healthy" if available else "unavailable", tesseract_available=available)
