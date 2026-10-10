# DOC-COVERAGE — End-to-end artifact coverage

- Document ID: `DOC-COVERAGE`
- Status: **Review**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

Traceability graph and review matrix across three academic tracks.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

| Persona | Need | FR | Feature | UC | Scenario | UF | DF | Entity | API | UI | Test plan |
|---|---|---|---|---|---|---|---|---|---|---|---|
| P1,P3 | NEED-01,NEED-03 | FR-01 | F-01 | UC-01 | SC-01,SC-02 | UF-01,UF-02 | DF-01 | ENT-01,ENT-02,ENT-03,ENT-04 | API-01 | WF-02 | VT-01,VT-02,VT-14 |
| P1,P2 | NEED-01,NEED-02 | FR-02,FR-03 | F-02 | UC-02,UC-03 | SC-03,SC-04,SC-14,SC-15 | UF-03,UF-04 | DF-02 | ENT-01,ENT-02 | API-02,API-03 | WF-01,WF-03 | TC-18,TC-19,VT-12,VT-13 |
| P2 | NEED-02 | FR-03 | F-03 | UC-03 | SC-03,SC-04,SC-14,SC-15 | UF-03,UF-04 | DF-02 | ENT-01,ENT-02 | API-02,API-03 | WF-01,WF-03 | TC-19,VT-13 |
| P3 | NEED-03 | FR-04 | F-04 | UC-04,UC-05 | SC-04,SC-05,SC-06,SC-08,SC-09,SC-12 | UF-04,UF-05,UF-06 | DF-02,DF-03 | ENT-02,ENT-03,ENT-04 | API-05 | WF-04 | VT-03,VT-04,VT-05,VT-06,VT-07,VT-10 |
| P2,P3 | NEED-02,NEED-03 | FR-05,FR-06 | F-05 | UC-06,UC-07 | SC-07,SC-11 | UF-07,UF-08 | DF-03 | ENT-02,ENT-03,ENT-04 | API-04,API-06 | WF-02,WF-04 | VT-08,VT-09,VT-14,VT-15 |
| P3 | NEED-03 | FR-07 | F-06 | UC-08 | SC-12 | UF-07 | DF-03 | ENT-02,ENT-03 | API-07 | WF-05 | VT-10,VT-12 |
| P3 | NEED-03 | FR-08 | F-07 | UC-09,UC-10 | SC-10 | UF-09 | DF-03 | ENT-01,ENT-02,ENT-04 | API-08,API-09,API-10 | WF-03,WF-05 | VT-11 |
| P1,P2 | NEED-01,NEED-02 | FR-09 | F-08 | UC-11 | SC-14 | UF-10 | DF-04 | ENT-01,ENT-04 | API-11,API-12 | WF-06 | TC-20,VT-13 |

Auth support FR-10 → UC-00 → UF-11 → identity/draft boundary plus all owned API authorization tests VT-12/15, TC-23. NFR coverage is separately complete at planned-test level in NFR/test catalog; NFR-08 requires baseline/target. Planned links do not mean all needs are validated or that tests have run.

Unresolved: stakeholder approval, local persona/task validity, legacy scope conflict, DTO parity, ORM/auth selection, food OCR research, deployment and physical safety boundaries. Single-source graph is machine-readable registry.json; this matrix is a generated review projection, not independent definitions.

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [traceability/registry.json](registry.json)
- [03-requirements-features/system-requirements.md](../03-requirements-features/system-requirements.md)
- [10-testing/test-catalog.md](../10-testing/test-catalog.md)
- [11-traceability/gates.md](gates.md)

## Open questions

Chốt các quyết định liên quan trong decision ledger trước khi đổi contract hoặc triển khai.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](README.md)
- [traceability/registry.json](registry.json)
- [03-requirements-features/system-requirements.md](../03-requirements-features/system-requirements.md)
- [10-testing/test-catalog.md](../10-testing/test-catalog.md)
- [11-traceability/gates.md](gates.md)

## Verification criteria

Đối chiếu nguồn, ID và downstream links; acceptance runtime chỉ được ghi pass sau khi thực chạy.
