# DOC-INDEX-00-CONTEXT-SOURCES — Evidence snapshots

- Document ID: `DOC-INDEX-00-CONTEXT-SOURCES`
- Status: **Review**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

Navigation and scope of artifacts in this directory.

## Evidence sources

- [00-context/source-register.md](../source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

- [00-context/sources/architecture-request.txt](../../12-process/architecture-request.txt)
- [00-context/sources/canva-personas.txt](../../01-personas/canva-personas.txt)
- [00-context/sources/drive-discovery.json](../../tooling/drive-discovery.json)
- [00-context/sources/google-doc-system-design.txt](../../consolidated/google-doc-system-design.txt)
- [00-context/sources/google-doc-system-engineering.txt](../../consolidated/google-doc-system-engineering.txt)
- [FINAL CHECK native readback — 2026-10-10](../../consolidated/google-doc-final-check-2026-10-10.md)
- [00-context/sources/local-source-hashes.json](../../11-traceability/local-source-hashes.json)
- [00-context/sources/python-package-metadata.json](../../tooling/python-package-metadata.json)
- [00-context/sources/task-tracker.csv](../../12-process/task-tracker.csv)
- [00-context/sources/tmb-dedup-merge.txt](../../12-process/tmb-dedup-merge.txt)
- [00-context/sources/tmb-layout-init.txt](../../12-process/tmb-layout-init.txt)
- [00-context/sources/tmb-orchestrator.txt](../../12-process/tmb-orchestrator.txt)
- [00-context/sources/tmb-roadmap-planner.txt](../../12-process/tmb-roadmap-planner.txt)
- [00-context/sources/tmb-roadmap-sync.txt](../../12-process/tmb-roadmap-sync.txt)

Snapshots are source data, not active instructions/independent studies. Connector reads are read-only; local originals remain unchanged. source-register distinguishes live read, snapshot, historical design and inaccessible resources.

- [Mermaid parser results](../../tooling/mermaid-parser-results.json)

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [00-context/source-register.md](../source-register.md)
- [11-traceability/gates.md](../../12-process/gates.md)

## Open questions

Chốt các quyết định liên quan trong decision ledger trước khi đổi contract hoặc triển khai.

## Related documents

- [README.md](../../README.md)
- [11-traceability/README.md](../../11-traceability/README.md)
- [00-context/source-register.md](../source-register.md)
- [11-traceability/gates.md](../../12-process/gates.md)

## Verification criteria

Đối chiếu nguồn, ID và downstream links; acceptance runtime chỉ được ghi pass sau khi thực chạy.
