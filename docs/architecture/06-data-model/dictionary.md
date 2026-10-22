# DOC-DICTIONARY — Current MySQL entity and field dictionary

- Document ID: `DOC-DICTIONARY`
- Status: **Review**
- Updated: 2026-10-13

## Purpose

Define each currently persisted field using the applied MySQL schema, separating database representation, API representation, owner, nullability, and derived values.

## Evidence sources

- [Migration 001: core schema](../../../database/mysql/migrations/001_initial_schema.sql)
- [Migration 002: local credentials and sessions](../../../database/mysql/migrations/002_local_auth.sql)
- [Migration-backed entity dictionary](erd-workbench/03_ENTITY_DICTIONARY.md)
- [Current API/schema input-output guide](schema-input-output.md)

## Definitions and assumptions

**[A]** Physical types and defaults below describe MySQL 8.4/InnoDB migrations. ASCII identifiers/keys use `ascii_bin`; text tables use UTF-8 defaults. **[A]** API types are those of current contracts/adapters; they are not necessarily JSON encodings of raw SQL values. All timestamps are stored as `DATETIME(6)` under UTC application policy. This document remains Review and does not approve product auth policy or future features.

## Analysis

### Persisted fields — seven current tables

| Table.field | MySQL type / key | Null/default | Meaning, rule, and owner |
|---|---|---|---|
| `users.id` | `CHAR(36) CHARACTER SET ascii COLLATE ascii_bin` PK | NOT NULL | Stable internal owner ID; assigned by server/auth boundary |
| `users.identity_subject` | `VARCHAR(255) COLLATE utf8mb4_0900_bin` UNIQUE | NOT NULL | Namespaced identity subject; internal identity, not mutable email |
| `users.display_name` | `VARCHAR(100)` | NOT NULL | Validated profile display name; registration input |
| `users.timezone` | `VARCHAR(100) CHARACTER SET ascii COLLATE ascii_bin` | NOT NULL; `Asia/Ho_Chi_Minh` | Valid IANA zone, server default; preference owner |
| `users.attention_lead_days` | `INT` | NOT NULL; `2` | Persisted attention preference, constrained to 0–30; not a derived value |
| `users.version` | `INT` | NOT NULL; `1` | Optimistic profile version, at least 1; server-owned |
| `users.created_at` | `DATETIME(6)` | NOT NULL; current timestamp | Creation instant in UTC policy; server-owned |
| `users.updated_at` | `DATETIME(6)` | NOT NULL; current timestamp | Last profile update instant; persistence-owned |
| `food_entries.id` | `CHAR(36) CHARACTER SET ascii COLLATE ascii_bin` PK | NOT NULL | Stable entry ID; server-owned |
| `food_entries.user_id` | `CHAR(36) CHARACTER SET ascii COLLATE ascii_bin` FK → `users.id` | NOT NULL | Immutable owner from authenticated principal; RESTRICT FK |
| `food_entries.name` | `VARCHAR(200)` | NOT NULL | Trimmed, nonblank display name; not unique; user-supplied |
| `food_entries.storage_location` | `VARCHAR(100)` | NOT NULL; `unspecified` | Free-text storage context; blank UI input normalizes to `unspecified` |
| `food_entries.remaining_quantity` | `DECIMAL(12,3)` | NOT NULL | Current amount, ≥0; max 999999999.999; `piece` must be integral. Changed through create/movement/recount, never metadata edit |
| `food_entries.unit` | `VARCHAR(10) CHARACTER SET ascii COLLATE ascii_bin` | NOT NULL | Checked values `piece`, `g`, `ml`; fixed after create |
| `food_entries.expiry_date` | `DATE` | NULL | Reported calendar date; not timezone-converted and not a safety determination |
| `food_entries.date_certainty` | `VARCHAR(12) CHARACTER SET ascii COLLATE ascii_bin` | NOT NULL; `unknown` | Checked values `known`, `estimated`, `unknown`; consistent with date/source state |
| `food_entries.date_source` | `VARCHAR(20) CHARACTER SET ascii COLLATE ascii_bin` | NOT NULL; `unknown` | Checked values `printed_label`, `user_entered`, `user_estimate`, `unknown` |
| `food_entries.date_label_type` | `VARCHAR(15) CHARACTER SET ascii COLLATE ascii_bin` | NOT NULL; `unspecified` | Checked values `use_by`, `best_before`, `unspecified`; label meaning remains distinct from certainty |
| `food_entries.opened_on` | `DATE` | NULL | User-entered opening date; independent of expiry; no automatic shelf-life derivation |
| `food_entries.note` | `TEXT` | NULL | Plain-text user note; max 1000 characters enforced by CHECK |
| `food_entries.version` | `INT` | NOT NULL; `1` | Optimistic entry version; server increments on real mutation |
| `food_entries.deleted_at` | `DATETIME(6)` | NULL | Visibility tombstone; delete/restore does not record use/discard |
| `food_entries.created_at` | `DATETIME(6)` | NOT NULL; current timestamp | Recorded create instant; server-owned |
| `food_entries.updated_at` | `DATETIME(6)` | NOT NULL; current timestamp | Last real entry mutation instant; server/persistence-owned |
| `stock_movements.id` | `CHAR(36) CHARACTER SET ascii COLLATE ascii_bin` PK | NOT NULL | Immutable movement identity; server-owned |
| `stock_movements.entry_id` | `CHAR(36) CHARACTER SET ascii COLLATE ascii_bin` FK → `food_entries.id` | NOT NULL | Parent entry; RESTRICT FK |
| `stock_movements.kind` | `VARCHAR(12) CHARACTER SET ascii COLLATE ascii_bin` | NOT NULL | Checked `initial`, `consume`, `discard`, `adjustment` |
| `stock_movements.quantity_before` | `DECIMAL(12,3)` | NOT NULL | Locked quantity before event; ≥0 |
| `stock_movements.quantity_after` | `DECIMAL(12,3)` | NOT NULL | Quantity after event; ≥0; shape depends on kind |
| `stock_movements.reason` | `TEXT` | NULL | Optional use/discard note; nonblank required for adjustment; max 500 characters |
| `stock_movements.recorded_at` | `DATETIME(6)` | NOT NULL; current timestamp | Server-recorded event instant; not proof of when physical action happened |
| `stock_movements.initial_entry_id` | Generated stored `CHAR(36) CHARACTER SET ascii COLLATE ascii_bin`; UNIQUE | NULL except `kind='initial'` | Generated from `entry_id` for initial event; unique constraint allows at most one initial event per entry |
| `api_requests.user_id` | `CHAR(36) CHARACTER SET ascii COLLATE ascii_bin` FK → `users.id`; composite PK part | NOT NULL | Principal-scoped command owner; server-derived |
| `api_requests.idempotency_key` | `VARCHAR(100) CHARACTER SET ascii COLLATE ascii_bin`; composite PK part | NOT NULL | Client-supplied write header, 8–100 allowed characters |
| `api_requests.operation` | `VARCHAR(255) CHARACTER SET ascii COLLATE ascii_bin` | NOT NULL | Server-normalized command and target |
| `api_requests.request_hash` | `CHAR(64) CHARACTER SET ascii COLLATE ascii_bin` | NOT NULL | Lowercase SHA-256 fingerprint of normalized command; server-owned |
| `api_requests.response_status` | `INT` | NULL while reserved | Saved completed 2xx status; server-owned |
| `api_requests.response_body` | `JSON` | SQL NULL while reserved; JSON `null` for replayed 204 | Original response snapshot; not authoritative latest resource state |
| `api_requests.created_at` | `DATETIME(6)` | NOT NULL; current timestamp | Command/reservation time; server-owned; no automatic pruning policy asserted |
| `local_credentials.user_id` | `CHAR(36) CHARACTER SET ascii COLLATE ascii_bin` PK and FK → `users.id` | NOT NULL | At most one local credential row per user; RESTRICT FK |
| `local_credentials.email_normalized` | `VARCHAR(254) CHARACTER SET ascii COLLATE ascii_bin` UNIQUE | NOT NULL | Lowercase normalized login identifier; private auth data |
| `local_credentials.password_verifier` | `VARCHAR(255) CHARACTER SET ascii COLLATE ascii_bin` | NOT NULL | Encoded scrypt verifier; never plaintext and never returned by API |
| `local_credentials.created_at` | `DATETIME(6)` | NOT NULL; current timestamp | Credential creation time; server-owned |
| `local_credentials.updated_at` | `DATETIME(6)` | NOT NULL; current timestamp | Last credential update time; server-owned |
| `user_sessions.token_hash` | `CHAR(64) CHARACTER SET ascii COLLATE ascii_bin` PK | NOT NULL | Lowercase digest of opaque bearer token; raw token is not persisted |
| `user_sessions.user_id` | `CHAR(36) CHARACTER SET ascii COLLATE ascii_bin` FK → `users.id` | NOT NULL | Session owner; RESTRICT FK |
| `user_sessions.created_at` | `DATETIME(6)` | NOT NULL | Session creation time |
| `user_sessions.last_seen_at` | `DATETIME(6)` | NOT NULL | Most recent accepted activity; time-order CHECK applies |
| `user_sessions.expires_at` | `DATETIME(6)` | NOT NULL | Absolute expiry; session-owner and expiry indexes support lookup/cleanup |
| `user_sessions.revoked_at` | `DATETIME(6)` | NULL | Explicit revocation instant |
| `schema_migrations.version` | `INT` PK | NOT NULL | Migration version managed by runner |
| `schema_migrations.sha256` | `CHAR(64) CHARACTER SET ascii COLLATE ascii_bin` | NOT NULL | Immutable applied migration checksum; detects historical SQL drift |
| `schema_migrations.applied_at` | `DATETIME(6)` | NOT NULL | Time a complete migration file was applied |

