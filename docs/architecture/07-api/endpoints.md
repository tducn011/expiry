# DOC-API — REST resource and endpoint catalog

- Document ID: `DOC-API`
- Status: **Review**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

Every endpoint linked to goal, ownership, inputs/results/data and tests.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

### API-01 — POST /api/v1/food-entries

| Attribute | Contract |
|---|---|
| Purpose / actor | CreateEntry for inventory owner |
| Related UC | UC-01 |
| Related flows | UF-01, UF-02 |
| Request | EntryCreate + key |
| Response | 201 Entry, Location |
| Schemas / validation | Exact reference: [OpenAPI 3.1.1 review contract](../../../Expiry_System_Design_2026-10-08/contracts/openapi.json) |
| Authorization | Principal identity; every ID scoped to owner including movements/trash; foreign/missing404 |
| Business rule definitions | [03-requirements-features/business-rules.md](../03-requirements-features/business-rules.md) |
| DB operations | entries C, movements C, requests C/U |
| Service/HTTP role | CreateEntry; controller maps validated DTO to service, no duplicate policy |
| Error codes | 400/401/404/409/413/415/422/429/500; specific codes linked by protocol |
| Required tests | VT-01, VT-02, VT-14 |

### API-02 — GET /api/v1/food-entries

| Attribute | Contract |
|---|---|
| Purpose / actor | ReviewInventory for inventory owner |
| Related UC | UC-02, UC-03 |
| Related flows | UF-03, UF-04 |
| Request | q/location/view/lifecycle/attention/page/limit |
| Response | 200 EntryList |
| Schemas / validation | Exact reference: [OpenAPI 3.1.1 review contract](../../../Expiry_System_Design_2026-10-08/contracts/openapi.json) |
| Authorization | Principal identity; every ID scoped to owner including movements/trash; foreign/missing404 |
| Business rule definitions | [03-requirements-features/business-rules.md](../03-requirements-features/business-rules.md) |
| DB operations | users/entries R |
| Service/HTTP role | ReviewInventory; controller maps validated DTO to service, no duplicate policy |
| Error codes | 400/401/404/409/413/415/422/429/500; specific codes linked by protocol |
| Required tests | TC-18, TC-19, VT-12 |

### API-03 — GET /api/v1/food-entries/{id}

| Attribute | Contract |
|---|---|
| Purpose / actor | GetEntry for inventory owner |
| Related UC | UC-03 |
| Related flows | UF-03, UF-04 |
| Request | UUID |
| Response | 200 Entry |
| Schemas / validation | Exact reference: [OpenAPI 3.1.1 review contract](../../../Expiry_System_Design_2026-10-08/contracts/openapi.json) |
| Authorization | Principal identity; every ID scoped to owner including movements/trash; foreign/missing404 |
| Business rule definitions | [03-requirements-features/business-rules.md](../03-requirements-features/business-rules.md) |
| DB operations | users/entries R |
| Service/HTTP role | GetEntry; controller maps validated DTO to service, no duplicate policy |
| Error codes | 400/401/404/409/413/415/422/429/500; specific codes linked by protocol |
| Required tests | TC-19, VT-12 |

### API-04 — PATCH /api/v1/food-entries/{id}

| Attribute | Contract |
|---|---|
| Purpose / actor | EditEntry for inventory owner |
| Related UC | UC-06 |
| Related flows | UF-08 |
| Request | MetadataPatch + expected_version + key |
| Response | 200 Entry |
| Schemas / validation | Exact reference: [OpenAPI 3.1.1 review contract](../../../Expiry_System_Design_2026-10-08/contracts/openapi.json) |
| Authorization | Principal identity; every ID scoped to owner including movements/trash; foreign/missing404 |
| Business rule definitions | [03-requirements-features/business-rules.md](../03-requirements-features/business-rules.md) |
| DB operations | entries U, requests C/U |
| Service/HTTP role | EditEntry; controller maps validated DTO to service, no duplicate policy |
| Error codes | 400/401/404/409/413/415/422/429/500; specific codes linked by protocol |
| Required tests | VT-14, VT-15, VT-12 |

### API-05 — POST /api/v1/food-entries/{id}/movements

