# Expiry MySQL sandbox

MySQL8.4 candidate persistence in the isolated local sandbox. The current schema has six migration-defined tables plus the runner-owned `schema_migrations` ledger (7 tables, 53 columns, 5 foreign keys and 30 CHECK constraints). Native model, live DDL dump, audit and verification report are in `../../docs/architecture/06-data-model/erd-workbench/`. These artifacts describe development state and do not constitute production or product approval.

## Setup and replay

Run from `/home/pro/Downloads/expiry/database/mysql`:

```bash
npm ci --no-audit --no-fund
node scripts/init-env.mjs
docker compose --env-file .env -f compose.yaml config --quiet
docker compose --env-file .env -f compose.yaml up -d
node scripts/manage.mjs migrate-dev
node scripts/auth-migration.mjs expiry_dev
node scripts/manage.mjs verify-dev
node scripts/manage.mjs dump-dev
node tests/run.mjs
```

This session uses a project-local Compose plugin because host `docker compose` was absent:

```bash
docker --config /home/pro/Downloads/expiry/database/mysql/.tools compose --env-file .env -f compose.yaml config --quiet
docker --config /home/pro/Downloads/expiry/database/mysql/.tools compose --env-file .env -f compose.yaml up -d
```

The local plugin was downloaded from the [official Docker release](https://github.com/docker/compose/releases/tag/v5.6.0) following the [documented manual install method](https://docs.docker.com/compose/install/linux/); no system/group/daemon configuration was changed. `.tools/` is ignored. MySQL credentials are separate cryptographically generated64hex values in ignored `.env` mode600. Never print ordinary compose config output because it expands credentials; use `config --quiet`. Keep `.env.example` empty of secrets.

Container project `expiry-mysql84`, named volume `expiry_mysql84_data`, loopback binding127.0.0.1:3307 in this run. Existing volumes/projects were preserved. Healthcheck uses authenticated SELECT1, then verify-dev checks version/timezone/isolation/engine and explicit binding. Stop without deleting data using the matching compose `stop` command. No destructive down-v/prune script is provided.

## Schema and transaction ownership

Migration001 creates users, food_entries, stock_movements and api_requests. Migration002 adds local_credentials and user_sessions; both are checksum recorded in runner-owned `schema_migrations`. Repeated application is a no-op only when hashes match. The explicit 002 runner verifies001 and preserves existing domain rows. MySQL DDL implicit commits mean a failure midway is preserved as an unversioned/partial schema and rejected, not silently rebuilt. Recover dev with an explicit reviewed forward migration/backup; never delete the volume to hide an error. New physical changes use a new version.

Seed runner targets only expiry_dev, acquires a named lock, and executes fixture DML transactionally. Deterministic IDs and conditional inserts retain existing rows; a rerun preserves counts and does not reset edited quantities. Fixtures have2 owners,4 entries,8 initial/use/discard/recount events. Root is used only inside the dedicated container for migration/grants/dump. Application account can SELECT all sandbox tables, INSERT/UPDATE users/entries/requests and auth tables, INSERT movements, with no history UPDATE/DELETE, DDL or hard-delete.

`src/domain.mjs` validates decimal strings, date combinations and input allowlists. `src/repository.mjs` owns command transactions, replay-before-version, owner scope, row locks, version updates, append events, saved JSON result, derived reads and a frozen clock. Quantity is calculated using BigInt milliunits. Duplicate INSERT waits for winner; replay reads immutable result without shared→exclusive lock upgrade. Deadlocks roll back completely and retry the same command at most3 times (4 attempts total). Lock timeout/other DB errors propagate for an eventual HTTP error adapter; no generic success is returned.

This is a tested DB integration repository, not an exposed backend. The caller must establish trusted principal identity separately. Raw DB row timestamp/error/history shapes still require OpenAPI DTO adapters and paginated history integration.

## Isolated tests and evidence

Every test run creates a **new** `expiry_test_<UTC stamp>_<random>` database; restore testing creates a new `<name>_restore`. It never resets a pre-existing schema and never tests destructive actions in expiry_dev. Both DBs are preserved for review. Administrative creation/grants are restricted to the dedicated container and validated Expiry sandbox names. Evidence contains test IDs, source requirement IDs, setup, executed command/SQL description, expected/actual result and measured PASS/FAIL/NOT TESTED counts. Previous run JSON stays under `evidence/`; latest-tests.json is the latest generated projection. A failed run exits1 and remains visible.

Run `node tests/run.mjs` again to obtain clean replay on a new test schema. Real tests include independent concurrent connections/barriers, fault injection, backup/restore and INFORMATION_SCHEMA. NOT TESTED covers HTTP auth, UI recovery/accessibility, stakeholder approval and production performance. A passing DB test never certifies those.

## Workbench

Installed launcher found in this session: `/snap/bin/mysql-workbench-community` (8.0.36). Connection: `Expiry Local Docker`, Standard TCP/IP,127.0.0.1,3307,expiry_app,default schema expiry_dev. The CLI/GRT scripts read the ignored private `.env` in process and do not save the password. Use the native GRT exporter for reproducible model generation and live query evidence. Workbench's table model does not represent MySQL CHECK expressions; migrations and live MySQL checks remain authoritative for those rules.

`workbench_export.py` runs inside the actual Workbench embedded Python/GRT runtime using `--run-script ... --quit-when-done`. It verifies authenticated live SQL, exact table/column/PK/FK parity, live CHECK inventory, generated/descending-index properties, native model ZIP integrity and PNG signature/dimensions. The installed reverse-engineering helper can omit tables when its parser lacks the full charset registry; a checked Workbench native-parser fallback reads unchanged live SHOW CREATE definitions with the driver's charset registry. The script does not claim a GUI Test Connection button or wizard click. Reruns preserve the earlier model, PNG and evidence in ignored `database/mysql/evidence/runtime-private/previous-workbench-export/` and refuse outputs whose hashes do not match the prior successful export.

`workbench_show_model.py` opens the saved native model through Workbench.openModel and activates the actual loaded EER tab after startup. Use `--run-script /home/pro/Downloads/expiry/database/mysql/workbench_show_model.py` with the current graphical session. CLI startup has one open-at-start slot, so combining `--model` with `--run-script` does not reliably load both; this script explicitly opens the model. It writes `workbench_view_evidence.json` only after seeing all seven expected tables and the actual diagram. The user's separate Untitled/mydb model is not edited.

## Reference and approval

See 01_MODEL_AUDIT through07_DB_VERIFICATION_REPORT for source provenance, dictionaries, logical-versus-physical enforcement and stakeholder review items. No production deployment, UI migration or auth provider choice is made here.
