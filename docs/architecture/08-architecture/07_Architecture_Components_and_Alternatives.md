# [S6] Alternatives, [S7] recommendation và ownership FE/BE

## S6.1 Alternatives có lý do
| Option | Giải quyết gì | Benefits | Trade-off/complexity/performance/maintainability | Khi dùng/không dùng |
|---|---|---|---|---|
| Layered modular monolith | Team 5 người cần ranh giới và tx đơn giản | Một deploy, atomic writes, features tự claim | Phải enforce module boundaries; chưa có throughput evidence cần split | Recommended cho MVP; không tự tạo microservices |
| Global MVC folders routes/controllers/models | Dễ khởi đầu môn Web | Low setup | Logic dễ dồn controller/model; change1 feature đụng nhiều global folders; maintainability giảm | App rất nhỏ hoặc dùng convention khóa bởi môn; vẫn thêm service boundary |
| Microservices | Scale/team/deploy độc lập | Independent deployment | Network failures, distributed consistency, auth/observability/ops cost; chưa có bottleneck chứng minh | Chưa dùng trong scope này |
| Entry snapshot + movement ledger | Quantity chính xác + audit | Fast read, tx đơn giản, correction traceable | Dup quantity state đòi atomic invariant; low–medium complexity | Recommended cho current scope |
| Event sourcing | Rebuild state từ events làm authority | Full replay/history model | Event schema version/rebuild/order phức tạp, reads projection lag; không cần ở đây | Audit/domain replay sâu sau này; chưa MVP |
| Entry only, no history | CRUD tối giản | Ít tables | Không giải thích corrections, retry và waste/use mix khó audit | Prototype bỏ history có thể; không đáp ứng UC-08/P3 hiện tại |
| Personal inventory | Scope nhỏ, owner đơn | Simple authorization | Không giải quyết đầy đủ household coordination P2 | User confirmed MVP |
| Shared households | Multi-actor coordination | Data cùng kho | Membership/roles/invite/last actor/concurrency mới | Khi user scope-in và field study cần |

## S6.2 Stack chưa chốt
| Candidate | Fit | Trade-off |
|---|---|---|
| React + Express + PostgreSQL | Khớp học React/MVC/relational tx; explicit layers dễ học | Express phải tự giữ convention/schema/error/DI; vận hành PostgreSQL |
| React + NestJS + PostgreSQL | Modules/DI/guards rõ nếu team quen | Decorators/framework learning thêm; chưa có evidence team cần |
| React + Express + MySQL/InnoDB | Relational+transactions khả thi khi môn/team có kinh nghiệm | SQL/index differences; DDL tham chiếu cần port |

Recommended approach [D]: **modular monolith theo feature + use-case service + repository**, independent domain rules/DTO. React/Express/PostgreSQL là reference stack, không gọi chốt. Why: quantity/history/keys cần cùng tx; group chia task theo feature/contract; ba môn dùng cùng traceability. Do not: central controller chứa mọi rule, microservices vì “chuẩn”, một repository generic bypass owner scope, hoặc route theo từng table.

## S3.29 Repo structure đề xuất (monorepo nếu cùng workspace)
```text
apps/web/src/app/              router, providers, auth wiring
apps/web/src/features/inventory/
  pages/                      InventoryPage, EntryDetailPage, TrashPage
  components/                 EntryCard, AttentionBadge, Filters, EntryForm, ActionSheet, HistoryList
  hooks/                      query/mutation orchestration, draft continuation
  api/                        typed inventory client
apps/web/src/features/preferences/
packages/contracts/           OpenAPI, generated DTOs/fixtures; không DB model
apps/api/src/modules/inventory/
  http/                       routes, controllers, request schemas, presenters
  application/                CreateEntry, RecordMovement, Recount, Edit, Remove, Restore, queries
  domain/                     quantity validation, metadata/date rules, AttentionPolicy
  ports/                      EntryRepository, MovementRepository, MutationStore, UnitOfWork
  infrastructure/             SQL repository implementation
apps/api/src/modules/accounts/ identity mapping + preferences
apps/api/src/shared/           error types, clock interface, request context
apps/api/src/bootstrap/        dependency wiring, server startup
apps/api/db/migrations/        versioned schema changes
```
Monorepo = chứa FE/BE/contracts trong một repo; alternative hai repos thì shared contract publish/version riêng. Không copy business rule vào FE và BE như hai nguồn canonical.

## S3.30 FE components có giống BE modules không?
**Cùng vocabulary nghiệp vụ để trace; không cùng cấu trúc 1:1.** Một detail page gọi GET Entry, POST Movement, GET History. Một service chạy qua nhiều repos. Một table có thể phục vụ nhiều screens.

| FE part | Owns | API | Không sở hữu |
|---|---|---|---|
| AppRouter/Providers | Navigation, auth/query provider lifecycle | auth adapter | Inventory truth hoặc expiry rule |
| InventoryPage | Query filters URL, selected tab, render list | API-02 | Mutate qty local như authority |
| EntryCard/AttentionBadge | Display props, click callbacks | Không fetch riêng mỗi badge | Business classification |
| EntryForm | Draft, field UX validation, submit intent | API-01/04 qua feature hook | SQL, owner ID, final date rule |
| EntryDetailPage | Selected resource/query orchestration | API-03/07 | All app global state |
| ActionSheet | Chosen kind/amount/reason; pending/cancel | API-05/06 via mutation hook | Adjust database without command |
| useEntryMutation | Key+payload stable through retry; success invalidation; error mapping | API-04…10 | Domain authority/automatic retry modified command |
| HistoryList/TrashPage | Read-only rows/restore intent | API-07/09/10 | Rewrite movements |
| PreferencesForm | Local settings draft | API-11/12 | User clock/timezone recompute food locally as canonical |

UI state ở common parent gần nhất khi nhiều child cần cùng state (React DOC-05). Server state cache theo owner+query key; clear/invalidate khi identity đổi. Không put hết vào global Context rồi gọi đó là single source of truth.

## S3.31 Backend responsibilities
| Layer | Owns | Dependency direction | Không làm |
|---|---|---|---|
| Route | method/path/middleware/handler | →controller | SQL/lifecycle |
| Middleware | identity, limits, JSON schema | →request context | Consume quantity rules |
| Controller | HTTP↔DTO/error status | →application service | Direct DB updates |
| Application/use-case service | owner authorization, tx orchestration | →domain policies + ports | HTTP parsing hoặc external network trong qty tx |
| Domain | pure quantity/date/attention invariants | no HTTP/DB dependency | SQL/runtime framework decorators |
| Repository adapter | scoped parameterized SQL, row locking | implements domain/application ports | HTTP status hoặc UX copy |
| UnitOfWork adapter | begin/commit/rollback, same DB connection | infrastructure | Chọn consume vs discard |
| DB | durable rows, constraints, locking | persistence | UX goal/food safe inference |
| Composition root | Inject adapters/services/clock/auth | wiring only | Control all user task logic |

Ports/interfaces không bắt buộc overengineer một file cho từng hàm. Đặt khi giúp test/persistence boundary; plain functions đủ cho pure policies. “Repo architecture” gồm cả cấu trúc source repo và repository data-access boundary; hai khái niệm khác nhau.

## S3.32 What controls a task?
UF-05 bắt đầu ở ActionSheet, feature mutation hook điều phối HTTP, RecordMovement service điều phối business tx. FoodEntryRepository khóa/update đúng row, MovementRepository append, UnitOfWork giữ connection. Composition root nối dependencies. Mỗi phần control phạm vi của mình; không một god object control mọi thứ.
