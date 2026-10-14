"""Lazy adapter for the optional DateReg YOLO + CTC pipeline."""

from functools import lru_cache
from io import BytesIO
from pathlib import Path


@lru_cache(maxsize=1)
def _get_pipeline():
    from app.scanner.datereg.pipeline import DatePipeline

    config_path = Path(__file__).parent / "datereg" / "config.yaml"
    return DatePipeline(config_path=str(config_path))


def extract_datereg_text(image_bytes: bytes) -> str:
    """Run DateReg on an image, loading its ML dependencies and weights on demand."""
    from PIL import Image

    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    result = _get_pipeline().run(image)
    return "\n".join(detection.text for detection in result.detections if detection.text.strip())