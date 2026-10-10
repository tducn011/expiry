# Expiry — MySQL database verification report

Status: **candidate ERD implemented and DB-tested in development**. Logical model approval remains pending. Evidence labels: [A] checked source/runtime/test, [A-U] human confirmation, [B] official reference, [C] inference, [D] recommendation. Report date: 10/10/2026, Asia/Ho_Chi_Minh.

## Outcome and environment

- PASS: 35
- FAIL: 0
- BLOCKED: 0 database test cases
- NOT TESTED: 5
- Workbench native authenticated connection, original live-DDL extraction, native .mwb serialization, native PNG export and actual loaded EER tab: **PASS**.
- Test Connection button and Reverse Engineer wizard clicks: **NOT PERFORMED by agent**; native desktop mouse/keyboard APIs are unavailable. User confirmed login and supplied screenshot with the connected tab on 10/10. This is separate [A-U] evidence, not an agent click claim.
- Participant/user research and stakeholder acceptance: **not approved by this implementation**.

| Environment item | Observed value [A] |
|---|---|
| Host | Ubuntu 26.04.1 LTS, linux/amd64; user pro, no sudo/system/group changes |
| Repo | /home/pro/Downloads/expiry; feature/ui; baseline6d2a078fed3e1a5c1c54fb19bc7b20765720256c; pre-existing dirty changes preserved |
| Docker Engine | 29.1.3 |
| Compose | v5.6.0 project-local official binary; host default compose command absent |
| Image | mysql:8.4; actual server8.4.11 |
| Image digest | mysql@sha256:6ea90827b1100f8f2ae306a539f86d2c264a26ed435a2a9f75551dd5c3aeb242 |
| Storage/session | InnoDB; session+00:00; isolationREPEATABLE-READ; DATETIME6 UTC convention |
| Node/driver | Node 22.23.3; mysql2 installed 3.24.5, locked in package-lock |
| Workbench | Snap 8.0.36 rev13; actual GNOME Wayland/Xwayland session. Snap runtime reports Ubuntu 22.04 while host is 26.04 |
| Container/volume | expiry-mysql84-mysql-1 / expiry_mysql84_data; healthy |
| SQL endpoint | 127.0.0.1:3307; expiry_dev; expiry_app@% |
| Development fixtures | 2 users / 4 entries / 8 movements / 0 api_requests |
| Applied migration | 001; SHA256 32f2806e6bc4a2b271e3b93a8978352df6910334d3217501647b0729567b32cc; replay no-op |
| Latest test DB | expiry_test_20261010043116081_e179ea |
| Fresh restore DB | expiry_test_20261010043116081_e179ea_restore |
| Latest DB tests ended | 10/10/2026, 11:31:18 +07:00 |
| Dev SQL verified | 10/10/2026, 11:31:15 +07:00 |
| Native EER shown | 10/10/2026, 11:26:43 +07:00 |

Credentials live only in ignored database/mysql/.env (mode600), with empty password placeholders in .env.example. Application and root secrets differ; reports/evidence/model/image are scanned for actual generated credential values. Non-root Workbench connection **Expiry Local Docker** was saved with host/user/schema metadata and no embedded password by the agent. User entered the password privately to connect.

## Source audit and logical versus live physical comparison

Resolved sources are flat docs/ and contracts/, documented in01_MODEL_AUDIT. Expected phase folder/ZIP and historical hierarchical paths were absent. Existing user UI/document reorganization changes were not repaired or reset as part of this task.

The logical draft has 4 entities: users, food_entries, stock_movements, api_requests. The physical live schema has **5 tables, 42 columns, 3 FKs, 25 enforced CHECKs**. The additional table schema_migrations and column stock_movements.initial_entry_id are operational/physical helpers, not new business scope.

| Logical relationship | Live physical mapping | Verified limitation |
|---|---|---|
| user0..Nentries;entry exactly1owner | food_entries.user_id→users.id, NOT NULL, RESTRICT | FK existence plus repository owner scope tested; HTTP identity establishment remains external |
| entry1..Nmovements after create commit | stock_movements.entry_id→food_entries.id, NOT NULL, RESTRICT | UNIQUE generated initial key limits max 1; minimum 1 child is create transaction invariant |
| user0..Nkeyed commands | api_requests.user_id→users.id; composite PK(user_id,idempotency_key), ASCII binary | same-key commands wait/replay; operation/target/hash checked before version |
| one successful versioned migration | schema_migrations.version,sha256,applied_at | fresh apply and rerun tested; no atomic-whole-DDL claim |

