# Expiry — ERD and public contract audit, 11 October 2026

Audit snapshot: 2026-10-11 15:55 +07:00 (Asia/Ho_Chi_Minh). Repository: `/home/pro/Downloads/expiry`, branch `feature/ui`. Existing dirty documentation and application changes were inspected and preserved. This artifact is newly authored; historical documents are not relabeled approved. Labels: **[A]** checked source or this audit's executed checks (historical evidence is explicitly identified as retained and not rerun); **[B]** official documentation; **[C]** inference; **[D]** recommendation/proposal. Grades distinguish data representation from current integration and stakeholder approval.

## Decision and verification boundary

- **[A] Core inventory representation: PASS against the documented private-inventory grain and use cases.** The current reference and migration represent owner preferences, food quantities/date provenance, quantity movement history, and command replay. No inventory table is missing merely because the physical model has five tables.
- **[A] Final selected-product persistence: PARTIAL.** The user has now selected Node-managed email/password and server sessions. The current schema contains identity subjects but no credential or session persistence. A minimal auth extension is proposed separately; schema/migration approval and application remain pending. This is a new, specified persistence need, not an automatic requirement for all authentication architectures.
- **[A] Current public inventory projection: corrected and tested with injected repositories/connections.** Six dedicated HTTP/DTO tests pass. They test the real routers/controllers/services and public snapshot mapper without connecting to MySQL or establishing identity.
- **[A] Authenticated React → Node → Python → MySQL end-to-end acceptance: not established by this audit.** Auth, scan orchestration, actual DB transactions, frontend recovery, browser reload and service restart are separate acceptance boundaries.
- **[A] Retained historical evidence: the DB run began 2026-10-10T04:31:16.081Z (11:31:16 +07:00)** and records 35 PASS, 0 FAIL, 0 BLOCKED, 5 NOT TESTED. Its original repository/sandbox checks are useful historical evidence; the current API uses a pooled connection wrapper and the new public facade, so that run cannot certify today's API execution.

## Current context and source evidence

| File / symbol | Responsibility and observed behavior | Issue / confidence |
|---|---|---|
| `contracts/schema_reference_mysql.sql:3-99` | Four application tables; 25 named CHECKs, 3 FKs, binary IDs/enums/keys; exact decimal storage | Current MySQL reference; High |
| `database/mysql/migrations/001_initial_schema.sql` | Same bytes/hash as the reference, baseline DDL | Applied migration001 must not be edited; High |
| `database/mysql/src/connection.mjs:46-56`, `migrate` | Creates operational `schema_migrations`, hashes001, rejects checksum drift/unversioned partial schema | Only001 is implemented; a general upgrade sequence is not implemented; High |
| `docs/architecture/06-data-model/erd-workbench/02_LOGICAL_ERD.mmd:2-50` | Four logical persistent entities, owner optional children, entry initial-history cardinality after commit | Does not imply five domain entities; High |
| `docs/architecture/06-data-model/erd-workbench/03_ENTITY_DICTIONARY.md:7-52` | Grain, field meaning, null/default/type, rule/UC/test traceability | Candidate/review status and stale document annotations remain; High |
| `apps/api/src/shared/repository.mjs:21-45` | Atomic reservation + domain work + response cache; replay matches owner/key/operation/hash | Trusts a principal supplied by its caller; HTTP auth is an external owner; High |
| `apps/api/src/shared/repository.mjs:47-109` | Owner-scoped lock, expected version, unit-aware milliunits, quantity+ledger writes | Row shape constraints alone do not establish these invariants; High |
| `apps/api/src/shared/repository.mjs:117-124`, `get` | Owner-validates detail/history; history reads all ordered movements | Bounded HTTP page does not yet imply bounded SQL history work; High |
| `apps/api/src/shared/connection.mjs:49-84` | mysql2 pool, decimal strings, date strings, UTC session convention | Current API connection differs from historical disposable-DB runner; High |
| `apps/web/src/mockApi.ts:285-300,593` | Singleton in-memory prototype data source | Does not demonstrate persistence or API integration; High |

## Conceptual grain, identity and normalization

