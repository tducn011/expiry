# Logical and physical entity dictionary

Status: candidate/review. Food rules retain their original IDs. Physical implementation selected by this task: MySQL8.4/InnoDB; UTF8MB4 text, ASCII binary IDs/enums/keys/hash. DTO quantities are decimal strings; UUIDs are canonical lowercase strings. UTC instants are returned with an adapter policy; raw MySQL DATETIME strings are not yet HTTP DTOs.

| Entity.field | Meaning / logical type | Physical / null/default | Source / process / test |
|---|---|---|---|
| users.id | authenticated owner UUID | CHAR36 ascii_bin PK, not null | RULE-01; identity boundary; OWNER-SCOPE/FK-ORPHANS |
| users.identity_subject | namespaced provider subject | VARCHAR255 utf8mb4_0900_bin UNIQUE not null | UC-00; auth bootstrap; SCHEMA-STRUCTURE |
| users.display_name | profile name | VARCHAR100 nonblank not null | UC-00; profile; DB-ROW-GUARDS |
| users.timezone | IANA time zone | VARCHAR100 ascii_bin, default Asia/Ho_Chi_Minh | UC-11/RULE-13; preferences; LOCAL-MIDNIGHT |
| users.attention_lead_days | persisted preference, not derived state | INT0…30, default2 experimental | UC-11/RULE-13; P4; PREFERENCES-BOUNDARY |
| users.version | optimistic profile version | INT>=1 default1 | RULE-17; P4; PREFERENCES-CONCURRENCY |
| users.created_at | recorded creation instant | DATETIME6 UTC default CURRENT_TIMESTAMP6 | identity bootstrap; SCHEMA-STRUCTURE |
| users.updated_at | last profile update instant | DATETIME6 UTC default CURRENT_TIMESTAMP6 | P4 transaction; SCHEMA-STRUCTURE |
| food_entries.id | unique quantity-group identity | CHAR36 ascii_bin PK | UC-01/RULE-02; P1; DB-CREATE |
| food_entries.user_id | exactly one immutable owner | CHAR36 ascii_bin FK NOT NULL RESTRICT | RULE-01/24; P1/P2/P3; OWNER-SCOPE/FK-ORPHANS |
| food_entries.name | trimmed display-name snapshot | VARCHAR200 nonblank, no name UNIQUE | UC-01/06/RULE-02; DB-CREATE/METADATA |
| food_entries.storage_location | shared storage context | VARCHAR100 nonblank, default unspecified | UC-01/06; P1/P3; DB-CREATE/QUERY-PRIORITY |
| food_entries.remaining_quantity | operational current quantity | DECIMAL12,3 >=0; max999999999.999 | RULE-03/04/05/06; P1/P3; QUANTITY-VALIDATION/LEDGER-SUM |
| food_entries.unit | immutable piece/g/ml | VARCHAR10 checked | RULE-03/08; P1; QUANTITY-VALIDATION/METADATA |
| food_entries.expiry_date | reported calendar date, not safety | DATE nullable | RULE-09…14/21; P1/P2/P3; DATE-STATES/LOCAL-MIDNIGHT |
| food_entries.date_certainty | known/estimated/unknown | VARCHAR12 checked default unknown | RULE-09/10; DATE-STATES |
| food_entries.date_source | printed_label/user_entered/user_estimate/unknown | VARCHAR20 checked default unknown | RULE-09/10; DATE-STATES |
| food_entries.date_label_type | use_by/best_before/unspecified | VARCHAR15 checked default unspecified | RULE-10/14; DATE-STATES |
| food_entries.opened_on | independent calendar opening date | DATE nullable | RULE-11/22; P1/P3; DATE-STATES |
| food_entries.note | user plain-text note | TEXT nullable max1000 | UC-01/06; P1/P3; METADATA |
| food_entries.version | current optimistic version | INT>=1 default1 | RULE-17; P3; CONCURRENT-VERSION |
| food_entries.deleted_at | visibility tombstone, no quantity event | DATETIME6 UTC nullable | UC-09/10/RULE-15; P3; DELETE-RESTORE |
| food_entries.created_at | recorded capture instant | DATETIME6 UTC default CURRENT_TIMESTAMP6 | UC-01/RULE-20; P1/P2; DB-CREATE/QUERY-PRIORITY |
| food_entries.updated_at | last real mutation instant | DATETIME6 UTC, service updated | RULE-17; P3; METADATA/RECOUNT |
| stock_movements.id | immutable event identity | CHAR36 ascii_bin PK | UC-01/04/05/07/08; TX-CREATE/TX-MOVEMENT |
| stock_movements.entry_id | exactly one entry | CHAR36 ascii_bin FK NOT NULL RESTRICT | RULE-04/23; P1/P2/P3; FK-ORPHANS |
| stock_movements.kind | initial/consume/discard/adjustment | VARCHAR12 checked | RULE-04/05/06/16; P1/P3; LEDGER-KINDS/RECOUNT |
| stock_movements.quantity_before | locked operational value before event | DECIMAL12,3 >=0 | RULE-04/19; P1/P3; LEDGER-SUM |
| stock_movements.quantity_after | quantity after event | DECIMAL12,3 >=0; shape checked by kind | RULE-04/05/06/19; LEDGER-SUM |
| stock_movements.reason | correction reason; optional use/disposal note | TEXT nullable max500; adjustment nonblank required | RULE-06; UC-07; RECOUNT |
| stock_movements.recorded_at | server recorded event instant | DATETIME6 UTC; not physical action proof | UC-08; P2; LEDGER-KINDS |
| stock_movements.initial_entry_id | physical uniqueness helper, no DTO field | stored generated CHAR36; UNIQUE, nullable | maximum1 initial; INITIAL-CARDINALITY |
| api_requests.user_id | principal-scoped command owner | CHAR36 FK+composite PK | RULE-18/19; P1/P3/P4; REPLAY-KEY-CONFLICT |
| api_requests.idempotency_key | stable command token | VARCHAR100 ascii_bin; [A-Za-z0-9_-]8…100; PK | every write; CONCURRENT-REPLAY |
| api_requests.operation | command plus normalized target | VARCHAR255 ascii_bin nonblank | RULE-18; mutation executor; REPLAY-KEY-CONFLICT |
| api_requests.request_hash | canonical normalized-payload SHA256 | CHAR64 ascii_bin lower hex | RULE-18; REPLAY-KEY-CONFLICT |
| api_requests.response_status | saved original2xx | INT nullable reservation | RULE-18/19; TX-RESULT/DELETE-RESTORE |
| api_requests.response_body | saved response snapshot, no latest-state authority | JSON; SQL NULL reservation; JSON null204 | RULE-18/19; CONCURRENT-REPLAY/DELETE-RESTORE |
| api_requests.created_at | reservation/command instant | DATETIME6 UTC default CURRENT_TIMESTAMP6 | no automatic pruning proposal; RULE-19 |
| schema_migrations.version | operational migration identity | INT PK | VT-16; MIGRATION-REPLAY |
| schema_migrations.sha256 | applied file hash | CHAR64 ascii_bin not null | no silent rewrite; MIGRATION-REPLAY |
| schema_migrations.applied_at | successful full-file application instant | DATETIME6 UTC | VT-16; MIGRATION-REPLAY |

Logical cardinalities are in `04_RELATIONSHIP_MATRIX.md`. Source `docs/dictionary.md` has a stale secondary annotation calling attention_lead_days derived and typos `stock_movements.after`/`api_requests.body`; primary dictionary definitions are used here. No extra columns result from those annotations. `RULE-21` past-date capture with reason versus no capture.reason DTO is recorded as an ambiguity; implementation permits the date and exposes attention explanation rather than inventing a new input requirement.

No persisted attention/lifecycle/safe status. Derived quantity state active/depleted is independent of deleted visibility. Date unknown requires NULL/unknown/unspecified; estimated requires date/user_estimate; known requires date/printed_label or user_entered. Quantity and ledger deliberately denormalize current value for reads, with atomicity and equality audit. Metadata never changes unit/owner/quantity/history. No public history rewrite. No persona-to-role mapping.
