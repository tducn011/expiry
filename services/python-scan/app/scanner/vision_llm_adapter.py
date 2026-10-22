"""Vision LLM fallback adapter for complex, dot-matrix, or ambiguous food packaging labels."""

from __future__ import annotations

import base64
import json
import logging
import os
import re
from datetime import datetime
import urllib.request
import urllib.error
from typing import Any, Dict, Optional, Tuple

logger = logging.getLogger(__name__)

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
OLLAMA_API_URL = "{host}/api/chat"

SYSTEM_VISION_PROMPT = """You are an expert OCR and food product label analyzer.
Analyze this product label image to extract:
1. Product or food name ("food_name").
2. Expiration / Best Before / Use By date ("expiry_date").
   - Keywords: "HSD", "EXP", "BB", "BBE", "Best Before", "Use By", "Hạn sử dụng" mean expiry.
   - Output expiry_date formatted as an ISO date string "YYYY-MM-DD".
   - If an expiry date is relative (e.g. "12 months from NSX 01/01/2026"), calculate the target date.
3. Manufacturing Date ("manufactured_date").
   - Keywords: "NSX", "MFG", "MFD", "Ngày sản xuất" mean manufacturing date.
   - Output manufactured_date formatted as an ISO date string "YYYY-MM-DD".
4. Transcribe all text seen in the image into "raw_text".

Return STRICT JSON format conforming to this exact structure:
{
  "food_name": string or null,
  "expiry_date": {
    "value": "YYYY-MM-DD" or null,
    "date_certainty": "exact" | "inferred" | null,
    "date_label_type": "use_by" | "best_before" | "unknown",
    "source_text": string,
    "alternatives": [],
    "ambiguous": false,
    "requires_confirmation": true
  },
  "manufactured_date": {
    "value": "YYYY-MM-DD" or null,
    "source_text": string
  },
  "raw_text": string
}
"""


def detect_mime_type(image_bytes: bytes) -> str:
    if image_bytes.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if image_bytes.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if image_bytes.startswith(b"RIFF") and b"WEBP" in image_bytes[:16]:
        return "image/webp"
    return "image/jpeg"


def normalize_iso_date(val: Optional[str]) -> Optional[str]:
    if not val or not isinstance(val, str):
        return None
    val = val.strip()
    # Match YYYY-MM-DD
    if re.match(r"^20\d{2}-\d{2}-\d{2}$", val):
        return val
    # Match DD/MM/YYYY or DD-MM-YYYY
    m = re.match(r"^(\d{1,2})[-/.](\d{1,2})[-/.](20\d{2})$", val)
    if m:
        d, m_val, y = m.groups()
        return f"{y}-{int(m_val):02d}-{int(d):02d}"
    return val


