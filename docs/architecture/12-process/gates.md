# DOC-GATES — Architecture review gates

- Document ID: `DOC-GATES`
- Status: **Review**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

Do not promote artifact because document/checklist exists.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

| Gate | Status | Current evidence / gap | Acceptance |
|---|---|---|---|
| Gate1 Evidence | Review | Live Canva/Docs read; original interview/Figma evidence incomplete | Persona/needs provenance + missing source registry |
| Gate2 Requirements | Review | FR/NFR/features linked; stakeholder acceptance + performance targets open | Testable baseline and scope approval |
| Gate3 Interaction | Review | 12 UC/15SC/11UF with navigation/recovery; browser/user study not run | Task consistency + keyboard/back/draft evidence |
| Gate4 Data | Review | Dictionary/schema/ERD linked; real DB/ORM invariants untested | Chosen mappings + migration/concurrency tests |
| Gate5 Architecture | Review | Explicit owners/components/contract; auth/ORM ADR Blocked | Stable reviewed interfaces + trust/transaction boundaries |
| Gate6 Readiness | Blocked | Demo DTO/auth/clock mismatch and production choices unresolved | Contract parity + decisions; OCR only if promoted |
| Gate7 Quality | Blocked | Plans exist; production/DB/browser/usability tests not run | Executed affected checks + stage task/restore evidence |

Confidence: High for files/live-card text and inspected module ownership; Medium for design rationale and current MVP proposal; low/unestablished for measured user outcomes/food OCR/production runtime. No artifact is Approved in this iteration. Blocked gates do not prevent writing reviewable documents or doing isolated contract/domain spikes with stated assumptions.

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [00-context/audit.md](../00-context/audit.md)
- [00-context/decisions-and-questions.md](../00-context/decisions-and-questions.md)
- [10-testing/test-catalog.md](../10-testing/test-catalog.md)

## Open questions

Chốt các quyết định liên quan trong decision ledger trước khi đổi contract hoặc triển khai.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](README.md)
- [00-context/audit.md](../00-context/audit.md)
- [00-context/decisions-and-questions.md](../00-context/decisions-and-questions.md)
- [10-testing/test-catalog.md](../10-testing/test-catalog.md)

## Verification criteria

Đối chiếu nguồn, ID và downstream links; acceptance runtime chỉ được ghi pass sau khi thực chạy.
