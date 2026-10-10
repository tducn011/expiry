# DOC-ADR-004 — OCR feature and Python execution boundary

- Document ID: `DOC-ADR-004`
- Status: **Review**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

Manual entry friction may warrant assistance; wrong extracted dates add risk.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

| Aspect | Review decision |
|---|---|
| Problem | Manual entry friction may warrant assistance; wrong extracted dates add risk. |
| Options | Manual MVP only; Bounded local/subprocess POC; Separate HTTP OCR service; Async job consumer |
| Evidence | Live persona pain supports effort hypothesis but not OCR benefit; no food-image dataset/benchmark supplied. |
| Trade-offs | No new production runtime/route/store now; correction preview/manual fallback required if promoted. |
| Decision proposal | [D] Preserve manual MVP; evaluate candidates on consented food images before service selection. |
| Consequences | No new production runtime/route/store now; correction preview/manual fallback required if promoted. |
| Reversal / migration | Contract converts transient candidates to confirmed EntryCreate; executor can change without domain DB bypass. |

## Decisions and rationale

[D] Preserve manual MVP; evaluate candidates on consented food images before service selection.

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