| Entity | One row means | Identity / relationship | Grade |
|---|---|---|---|
| users | One owner with preferences | UUID; unique namespaced identity subject; owner may have zero entries/commands | PASS representation |
| food_entries | A user-declared quantity group sharing unit, date/location/opening context | UUID; exactly one owner; name/date is not unique identity | PASS representation |
| stock_movements | One committed quantity change | UUID; exactly one entry; minimum one initial after create commit | PASS representation with service invariant |
| api_requests | One write command within owner/key scope | Composite `(user_id,idempotency_key)`; target in operation/hash rather than polymorphic FK | PASS representation |
| schema_migrations | One fully applied migration version | Integer version PK; checksum and recorded application instant | PASS infrastructure |

**[A]** Grain is defined in `05_Data_Definitions_and_ERD.md:15-20` and `04_RELATIONSHIP_MATRIX.md:13`. All entry attributes describe this grain; no global product/catalog identity is claimed. No 1:1 or N:N relationship is required for the private inventory baseline. Optional child cardinalities follow user0..Nentries/commands; each entry/movement/command has its required parent. Same name/date may represent different opening/location conditions, so the model deliberately omits a name/date unique constraint.

**[A]** `05_Data_Definitions_and_ERD.md:143-148` documents controlled denormalization: current remaining quantity is operational state, while the ledger is the quantity-change record. The invariant is `SUM(quantity_after-quantity_before)=remaining_quantity`, and both must change atomically. Attention/lifecycle are derived, not stored; owner settings are not copied into entries. The replay response is a command snapshot, not the latest inventory source. This is not a blanket claim of strict third normal form.

## Physical schema inventory and constraint coverage

Current reference/migration: **4 application tables + runner-created migration table = 5 physical tables**, **42 columns**, **3 FKs**, **25 named CHECKs** in the saved export. The current reference/migration SHA256 is `32f2806e6bc4a2b271e3b93a8978352df6910334d3217501647b0729567b32cc`, also present in retained evidence. These are source/export counts; this audit did not query the running server.

| Table | Columns | PK / unique | FK / delete / update | Checks / indexes | Grade |
|---|---:|---|---|---|---|
| users | 8 | PK id; users_identity(identity_subject) | None | 4 CHECKs: users_display, users_timezone, users_lead, users_version | PASS baseline |
| food_entries | 16 | PK id; no name/date unique | entries_owner: user_id→users.id, NOT NULL, RESTRICT/RESTRICT | 11 CHECKs; entries_owner_visible, entries_owner_quantity, entries_owner_trash | PASS baseline |
| stock_movements | 8 | PK id; one_initial_per_entry(initial_entry_id), generated nullable helper | movements_entry: entry_id→food_entries.id, NOT NULL, RESTRICT/RESTRICT | 5 CHECKs; movements_entry_history | PASS quantity history |
| api_requests | 7 | Composite PK(user_id,idempotency_key) | requests_owner: user_id→users.id, NOT NULL, RESTRICT/RESTRICT | 5 CHECKs; PK covers owner/key replay lookup | PASS command persistence |
| schema_migrations | 3 | PK version | None | No application CHECK/FK; runner owns checksum replay guard | PASS001; PARTIAL future upgrade sequence |

| Table | Named CHECKs and meaning |
|---|---|
| users | users_display (trimmed length1..100), users_timezone (nonblank length1..100), users_lead (0..30), users_version (>=1) |
| food_entries | entries_name / entries_location (nonblank); entries_quantity (>=0); entries_unit (piece/g/ml); entries_piece (integer pieces); entries_certainty (known/estimated/unknown); entries_source (printed_label/user_entered/user_estimate/unknown); entries_label (use_by/best_before/unspecified); entries_date_state (coherent NULL/provenance combinations); entries_note (<=1000 or NULL); entries_version (>=1) |
| stock_movements | movements_kind (initial/consume/discard/adjustment); movements_before / movements_after (>=0); movements_reason (<=500 or NULL); movements_shape (initial0→positive; use/discard decrease; adjustment different with nonblank reason) |
| api_requests | requests_key (ASCII8..100 allowed chars); requests_hash (64 lower hex); requests_operation (nonblank); requests_status (NULL or2xx); requests_completion (both result fields SQL NULL or both SQL nonnull) |

**[A]** `remaining_quantity` and movement before/after are DECIMAL(12,3), maximum999999999.999. DB exact storage does not reject every excessive-scale input before coercion; the domain parser validates decimal strings and integer milliunits before SQL. DATE is a calendar date, not a UTC instant. DATETIME(6) uses an explicit UTC connection convention; it does not store timezone metadata. `updated_at` has a creation default, with later updates owned by the service; there is no blanket ON UPDATE trigger. IANA-zone validity, UUID lexical form and immutable unit/owner remain application checks.

