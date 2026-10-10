# DOC-FEATURES — Feature catalog and coverage

- Document ID: `DOC-FEATURES`
- Status: **Review**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

Coherent product capabilities justified by draft requirements.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

### F-01 — Quick manual capture

| Attribute | Review specification |
|---|---|
| Problem | Fewer forgotten records / capture effort |
| Source requirements | FR-01 |
| Target | Inventory owner; personas follow NEED-01, NEED-03 |
| Trigger | New purchase before storage |
| User goal | Entry + initial movement |
| Inputs | Name/quantity/unit + optional date context |
| Business rules | [03-requirements-features/business-rules.md](business-rules.md); rules selected by corresponding UC |
| Outputs | Entry + initial movement |
| Failure states | 422/auth/timeout |
| Data dependencies | EntryCreate; dictionary and entity register |
| Acceptance cases | VT-01, VT-02 |
| Priority | Core/support within proposed MVP |
| Scope status | MVP review; not approval of completed implementation |

### F-02 — Inventory and explained attention

| Attribute | Review specification |
|---|---|
| Problem | Out-of-sight food and decision context |
| Source requirements | FR-02, FR-03 |
| Target | Inventory owner; personas follow NEED-01, NEED-02 |
| Trigger | Meal/shopping review |
| User goal | Owned list + reason/as_of_date |
| Inputs | Query/settings + active entries |
| Business rules | [03-requirements-features/business-rules.md](business-rules.md); rules selected by corresponding UC |
| Outputs | Owned list + reason/as_of_date |
| Failure states | Empty/filter/network/session |
| Data dependencies | EntryList/Attention; dictionary and entity register |
| Acceptance cases | TC-18, TC-19, VT-13 |
| Priority | Core/support within proposed MVP |
| Scope status | MVP review; not approval of completed implementation |

### F-03 — Food detail / provenance

| Attribute | Review specification |
|---|---|
| Problem | Uncertain date information |
| Source requirements | FR-03 |
| Target | Inventory owner; personas follow NEED-02 |
| Trigger | Select item needing attention |
| User goal | Quantity/location/date source/certainty/label |
| Inputs | Entry identity |
| Business rules | [03-requirements-features/business-rules.md](business-rules.md); rules selected by corresponding UC |
| Outputs | Quantity/location/date source/certainty/label |
| Failure states | 404/read failure |
| Data dependencies | Entry; dictionary and entity register |
| Acceptance cases | TC-19 |
| Priority | Core/support within proposed MVP |
| Scope status | MVP review; not approval of completed implementation |

### F-04 — Record consume or discard

| Attribute | Review specification |
|---|---|
| Problem | Physical quantity changes leave records stale |
| Source requirements | FR-04 |
| Target | Inventory owner; personas follow NEED-03 |
| Trigger | Confirmed use or disposal |
| User goal | Updated entry + movement |
| Inputs | Amount/kind/version/key |
| Business rules | [03-requirements-features/business-rules.md](business-rules.md); rules selected by corresponding UC |
| Outputs | Updated entry + movement |
| Failure states | 422/insufficient409/version409/timeout |
| Data dependencies | MovementCommand/MutationResult; dictionary and entity register |
| Acceptance cases | VT-03…07, VT-10 |
| Priority | Core/support within proposed MVP |
| Scope status | MVP review; not approval of completed implementation |

### F-05 — Metadata edit and recount

| Attribute | Review specification |
|---|---|
| Problem | Incorrect metadata/quantity |
| Source requirements | FR-05, FR-06 |
| Target | Inventory owner; personas follow NEED-02, NEED-03 |
| Trigger | Physical review reveals discrepancy |
| User goal | Corrected entry + adjustment if amount changes |
| Inputs | Metadata patch or actual quantity/reason/version/key |
| Business rules | [03-requirements-features/business-rules.md](business-rules.md); rules selected by corresponding UC |
| Outputs | Corrected entry + adjustment if amount changes |
| Failure states | Merged-metadata422/version409/no-op |
| Data dependencies | EntryPatch/RecountCommand; dictionary and entity register |
| Acceptance cases | VT-08, VT-09, VT-14 |
| Priority | Core/support within proposed MVP |
| Scope status | MVP review; not approval of completed implementation |

### F-06 — Read-only movement history

| Attribute | Review specification |
|---|---|
| Problem | Loss of trust after corrections |
| Source requirements | FR-07 |
| Target | Inventory owner; personas follow NEED-03 |
| Trigger | Review record changes |
| User goal | Before/after/reason/time timeline |
| Inputs | Owned entry/page |
| Business rules | [03-requirements-features/business-rules.md](business-rules.md); rules selected by corresponding UC |
| Outputs | Before/after/reason/time timeline |
| Failure states | 404/empty/read failure |
| Data dependencies | MovementList; dictionary and entity register |
| Acceptance cases | VT-10, VT-12 |
| Priority | Core/support within proposed MVP |
| Scope status | MVP review; not approval of completed implementation |

### F-07 — Trash and restore

| Attribute | Review specification |
|---|---|
| Problem | Accidental record removal |
| Source requirements | FR-08 |
| Target | Inventory owner; personas follow NEED-03 |
| Trigger | Remove or recover erroneous record |
| User goal | Visibility changed; physical quantity preserved |
| Inputs | Entry/version/key |
| Business rules | [03-requirements-features/business-rules.md](business-rules.md); rules selected by corresponding UC |
| Outputs | Visibility changed; physical quantity preserved |
| Failure states | 404/conflict/timeout |
| Data dependencies | EntryList/VersionCommand; dictionary and entity register |
| Acceptance cases | VT-11 |
| Priority | Core/support within proposed MVP |
| Scope status | MVP review; not approval of completed implementation |

### F-08 — Attention preferences

| Attribute | Review specification |
|---|---|
| Problem | Timing/context variation |
| Source requirements | FR-09 |
| Target | Inventory owner; personas follow NEED-01, NEED-02 |
| Trigger | Adjust attention lead/timezone |
| User goal | Settings + recomputed attention |
| Inputs | Preferences patch/version/key |
| Business rules | [03-requirements-features/business-rules.md](business-rules.md); rules selected by corresponding UC |
| Outputs | Settings + recomputed attention |
| Failure states | 422/version409 |
| Data dependencies | Preferences/PreferencesPatch; dictionary and entity register |
| Acceptance cases | VT-13, TC-20 |
| Priority | Core/support within proposed MVP |
| Scope status | MVP review; not approval of completed implementation |

Auth continuation FR-10 is a supporting boundary across features, not renamed F-09: handoff uses F-09 but original canonical catalog has F-01…08. Capture/read/action are CF-01/02/03 rather than competing feature IDs.

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [03-requirements-features/system-requirements.md](system-requirements.md)
- [03-requirements-features/business-rules.md](business-rules.md)
- [05-use-cases-uml/use-cases.md](../05-use-cases-uml/use-cases.md)
- [11-traceability/coverage.md](../11-traceability/coverage.md)

## Open questions

Chốt các quyết định liên quan trong decision ledger trước khi đổi contract hoặc triển khai.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](../11-traceability/README.md)
- [03-requirements-features/system-requirements.md](system-requirements.md)
- [03-requirements-features/business-rules.md](business-rules.md)
- [05-use-cases-uml/use-cases.md](../05-use-cases-uml/use-cases.md)
- [11-traceability/coverage.md](../11-traceability/coverage.md)

## Verification criteria

Đối chiếu nguồn, ID và downstream links; acceptance runtime chỉ được ghi pass sau khi thực chạy.
