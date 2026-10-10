# DOC-BR — Business outcomes

- Document ID: `DOC-BR`
- Status: **Review**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

Giữ outcome khác với capability và empirical KPI.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

| ID | Outcome proposal | Persona | Indicator |
|---|---|---|---|
| BR-V1-01 | Người dùng nhận biết thực phẩm đang có và cần chú ý với công thấp | P1, P2 | Task chọn món; missed/stale records |

| ID | Outcome proposal | Persona | Indicator |
|---|---|---|---|
| BR-V1-02 | Người dùng có đủ context để quyết định bước tiếp khi kế hoạch đổi | P2 | Task decision completion + explanation; không tự claim recipes đã giải quyết |

| ID | Outcome proposal | Persona | Indicator |
|---|---|---|---|
| BR-V1-03 | Tồn kho số phản ánh thay đổi thực tế mà không tạo gánh nặng quản trị lớn | P3, P1 | Update time, amount errors, stale-record rate |

No local baseline validates waste reduction, savings, safety, 40%/100%/80% metrics. Those historical targets remain research/product gates; use task/capture/staleness measurements first.

The BR-V1-* outcomes above retain their food-design meanings. The current FINAL CHECK BR-01…04 respectively target waste reduction, decision support, resource use and sustained management; see the [persona and requirement crosswalk](final-check-persona-alignment.md) for support relationships. This crosswalk does not rename BR-V1 IDs or treat working demo commands as achieved outcomes.

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [02-challenges/needs-opportunities.md](../02-challenges/needs-opportunities.md)
- [10-testing/research-validation.md](../10-testing/research-validation.md)

## Open questions

Chốt các quyết định liên quan trong decision ledger trước khi đổi contract hoặc triển khai.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](../11-traceability/README.md)
- [02-challenges/needs-opportunities.md](../02-challenges/needs-opportunities.md)
- [10-testing/research-validation.md](../10-testing/research-validation.md)

## Verification criteria

Đối chiếu nguồn, ID và downstream links; acceptance runtime chỉ được ghi pass sau khi thực chạy.
