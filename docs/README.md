<!-- trustmebro -->
# Expiry — Docs Index

> **Phân loại tài liệu theo môn học và chức năng.**  
> Tất cả docs đã được tổ chức vào `architecture/` theo 15 subfolder.  
> Cập nhật: 2026-10-10.

---

## Cấu trúc thư mục `architecture/`

```
docs/architecture/
├── 00-context/              🏗️ System Eng  — bối cảnh, audit, glossary, scope
├── 01-personas/             🧠 HCI          — personas, so sánh, evidence
├── 02-challenges/           🧠 HCI          — research, food-expiry, OCR, REPORT
├── 03-requirements-features/ 🏗️ System Eng  — BR, FR, NFR, business-rules, features
├── 04-user-flows/           🧠 HCI          — user flows, scenarios, use cases
├── 05-interaction-design/   🧠 HCI          — wireframes, navigation, screen-state
├── 06-data-model/           🏗️ System Eng   — ERD, entities, dictionary, data-flows
├── 07-api/                  🏗️+🌐 Sys+Web   — endpoints, auth, contracts, protocol
├── 08-architecture/         🏗️ System Eng   — ADRs, components, deployment
├── 09-advanced-web/         🌐 Advanced Web  — LAYOUT, state, extension
├── 10-testing/              🏗️+🌐 Sys+Web   — test-catalog, coverage, verification
├── 11-traceability/         🏗️ System Eng   — registry, id-register, tracking
├── 12-process/              📋 General       — workstreams, gates, TMB skills
├── consolidated/            🔗 Read-only     — master exports, PDFs, snapshots
└── tooling/                 ⚙️ Meta          — scripts, JSON validators
```

---

## Mục lục nhanh