def call_gemini_vision(
    image_bytes: bytes,
    api_key: str,
    model: str = "gemini-2.5-flash",
    timeout: float = 6.0
) -> Dict[str, Any]:
    b64_data = base64.b64encode(image_bytes).decode("utf-8")
    mime_type = detect_mime_type(image_bytes)
    url = GEMINI_API_URL.format(model=model, key=api_key)

    payload = {
        "contents": [{
            "parts": [
                {"text": SYSTEM_VISION_PROMPT},
                {"inline_data": {"mime_type": mime_type, "data": b64_data}}
            ]
        }],
        "generationConfig": {
            "response_mime_type": "application/json",
            "temperature": 0.1
        }
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        candidates = res.get("candidates", [])
        if not candidates:
            raise RuntimeError("Gemini Vision returned no candidate responses.")
        text_resp = candidates[0]["content"]["parts"][0]["text"]
        return json.loads(text_resp)


def call_ollama_vision(
    image_bytes: bytes,
    host: str = "http://host.docker.internal:11434",
    model: str = "qwen2.5-vl:3b",
    timeout: float = 5.0
) -> Dict[str, Any]:
    b64_data = base64.b64encode(image_bytes).decode("utf-8")
    url = OLLAMA_API_URL.format(host=host.rstrip("/"))

    payload = {
        "model": model,
        "messages": [
            {
                "role": "user",
                "content": SYSTEM_VISION_PROMPT,
                "images": [b64_data]
            }
        ],
        "stream": False,
        "format": "json"
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        msg = res.get("message", {}).get("content", "{}")
        return json.loads(msg)


def extract_vision_llm_candidates(image_bytes: bytes) -> Optional[Tuple[Dict[str, Any], str, str]]:
    """
    Attempt to extract candidates using available Vision LLM providers.
    Returns: (candidates_dict, raw_text, provider_info) or None if unavailable/failed.
    """
    gemini_key = os.environ.get("GEMINI_API_KEY", "").strip()
    preferred_provider = os.environ.get("VISION_LLM_PROVIDER", "auto").lower().strip()
    ollama_host = os.environ.get("OLLAMA_HOST", "http://host.docker.internal:11434").strip()
    ollama_model = os.environ.get("OLLAMA_VISION_MODEL", "qwen2.5-vl:3b").strip()
    gemini_model = os.environ.get("GEMINI_VISION_MODEL", "gemini-2.5-flash").strip()

    # 1. Primary: Gemini Vision
    if preferred_provider in {"auto", "gemini"} and gemini_key:
        try:
            parsed = call_gemini_vision(image_bytes, gemini_key, model=gemini_model)
            expiry_raw = parsed.get("expiry_date")
            if isinstance(expiry_raw, dict):
                expiry_val = normalize_iso_date(expiry_raw.get("value"))
                expiry_obj = {
                    "value": expiry_val,
                    "date_certainty": expiry_raw.get("date_certainty", "exact" if expiry_val else None),
                    "date_label_type": expiry_raw.get("date_label_type", "use_by"),
                    "source_text": str(expiry_raw.get("source_text") or expiry_val or ""),
                    "alternatives": expiry_raw.get("alternatives", []),
                    "ambiguous": bool(expiry_raw.get("ambiguous", False)),
                    "requires_confirmation": True
                }
            elif isinstance(expiry_raw, str):
                expiry_val = normalize_iso_date(expiry_raw)
                expiry_obj = {
                    "value": expiry_val,
                    "date_certainty": "exact" if expiry_val else None,
                    "date_label_type": "use_by",
                    "source_text": expiry_raw,
                    "alternatives": [],
                    "ambiguous": False,
                    "requires_confirmation": True
                }
            else:
                expiry_obj = {"value": None, "source_text": "", "date_label_type": "unknown"}

            mfg_raw = parsed.get("manufactured_date")
            if isinstance(mfg_raw, dict):
                mfg_val = normalize_iso_date(mfg_raw.get("value"))
                mfg_obj = {"value": mfg_val, "source_text": str(mfg_raw.get("source_text") or mfg_val or "")}
            elif isinstance(mfg_raw, str):
                mfg_val = normalize_iso_date(mfg_raw)
                mfg_obj = {"value": mfg_val, "source_text": mfg_raw}
            else:
                mfg_obj = {"value": None, "source_text": ""}

            candidates = {
                "food_name": parsed.get("food_name"),
                "expiry_date": expiry_obj,
                "manufactured_date": mfg_obj
            }
            raw_text = parsed.get("raw_text", "")
            return candidates, raw_text, f"Gemini Vision ({gemini_model})"
        except Exception as exc:
            logger.warning("Gemini Vision extraction failed: %s", exc)
            if preferred_provider == "gemini":
                return None

    # 2. Secondary: Ollama Vision (only if explicitly requested or gemini failed and ollama requested)
    if preferred_provider in {"ollama"}:
        try:
            parsed = call_ollama_vision(image_bytes, host=ollama_host, model=ollama_model)
            candidates = {
                "food_name": parsed.get("food_name"),
                "expiry_date": parsed.get("expiry_date", {}),
                "manufactured_date": parsed.get("manufactured_date", {})
            }
            raw_text = parsed.get("raw_text", "")
            return candidates, raw_text, f"Ollama Vision ({ollama_model})"
        except Exception as exc:
            logger.warning("Ollama Vision extraction failed: %s", exc)

    return None
