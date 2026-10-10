# ponytail: lean, deterministic date parsing without heavy ML/LLM dependencies
from __future__ import annotations

import re
from datetime import datetime
from typing import Any, Dict, List, Optional


MONTH_NAMES = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
    "thg1": 1, "thg2": 2, "thg3": 3, "thg4": 4, "thg5": 5, "thg6": 6,
    "thg7": 7, "thg8": 8, "thg9": 9, "thg10": 10, "thg11": 11, "thg12": 12
}

DATE_PATTERNS = [
    # YYYY-MM-DD or YYYY/MM/DD
    (r"\b(20\d{2})[-/.](0[1-9]|1[0-2])[-/.](0[1-9]|[12]\d|3[01])\b", "%Y-%m-%d"),
    # DD-MM-YYYY or DD/MM/YYYY or DD.MM.YYYY
    (r"\b(0[1-9]|[12]\d|3[01])[-/.](0[1-9]|1[0-2])[-/.](20\d{2})\b", "%d-%m-%Y"),
    # DD-MM-YY or DD/MM/YY
    (r"\b(0[1-9]|[12]\d|3[01])[-/.](0[1-9]|1[0-2])[-/.](\d{2})\b", "%d-%m-%y"),
    # DD Mon YYYY (e.g. 15 Oct 2026)
    (r"\b(0[1-9]|[12]\d|3[01])\s+([A-Za-z]{3,4})\s+(20\d{2})\b", "textual"),
]

LABEL_PATTERNS = [
    (r"\b(best\s+before|bb|bbe)\b", "best_before"),
    (r"\b(use\s+by|exp|expiry|expires|hsd)\b", "use_by"),
]


def classify_label_type(context: str) -> str:
    lower = context.lower()
    for pattern, label_type in LABEL_PATTERNS:
        if re.search(pattern, lower):
            return label_type
    return "unspecified"


def parse_date_candidates(raw_text: str) -> List[Dict[str, Any]]:
    candidates: List[Dict[str, Any]] = []
    seen_dates = set()

    lines = raw_text.splitlines()
    for line in lines:
        cleaned_line = line.strip()
        if not cleaned_line:
            continue

        label_type = classify_label_type(cleaned_line)

        # 1. Regex numeric patterns
        for pattern, fmt in DATE_PATTERNS[:3]:
            for match in re.finditer(pattern, cleaned_line, re.IGNORECASE):
                matched_str = match.group(0)
                # Standardize separators to '-'
                normalized_str = re.sub(r"[/.]", "-", matched_str)
                try:
                    parsed_dt = datetime.strptime(normalized_str, fmt)
                    iso_date = parsed_dt.strftime("%Y-%m-%d")
                    if iso_date not in seen_dates:
                        seen_dates.add(iso_date)
                        confidence = 0.95 if label_type != "unspecified" else 0.80
                        candidates.append({
                            "raw_text": matched_str,
                            "parsed_date": iso_date,
                            "certainty": "known",
                            "confidence": confidence,
                            "date_label_type": label_type,
                            "source": "printed_label"
                        })
                except ValueError:
                    continue

        # 2. Textual month pattern (e.g., "15 Oct 2026")
        for match in re.finditer(DATE_PATTERNS[3][0], cleaned_line, re.IGNORECASE):
            day_str, mon_str, year_str = match.groups()
            mon_key = mon_str.lower()[:3]
            if mon_key in MONTH_NAMES:
                month_num = MONTH_NAMES[mon_key]
                try:
                    iso_date = f"{year_str}-{month_num:02d}-{int(day_str):02d}"
                    datetime.strptime(iso_date, "%Y-%m-%d")
                    if iso_date not in seen_dates:
                        seen_dates.add(iso_date)
                        candidates.append({
                            "raw_text": match.group(0),
                            "parsed_date": iso_date,
                            "certainty": "known",
                            "confidence": 0.90,
                            "date_label_type": label_type,
                            "source": "printed_label"
                        })
                except ValueError:
                    continue

    return candidates
