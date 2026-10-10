# DOC-WORKSTREAMS — Dependency-first implementation and parallel work

- Document ID: `DOC-WORKSTREAMS`
- Status: **Review**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

One shared product with interface gates; no unapproved feature implementation.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

| Workstream | Stable input | Output | Coverage | Current boundary |
|---|---|---|---|---|
| A Frontend | UC/UF/navigation + reviewed OpenAPI/fixtures | Page/form components, API types/mock parity, owner-scoped cache/recovery | FR-01…10; TC-21, VT-15/17 | Blocks real integration on DTO/auth gaps; can review UI/tasks now |
| B Backend | Reviewed rules/dictionary/transactions + chosen auth ports | Express modules/services/owned repos, validation/error adapter | API-01…12; VT-01…15 | Blocks production coding on ADR-002/003 decisions; pure contract/domain spike can proceed |
| C Database | Entity grain/field semantics + DB/ORM spike | Versioned migrations/checks/indexes, real concurrency/rollback fixtures | ENT-01…04; VT-02/05/06/16 | No DB runtime chosen/applied |
| D Python research | Consent/ground truth/manual baseline + OCR hypothesis | Candidate POC report and proposed output contract | TC-25; ADR-004 | Later research only; not a prerequisite for manual MVP |
| E Integration/QA | Reviewed shared contract, staged API/SQL/auth | Contract parity + browser-to-DB tasks/security/accessibility evidence | VT-01…17, TC-18…25 | Cannot claim done with mock-only DB or Boolean auth |

Increment order: evidence/conflict ledger → requirements/rules/grain review → interaction/dictionary/contracts review → DB/ORM/auth spikes → agreed transport/types/fixtures → core capture/read/movement/recount → support edit/history/trash/preferences/auth recovery → real integration/usability/deployment verification. Shared interface review can unblock UI mocks and pure domain work in parallel; it does not require every layer already complete.

Preserve tracker names/task IDs/deadlines as source history; do not reassign members or announce progress on their behalf. Ownership here is role-based to avoid contradicting self-claim/co-owner workflow. HCI/SE/Web use the same FR/RULE/UC/data IDs; deliverables differ, product version does not.

Immediate dependency-unblocking work: resolve OQ-01 scope conflicts in group source; review grain/DTO mapping OQ-02; choose DB/ORM/auth based on spikes OQ-03/04; obtain Figma if visual parity needed; collect local task evidence OQ-07. OCR/service deployment stays behind its gate.

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [00-context/decisions-and-questions.md](../00-context/decisions-and-questions.md)
- [11-traceability/gates.md](../11-traceability/gates.md)
- [07-api/protocol-and-compatibility.md](../07-api/protocol-and-compatibility.md)
- [10-testing/test-catalog.md](../10-testing/test-catalog.md)

## Open questions

Chốt các quyết định liên quan trong decision ledger trước khi đổi contract hoặc triển khai.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](../11-traceability/README.md)
- [00-context/decisions-and-questions.md](../00-context/decisions-and-questions.md)
- [11-traceability/gates.md](../11-traceability/gates.md)
- [07-api/protocol-and-compatibility.md](../07-api/protocol-and-compatibility.md)
- [10-testing/test-catalog.md](../10-testing/test-catalog.md)

## Verification criteria

Đối chiếu nguồn, ID và downstream links; acceptance runtime chỉ được ghi pass sau khi thực chạy.
