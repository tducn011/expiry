# DOC-INDEX-TRACEABILITY — Traceability graph and review gates

- Document ID: `DOC-INDEX-TRACEABILITY`
- Status: **Review**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

Navigation and scope of artifacts in this directory.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

- [11-traceability/tracking.md](tracking.md)
- [11-traceability/../12-process/gates.md](../12-process/gates.md)
- [11-traceability/id-register.md](id-register.md)

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [00-context/source-register.md](../00-context/source-register.md)
- [11-traceability/../12-process/gates.md](../12-process/gates.md)

## Open questions

Chốt các quyết định liên quan trong decision ledger trước khi đổi contract hoặc triển khai.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](README.md)
- [00-context/source-register.md](../00-context/source-register.md)
- [11-traceability/../12-process/gates.md](../12-process/gates.md)

## Verification criteria

Đối chiếu nguồn, ID và downstream links; acceptance runtime chỉ được ghi pass sau khi thực chạy.

## Current schema reconciliation — 2026-10-13 [A]

For the current 17-operation contract, seven-table physical model, input/output defaults, and bounded OCR sample proposal, see [schema input/output](../06-data-model/schema-input-output.md) and the [dated source reconciliation](../10-testing/schema-reconciliation-2026-10-13.md). Existing requirement namespaces and historical source snapshots remain distinct; this note does not mark stakeholder requirements approved.
