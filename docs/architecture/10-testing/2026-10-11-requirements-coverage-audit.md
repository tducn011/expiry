# Expiry requirements and traceability audit — 2026-10-11

- Status: **Review audit; no requirement or architecture approval is granted by this file.**
- Repository: `/home/pro/Downloads/expiry`; inspected branch: `feature/ui`.
- Authorized change in this subtask: this new audit file only. Existing dirty documents, application sources, contracts, schemas and database state were preserved.
- Result: **PARTIAL for requirement/traceability readiness**. Core food persistence concepts have explicit mappings. Approved assistive scan is only partly incorporated into the requirement graph. Authentication authority remained unresolved in the inspected source documents; the subsequent user decision below selects the implementation direction. This is not a final physical-schema verdict or authenticated end-to-end acceptance.
- Confidence: **High** for inspected text, IDs, source ownership and static code paths; **Medium** for cross-document interpretation; **Not verified** for stakeholder approval, participants, live external documents and integrated runtime.

## Current user decision — 2026-10-11 15:57 +07

[A] After the source audit snapshot, the parent task reported the user's explicit selection of **Node-managed email/password authentication and server-side sessions**, followed by approval of the concrete **migration 002** adding `local_credentials` and `user_sessions` to `expiry_dev` and isolated test databases. The parent task owns schema application and its verification; the auth implementation and contract work are separate delegated responsibilities. This subtask has not applied that migration or tested authentication.

This direct user selection resolves the architecture choice for the current implementation task. It does not retroactively change `ADR-003`'s historical Blocked label, approve every draft BR/FR/RULE, establish participant outcomes or confirm secure end-to-end behavior. The five-table persistence discussion below describes the audited source baseline before this choice; the explicitly approved two-table auth addition is a justified scope update, not a table added for appearance. Existing documents and their hashes were preserved.

## Evidence and status conventions

[A] means observed local source text, code or read-only output in this audit. A document's claim that something is Approved or previously passed is source evidence about that document; it is not a newly executed check or independent proof of approval. [B] means a primary external reference; no external reference was refreshed by this subtask. [C] means an explicit interpretation. [D] means a recommendation.

Keep three independent status axes:

| Axis | Meaning |
|---|---|
| Design coverage | COVERED / PARTIAL / MISSING / CONFLICTING / OUT_OF_SCOPE against the selected requirement semantics |
| Runtime verification | STATIC_ONLY / HISTORICAL_REPORTED / NOT_EXECUTED_HERE; an actual executed result requires its command, environment, inputs and output |
| Approval | Source-declared User Confirmed / Approved / Review / Blocked / In Progress; do not infer approval from a link, date, complete matrix or successful test |

All application acceptance tests in the tables below are **NOT_EXECUTED_HERE**. Existing evidence files and checks executed by the parent task must be assessed separately before changing that status. The older test catalog's “Not run” entries are dated statements, not proof that no later database test exists.

## Inspected scope and authority

Primary text was reviewed across context, personas, research/validation, requirements/rules, use cases/scenarios/flows, interactions, architecture, frontend ownership and test/traceability sources. The manifest identifies each materially used source. Historical/consolidated sources were consulted for namespace, scope and dated claims; they were not silently substituted for current implementation choices. Registry metadata, definitions, edges, gate statuses and referenced-path existence were inspected without running a generator.

No live Google Docs/Canva/Figma refresh, interview transcript verification, binary wireframe/PDF visual review, deployment inspection or runtime service/database test was performed by this subtask. Package-release/performance claims copied inside research/ADRs were not independently revalidated.

| Source / exact location | Date and namespace | Authority actually observed |
|---|---|---|
| `docs/architecture/00-context/scope.md:4-5,25-37` | Approved label; updated 2026-10-10 18:00 +07; capability/DEC/ADR references | Current local selected scope: personal food inventory, manual capture, attention, ledger, Node/MySQL, assistive Python scan and user confirmation. Push and household sharing deferred. [A] |
| `docs/architecture/00-context/decisions-and-questions.md:21-32,43` | 2026-10-10; DEC-* / OQ-* | DEC-01/02 User Confirmed, DEC-03…10/12/13 Approved labels; OQ-04 authentication still In Progress. Labels are preserved, not expanded to full requirement approval. [A] |
| `docs/architecture/03-requirements-features/business-requirements.md:4-5,17,23-35` | Review; 2026-10-09; BR-V1-* | Three proposed food outcomes. They retain their own meaning; not measured achievements. [A] |
| `docs/architecture/03-requirements-features/system-requirements.md:17,23-34` | Review; 2026-10-09; food::FR-* | Ten behavior proposals; auth transport awaits ADR. Scope approval does not approve every draft FR/RULE or prove implementation. [A/C] |
| `docs/architecture/03-requirements-features/business-rules.md:23-46,64` | Review; 2026-10-09; food::RULE-01…24 | Canonical food rule baseline explicitly for review. [A] |
| `docs/architecture/01-personas/final-check-persona-alignment.md:20-29,43-79` | Review; updated 2026-10-10; FINAL CHECK::* versus SYS-* versus food::* | Semantic support crosswalk, explicitly not equivalence or renaming. The saved source is a draft. [A] |
| `docs/architecture/03-requirements-features/Expiry_System_Requirements_Summary.md:3-5,15-20,44-55,68-72` | Review; whole-system SYS-BR/FR/NFR-* | Abstract logical requirements before delivery choices; no automatic adoption of all product domains, channels or shared-owner features. [A] |
| `docs/architecture/08-architecture/Expiry_System_Definition.md:3,29-39,57-61` | Review; whole-system definition | Purpose, ontology, feedback and boundary; explicitly separate from scope. Physical safety is outside software proof. [A] |
| `docs/architecture/consolidated/Expiry_Complete_System_Design_2026-10-08.md:2,28,53-65,78` | Historical 2026-10-08 design; CTX/DEC/BR-V1/food IDs | Older manual-only/private scope and proposed decisions. Preserve provenance rather than applying its OCR exclusion to the current Approved scan choice. [A/C] |
| `docs/architecture/08-architecture/ADR-003-authentication.md:4,24-29,43` | Blocked; 2026-10-09 | Provider/session/credential authority not approved. Keep principal boundary stable while recording the unresolved choice. [A] |
| `docs/architecture/08-architecture/ADR-004-ocr-boundary.md:4-5,31-32`; `ADR-006-hybrid-architecture.md:36-44,84-89` | Approved labels; 2026-10-10 | Python transient candidate extraction, no direct MySQL; Node owns business persistence after user confirmation. Approval does not establish OCR accuracy or latency. [A] |
| `docs/architecture/10-testing/coverage.md:21-34`; `test-catalog.md:23-49`; `11-traceability/registry.json:4186-4230` | Review plans / graph | Planned coverage, not executed acceptance. Current graph and historical gate prose require reconciliation. [A] |

