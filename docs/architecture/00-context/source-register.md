# DOC-SOURCES — Source register

- Document ID: `DOC-SOURCES`
- Status: **Review**
- Updated: 2026-10-10

## Purpose

Đăng ký nguồn, độ chắc chắn và access gaps; không giả đã đọc title/link.

## Evidence sources

- [00-context/audit.md](audit.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

| Source ID | Class | Location | Read status | Confidence | Related artifacts | Snapshot |
|---|---|---|---|---|---|---|
| SRC-CANVA | [A] live connector | [https://www.canva.com/design/DAHXSrL9WU4](https://www.canva.com/design/DAHXSrL9WU4) | Read all rich text; saved snapshot | High text / Medium layout | P1/P2/P3; CH-01…03 | [canva-personas.txt](sources/canva-personas.txt) |
| SRC-GR2 | [A] live connector | [https://docs.google.com/document/d/1js1KBfrVrgDn9EVC4_sNGIvUlWQNlLRC66nyTeAvBmA/edit](https://docs.google.com/document/d/1js1KBfrVrgDn9EVC4_sNGIvUlWQNlLRC66nyTeAvBmA/edit) | Readable flattened content fetched; not native tab topology | High content / approval unknown | Scope conflicts / stakeholder baseline | [google-doc-system-engineering.txt](sources/google-doc-system-engineering.txt) |
| SRC-GR2-FINAL-CHECK | [A] native trusted readback, 2026-10-10 | [FINAL CHECK](https://docs.google.com/document/d/1js1KBfrVrgDn9EVC4_sNGIvUlWQNlLRC66nyTeAvBmA/edit?tab=t.1rjc5vc4ma1w) | Selected tab read after stakeholder/persona and downstream updates; exact revision stored in snapshot | High selected-tab content / requirement draft | Current BR, SYS-SR, UR, FR, NFR, scope, RULE-06, SC-01…03 and V&V; [namespaced crosswalk](../03-requirements-features/final-check-persona-alignment.md) | [google-doc-final-check-2026-10-10.md](sources/google-doc-final-check-2026-10-10.md) |
| SRC-DESIGN-DOC | [A] live connector | [https://docs.google.com/document/d/1PqLnE9zjHdYeg8jEZPShslYdYFft-T1zrpiVfGkMAi8/edit](https://docs.google.com/document/d/1PqLnE9zjHdYeg8jEZPShslYdYFft-T1zrpiVfGkMAi8/edit) | Fetched design text; corroborates local draft | High text | CTX / FR / UC / API | [google-doc-system-design.txt](sources/google-doc-system-design.txt) |
| SRC-TRACKER | [A] live connector | [https://docs.google.com/spreadsheets/d/1P4ECgECOf-kzdFps5Ybna_45f0Oxi41c98Q7ZSBCok8/edit](https://docs.google.com/spreadsheets/d/1P4ECgECOf-kzdFps5Ybna_45f0Oxi41c98Q7ZSBCok8/edit) | CSV-readable table; row assignments are historical planning | High table | Workstream dependencies; no new assignment | [task-tracker.csv](sources/task-tracker.csv) |

### Local source inventory

| Path | Role | Status |
|---|---|---|
| [00_Context_and_Evidence.md](../../../Expiry_System_Design_2026-10-08/00_Context_and_Evidence.md) | Context and Evidence.md | Read text; review draft, not approved |
| [01_Research_Personas_and_Opportunities.md](../../../Expiry_System_Design_2026-10-08/01_Research_Personas_and_Opportunities.md) | Research Personas and Opportunities.md | Read text; review draft, not approved |
| [02_Requirements_and_Business_Rules.md](../../../Expiry_System_Design_2026-10-08/02_Requirements_and_Business_Rules.md) | Requirements and Business Rules.md | Read text; review draft, not approved |
| [03_User_Flows_Scenarios_and_Use_Cases.md](../../../Expiry_System_Design_2026-10-08/03_User_Flows_Scenarios_and_Use_Cases.md) | User Flows Scenarios and Use Cases.md | Read text; review draft, not approved |
| [04_Data_Flow_UML_and_Ownership.md](../../../Expiry_System_Design_2026-10-08/04_Data_Flow_UML_and_Ownership.md) | Data Flow UML and Ownership.md | Read text; review draft, not approved |
| [05_Data_Definitions_and_ERD.md](../../../Expiry_System_Design_2026-10-08/05_Data_Definitions_and_ERD.md) | Data Definitions and ERD.md | Read text; review draft, not approved |
| [06_API_Routes_and_Contracts.md](../../../Expiry_System_Design_2026-10-08/06_API_Routes_and_Contracts.md) | API Routes and Contracts.md | Read text; review draft, not approved |
| [07_Architecture_Components_and_Alternatives.md](../../../Expiry_System_Design_2026-10-08/07_Architecture_Components_and_Alternatives.md) | Architecture Components and Alternatives.md | Read text; review draft, not approved |
| [08_Wireframes_and_Interaction_Spec.md](../../../Expiry_System_Design_2026-10-08/08_Wireframes_and_Interaction_Spec.md) | Wireframes and Interaction Spec.md | Read text; review draft, not approved |
| [09_Traceability_Implementation_and_Verification.md](../../../Expiry_System_Design_2026-10-08/09_Traceability_Implementation_and_Verification.md) | Traceability Implementation and Verification.md | Read text; review draft, not approved |
| [10_Canva_Persona_Source.md](../../../Expiry_System_Design_2026-10-08/10_Canva_Persona_Source.md) | Canva Persona Source.md | Read text; review draft, not approved |

| Source | Access status | Consequence |
|---|---|---|
| Figma original | Missing exact URL/key in supplied corpus | Cannot assert Figma/source visual parity |
| TMB skill / workflow | Resolved after user pointed to hackathon/src/skills; see tmb-skills.md | Verified TMB convention; project layout and UI tokens from code |
| Original interview transcripts / consent | Not supplied | Persona card text is not validated user research |
| Existing backend/database runtime | No implementation found in project scan | Cannot assert migrations/auth/concurrency pass |
| Official references | Read on 09/10/2026 | See technical research; supports technology constraints, not user needs |

Byte/hash inventory of local original files: [00-context/sources/local-source-hashes.json](sources/local-source-hashes.json). Generated extraction from earlier turn is reference only, not a separate primary evidence source. External read snapshots capture tool-returned readable content; provider completeness/formatting limits apply.

The 2026-10-10 native FINAL CHECK snapshot is the current source for the stakeholder/persona alignment task. The earlier flattened SRC-GR2 snapshot and the 2026-10-08 design files retain their historical meaning and are preserved. Reading/revising a requirement draft does not establish stakeholder research validation, usability acceptance or achieved business outcomes.

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [00-context/audit.md](audit.md)

## Open questions

Cần exact Figma design URL/key và interview evidence nếu muốn pass evidence/visual gate.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](../11-traceability/README.md)
- [00-context/audit.md](audit.md)

## Verification criteria

Đối chiếu nguồn, ID và downstream links; acceptance runtime chỉ được ghi pass sau khi thực chạy.
