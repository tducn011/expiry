from __future__ import annotations

import base64
import binascii
import io
import warnings
from PIL import Image, ImageOps, UnidentifiedImageError
from app.schemas.scan import ScanError

MAX_IMAGE_BYTES = 5 * 1024 * 1024
MAX_ENCODED_BYTES = 4 * ((MAX_IMAGE_BYTES + 2) // 3)
SUPPORTED_FORMATS = {"JPEG", "PNG", "WEBP"}


def decode_image_bytes(image_base64: str) -> bytes:
    if not isinstance(image_base64, str) or not image_base64:
        raise ScanError(400, "INVALID_BASE64", "A base64 image string is required.")
    if image_base64.startswith("data:"):
        header, separator, image_base64 = image_base64.partition(",")
        if not separator or header not in {"data:image/jpeg;base64", "data:image/png;base64", "data:image/webp;base64"}:
            raise ScanError(415, "UNSUPPORTED_MEDIA_TYPE", "Only JPEG, PNG and WebP images are supported.")
    if len(image_base64) > MAX_ENCODED_BYTES:
        raise ScanError(413, "IMAGE_TOO_LARGE", "Image exceeds the 5MB limit.")
    try:
        result = base64.b64decode(image_base64, validate=True)
    except (binascii.Error, ValueError):
        raise ScanError(400, "INVALID_BASE64", "The image base64 payload is malformed.") from None
    if len(result) > MAX_IMAGE_BYTES:
        raise ScanError(413, "IMAGE_TOO_LARGE", "Image exceeds the 5MB limit.")
    return result


def preprocess_image(image_bytes: bytes) -> tuple[bytes, None]:
    if not image_bytes:
        raise ScanError(400, "INVALID_IMAGE_BYTES", "Image bytes are empty.")
    if len(image_bytes) > MAX_IMAGE_BYTES:
        raise ScanError(413, "IMAGE_TOO_LARGE", "Image exceeds the 5MB limit.")
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            with Image.open(io.BytesIO(image_bytes)) as image:
                if image.format not in SUPPORTED_FORMATS:
                    raise ScanError(415, "UNSUPPORTED_MEDIA_TYPE", "Only JPEG, PNG and WebP images are supported.")
                image.verify()
            with Image.open(io.BytesIO(image_bytes)) as image:
                image.load()
                enhanced = ImageOps.autocontrast(ImageOps.grayscale(ImageOps.exif_transpose(image)))
                output = io.BytesIO()
                enhanced.save(output, format="PNG")
                return output.getvalue(), None
    except ScanError:
        raise
    except (Image.DecompressionBombWarning, Image.DecompressionBombError):
        raise ScanError(413, "IMAGE_TOO_LARGE", "Image dimensions exceed the decoding limit.") from None
    except (UnidentifiedImageError, OSError, ValueError, SyntaxError):
        raise ScanError(400, "INVALID_IMAGE_BYTES", "The uploaded image cannot be decoded.") from None
