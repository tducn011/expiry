# DOC-UML — UML and diagram source catalog

- Document ID: `DOC-UML`
- Status: **Review**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

Notation boundaries and diagram validation status.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

| Source | Notation | Interpretation |
|---|---|---|
| [diagrams/activity_record_movement.puml](../../../Expiry_System_Design_2026-10-08/diagrams/activity_record_movement.puml) | PlantUML | UML use-case/activity source |
| [diagrams/use_cases.puml](../../../Expiry_System_Design_2026-10-08/diagrams/use_cases.puml) | PlantUML | UML use-case/activity source |
| [diagrams/03_User_Flows_Scenarios_and_Use_Cases_1.mmd](../../../Expiry_System_Design_2026-10-08/diagrams/03_User_Flows_Scenarios_and_Use_Cases_1.mmd) | Mermaid | Read diagram declaration; flowchart/ERD are not automatically UML |
| [diagrams/03_User_Flows_Scenarios_and_Use_Cases_2.mmd](../../../Expiry_System_Design_2026-10-08/diagrams/03_User_Flows_Scenarios_and_Use_Cases_2.mmd) | Mermaid | Read diagram declaration; flowchart/ERD are not automatically UML |
| [diagrams/03_User_Flows_Scenarios_and_Use_Cases_3.mmd](../../../Expiry_System_Design_2026-10-08/diagrams/03_User_Flows_Scenarios_and_Use_Cases_3.mmd) | Mermaid | Read diagram declaration; flowchart/ERD are not automatically UML |
| [diagrams/04_Data_Flow_UML_and_Ownership_1.mmd](../../../Expiry_System_Design_2026-10-08/diagrams/04_Data_Flow_UML_and_Ownership_1.mmd) | Mermaid | Read diagram declaration; flowchart/ERD are not automatically UML |
| [diagrams/04_Data_Flow_UML_and_Ownership_2.mmd](../../../Expiry_System_Design_2026-10-08/diagrams/04_Data_Flow_UML_and_Ownership_2.mmd) | Mermaid | Read diagram declaration; flowchart/ERD are not automatically UML |
| [diagrams/04_Data_Flow_UML_and_Ownership_3.mmd](../../../Expiry_System_Design_2026-10-08/diagrams/04_Data_Flow_UML_and_Ownership_3.mmd) | Mermaid | Read diagram declaration; flowchart/ERD are not automatically UML |
| [diagrams/04_Data_Flow_UML_and_Ownership_4.mmd](../../../Expiry_System_Design_2026-10-08/diagrams/04_Data_Flow_UML_and_Ownership_4.mmd) | Mermaid | Read diagram declaration; flowchart/ERD are not automatically UML |
| [diagrams/04_Data_Flow_UML_and_Ownership_5.mmd](../../../Expiry_System_Design_2026-10-08/diagrams/04_Data_Flow_UML_and_Ownership_5.mmd) | Mermaid | Read diagram declaration; flowchart/ERD are not automatically UML |
| [diagrams/04_Data_Flow_UML_and_Ownership_6.mmd](../../../Expiry_System_Design_2026-10-08/diagrams/04_Data_Flow_UML_and_Ownership_6.mmd) | Mermaid | Read diagram declaration; flowchart/ERD are not automatically UML |
| [diagrams/04_Data_Flow_UML_and_Ownership_7.mmd](../../../Expiry_System_Design_2026-10-08/diagrams/04_Data_Flow_UML_and_Ownership_7.mmd) | Mermaid | Read diagram declaration; flowchart/ERD are not automatically UML |
| [diagrams/05_Data_Definitions_and_ERD_1.mmd](../../../Expiry_System_Design_2026-10-08/diagrams/05_Data_Definitions_and_ERD_1.mmd) | Mermaid | Read diagram declaration; flowchart/ERD are not automatically UML |

Use-case diagram is actual PlantUML source. Sequence/state/class diagrams use supported Mermaid types. Logical DFD drawing uses flowchart notation; name its DFD abstraction/limitations. Structural validation can check tokens/delimiters; only a parser/render run establishes syntax acceptance.

### Source validation note

Legacy sequence files `_3.mmd`, `_4.mmd`, `_5.mmd` fail Mermaid 11.17.2 on semicolons in message labels. Use corrected new [core sequences](../08-architecture/sequences.md) for the active review diagrams. Source originals remain preserved; [verification report](../11-traceability/verification-report.md) records exact parser scope. PlantUML grammar/render not run.

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [05-use-cases-uml/use-cases.md](use-cases.md)
- [06-data-model/data-flows.md](../06-data-model/data-flows.md)
- [06-data-model/erd.md](../06-data-model/erd.md)

## Open questions

Chốt các quyết định liên quan trong decision ledger trước khi đổi contract hoặc triển khai.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](../11-traceability/README.md)
- [05-use-cases-uml/use-cases.md](use-cases.md)
- [06-data-model/data-flows.md](../06-data-model/data-flows.md)
- [06-data-model/erd.md](../06-data-model/erd.md)

## Verification criteria

Đối chiếu nguồn, ID và downstream links; acceptance runtime chỉ được ghi pass sau khi thực chạy.