- [🏗️ System Engineering](#️-system-engineering)
- [🧠 HCI — Human-Computer Interaction](#-hci--human-computer-interaction)
- [🌐 Advanced Web](#-advanced-web)
- [📋 General — Project & Process](#-general--project--process)
- [🔗 Consolidated / Master Docs](#-consolidated--master-docs)
- [⚙️ Tooling & Meta](#️-tooling--meta)
- [📊 Cross-Reference Table](#-cross-reference-tài-liệu-theo-chủ-đề)

---

## 🏗️ System Engineering

### 00 — Context & Evidence
| Doc | Mô tả |
|-----|-------|
| [00_Context_and_Evidence.md](architecture/00-context/00_Context_and_Evidence.md) | Context tổng thể, evidence và phạm vi quyết định |
| [system-definition.md](architecture/00-context/system-definition.md) | System definition rút gọn, dùng trong registry |
| [scope.md](architecture/00-context/scope.md) | Ranh giới scope — in/out boundary |
| [glossary.md](architecture/00-context/glossary.md) | Glossary — định nghĩa thuật ngữ toàn bộ docs |
| [audit.md](architecture/00-context/audit.md) | Evidence audit — độ tin cậy và gap analysis |
| [source-register.md](architecture/00-context/source-register.md) | Register nguồn — URL, hash, trạng thái mỗi evidence |
| [official-references.md](architecture/00-context/official-references.md) | Official references (FDA, USDA, JMIR, ...) |
| [decisions-and-questions.md](architecture/00-context/decisions-and-questions.md) | Open decisions, open questions và rationale |
| [ownership.md](architecture/00-context/ownership.md) | Ownership map — ai owns phần nào trong hệ thống |

### 03 — Requirements & Features
| Doc | Mô tả |
|-----|-------|
| [02_Requirements_and_Business_Rules.md](architecture/03-requirements-features/02_Requirements_and_Business_Rules.md) | Definitions, requirement model tổng hợp |
| [business-requirements.md](architecture/03-requirements-features/business-requirements.md) | Business requirements (BR) có mức ưu tiên P0/P1/P2 |
| [business-rules.md](architecture/03-requirements-features/business-rules.md) | Canonical business rules — nguồn duy nhất cho logic nghiệp vụ |
| [stakeholder-requirements.md](architecture/03-requirements-features/stakeholder-requirements.md) | Yêu cầu từ góc độ stakeholder |
| [system-requirements.md](architecture/03-requirements-features/system-requirements.md) | Functional requirements tổng hợp |
| [nonfunctional-requirements.md](architecture/03-requirements-features/nonfunctional-requirements.md) | NFRs: quality requirements và measurable acceptance |
| [features.md](architecture/03-requirements-features/features.md) | Feature catalog và coverage theo persona |
| [Expiry_System_Requirements_Summary.md](architecture/03-requirements-features/Expiry_System_Requirements_Summary.md) | Summary requirements — đọc nhanh |
| [scope.md](architecture/00-context/scope.md) | Ranh giới scope (xem 00-context) |
| [unsupported-proposals.md](architecture/03-requirements-features/unsupported-proposals.md) | Proposal bị loại + lý do |
| [impact-analysis.md](architecture/03-requirements-features/impact-analysis.md) | Impact analysis khi thay đổi requirement/design |

### 06 — Data Model & Database
| Doc | Mô tả |
|-----|-------|
| [05_Data_Definitions_and_ERD.md](architecture/06-data-model/05_Data_Definitions_and_ERD.md) | Data definitions trước ERD và relational mapping |
| [erd.md](architecture/06-data-model/erd.md) | Conceptual/logical ERD và cardinalities |
| [entities-and-migrations.md](architecture/06-data-model/entities-and-migrations.md) | Entity purpose, schema vật lý và migration plan |
| [dictionary.md](architecture/06-data-model/dictionary.md) | Data dictionary — định nghĩa mọi trường dữ liệu |
| [data-flows.md](architecture/06-data-model/data-flows.md) | Logical data movement, stores và DFD |
| [04_Data_Flow_UML_and_Ownership.md](architecture/06-data-model/04_Data_Flow_UML_and_Ownership.md) | Data flow, system map, ownership diagram |
| [erd-workbench/](architecture/06-data-model/erd-workbench/) | MySQL Workbench ERD source files |

### 07 — API & Integration
| Doc | Mô tả |
|-----|-------|
| [06_API_Routes_and_Contracts.md](architecture/07-api/06_API_Routes_and_Contracts.md) | Route/API contract và mapping |
| [endpoints.md](architecture/07-api/endpoints.md) | REST resource và endpoint catalog đầy đủ |
| [authentication.md](architecture/07-api/authentication.md) | Sessions, JWT và authorization design |
| [integration-contract.md](architecture/07-api/integration-contract.md) | Interface contract giữa các module |
| [protocol-and-compatibility.md](architecture/07-api/protocol-and-compatibility.md) | Write protocol, compatibility và module interfaces |

### 08 — System Architecture & ADRs
| Doc | Mô tả |
|-----|-------|
| [07_Architecture_Components_and_Alternatives.md](architecture/08-architecture/07_Architecture_Components_and_Alternatives.md) | Alternatives, recommendation kiến trúc, ownership FE/BE |
| [ADR-001-modular-monolith.md](architecture/08-architecture/ADR-001-modular-monolith.md) | ADR: lý do chọn modular monolith |
| [ADR-002-storage-orm.md](architecture/08-architecture/ADR-002-storage-orm.md) | ADR: storage layer và ORM |
| [ADR-003-authentication.md](architecture/08-architecture/ADR-003-authentication.md) | ADR: chiến lược xác thực |
| [ADR-004-ocr-boundary.md](architecture/08-architecture/ADR-004-ocr-boundary.md) | ADR: ranh giới tích hợp OCR |
| [ADR-005-observability.md](architecture/08-architecture/ADR-005-observability.md) | ADR: observability, logging, monitoring |
| [components.md](architecture/08-architecture/components.md) | Catalog các module/component và interface |
| [deployment.md](architecture/08-architecture/deployment.md) | Environment, CI/CD và rollback architecture |
| [deploy.md](architecture/08-architecture/deploy.md) | Deployment checklist rút gọn |
| [analytics-monitoring.md](architecture/08-architecture/analytics-monitoring.md) | Analytics, monitoring và observability |
| [Expiry_System_Definition.md](architecture/08-architecture/Expiry_System_Definition.md) | Định nghĩa hệ thống đầy đủ |

### 10 — Testing & Verification
| Doc | Mô tả |
|-----|-------|
| [test-catalog.md](architecture/10-testing/test-catalog.md) | Test cases, E2E và coverage gates |
| [coverage.md](architecture/10-testing/coverage.md) | End-to-end artifact coverage map |
| [verification-report.md](architecture/10-testing/verification-report.md) | Kết quả verification theo từng requirement |

### 11 — Traceability
| Doc | Mô tả |
|-----|-------|
| [09_Traceability_Implementation_and_Verification.md](architecture/11-traceability/09_Traceability_Implementation_and_Verification.md) | Implementation order, risks và end-to-end traceability |
| [registry.json](architecture/11-traceability/registry.json) | Traceability registry — ID, path, status toàn bộ docs |
| [id-register.md](architecture/11-traceability/id-register.md) | Human-readable ID register |
| [tracking.md](architecture/11-traceability/tracking.md) | Task tracking và tiến độ |
| [local-source-hashes.json](architecture/11-traceability/local-source-hashes.json) | SHA-256 integrity hashes |

---

## 🧠 HCI — Human-Computer Interaction

### 01 — Personas
| Doc | Mô tả |
|-----|-------|
| [01_Research_Personas_and_Opportunities.md](architecture/01-personas/01_Research_Personas_and_Opportunities.md) | Problem definition, research synthesis và root causes |
| [P01-persona.md](architecture/01-personas/P01-persona.md) | Persona 1: Minh — The Pragmatist |
| [P02-persona.md](architecture/01-personas/P02-persona.md) | Persona 2: An — The Forgetter |
| [P03-persona.md](architecture/01-personas/P03-persona.md) | Persona 3: Lan — The Household Manager |
| [persona-comparison.md](architecture/01-personas/persona-comparison.md) | So sánh 3 personas theo JTBD và friction |
| [persona-evidence-gaps.md](architecture/01-personas/persona-evidence-gaps.md) | Evidence gaps của từng persona |
| [final-check-persona-alignment.md](architecture/01-personas/final-check-persona-alignment.md) | FINAL CHECK: source-to-persona-to-requirement |
| [10_Canva_Persona_Source.md](architecture/01-personas/10_Canva_Persona_Source.md) | Nguồn Canva persona gốc |

### 02 — Research & Evidence
| Doc | Mô tả |
|-----|-------|
| [food-expiry.md](architecture/02-challenges/food-expiry.md) | Deep research hành vi thực phẩm và expiry semantics |
| [ocr-research.md](architecture/02-challenges/ocr-research.md) | Research OCR boundary và user capture friction |
| [research-validation.md](architecture/02-challenges/research-validation.md) | Validation research theo design decisions |
| [REPORT.md](architecture/02-challenges/REPORT.md) | Research report: evidence → persona → BR traceability |
| [DEEP_RESEARCH.md](architecture/02-challenges/DEEP_RESEARCH.md) | Deep research tổng hợp — toàn bộ nguồn academic |
| [sources-requirements.md](architecture/02-challenges/sources-requirements.md) | Tổng hợp sources cho requirements |

### 04 — User Flows & Scenarios
| Doc | Mô tả |
|-----|-------|
| [03_User_Flows_Scenarios_and_Use_Cases.md](architecture/04-user-flows/03_User_Flows_Scenarios_and_Use_Cases.md) | User flows, scenarios và use cases tổng hợp |
| [user-flows.md](architecture/04-user-flows/user-flows.md) | Goals, tasks và user flows chi tiết |
| [scenarios.md](architecture/04-user-flows/scenarios.md) | Scenario engineering catalog |
| [use-cases.md](architecture/04-user-flows/use-cases.md) | Use case catalog đầy đủ |

### 05 — Interaction Design
| Doc | Mô tả |
|-----|-------|
| [08_Wireframes_and_Interaction_Spec.md](architecture/05-interaction-design/08_Wireframes_and_Interaction_Spec.md) | Low-fidelity wireframes và interaction contract |
| [navigation.md](architecture/05-interaction-design/navigation.md) | Information architecture và navigation design |
| [screen-state-matrix.md](architecture/05-interaction-design/screen-state-matrix.md) | Ma trận trạng thái màn hình theo scenario |
| [sequences.md](architecture/05-interaction-design/sequences.md) | Sequence diagrams cho key interactions |
| [diagrams.md](architecture/05-interaction-design/diagrams.md) | Tổng hợp diagrams (flow, sequence, state) |
| [expiry_wireframes.png](architecture/05-interaction-design/expiry_wireframes.png) | Wireframe ảnh — 6 màn hình mobile |

---

## 🌐 Advanced Web

### 09 — Advanced Web
| Doc | Mô tả |
|-----|-------|
| [LAYOUT.md](architecture/09-advanced-web/LAYOUT.md) | UI layout spec: CSS tokens, breakpoints, component inventory |
| [state-and-integration.md](architecture/09-advanced-web/state-and-integration.md) | Frontend state management và API integration |
| [extension-process.md](architecture/09-advanced-web/extension-process.md) | Browser extension integration process |

> **Cross-references từ Advanced Web:**  
> • API: [endpoints.md](architecture/07-api/endpoints.md) · [authentication.md](architecture/07-api/authentication.md)  
> • Testing: [test-catalog.md](architecture/10-testing/test-catalog.md) · [coverage.md](architecture/10-testing/coverage.md)  
> • NFR: [nonfunctional-requirements.md](architecture/03-requirements-features/nonfunctional-requirements.md)

---

## 📋 General — Project & Process

### 12 — Process
| Doc | Mô tả |
|-----|-------|
| [workstreams.md](architecture/12-process/workstreams.md) | Workstreams và phân chia công việc |
| [gates.md](architecture/12-process/gates.md) | Quality gates — điều kiện milestone pass/fail |
| [task-tracker.csv](architecture/12-process/task-tracker.csv) | Task tracker CSV |
| [tmb-skills.md](architecture/12-process/tmb-skills.md) | TrustMeBro skill inventory và conventions |

---

## 🔗 Consolidated / Master Docs

> Read-only — đây là file export/snapshot, không sửa trực tiếp.

| Doc | Mô tả |
|-----|-------|
| [Expiry_Complete_System_Design_2026-10-08.md](architecture/consolidated/Expiry_Complete_System_Design_2026-10-08.md) | Full system design export — 2026-10-08 |
| [Expiry_Complete_System_Design_2026-10-08.pdf](architecture/consolidated/Expiry_Complete_System_Design_2026-10-08.pdf) | PDF version of system design |
| [Expiry_Full_Data_Extraction_2026-10-09.md](architecture/consolidated/Expiry_Full_Data_Extraction_2026-10-09.md) | Full corpus extraction — 2026-10-09 |
| [google-doc-final-check-2026-10-10.md](architecture/consolidated/google-doc-final-check-2026-10-10.md) | Google Doc FINAL CHECK readback — 2026-10-10 |
| [Slide System Engineering.pdf](architecture/consolidated/Slide%20System%20Engineering.pdf) | Slide trình bày System Engineering |

---

## ⚙️ Tooling & Meta

| File | Mô tả |
|------|-------|
| [validate_architecture.py](architecture/tooling/validate_architecture.py) | Script validate structural documentation/graph |
| [check_diagrams.mjs](architecture/tooling/check_diagrams.mjs) | Script kiểm tra diagram syntax |
| [mermaid-parser-results.json](architecture/tooling/mermaid-parser-results.json) | Kết quả parse mermaid diagrams |
| [drive-discovery.json](architecture/tooling/drive-discovery.json) | Google Drive discovery manifest |
| [python-package-metadata.json](architecture/tooling/python-package-metadata.json) | Python dependency metadata |

---

## 📊 Cross-Reference: Tài liệu theo chủ đề

| Chủ đề | System Engineering | HCI | Advanced Web |
|--------|--------------------|-----|--------------|
| Requirements | [business-requirements.md](architecture/03-requirements-features/business-requirements.md) · [nonfunctional-requirements.md](architecture/03-requirements-features/nonfunctional-requirements.md) | [features.md](architecture/03-requirements-features/features.md) | [nonfunctional-requirements.md](architecture/03-requirements-features/nonfunctional-requirements.md) |
| Data | [erd.md](architecture/06-data-model/erd.md) · [entities-and-migrations.md](architecture/06-data-model/entities-and-migrations.md) | [data-flows.md](architecture/06-data-model/data-flows.md) | [state-and-integration.md](architecture/09-advanced-web/state-and-integration.md) |
| Users | [stakeholder-requirements.md](architecture/03-requirements-features/stakeholder-requirements.md) | [P01-persona.md](architecture/01-personas/P01-persona.md) · [P02-persona.md](architecture/01-personas/P02-persona.md) · [P03-persona.md](architecture/01-personas/P03-persona.md) | [navigation.md](architecture/05-interaction-design/navigation.md) |
| Architecture | [07_Architecture_Components.md](architecture/08-architecture/07_Architecture_Components_and_Alternatives.md) · [ADR-001](architecture/08-architecture/ADR-001-modular-monolith.md) | [wireframes](architecture/05-interaction-design/08_Wireframes_and_Interaction_Spec.md) | [LAYOUT.md](architecture/09-advanced-web/LAYOUT.md) |
| Testing | [verification-report.md](architecture/10-testing/verification-report.md) · [coverage.md](architecture/10-testing/coverage.md) | [research-validation.md](architecture/02-challenges/research-validation.md) | [test-catalog.md](architecture/10-testing/test-catalog.md) |
| API | [endpoints.md](architecture/07-api/endpoints.md) · [authentication.md](architecture/07-api/authentication.md) | — | [06_API_Routes_and_Contracts.md](architecture/07-api/06_API_Routes_and_Contracts.md) |
| Deployment | [deployment.md](architecture/08-architecture/deployment.md) · [ADR-005](architecture/08-architecture/ADR-005-observability.md) | — | [protocol-and-compatibility.md](architecture/07-api/protocol-and-compatibility.md) |

---

> **Source of truth IDs:** [`architecture/11-traceability/registry.json`](architecture/11-traceability/registry.json)  
> **Root project layout:** [`../LAYOUT.md`](../LAYOUT.md)  
> **TMB conventions:** [`architecture/12-process/tmb-skills.md`](architecture/12-process/tmb-skills.md)
