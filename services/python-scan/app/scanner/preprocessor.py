# ponytail: clean image decoding & lightweight thresholding without heavy dependencies
from __future__ import annotations

import base64
import io
from typing import Optional, Tuple


def decode_image_bytes(image_base64: str) -> bytes:
    # Strip potential data URI prefix e.g. "data:image/jpeg;base64,"
    if "," in image_base64:
        image_base64 = image_base64.split(",", 1)[1]
    return base64.b64decode(image_base64)


def preprocess_image(image_bytes: bytes) -> Tuple[bytes, Optional[str]]:
    """
    Validates image header and applies basic contrast preprocessing if PIL is available.
    Returns (processed_bytes, error_message).
    """
    if len(image_bytes) == 0:
        return b"", "Empty image payload"
    if len(image_bytes) > 5 * 1024 * 1024:
        return b"", "Image exceeds 5MB maximum size limit"

    try:
        from PIL import Image, ImageOps
        image = Image.open(io.BytesIO(image_bytes))
        # Convert to grayscale and autocontrast
        gray = ImageOps.grayscale(image)
        enhanced = ImageOps.autocontrast(gray)
        output = io.BytesIO()
        enhanced.save(output, format="PNG")
        return output.getvalue(), None
    except ImportError:
        # Fallback without PIL
        return image_bytes, None
    except Exception as exc:
        return image_bytes, f"Image processing warning: {exc}"
