# DOC-P-COMPARE — Persona comparison

- Document ID: `DOC-P-COMPARE`
- Status: **Review**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

So sánh cơ chế thay vì biến persona thành RBAC roles.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

| Persona | Behavior mechanism | Goal | Risk of overinterpretation |
|---|---|---|---|
| P1 — Phạm Hoàng An | Visibility / occasional attention loss | Keep items visible without daily admin | Do not call P1 unorganized |
| P2 — Tôn Nữ Như Huyền | Changed plans / next-action gap | Choose a next action when plans change | Married does not require shared inventory |
| P3 — Phạm Ngọc Thiên An | Maintenance burden / digital-physical drift | Keep amount accurate with less repeated work | Tech skills do not justify an independent Python service |

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [01-personas/P01-persona.md](P01-persona.md)
- [01-personas/P02-persona.md](P02-persona.md)
- [01-personas/P03-persona.md](P03-persona.md)

## Open questions

Chốt các quyết định liên quan trong decision ledger trước khi đổi contract hoặc triển khai.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](../11-traceability/README.md)
- [01-personas/P01-persona.md](P01-persona.md)
- [01-personas/P02-persona.md](P02-persona.md)
- [01-personas/P03-persona.md](P03-persona.md)

## Verification criteria

Đối chiếu nguồn, ID và downstream links; acceptance runtime chỉ được ghi pass sau khi thực chạy.
