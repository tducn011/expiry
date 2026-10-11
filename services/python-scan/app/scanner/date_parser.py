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
    (r"\b(nsx|mfg|mfd|manufactured|manufacture(?:d)?\s+date|production\s+date)\b", "manufactured"),
]


def classify_label_type(context: str) -> str:
    lower = context.lower()
    for pattern, label_type in LABEL_PATTERNS:
        if re.search(pattern, lower):
            return label_type
    return "unspecified"


def label_before_date(line: str, position: int) -> str:
    labels = [(match.start(), label) for pattern, label in LABEL_PATTERNS
              for match in re.finditer(pattern, line, re.IGNORECASE) if match.start() < position]
    return max(labels)[1] if labels else classify_label_type(line)


def parse_date_candidates(raw_text: str) -> List[Dict[str, Any]]:
    candidates: List[Dict[str, Any]] = []
    seen_dates = set()

    lines = raw_text.splitlines()
    for line in lines:
        cleaned_line = line.strip()
        if not cleaned_line:
            continue

        # 1. Regex numeric patterns
        for pattern, fmt in DATE_PATTERNS[:3]:
            for match in re.finditer(pattern, cleaned_line, re.IGNORECASE):
                matched_str = match.group(0)
                label_type = label_before_date(cleaned_line, match.start())
                # Standardize separators to '-'
                normalized_str = re.sub(r"[/.]", "-", matched_str)
                try:
                    parsed_dt = datetime.strptime(normalized_str, fmt)
                    iso_date = parsed_dt.strftime("%Y-%m-%d")
                    identity = (iso_date, label_type, matched_str)
                    if identity not in seen_dates:
                        seen_dates.add(identity)
                        alternatives = [iso_date]
                        if fmt != "%Y-%m-%d" and parsed_dt.day <= 12 and parsed_dt.day != parsed_dt.month:
                            alternatives.append(parsed_dt.replace(month=parsed_dt.day, day=parsed_dt.month).strftime("%Y-%m-%d"))
                        confidence = 0.95 if label_type != "unspecified" else 0.80
                        candidates.append({
                            "raw_text": matched_str,
                            "parsed_date": iso_date,
                            "certainty": "known",
                            "confidence": confidence,
                            "date_label_type": label_type,
                            "source": "printed_label",
                            "alternatives": alternatives if len(alternatives) > 1 else [],
                            "ambiguous": len(alternatives) > 1
                        })
                except ValueError:
                    continue

        # 2. Textual month pattern (e.g., "15 Oct 2026")
        for match in re.finditer(DATE_PATTERNS[3][0], cleaned_line, re.IGNORECASE):
            label_type = label_before_date(cleaned_line, match.start())
            day_str, mon_str, year_str = match.groups()
            mon_key = mon_str.lower()[:3]
            if mon_key in MONTH_NAMES:
                month_num = MONTH_NAMES[mon_key]
                try:
                    iso_date = f"{year_str}-{month_num:02d}-{int(day_str):02d}"
                    datetime.strptime(iso_date, "%Y-%m-%d")
                    identity = (iso_date, label_type, match.group(0))
                    if identity not in seen_dates:
                        seen_dates.add(identity)
                        candidates.append({
                            "raw_text": match.group(0),
                            "parsed_date": iso_date,
                            "certainty": "known",
                            "confidence": 0.90,
                            "date_label_type": label_type,
                            "source": "printed_label",
                            "alternatives": [],
                            "ambiguous": False
                        })
                except ValueError:
                    continue

    return candidates


def normalized_candidates(raw_text: str) -> tuple[dict, list[str]]:
    parsed = parse_date_candidates(raw_text)
    expiry = [candidate for candidate in parsed if candidate["date_label_type"] in {"use_by", "best_before"}]
    manufactured = [candidate for candidate in parsed if candidate["date_label_type"] == "manufactured"]
    warnings = []
    result = {
        "food_name": None,
        "expiry_date": {"value": None, "date_certainty": None, "date_label_type": "unknown", "source_text": "", "alternatives": [], "ambiguous": False, "requires_confirmation": True},
        "manufactured_date": {"value": None, "source_text": ""},
    }
    if expiry:
        alternatives = list(dict.fromkeys(value for candidate in expiry for value in (candidate["alternatives"] or [candidate["parsed_date"]])))
        ambiguous = any(candidate["ambiguous"] for candidate in expiry) or len(alternatives) > 1
        result["expiry_date"] = {
            "value": None if ambiguous else alternatives[0],
            "date_certainty": "inferred" if ambiguous else "exact",
            "date_label_type": expiry[0]["date_label_type"] if len({candidate["date_label_type"] for candidate in expiry}) == 1 else "unknown",
            "source_text": " | ".join(candidate["raw_text"] for candidate in expiry),
            "alternatives": alternatives if ambiguous else [],
            "ambiguous": ambiguous,
            "requires_confirmation": True,
        }
        if ambiguous:
            warnings.append("AMBIGUOUS_EXPIRY_DATE: review the alternatives against the original label.")
    if manufactured:
        dates = list(dict.fromkeys(value for candidate in manufactured for value in (candidate["alternatives"] or [candidate["parsed_date"]])))
        result["manufactured_date"] = {
            "value": dates[0] if len(dates) == 1 else None,
            "source_text": " | ".join(candidate["raw_text"] for candidate in manufactured),
        }
        if len(dates) > 1:
            warnings.append("AMBIGUOUS_MANUFACTURED_DATE: review the original label.")
    if any(candidate["date_label_type"] == "unspecified" for candidate in parsed):
        warnings.append("UNLABELLED_DATE: no expiry meaning inferred from an unlabelled date.")
    return result, warnings
