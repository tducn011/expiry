# DOC-NFR — Quality requirements and measurable acceptance

- Document ID: `DOC-NFR`
- Status: **Review**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

NFR có test/measurement dependency; không bịa SLA.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

| ID | Constraint proposal | Verification method | Cases |
|---|---|---|---|
| NFR-01 Privacy | Không cross-user read/write ở mọi endpoint và history | A/B user tests | VT-12 |
| NFR-02 Integrity | Atomic entry/movement/idempotency; không âm; conflict không overwrite | Concurrent transactions + rollback test | VT-02, VT-05, VT-06 |
| NFR-03 Contract | FE mock và BE trả đúng OpenAPI; stable error shape | Contract validation | VT-01, VT-14, TC-21 |
| NFR-04 UX recovery | 401 giữ draft; timeout retry cùng key; conflict refetch không silent replace | UI scenarios | VT-15 |
| NFR-05 Accessibility | Label/input rõ, keyboard usable, trạng thái không chỉ màu, focus/dialog/error đúng | Keyboard + screen reader review | VT-17 |
| NFR-06 Date accuracy | Date-only không bị lệch do UTC conversion; clock injection | Boundary timezone tests | VT-13 |
| NFR-07 Operations | Migration versioned, backup/restore baseline, generic errors, no secret logging | Staging acceptance | VT-16 |
| NFR-08 Performance | Chốt latency/volume sau biết hosting và dataset; chưa bịa SLA | Baseline measurements | TC-22 |

NFR-08 stays incomplete for approval until host/data volume/baseline and target are recorded. Legacy 1.5s/3s/±5min are proposals in group Doc, not measurements or inherited universal gates.

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [20-testing/test-catalog.md](../10-testing/test-catalog.md)
- [08-architecture/deployment.md](../08-architecture/deployment.md)

## Open questions

Chốt các quyết định liên quan trong decision ledger trước khi đổi contract hoặc triển khai.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](../11-traceability/README.md)
- [10-testing/test-catalog.md](../10-testing/test-catalog.md)
- [08-architecture/deployment.md](../08-architecture/deployment.md)

## Verification criteria

Đối chiếu nguồn, ID và downstream links; acceptance runtime chỉ được ghi pass sau khi thực chạy.
