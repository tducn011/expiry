# DOC-NEEDS — Needs, challenges, and product opportunities

- Document ID: `DOC-NEEDS`
- Status: **Review**
- Updated: 2026-10-13

## Purpose

Make the current need/feature trace explicit without turning persona hypotheses into stakeholder approval.

## Evidence sources

- [Food-expiry problem synthesis](food-expiry.md)
- [Research source assessment](sources-requirements.md)
- [Persona evidence gaps](../01-personas/persona-evidence-gaps.md)
- `docs/architecture/11-traceability/registry.json` (current trace links)

## Definitions and assumptions

Persona statements and opportunities below are synthesis. They are not validated participant findings or confirmed business outcomes.

## Analysis

| ID | Need/challenge synthesis | Opportunity / response to evaluate |
|---|---|---|
| NEED-01 / CH-01 | Remember food after it is stored and recover what is already available | Low-friction capture and owner inventory/search |
| NEED-02 / CH-02 | Notice what deserves attention while preserving uncertainty about recorded dates | Explainable attention based on recorded date and owner-local day |
| NEED-03 / CH-03 | Keep recorded quantity aligned after use, disposal, or correction | Explicit movement and recount with immutable event history |

The current feature mapping is in [`03-requirements-features/features.md`](../03-requirements-features/features.md). The mapping is traceability support, not proof that any opportunity reduces waste or is approved by stakeholders.

## Decisions and rationale

[D] Keep needs as evidence-linked hypotheses. Do not infer new roles, notifications, shared-household behavior, or safety judgments from this table.

## Dependencies

- [Business requirements](../03-requirements-features/business-requirements.md)
- [Feature catalog](../03-requirements-features/features.md)
- [Dated schema reconciliation](../10-testing/schema-reconciliation-2026-10-13.md)

## Open questions

Participant research must validate whether these needs and opportunities match actual household behavior and which are prioritized.

## Related documents

- [Personas](../01-personas/README.md)
- [Use cases](../04-user-flows/use-cases.md)
- [Traceability registry](../11-traceability/registry.json)

## Verification criteria

Every need/feature mapping has a traceable identifier and source reference; no participant or business-outcome claim is inferred from the table.
