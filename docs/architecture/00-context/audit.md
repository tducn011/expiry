# DOC-AUDIT — Architecture source audit

- Document ID: `DOC-AUDIT`
- Status: **Review**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

Phân biệt observed behavior, design drafts và gaps trước authoring.

## Evidence sources

- [00-context/source-register.md](source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

| Finding | File/source | Role | Evidence / issue | Confidence | Impact |
|---|---|---|---|---|---|
| AUD-01 | README.md | Vision/multi-domain | Household/cosmetics/medicine/sharing vision differs from private food-first manual MVP | High | Historical vision; preserve source, no silent scope expansion |
| AUD-02 | 00_Context_and_Evidence.md | Context and decisions | DEC-01/02 recorded as user confirmed; DEC-03…09 proposed/open | High | Reuse scope, retain approval state |
| AUD-03 | Canva live rich text | Persona evidence | P1 planned buying + occasional forgetting; P2 changed plans; P3 repetitive maintenance | High for card text | Card quotes are not independently verified interviews |
| AUD-04 | Google Doc System Engineering Gr2 | Requirements history | Includes OCR/push, 3-day threshold, 40%/100%/80% objectives alongside newer food scope | High | Conflicting layers require scope reconciliation; no auto-baseline of targets |
| AUD-05 | uidemo/src/mockApi.ts | Prototype authority | In-memory arrays; hard-coded TODAY 2026-10-08; enum/DTO mismatch with OpenAPI | High | Adapter contract and clock parity required before FE/BE integration |
| AUD-06 | uidemo/src/App.tsx | UI state/auth/navigation | authenticated Boolean; query params read once; local setView; no demonstrated history routing | High | Simulated auth, browser back contract missing |
| AUD-07 | uidemo/HANDOFF.md vs src/index.css | Layout | Handoff says 28px cards/1200px width and older tokens; CSS has r-card16/content-max1100 | High | CSS observed current authority; provisional LAYOUT documents exact tokens |
| AUD-08 | contracts/schema_reference_postgresql.sql | DB reference | PostgreSQL DDL; no backend/migration runner in tracked corpus | High | Schema proposal, not applied database |
| AUD-09 | Source discovery | Figma/TMB convention | Initially no Figma design URL/key or project LAYOUT; user pointed to hackathon, five canonical TMB skills now read/installed | High for search scope | TMB source resolved; Figma source gap remains |
| AUD-10 | doc research + PDF slides | Evidence taxonomy | Research synthesis and OCR slides have limitations; docs ≠ primary research validation | High | Keep research claims attributed; no field-validation claim |

Root cause [C]: artifacts được tạo qua nhiều mốc và chưa có baseline/contract review đồng bộ; frontend prototype giữ representation riêng, còn file bàn giao không được cập nhật theo CSS. Đây là nguyên nhân suy luận từ diff nguồn, không phải kết luận về mọi lịch sử tác giả.

Focused change: tạo documentation workspace mới, giữ source cũ read-only, tách canonical rules/dictionary/contracts và ghi compatibility gaps; không patch demo/backend.

### AUD-11 — Diagram source parser evidence

[A] Mermaid 11.17.2 rejected three inherited sequence sources (`_3.mmd`, `_4.mmd`, `_5.mmd`) because `;` in message labels starts a new statement. Confidence High. Active architecture sequence copies use commas and pass; legacy sources stay read-only. Exact results are in the [verification report](../11-traceability/verification-report.md).

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [00-context/source-register.md](source-register.md)
- [00-context/decisions-and-questions.md](decisions-and-questions.md)

## Open questions

OQ-01…OQ-09 trong decision ledger; approval scope không được suy từ ngày sửa Doc.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](../11-traceability/README.md)
- [00-context/source-register.md](source-register.md)
- [00-context/decisions-and-questions.md](decisions-and-questions.md)

## Verification criteria

Mỗi finding có source/symbol/confidence; không claim runtime failure khi chỉ scan static.
