# Schema and forms reconciliation — 2026-10-13

- Document ID: `DOC-SCHEMA-RECON`
- Status: **Review**
- Updated: 2026-10-13

Status: **Review**. This dated note records source alignment and verification limits; it does not approve product scope or the proposed OCR sample schema.

## Source evidence

- **[A]** API contracts: `contracts/openapi.json`, `contracts/public-api.yaml`, `contracts/scan-api.yaml` describe 17 operations: 13 food/preferences/scan operations and four local-auth operations.
- **[A]** Physical schema: immutable MySQL migrations `001_initial_schema.sql` and `002_local_auth.sql`; current data dictionary and Workbench report describe seven tables, 53 columns, five foreign keys, and 30 CHECK constraints.
- **[A]** Source flow: React `App.tsx`, `EntryForm.tsx`, `ScanForm.tsx`, `AuthForm.tsx`, and `Settings.tsx`; Express auth/inventory/scan modules; Python scanner routes and parser.
- **[A]** Local evidence recorded for this task: API 32 tests and real MySQL/auth checks, DB suite 35 PASS/0 FAIL/5 NOT TESTED, HTTP→Node→MySQL plus Python OCR flow, Python 10 tests on synthetic fixtures. Browser full-flow acceptance is not claimed. A bounded browser check passed for one synthetic-401 Edit recovery: the foreground Auth login was reachable, same-owner Edit draft name/location remained, the immutable Retry was reachable inside the form and applied metadata only, and quantity 500 remained unchanged. The observed lost-response discard test paused an actual HTTP 201 after commit; after releasing interception the UI reported REQUEST_TIMEOUT and allowed immutable Retry. Quantity changed 400 → 350 once, with one discard history event; retry left quantity 350 and history at three events. This instrumented browser result does not establish a precise real-world timeout latency.

## Reconciled behavior

- **[A]** Entry lists require owner-local `as_of_date`, including empty results. Location normalizes blank to `unspecified`; create date defaults are unknown/null/unspecified. Public scan candidates are nested objects.
- **[A]** Metadata edit cannot mutate quantity or unit. Quantity is changed only by consume/discard/recount commands; values must be finite, have up to three decimals, remain at or below `999999999.999`, and be whole for `piece`.
- **[A]** Add is authentication-gated before the create form opens. A pending create command can resume only after same-owner authentication; cancel clears the pending intent. For the bounded synthetic-401 Edit check, same-owner login restored access to the retained draft and its immutable Retry; owner changes clear private selection/pending command state. The bounded lost-response discard recovery passed as described above.
- **[A]** OCR assistance lives inside explicit Add, and reviewed choices populate the editable form. OCR does not create stock. Manufactured date is separate from expiry date. Read-only pages are not inventory input forms apart from search/filter controls.
- **[A]** Forgot-password/reset and change-password success stubs are removed; no such endpoint is present in the current contract.
- **[A]** Figma review is static design evidence. Current source has modal Auth/Add/Edit/action/History composition, selected Detail content in the shell, separate History and Trash surfaces, and fewer Settings actions than some frames; see `.unlazy/expiry-schema-20261013/figma-review.md` for the review record (outside this docs ownership boundary).

## Parent browser integration observations

**[A]** The parent tested the current built React UI against an isolated local test database/API and the real local Python OCR service. Observed flows: guest Add/auth cancel and register continuation; precision validation; ambiguous OCR requires an explicit date choice and populates the form without stock creation; create 500 g; metadata-only edit and same-owner reauthentication; consume 100 g; discard 50 g with lost-response retry; recount requires a reason and records 350 → 375 g; read-only four-event history; search with no result; soft delete and restore preserve 375 g/history; lead-days 0 and Tokyo preference save; mobile 390 px detail/edit/date picker with document width 390 and two-step Escape dismissal.

**[A]** Trash Restore previously selected a deleted row for the active detail query, causing a false 404 before confirmation. `App` now uses action ID plus the existing deleted-row snapshot. The parent rebuilt/reloaded and observed confirmation with no error, followed by successful restoration. Client deadline/replay tests and web typing/build pass. Browser screenshots are task-local evidence, not Figma changes or production acceptance. Settings now remounts by runtime owner and loaded preference snapshot: saved Tokyo/0-day preferences survived reload, a second owner showed defaults, and logout cleared the visible form back to Việt Nam/2 days. The parent observed these flows on the rebuilt UI.