The crosswalk defines three distinct meanings: `food::FR-03` is attention, `FINAL CHECK::FR-03` is updating information, and `SYS-FR-03` is accepted lifecycle events. Same-numbered IDs must not be merged. The feature catalog retains **F-01…F-08 plus FR-10 auth support** (`features.md:165`); no new F-09 is introduced by this audit.

## Persona, challenge, need, stakeholder and business outcomes

[A] Persona cards support behavior mechanisms; they do not establish empirical user prevalence, validated quotes, new permission roles or a mandatory technology choice. P1 remains a planned purchaser who sometimes loses attention; P2's household context does not approve a shared inventory; P3's maintenance pain does not by itself select Python, batch editing or a new store.

| Food outcome | Persona / observed card mechanism | Challenge and need references | Stakeholder support | Capability support | Design / runtime / approval |
|---|---|---|---|---|---|
| BR-V1-01: notice existing food and attention with low effort | P1 visibility; P2 review before choosing | CH-01 / NEED-01; PP-11/13, PP-21 | ST-V1-01; FINAL CHECK::SYS-SR-01 and UR-01/04 | FR-01/02/03/09; F-01/02/03/08 | PARTIAL outcome coverage: technical capabilities represented; effort, missed/stale records and actual benefit need a study. NOT_EXECUTED_HERE; Review |
| BR-V1-02: enough context to choose next action after plans change | P2 changed plans / next-action gap | CH-02 / NEED-02; PP-21/22 | ST-V1-02; FINAL CHECK::SYS-SR-02 and UR-05 | FR-03/04/05; F-02/03/04/05 | PARTIAL: priority/detail/action support is represented; no proof that broader meal-decision barriers are resolved. NOT_EXECUTED_HERE; Review |
| BR-V1-03: records reflect physical changes with reasonable maintenance effort | P3 repetitive updates; P1 also affected | CH-03 / NEED-03; PP-31/32/33 | ST-V1-03/04/05; FINAL CHECK::SYS-SR-03/05/07 and UR-03/07/08/10 | FR-01/04/05/06/07/08/10 | PARTIAL: quantity/history/recovery concepts represented; physical accuracy over time and effort not measured. NOT_EXECUTED_HERE; Review |

Exact source evidence: `P01-persona.md:24-32,39-45`, `P02-persona.md:24-32,39-45`, `P03-persona.md:24-34,41-47`; `01_Research_Personas_and_Opportunities.md:51-63,68-88`; `stakeholder-requirements.md:24-40`; `business-requirements.md:23-35`; `01-personas/final-check-persona-alignment.md:47-79`, all under `docs/architecture/`.

[A] CH-01…03 / NEED-01…03 are registered as Review nodes, but their registry definition path `02-challenges/needs-opportunities.md` is absent. Their semantic support is recoverable from the persona, stakeholder, crosswalk and research-validation texts. This audit does not invent replacement canonical definitions or mark the missing definition path resolved.

| FINAL CHECK outcome namespace | Semantic support from food outcomes | Verification still needed |
|---|---|---|
| FINAL CHECK::BR-01: reduce household food waste | BR-V1-01/02; visibility and decision | Real baseline and longitudinal waste measurement |
| FINAL CHECK::BR-02: support use/handling decisions | BR-V1-02 | Participant understands uncertainty/reason and chooses an appropriate next action |
| FINAL CHECK::BR-03: improve household resource use | BR-V1-01/02/03 | Cost/repeated-purchase/actual-use evidence; correct quantities alone do not prove savings |
| FINAL CHECK::BR-04: sustain effective management | BR-V1-01/03 | Effort, continued use and staleness over time |

These are support relationships recorded at `01-personas/final-check-persona-alignment.md:45-50`. No outcome is marked achieved. Whole-system `SYS-BR-01…04` separately address awareness, informed decisions, reconciled records and reasonable effort (`Expiry_System_Requirements_Summary.md:15-20`).

## Core FR-01…FR-10 design coverage matrix

All IDs below use the **food namespace** unless explicitly prefixed. Tables reproduce source semantics; the runtime and approval axes are reported separately. Entity shorthand: E1 = ENT-01/users; E2 = ENT-02/food_entries; E3 = ENT-03/stock_movements; E4 = ENT-04/api_requests. `schema_migrations` is infrastructure, not another user capability.

