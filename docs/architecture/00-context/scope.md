# DOC-SCOPE — Product scope and exclusions

- Document ID: `DOC-SCOPE`
- Status: **Review**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

Giữ scope theo quyết định nguồn và tách academic tracks khỏi sản phẩm.

## Evidence sources

- [00-context/source-register.md](source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

| Capability | Classification | Evidence | Gate |
|---|---|---|---|
| Private inventory | MVP recorded-confirmed | DEC-01 / design Doc | Owner tests |
| Manual capture + in-app attention | MVP recorded-confirmed | DEC-02 / design Doc | CF-01…03 task validation |
| Food-first | Recommended current baseline | CTX-10; live personas food-oriented | Scope review |
| React/Express/SQL/ORM | Proposed direction from current user prompt | Not all installed; UI React exists | ADR stack/ORM |
| OCR / Python | Research Required; later integration only if approved | Current prompt requests evaluation, not approval | Measured food-image POC |
| Push/background reminders | Later; not manual/in-app MVP | Legacy GR2 conflicts with DEC-02 | Delivery/OS study |
| Recipes/AI/tips | Research Required | P2 action gap is partial, no approved source/policy | Content/safety/user validation |
| Household sharing / non-food domains | Later | Older vision; private current scope | Separate domain/coordination study |
| Google Analytics / error monitoring | Proposed optional adapters | Prompt technical intent | Privacy/product questions/observability ADR |

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [00-context/decisions-and-questions.md](decisions-and-questions.md)
- [03-requirements-features/features.md](../03-requirements-features/features.md)

## Open questions

OQ-01 reconcile current group Doc and MVP; no universal KPI is accepted automatically.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](../11-traceability/README.md)
- [00-context/decisions-and-questions.md](decisions-and-questions.md)
- [03-requirements-features/features.md](../03-requirements-features/features.md)

## Verification criteria

Đối chiếu nguồn, ID và downstream links; acceptance runtime chỉ được ghi pass sau khi thực chạy.