| Attribute | Contract |
|---|---|
| Purpose / actor | RecordMovement for inventory owner |
| Related UC | UC-04, UC-05 |
| Related flows | UF-04, UF-05, UF-06 |
| Request | consume/discard, amount, expected_version, reason? + key |
| Response | 201 MutationResult |
| Schemas / validation | Exact reference: [OpenAPI 3.1.1 review contract](../../../Expiry_System_Design_2026-10-08/contracts/openapi.json) |
| Authorization | Principal identity; every ID scoped to owner including movements/trash; foreign/missing404 |
| Business rule definitions | [03-requirements-features/business-rules.md](../03-requirements-features/business-rules.md) |
| DB operations | entries U, movements C, requests C/U |
| Service/HTTP role | RecordMovement; controller maps validated DTO to service, no duplicate policy |
| Error codes | 400/401/404/409/413/415/422/429/500; specific codes linked by protocol |
| Required tests | VT-03, VT-04, VT-05, VT-06, VT-07, VT-10, VT-12 |

### API-06 — POST /api/v1/food-entries/{id}/recounts

| Attribute | Contract |
|---|---|
| Purpose / actor | RecountEntry for inventory owner |
| Related UC | UC-07 |
| Related flows | UF-07 |
| Request | actual_quantity, reason, expected_version + key |
| Response | 201 MutationResult; 200 no-op |
| Schemas / validation | Exact reference: [OpenAPI 3.1.1 review contract](../../../Expiry_System_Design_2026-10-08/contracts/openapi.json) |
| Authorization | Principal identity; every ID scoped to owner including movements/trash; foreign/missing404 |
| Business rule definitions | [03-requirements-features/business-rules.md](../03-requirements-features/business-rules.md) |
| DB operations | entries U, movements C or no-op, requests C/U |
| Service/HTTP role | RecountEntry; controller maps validated DTO to service, no duplicate policy |
| Error codes | 400/401/404/409/413/415/422/429/500; specific codes linked by protocol |
| Required tests | VT-08, VT-09, VT-12 |

### API-07 — GET /api/v1/food-entries/{id}/movements

| Attribute | Contract |
|---|---|
| Purpose / actor | ReadHistory for inventory owner |
| Related UC | UC-08 |
| Related flows | UF-07 |
| Request | page/limit |
| Response | 200 MovementList |
| Schemas / validation | Exact reference: [OpenAPI 3.1.1 review contract](../../../Expiry_System_Design_2026-10-08/contracts/openapi.json) |
| Authorization | Principal identity; every ID scoped to owner including movements/trash; foreign/missing404 |
| Business rule definitions | [03-requirements-features/business-rules.md](../03-requirements-features/business-rules.md) |
| DB operations | entries owner check/movements R |
| Service/HTTP role | ReadHistory; controller maps validated DTO to service, no duplicate policy |
| Error codes | 400/401/404/409/413/415/422/429/500; specific codes linked by protocol |
| Required tests | VT-10, VT-12 |

### API-08 — DELETE /api/v1/food-entries/{id}

| Attribute | Contract |
|---|---|
| Purpose / actor | RemoveEntry for inventory owner |
| Related UC | UC-09 |
| Related flows | UF-09 |
| Request | expected_version in query + key |
| Response | 204 |
| Schemas / validation | Exact reference: [OpenAPI 3.1.1 review contract](../../../Expiry_System_Design_2026-10-08/contracts/openapi.json) |
| Authorization | Principal identity; every ID scoped to owner including movements/trash; foreign/missing404 |
| Business rule definitions | [03-requirements-features/business-rules.md](../03-requirements-features/business-rules.md) |
| DB operations | entries U, requests C/U |
| Service/HTTP role | RemoveEntry; controller maps validated DTO to service, no duplicate policy |
| Error codes | 400/401/404/409/413/415/422/429/500; specific codes linked by protocol |
| Required tests | VT-11, VT-12 |

### API-09 — GET /api/v1/trash/food-entries

| Attribute | Contract |
|---|---|
| Purpose / actor | ReviewTrash for inventory owner |
| Related UC | UC-09, UC-10 |
| Related flows | UF-09 |
| Request | page/limit |
| Response | 200 EntryList (deleted entries) |
| Schemas / validation | Exact reference: [OpenAPI 3.1.1 review contract](../../../Expiry_System_Design_2026-10-08/contracts/openapi.json) |
| Authorization | Principal identity; every ID scoped to owner including movements/trash; foreign/missing404 |
| Business rule definitions | [03-requirements-features/business-rules.md](../03-requirements-features/business-rules.md) |
| DB operations | entries/users R |
| Service/HTTP role | ReviewTrash; controller maps validated DTO to service, no duplicate policy |
| Error codes | 400/401/404/409/413/415/422/429/500; specific codes linked by protocol |
| Required tests | VT-11, VT-12 |