| FR / source line in system-requirements.md | BR / stakeholder / persona need | Feature; UC; scenario; user flow | Rules from business-rules.md | DF / entity / UI | API / existing planned tests |
|---|---|---|---|---|---|
| FR-01, line 23: capture name/quantity/unit; optional date/provenance | BR-V1-01/03; ST-V1-01/03; P1/P3 NEED-01/03, P2 unknown-date context | F-01; UC-01; SC-01/02; UF-01/02 | 01–04,09–11,18–19,21–22 | DF-01; E1 owner, E2/E3/E4 writes; WF-02 | API-01; VT-01/02/14; TC-21 |
| FR-02, line 24: owner list/search/filter, stable pagination | BR-V1-01; ST-V1-01; P1/P2 NEED-01/02 | F-02; UC-02; SC-03/04/13; UF-03/04 | 01,20,24 | DF-02; E1/E2 read; WF-01 | API-02; VT-12; TC-18 |
| FR-03, line 25: explained attention/local-date classification | BR-V1-01/02; ST-V1-01/02; P1/P2 NEED-01/02 | F-02/03; UC-03; SC-03/04/14/15; UF-03/04 | 09–14,16,20 | DF-02; E1/E2 read, attention derived; WF-01/03 | API-02/03; VT-13; TC-19 |
| FR-04, line 26: atomic retry-safe consume/discard | BR-V1-03; ST-V1-02/03; P3 NEED-03, P2 chosen action | F-04; UC-04/05; SC-04/05/06/08/09/12; UF-04/05/06 | UC-04:03/05/17–19; UC-05:05/15/16/18/19; owner/error01/24 apply | DF-03; E2/E3/E4; WF-04 | API-05; VT-03–07/10/12 |
| FR-05, line 27: metadata edit with version, no generic quantity change | BR-V1-02/03; ST-V1-02/03; P2/P3 NEED-02/03 | F-05; UC-06; SC-11; UF-08 | 07–14,17–19,24 | DF-03; E2/E4; no quantity movement; WF-02 | API-04; VT-14/15/12; TC-21 |
| FR-06, line 28: actual recount with correction history | BR-V1-03; ST-V1-03; P3 NEED-03, P2 physical mismatch | F-05; UC-07; SC-07; UF-07 | 03,06,16–19,23/24 | DF-03; E2/E3/E4 if changed; no-op has no quantity event; WF-04 | API-06; VT-08/09/12 |
| FR-07, line 29: owner movement history | BR-V1-03; ST-V1-03; P3 NEED-03 | F-06; UC-08; SC-07/12; UF-07 and detail history action | 04,23/24 | DF-03 read; E2 owner check/E3; WF-05 | API-07; VT-10/12 |
| FR-08, line 30: trash/delete/restore separate from disposal | BR-V1-03; ST-V1-03; P3 NEED-03 | F-07; UC-09/10; SC-10; UF-09 | 15,17–19; UC-10 includes16 | DF-03; E2/E4; E3 quantity history unchanged; WF-03/05 | API-08/09/10; VT-11/12 |
| FR-09, line 31: timezone and attention lead, recompute | BR-V1-01/02; ST-V1-01/02; P1/P2 NEED-01/02 | F-08; UC-11; SC-14; UF-10 | 12/13/17–19 | DF-04; E1/E4; E2 not rewritten; WF-06 | API-11/12; VT-13/12; TC-20 |
| FR-10, line 32: identity gate and retained-draft continuation | CTX-05; ST-V1-04; all personas; privacy/recovery is a system need | Auth support, not new F-09; UC-00 + owned UCs; SC-13 ownership and UF-11 interruption | 01/24; identity/cookie/session rules pending ADR-003 | DF-04 auth boundary; E1 mapping conditional on verified identity; UI draft; WF-00/02/04 | Auth adapter operation pending; all owned APIs; VT-12/15; TC-23 |

Source navigation for this matrix: `docs/architecture/03-requirements-features/system-requirements.md:23-34`; `business-rules.md:23-46`; `04-user-flows/use-cases.md:21-199`; `scenarios.md:21-259`; `user-flows.md:21-197`; `06-data-model/data-flows.md:73-98`; `entities-and-migrations.md:32-35`; `07-api/endpoints.md:21-223`; `10-testing/coverage.md:23-34`; `test-catalog.md:23-49`. Scenario contexts are proposed test constructions, not recorded participant incidents.

### Inputs, outputs, ownership and persistence

| FR | Input → output | State owner / lifecycle owner | Persistent versus derived |
|---|---|---|---|
| 01 | Confirmed EntryCreate + verified principal + key → created entry or explicit error | React form owns draft; Node inventory/repository transaction owns accepted create; user confirms physical information | E2 current data + E3 initial event + E4 result persist; UI draft does not |
| 02 | Owner/query/page → eligible ordered rows/count/page | Node owner-scoped repository/query; React list/cache presents results | E1/E2 read; filter/cache/navigation state client-owned |
| 03 | Food metadata + settings + injected clock → attention/reason/as_of_date | Backend attention/query policy; user chooses next action | Settings/food persist; attention/lifecycle/local-day projections derived |
| 04 | kind/amount/version/key → updated entry + movement | Node transaction owns quantity/version/history; user confirms use/disposal | E2/E3/E4 atomic writes; no mutation from simply opening or canceling UI |
| 05 | Allowed metadata patch/version/key → edited entry and recomputed attention | Node metadata/domain validation + repository; form retains failed draft | E2/E4 persist; E3 tracks quantity, not all metadata edits |
| 06 | actual_quantity/reason/version/key → correction or no-op | Node recount transaction; user reports observed quantity | Changed E2/E3/E4; no-op does not invent physical consumption/discard |
| 07 | Owned entry/page → movement timeline | Node owner check/query; React history display | E3 existing committed quantity events; no public edit/delete |
| 08 | Owned ID/version/key → hidden/restored record | Node delete/restore transaction; record visibility separate from physical quantity | E2.deleted_at/version + E4; E3 quantity history preserved |
| 09 | Preferences patch/version/key → settings/current attention | Node settings transaction; backend clock/timezone policy evaluates reads | E1/E4 persist; no daily status writes or food-row rewrite |
| 10 | Chosen credential + held task → verified identity or rejection/continuation | Auth adapter/provider must own verification/session lifecycle; React owns owner-bound draft/cache | Auth persistence depends on approved design; food entities do not themselves validate credentials |