INFORMATION_SCHEMA asserts complete expected column sets and nullability, actual FK column endpoints/actions, named CHECK set and ENFORCED flags, PK/UNIQUE/query indexes, selected exact types/defaults/collations. Invalid-write tests exercise the named guard behaviors reported below; they do not exhaust every possible value boundary of every CHECK.

## Workbench evidence and compatibility

The first installed DbMySQLRE helper attempt produced only 3 of 5 tables. Native parser probes identified4 errors in food_entries and6 in stock_movements due to an empty charset registry at parser creation. The installed helper omitted catalog.characterSets and ignored parser error counts.

Recovery used **Workbench's own native parser**, a complete 40-character-set registry, actual8.4.11 version/sql_mode and **unchanged live SHOW CREATE TABLE** definitions. No live schema downgrade, normalization, fake .mwb ZIP construction or image drawing was used. Checked parser error count: 0; model table, column and FK endpoint sets exactly match live metadata. Generated initial_entry_id remains STORED with its native expression; descending index columns are preserved.

Native Workbench saved:
- expiry_mysql.mwb — 8843bytes; SHA2560c48660c450bf182a1413a0153ef38bfadf8c05e7d07d4f1f655a9c396a7e2f5.
- expiry_mysql_eer.png — 882×705,80665bytes; SHA25635109060249a7051d348d492c1ede429cf41a08cf0ef8d47bbac9662eb558c4d.
- 5 native figures and 3 native connections; image visually inspected with separated FK chains.
- Actual Workbench.openModel followed by activateDiagram observed the loaded expiry_dev model with5 tables / 3 connections. The user's unrelated Untitled/mydb model was not modified.

Workbench 8.0.36 shows the user a **not-supported** compatibility warning for MySQL 8.4; successful SQL/native export does not establish that all Workbench admin/wizard features support8.4. Its table model does not represent these named table CHECKs. FK/column/EER parity therefore does not replace live CHECK enforcement tests. Its saved currentConnection reference can warn on reopening; use the separately saved Expiry Local Docker profile for live SQL. CHECK and generated-expression authority remains the migration/live SQL/test evidence.

Files: workbench_native_evidence.json, workbench_open_evidence.json, workbench_view_evidence.json and expiry_mysql_live_schema.sql. A failed startup script was corrected; CLI has a single open-at-start slot, so the view script explicitly opens the model through native openModel after startup. No automatic Test Connection/wizard click is claimed.

## Traceability: BR/FR/RULE → UC/SC → data → executed acceptance

Food architecture namespace is retained. Equal numbers in FINAL CHECK::* and SYS-* are not treated as equivalent IDs.

