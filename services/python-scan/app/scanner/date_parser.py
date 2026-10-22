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
MONTH_NAMES.update({f"tháng{month}": month for month in range(1, 13)})

DATE_PATTERNS = [
    # YYYY-MM-DD or YYYY/MM/DD
    (r"\b(20\d{2})[-/.](0[1-9]|1[0-2])[-/.](0[1-9]|[12]\d|3[01])\b", "%Y-%m-%d"),
    # DD-MM-YYYY or DD/MM/YYYY or DD.MM.YYYY
    (r"\b(0[1-9]|[12]\d|3[01])[-/.](0[1-9]|1[0-2])[-/.](20\d{2})\b", "%d-%m-%Y"),
    # DD-MM-YY or DD/MM/YY
    (r"\b(0[1-9]|[12]\d|3[01])[-/.](0[1-9]|1[0-2])[-/.](\d{2})\b", "%d-%m-%y"),
    # DD Mon YYYY (e.g. 15 Oct 2026 or 15 Thg10 2026)
    (r"\b(0[1-9]|[12]\d|3[01])\s*(?:-|/|\s+)\s*(thg\s*\d{1,2}|tháng\s*\d{1,2}|[A-Za-z]{3,4})\s*(?:-|/|\s+)\s*(20\d{2})\b", "textual"),
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


def resolve_gs1_preference(barcode: Optional[str]) -> Optional[str]:
    if not barcode:
        return None
    clean = re.sub(r"\D", "", barcode)
    if len(clean) == 12:  # Standard UPC-A is North American (MM/DD)
        return "MDY"
    if len(clean) >= 3:
        p3 = clean[:3]
        if p3 == "893":
            return "DMY"  # Vietnam GS1
        try:
            num3 = int(p3)
            if 0 <= num3 <= 139:
                return "MDY"  # USA & Canada GS1/UPC
            if 450 <= num3 <= 459 or 490 <= num3 <= 499 or num3 == 880:
                return "YMD"  # Japan / Korea
            if (300 <= num3 <= 379 or 400 <= num3 <= 440 or
                500 <= num3 <= 509 or num3 in (885, 888) or 930 <= num3 <= 939):
                return "DMY"  # UK, EU, Thailand, Singapore, Australia
        except ValueError:
            pass
    return None


def resolve_locale_preference(locale: Optional[str]) -> str:
    if not locale:
        return "DMY"
    loc = locale.lower().replace("-", "_")
    if "en_us" in loc or loc == "us":
        return "MDY"
    return "DMY"


def parse_date_candidates(
    raw_text: str,
    barcode: Optional[str] = None,
    locale: Optional[str] = None
) -> List[Dict[str, Any]]:
    candidates: List[Dict[str, Any]] = []
    seen_dates = set()
    pref = resolve_gs1_preference(barcode) or resolve_locale_preference(locale)

    lines = raw_text.splitlines()
    for line in lines:
        cleaned_line = line.strip()
        if not cleaned_line:
            continue

        # 1. YYYY-MM-DD or YYYY/MM/DD (unambiguous ISO format)
        for match in re.finditer(DATE_PATTERNS[0][0], cleaned_line, re.IGNORECASE):
            matched_str = match.group(0)
            label_type = label_before_date(cleaned_line, match.start())
            normalized_str = re.sub(r"[/.]", "-", matched_str)
            try:
                parsed_dt = datetime.strptime(normalized_str, "%Y-%m-%d")
                iso_date = parsed_dt.strftime("%Y-%m-%d")
                identity = (iso_date, label_type, matched_str)
                if identity not in seen_dates:
                    seen_dates.add(identity)
                    candidates.append({
                        "raw_text": matched_str,
                        "parsed_date": iso_date,
                        "certainty": "known",
                        "confidence": 0.95 if label_type != "unspecified" else 0.85,
                        "date_label_type": label_type,
                        "source": "printed_label",
                        "alternatives": [],
                        "ambiguous": False
                    })
            except ValueError:
                continue

        # 2. Ambiguous two-number formats: A/B/YYYY or A/B/YY (handles DD/MM vs MM/DD)
        two_part_patterns = [
            (r"\b(0[1-9]|[12]\d|3[01])[-/.](0[1-9]|[12]\d|3[01])[-/.](20\d{2})\b", True),
            (r"\b(0[1-9]|[12]\d|3[01])[-/.](0[1-9]|[12]\d|3[01])[-/.](\d{2})\b", False),
        ]
        for pattern, is_4digit in two_part_patterns:
            for match in re.finditer(pattern, cleaned_line, re.IGNORECASE):
                matched_str = match.group(0)
                label_type = label_before_date(cleaned_line, match.start())
                a_str, b_str, y_str = match.groups()
                n1, n2 = int(a_str), int(b_str)
                year = int(y_str) if is_4digit else 2000 + int(y_str)

                # Determine if format is definitely DMY, definitely MDY, or ambiguous
                if n1 > 12 and n2 <= 12:
                    # n1 is definitely day, n2 is month -> DMY
                    try:
                        iso_date = f"{year:04d}-{n2:02d}-{n1:02d}"
                        datetime.strptime(iso_date, "%Y-%m-%d")
                        identity = (iso_date, label_type, matched_str)
                        if identity not in seen_dates:
                            seen_dates.add(identity)
                            candidates.append({
                                "raw_text": matched_str,
                                "parsed_date": iso_date,
                                "certainty": "known",
                                "confidence": 0.95 if label_type != "unspecified" else 0.80,
                                "date_label_type": label_type,
                                "source": "printed_label",
                                "alternatives": [],
                                "ambiguous": False
                            })
                    except ValueError:
                        pass
                elif n2 > 12 and n1 <= 12:
                    # n2 is definitely day, n1 is month -> MDY
                    try:
                        iso_date = f"{year:04d}-{n1:02d}-{n2:02d}"
                        datetime.strptime(iso_date, "%Y-%m-%d")
                        identity = (iso_date, label_type, matched_str)
                        if identity not in seen_dates:
                            seen_dates.add(identity)
                            candidates.append({
                                "raw_text": matched_str,
                                "parsed_date": iso_date,
                                "certainty": "known",
                                "confidence": 0.95 if label_type != "unspecified" else 0.80,
                                "date_label_type": label_type,
                                "source": "printed_label",
                                "alternatives": [],
                                "ambiguous": False
                            })
                    except ValueError:
                        pass
                elif n1 <= 12 and n2 <= 12:
                    # Both <= 12: Check if identical (e.g. 05/05)
                    if n1 == n2:
                        try:
                            iso_date = f"{year:04d}-{n1:02d}-{n2:02d}"
                            datetime.strptime(iso_date, "%Y-%m-%d")
                            identity = (iso_date, label_type, matched_str)
                            if identity not in seen_dates:
                                seen_dates.add(identity)
                                candidates.append({
                                    "raw_text": matched_str,
                                    "parsed_date": iso_date,
                                    "certainty": "known",
                                    "confidence": 0.95 if label_type != "unspecified" else 0.80,
                                    "date_label_type": label_type,
                                    "source": "printed_label",
                                    "alternatives": [],
                                    "ambiguous": False
                                })
                        except ValueError:
                            pass
                    else:
                        # Ambiguous! Order depends on GS1 barcode preference or user locale
                        try:
                            dmy_iso = f"{year:04d}-{n2:02d}-{n1:02d}"
                            mdy_iso = f"{year:04d}-{n1:02d}-{n2:02d}"
                            datetime.strptime(dmy_iso, "%Y-%m-%d")
                            datetime.strptime(mdy_iso, "%Y-%m-%d")

                            primary = mdy_iso if pref == "MDY" else dmy_iso
                            secondary = dmy_iso if pref == "MDY" else mdy_iso
                            alternatives = [primary, secondary]

                            identity = (primary, label_type, matched_str)
                            if identity not in seen_dates:
                                seen_dates.add(identity)
                                candidates.append({
                                    "raw_text": matched_str,
                                    "parsed_date": primary,
                                    "certainty": "known",
                                    "confidence": 0.85 if label_type != "unspecified" else 0.70,
                                    "date_label_type": label_type,
                                    "source": "printed_label",
                                    "alternatives": alternatives,
                                    "ambiguous": True
                                })
                        except ValueError:
                            pass

        # 3. Textual month pattern (e.g., "15 Oct 2026" or "15 Thg10 2026")
        for match in re.finditer(DATE_PATTERNS[3][0], cleaned_line, re.IGNORECASE):
            label_type = label_before_date(cleaned_line, match.start())
            day_str, mon_str, year_str = match.groups()
            normalized_month = re.sub(r"\s+", "", mon_str.lower())
            mon_key = (
                normalized_month
                if normalized_month.startswith(("thg", "tháng"))
                else normalized_month[:3]
            )
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
                            "confidence": 0.95 if label_type != "unspecified" else 0.90,
                            "date_label_type": label_type,
                            "source": "printed_label",
                            "alternatives": [],
                            "ambiguous": False
                        })
                except ValueError:
                    continue

    return candidates


def normalized_candidates(
    raw_text: str,
    barcode: Optional[str] = None,
    locale: Optional[str] = None
) -> tuple[dict, list[str]]:
    parsed = parse_date_candidates(raw_text, barcode=barcode, locale=locale)
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
