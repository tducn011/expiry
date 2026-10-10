import unittest
import sys
from pathlib import Path

# Add services/python-scan to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.scanner.date_parser import parse_date_candidates, classify_label_type
from app.scanner.preprocessor import decode_image_bytes, preprocess_image


class TestScannerLogic(unittest.TestCase):
    def test_classify_label_type(self):
        self.assertEqual(classify_label_type("EXP 15/10/2026"), "use_by")
        self.assertEqual(classify_label_type("BEST BEFORE: 2026-11-01"), "best_before")
        self.assertEqual(classify_label_type("BB 01/01/2027"), "best_before")
        self.assertEqual(classify_label_type("HSD 20/05/2026"), "use_by")
        self.assertEqual(classify_label_type("Product of Vietnam"), "unspecified")

    def test_parse_iso_date(self):
        text = "Batch #12345\nEXP: 2026-12-31\nKeep refrigerated"
        candidates = parse_date_candidates(text)
        self.assertEqual(len(candidates), 1)
        self.assertEqual(candidates[0]["parsed_date"], "2026-12-31")
        self.assertEqual(candidates[0]["date_label_type"], "use_by")
        self.assertEqual(candidates[0]["certainty"], "known")

    def test_parse_slash_date(self):
        text = "BEST BEFORE 15/08/2026"
        candidates = parse_date_candidates(text)
        self.assertEqual(len(candidates), 1)
        self.assertEqual(candidates[0]["parsed_date"], "2026-08-15")
        self.assertEqual(candidates[0]["date_label_type"], "best_before")

    def test_parse_textual_month(self):
        text = "Expiry Date: 25 Oct 2026"
        candidates = parse_date_candidates(text)
        self.assertEqual(len(candidates), 1)
        self.assertEqual(candidates[0]["parsed_date"], "2026-10-25")

    def test_preprocess_empty_image(self):
        _, err = preprocess_image(b"")
        self.assertEqual(err, "Empty image payload")

    def test_decode_image_bytes(self):
        import base64
        original = b"test-image-content"
        b64_str = base64.b64encode(original).decode()
        decoded = decode_image_bytes(f"data:image/png;base64,{b64_str}")
        self.assertEqual(decoded, original)


if __name__ == "__main__":
    unittest.main()
