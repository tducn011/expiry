# DOC-PROTOCOL — Write protocol, compatibility and module interfaces

- Document ID: `DOC-PROTOCOL`
- Status: **Review**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

Resolve demo/contract differences explicitly before parallel integration.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

Request ID/body-size/content-type → authentication khi private → schema validation → controller DTO → service object ownership + business rule → scoped repo/transaction → DB constraints → response/error mapper.
Auth thiếu/invalid→401. Ownership phải kiểm tra **cho từng object operation**; không chỉ middleware thấy logged in rồi cho GET/PATCH mọi ID. GET history vẫn check entry owner, kể cả deleted.

- page ≥1 default 1; limit 1…100 default 20. Stable offset pagination với total/page/limit. Concurrent modifications có thể dịch trang; MVP không snapshot pagination.
- q là case-insensitive substring name, max200; location exact normalized value max100; parameterized SQL.
- view inventory (default) hoặc attention. Inventory mặc định lifecycle active; có thể chọn depleted/all. Attention bắt buộc active/nondeleted.
- attention optional unknown/past_date/due_today/soon/later; trong view attention, không cho lifecycle depleted/all. Invalid combination→422.
- Sort fixed RULE-20; tổng classification/filter được áp dụng **trước** limit/offset. Không cho arbitrary SQL sort column từ client.
- Trash sort deleted_at DESC,id; history recorded_at DESC,id.

- All writes có `Idempotency-Key` 8…100 chars `[A-Za-z0-9_-]`. Key mới cho command mới. FE giữ nguyên key/body khi timeout retry.
- Update/actions/delete/restore/preferences có expected_version ≥1. Create không có version input.
- Same key trong owner, cùng operation/target/payload → replay original status/body, `Idempotency-Replayed: true`. Không hash include volatile timestamp/request_id.
- Same key với payload/target khác →409 `IDEMPOTENCY_KEY_REUSED`.
- Replay lookup trước object version/delete checks; retry lệnh đã xóa vẫn trả original204.
- New command stale version →409 `VERSION_CONFLICT`; thiếu lượng →409 `INSUFFICIENT_QUANTITY`; deleted normal operations →404.
- Nếu response lost mà user đổi payload trước retry, đó là command mới; refetch current state trước.
- Delete dùng expected_version query để tránh body DELETE interoperability; controller validate query, không blind delete.

Create fields theo S3.19. Không nhận id/user_id/status/remaining_quantity/version/deleted_at. PATCH allowlist name/location/expiry_date/date_certainty/date_source/date_label_type/opened_on/note + expected_version; ít nhất một editable field. Validate merged object để không tạo date state nửa cập nhật.

Movement input ví dụ:
```json
{"kind":"consume","amount":"1.000","expected_version":1,"reason":null}
```
Mutation output: `{entry: EntryResponse, movement: MovementResponse|null, changed: boolean}`. Recount same amount returns200 changed=false, movement=null. Consume/discard luôn changed=true.

| HTTP | Meaning/code |
|---|---|
| 400 | MALFORMED_JSON |
| 401 | AUTH_REQUIRED |
| 404 | ENTRY_NOT_FOUND (bao gồm foreign-owned) |
| 409 | VERSION_CONFLICT / INSUFFICIENT_QUANTITY / ENTRY_NOT_DELETED / ENTRY_ALREADY_DELETED / IDEMPOTENCY_KEY_REUSED |
| 413 | BODY_TOO_LARGE |
| 415 | UNSUPPORTED_CONTENT_TYPE |
| 422 | VALIDATION_ERROR, query combination/schema/domain field invalid |
| 429 | RATE_LIMITED |
| 500 | INTERNAL_ERROR, no SQL/stack/secret |

`application/problem+json` RFC9457: type/title/status/detail/instance optional; project extensions code/request_id/errors. FE branch theo code, không parse human title.

```text
executeMutation(principal, operation, key, normalizedCommand):
  validate identity + command schema
  begin transaction
  INSERT api_requests(owner,key,operation,hash) ON CONFLICT DO NOTHING
  if not inserted:
    read existing completed row (concurrent insert waits until commit/rollback)
    compare operation + hash; mismatch => conflict
    replay saved status/body; end transaction
  lock target row scoped to owner (FOR UPDATE)
  check exists/current version/domain invariants
  apply domain mutation; append movement if quantity changed
  store result in reserved api_requests row
  commit
  return saved result
```
A reserved null-response row must not commit as success. Error rollback removes reservation; DB outage before commit means retry-safe. Response snapshot có thể cũ hơn latest state, nên FE refetch sau replay. Không gọi external network trong transaction MVP.

### Observed prototype compatibility gaps [A]

| Contract/DB | Mock representation | Integration decision required |
|---|---|---|
| date_certainty known | expiry_date_certainty exact | Use shared DTO; mapping exact→known only means reported source, not safety |
| date_source printed_label/user_entered/unknown | package_label/user_reentered/null | Explicit normalization at API adapter |
| date_label_type unspecified | unknown/null | Preserve label semantics; missing must map explicitly |
| stock_movements.kind adjustment | quantity_movements.kind recount | Command name recount may persist adjustment |
| decimal strings / UUID | number / demo IDs | Generate fixture DTOs; no precision-losing casts |
| restore expected_version | restoreEntry(key,id) | Add reviewed version contract before real adapter |
| 409 IDEMPOTENCY_KEY_REUSED | 422 IDEMPOTENCY_PAYLOAD_MISMATCH | Branch by canonical problem code |
| owner-local injected today | fixed TODAY 2026-10-08 | Policy parity tests; timezone setting must affect output |
| real transaction + canonical request hash | in-memory execute + JSON.stringify | Mocks do not prove DB atomicity/concurrency |

Module ports [D]: CreateEntry/ReviewInventory/EditEntry/RecordMovement/RecountEntry/ReadHistory/RemoveEntry/RestoreEntry/ReadPreferences/EditPreferences execute a verified principal plus validated command/query. Repositories expose findOwned, lockOwned, saveWithinTransaction and appendMovement; TransactionPort passes one connection/context; MutationExecutor owns reserve/replay; Clock returns an instant interpreted by policy. Generated FE DTOs should follow OpenAPI, not private DB classes.

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [14-system-architecture/components.md](../08-architecture/components.md)
- [06-data-model/dictionary.md](../06-data-model/dictionary.md)
- [adr/ADR-003-authentication.md](../adr/ADR-003-authentication.md)

## Open questions

Chốt các quyết định liên quan trong decision ledger trước khi đổi contract hoặc triển khai.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](../11-traceability/README.md)
- [08-architecture/components.md](../08-architecture/components.md)
- [06-data-model/dictionary.md](../06-data-model/dictionary.md)
- [adr/ADR-003-authentication.md](../adr/ADR-003-authentication.md)

## Verification criteria

Đối chiếu nguồn, ID và downstream links; acceptance runtime chỉ được ghi pass sau khi thực chạy.