[A] Static runtime owners were checked in `apps/api/src/modules/inventory/inventory.service.mjs:8-45`, `apps/api/src/shared/repository.mjs:21-65,67-164` and `apps/api/src/modules/expiry/expiry.service.mjs:10-29`. Repository transaction source alone does not prove HTTP/auth/DB integration acceptance. The API and sandbox repository copies had the same bytes at manifest capture; duplication is recorded, not refactored in this audit.

### Separate design, runtime and approval results

| Requirement | Design coverage | Runtime verification in this subtask | Approval |
|---|---|---|---|
| FR-01 | COVERED conceptually; integration DTO/clock/auth links PARTIAL | STATIC_ONLY: create + initial movement + replay writes present; frontend still mock at capture | FR Review; personal/manual scope User Confirmed; selected storage ADR Approved |
| FR-02 | COVERED conceptually; live transport/filter/pagination acceptance pending | STATIC_ONLY | FR Review; personal inventory scope User Confirmed |
| FR-03 | CONFLICTING details: rule/default/representation and old versus current projection must be reconciled by contract audit; required E1/E2 data concepts represented | STATIC_ONLY; historical mock paths separately reported | FR/RULE Review; attention scope User Confirmed |
| FR-04 | COVERED transaction/data concept; trusted principal and real client retry handling PARTIAL | STATIC_ONLY; no new concurrency/HTTP acceptance here | FR/RULE Review; ledger architecture Approved label |
| FR-05 | COVERED metadata concept; complete metadata audit history is not supplied by quantity ledger | STATIC_ONLY | FR/RULE Review |
| FR-06 | COVERED recount concept; no-op/change results must match transport | STATIC_ONLY | FR/RULE Review |
| FR-07 | COVERED quantity history concept; full metadata/security audit is a separate decision | STATIC_ONLY | FR/RULE Review |
| FR-08 | COVERED soft-delete/restore concept; retention/erase policy still open | STATIC_ONLY | FR/RULE Review; DEC-05 Approved label |
| FR-09 | COVERED stored settings concept; default and timezone behavior need parity checks | STATIC_ONLY | FR/RULE Review; DEC-06 Approved label |
| FR-10 | PARTIAL in source baseline; current user has selected local credentials/server sessions, implementation/contract evidence still pending | STATIC_ONLY; simulated React Boolean is not auth evidence | Historical ADR-003 Blocked / OQ-04 In Progress; direct user selection and migration approval recorded above, not retroactive source relabeling |

[A] At snapshot capture `apps/web/src/App.tsx:2,40-43,63-73,157-178,282-297,307-325` directly uses the synchronous mock singleton and demo Boolean auth. `main.tsx:7-11` mounts App without an auth provider. Session dialog `StatusDialog.tsx:84-89,156-174` contains recovery copy but its action only closes. These facts establish the inspected prototype path; they do not prove absence of every possible external auth deployment.

Historical reported browser results at `01-personas/final-check-persona-alignment.md:134-156` cover particular mock paths, viewports and validation. They were not rerun here and do not establish reload persistence, real auth, backend/scan integration, actual device/Safari behavior or participant usability. Native date value entry/save is explicitly not confirmed by that historical source.

## NFR and verification plan audit

| Food NFR | Planned evidence | Current audit boundary / approval gap |
|---|---|---|
| NFR-01 privacy | VT-12 and TC-23; A/B identity and cross-owner operations | Owner-scoped SQL is a static property; trusted credential verification and deployed isolation require actual integration evidence |
| NFR-02 integrity | VT-02/05/06; rollback, replay and concurrency | Transaction source exists; parent physical/API audit must establish executed test scope |
| NFR-03 contracts | VT-01/14, TC-21 | Multiple representations/contracts require explicit adapter ownership; five historical fixtures are not all-operation acceptance |
| NFR-04 recovery | VT-15 | Real stable-key retries, same-owner continuation and refetch need HTTP/browser evidence |
| NFR-05 accessibility | VT-17 | Design text requires labels/keyboard/focus; actual screen reader/device behavior not tested here |
| NFR-06 date accuracy | VT-13 | Injected clock/owner timezone policy versus fixed demo date must be checked at runtime |
| NFR-07 operations | VT-16 | Migration/restore/backup/staging readiness is beyond this semantic audit |
| NFR-08 performance | TC-22 | Host/volume/baseline/targets TBD; latency sentences in ADRs are not a measured SLA |

Sources: `03-requirements-features/nonfunctional-requirements.md:23-32`; `10-testing/test-catalog.md:23-51`. Product telemetry TC-24 remains a separate consent/provider/retention decision; observability ADR-005 is Review. No telemetry system or new empirical target was approved by this audit.

## Approved assistive scan: partial trace, preserved boundary

[A] Current scope includes scan at `00-context/scope.md:29-30`. `08-architecture/ADR-006-hybrid-architecture.md:84-89` specifies upload → Node → Python → candidates → React review/edit → user confirmation → Node → MySQL.

