# Current schema input/output guide

- Document ID: `DOC-SCHEMA-IO`
- Status: **Review**
- Updated: 2026-10-13

Evidence labels: **[A]** observed in current contracts/source/migrations or recorded local test evidence; **[C]** interpretation; **[D]** proposal. The executable authority for physical schema is the immutable MySQL migrations and the public contract for HTTP shapes. This guide explains their boundary.

## Boundary and ownership

[A] React owns editable drafts and scan review. Express authenticates the principal, validates command DTOs, applies domain rules and coordinates MySQL transactions. MySQL owns persisted user, food-entry, movement, idempotency, credential, session, and migration rows. Python Scan receives an image and returns transient OCR candidates; it has no database write path. A candidate becomes persisted food data only after a person reviews it in the create form and submits the create command.

[A] The current schema has seven tables and 53 columns: `users`, `food_entries`, `stock_movements`, `api_requests`, `local_credentials`, `user_sessions`, and `schema_migrations`. Five foreign keys connect user ownership, credentials, sessions, requests, and movements. There is no persisted attention status; attention is derived from an owner-local `as_of_date`, date fields, quantity, and preferences.

## Operation input/output map

Contract names below refer to the 17 operations in `contracts/openapi.json` (13 food/preferences/scan plus four auth operations). All requests use `/api/v1`. Private operations require a valid session cookie. Every unsafe browser request requires the configured `Origin` and per-session `X-CSRF-Token`; registration and login require configured `Origin` but do not require a preexisting CSRF token. Writes API-01, API-04…06, API-08, API-10, and API-12 additionally require client-supplied `Idempotency-Key` (8–100 allowed characters). The server derives the principal from the validated session; clients do not submit `user_id`. Expected versions are positive integers ≤ 2147483647. Exact error body schemas remain in the contract.

| Operation | Input: required / optional | Persisted effect | Output / null/default behavior |
|---|---|---|---|
| `POST /food-entries` | Required body: `name`, `quantity` decimal string, `unit`; optional location/date/certainty/source/label type/opened date/note. Requires client `Idempotency-Key`; server derives principal | Insert entry and one initial movement atomically; idempotency result recorded | `201 Entry` with `id`, all submitted metadata (nullable date/opened/note fields are present), decimal-string `remaining_quantity`, `unit`, `version`, derived `lifecycle`/`attention`, `deleted_at`, `created_at`, `updated_at`; location defaults to `unspecified`; date defaults are null/unknown/unknown/unspecified |
| `GET /food-entries` | Optional page, limit, q, location, view, lifecycle, attention; principal required | Read only | `200 EntryList`: `items: Entry[]`, `pagination: {page,limit,total}`, required owner-local `as_of_date`, even when empty |
| `GET /food-entries/{id}` | Path id, principal | Read only | `200 Entry`; foreign or missing ID is `404` |
| `PATCH /food-entries/{id}` | At least one of name, storage_location, expiry_date, date_certainty, date_source, date_label_type, opened_on, note plus required `expected_version`; requires key; quantity/unit are excluded | Metadata and version only | `200 Entry` with all Entry fields; quantity and unit remain unchanged; date certainty/source/label state is validated after merge |
| `DELETE /food-entries/{id}` | Path id, `expected_version` query, client `Idempotency-Key`; requires session, Origin and CSRF | Set visibility tombstone; no movement | `204` (body is absent; stored replay body uses JSON null) |
| `POST /food-entries/{id}/movements` | Body `kind`, positive decimal-string `amount`, `expected_version`, optional nullable `reason`; key; requires Origin and CSRF | Lock owned row; update quantity/version and append immutable movement | `201 MutationResult` `{entry: Entry, movement: Movement, changed:true}`; quantities and delta are decimal strings |
| `POST /food-entries/{id}/recounts` | Body decimal-string `actual_quantity`, nonblank `reason`, `expected_version`; key; requires Origin and CSRF | Update and append adjustment only if value changes | `201 MutationResult` when changed; same-value recount is `200`, `changed:false`, `movement:null`; output is `{entry, movement, changed}` |
| `GET /food-entries/{id}/movements` | Path id, optional page/limit, principal | Read only | `200 MovementList` `{items: Movement[], pagination:{page,limit,total}}`; parent entry owner check applies |
| `GET /trash/food-entries` | Optional page/limit, principal | Read only | `200 EntryList` with deleted rows and required `as_of_date` |
| `POST /food-entries/{id}/restore` | `expected_version` body and client key; requires Origin and CSRF | Clear tombstone, increment version | `200 Entry`; no stock movement |
| `GET /me/preferences` | Principal | Read only | `200 Preferences` |
| `PATCH /me/preferences` | `expected_version` and at least one of timezone/attention lead days; client key; requires Origin and CSRF | Update user preference/version | `200 Preferences` `{timezone, attention_lead_days, version}`; lead days default to 2 |
| `POST /scans` | Authenticated multipart image (`image`) or JSON `image_base64`; size/type validated; no command idempotency key | No food, movement, or OCR-sample row is written | `200 ScanResult` `{raw_text:string, candidates:object, warnings:string[], errors:string[], requires_confirmation:boolean}`; raw text and candidates objects are present; candidate values may be null and date alternatives may be ambiguous; manufactured date is distinct from expiry date |
| `POST /auth/register` | Required email/password/display_name; optional timezone defaults to Asia/Ho_Chi_Minh; configured Origin required | Create local credential, user, and session | `201 AuthSession` `{user:{id,display_name,email,timezone,attention_lead_days,version},csrf_token,expires_at}`; verifier/token are never public fields |
| `POST /auth/login` | Required email/password; configured Origin required | Rotate/create session | `200 AuthSession` with the same shape as register; invalid credentials return 401 Problem; credential material excluded |
| `GET /auth/session` | Session cookie | Cookie required for a valid session | `200 AuthSession` or `401 Problem` for missing/invalid/expired session |
| `POST /auth/logout` | Valid session cookie plus configured Origin and per-session `X-CSRF-Token` | Revoke session | `204`; no password reset/change operation is exposed |

