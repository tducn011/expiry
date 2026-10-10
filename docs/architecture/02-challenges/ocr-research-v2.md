# DOC-OCR-RESEARCH — OCR hypotheses, libraries and benchmark plan

- Document ID: `DOC-OCR-RESEARCH`
- Status: **Review**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

Evaluate supporting capability without choosing an unmeasured production service.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

OCR extracts image text; parsing chooses date/name/amount candidates; normalization sets formats; validation checks coherent fields; user confirms; ordinary backend capture persists. A printed manufacture date, ambiguous 03/04/26 or storage/opening note must not silently become expiry. A barcode does not guarantee an expiry field.

### Candidate inventory [B metadata / D evaluation]

Tesseract engine release observed: 5.5.3, Apache-2.0 reference repository; pytesseract is a Python wrapper requiring a separate engine binary/traineddata. Prior document-extraction OCR used a temporary 5.5.0 binary; it is not evidence that food-label capture works or that a Python subsystem is installed in Expiry.

| Package | Observed release | Python metadata | License metadata | Dependencies excerpt | Source |
|---|---|---|---|---|---|
| easyocr | 1.7.2 | not declared in metadata | Apache License 2.0 | torch, torchvision>=0.5, opencv-python-headless, scipy | [PyPI](https://pypi.org/project/easyocr/1.7.2/) |
| paddleocr | 3.7.0 | >=3.8 | Apache License 2.0 | paddlex[ocr-core]<3.8.0,>=3.7.0, PyYAML>=6, requests, aiohttp>=3.8.0 | [PyPI](https://pypi.org/project/paddleocr/3.7.0/) |
| opencv-python-headless | 5.0.0.93 | >=3.6 | Apache 2.0 | numpy<2.0; python_version < "3.9", numpy>=2; python_version >= "3.9" | [PyPI](https://pypi.org/project/opencv-python-headless/5.0.0.93/) |
| pytesseract | 0.3.13 | >=3.8 | Apache License 2.0 | packaging>=21.3, Pillow>=8.0.0 | [PyPI](https://pypi.org/project/pytesseract/0.3.13/) |

EasyOCR requires model/runtime resources; PaddleOCR requires compatible inference dependencies; exact CPU/GPU/runtime support must be tested on target hosting. OpenCV assists resize/deskew/contrast/crop; it is not an OCR or date-semantics engine. Python metadata is not a guarantee every wheel/model works on every declared interpreter. Licenses of wrapper, engine, dependencies, model weights and assets need separate pin review.

### POC experiment [D], not executed

Collect consented food-package images with ground truth: multiple date lines, DD/MM/YY ambiguity, use-by/best-before, English/Vietnamese labels, curved/glossy packaging, blur/low light, irrelevant receipt/barcode and no date. Keep fixed train/tuning/held-out separation and image IDs. Manual-entry baseline must use same fields/user tasks. Compare candidate engines without tuning on held-out images.

Measure exact field precision/recall, date ambiguity detection, failure/false-date rate, user correction time and end-to-end capture time, p50/p95 cold/warm latency, peak RSS/CPU, model download/cold-start size, cost and cleanup. Record versions/OS/hardware/parameters/sample counts; raw OCR confidence is not calibrated truth. No benchmarks were run, so no winner or numeric speed/accuracy claim.

Proposed privacy: accept only task-relevant image, validate bytes/MIME/dimensions/decode limits, strip metadata, bounded memory/process timeout, cleanup transient files on success/failure/cancel; retention must be explicit and consented. No automatic remote model upload or analytics inventory payload. Manual path remains available.

Promotion gate: show capture benefit after corrections, coherent date-field uncertainty handling and acceptable host resources; then approve ADR-004 and integration contract. Without that result keep OCR Later / Research Required.

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [03-requirements-features/unsupported-proposals.md](../03-requirements-features/unsupported-proposals.md)
- [17-python-ocr/integration-contract.md](../17-python-ocr/integration-contract.md)
- [adr/ADR-004-ocr-boundary.md](../adr/ADR-004-ocr-boundary.md)

## Open questions

Dataset/consent, target hardware/latency/cost threshold, expected image fields and retention duration remain unprovided.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](../11-traceability/README.md)
- [03-requirements-features/unsupported-proposals.md](../03-requirements-features/unsupported-proposals.md)
- [17-python-ocr/integration-contract.md](../17-python-ocr/integration-contract.md)
- [adr/ADR-004-ocr-boundary.md](../adr/ADR-004-ocr-boundary.md)

## Verification criteria

POC report must contain measured food-label results; temporary OCR of slides cannot pass the product OCR gate.
