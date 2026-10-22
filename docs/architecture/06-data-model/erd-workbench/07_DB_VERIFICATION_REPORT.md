# SCH-03 database and native Workbench verification

Status: **verified in the local development sandbox**. This report describes the current candidate schema and the checks performed on 2026-10-13. It is not production, product, stakeholder, HTTP-authentication, or UI acceptance.

## Live schema

[A] `expiry_dev` responded at `127.0.0.1:3307` as MySQL8.4.11 / InnoDB, with session timezone `+00:00`, `REPEATABLE-READ`, and the restricted `expiry_app` account. The dedicated container was healthy and remained running. `verify-dev` rechecked the migration ledger, replayed the conditional seed, and observed the same row fingerprint before and after; it did not reset the development data.

Applied migrations remain unchanged and both checksums match the source files:

| Version | Source | SHA-256 |
|---:|---|---|
| 1 | `database/mysql/migrations/001_initial_schema.sql` | `32f2806e6bc4a2b271e3b93a8978352df6910334d3217501647b0729567b32cc` |
| 2 | `database/mysql/migrations/002_local_auth.sql` | `96bbfdc4b3e1ee6aa454f41eb520fee6b3d12fe71e2c02ae442b887db8833adc` |

The live schema contains **7 tables, 53 columns, 8 primary-key columns, 5 foreign keys, and 30 enforced CHECK constraints**. Migration001 declares `users`, `food_entries`, `stock_movements`, and `api_requests`; migration002 declares `local_credentials` and `user_sessions`; the runner owns `schema_migrations`.

| Table | Primary key |
|---|---|
| `users` | `id` |
| `food_entries` | `id` |
| `stock_movements` | `id` |
| `api_requests` | (`user_id`, `idempotency_key`) |
| `local_credentials` | `user_id` |
| `user_sessions` | `token_hash` |
| `schema_migrations` | `version` |

The five live relationships are `food_entries.user_id → users.id`, `api_requests.user_id → users.id`, `local_credentials.user_id → users.id`, `user_sessions.user_id → users.id`, and `stock_movements.entry_id → food_entries.id`. The development row counts are recorded in `database/mysql/evidence/dev-verification.json`; no credential or token contents are included.

The current live DDL dump is `expiry_mysql_live_schema.sql`; it contains table definitions only, without rows or connection secrets. Its SHA-256 is `a9d8ddafc84853511556521adda07d483ba4de8423060dc000b17f4019eedef0`.

## Native Workbench model

[A] Installed MySQL Workbench8.0.36 connected to the live MySQL8.4.11 server using its embedded GRT API. The first reverse-engineering helper omitted two tables; the checked fallback parsed unchanged live `SHOW CREATE TABLE` definitions with Workbench's native parser and all 40 registered character sets. Parser errors: **0**. Model/live parity passed for all tables, columns, primary keys, and foreign-key endpoints.

The saved native model contains seven tables, seven EER figures, and five native relationship connections. The exported PNG was inspected and the corrected layout shows all 16 `food_entries` columns, with auth/API figures below it and the ledger further below. Using the active Xwayland display supplied for this task, the embedded GRT view script opened the corrected `.mwb`, found all seven expected tables, activated `Expiry live MySQL schema`, and verified seven figures and five connections. `workbench_view_evidence.json` records this `PASS`; the Workbench process remains open. The native export evidence is in `workbench_native_evidence.json`. The saved `Expiry Local Docker` connection profile uses `expiry_app`; its evidence states that no password was saved. No GUI Test Connection button or Reverse Engineer wizard click is claimed. A separate desktop participant review was not performed.

Workbench's table model does not represent MySQL CHECK expressions. Therefore, **the 30 CHECK constraints are inventoried from live `INFORMATION_SCHEMA` and remain authoritative in the immutable migrations and MySQL runtime**; their absence from the picture does not mean they are absent from the schema. The native model's generated `initial_entry_id` remains STORED, including its expression.

| Artifact | Bytes / dimensions | SHA-256 |
|---|---:|---|
| `expiry_mysql.mwb` | 10,123 bytes | `f6af666307315af7850cac383344537adc3562f69db991cd113651d1cd28997b` |
| `expiry_mysql_eer.png` | 98,604 bytes; 965 × 1,025 pixels | `9fa6ed13317e494793b15345c43f472c37c00eb5b18e4ca274d114cfe865e426` |

The pre-SCH-03 `.mwb` was preserved byte-for-byte before regeneration at `database/mysql/evidence/pre-sch03/expiry_mysql_before_sch03.mwb`: **9,661 bytes**, SHA-256 `9b24b335105ba2a3a7c701a83065e1eb23f0692d3bfdc96366db4881e0b498da`. The matching pre-task PNG, native evidence, and preservation manifest are beside it. This keeps the previous incorrect model and its historical evidence available for comparison.

## Isolated regression results

`node database/mysql/tests/run.mjs` created a new database and then a distinct restore database; it did not touch `expiry_dev`. The fresh test schema applied the same immutable migrations001+002. Result: **PASS: 35, FAIL: 0, BLOCKED: 0, NOT TESTED: 5**. The latest run is `expiry_test_20261013084941122_b4bfbe`; its restore database is `expiry_test_20261013084941122_b4bfbe_restore`. Full case evidence, schema metadata, measured results, and limitations are in `database/mysql/evidence/latest-tests.json` and the retained per-run JSON.

Coverage includes schema shape and enforced checks, migration replay/checksums, owner foreign keys, row guards, create and movement transactions, ledger consistency, rollback injection, version races, idempotent replay, local-day boundaries, owner scoping, grants, query plans, and sandbox backup/restore. The suite reports these five boundaries as **NOT TESTED**: HTTP authentication integration, web recovery/refetch integration, keyboard/screen-reader/device accessibility, business approval, and production performance. `verify-dev` and native Workbench evidence are separate gates from these isolated tests.

The parity audit reads the current `apps/web/src/mockApi.ts` location. It records vocabulary and value-shape differences. This isolated database suite does not measure HTTP authentication/database integration or web recovery/refetch integration; separate integration evidence covers those flows.

## Commands and boundaries

Verified commands:

- `node database/mysql/scripts/manage.mjs verify-dev` → `EXPIRY_DEV_VERIFIED`; authenticated MySQL8.4.11, seven tables, correct 001/002 hashes, healthy loopback binding, unchanged seed fingerprint.
- `node database/mysql/scripts/manage.mjs dump-dev` → saved the current schema-only dump.
- Workbench CLI `--run-script database/mysql/workbench_export.py --quit-when-done` → `status: PASS`; native SQL/parity/model/PNG evidence.
- Workbench CLI `--run-script database/mysql/workbench_open.py --quit-when-done` → `status: PASS`; connection profile saved with `password_saved: false`.
- Workbench CLI `--run-script database/mysql/workbench_show_model.py` → `workbench_view_evidence.json` status `PASS`; actual loaded model has seven expected tables, seven diagram figures, and five connections; native `activateDiagram` selected `Expiry live MySQL schema`. Workbench remains open.
- `node database/mysql/tests/run.mjs` → `EXPIRY_DB_TESTS_VERIFIED`; 35 PASS, 0 FAIL, 5 NOT TESTED.
- `node database/mysql/tests/static.mjs` → `EXPIRY_STATIC_VERIFIED`; canonical paths, evidence hashes, backup preservation, schema counts, and report/test alignment.

No migration or DDL was added or rewritten. The development volume stayed in place. No browser/device, production database, production deployment, external auth provider, stakeholder approval, or HTTP-to-MySQL acceptance was performed.
