# DOC-SCREEN-STATES — Screen and recovery state matrix

- Document ID: `DOC-SCREEN-STATES`
- Status: **Review**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

Inventory UI states are behavior contracts, not visual acceptance evidence.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

- EntryCard hiển thị amount/unit và reason bằng text, không chỉ màu. Unknown date có copy “Chưa có ngày theo dõi” và edit action.
- Không dùng “Fresh/Safe” cho later. Past date copy phân biệt recorded date đã qua; detail có meaning label/certainty.
- Buttons Use/Discard disabled khi depleted/deleted; API vẫn enforce independent. Recount cho phép reopen depleted bằng actual amount thực tế.
- ActionSheet amount mặc định **không tự submit hết**. User chọn số lượng; có explicit “Dùng hết/Bỏ hết” prefill cần confirm để tránh trừ nhầm.
- Remove record dialog: “Xóa bản ghi này khỏi danh sách? Số lượng thực phẩm không được ghi là đã dùng/bỏ.” Đây là meaningful distinction user cần biết.
- 401: preserve draft trước auth. Không show dữ liệu thật trong public demo. Refresh identity cache trước private query.
- 409: refetch current entry và hiện current amount/version với draft để user quyết định; không auto-submit amount cũ như command mới.
- Timeout: trạng thái kết quả chưa rõ, retry cùng key+payload; khi server replay snapshot, refetch latest.
- Mobile touch targets và labels cần accessibility review, low-tech P2 phải đọc được amount/date/action không cần biết API jargon.
- Desktop: inventory list bên trái/detail bên phải là candidate, chưa high-fidelity; cùng use cases/API, không tạo nghiệp vụ riêng.

| State | Owner / required feedback | Recovery |
|---|---|---|
| Initial loading | Query controller; announce loading | Render content on confirmed success |
| Empty inventory/filter/trash | Page distinction with text | Add/clear-filter/back |
| 422 | Form draft owner; field-specific errors | Fix fields, new command if payload changes |
| 401 | Auth boundary + draft coordinator | Authenticate, verify same owner, refetch and continue |
| 404 | Feature query boundary; neutral missing record | Return list; do not reveal other owner |
| 409 | Mutation coordinator; retain draft/current snapshot | Refetch, compare, confirm new command |
| Timeout | Command coordinator key + immutable payload | Replay/check same command; refetch |
| 429/read failure | Request/recovery state | Bounded explicit retry; no infinite loops |
| Success/no-op | Confirmed API result | Invalidate affected cache; changed=false leaves event count unchanged |

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [06-navigation/navigation.md](navigation.md)
- [10-testing/test-catalog.md](../10-testing/test-catalog.md)

## Open questions

Chốt các quyết định liên quan trong decision ledger trước khi đổi contract hoặc triển khai.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](../11-traceability/README.md)
- [06-navigation/navigation.md](navigation.md)
- [10-testing/test-catalog.md](../10-testing/test-catalog.md)

## Verification criteria

Đối chiếu nguồn, ID và downstream links; acceptance runtime chỉ được ghi pass sau khi thực chạy.