### Derived and transport-only values

| Value | Where it exists | Meaning / boundary |
|---|---|---|
| `lifecycle` | Entry response | Derived as active/depleted from `remaining_quantity`; not a table column |
| `attention` | Entry response | Derived from owner-local `as_of_date`, stored date fields, quantity, and preferences; not persisted |
| `as_of_date` | EntryList response | Required local calendar date used for attention presentation, including an empty list |
| `delta` | Movement response | Derived from `quantity_after - quantity_before`; not stored in `stock_movements` |
| `raw_text`, `candidates`, warnings/errors | Scan response | Transient scan output; no OCR/training table is created or written by current scan flow |
| `expected_version` | Write request | Client supplies current integer version; server compares and increments on mutation |
| `user_id`, IDs, versions, timestamps, audit/replay values | Request/response boundary | Server-owned identity/audit values, not client-authoritative fields |

API quantity fields (`quantity`, `remaining_quantity`, movement before/after/delta) are JSON decimal strings, never floating JSON numbers. Dates are calendar-date strings; API timestamps are serialized by the adapter, not raw MySQL `DATETIME` strings. Relevant rules: quantity finite, max 999999999.999, at most three fractional digits, integral for `piece`; units are `piece`, `g`, and `ml`. Metadata edit excludes quantity and unit. The exact DTO/error envelope is in the OpenAPI contract.