[A] There is a partial API trace rather than a wholly absent scan definition. `07-api/endpoints.md:225-240` registers **API-13 /api/v1/scans**, references **UC-12**, **VT-18** and **VT-19**, and explicitly assigns no direct food/movement write to extraction. `11-traceability/registry.json:2493-2499` registers API-13 with those test references. The inspected UC catalog defines UC-00…11 only; the test catalog defines VT-01…17 and TC-18…25; UC-12/VT-18/VT-19 definitions were not found in these catalogs/registry. The registry contains 205 nodes and 335 edges at capture, and no scan-specific API-13 graph edge was observed. Existing identifiers are preserved; no missing definition is invented here.

[C] Scan design coverage is **PARTIAL / CONFLICTING across documents**; runtime is **STATIC_ONLY / NOT_EXECUTED_HERE**; architecture status is source-declared **Approved**. A durable scan job/table has not been justified by this scope.

[A] `apps/api/src/modules/scan/scan.service.mjs:16-46` forwards image data to Python and returns JSON; `scan.controller.mjs:6-11` returns the result. `services/python-scan/app/routes/scan.py:33-68` processes bytes and returns text/candidates/warnings. This inspected extraction path writes no inventory/job state. Confirmed capture should preserve existing E2/E3/E4 invariants. React's actual upload/review/confirm integration and contract parity belong to the parent integration audit, not a passing claim here.

[D] Record the accepted assistive capability and close the missing semantic links, candidate-to-confirmed-field mapping and tests before calling traceability complete. Benchmark candidate quality, ambiguity/correction cost and bounded resources separately from a decision to use deterministic parsing. No model training approval is implied.

## Conflicts and traceability gaps

| Finding / confidence | [A] File, role and exact evidence | [C] Implication / [D] recommendation |
|---|---|---|
| RQ-A01 High: scope date drift | Approved `00-context/scope.md:29-30` includes scan; older `06-data-model/data-flows.md:26`, `00-context/ownership.md:44`, `03-requirements-features/impact-analysis.md:23,30`, `02-challenges/ocr-research.md:44`, `10-testing/test-catalog.md:47,49` still say future/research/conditional | Explicitly mark the older scope statements superseded for delivery scope; preserve research/validation limits. Do not use a newer approval date to claim measured accuracy |
| RQ-A02 High: dangling scan definitions | `07-api/endpoints.md:230,240`; `registry.json:2493-2499` references UC-12/VT-18/19; current catalogs lack definitions | Complete only the approved scan links through existing semantic namespaces; do not create duplicate F-09 or recycle TC IDs |
| RQ-A03 High: source auth decision remains unresolved | `ADR-003-authentication.md:4,24-29`; `decisions-and-questions.md:43`; `authentication.md:21-32,84` | The later direct user decision above now selects Node credentials/sessions for this task; historical sources remain unchanged. Implement/test the chosen authority and approved migration; do not treat Boolean UI auth as a secure mechanism |
| RQ-A04 High: missing source paths | Registry CH/NEED paths and `id-register.md:28-34` point to absent `02-challenges/needs-opportunities.md`; `11-traceability/README.md:21-22` links absent coverage.md/gates.md; persona crosswalk moved to 01-personas while multiple links still target 03-requirements-features | Correct navigation/registry ownership in a separately scoped change after selecting definition authority. Actual coverage is `10-testing/coverage.md`; gate prose also exists in `12-process/gates.md`, outside this report's edited scope |
| RQ-A05 High: stale verification/graph claims | `10-testing/verification-report.md:25,41-47` reports old 203 nodes, no applied DB and all artifacts draft; current registry has205 and newer scope/ADRs have Approved labels | Treat old results as dated evidence. Re-execute current validators/tests in the allowed environment before current PASS; old “Not run” is not a statement about all later runs |
| RQ-A06 High: obsolete runtime path assumptions | `08-architecture/components.md:26-30` and ADR-006 tree name uidemo/backend; current inspected sources are apps/web/apps/api. Component table lists HTTP/React Query/scan preview expectations while App still reads mock | Map desired component responsibilities to actual source paths; desired diagrams are not installed-library/runtime proof |
| RQ-A07 High: attention-default semantics | `business-rules.md:35` and `decisions-and-questions.md:26` specify default2; `apps/api/src/modules/expiry/expiry.service.mjs:16-20` fallback says3 | Contract/settings audit must choose behavior from existing approved decisions and test parity; no automatic database expansion |
| RQ-A08 High: namespace/approval ambiguity | `01-personas/final-check-persona-alignment.md:22-29`, `business-requirements.md:35`, `system-requirements.md:34` | Preserve source namespaces and support relationships; select a baseline explicitly, not by matching numeric IDs or UI labels |
| RQ-A09 Medium: incomplete event/audit scope | Food `UC-06` changes metadata without quantity ledger; `data-flows.md:94`; whole-system definition describes recorded accepted changes | Quantity history covers quantities, not all metadata/security events. Confirm which history granularity is selected before proposing another persisted audit entity |
| RQ-A11 High: unverified scan performance/quality assertions | `08-architecture/ADR-004-ocr-boundary.md:29` claims sufficient accuracy and response below 1.5 seconds; `02-challenges/ocr-research.md:40` records no benchmark; `nonfunctional-requirements.md:32` keeps latency targets unapproved | Source approval is separate from measured extraction quality, correction effort and host latency. Record an actual food-image benchmark before relying on those assertions |
| RQ-A10 High: no empirical outcome gate passed here | `business-requirements.md:33`; `research-validation.md:25-35`; persona evidence gaps | Runtime commands and graphs do not establish waste reduction, savings or sustained effort improvements. Retain proposed studies and unapproved targets |

