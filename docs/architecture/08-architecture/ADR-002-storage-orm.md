# DOC-ADR-002 — SQL engine and ORM selection

- Document ID: `DOC-ADR-002`
- Status: **Blocked**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

Exact quantities, row locking and atomic entry/event/key commits.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

| Aspect | Review decision |
|---|---|
| Problem | Exact quantities, row locking and atomic entry/event/key commits. |
| Options | PostgreSQL + Prisma transaction/raw lock seam; PostgreSQL + Sequelize explicit transaction/lock; Other SQL engine + compatible ORM |
| Evidence | Existing SQL reference and official candidate transaction docs; no installed backend/real DB tests. |
| Trade-offs | Choose from generated SQL/lock semantics, exact decimal/date mappings, migration skill and team familiarity. |
| Decision proposal | [D] PostgreSQL physical reference is first spike candidate; ORM not selected. |
| Consequences | Choose from generated SQL/lock semantics, exact decimal/date mappings, migration skill and team familiarity. |
| Reversal / migration | Changing ORM can preserve service/repository ports; DB migration requires type/constraint parity and restore plan. |

## Decisions and rationale

[D] PostgreSQL physical reference is first spike candidate; ORM not selected.

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
