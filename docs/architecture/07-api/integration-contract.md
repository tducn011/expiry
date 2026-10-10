# DOC-OCR-CONTRACT — Conditional Python integration seam

- Document ID: `DOC-OCR-CONTRACT`
- Status: **Draft**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

Extraction contract ready for research discussion; no approved endpoint/entity.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

Status: conditional proposal only; no `/ocr` route is added to canonical MVP OpenAPI.

Pipeline: user image → Express image validation/owner correlation → bounded Python executor → text and parsed candidates → normalization/field validation → user preview/correction/confirmation → ordinary EntryCreate service. Python never writes food tables or approves safety.

| Contract aspect | Proposed boundary / open acceptance |
|---|---|
| Input | Validated bytes/task correlation; content signature/decode/dimensions capped; numeric limits chosen from measured resource budget |
| Preprocessing | Optional orientation/crop/contrast steps, record parameters; retain user original only under explicit retention policy |
| Execution | Pinned engine/models; warm/cold timing and memory measured |
| Output | Versioned raw text + field candidates/source spans/ambiguity/errors; no durable IDs assigned |
| Timeout/retry | Bounded execution; cancel/kill/cleanup; retry same extraction task without duplicating domain writes |
| Validation | Invalid image/multiple/ambiguous date returns explicit candidates/errors; no default guessed expiry |
| Cleanup | Success/failure/cancel all clean transient image/output; exact retention pending |
| Persistence | Only confirmed, domain-valid DTO through backend capture; generated fields remain proposals until user confirms |

Illustrative output — not selected production schema:

```json
{
  "schema_version": "0.1-proposed",
  "request_id": "opaque-correlation-id",
  "raw_text": "EXP 03/04/26",
  "candidates": {
    "expiry_date": {
      "value": null,
      "alternatives": [
        "2026-04-03",
        "2026-03-04"
      ],
      "source_text": "03/04/26",
      "ambiguous": true,
      "requires_confirmation": true
    }
  },
  "warnings": [
    "AMBIGUOUS_DATE"
  ],
  "errors": []
}
```

Mode alternatives: in-process/local spike least deployment cost; subprocess bounds process and memory; HTTP service isolates scaling but adds auth/network/ops; queue helps jobs/retries only when workload and latency warrant it. Synchronous vs asynchronous cannot be selected without timing/workload measurements. Express/Python contract tests must cover schema version, invalid image, ambiguous date, timeouts/cancellation/cleanup and confirmed manual fallback.

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [04-technology-research/ocr-research.md](../04-technology-research/ocr-research.md)
- [adr/ADR-004-ocr-boundary.md](../adr/ADR-004-ocr-boundary.md)
- [10-testing/test-catalog.md](../10-testing/test-catalog.md)

## Open questions

Approval of OCR feature, dataset, file caps, timeout, language/models, host/process support and retention are all pending.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](../11-traceability/README.md)
- [04-technology-research/ocr-research.md](../04-technology-research/ocr-research.md)
- [adr/ADR-004-ocr-boundary.md](../adr/ADR-004-ocr-boundary.md)
- [10-testing/test-catalog.md](../10-testing/test-catalog.md)

## Verification criteria

Đối chiếu nguồn, ID và downstream links; acceptance runtime chỉ được ghi pass sau khi thực chạy.