[A] `ScanResult.raw_text` is always a string and `candidates` is always an object; only candidate values can be null. Expiry candidates carry date certainty, label kind, source text, alternatives, ambiguity, and `requires_confirmation:true`; manufactured-date candidate is a different object. Quantities are decimal **strings**, not JSON numbers: finite, maximum `999999999.999`, at most three fractional digits; units are `piece`, `g`, `ml`, and `piece` values must be whole. Server-owned response fields include principal/owner, IDs, versions, created/updated/deleted/recorded timestamps, lifecycle, attention, and movement/audit rows.

## OCR sample table proposal — review only

**[D] Candidate physical name: `ocr_training_samples`.** This is one proposed review table for labeled OCR image/crop samples; it is not part of the current seven-table schema or migration history. No executable DDL, migration, endpoint, upload/storage workflow, training run, or production collection is authorized or described. “Deep Learning data” here means OCR sample/label records that could later support evaluation or training review; it does not approve a model or collect household inventory images.

### Candidate MySQL-compatible fields

| Field | Candidate type and constraints | Meaning / review decision |
|---|---|---|
| `sample_id` | `CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY` | Stable sample ID |
| `sample_version` | `INT NOT NULL DEFAULT 1` | Annotation optimistic version; increment on accepted correction |
| `image_ref` | `VARCHAR(512) NOT NULL` | Reference into separately governed sample storage; never image bytes in this row |
| `crop_ref` | `VARCHAR(512) NULL` | Optional crop reference |
| `image_sha256` | `CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` | Hash of the original image; hash does not anonymize it and multiple crops may share it |
| `sample_sha256` | `CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL UNIQUE` | Hash of the exact image or crop bytes represented by this row; deduplicates sample content |
| `mime_type` | `VARCHAR(32) NOT NULL` | Candidate values: `image/jpeg`, `image/png`, `image/webp` |
| `source_kind` | `VARCHAR(24) NOT NULL` with CHECK over `synthetic`, `user_contributed`, `licensed_public` | Provenance class |
| `source_license_ref` | `VARCHAR(255) NULL` | License/permission record reference where applicable |
| `consent_status` | `VARCHAR(16) NOT NULL` with CHECK over `not_applicable`, `pending`, `granted`, `withdrawn` | Consent state for user-contributed material; not an automatic collection permission |
| `eligibility_status` | `VARCHAR(16) NOT NULL DEFAULT 'pending'` with CHECK over `pending`, `eligible`, `ineligible`, `withdrawn` | Independent release-eligibility decision |
| `review_status` | `VARCHAR(20) NOT NULL DEFAULT 'pending'` with CHECK over `pending`, `accepted`, `rejected`, `needs_correction` | Human annotation status |
| `annotator_ref` | `VARCHAR(128) NULL` | Opaque reviewer reference; identity, roles, and access control need separate policy |
| `raw_ocr_text` | `TEXT NULL` | OCR engine transcription, immutable after capture |
| `verified_text` | `TEXT NULL` | Corrected transcription kept separately from raw output |
| `expiry_date_label` | `DATE NULL` | Verified HSD/EXP/use-by/best-before date |
| `expiry_label_kind` | `VARCHAR(16) NOT NULL DEFAULT 'unknown'` with CHECK over `use_by`, `best_before`, `unknown` | Semantic kind for expiry label |
| `manufactured_date_label` | `DATE NULL` | Verified NSX/MFG date; never treated as expiry |
| `model_prediction` | `JSON NULL` | Prediction snapshot, separate from ground truth |
| `model_version` | `VARCHAR(128) NULL` | Engine/model version that produced the prediction |
| `dataset_version` | `VARCHAR(64) NULL` | One release version in this one-table candidate |
| `dataset_split` | `VARCHAR(12) NULL` with CHECK over `train`, `validation`, `test` | Split assignment within the named version |
| `group_key` | `CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` | Opaque package/source group; all near-duplicates from one group stay in one split |
| `quality_flags` | `JSON NOT NULL` | Controlled array of blur/glare/crop/language/legibility flags; JSON shape CHECK needs final dialect review |
| `correction_note` | `TEXT NULL` | Annotation rationale subject to access/retention policy |
| `created_at` | `DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)` | Record creation time |
| `reviewed_at` | `DATETIME(6) NULL` | Human review time; not image-capture time |

