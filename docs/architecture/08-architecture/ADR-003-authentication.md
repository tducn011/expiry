# DOC-ADR-003 — Credential and session authority

- Document ID: `DOC-ADR-003`
- Status: **Blocked**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

Owner-private data requires real principal, logout and draft recovery.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

| Aspect | Review decision |
|---|---|
| Problem | Owner-private data requires real principal, logout and draft recovery. |
| Options | Opaque server session with durable store; Managed identity adapter; JWT only or justified hybrid |
| Evidence | No separate-client/distributed-validator need in supplied product tasks; default MemoryStore unsuitable for production. |
| Trade-offs | Cookie/CSRF/store/rotation/revocation work; bearer sample contract must be updated if session selected. |
| Decision proposal | [D] Prefer evaluate server session/provider for same-origin MVP; no hybrid approval. |
| Consequences | Cookie/CSRF/store/rotation/revocation work; bearer sample contract must be updated if session selected. |
| Reversal / migration | Keep principal port stable; change credential transport only with FE/OpenAPI/auth tests reviewed. |

## Decisions and rationale

[D] Prefer evaluate server session/provider for same-origin MVP; no hybrid approval.

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
