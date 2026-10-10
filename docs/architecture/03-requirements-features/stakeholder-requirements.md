# DOC-ST — Stakeholder and user requirements

- Document ID: `DOC-ST`
- Status: **Review**
- Updated: 2026-10-10

## Purpose

Tạo draft nhu cầu có provenance; không xem persona là stakeholder validation.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)
- [Current FINAL CHECK persona crosswalk](final-check-persona-alignment.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

### Nhóm stakeholder và persona

Người dùng cá nhân hoặc người phụ trách thực phẩm trong hộ gia đình là nhóm người dùng trực tiếp. P1/P2/P3 mô tả ba cơ chế hành vi trong nhóm này; các thao tác xem kho, sử dụng, cập nhật và nhận nhắc không phải các nhóm người hay các loại tài khoản khác nhau.

Nhóm quản lý và đánh giá dự án cần truy vết nhu cầu, phạm vi, tiêu chí kiểm tra và kết quả đánh giá. Nhóm phát triển và vận hành cần hợp đồng, quy tắc, bảo vệ dữ liệu và đường khôi phục rõ ràng. Hai nhóm hỗ trợ này rộng hơn persona người dùng và không tự yêu cầu màn hình quản trị mới.

| ID | Nhóm sở hữu nhu cầu | Persona / căn cứ | Need | Draft requirement [C/D] | Downstream |
|---|---|---|---|---|---|
| ST-V1-01 | Người dùng trực tiếp | P1; P2 cần xem lại thực phẩm trước khi quyết định | NEED-01 | See food records and remaining quantities without relying on memory | FR-01, FR-02, FR-03 |
| ST-V1-02 | Người dùng trực tiếp | P2: kế hoạch đổi; cảnh báo ngày chưa cho biết bước tiếp theo | NEED-02 | Understand attention reason and choose an appropriate next action | FR-03, FR-04, FR-05 |
| ST-V1-03 | Người dùng trực tiếp | P3; công cập nhật cũng ảnh hưởng P1/P2 | NEED-03 | Record use/discard/corrections and recover errors with visible history | FR-04, FR-06, FR-07, FR-08 |
| ST-V1-04 | Người dùng trực tiếp; nhóm phát triển/vận hành hỗ trợ | Quyền riêng tư và khôi phục là yêu cầu hệ thống; không chỉ suy từ persona | NEED-03 | Keep private records isolated and recover drafts during session loss | FR-10, NFR-01, NFR-04 |
| ST-V1-05 | Nhóm phát triển và vận hành | [D] Trách nhiệm hỗ trợ độ tin cậy của hệ thống | NEED-03 | Integrate stable contracts and preserve data on deploy/recovery | NFR-02, NFR-03, NFR-07 |

User goals from P1/P2/P3 are NEED-01…03. Product reviewer coordinates scope, HCI reviewer verifies interactions, developers integrate contracts, operator handles durability. These are responsibilities, not new application administrator roles. No admin dashboard/use case is scope-approved. Every ST-V1 entry is Draft-to-Review, needs rationale/participant or reviewer approval before baseline.

Nhu cầu công sức hợp lý được đáp ứng trong đường nhập/xem/cập nhật từng sản phẩm; nó không phụ thuộc việc phê duyệt OCR hoặc thao tác hàng loạt. Với P2, lý do ưu tiên và hành động rõ ràng là giả thuyết hỗ trợ quyết định cần thử trong tình huống kế hoạch bữa ăn thay đổi; chưa chứng minh đã giải quyết mọi trở ngại nấu ăn.

Các mã ST-V1-* ở đây là phương án food giữ nguyên nghĩa. FINAL CHECK dùng ST-01…03 cho nhóm stakeholder và SYS-SR-01…07 cho yêu cầu của nhóm; xem [bản đối chiếu](final-check-persona-alignment.md) về quan hệ hỗ trợ, không dùng cùng số để coi hai mã là tương đương.

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [02-challenges/needs-opportunities.md](../02-challenges/needs-opportunities.md)
- [03-requirements-features/system-requirements.md](system-requirements.md)

## Open questions

Chốt các quyết định liên quan trong decision ledger trước khi đổi contract hoặc triển khai.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](../11-traceability/README.md)
- [02-challenges/needs-opportunities.md](../02-challenges/needs-opportunities.md)
- [03-requirements-features/system-requirements.md](system-requirements.md)

## Verification criteria

Đối chiếu nguồn, ID và downstream links; acceptance runtime chỉ được ghi pass sau khi thực chạy.