| Outcome/capability/rule | UC/SC/VT | Fields / relationships | Actual test |
|---|---|---|---|
| BR-V1-01/03;FR-01;RULE-02/04/19 | UC-01;SC-01;VT-01/02 | entry+initial+key + result | DB-CREATE;INITIAL-CARDINALITY;TX-CREATE-* |
| BR-V1-02;FR-01/03;RULE-09/10/22 | UC-01/03;SC-02;VT-01/14 | nullable expiry_date/certainty/source/label | DATE-STATES;DB-ROW-GUARDS |
| BR-V1-01/02;FR-02/03;RULE-12/20 | UC-02/03;SC-03/04/15;VT-13 | owner/date/created_at/id+derived priority | QUERY-PRIORITY;QUERY-EXPLAIN;P2 decision effectiveness NOT TESTED |
| BR-V1-03;FR-04;RULE-03/05/17 | UC-04;SC-05;VT-03/04 | remaining+consume+version | QUANTITY-VALIDATION;LEDGER-KINDS;TX-MOVEMENT-* |
| BR-V1-03;FR-04/07;RULE-15/16/23 | UC-05/08;SC-06/12;VT-10 | discard versusconsume;depleted | LEDGER-KINDS;LEDGER-SUM |
| BR-V1-03;FR-06/07;RULE-06/19 | UC-07/08;SC-07;VT-08/09 | adjustment before/after/reason;no-op | RECOUNT(no-op,increase,downward);LEDGER-SUM |
| FR-04;RULE-18/19;NFR-02 | UC-04;SC-08;VT-06/07 | compositekey+target+canonicalhash+result | CONCURRENT-REPLAY;REPLAY-KEY-CONFLICT |
| FR-04;RULE-05/17;NFR-02 | UC-04;SC-09;VT-05 | rowlock+expected_version+quantity | CONCURRENT-VERSION |
| FR-08;RULE-15/17/18 | UC-09/10;SC-10;VT-11 | deleted_at/version;quantity/history unchanged | DELETE-RESTORE |
| FR-05;RULE-07/08/09/17 | UC-06;SC-11;VT-14 | metadata merge/allowlist;unit immutable | METADATA |
| FR-07/10;RULE-01/24;NFR-01 | owned UCs;SC-13;VT-12 | principal+userFK+scoped reads/actions/history | OWNER-SCOPE repository PASS;HTTP-AUTH-INTEGRATION NOT TESTED |
| FR-09;RULE-13/17 | UC-11;SC-14;VT-13 | timezone/lead/version;owner-local DATE | LOCAL-MIDNIGHT;PREFERENCES-BOUNDARY;PREFERENCES-CONCURRENCY |
| NFR-07;RULE-19 | VT-16 | migration,fixtures,FKs+ledger | MIGRATION-REPLAY;BACKUP-RESTORE in sandbox;staging production not tested |
| FR-10;NFR-04/05 | VT-15/17;SC-15 | FE draft/recovery/focus/labels | UI-RECOVERY-INTEGRATION;UX-ACCESSIBILITY NOT TESTED |

## Test register and decisive evidence

Full per-test setup,SQL/command description,expected,actual,status and elapsed time are in [latest-tests.json](../../database/mysql/evidence/latest-tests.json), with retained per-run file [expiry_test_20261010043116081_e179ea.json](../../database/mysql/evidence/expiry_test_20261010043116081_e179ea.json). Tests execute with mysql2 against the actual MySQL server; none of the concurrency results use the UI mock.