## Invariant and lifecycle enforcement owners

| Invariant / behavior | DB owner | Domain/repository/HTTP owner | Proof boundary / grade |
|---|---|---|---|
| Required existing owner/entry | NOT NULL FK, RESTRICT | Verified identity and per-object owner-scoped reads/actions | DB representation PASS; authenticated isolation requires current auth/HTTP checks |
| Nonnegative quantity, piece integrality | Quantity/unit CHECKs, DECIMAL | Positive create/use amount, scale/range validation, no overspend | Source PASS; historical QUANTITY-VALIDATION/DECIMAL-COERCION |
| Valid date/provenance shape | DATE and entries_date_state | Exact calendar parser; IANA zone and current owner-local day | Source PASS; historical DATE-STATES/LOCAL-MIDNIGHT |
| Max one initial event | Generated unique initial_entry_id | At least one initial in create transaction | Cardinality source PASS; FK cannot enforce minimum child |
| Current quantity equals ledger delta sum | Per-row movement guards | Same transaction/connection; invariant audit | Source PASS; historical TX-* and LEDGER-SUM; new API DB execution not rerun |
| Append-only quantity history | Application grants INSERT/SELECT only | No public rewrite path; administrator repair remains privileged | Historical grant checks; current deployment grants not queried |
| Concurrent update conflict | version>=1 only | FOR UPDATE + expected_version; once per real mutation | Source PASS; historical two-connection CONCURRENT-VERSION |
| Same-key retry | Owner/key composite PK, hash/result guards | Stable client key; target/hash matching; saved original status/body before commit | Source PASS; HTTP middleware/client separately tested by their owners |
| Visibility versus disposal | Nullable deleted_at | Delete/restore changes visibility/version, not quantity/ledger | Source PASS; historical DELETE-RESTORE |
| Attention / lifecycle | No stored derived column | Canonical domain policy; owner preferences/runtime clock | Public facade reuses policy; injected HTTP tests PASS; browser/runtime context separately required |
| Erasure / retention | RESTRICT relationships and persisted replay snapshots | Explicit approved deletion/anonymization/retention workflow | PARTIAL future lifecycle decision; not implemented and not an inferred MVP table gap |

## Public contract audit and focused implementation

**[A]** On initial inspection, all core schemas and seven path objects in `contracts/public-api.yaml` were structurally identical to `contracts/openapi.json`; YAML additionally contained `/scans`. The machine-readable core contracts therefore agree. Their authentication metadata is historical bearer/provider-placeholder prose; the chosen cookie session transport requires a separately reviewed contract update. This audit does not change either contract.

| Contract operation | Prior source mismatch | Focused current change / boundary |
|---|---|---|
| API-01 create | Raw row exposed user_id, lacked lifecycle/attention, raw DATETIME strings | Public facade produces Entry before response-cache save; Location/replay header preserved |
| API-02 inventory | Flat total/page/limit/as_of_date instead of pagination; raw user_id; null inactive attention | EntryList field projection and pagination; strict integer parsing and public view enum |
| API-03 detail | Raw row without derived public fields | Owner-validated raw read + current owner preferences/clock + exact Entry projection |
| API-04 metadata edit | Raw result without Entry fields/UTC conversion | Same pre-save Entry projection; domain allowlist/date rules unchanged |
| API-05 consume/discard | MutationResult entries/raw movements lacked public fields and delta | Pre-save entry+movement projection; signed delta via exact milliunits |
| API-06 recount | Same DTO gap, including no-op entry | Both201 changed and200 no-op MutationResult preserved and projected |
| API-07 history | No pagination metadata/page limit, raw timestamps, no delta | Owner-validated ordered history mapped and sliced; total/page/limit returned; still reads all SQL events |
| API-08 delete | Controller read body, contract requires expected_version query | Strict required query integer forwarded; 204 body empty; replay preserved |
| API-09 trash | Default active filter omitted depleted deleted entries; flat list metadata | Service explicitly uses lifecycle all; EntryList; inactive attention and separate quantity lifecycle |
| API-10 restore | Raw Entry result | Pre-save Entry mapping; required VersionCommand remains repository-validated |
| API-11 preferences GET | Leaked id/identity_subject/display_name; fabricated lead3 when owner missing | Only timezone/lead/version selected/projected; missing owner raises AUTH_REQUIRED |
| API-12 preferences PATCH | Repository already returned correct Preferences fields | Existing shape/status/replay forwarded; no business/schema changes |
| All failures/auth/key handling | Problem required code/media type, parser limits, unsafe identity/demo fallback, auto keys | Outside mapper ownership; root/auth changes and tests must verify these current boundaries |
| API-13 scan | YAML-only path; OCR candidate contract and confirmation workflow | Separate scan audit/root implementation; no scan-table conclusion from this file |

