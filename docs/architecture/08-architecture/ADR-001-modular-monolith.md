# DOC-ADR-001 — Modular monolith with source-owned rules

- Document ID: `DOC-ADR-001`
- Status: **Review**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

Avoid distributed complexity for three core food tasks.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

| Aspect | Review decision |
|---|---|
| Problem | Avoid distributed complexity for three core food tasks. |
| Options | One Express deployment with feature modules; Microservices by feature; Frontend-only persistence prototype |
| Evidence | Domain/services/repository/HTTP boundaries map existing UCs; no workload/ops evidence warrants separate services. |
| Trade-offs | Fewer deploy/network transactions; internal ownership discipline required. |
| Decision proposal | [D] Recommend modular monolith for production candidate; observed demo stays prototype. |
| Consequences | Fewer deploy/network transactions; internal ownership discipline required. |
| Reversal / migration | Split only after measured scale/team boundary; keep ports/DTOs stable. |

## Decisions and rationale

[D] Recommend modular monolith for production candidate; observed demo stays prototype.

## Dependencies

- [14-system-architecture/components.md](../08-architecture/components.md)
- [04-technology-research/official-references.md](../04-technology-research/official-references.md)
- [00-context/decisions-and-questions.md](../00-context/decisions-and-questions.md)

## Open questions

Review owner must record approval rationale and verify the corresponding gate; no automatic approval by document existence.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](../11-traceability/README.md)
- [08-architecture/components.md](../08-architecture/components.md)
- [04-technology-research/official-references.md](../04-technology-research/official-references.md)
- [00-context/decisions-and-questions.md](../00-context/decisions-and-questions.md)

## Verification criteria

Đối chiếu nguồn, ID và downstream links; acceptance runtime chỉ được ghi pass sau khi thực chạy.
