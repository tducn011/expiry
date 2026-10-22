# DOC-SCHEMA — Current entity ownership and migration state

- Document ID: `DOC-SCHEMA`
- Status: **Review**
- Updated: 2026-10-13

## Purpose

Record each current persisted entity’s grain, owner, creation path, and actual MySQL migration state. This is an applied-schema description, not a new migration plan.

## Evidence sources

- [Migration 001: core MySQL schema](../../../database/mysql/migrations/001_initial_schema.sql)
- [Migration 002: local-auth schema](../../../database/mysql/migrations/002_local_auth.sql)
- [Migration runner and schema evidence](../../../database/mysql/README.md)
- [Current MySQL ERD](erd.md)
- [Current field dictionary](dictionary.md)
- [Schema input/output guide](schema-input-output.md)

## Definitions and assumptions

**[A]** In the checked candidate development database, migrations 001 and 002 are applied; the migration runner also manages `schema_migrations`. The SQL files are immutable applied artifacts. Migration 002’s source header retains historical “proposal only” wording, which does not describe the later checked application/evidence state. This document remains Review and does not approve production deployment or an auth policy.

## Analysis

### Entity grain and ownership

| Entity | One row represents | Identity / owner | Created by / purpose |
|---|---|---|---|
| `users` (ENT-01) | One private inventory account and its attention preferences | Server-assigned `CHAR(36)` ID; auth/identity boundary | Registration/bootstrap; owner root for entries, requests, credentials, sessions |
| `food_entries` (ENT-02) | One tracked quantity group with shared unit, location, and date context | Server-assigned ID; immutable `user_id` from authenticated principal | Explicit reviewed create command; current amount is read source, but every quantity change is also recorded |
| `stock_movements` (ENT-03) | One committed initial, consume, discard, or adjustment event | Server-assigned movement ID; exactly one parent entry | Create transaction or a confirmed movement/recount; append-only history |
| `api_requests` (ENT-04) | One write-command replay record for owner + idempotency key | Composite `(user_id, idempotency_key)` primary key | Write transaction reserves/saves original result for safe replay |
| `local_credentials` (ENT-05) | One local credential set for a user | `user_id` PK/FK to `users`; normalized email unique | Local registration; stores verifier, never plaintext password |
| `user_sessions` (ENT-06) | One persisted session-token digest and lifecycle | `token_hash` PK; `user_id` FK to `users` | Login/session creation; expiry and revocation gate private access |
| `schema_migrations` (ENT-07) | One successfully applied migration version and checksum | Migration `version` primary key | Migration runner records checksum/time after applying file |

No products/catalog, household/membership, notification/outbox, or OCR sample table exists in the current migrations. Same-name food entries are not merged. The `ocr_training_samples` candidate in the schema guide is **[D] proposal only**, not an entity in this applied model.

### Current migration state

| Version | Current role | Evidence boundary |
|---|---|---|
| `001_initial_schema.sql` | Creates core `users`, `food_entries`, `stock_movements`, and `api_requests`, including indexes/CHECKs and transaction invariants represented in services/tests | Applied in candidate dev schema; file remains immutable |
| `002_local_auth.sql` | Adds `local_credentials` and `user_sessions` with FK/CHECK/index constraints | Applied in candidate dev schema; file remains immutable despite historical header wording |
| `schema_migrations` | Records applied version, SHA-256, and timestamp | Runner-managed metadata table; no domain owner/FK |

The observed current model has seven tables, 53 columns, five FKs, and 30 CHECK constraints according to the current Workbench/dictionary evidence. No new DDL or migration is part of this documentation reconciliation. The local MySQL verification report describes its exact sandbox gates; it is not production migration approval.

### Persistence and transaction ownership

- Create writes `food_entries`, its initial `stock_movements` event, and `api_requests` result atomically.
- Use/discard/recount locks the owner-scoped entry, validates version/quantity, then updates quantity/version and appends a movement when there is a real change; replay state is saved in the same transaction.
- Metadata edit changes allowed metadata and version only; quantity and unit are excluded.
- Soft delete/restore updates visibility/version without creating a use/discard movement.
- Preference changes update owner settings/version and an idempotency result.
- Auth persists credential/session rows in the MySQL boundary. Server-derived principal/IDs/timestamps remain server-owned.

ORM selection/implementation status belongs to ADR-002 and runtime evidence. The SQL layer uses explicit repositories/transactions; this document does not claim an ORM model or generic all-table CRUD.

## Decisions and rationale

**[A]** The former migration plan is replaced by the current applied-state inventory. Migration compatibility, locking, and replay behavior have local candidate-database evidence; those checks do not establish production backup/restore readiness. **[D]** Any future schema evolution should be a separately reviewed migration with compatibility and restore planning before execution.

## Dependencies

- [Storage and ORM ADR](../08-architecture/ADR-002-storage-orm.md)
- [Database verification report](erd-workbench/07_DB_VERIFICATION_REPORT.md)
- [Testing catalog](../10-testing/test-catalog.md)
- [Traceability registry](../11-traceability/registry.json)

## Open questions

Production migration, backup/restore, and data-retention procedures require separate deployment review. OCR sample storage, source eligibility, consent, reviewer access, and release membership remain proposals/open questions, not current entities.

## Related documents

- [Current ERD](erd.md)
- [Current dictionary](dictionary.md)
- [Schema input/output guide](schema-input-output.md)
- [Reconciliation report](../10-testing/schema-reconciliation-2026-10-13.md)

## Verification criteria

The seven entity/table names and migration versions must match the immutable SQL files and current candidate database evidence. Do not add any proposed OCR table to this list unless a separately authorized migration is actually applied and documented.
