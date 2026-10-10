# DOC-DICTIONARY — Canonical domain field dictionary

- Document ID: `DOC-DICTIONARY`
- Status: **Review**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

Type, semantics, source, owner, null/default, privacy and lifecycle before schema.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

| Table.field | API type | SQL type [D] | Null/default | Semantics/validation | Source/owner |
|---|---|---|---|---|---|
| users.id | UUID string | uuid PK | Required | Internal stable owner | Identity bootstrap |
| users.identity_subject | Không trả vào business DTO | text UNIQUE | Required | Provider + subject namespace, không email mutable làm ID | Auth adapter |
| users.display_name | string | text | Required | 1…100 trimmed | Profile |
| users.timezone | string | text | Asia/Ho_Chi_Minh | IANA timezone hợp lệ qua runtime timezone library | UC-11 |
| users.attention_lead_days | integer | integer | 2 | 0…30; config thử nghiệm | UC-11 |
| users.version | integer | integer | 1 | Optimistic version ≥1 | Service |
| users.created_at/updated_at | date-time string | timestamptz | server now | Instant UTC output ISO8601 | Persistence |
| food_entries.id | UUID string | uuid PK | Required | Not product ID | Server |
| food_entries.user_id | Không nhận ở input | uuid FK | Required | From verified principal | Service |
| food_entries.name | string | varchar(200) | Required | Trimmed 1…200; không UNIQUE | User |
| food_entries.storage_location | string | varchar(100) | Required default unspecified | Value free text trimmed 1…100; không table location chưa có CRUD requirement | User |
| food_entries.remaining_quantity | decimal string | numeric(12,3) | Required | 0…999999999.999; piece whole; operational source of truth | Quantity services |
| food_entries.unit | enum string | varchar(10) | Required | piece/g/ml; fixed after create | User/create |
| food_entries.expiry_date | YYYY-MM-DD hoặc null | date | null | Calendar date; no timezone/UTC conversion; past date allowed | User |
| food_entries.date_certainty | enum | varchar(12) | unknown | known/estimated/unknown; known=reported source known, không safe guarantee | User |
| food_entries.date_source | enum | varchar(20) | unknown | printed_label/user_entered/user_estimate/unknown | User |
| food_entries.date_label_type | enum | varchar(15) | unspecified | use_by/best_before/unspecified; độc lập certainty | User label |
| food_entries.opened_on | YYYY-MM-DD/null | date | null | Đã mở khi nào, applies entire entry; không tự derive shelf-life | User |
| food_entries.note | string/null | text | null | Max 1000; plain text | User |
| food_entries.version | integer | integer | 1 | Increment once per real mutation | Service |
| food_entries.deleted_at | date-time/null | timestamptz | null | Record visibility; không spoil/discard | Delete/restore |
| food_entries.created_at/updated_at | date-time | timestamptz | server now | Audit instant | Persistence |
| stock_movements.id | UUID | uuid PK | Required | Stable event identity | Service |
| stock_movements.entry_id | UUID | uuid FK | Required | Entry immutable owner relation | Service |
| stock_movements.kind | enum | varchar(12) | Required | initial/consume/discard/adjustment | Command |
| stock_movements.quantity_before/after | decimal string | numeric(12,3) | Required | Nonnegative; delta derived after-before | Locked entry + command |
| stock_movements.reason | string/null | text | null | Required nonblank for adjustment, max 500 | User correction |
| stock_movements.recorded_at | date-time | timestamptz | server now | Thời điểm app ghi nhận; không tự nhận là time physical use happened | Persistence |
| api_requests.user_id | Internal | uuid FK/PK part | Required | Dedup scope | Principal |
| api_requests.idempotency_key | Header string | varchar(100) PK part | Required | 8…100 allowed chars; new key/new command | FE command coordinator |
| api_requests.operation | Internal string | text | Required | HTTP operation + normalized target, không chỉ method | Service executor |
| api_requests.request_hash | Internal string | text | Required | Canonical command payload fingerprint; validate same key+same input | Service executor |
| api_requests.response_status/body | Internal | int/jsonb | null while reserved, both nonnull completed | Original command result; owner privacy/retention applies | Tx executor |
| api_requests.created_at | Internal instant | timestamptz | server now | Key lifetime; MVP không automatic prune | Persistence |

Lượng dùng decimal string để tránh floating point/truncation giữa DB/JSON/JS. Unit piece cần số nguyên; `"1.500"` là invalid piece, valid g/ml. FE dùng decimal lib hoặc parse integer milliunits, không `parseFloat` rồi cộng/trừ nghiệp vụ.

### Privacy/lifecycle/flow annotations