Changed files: `apps/api/src/shared/public-dto.mjs`; `apps/api/src/modules/inventory/public-inventory.repository.mjs`; inventory service/controller; expiry service; `apps/api/tests/public-contract.test.mjs`. The facade subclasses the existing repository only to wrap its work result: same transaction, same domain work, explicit public projection **before** the saved response. Cached replays retain their original attention/as-of snapshot instead of recalculating after preferences/clock changes. No repository/domain/connection/DDL file was changed by this artifact's author.

**[A] Verification executed:** `node --test tests/public-contract.test.mjs` from `apps/api` → **6 PASS / 0 FAIL**. Tests mount real routers/controllers/services with injected repository/connection doubles and an explicit test principal. They check all12 core operation response schemas against the committed contract; UTC microseconds/decimal deltas; list/history pagination; depleted trash; strict query parsing and DELETE version forwarding; missing-owner preferences; pre-save snapshot mapping. They do not validate SQL, real authentication, network OCR or production operations.

**[D] Remaining minimal API work:** verify root-owned problem responses expose `code`, `application/problem+json` and sanitized details; reject absent idempotency keys; establish cookie-auth credentials before owner-private operations; test schema-confirmed MySQL vertical slices and frontend error/retry behavior. Move history pagination/count into the repository if realistic ledger sizes require bounded SQL reads. Pre-existing cached command rows created before the public facade may contain old raw DTOs; review compatibility/expiry policy explicitly before carrying such rows into a real environment. Do not clear caches silently as a migration workaround.

## Mixed document decisions and current approval provenance

| Source | Observed status / conflict | Interpretation |
|---|---|---|
| `00-context/scope.md:4,25-37` | Approved; private/manual/ledger plus Node/MySQL and synchronous assistive Python scan in scope | Current product scope includes scan; older manual-only documents cannot automatically exclude it |
| `00-context/decisions-and-questions.md:23-28,41-44` | DEC-03..08 Approved; OQ-02 resolved; OQ-04 still in progress | Data/stack choices have later approval prose; auth selected by current human instruction, not this old file |
| `00-context/decisions-and-questions.md:24` | DEC-04 calls certainty exact/inferred/null and TIMESTAMPTZ | Conflicts with current known/estimated/unknown and MySQL DATETIME(6); preserve and explicitly reconcile; do not downgrade schema to stale vocab |
| Workbench dictionary/relationship/decisions | Candidate/review and earlier proposals/open approval | Valid technical evidence with older approval status; source verification is distinct from stakeholder approval |
| `06-data-model/entities-and-migrations.md:39` | Calls reference not a deployed migration; historical path unresolved | Documentation drift relative to migration/export/test artifacts |
| `08-architecture/ADR-003-authentication.md:4,24-29` | Blocked; provider/server-session/JWT alternatives | Current human chose Node-managed credentials/sessions; architecture decision must be recorded separately and concretely |

## Proposed minimum auth persistence impact — not applied

**[D]** Retain all inventory entities, current owner UUIDs, quantity/date rules and owner-scoped FKs. Add an account-credential persistence responsibility and durable server-session responsibility justified by the chosen login/session lifecycle. A focused candidate is `user_credentials` (one credential account per owner; unique normalized email; password hash with algorithm/salt/cost representation and audit instants) plus `user_sessions` (many sessions per owner; unique one-way token hash; creation/expiry/revocation and optional activity instants). Exact fields, constraints, credential policy and migration002 belong to the separate auth proposal.

Credential lifecycle: registration → hashed credential stored → login verification → credential change/revocation policy. Session lifecycle: verified login → random opaque secret cookie → hashed server lookup → expiry/revocation/logout. Passwords and raw session tokens must not be stored. A separate refresh-token table is not implied by this choice. Existing identity_subject still supplies a unique local identity namespace mapped to owner id.

