# DOC-SCAN-CONTRACT — Current OCR scan integration contract

- Document ID: `DOC-SCAN-CONTRACT`
- Status: **Review**
- Updated: 2026-10-13

## Purpose

Describe the current public Node API and internal Python service contract for explicit OCR scan assistance in the Add form. This is a source-aligned interface description, not an SLA, model-quality claim, data-collection approval, or production acceptance.

## Evidence sources

- [Public API OpenAPI](../../../contracts/public-api.yaml), operation `API-13`
- [Internal Python scan OpenAPI](../../../contracts/scan-api.yaml)
- [Node scan controller and routes](../../../apps/api/src/modules/scan/scan.controller.mjs)
- [Node scan service and image validation](../../../apps/api/src/modules/scan/scan.service.mjs)
- [Python scan routes and OCR implementation](../../../services/python-scan/app/routes/scan.py)
- [Python response types](../../../services/python-scan/app/schemas/scan.py)
- [Current client-side scan projection](../../../apps/web/src/api/client.ts)
- [Review-only schema proposal and current boundaries](../06-data-model/schema-input-output.md)

## Definitions and assumptions

**[A]** The browser calls the authenticated public Node endpoint, not Python directly. In the current `ApiClient`, the UI sends one multipart file as field `image` to `POST /api/v1/scans`. The public OpenAPI also describes JSON `image_base64`; the Node controller accepts that request form for its `/scan` handler. The Node service validates/decodes the image and sends JSON `{ "image_base64": "..." }` to Python `/scan`, with an optional `X-Correlation-ID`. The Python service also supports multipart field `file` for direct internal callers.

**[A]** Python health reports `status`, `service`, `version`, and `tesseract_available`. Node projects that to the public health shape with `status` equal to `healthy` or `unavailable`, and includes service/version/availability. `healthy` is conditional on the Tesseract binary being available.

## Analysis

### Request and ownership flow

```text
EntryForm file selection
  → ApiClient POST /api/v1/scans (multipart field `image`, cookie + CSRF token)
  → Node checks one file, 5 MiB limit and JPEG/PNG/WebP bytes
  → Node POSTs JSON image_base64 + optional correlation ID to Python /scan
  → Python decodes, preprocesses, runs Tesseract and deterministic date parsing
  → Node validates and projects the nested candidate response
  → UI displays raw text/candidates for explicit review and apply
  → user separately submits the ordinary create command
```

The scan endpoint returns transient text/candidates. Python has no MySQL connection; no scan result creates inventory, movement, or training data. The selected Add form candidate is still editable. Manufactured-date values remain distinct from expiry selection; a candidate labeled `manufactured` is not silently treated as an expiry date.

### Public request and response

Public operation: `POST /api/v1/scans` (`API-13`). The current browser uses `multipart/form-data` with exactly one file field named `image`; supported image types are JPEG, PNG, WebP and decoded image bytes are limited to 5 MiB. The public contract also defines JSON with required `image_base64`. Unsafe public requests require the session `X-CSRF-Token` and configured exact `Origin`; session cookies are included by the client. This request is available only in the authenticated Add flow.

A successful response has required top-level `raw_text` (string), `candidates` (strict object), `warnings` (string array), `errors` (string array), and `requires_confirmation: true`. `candidates` requires `food_name` (string or null), `expiry_date`, and `manufactured_date`. Expiry candidate fields are `value` (ISO calendar-date string or null), `date_certainty` (`exact`, `inferred`, or null), `date_label_type` (`expiry`, `best_before`, `use_by`, `manufactured`, or `unknown`), `source_text` (string), `alternatives` (calendar-date strings), `ambiguous` (boolean), and `requires_confirmation: true`. Manufactured candidate contains `value` (calendar-date string or null) and `source_text` (string). There is no confidence percentage in this response.

