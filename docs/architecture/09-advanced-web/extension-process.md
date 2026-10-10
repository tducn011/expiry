# DOC-EXTENSION — Controlled feature impact process

- Document ID: `DOC-EXTENSION`
- Status: **Review**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

Update only affected artifacts and preserve stable IDs/owners.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

1. Register source problem/need, provenance/confidence and target actor; classify scope before implementing.
2. Check current graph for affected requirements/features/use cases; create new stable IDs without reusing old meaning.
3. Write concrete scenario/user task and acceptance/error/recovery behavior; assess navigation impact.
4. Trace inputs, derived vs persistent data, state/lifecycle owner and trust boundary.
5. Change dictionary/schema/ERD only if justified data changes; compare migrations/retention/ownership.
6. Review API/FE/conditional OCR contract versioning and compatible rollout.
7. Add meaningful tests at changed boundary and observability/deploy updates only where needed.
8. Record material trade-off in ADR with status, alternatives, reversal and migration cost; update graph and gate status.
9. Run documentation validator then affected actual tests; never equate graph completeness to product validation.

Examples: adding a filter may affect query contract/FE/test only; household sharing affects owner model, authorization/schema/session identity/cache scopes and concurrency; OCR adds transient candidate pipeline and upload/privacy/timeout controls but does not bypass capture domain rules. Keep unchanged artifacts linked, avoid copying rules across pages.

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [traceability/README.md](../11-traceability/README.md)
- [adr/README.md](../adr/README.md)
- [12-process/workstreams.md](../12-process/workstreams.md)

## Open questions

Chốt các quyết định liên quan trong decision ledger trước khi đổi contract hoặc triển khai.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](../11-traceability/README.md)
- [adr/README.md](../adr/README.md)
- [12-process/workstreams.md](../12-process/workstreams.md)

## Verification criteria

Đối chiếu nguồn, ID và downstream links; acceptance runtime chỉ được ghi pass sau khi thực chạy.