**[A]** Current five tables do not contain this credential/session state. **[D]** New migration version002 must be reviewed and approved before application. Review fresh install and upgrade from001, unique email/session hashes, invalid/expired/revoked session rejection, FK ownership, account erasure/retention, application grants and rollback/forward recovery. Migration001 stays immutable. The existing runner only knows001; approval does not automatically provide an upgrade executor or prove an applied migration.

## Remaining evidence limits

No current live MySQL introspection, migration application, DB business tests, browser/device/network tests, real auth login, service restart, production performance or stakeholder usability acceptance was performed by this audit. Retained report references to no HTTP API/uidemo paths are dated statements; current `apps/api` source exists. SOURCE manifests below identify the bytes inspected, not a claim that parallel auth/root edits or live servers remain identical indefinitely.


## Physical column inventory — saved export, not current live introspection

[A] All42 saved physical columns are listed below. PK/unique/FK/CHECK details are in the tables above. UTC and decimal semantic validation are service responsibilities even where SQL types are exact.

| Column | MySQL type | Nullability | Default / generated helper | Source table begins |
|---|---|---|---|---|
| api_requests.user_id | char(36) | NOT NULL | No explicit default | saved export:15 |
| api_requests.idempotency_key | varchar(100) | NOT NULL | No explicit default | saved export:15 |
| api_requests.operation | varchar(255) | NOT NULL | No explicit default | saved export:15 |
| api_requests.request_hash | char(64) | NOT NULL | No explicit default | saved export:15 |
| api_requests.response_status | int | NULL allowed | NULL | saved export:15 |
| api_requests.response_body | json | NULL allowed | NULL | saved export:15 |
| api_requests.created_at | datetime(6) | NOT NULL | CURRENT_TIMESTAMP(6) | saved export:15 |
| food_entries.id | char(36) | NOT NULL | No explicit default | saved export:35 |
| food_entries.user_id | char(36) | NOT NULL | No explicit default | saved export:35 |
| food_entries.name | varchar(200) | NOT NULL | No explicit default | saved export:35 |
| food_entries.storage_location | varchar(100) | NOT NULL | 'unspecified' | saved export:35 |
| food_entries.remaining_quantity | decimal(12,3) | NOT NULL | No explicit default | saved export:35 |
| food_entries.unit | varchar(10) | NOT NULL | No explicit default | saved export:35 |
| food_entries.expiry_date | date | NULL allowed | NULL | saved export:35 |
| food_entries.date_certainty | varchar(12) | NOT NULL | 'unknown' | saved export:35 |
| food_entries.date_source | varchar(20) | NOT NULL | 'unknown' | saved export:35 |
| food_entries.date_label_type | varchar(15) | NOT NULL | 'unspecified' | saved export:35 |
| food_entries.opened_on | date | NULL allowed | NULL | saved export:35 |
| food_entries.note | text | NULL allowed | No explicit default | saved export:35 |
| food_entries.version | int | NOT NULL | '1' | saved export:35 |
| food_entries.deleted_at | datetime(6) | NULL allowed | NULL | saved export:35 |
| food_entries.created_at | datetime(6) | NOT NULL | CURRENT_TIMESTAMP(6) | saved export:35 |
| food_entries.updated_at | datetime(6) | NOT NULL | CURRENT_TIMESTAMP(6) | saved export:35 |
| schema_migrations.version | int | NOT NULL | No explicit default | saved export:73 |
| schema_migrations.sha256 | char(64) | NOT NULL | No explicit default | saved export:73 |
| schema_migrations.applied_at | datetime(6) | NOT NULL | CURRENT_TIMESTAMP(6) | saved export:73 |
| stock_movements.id | char(36) | NOT NULL | No explicit default | saved export:83 |
| stock_movements.entry_id | char(36) | NOT NULL | No explicit default | saved export:83 |
| stock_movements.kind | varchar(12) | NOT NULL | No explicit default | saved export:83 |
| stock_movements.quantity_before | decimal(12,3) | NOT NULL | No explicit default | saved export:83 |
| stock_movements.quantity_after | decimal(12,3) | NOT NULL | No explicit default | saved export:83 |
| stock_movements.reason | text | NULL allowed | No explicit default | saved export:83 |
| stock_movements.recorded_at | datetime(6) | NOT NULL | CURRENT_TIMESTAMP(6) | saved export:83 |
| stock_movements.initial_entry_id | char(36) | NULL allowed | STORED generated (initial entry uniqueness) | saved export:83 |
| users.id | char(36) | NOT NULL | No explicit default | saved export:106 |
| users.identity_subject | varchar(255) | NOT NULL | No explicit default | saved export:106 |
| users.display_name | varchar(100) | NOT NULL | No explicit default | saved export:106 |
| users.timezone | varchar(100) | NOT NULL | 'Asia/Ho_Chi_Minh' | saved export:106 |
| users.attention_lead_days | int | NOT NULL | '2' | saved export:106 |
| users.version | int | NOT NULL | '1' | saved export:106 |
| users.created_at | datetime(6) | NOT NULL | CURRENT_TIMESTAMP(6) | saved export:106 |
| users.updated_at | datetime(6) | NOT NULL | CURRENT_TIMESTAMP(6) | saved export:106 |