| Field | Source/owner | Privacy classification [D] | Lifecycle | Related flow |
|---|---|---|---|---|
| users.id | Identity bootstrap | Private account/inventory metadata | Service-assigned immutable identity/audit | UF-10/11 |
| users.identity_subject | Auth adapter | Sensitive/internal identity | Validated service-owned update/command state | UF-10/11 |
| users.display_name | Profile | Private account/inventory metadata | Validated service-owned update/command state | UF-10/11 |
| users.timezone | UC-11 | Private account/inventory metadata | Validated service-owned update/command state | UF-10/11 |
| users.attention_lead_days | UC-11 | Private account/inventory metadata | Derived at read, not stored | UF-10/11 |
| users.version | Service | Private account/inventory metadata | Validated service-owned update/command state | UF-10/11 |
| users.created_at | Persistence | Private account/inventory metadata | Service-assigned immutable identity/audit | UF-10/11 |
| users.updated_at | Persistence | Private account/inventory metadata | Validated service-owned update/command state | UF-10/11 |
| food_entries.id | Server | Private account/inventory metadata | Service-assigned immutable identity/audit | UF-01…10 |
| food_entries.user_id | Service | Private account/inventory metadata | Service-assigned immutable identity/audit | UF-01…10 |
| food_entries.name | User | Private user content | Validated service-owned update/command state | UF-01…10 |
| food_entries.storage_location | User | Private user content | Validated service-owned update/command state | UF-01…10 |
| food_entries.remaining_quantity | Quantity services | Private account/inventory metadata | Validated service-owned update/command state | UF-01…10 |
| food_entries.unit | User/create | Private account/inventory metadata | Validated service-owned update/command state | UF-01…10 |
| food_entries.expiry_date | User | Private account/inventory metadata | Validated service-owned update/command state | UF-01…10 |
| food_entries.date_certainty | User | Private account/inventory metadata | Validated service-owned update/command state | UF-01…10 |
| food_entries.date_source | User | Private account/inventory metadata | Validated service-owned update/command state | UF-01…10 |
| food_entries.date_label_type | User label | Private account/inventory metadata | Validated service-owned update/command state | UF-01…10 |
| food_entries.opened_on | User | Private account/inventory metadata | Validated service-owned update/command state | UF-01…10 |
| food_entries.note | User | Private user content | Validated service-owned update/command state | UF-01…10 |
| food_entries.version | Service | Private account/inventory metadata | Validated service-owned update/command state | UF-01…10 |
| food_entries.deleted_at | Delete/restore | Private account/inventory metadata | Validated service-owned update/command state | UF-01…10 |
| food_entries.created_at | Persistence | Private account/inventory metadata | Service-assigned immutable identity/audit | UF-01…10 |
| food_entries.updated_at | Persistence | Private account/inventory metadata | Validated service-owned update/command state | UF-01…10 |
| stock_movements.id | Service | Private account/inventory metadata | Service-assigned immutable identity/audit | UF-01/05/06/07 + history |
| stock_movements.entry_id | Service | Private account/inventory metadata | Service-assigned immutable identity/audit | UF-01/05/06/07 + history |
| stock_movements.kind | Command | Private account/inventory metadata | Validated service-owned update/command state | UF-01/05/06/07 + history |
| stock_movements.quantity_before | Locked entry + command | Private account/inventory metadata | Validated service-owned update/command state | UF-01/05/06/07 + history |
| stock_movements.after | Locked entry + command | Private account/inventory metadata | Validated service-owned update/command state | UF-01/05/06/07 + history |
| stock_movements.reason | User correction | Private user content | Validated service-owned update/command state | UF-01/05/06/07 + history |
| stock_movements.recorded_at | Persistence | Private account/inventory metadata | Service-assigned immutable identity/audit | UF-01/05/06/07 + history |
| api_requests.user_id | Principal | Private account/inventory metadata | Service-assigned immutable identity/audit | Every write/retry |
| api_requests.idempotency_key | FE command coordinator | Private account/inventory metadata | Service-assigned immutable identity/audit | Every write/retry |
| api_requests.operation | Service executor | Private account/inventory metadata | Service-assigned immutable identity/audit | Every write/retry |
| api_requests.request_hash | Service executor | Private account/inventory metadata | Service-assigned immutable identity/audit | Every write/retry |
| api_requests.response_status | Tx executor | Private account/inventory metadata | Validated service-owned update/command state | Every write/retry |
| api_requests.body | Tx executor | Private account/inventory metadata | Validated service-owned update/command state | Every write/retry |
| api_requests.created_at | Persistence | Private account/inventory metadata | Service-assigned immutable identity/audit | Every write/retry |

API fields and rules: named snake_case fields in EntryCreate/Entry/Movement/Preferences schemas use this semantics. `users.identity_subject`, `api_requests.*`, server IDs/versions/audit fields are not user-editable business inputs. `EntryCreate.quantity` is an input, persisted as remaining_quantity plus initial movement, not a separate stored field. Rules resolve via canonical RULE-01…24. No cross-domain automatic date inference.

Future OCR distinguishes raw_text → parsed candidates → normalized values → validated confirmed draft → EntryCreate; none of the intermediate fields becomes a DB column by default. Analytics properties are separate allowlisted events, not copies of inventory fields.

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [03-requirements-features/business-rules.md](../03-requirements-features/business-rules.md)
- [12-database-schema/entities-and-migrations.md](../12-database-schema/entities-and-migrations.md)
- [07-api/endpoints.md](../07-api/endpoints.md)
- [19-analytics-observability/analytics-monitoring.md](../19-analytics-observability/analytics-monitoring.md)

## Open questions

Chốt các quyết định liên quan trong decision ledger trước khi đổi contract hoặc triển khai.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](../11-traceability/README.md)
- [03-requirements-features/business-rules.md](../03-requirements-features/business-rules.md)
- [12-database-schema/entities-and-migrations.md](../12-database-schema/entities-and-migrations.md)
- [07-api/endpoints.md](../07-api/endpoints.md)
- [19-analytics-observability/analytics-monitoring.md](../19-analytics-observability/analytics-monitoring.md)

## Verification criteria

Đối chiếu nguồn, ID và downstream links; acceptance runtime chỉ được ghi pass sau khi thực chạy.
