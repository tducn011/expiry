# Expiry — model audit

Status: candidate implementation of a review model, 2026-10-10. SQL verification does not approve stakeholder requirements.

## Current context and resolved sources [A]

Repository root `/home/pro/Downloads/expiry`, branch `feature/ui`, baseline `6d2a078fed3e1a5c1c54fb19bc7b20765720256c`. Existing UI changes and deleted historical paths predate this task. No phase-one folder or ZIP was found. Actual sources are flat in `docs/` and `contracts/`; historical references to `docs/architecture/`, `doc/SystemEngineer/` and `Expiry_System_Design_2026-10-08/` are not resolved files today.

| Requested source group | Resolved files read |
|---|---|
| Foundation | `docs/system-definition.md`, `docs/scope.md`, `docs/00_Context_and_Evidence.md`, `docs/decisions-and-questions.md` |
| Personas/research | `docs/01_Research_Personas_and_Opportunities.md`, `docs/P01-persona.md`, `docs/P02-persona.md`, `docs/P03-persona.md`, `docs/final-check-persona-alignment.md` |
| Requirements | `docs/02_Requirements_and_Business_Rules.md`, `docs/business-rules.md`, `docs/nonfunctional-requirements.md` |
| Interactions | `docs/03_User_Flows_Scenarios_and_Use_Cases.md`, `docs/scenarios.md`, `docs/use-cases.md` |
| Behavior | `docs/04_Data_Flow_UML_and_Ownership.md`, `docs/ownership.md`, `docs/data-flows.md` |
| Model | `docs/05_Data_Definitions_and_ERD.md`, `docs/dictionary.md`, `docs/erd.md`, `contracts/schema_reference_postgresql.sql` |
| API/validation | `docs/06_API_Routes_and_Contracts.md`, `contracts/openapi.json`, `contracts/fixtures.json`, `docs/09_Traceability_Implementation_and_Verification.md` |
| Observed prototype | `uidemo/src/mockApi.ts`, `uidemo/package.json` |

## Problem, boundary and ownership

Symptom: the project has a PostgreSQL reference and in-memory UI, with no applied MySQL migration or real DB acceptance evidence. Goal: preserve private food capture/review/resolve semantics while testing candidate persistence. System owns digital records; user reports physical use/disposal/count. Three personas describe behavioral needs, not three database roles. P1 needs visibility, P2 context when plans change, P3 low-friction accurate updates. DEC-01/02 are recorded-confirmed private/manual/in-app scope. Grain, ledger, default two-day lead, units/date policy and auth/provider remain proposed/open.

`principal → validated command → transaction/idempotency reservation → owner-scoped row lock → entry + append ledger + saved response → commit → DTO/refetch`

State owner: DB `food_entries.remaining_quantity` after commit; ledger is audit evidence in the same transaction. Transaction owner: new sandbox repository under `database/mysql/src/`, not the UI. Identity establishment remains outside the sandbox; repository receives a trusted principal identifier. Read attention uses injected UTC instant converted to owner-local calendar date. Delete/restore affect visibility/version only.

## Source evidence

FILE: `contracts/schema_reference_postgresql.sql`  
ROLE: draft persistence reference.  
EVIDENCE: native `uuid`, `timestamptz`, `jsonb`, regex `~`, partial indexes, four tables, `BEGIN/COMMIT`.  
ISSUE: cannot execute unchanged on MySQL; FK alone cannot require an initial child or authorize owner access.  
CONFIDENCE: High.

FILE: `docs/business-rules.md`  
ROLE: RULE-01…24 definitions.  
EVIDENCE: RULE-04/19 require atomic entry/ledger/replay; RULE-15 separates soft delete from discard; RULE-20 specifies priority before pagination.  
ISSUE: candidate behavior needs real integration tests; document status is Review.  
CONFIDENCE: High.

FILE: `uidemo/src/mockApi.ts`  
ROLE: in-memory prototype, singleton records and demo clock.  
EVIDENCE: `DateCertainty = exact`, `quantity_movements/recount`, `DEMO_DATE = 2026-10-08`, numeric quantities and `usr_demo` identity.  
ISSUE: DTO/enums/clock differ from contract; no deployed API authentication or real concurrency.  
CONFIDENCE: High.

## Candidate traceability (food namespace)

| Persona → need | BR/FR/RULE | UC/SC | Process → field/relation | Planned real test |
|---|---|---|---|---|
| P1 visibility, easy capture | BR-V1-01/03, FR-01, RULE-02/04 | UC-01, SC-01 | capture → entry + initial + request | DB-CREATE, TX-CREATE |
| P1/P2 honest unknown | BR-V1-02, FR-01/03, RULE-09/10/22 | UC-01/03, SC-02 | unknown → nullable DATE + metadata | DATE-STATES |
| P1 notice first | BR-V1-01, FR-02/03, RULE-12/20 | UC-02/03, SC-03 | classify before limit → owner/date/created/id | QUERY-PRIORITY |
| P2 plan changed | BR-V1-02, FR-03/04, RULE-14 | UC-03/04, SC-04 | reason/date context → selected consume | QUERY-PRIORITY; user decision effectiveness unverified |
| P3 accurate use | BR-V1-03, FR-04, RULE-03/05 | UC-04, SC-05/08 | reduce → remaining + consume | QUANTITY-VALIDATION, TX-MOVEMENT |
| All distinguish use/waste | BR-V1-03, FR-04, RULE-16 | UC-05, SC-06/12 | discard → separate ledger kind | LEDGER-KINDS |
| P3 physical reconciliation | BR-V1-03, FR-06/07, RULE-06/23 | UC-07/08, SC-07 | recount → adjustment/reason | RECOUNT, LEDGER-SUM |
| All safe concurrent updates | FR-04, RULE-17/19 | UC-04, SC-09 | lock + expected_version | CONCURRENT-VERSION |
| P3 undo mistaken record removal | FR-08, RULE-15 | UC-09/10, SC-10 | visibility/version → deleted_at | DELETE-RESTORE |
| P2/P3 metadata correction | FR-05, RULE-07/08/09 | UC-06, SC-11 | merge/validate → metadata/version | METADATA |
| All private data | FR-10, RULE-01/24 | owned UCs, SC-13 | principal → user FK + scoped read/write | OWNER-SCOPE; HTTP auth NOT TESTED |
| All local-day attention | FR-09, RULE-13 | UC-11, SC-14 | settings → timezone/lead | LOCAL-MIDNIGHT |
| All retry safely | FR-04, RULE-18/19 | SC-08/09/15 | key/target/hash → response | REPLAY, TX-RESULT; UI recovery NOT TESTED |

No renumbering of `FINAL CHECK::*` or `SYS-*`; source namespaces remain distinct.

## Open gaps and assumptions

- [C] Candidate four-table physical model implements the current food draft; stakeholder approval of logical grain remains pending.
- [D] MySQL 8.4 is selected by this task; this does not settle whole-product stack/auth/provider/deployment.
- [A] Mandatory initial child, immutable unit, ledger equality and completed reservations require a transaction owner in addition to database constraints.
- [C] UTC DATETIME policy and ASCII UUIDs preserve DTO readability; binary UUID packing is deferred.
- [A] UI/HTTP auth, participant research, native browser recovery and production operations are not demonstrated by DB tests.
- [D] No product catalog, household sharing, notifications, OCR or recipe/AI tables are introduced.
