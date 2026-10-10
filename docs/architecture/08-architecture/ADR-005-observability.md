# DOC-ADR-005 — Analytics and application error tracking

- Document ID: `DOC-ADR-005`
- Status: **Review**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

Need product/operational signals without sensitive inventory exposure.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

| Aspect | Review decision |
|---|---|
| Problem | Need product/operational signals without sensitive inventory exposure. |
| Options | No product analytics until study questions/consent set; Google Analytics adapter + redacted monitor; Alternative self-hosted analytics/log stack |
| Evidence | Prompt names Google Analytics; sensors meaning remains unclear; existing code has no proven integration. |
| Trade-offs | Telemetry disabled/unavailable must not block commands; privacy and alert ownership remain gate. |
| Decision proposal | [D] Define adapter/event allowlist; provider/consent/retention not selected. |
| Consequences | Telemetry disabled/unavailable must not block commands; privacy and alert ownership remain gate. |
| Reversal / migration | Provider change remains behind adapter; event schema version and data deletion/retention impact reviewed. |

## Decisions and rationale

[D] Define adapter/event allowlist; provider/consent/retention not selected.

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