The conflict findings are not instructions to change existing documents in this subtask. All source files and their dirty state remain unchanged.

## Decision and bounded next steps

[C] The selected core data concepts support the manual inventory/review/action flows without an established missing inventory entity solely from this requirement audit. Approved synchronous stateless scan does not, by itself, require another table. Auth persistence was undecided in the source snapshot; the current user's approved local-credential/session choice adds the specific persistence requirement recorded above. A physical-schema PASS requires the separate schema/constraint/transaction/API audit and relevant executed evidence.

[D] Preserve the existing inventory baseline while closing confirmed integration/document gaps and applying only the concrete auth addition now approved by the user. Maintain distinct evidence for requirement baseline, auth/session choice, schema application and runtime checks. The user-authorized integration task may progress through safe vertical slices, but authenticated end-to-end readiness requires passing tests of the chosen trust boundary.

[D] Before final integration acceptance: reconcile actual API contracts and identifiers; verify core HTTP/DB behavior; implement explicit real transport and mappings without silent mock fallback; maintain owner-bound draft/key/cache recovery; implement approved scan review/confirmation; then execute the narrow meaningful runtime/browser tests for each changed boundary. This audit does not approve a provider, migration, new table, deployment or external coordination.

## Checks actually performed and limits

[A] Read-only checks used `git status --short`, `git branch --show-current`, `rg --files`, focused `rg`, numbered text reads, standard-library JSON parsing of registry nodes/edges/gates, path existence inspection and SHA-256 byte hashing. No documentation generator, test suite, schema application, browser interaction or service was executed by this subtask. The only filesystem mutation is this new audit.

[A] Registry parsing observed 205 nodes / 335 edges and the unresolved scan IDs described above. Hashes identify the exact bytes inspected at audit capture; they do not certify source approval, correctness or equivalence to current live remote artifacts. Parent task mutations after capture can change a code hash legitimately.

Not verified here: authenticated HTTP end-to-end behavior, real provider/session storage, SQL runtime/concurrency/restart persistence, current contract conformance, native date save, Python image accuracy/latency/resources, complete upload rejection/timeout/cancel behavior, live remote source revision, Figma parity, actual mobile/Safari/screen-reader behavior, load/performance, staged backup/restore, production hosting/security and participant/BR outcomes.

## Source manifest

Kinds: P = primary text/semantic source reviewed, G = structurally parsed graph/register, H = selected historical/consolidated passages reviewed, C = static code/manifest read. P does not mean independently Approved. Historical research citations were not treated as newly verified primary studies. Paths are repository-relative; all hashes are SHA-256 over exact file bytes. The audit output itself is excluded to avoid a self-referential checksum.