**NOT VERIFIED:** Real camera permission/capture, real devices, all timezone/calendar edge cases, exhaustive accessibility, participant acceptance, deployed service behavior, model accuracy, retention/consent, and production load/SLA. The browser fault injector delayed response processing; no exact 15-second wall-clock claim is made from that browser run.

## Data-model boundary

**[A]** The current schema has seven tables. The new OCR sample table in `schema-input-output.md` is a **[D] review proposal only**. No CREATE statement, migration, upload/store endpoint, training run, or production collection is included. Any future dataset needs source eligibility/consent, independent raw and verified labels, distinct expiry/manufactured labels, versioned dataset splits, and grouping to limit train/test leakage.

## Historical documents and unresolved citations

Historical consolidated exports and stakeholder snapshots remain preserved as authored evidence. Current implementation descriptions supersede their old route, field, and folder references only where this report links to current sources. Current authored-document links were reconciled only where a semantically verified target exists. The deleted `04_Data_Flow_UML_and_Ownership_6.mmd` snapshot is not restored. The immutable 2026-10-09 full extraction still contains 83 exact unavailable/absolute source-link targets across 187 occurrences; the registry records each exact `(source, target)` pair and reason in `archival_link_exceptions`. Those exceptions apply only to that preserved consolidated snapshot and do not exempt other authored documents. Original historical source references remain unresolved where the source file is not present in this checkout; no unrelated current document is substituted.

## Checks and limits

The semantic validator reads the canonical registry at `11-traceability/registry.json`, checks document IDs/required sections/status, node definition paths, requirement-to-test mappings, feature need/requirement links, entity/field ownership, graph references/edges, registry-vs-OpenAPI operation IDs, local OpenAPI `$ref`s, and Markdown links across the architecture tree. `python3 docs/architecture/tooling/validate_architecture.py` reports **PASS**: 78 registered documents, 227 nodes, 349 graph edges, 17 API operations, 1,355 Markdown local links checked, zero broken current links, and 187 occurrences covered by 83 exact archival exception pairs. `python3 -m unittest discover -s docs/architecture/tooling -p 'test_*.py' -v` passes six controls: clean baseline plus rejection of duplicate IDs, dangling graph references, operation registry mismatch, unresolved OpenAPI `$ref`, and a broken current link. These checks validate documentation structure and link integrity; they do not prove endpoint behavior, browser acceptance, authorization security, database production readiness, participant usability, consent, or model quality.

## Purpose

Record the current contract, persisted schema, and UI-flow reconciliation alongside exact verification boundaries for the docs update.

## Evidence sources

- `contracts/openapi.json`, `contracts/public-api.yaml`, and `contracts/scan-api.yaml`
- `database/mysql/migrations/001_initial_schema.sql` and `002_local_auth.sql`
- Current API, auth, web, and Python scan source referenced in the schema guide
- Bounded observed browser check for synthetic-401 Edit recovery, as described in Source evidence

## Definitions and assumptions

[A] Current schema and endpoint descriptions are bounded to checked-in migrations/contracts and cited local evidence. [D] The OCR sample table is a review proposal only. The synthetic-401 Edit recovery result is bounded to the observed browser scenario; no all-flow browser pass is inferred.

## Analysis

The API contracts, migration-backed schema, and current form flows are aligned in the input/output guide. Historical source snapshots remain intact; unavailable citations are enumerated precisely instead of silently redirected.

## Decisions and rationale

[D] Keep `ocr_training_samples` as a review-only candidate and do not add DDL, endpoint, upload, training, or collection behavior. Current authored references are repaired only to verified semantic targets.

## Dependencies

- [Current schema input/output guide](../06-data-model/schema-input-output.md)
- [Canonical traceability registry](../11-traceability/registry.json)
- [Validator and negative controls](../tooling/README.md)

## Open questions

The synthetic-401 Edit and instrumented discard replay scenarios described above are observed. Real-device, participant, production, and broad fault/load acceptance remain open. Dataset source eligibility, consent scope, retention, and multi-release membership also remain unresolved.

## Related documents

- [Architecture index](../README.md)
- [Data model index](../06-data-model/README.md)
- [Traceability index](../11-traceability/README.md)

## Verification criteria

The validator baseline passes; negative controls reject representative broken inputs. Browser, product approval, and production behavior remain separate acceptance boundaries.