| test_id | Requirement/rule | Status | Actual (compact; full JSON linked above) |
|---|---|---|---|
| SCHEMA-STRUCTURE | VT-01/16; RULE-01/03/04/09/10/18 | PASS | {"table_count":5,"column_count":42,"fk_count":3,"check_count":25} |
| MIGRATION-REPLAY | VT-16; NFR-07 | PASS | {"applied":false,"hash":"32f2806e6bc4a2b271e3b93a8978352df6910334d3217501647b0729567b32cc"} |
| FK-ORPHANS | RULE-01/04; VT-01 | PASS | {"orphan_rejections":3,"parent_delete_rejected":true,"entry":"95d8f87d-5277-4512-8c8d-a6217802b511"} |
| DB-ROW-GUARDS | RULE-03/09/10/17/18; VT-04/14 | PASS | {"rejected":["remaining_quantity:-1","remaining_quantity:1.5","unit:kg","version:0","name: ","date_source:printed_label","date_certainty:known"],"additional_rejections":4… |
| DB-CREATE | SC-01/02; VT-01; FR-01; RULE-02/04 | PASS | {"ids":["bf701783-da87-48bf-a092-78262aab8747","fe39643f-d10d-4a80-b190-13ec10597bb4","eaeb930f-3f5e-47c2-b21b-16f3244e3bed"],"dates":["2026-10-10",null,"2026-10-09"],"in… |
| INITIAL-CARDINALITY | RULE-04; VT-01/02 | PASS | {"second_initial":"ER_DUP_ENTRY","minimum_child":"service transaction; low-level zero child accepted only in rolled-back probe"} |
| QUANTITY-VALIDATION | SC-05/06; VT-04; RULE-03/05 | PASS | {"invalid_capture_count":6,"overspend":"409","remaining":"500.000"} |
| DECIMAL-COERCION | RULE-03; VT-04 | PASS | {"raw_storage":{"remaining_quantity":"1.000"},"warnings":[{"Level":"Note","Code":1265,"Message":"Data truncated for column 'remaining_quantity' at row 1"}],"max_exact":"9… |
| DATE-STATES | SC-02/11; VT-01/14; RULE-09/10/11/21/22 | PASS | {"rejected":5,"past_date":"2020-01-01","opened_unknown_expiry":null} |
| LEDGER-KINDS | SC-05/06/12; VT-03/10; FR-04/07; RULE-05/16 | PASS | {"remaining":"0.000","kinds":["initial","consume","discard"],"version":3,"lifecycle":"depleted"} |
| RECOUNT | SC-07; VT-08/09; FR-06; RULE-06 | PASS | {"noop_version":1,"increased":{"id":"fb333758-5abc-46a2-a650-9631461d984f","entry_id":"9e2436c3-4587-40e4-ac63-817257979b67","kind":"adjustment","quantity_before":"0.000"… |
| DELETE-RESTORE | SC-10; VT-11; FR-08; RULE-15/17/18 | PASS | {"quantity":"500.000","movement_count":1,"version":3,"stored_204":"JSON null (not SQL NULL)"} |
| METADATA | SC-11; VT-14; FR-05; RULE-07/08/09/17 | PASS | {"version":2,"expiry":null,"movement_count":1} |
| TX-CREATE-after_reserve | SC-01; VT-02; RULE-04/19 | PASS | {"entries":"0","requests":"0"} |
| TX-CREATE-after_entry | SC-01; VT-02; RULE-04/19 | PASS | {"entries":"0","requests":"0"} |
| TX-CREATE-after_movement | SC-01; VT-02; RULE-04/19 | PASS | {"entries":"0","requests":"0"} |
| TX-CREATE-after_domain | SC-01; VT-02; RULE-04/19 | PASS | {"entries":"0","requests":"0"} |
| TX-CREATE-after_result | SC-01; VT-02; RULE-04/19 | PASS | {"entries":"0","requests":"0"} |
| TX-MOVEMENT-after_quantity | SC-05; VT-02/03; RULE-05/19 | PASS | {"remaining":"500.000","version":1,"movements":1,"reservation":0} |
| TX-MOVEMENT-after_movement | SC-05; VT-02/03; RULE-05/19 | PASS | {"remaining":"500.000","version":1,"movements":1,"reservation":0} |
| TX-MOVEMENT-after_domain | SC-05; VT-02/03; RULE-05/19 | PASS | {"remaining":"500.000","version":1,"movements":1,"reservation":0} |
| TX-MOVEMENT-after_result | SC-05; VT-02/03; RULE-05/19 | PASS | {"remaining":"500.000","version":1,"movements":1,"reservation":0} |
| CONCURRENT-VERSION | SC-09; VT-05; NFR-02; RULE-05/17 | PASS | {"connection_ids":["1308","1309"],"outcomes":["201","VERSION_CONFLICT"],"remaining":"150.000","events":2} |
| CONCURRENT-REPLAY | SC-08; VT-06; RULE-18/19 | PASS | {"connection_ids":["1314","1313","1315"],"replays":2,"remaining":"300.000","events":2} |
| PREFERENCES-CONCURRENCY | SC-14; VT-05/13; RULE-13/17 | PASS | {"connection_ids":["1318","1319","1320"],"user":{"version":2,"attention_lead_days":1},"completed_requests":1} |
| REPLAY-KEY-CONFLICT | SC-08; VT-07; RULE-18 | PASS | {"original_status":201,"lost_response_replayed":true,"payload_target_conflicts":2,"case_and_owner_separate":true} |
| OWNER-SCOPE | SC-13; VT-12 repository layer; RULE-01/24 | PASS | {"foreign_rejections":6,"missing_principal":401,"owner_dto":422,"http_auth":"NOT TESTED"} |
| LEDGER-APPEND-PRIVILEGES | RULE-23; FR-07 | PASS | {"denied_operations":4,"history":"append-only application grant"} |
| LOCAL-MIDNIGHT | SC-14; VT-13; RULE-12/13 | PASS | {"east":["2026-10-09","soon","2026-10-10","due_today"],"west":["2026-10-09","due_today"],"clock_calls":1} |
| PREFERENCES-BOUNDARY | SC-14; VT-13; FR-09; RULE-13 | PASS | {"valid_leads":[0,30],"invalid_rejections":4,"food_unchanged":true} |
| QUERY-PRIORITY | SC-03/04/15; FR-02/03; RULE-12/20 | PASS | {"priority":["past_date","past_date","due_today","soon","unknown","later"],"pagination_ids":["8bf07d1e-348f-43e5-bb24-d423f97bddbb","86e7a88a-7c42-4cd0-924b-660701ebe0ea"… |
| QUERY-EXPLAIN | FR-02; NFR-08 measured baseline only | PASS | {"sql":"WITH classified AS (SELECT *,CASE WHEN expiry_date IS NULL THEN 'unknown' WHEN expiry_date<? THEN 'past_date' WHEN expiry_date=? THEN 'due_today' WHEN DATEDIFF(ex… |
| LEDGER-SUM | RULE-04/19; VT-03/09/10 | PASS | {"entries":436,"requests":53,"incomplete":0,"ledger_violations":0} |
| API-FE-PARITY-AUDIT | NFR-03; VT-01/14; FR-01/04/08 | PASS | {"contract_version":"3.1.1","mismatches":["known versus exact; date_* versus expiry_date_*","stock_movements/adjustment versus quantity_movements/recount","UUID/decimal-s… |
| BACKUP-RESTORE | VT-16 sandbox scope; NFR-07 | PASS | {"restored_database":"expiry_test_20261010043116081_e179ea_restore","dump_bytes":226201,"table_counts_equal":true,"ledger_equal":true,"fk_count":3,"staging_production":"N… |
| HTTP-AUTH-INTEGRATION | SC-13; VT-12; FR-10; NFR-01 | NOT TESTED | "No HTTP API/auth provider exists in repository; trusted-principal sandbox tests do not verify identity establishment." |
| UI-RECOVERY-INTEGRATION | SC-08/09/15; VT-15; NFR-04 | NOT TESTED | "New repository is not wired into uidemo; draft/401/timeout/refetch behavior requires FE/API integration." |
| UX-ACCESSIBILITY | VT-17; NFR-05 | NOT TESTED | "No UI change or keyboard/screen-reader/device acceptance performed in this DB task." |
| BUSINESS-MODEL-APPROVAL | BR-V1-01/02/03; DEC-03…09 | NOT TESTED | "Stakeholder/user research approval is separate from database constraints and SQL tests." |
| PRODUCTION-PERFORMANCE | NFR-08 | NOT TESTED | "Representative local EXPLAIN is recorded; no hosting/volume/SLA approved or benchmarked." |

Fault injection exercises5 capture and 4 movement boundaries, including after reservation, after entry/quantity, after ledger, after domain work and after saved response. Rollback leaves no partial entry/history/current quantity or committed key.

CONCURRENT-VERSION uses2 independent transaction connections at a barrier:500 g, each command 350 g with expected_version 1; one 201, one 409 VERSION_CONFLICT;remaining 150 g, one added event. CONCURRENT-REPLAY uses3 independent simultaneous connections with the same owner/key/body; one mutation, two replays, identical original response. Preferences concurrency exercises ownerFKshared-lock→exclusive-row upgrade; complete rollback and bounded retry leave one settings result and one version conflict.

MySQL coercion probe demonstrates1.0004 raw input becomes1.000 with warning 1265; domain validation rejects excessive scale first. Unit piece fraction is rejected beforeSQL and by DB remaining CHECK. Completed 204 stores JSON null, distinct from SQL NULL reservation. Replay lookup precedes stale version/deleted checks.

Backup/restore actually used mysqldump and import into a new sandbox. Comparison verified counts across 5 tables, ledger equality and 3 FKs; it did not compare every restored field byte-for-byte. Development seed rerun verified identical before/after row fingerprint f4ccbab03ee484bd097a8f5a48a8f8bfd9adf416f692c69ebabae4ea962dc08b; all development fixture quantities/history remain unchanged.

## Enforcement boundaries

| Mechanism | DB-enforced | Repository/service-enforced | UI-only or unverified |
|---|---|---|---|
| Owner relation | NOT NULL/FK/RESTRICT | trusted principal→scoped reads/writes/history | HTTP provider/session identity unverified |
| Quantity | DECIMAL range, nonnegative quantity, piece integer | positive capture/amount, scale before coercion, no overspend, unit immutable | UI decimals still numbers,needs adapter |
| Date | DATE/null and checked combinations | exact calendar validation; IANA zone; local-day classification | food safety/usability unverified |
| Ledger | FK, kind/shape CHECK, at most 1 initial; append-only app grants | at least 1 initial, atomic current quantity + event, ledger equality, no-op rule | privileged admin repair can bypass public immutability |
| Versions | INT>=1 | row lock + expected_version; once per real change | no real FE conflict integration |
| Replay | owner/key PK, ASCII case, both-null-or-complete shape | normalized target/hash, replay before version, result before commit, bounded deadlock retry | incomplete raw SQL reservation is possible outside service |
| Visibility | nullabledeleted_at | soft delete/restore without quantity event | no FEconnected acceptance |
| Attention | no storedstatuscolumn | classification/filter/priority before pagination, injected frozen clock | no approved production SLA or food-safety outcome |

## PostgreSQL / MySQL / OpenAPI / FE gaps

PostgreSQL uuid/timestamptz/jsonb/regex ~ and partial indexes were converted as documented in06_MYSQL_IMPLEMENTATION_NOTES. MySQL uses readable ASCII UUIDs, DECIMAL, UTC DATETIME, JSON, REGEXP_LIKE, generated uniqueness and composite indexes. Whole migration DDL is not claimed atomic; DML rollback is separately exercised. Future physical changes require new version,not editing applied001.

Observed source mismatches:
- known versus exact; date_* versus expiry_date_*
- stock_movements/adjustment versus quantity_movements/recount
- UUID/decimal-string versus ent_/numbers
- SQL composite owner/key versus mock synthetic id
- OpenAPI restore VersionCommand requires expected_version; mock restoreEntry(key,id) omits it
- mock saved response_status always200; DB create/movement201, delete204, recount no-op200
- mock key reuse422 IDEMPOTENCY_PAYLOAD_MISMATCH; contract/repository409 IDEMPOTENCY_KEY_REUSED
- mock JSON.stringify payload fingerprint versus canonical normalized SHA256
- fixed DEMO_DATE versus injected owner-local day
- Create quantity input is mock initial_quantity:number versus OpenAPI quantity:decimal-string.
- Mock package_label/user_reentered map to printed_label/user_entered; nullable mock unknown metadata maps to explicit unknown/unspecified.
- Mock attention past/today maps to past_date/due_today.
- New repository returns raw DB rows/timestamps and unpaginated internal history; an HTTP DTO/error/history-pagination adapter is still required. The parity audit passing means discrepancies were detected and recorded, not that the UI is integrated.

## Query correctness and performance observation

Representative owner dataset:400entries; scope remains before derived filter/sort/limit. EXPLAIN selected access_typeALL,rows_examined_per_scan436,using_filesort=true. The plan listed eligible composite indexes but chose a table scan for this small/high-owner-share dataset. The single local warm query measured 5.1 ms. This is one observation,not a latency SLA,throughput benchmark or proof of optimal indexing. Production volume/hosting/targets remain open. No persisted duplicate attention rule was added.

## Commands and corrected failures

| Command/action | Actual result |
|---|---|
| pwd;git rev-parse;git status;source discovery | expectedrepo/branch;dirtytree;flatresolvedsources |
| docker version/ps/volume ls;port checks | daemon 29.1.3;no runningcontainers initially;2unrelatedvolumes preserved;3307free |
| host docker compose version | absent; officialv5.6.0 downloaded into ignoredproject-local.tools |
| local compose config --quiet;up-d | validsecret-safeconfig;dedicatedmysql8.4created/healthy |
| node scripts/manage.mjs migrate-dev | liveDDL applied001;thenchecksumno-op |
| grants setup | initial REVOKE1141 corrected by resolving escaped schema grants;exactscope only |
| node scripts/manage.mjs verify-dev | authenticatedversion/timezone/isolation,counts,seedfingerprint,binding/health PASS |
| node scripts/manage.mjs dump-dev | real schema dump saved |
| Workbench --run-script workbench_export.py | nativeconnection/read/parity/model/export PASS aftercharsetregistryfix |
| native openModel/activateDiagram | savedExpiryEERloaded/viewed;userUntitleduntouched |
| node tests/run.mjs | 35PASS,0FAIL,5NOTTESTED;freshsandbox+freshrestore |
| First test run | DELETE-RESTORE assertion '0' versus0 failed; driver bigint result normalized; first failed run JSON retained |
| Dev seed bootstrap | lockresult string1 handling and comment splitting corrected;no partialseedcommitted |
| Native GUI mouse/keyboard | unavailable; button/wizard clicksteps not asserted |
| git diff --check;static/gate checks | recorded at final closeout below; no FE source modification by this task |

A SIGTERM attempt to stop an agent-started failed Workbench launch returned Permissiondenied; it did not alter schemas/files. A corrected native launch subsequently saved the connection and the checked viewscriptopened the model. Existing userapplication windows/data were not force-killed or replaced.

## Changed artifacts and how to rerun

| Paths | Responsibility after this task |
|---|---|
| docs/erd/01…06 | resolved evidence/audit,logicalERD,dictionary,relationshipmatrix,candidate decisions/MySQL differences |
| docs/erd/07_DB_VERIFICATION_REPORT.md | evidence boundaries,traceability,testregister,environment,commands,risks |
| docs/erd/expiry_mysql.mwb,expiry_mysql_eer.png | real native Workbench outputs from live schema |
| docs/erd/expiry_mysql_live_schema.sql | actual liveDDLdump;importonlyinto an explicitly new sandbox |
| docs/erd/workbench_*_evidence.json | nativeauthentication/model/parity/export/view evidence,no secrets |
| database/mysql/compose.yaml,.env.example,.gitignore | dedicatedloopbackMySQL/healthcheck/volume and privatecredential policy |
| database/mysql/migrations/001_initial_schema.sql,seed.sql | candidateversionedDDL andnonoverwritingdevelopmentfixtures |
| database/mysql/src/domain.mjs,repository.mjs,connection.mjs | domainprevalidation,owner-scopedtransaction/replay/querySQL,privilege/migrationhelpers |
| database/mysql/scripts/init-env.mjs,manage.mjs | privateenvinit,explicitdevmigration/seed/verify/dump |
| database/mysql/tests/run.mjs,static.mjs | realfreshDBtestharness andartifact/secret/evidencechecks |
| database/mysql/workbench_export.py,workbench_open.py,workbench_show_model.py | nativeWorkbench extraction/serialization,non-rootconnection andactualEERview |
| database/mysql/package*.json,GATES.md,evidence/ | dedicateddriver lockfile,acceptanceledger,per-run evidence |

Run from /home/pro/Downloads/expiry/database/mysql:
```bash
npm ci --no-audit --no-fund
node scripts/manage.mjs verify-dev
node tests/run.mjs
node tests/static.mjs
```

Test script always creates a fresh validated expiry_test_* name and preserves old runs;no dev reset, volume deletion, system prune or production deployment. Developmentendpoint/profile:127.0.0.1:3307,expiry_app,expiry_dev. Password remains inignored.env and is never part of report. To view the saved native model, open docs/erd/expiry_mysql.mwb inWorkbench;select Expiry live MySQL schema diagram. To reverseengineer manually,use Database→Reverse Engineer→Expiry Local Docker→expiry_dev,not generic Untitled/mydb. Installedhelpermay omit expressions;use checked nativeexporter and compare counts.

## Remaining review and acceptance

- Candidate grain,date/unit semantics,two-dayexperimentaldefault,retention/account erasure and userbenefit need stakeholder review. Source DEC-01/02 stay recorded-confirmed;DEC-03…09/OQ decisions are not silently approved.
- Real HTTPauth/session/error mapping,OpenAPIresponseadaptation,historypagination andFE integration remain outside this DBsandbox.
- Workbench 8.0.36 does not guarantee full8.4 admin/wizard compatibility and its EER does not encode CHECK enforcement.
- EXPLAIN still uses filesort/table scan for the measured dataset;no production performance target validated.
- Sandbox backup tested counts/ledger/FKs;production/staging backup operating procedures and restore drill remain open.
- Existing old document links/layout and dirty UIchanges remain user-owned context;this task creates the DBartifacts separately.


## Final closeout evidence

The acceptance ledger completed automated G3 (artifact/secret/model checks), G4 (authenticated development SQL and byte-equivalent row fingerprint across seed replay), and G6 (a fresh independent database run). Latest retained run: expiry_test_20261010043116081_e179ea; PASS: 35, FAIL: 0, BLOCKED: 0, NOT TESTED: 5. Manual G8 verifies this report against those exact results and the native Workbench evidence. Source-diff whitespace check passed. Required artifacts exist, model ZIP/XML and image hashes match the native exporter, and actual generated credential values are absent from authored text and decompressed native model XML. These gates close the requested sandbox implementation and evidence report; the five named external acceptance items remain NOT TESTED.