No persisted attention/lifecycle/safety status exists. Date states are constrained: unknown means NULL/unknown/unspecified; estimated requires a date and `user_estimate`; known requires a date and `printed_label` or `user_entered`. A past date may be recorded; the interface communicates “Theo ngày bạn đã ghi, không phải đánh giá an toàn.”

## Decisions and rationale

**[A]** The current MySQL physical dictionary is the canonical current analysis. Source/owner names describe domain ownership; they are not database roles or proof of product approval. Separate proposal-only OCR fields are in the [schema input/output review](schema-input-output.md), never part of this persisted-field inventory.

## Dependencies

- [Current logical/physical ERD](erd.md)
- [Native entity dictionary](erd-workbench/03_ENTITY_DICTIONARY.md)
- [OpenAPI contract](../../../contracts/openapi.json)
- [Business rules](../03-requirements-features/business-rules.md)

## Open questions

The adapter’s explicit UTC serialization and idempotency-record retention policy require separate decisions. Consent, sample-source eligibility, dataset memberships, and OCR retention are not current database fields and remain separate review topics.

## Related documents

- [MySQL migrations](../../../database/mysql/migrations/001_initial_schema.sql)
- [Local-auth migration](../../../database/mysql/migrations/002_local_auth.sql)
- [Schema input/output guide](schema-input-output.md)
- [Schema reconciliation report](../10-testing/schema-reconciliation-2026-10-13.md)

## Verification criteria

Every persisted-field row must match migrations 001 or 002; the ERD count must remain seven tables, 53 columns, and five FKs. Run the architecture validator for source links and registry integrity. Documentation checks do not replace database tests or production review.
