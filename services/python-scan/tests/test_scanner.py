import base64
import io
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

# Add services/python-scan to sys.path.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.scanner.date_parser import (  # noqa: E402
    classify_label_type,
    normalized_candidates,
    parse_date_candidates,
)
from app.scanner.preprocessor import (  # noqa: E402
    decode_image_bytes,
    preprocess_image,
)
from app.schemas.scan import ScanError, ScanResult  # noqa: E402
from app.routes.scan import process_scan  # noqa: E402


class TestScannerLogic(unittest.TestCase):
    def test_classify_label_type(self):
        self.assertEqual(classify_label_type("EXP 15/10/2026"), "use_by")
        self.assertEqual(classify_label_type("BEST BEFORE: 2026-11-01"), "best_before")
        self.assertEqual(classify_label_type("BB 01/01/2027"), "best_before")
        self.assertEqual(classify_label_type("HSD 20/05/2026"), "use_by")
        self.assertEqual(classify_label_type("NSX 20/05/2026"), "manufactured")
        self.assertEqual(classify_label_type("Product of Vietnam"), "unspecified")

    def test_parse_iso_date(self):
        parsed = parse_date_candidates("Batch #12345\nEXP: 2026-12-31\nKeep refrigerated")
        self.assertEqual(len(parsed), 1)
        self.assertEqual(parsed[0]["parsed_date"], "2026-12-31")
        self.assertEqual(parsed[0]["date_label_type"], "use_by")
        self.assertEqual(parsed[0]["certainty"], "known")

    def test_parse_slash_date(self):
        parsed = parse_date_candidates("BEST BEFORE 15/08/2026")
        self.assertEqual(len(parsed), 1)
        self.assertEqual(parsed[0]["parsed_date"], "2026-08-15")
        self.assertEqual(parsed[0]["date_label_type"], "best_before")

    def test_parse_textual_month(self):
        parsed = parse_date_candidates("Expiry Date: 25 Oct 2026")
        self.assertEqual(len(parsed), 1)
        self.assertEqual(parsed[0]["parsed_date"], "2026-10-25")

    def test_parse_vietnamese_textual_months(self):
        cases = (
            ("HSD 15 Thg10 2026", "2026-10-15", "use_by"),
            ("BBE 20 Tháng 5 2025", "2025-05-20", "best_before"),
            ("EXP 01 Thg1 2027", "2027-01-01", "use_by"),
        )

        for text, expected_date, expected_label in cases:
            with self.subTest(text=text):
                parsed = parse_date_candidates(text)
                self.assertEqual(len(parsed), 1)
                self.assertEqual(parsed[0]["parsed_date"], expected_date)
                self.assertEqual(parsed[0]["date_label_type"], expected_label)

    def test_ambiguous_expiry_is_not_selected_automatically(self):
        candidates, warnings = normalized_candidates("EXP 05/06/2026")
        expiry = candidates["expiry_date"]
        self.assertIsNone(expiry["value"])
        self.assertTrue(expiry["ambiguous"])
        self.assertTrue(expiry["requires_confirmation"])
        self.assertEqual(expiry["alternatives"], ["2026-06-05", "2026-05-06"])
        self.assertIn("AMBIGUOUS_EXPIRY_DATE", warnings[0])

    def test_manufactured_date_never_becomes_expiry(self):
        candidates, warnings = normalized_candidates("MFG 2026-03-01\nEXP 2026-12-31")
        self.assertEqual(candidates["manufactured_date"]["value"], "2026-03-01")
        self.assertEqual(candidates["expiry_date"]["value"], "2026-12-31")
        self.assertEqual(candidates["expiry_date"]["date_label_type"], "use_by")
        self.assertTrue(candidates["expiry_date"]["requires_confirmation"])
        self.assertEqual(warnings, [])

        manufactured_only, _ = normalized_candidates("MFG 2026-03-01")
        self.assertEqual(manufactured_only["manufactured_date"]["value"], "2026-03-01")
        self.assertIsNone(manufactured_only["expiry_date"]["value"])

    def test_scan_result_uses_nested_candidate_contract(self):
        candidates, warnings = normalized_candidates("EXP 2026-12-31")
        result = ScanResult(
            raw_text="EXP 2026-12-31",
            candidates=candidates,
            warnings=warnings,
            errors=[],
            execution_time_ms=12,
        )
        payload = result.model_dump()
        self.assertEqual(payload["candidates"]["expiry_date"]["value"], "2026-12-31")
        self.assertIn("manufactured_date", payload["candidates"])

    def test_unlabelled_date_does_not_become_expiry(self):
        candidates, warnings = normalized_candidates("Packed 2026-12-31")
        self.assertIsNone(candidates["expiry_date"]["value"])
        self.assertEqual(candidates["expiry_date"]["date_label_type"], "unknown")
        self.assertTrue(candidates["expiry_date"]["requires_confirmation"])
        self.assertTrue(any("UNLABELLED_DATE" in warning for warning in warnings))

    def test_preprocess_empty_and_invalid_images_raise_scan_error(self):
        for payload in (b"", b"not an image"):
            with self.subTest(payload=payload):
                with self.assertRaises(ScanError) as raised:
                    preprocess_image(payload)
                self.assertEqual(raised.exception.code, "INVALID_IMAGE_BYTES")

    def test_decode_image_bytes(self):
        original = b"test-image-content"
        b64_str = base64.b64encode(original).decode()
        self.assertEqual(decode_image_bytes(f"data:image/png;base64,{b64_str}"), original)


class TestScanRouteEngineSelection(unittest.TestCase):
    def _scan(self):
        from PIL import Image

        image = Image.new("RGB", (32, 32), "white")
        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        return process_scan(buffer.getvalue())

    def test_uses_datereg_candidates(self):
        with patch("app.routes.scan.extract_datereg_text", return_value="EXP 15/10/2026"), patch(
            "app.routes.scan.extract_ocr_text", side_effect=AssertionError("unexpected fallback")
        ):
            result = self._scan()

        self.assertEqual(result.candidates.expiry_date.value, "2026-10-15")
        self.assertEqual(result.candidates.expiry_date.date_label_type, "use_by")

    def test_falls_back_to_tesseract_when_datereg_fails(self):
        with patch("app.routes.scan.extract_datereg_text", side_effect=RuntimeError("missing weights")), patch(
            "app.routes.scan.extract_ocr_text", return_value="EXP 15/10/2026"
        ):
            result = self._scan()

        self.assertEqual(result.candidates.expiry_date.value, "2026-10-15")
        self.assertTrue(any("falling back to Tesseract" in warning for warning in result.warnings))


if __name__ == "__main__":
    unittest.main()