The current successful public response intentionally omits Python `execution_time_ms`; it adds public `requires_confirmation: true`. Node rejects malformed internal results as `INVALID_SCAN_RESPONSE`; it nulls the expiry `value` when the date is ambiguous or the candidate label is `manufactured`. Warnings communicate parser conditions such as ambiguous expiry/manufactured dates or unlabeled dates; successful `errors` is currently an empty string array from Python. Candidate values can be null while their object and supporting fields remain present.

Example shape (illustrative values, no promise of OCR accuracy):

```json
{
  "raw_text": "MFG 10/10/2026\nEXP 25/12/2026",
  "candidates": {
    "food_name": null,
    "expiry_date": {
      "value": "2026-12-25",
      "date_certainty": "exact",
      "date_label_type": "expiry",
      "source_text": "25/12/2026",
      "alternatives": [],
      "ambiguous": false,
      "requires_confirmation": true
    },
    "manufactured_date": {
      "value": "2026-10-10",
      "source_text": "10/10/2026"
    }
  },
  "warnings": [],
  "errors": [],
  "requires_confirmation": true
}
```

### Internal request/response and errors

The Node worker call uses `POST /scan` with JSON `{ "image_base64": "..." }`. Direct internal multipart requests use field `file`; they are not the browser's public field name. Internal Python response also has integer `execution_time_ms` and does not have public `requires_confirmation`. The Node projector validates the internal result and exposes the public shape above.

Current source handles these failure classes: malformed/base64/image bytes or malformed multipart (400); image too large (413); unsupported type (415); no legible text (422 `NO_LEGIBLE_TEXT`); unavailable OCR engine (503 `OCR_ENGINE_UNAVAILABLE`); Python OCR deadline (504 `OCR_TIMEOUT`); OCR processing failure (500 `OCR_FAILED`). Node may surface unavailable worker as 503 `SCAN_SERVICE_UNAVAILABLE`, its worker deadline as 504 `SCAN_TIMEOUT`, or invalid internal response as 502 `INVALID_SCAN_RESPONSE`. The public OpenAPI represents these through `Problem` responses. HTTP 401/403 can also arise at the public authentication/CSRF boundary before scanning. Exact public problem envelopes are owned by the API contract.

The Python OCR process timeout is 2.5 seconds; the Node-to-Python scan request deadline defaults to 3,000 ms. These are implementation timeouts, not user-facing latency guarantees or SLA. Browser-to-Node `ApiClient` uses its general 15-second request timeout. No claim is made about a measured latency distribution.

## Decisions and rationale

**[A]** This current narrative replaces the old response examples and health/SLA claims with the checked-in Node/Python contract. Python owns decoding, preprocessing, OCR, parsing, and internal response types; Node owns public image validation, internal request projection, and the public response boundary; the UI owns human review and the separate create action. **[D]** Any training/evaluation dataset requires a separate source eligibility, consent, retention, and storage decision. The proposed `ocr_training_samples` table remains Review-only and does not change this interface.

## Dependencies

- [OCR boundary ADR](../08-architecture/ADR-004-ocr-boundary.md)
- [Hybrid architecture ADR](../08-architecture/ADR-006-hybrid-architecture.md)
- [Current schema input/output guide](../06-data-model/schema-input-output.md)
- [Dated source and runtime reconciliation](../10-testing/schema-reconciliation-2026-10-13.md)

## Open questions

Operational latency distribution, OCR accuracy by language/package type, persistent sample retention, contributor consent/withdrawal, and any model-training workflow are not established by these contracts and remain open for separate review.

## Related documents

- [Public API OpenAPI](../../../contracts/public-api.yaml)
- [Internal scan OpenAPI](../../../contracts/scan-api.yaml)
- [Current schema input/output guide](../06-data-model/schema-input-output.md)

## Verification criteria

Current statements should match the named contracts and source. A passing contract/documentation check is not evidence of recognition quality, user acceptance, SLA, data eligibility, or production readiness. Status remains Review.
