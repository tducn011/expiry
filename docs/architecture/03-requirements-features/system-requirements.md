# DOC-FR — Functional system requirements

- Document ID: `DOC-FR`
- Status: **Review**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

Observable behaviors với acceptance refs và stable IDs.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

| ID | System behavior proposal | Use case / feature | Outcome | Acceptance cases |
|---|---|---|---|---|
| FR-01 | Capture name, amount, unit; date optional và source rõ | UC-01/F-01 | BR-V1-01/03 | VT-01, VT-02, VT-14 |
| FR-02 | List/search/filter kho của owner; stable pagination | UC-02/F-02 | BR-V1-01 | VT-12, TC-18 |
| FR-03 | Attention classification + reason + calculated local date | UC-03/F-02/03 | BR-V1-01/02 | VT-13, TC-19 |
| FR-04 | Ghi consume/discard một phần/toàn bộ, atomic và retry-safe | UC-04/05/F-04 | BR-V1-03 | VT-03, VT-04, VT-05, VT-06, VT-07, VT-10 |
| FR-05 | Sửa metadata có version, không sửa quantity qua generic PATCH | UC-06/F-05 | BR-V1-02/03 | VT-14, VT-15 |
| FR-06 | Recount lượng thực tế, lưu correction history | UC-07/F-05 | BR-V1-03 | VT-08, VT-09 |
| FR-07 | History đọc được của owner | UC-08/F-06 | BR-V1-03 | VT-10, VT-12 |
| FR-08 | Soft delete/trash/restore, tách physical disposal | UC-09/10/F-07 | BR-V1-03 | VT-11 |
| FR-09 | Setting timezone và attention lead, recompute | UC-11/F-08 | BR-V1-01/02 | VT-13, TC-20 |
| FR-10 | Auth continuation giữ draft và gate kho riêng/persist | UC-00/support | CTX-05 | VT-12, VT-15 |

Shall statements are review candidates; details/conditions belong to linked canonical rules and API schema. FR-03 must not equate date proximity to safe consumption. FR-10 transport/auth implementation awaits ADR; gate semantics can be reviewed now.

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [03-requirements-features/business-rules.md](business-rules.md)
- [10-testing/test-catalog.md](../10-testing/test-catalog.md)
- [07-api/endpoints.md](../07-api/endpoints.md)

## Open questions

Chốt các quyết định liên quan trong decision ledger trước khi đổi contract hoặc triển khai.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](../11-traceability/README.md)
- [03-requirements-features/business-rules.md](business-rules.md)
- [10-testing/test-catalog.md](../10-testing/test-catalog.md)
- [07-api/endpoints.md](../07-api/endpoints.md)

## Verification criteria

Đối chiếu nguồn, ID và downstream links; acceptance runtime chỉ được ghi pass sau khi thực chạy.