| Kind | Source path | Bytes | SHA-256 |
|---|---|---:|---|
| P | `docs/architecture/00-context/00_Context_and_Evidence.md` | 6992 | `052196b8a32aff40ebf307a22d99f0f4a1f40978f74d8b8dcdf55a29b5663d32` |
| P | `docs/architecture/00-context/audit.md` | 4443 | `d10f4039cd90775e0f47337c354a0d7eeaec0eb80562acbc38e2012d007581d4` |
| P | `docs/architecture/00-context/decisions-and-questions.md` | 5830 | `a641e92a3b26fafcc834e640ef61a91dcaa36a453d9e42c7b0f1deb3012cda8d` |
| P | `docs/architecture/00-context/glossary.md` | 4340 | `b2fafb4d8c84c968c03452af90762a090904530d941ec3efd13e35315880d5e3` |
| P | `docs/architecture/00-context/ownership.md` | 3761 | `61d7b1d212b0c4e2c957aacde8c4db1e38faaa232980255ec14132229fca3464` |
| P | `docs/architecture/00-context/scope.md` | 4624 | `0c24e3ff49cee9744c268ca627a48ebd06b9019d35735f55109dfa35da0e6a11` |
| P | `docs/architecture/00-context/source-register.md` | 6897 | `3ca242cbe7b26c6f8e67cd8c5a7c95fed305878752dde214301ddbc177059ffd` |
| P | `docs/architecture/00-context/system-definition.md` | 2506 | `50644b6e0a06ca5a0f5b76b340dddd47a0a4b8a346cfcf4289a975b3e54a29a6` |
| P | `docs/architecture/01-personas/01_Research_Personas_and_Opportunities.md` | 11502 | `8613faef43dac2d11d426d99daa8cc6289b5f6b6d1ab71c5a4e8dfbe43019c52` |
| P | `docs/architecture/01-personas/10_Canva_Persona_Source.md` | 4189 | `686717483faebf900be44c23444077ce0c4337b58fa3da21de1c5b2681cac5c9` |
| P | `docs/architecture/01-personas/P01-persona.md` | 3365 | `ed30bea68509e6a7c352060f0387d4c91ecfd346fdbb6bb358177a3433a0c647` |
| P | `docs/architecture/01-personas/P02-persona.md` | 3505 | `a5f3c83eeaa5359b7e43af4dd4587a211f19cd32bb340cde534b2a62d1b2dcbe` |
| P | `docs/architecture/01-personas/P03-persona.md` | 3740 | `83bd6e8f3ed248edd6c7e4a10525da88d0efd3c84704354720269cf09166c6db` |
| P | `docs/architecture/01-personas/persona-comparison.md` | 1932 | `6ae11b75d45f8572b1372611f7c1206e37b2d6ca580c128ecb983339fa00f455` |
| P | `docs/architecture/01-personas/persona-evidence-gaps.md` | 2155 | `84be06a1d2387793bab0c558a0d5d5eee90293f7eee9b23a1341534a81470293` |
| P | `docs/architecture/01-personas/final-check-persona-alignment.md` | 18936 | `855336162999695b2ebdda542ba3fca1d7699d98f6b9cb967230bbfa594c1b41` |
| P | `docs/architecture/02-challenges/research-validation.md` | 4598 | `c66a0fd669ea322625c7a4f72ef21dfb9299ce8f804786d22d98e172fed9d188` |
| P | `docs/architecture/02-challenges/ocr-research.md` | 5011 | `0b99247acd9056bca2b82b511e5b3ccdbd58c0a33e6f551f7042ce4b47023daf` |
| P | `docs/architecture/03-requirements-features/02_Requirements_and_Business_Rules.md` | 10434 | `a43e645f20719665511606104b981f7e089fafa025178a600e857d88e85850d0` |
| P | `docs/architecture/03-requirements-features/Expiry_System_Requirements_Summary.md` | 11683 | `c548fde4b913b30d1c1e2d758d8cb16dca436a37a00a1a661c311b9dc197d083` |
| P | `docs/architecture/03-requirements-features/business-requirements.md` | 2687 | `750151e62700fcd6ee4698f0dcb4acfae8d2ec5220ca67f1e9dbacb88a680669` |
| P | `docs/architecture/03-requirements-features/business-rules.md` | 6012 | `3feb0aaa5a9b9376eb375104693c3bbbe9ca9010506cfdf64852042176c0a8c1` |
| P | `docs/architecture/03-requirements-features/features.md` | 8358 | `106a147b71f81f1952515d294e6d47ff75b616c0fb98bc9ca0639ba00c88b30f` |
| P | `docs/architecture/03-requirements-features/impact-analysis.md` | 3568 | `04dd8a06a34d1570a7dfce7d72512ff14354426146e287f7b3d83f6175fa552c` |
| P | `docs/architecture/03-requirements-features/nonfunctional-requirements.md` | 2686 | `a62c061653b78475076bf6eca6d07f9c41b2c86ffeb882594309af7fb15a0222` |
| P | `docs/architecture/03-requirements-features/stakeholder-requirements.md` | 4672 | `9e50307422b149a10a53f78c67117e06e9ea26452137c3fd8161a31f8727ff6b` |
| P | `docs/architecture/03-requirements-features/system-requirements.md` | 2898 | `9a85d79960b860018b90aeb66ad208c7224add4f6f7c4133e2dff8b2cd4eabb8` |
| P | `docs/architecture/03-requirements-features/unsupported-proposals.md` | 5044 | `a810e3a6c7cf77daf23edec6a8265f636812ea5e60f6e6187edf4009b1ac530f` |
| P | `docs/architecture/04-user-flows/03_User_Flows_Scenarios_and_Use_Cases.md` | 15715 | `ab9b4c04be4528cbf2ef95243c63441420214aca7d3fd755c496424fc5eb96c4` |
| P | `docs/architecture/04-user-flows/scenarios.md` | 15472 | `6513213e281eb1a8c9913dfbebaefe860f3731c4d11886a27bbdb036a5f373a6` |
| P | `docs/architecture/04-user-flows/use-cases.md` | 15032 | `207397b336e4b369c9d554714ddf26bbf5c553c5dbb5ccffdf08add003ff8e95` |
| P | `docs/architecture/04-user-flows/user-flows.md` | 13949 | `e3df6d1799110ce36b63d76057740fa9099620f328c851904fee5475020bd719` |
| P | `docs/architecture/05-interaction-design/08_Wireframes_and_Interaction_Spec.md` | 3788 | `486497f7d20ef428238a7806279a00271a040a4344b6b70e1652ad7910c7e33c` |
| P | `docs/architecture/05-interaction-design/navigation.md` | 4420 | `ae0dbc93a57edf592f3a3db3b5da3df9360ff5362925779eddd58fdd47b79458` |
| P | `docs/architecture/05-interaction-design/screen-state-matrix.md` | 3783 | `72af9835cb43d645945c23760afc4e6a083022cdb09c930ee2d94bff8900254c` |
| P | `docs/architecture/05-interaction-design/sequences.md` | 4508 | `9b7f25dc209449db7e382357faa3d4d843f0d73c2a675f4c9d8afa6df97e01d6` |
| P | `docs/architecture/06-data-model/data-flows.md` | 6460 | `e1261e9f5adcf930047a0f934b23f4947521070d905c0d210554d4170d9375a9` |
| P | `docs/architecture/06-data-model/entities-and-migrations.md` | 4917 | `fb50ddeb0e87887b09bf31bad9033b49dc4bbc8fa0841353e11028809533d419` |
| P | `docs/architecture/07-api/authentication.md` | 5127 | `d7ae65b03da1995e6760e49799acc4605d3edb94be3f8308f06265a5782da751` |
| P | `docs/architecture/07-api/endpoints.md` | 14683 | `97088b666292091c798aaace6dd034cbfd1694be6f508c3724b187ed9c5a10a5` |
| P | `docs/architecture/08-architecture/ADR-001-modular-monolith.md` | 3092 | `64f1387d067b2232f62fbf89406eebd15656d5edc670569e211d87ffb4bf5717` |
| P | `docs/architecture/08-architecture/ADR-002-storage-orm.md` | 3119 | `a93dd4f0e63730ecbc8664e06203ae310b62c118d515b667b69c7909d9df88e1` |
| P | `docs/architecture/08-architecture/ADR-003-authentication.md` | 2373 | `85ccd2c430037274f0f557fa285923ddaf6caa1e591956ac0029b8f4ac3e02e3` |
| P | `docs/architecture/08-architecture/ADR-004-ocr-boundary.md` | 3825 | `dab404bf565a651a2ec8e5304e8abdb787c2798488a1d741b852c45f39f77c54` |
| P | `docs/architecture/08-architecture/ADR-005-observability.md` | 2391 | `d48874c329e3140778784aa82ae82f643505fec1c695475403cf154a9de157d0` |
| P | `docs/architecture/08-architecture/ADR-006-hybrid-architecture.md` | 6875 | `e66dc3136dae4e5d36c968c27dd187318a0908151f73382fc22f6ba794ca4fee` |
| P | `docs/architecture/08-architecture/Expiry_System_Definition.md` | 8933 | `eadc826b8f6ee7ff4e8237d409f741c20d036f5713f47766532374439815bae0` |
| P | `docs/architecture/08-architecture/components.md` | 8205 | `caac69808bae44c958d0cefed87e97d3fc1bc1b6d2f8983c70cdf3cea0f7a388` |
| P | `docs/architecture/08-architecture/deployment.md` | 6170 | `8c5f1e0bac888a71388ed4659016add8463c7e0992eb1068e80f568755fc2fbc` |
| P | `docs/architecture/08-architecture/analytics-monitoring.md` | 3857 | `39ea04ebd14c290294589c3da83ed07b907b71aacbe911ae3e573a235c230ae3` |
| P | `docs/architecture/09-advanced-web/state-and-integration.md` | 4250 | `54986aa36782a210316bd93010b72d339d50c897cf855244489e334b1117d758` |
| P | `docs/architecture/09-advanced-web/extension-process.md` | 2638 | `1cb1c9e169715a3fbca56056b136f7c12b66c49e07dacd08f196731b80035d18` |
| P | `docs/architecture/10-testing/coverage.md` | 3580 | `e185b11d290266ab35807a4d5198fc53644b2d3f3394362d44f101f963c6bd0d` |
| P | `docs/architecture/10-testing/test-catalog.md` | 6131 | `3169983021ea30f3c1936193eedbff82f21ddcc24af23d595e634625043240d9` |
| P | `docs/architecture/10-testing/verification-report.md` | 4301 | `add46df7e57724686900c93cd6951d2d05e68ec3820dc94971e1fe0944b02421` |
| P | `docs/architecture/11-traceability/09_Traceability_Implementation_and_Verification.md` | 7721 | `9e22390e66c84ab531aeda0bcae61debba1127ae542d62ebc7ce4bc3d26d73c3` |
| P | `docs/architecture/11-traceability/id-register.md` | 23410 | `c0f6644dc4c62b7ad5184ab5cd0962f2b50f6939a61e3f9f3795848ab0ad1706` |
| P | `docs/architecture/11-traceability/README.md` | 1440 | `c2851b7340e80661dc63fabd9d7112c16f5b2426e32e7b2bd722d3fbe1f57c1a` |
| G | `docs/architecture/11-traceability/registry.json` | 98855 | `86971c8ee43458f6352ac874bf7f033bfb8cc29a2a3c99fc2438104e0fc663b2` |
| H | `docs/architecture/consolidated/Expiry_Complete_System_Design_2026-10-08.md` | 94254 | `41ed329ffc54c4947affb5363fff318c247dd4b2ab81bf1e52a41f4db8035e4a` |
| H | `docs/architecture/consolidated/google-doc-final-check-2026-10-10.md` | 94357 | `feb87332d4b017e4058c8212662a97405632d8907f344982b633fff27f5a27a2` |
| H | `docs/architecture/consolidated/google-doc-system-design.txt` | 102145 | `76db9d48aeff69b96d14aa8756eda74afc71433a32a5972cee1abe2559d68506` |
| C | `apps/web/src/App.tsx` | 12196 | `ebfdb8a88af6465948e11ea81843797b16493c721f897c0cb5271f01ed683e0f` |
| C | `apps/web/src/main.tsx` | 324 | `c3aeaa5d667edb9d0cb419bb24920a465f7fd8a9899a9d714484573c48781905` |
| C | `apps/web/src/features/StatusDialog.tsx` | 4870 | `eca473f8e00214512f4edfa47ba6bb475ed6eb628c52e1d46896675641ede968` |
| C | `apps/web/package.json` | 580 | `40ea746334cb448627f85beeb6bac789aac902f7a5e5a186f751f05005b71212` |
| C | `apps/api/src/modules/inventory/inventory.service.mjs` | 2509 | `fb0a6988ed65a7d2e02025eb0cb8d6af75a728199e70d949fd3810f73f9c5493` |
| C | `apps/api/src/modules/expiry/expiry.service.mjs` | 1000 | `47517706813b82b79d02cf720755ec7d17d3b333caa98e994083dfc6aea7899b` |
| C | `apps/api/src/shared/repository.mjs` | 12457 | `e02f6f2d9df0fb8f73bd536a116f1e9b7a3d8362bfe7768678bd9639b698d07b` |
| C | `database/mysql/src/repository.mjs` | 12457 | `e02f6f2d9df0fb8f73bd536a116f1e9b7a3d8362bfe7768678bd9639b698d07b` |
| C | `apps/api/src/modules/scan/scan.service.mjs` | 1610 | `642c0ff70f7a4b4206bdafe824d4333f456a8a5378d2f75e91b6dd7ecd401122` |
| C | `apps/api/src/modules/scan/scan.controller.mjs` | 659 | `46ef2625391b10ce521ba3e9211fa388910f6f8eb5a6c191f08a23fc333ca052` |
| C | `services/python-scan/app/routes/scan.py` | 2258 | `5dfe51899e1a8af4e4243a533990a90f9898e127fa8f684958ad8a8f31663f52` |

Manifest entries: 73. Snapshot date: 2026-10-11 (Asia/Ho_Chi_Minh user context).
