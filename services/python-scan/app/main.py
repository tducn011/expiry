from fastapi import FastAPI
from fastapi.responses import JSONResponse
from app.routes.health import router as health_router
from app.routes.scan import router as scan_router
from app.schemas.scan import ScanError

app = FastAPI(
    title="Expiry Python Scan Service",
    description="Internal stateless image preprocessing, OCR and candidate extraction.",
    version="1.0.0",
)


@app.exception_handler(ScanError)
async def scan_error_handler(_request, error: ScanError):
    return JSONResponse(status_code=error.status, content={"code": error.code, "message": error.message})


app.include_router(health_router)
app.include_router(scan_router)