## Source manifest

Manifest generated 2026-10-11T08:58:52+00:00; SHA256 over file bytes. Paths relative to `/home/pro/Downloads/expiry`. File modification times are filesystem metadata, not approval or execution dates. Files changed by other owners after this capture may differ; retained test execution timestamp is separately reported above.

| Source file | SHA256 | Filesystem modified UTC |
|---|---|---|
| `contracts/schema_reference_mysql.sql` | `32f2806e6bc4a2b271e3b93a8978352df6910334d3217501647b0729567b32cc` | 2026-10-11T06:28:59+00:00 |
| `contracts/public-api.yaml` | `4cc9fa1da869ac25970be9ed2cf65f03be3d6b1a76193be35f15f84eb58b635d` | 2026-10-10T11:03:58+00:00 |
| `contracts/openapi.json` | `3b72da250b837cc5e25d6af2b2746521e3177bf66b150dd9b980db9c7be2057d` | 2026-10-07T23:40:04+00:00 |
| `contracts/scan-api.yaml` | `83b6dd31d29f49ca412443b343f74e4c33b950943590b59670acac07d0a0eac2` | 2026-10-10T11:03:36+00:00 |
| `database/mysql/migrations/001_initial_schema.sql` | `32f2806e6bc4a2b271e3b93a8978352df6910334d3217501647b0729567b32cc` | 2026-10-10T04:01:15+00:00 |
| `database/mysql/src/connection.mjs` | `d8d78af6c604d6cd60f4ab2c9b09a3cad96ff2257fa4bdc7268e8c2a86bff815` | 2026-10-10T04:07:32+00:00 |
| `database/mysql/src/domain.mjs` | `d89b4cf0c491d8851ef138828dcb75dc11fe41ce048be3f0046d9c9565b28c77` | 2026-10-10T04:13:33+00:00 |
| `database/mysql/src/repository.mjs` | `e02f6f2d9df0fb8f73bd536a116f1e9b7a3d8362bfe7768678bd9639b698d07b` | 2026-10-10T04:06:59+00:00 |
| `database/mysql/evidence/latest-tests.json` | `c73edc510c141618d11b15227ab7a8a35a9e6a52e9a869ef2915f6a84222bc8f` | 2026-10-10T04:31:18+00:00 |
| `docs/architecture/00-context/scope.md` | `0c24e3ff49cee9744c268ca627a48ebd06b9019d35735f55109dfa35da0e6a11` | 2026-10-10T11:02:12+00:00 |
| `docs/architecture/00-context/decisions-and-questions.md` | `a641e92a3b26fafcc834e640ef61a91dcaa36a453d9e42c7b0f1deb3012cda8d` | 2026-10-11T06:30:47+00:00 |
| `docs/architecture/08-architecture/ADR-003-authentication.md` | `85ccd2c430037274f0f557fa285923ddaf6caa1e591956ac0029b8f4ac3e02e3` | 2026-10-10T08:29:36+00:00 |
| `docs/architecture/06-data-model/05_Data_Definitions_and_ERD.md` | `74ffea51184bb4f9151dfeb913357c48540e6c016935648d30630d5f7c9c6e62` | 2026-10-11T06:30:47+00:00 |
| `docs/architecture/06-data-model/entities-and-migrations.md` | `fb50ddeb0e87887b09bf31bad9033b49dc4bbc8fa0841353e11028809533d419` | 2026-10-11T06:30:47+00:00 |
| `docs/architecture/06-data-model/erd-workbench/02_LOGICAL_ERD.mmd` | `37671615a1a8f600837a2ed63ef67d66bdf3c056dd8b4487d13f195fb0d8d447` | 2026-10-10T03:59:02+00:00 |
| `docs/architecture/06-data-model/erd-workbench/03_ENTITY_DICTIONARY.md` | `e971d9b21ff3f216b78bbbf9b49e3311868f4814edf2f6c260115626f8414cfd` | 2026-10-10T04:15:10+00:00 |
| `docs/architecture/06-data-model/erd-workbench/04_RELATIONSHIP_MATRIX.md` | `203a790251c442089d41fe71d27627b00e0876a1396748f7a8e841415a7ef19b` | 2026-10-10T03:59:02+00:00 |
| `docs/architecture/06-data-model/erd-workbench/05_DESIGN_DECISIONS.md` | `640014f0020a07df40fb8adf84d010e5145d5f1c7bc858de027b76be752b7152` | 2026-10-11T06:30:47+00:00 |
| `docs/architecture/06-data-model/erd-workbench/07_DB_VERIFICATION_REPORT.md` | `1877c1580dfc6977e1cf37b363c576ed1ef8b4881344cd659701943d86c76472` | 2026-10-11T06:30:47+00:00 |
| `docs/architecture/06-data-model/erd-workbench/expiry_mysql_live_schema.sql` | `a65f7ebc9adf3390e62751d2b4a950ab42b2414df1c57f6cd71376e873c2295f` | 2026-10-10T04:07:46+00:00 |
| `apps/api/src/shared/connection.mjs` | `c15940021c58829e3bd57dc3ec9ef508a8c6f8df519f90d7da1a11d47c22d50e` | 2026-10-10T11:35:31+00:00 |
| `apps/api/src/shared/repository.mjs` | `e02f6f2d9df0fb8f73bd536a116f1e9b7a3d8362bfe7768678bd9639b698d07b` | 2026-10-10T11:35:23+00:00 |
| `apps/api/src/shared/domain.mjs` | `d89b4cf0c491d8851ef138828dcb75dc11fe41ce048be3f0046d9c9565b28c77` | 2026-10-10T11:35:23+00:00 |
| `apps/api/src/shared/public-dto.mjs` | `9c2e00475339e1541dd193a2dabdd1c2642200932aae9ca5d2de853270257868` | 2026-10-11T08:53:10+00:00 |
| `apps/api/src/modules/inventory/inventory.controller.mjs` | `a43d4591f79972b5667bd750c0f707edcb1a9d7343cb96b3a687216df21b054f` | 2026-10-11T08:53:10+00:00 |
| `apps/api/src/modules/inventory/inventory.service.mjs` | `fb0a6988ed65a7d2e02025eb0cb8d6af75a728199e70d949fd3810f73f9c5493` | 2026-10-11T08:53:10+00:00 |
| `apps/api/src/modules/inventory/inventory.routes.mjs` | `0e394473d0bb484f54d9d6d64c65ac45e1d60a78845a0db61dfe43ce38da9394` | 2026-10-10T11:36:02+00:00 |
| `apps/api/src/modules/inventory/public-inventory.repository.mjs` | `3579a44343057fed6bf73842c9ecf0369e4670528c8e7340309b38f3e03ee2ad` | 2026-10-11T08:53:10+00:00 |
| `apps/api/src/modules/expiry/expiry.service.mjs` | `47517706813b82b79d02cf720755ec7d17d3b333caa98e994083dfc6aea7899b` | 2026-10-11T08:53:10+00:00 |
| `apps/api/src/modules/expiry/expiry.controller.mjs` | `e5596405ae2db1452d11577b746badb9b99dfe4414fbadc56659c855015f9256` | 2026-10-10T11:36:13+00:00 |
| `apps/api/tests/public-contract.test.mjs` | `bc841d8873ae486accf425fe5a6b989fe46f05ef2b9c33ec1d6914fddf600a3b` | 2026-10-11T08:54:48+00:00 |
| `apps/web/src/mockApi.ts` | `427a96b2c95796e107d282b963b38f2615b3c47912b1f03927fcc68e38759385` | 2026-10-09T18:13:48+00:00 |
| `apps/web/src/lib/format.ts` | `6cbc28ee21d1b731f42b5bcb3ab1e3514021515bc2f2cdb4145c399077bd037d` | 2026-10-09T18:11:42+00:00 |
| `apps/web/src/App.tsx` | `ebfdb8a88af6465948e11ea81843797b16493c721f897c0cb5271f01ed683e0f` | 2026-10-10T09:24:29+00:00 |