Candidate indexes: unique `sample_sha256`; non-unique `image_sha256` for grouping crop samples; `(review_status, eligibility_status)` for curation; `(dataset_version, dataset_split, group_key)` for split audits. A candidate CHECK would require `dataset_version` and `dataset_split` to be either both null or both non-null. These are design candidates, not a migration spec. A single table makes each sample belong to at most one dataset version/split at a time. If the same sample must join multiple releases or preserve split history, use a separately reviewed membership table in a later design; do not encode an unbounded list in JSON. No FK to `users` is proposed until contributor identity, withdrawal, deletion propagation, and reviewer roles are resolved. Image storage encryption/access, source eligibility, consent scope/withdrawal, retention, licensing, locale, adjudication, and deletion remain open.

### Input boundary and dataset output are separate

The **annotator input** is a reviewed annotation command, not an image upload endpoint: it identifies an existing restricted sample, supplies its current `sample_version` as `expected_version`, and provides corrected fields. The **dataset output** is a filtered release projection and excludes consent/source secrets and reviewer identity unless explicitly authorized. Example values below are synthetic and illustrative, not collected records.

### Example proposed flow (not implemented)

```json
{
  "IN_annotator": {
    "sample_id": "2b3e32b8-5f13-4eb7-bc33-7d1f4d477d60",
    "expected_version": 1,
    "verified_text": "NSX: 10/10/2026; HSD: 25/12/2026",
    "expiry_date_label": "2026-12-25",
    "expiry_label_kind": "use_by",
    "manufactured_date_label": "2026-10-10",
    "review_status": "accepted",
    "quality_flags": ["legible"],
    "correction_note": "NSX and HSD labels were separately readable."
  },
  "OUT_dataset_record": {
    "sample_id": "2b3e32b8-5f13-4eb7-bc33-7d1f4d477d60",
    "sample_sha256": "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92",
    "image_sha256": "a969e8b1e4ec4aab8a34f0f83c98723f625847a0f24f37d1699b17f92b8cc8af",
    "mime_type": "image/jpeg",
    "raw_ocr_text": "NSX 10/10/26 HSD 25/12/26",
    "verified_text": "NSX: 10/10/2026; HSD: 25/12/2026",
    "expiry_date_label": "2026-12-25",
    "expiry_label_kind": "use_by",
    "manufactured_date_label": "2026-10-10",
    "model_prediction": null,
    "model_version": null,
    "dataset_version": "ocr-labels-v1",
    "dataset_split": "train",
    "group_key": "6f5902ac237024bdd0c176cb93063dc4a4a8e7ff3c5f54a17d1ea6d2f5a9b1c3"
  }
}
```

The example is illustrative: it demonstrates separate raw/verified text and separate manufactured/expiry labels. It does not indicate that an image was uploaded, stored, reviewed, or approved.

## Evidence and unresolved source references

[A] Current physical field definitions: `erd-workbench/03_ENTITY_DICTIONARY.md`, migrations `001_initial_schema.sql` and `002_local_auth.sql`. Current API shapes: `contracts/public-api.yaml`, `contracts/openapi.json`, and `contracts/scan-api.yaml`. Some inherited narrative documents still contain pre-reconciliation endpoint names, removed UI stubs, and old paths. This guide does not silently rewrite original stakeholder/source snapshots; unresolved original citations remain called out in the dated reconciliation report.

## Purpose

Map current API inputs and outputs to their persistence boundary and document one OCR sample-table proposal for review.

## Evidence sources

- `contracts/openapi.json`
- `contracts/public-api.yaml` and `contracts/scan-api.yaml`
- `database/mysql/migrations/001_initial_schema.sql` and `002_local_auth.sql`
- `docs/architecture/06-data-model/erd-workbench/03_ENTITY_DICTIONARY.md`

## Definitions and assumptions

Current schema is implemented candidate state; OCR sample table is proposal only. No source eligibility, consent, storage, dataset, or training approval is implied.

## Analysis

The operation map separates client input, server-derived identity/version/audit values, persisted rows, and response projections. Dataset ground truth stays distinct from raw OCR and model prediction.

## Decisions and rationale

[D] Keep OCR label curation as one bounded candidate table for review. Resolve repeat-release membership, consent/retention, source eligibility, and access policy before any physical implementation.

## Dependencies

- Current API and migration sources listed above.

## Open questions

Who may contribute/review samples; what lawful source eligibility applies; how withdrawal/deletion propagates; whether multi-version membership is needed; how labels are adjudicated.

## Related documents

- [Data model index](README.md)
- [Dated reconciliation](../10-testing/schema-reconciliation-2026-10-13.md)
- [Current entity dictionary](erd-workbench/03_ENTITY_DICTIONARY.md)

## Verification criteria

Reconcile every current operation/output and physical table against the cited contracts/migrations. Treat proposed OCR fields as review only; no migration or upload behavior is verified.