### API-10 — POST /api/v1/food-entries/{id}/restore

| Attribute | Contract |
|---|---|
| Purpose / actor | RestoreEntry for inventory owner |
| Related UC | UC-10 |
| Related flows | UF-09 |
| Request | expected_version + key |
| Response | 200 Entry |
| Schemas / validation | Exact reference: [OpenAPI 3.1.1 review contract](../../../Expiry_System_Design_2026-10-08/contracts/openapi.json) |
| Authorization | Principal identity; every ID scoped to owner including movements/trash; foreign/missing404 |
| Business rule definitions | [03-requirements-features/business-rules.md](../03-requirements-features/business-rules.md) |
| DB operations | entries U, requests C/U |
| Service/HTTP role | RestoreEntry; controller maps validated DTO to service, no duplicate policy |
| Error codes | 400/401/404/409/413/415/422/429/500; specific codes linked by protocol |
| Required tests | VT-11, VT-12 |

### API-11 — GET /api/v1/me/preferences

| Attribute | Contract |
|---|---|
| Purpose / actor | ReadPreferences for inventory owner |
| Related UC | UC-11 |
| Related flows | UF-10 |
| Request | none |
| Response | 200 Preferences |
| Schemas / validation | Exact reference: [OpenAPI 3.1.1 review contract](../../../Expiry_System_Design_2026-10-08/contracts/openapi.json) |
| Authorization | Principal identity; every ID scoped to owner including movements/trash; foreign/missing404 |
| Business rule definitions | [03-requirements-features/business-rules.md](../03-requirements-features/business-rules.md) |
| DB operations | users R |
| Service/HTTP role | ReadPreferences; controller maps validated DTO to service, no duplicate policy |
| Error codes | 400/401/404/409/413/415/422/429/500; specific codes linked by protocol |
| Required tests | TC-20, VT-12 |

### API-12 — PATCH /api/v1/me/preferences

| Attribute | Contract |
|---|---|
| Purpose / actor | EditPreferences for inventory owner |
| Related UC | UC-11 |
| Related flows | UF-10 |
| Request | expected_version, timezone?/attention_lead_days? + key |
| Response | 200 Preferences |
| Schemas / validation | Exact reference: [OpenAPI 3.1.1 review contract](../../../Expiry_System_Design_2026-10-08/contracts/openapi.json) |
| Authorization | Principal identity; every ID scoped to owner including movements/trash; foreign/missing404 |
| Business rule definitions | [03-requirements-features/business-rules.md](../03-requirements-features/business-rules.md) |
| DB operations | users U, requests C/U |
| Service/HTTP role | EditPreferences; controller maps validated DTO to service, no duplicate policy |
| Error codes | 400/401/404/409/413/415/422/429/500; specific codes linked by protocol |
| Required tests | VT-13, TC-20, VT-12 |

OpenAPI remains the single machine-readable DTO source, version 0.1.0. The `/api/v1` server prefix is distinct from relative operation paths. Current bearer security scheme is an auth example, not approved transport. A cookie-session selection must update scheme/FE adapter and auth tests together before integration.

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [15-backend-api/protocol-and-compatibility.md](protocol-and-compatibility.md)
- [03-requirements-features/business-rules.md](../03-requirements-features/business-rules.md)
- [10-testing/test-catalog.md](../10-testing/test-catalog.md)

## Open questions

Chốt các quyết định liên quan trong decision ledger trước khi đổi contract hoặc triển khai.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](../11-traceability/README.md)
- [07-api/protocol-and-compatibility.md](protocol-and-compatibility.md)
- [03-requirements-features/business-rules.md](../03-requirements-features/business-rules.md)
- [10-testing/test-catalog.md](../10-testing/test-catalog.md)

## Verification criteria

Đối chiếu nguồn, ID và downstream links; acceptance runtime chỉ được ghi pass sau khi thực chạy.
