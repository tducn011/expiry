# DOC-INDEX-ADR — Architecture Decision Records

- Document ID: `DOC-INDEX-ADR`
- Status: **Review**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

Navigation and scope of artifacts in this directory.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

- [adr/ADR-001-modular-monolith.md](ADR-001-modular-monolith.md)
- [adr/ADR-002-storage-orm.md](ADR-002-storage-orm.md)
- [adr/ADR-003-authentication.md](ADR-003-authentication.md)
- [adr/ADR-004-ocr-boundary.md](ADR-004-ocr-boundary.md)
- [adr/ADR-005-observability.md](ADR-005-observability.md)

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [00-context/source-register.md](../00-context/source-register.md)
- [11-traceability/gates.md](../11-traceability/gates.md)

## Open questions

Chốt các quyết định liên quan trong decision ledger trước khi đổi contract hoặc triển khai.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](../11-traceability/README.md)
- [00-context/source-register.md](../00-context/source-register.md)
- [11-traceability/gates.md](../11-traceability/gates.md)

## Verification criteria

Đối chiếu nguồn, ID và downstream links; acceptance runtime chỉ được ghi pass sau khi thực chạy.
