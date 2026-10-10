# DOC-UF — Goals, tasks and user flows

- Document ID: `DOC-UF`
- Status: **Review**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

11 complete task flows; dependency order means goals before screens.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

### UF-01 — Ghi đồ mới trước khi quên

| Attribute | Proposed interaction contract |
|---|---|
| Persona | P1/P3 |
| Use case | UC-01 |
| Entry point / task path | WF-01→Add→WF-02→Save→WF-03 |
| Goal/subgoals | Inspect context → choose/enter data → confirm → observe feedback; read-only flow stops at informed decision |
| Required data | Route DTO + form/current record/settings, identified in flow-to-data matrix |
| Actions/system response | WF-01→Add→WF-02→Save→WF-03; result: Entry đã lưu, initial movement, xuất hiện trong inventory |
| Validation | Schema/form UX + server owner/version/domain checks; exact rules are canonical |
| Decision/branches | Unknown date allowed; invalid fields stay draft; session/private boundary invokes UC-00 |
| Failure/recovery | 422 fix draft; 409 refetch before new command; uncertain result retry same key/payload |
| Exit/success | Entry đã lưu, initial movement, xuất hiện trong inventory |
| Cancel/back | Return without mutation; preserve originating list or unsaved draft by navigation contract |

### UF-02 — Không bỏ việc theo dõi chỉ vì thiếu nhãn

| Attribute | Proposed interaction contract |
|---|---|
| Persona | P1/P2 |
| Use case | UC-01 |
| Entry point / task path | WF-02→chọn Không biết hạn→Save→WF-03 |
| Goal/subgoals | Inspect context → choose/enter data → confirm → observe feedback; read-only flow stops at informed decision |
| Required data | Route DTO + form/current record/settings, identified in flow-to-data matrix |
| Actions/system response | WF-02→chọn Không biết hạn→Save→WF-03; result: Date null, unknown visible; không fake date |
| Validation | Schema/form UX + server owner/version/domain checks; exact rules are canonical |
| Decision/branches | Unknown date allowed; invalid fields stay draft; session/private boundary invokes UC-00 |
| Failure/recovery | 422 fix draft; 409 refetch before new command; uncertain result retry same key/payload |
| Exit/success | Date null, unknown visible; không fake date |
| Cancel/back | Return without mutation; preserve originating list or unsaved draft by navigation contract |

### UF-03 — Nhớ được món cần xem

| Attribute | Proposed interaction contract |
|---|---|
| Persona | P1 |
| Use case | UC-02, UC-03 |
| Entry point / task path | WF-01→attention group→item→WF-03 |
| Goal/subgoals | Inspect context → choose/enter data → confirm → observe feedback; read-only flow stops at informed decision |
| Required data | Route DTO + form/current record/settings, identified in flow-to-data matrix |
| Actions/system response | WF-01→attention group→item→WF-03; result: User thấy amount/location/reason; chưa claim food used |
| Validation | Schema/form UX + server owner/version/domain checks; exact rules are canonical |
| Decision/branches | Unknown date allowed; invalid fields stay draft; session/private boundary invokes UC-00 |
| Failure/recovery | 422 fix draft; 409 refetch before new command; uncertain result retry same key/payload |
| Exit/success | User thấy amount/location/reason; chưa claim food used |
| Cancel/back | Return without mutation; preserve originating list or unsaved draft by navigation contract |

### UF-04 — Chọn món đáng chú ý từ đồ đang có

| Attribute | Proposed interaction contract |
|---|---|
| Persona | P2 |
| Use case | UC-03, UC-04 |
| Entry point / task path | WF-01→location/filter→item→WF-03→action→WF-04→confirm |
| Goal/subgoals | Inspect context → choose/enter data → confirm → observe feedback; read-only flow stops at informed decision |
| Required data | Route DTO + form/current record/settings, identified in flow-to-data matrix |
| Actions/system response | WF-01→location/filter→item→WF-03→action→WF-04→confirm; result: User tự chọn action; hệ thống ghi kết quả |
| Validation | Schema/form UX + server owner/version/domain checks; exact rules are canonical |
| Decision/branches | Unknown date allowed; invalid fields stay draft; session/private boundary invokes UC-00 |
| Failure/recovery | 422 fix draft; 409 refetch before new command; uncertain result retry same key/payload |
| Exit/success | User tự chọn action; hệ thống ghi kết quả |
| Cancel/back | Return without mutation; preserve originating list or unsaved draft by navigation contract |

### UF-05 — Số lượng app đúng sau dùng

| Attribute | Proposed interaction contract |
|---|---|
| Persona | All |
| Use case | UC-04 |
| Entry point / task path | WF-03→Use→WF-04 amount→confirm→WF-03 |
| Goal/subgoals | Inspect context → choose/enter data → confirm → observe feedback; read-only flow stops at informed decision |
| Required data | Route DTO + form/current record/settings, identified in flow-to-data matrix |
| Actions/system response | WF-03→Use→WF-04 amount→confirm→WF-03; result: Remaining giảm đúng; history tạo 1 lần |
| Validation | Schema/form UX + server owner/version/domain checks; exact rules are canonical |
| Decision/branches | Unknown date allowed; invalid fields stay draft; session/private boundary invokes UC-00 |
| Failure/recovery | 422 fix draft; 409 refetch before new command; uncertain result retry same key/payload |
| Exit/success | Remaining giảm đúng; history tạo 1 lần |
| Cancel/back | Return without mutation; preserve originating list or unsaved draft by navigation contract |

### UF-06 — Phản ánh đồ thật đã bỏ

| Attribute | Proposed interaction contract |
|---|---|
| Persona | All |
| Use case | UC-05 |
| Entry point / task path | WF-03→Discard→WF-04 amount→confirm→WF-03 |
| Goal/subgoals | Inspect context → choose/enter data → confirm → observe feedback; read-only flow stops at informed decision |
| Required data | Route DTO + form/current record/settings, identified in flow-to-data matrix |
| Actions/system response | WF-03→Discard→WF-04 amount→confirm→WF-03; result: Remaining giảm; discard history; zero→depleted |
| Validation | Schema/form UX + server owner/version/domain checks; exact rules are canonical |
| Decision/branches | Unknown date allowed; invalid fields stay draft; session/private boundary invokes UC-00 |
| Failure/recovery | 422 fix draft; 409 refetch before new command; uncertain result retry same key/payload |
| Exit/success | Remaining giảm; discard history; zero→depleted |
| Cancel/back | Return without mutation; preserve originating list or unsaved draft by navigation contract |

### UF-07 — Sửa số lượng lệch nhanh

| Attribute | Proposed interaction contract |
|---|---|
| Persona | P3/P2 |
| Use case | UC-07, UC-08 |
| Entry point / task path | WF-03→Recount→WF-04 actual+reason→confirm→WF-03→history |
| Goal/subgoals | Inspect context → choose/enter data → confirm → observe feedback; read-only flow stops at informed decision |
| Required data | Route DTO + form/current record/settings, identified in flow-to-data matrix |
| Actions/system response | WF-03→Recount→WF-04 actual+reason→confirm→WF-03→history; result: Amount đúng và correction traceable |
| Validation | Schema/form UX + server owner/version/domain checks; exact rules are canonical |
| Decision/branches | Unknown date allowed; invalid fields stay draft; session/private boundary invokes UC-00 |
| Failure/recovery | 422 fix draft; 409 refetch before new command; uncertain result retry same key/payload |
| Exit/success | Amount đúng và correction traceable |
| Cancel/back | Return without mutation; preserve originating list or unsaved draft by navigation contract |

### UF-08 — Sửa ngày/vị trí nguồn nhập sai

| Attribute | Proposed interaction contract |
|---|---|
| Persona | P3/P2 |
| Use case | UC-06 |
| Entry point / task path | WF-03→Edit→WF-02→Save→WF-03 |
| Goal/subgoals | Inspect context → choose/enter data → confirm → observe feedback; read-only flow stops at informed decision |
| Required data | Route DTO + form/current record/settings, identified in flow-to-data matrix |
| Actions/system response | WF-03→Edit→WF-02→Save→WF-03; result: Version tăng; attention recomputed |
| Validation | Schema/form UX + server owner/version/domain checks; exact rules are canonical |
| Decision/branches | Unknown date allowed; invalid fields stay draft; session/private boundary invokes UC-00 |
| Failure/recovery | 422 fix draft; 409 refetch before new command; uncertain result retry same key/payload |
| Exit/success | Version tăng; attention recomputed |
| Cancel/back | Return without mutation; preserve originating list or unsaved draft by navigation contract |

### UF-09 — Dọn bản ghi nhầm, lấy lại khi xóa sai

| Attribute | Proposed interaction contract |
|---|---|
| Persona | P3 |
| Use case | UC-09, UC-10 |
| Entry point / task path | WF-03→Remove record→confirm→WF-05 trash→Restore→WF-03 |
| Goal/subgoals | Inspect context → choose/enter data → confirm → observe feedback; read-only flow stops at informed decision |
| Required data | Route DTO + form/current record/settings, identified in flow-to-data matrix |
| Actions/system response | WF-03→Remove record→confirm→WF-05 trash→Restore→WF-03; result: Quantity/history không đổi bởi delete/restore |
| Validation | Schema/form UX + server owner/version/domain checks; exact rules are canonical |
| Decision/branches | Unknown date allowed; invalid fields stay draft; session/private boundary invokes UC-00 |
| Failure/recovery | 422 fix draft; 409 refetch before new command; uncertain result retry same key/payload |
| Exit/success | Quantity/history không đổi bởi delete/restore |
| Cancel/back | Return without mutation; preserve originating list or unsaved draft by navigation contract |

### UF-10 — Điều chỉnh cách chú ý

| Attribute | Proposed interaction contract |
|---|---|
| Persona | All |
| Use case | UC-11 |
| Entry point / task path | WF-01→Settings→WF-06→Save→WF-01 |
| Goal/subgoals | Inspect context → choose/enter data → confirm → observe feedback; read-only flow stops at informed decision |
| Required data | Route DTO + form/current record/settings, identified in flow-to-data matrix |
| Actions/system response | WF-01→Settings→WF-06→Save→WF-01; result: Lead/timezone cập nhật; list có as_of_date mới |
| Validation | Schema/form UX + server owner/version/domain checks; exact rules are canonical |
| Decision/branches | Unknown date allowed; invalid fields stay draft; session/private boundary invokes UC-00 |
| Failure/recovery | 422 fix draft; 409 refetch before new command; uncertain result retry same key/payload |
| Exit/success | Lead/timezone cập nhật; list có as_of_date mới |
| Cancel/back | Return without mutation; preserve originating list or unsaved draft by navigation contract |

### UF-11 — Không mất draft khi auth hết hạn

| Attribute | Proposed interaction contract |
|---|---|
| Persona | All |
| Use case | UC-00 |
| Entry point / task path | WF-02/04→Save→401→auth→resume cùng draft→Save |
| Goal/subgoals | Inspect context → choose/enter data → confirm → observe feedback; read-only flow stops at informed decision |
| Required data | Route DTO + form/current record/settings, identified in flow-to-data matrix |
| Actions/system response | WF-02/04→Save→401→auth→resume cùng draft→Save; result: Không trừ quantity trước khi server success |
| Validation | Schema/form UX + server owner/version/domain checks; exact rules are canonical |
| Decision/branches | Unknown date allowed; invalid fields stay draft; session/private boundary invokes UC-00 |
| Failure/recovery | 422 fix draft; 409 refetch before new command; uncertain result retry same key/payload |
| Exit/success | Không trừ quantity trước khi server success |
| Cancel/back | Return without mutation; preserve originating list or unsaved draft by navigation contract |

Task decomposition: CF-01 needs draft + identity continuation + create + confirmed saved record. CF-02 depends on owner/settings/read policy, does not write records. CF-03 depends on selected entry/current version + confirmed physical action + atomic mutation + cache refresh. Parallel UI design may use fixtures once the proposed contract is reviewed; it does not create a second business truth.

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [06-navigation/navigation.md](../06-navigation/navigation.md)
- [05-use-cases-uml/use-cases.md](../05-use-cases-uml/use-cases.md)
- [06-data-model/data-flows.md](../06-data-model/data-flows.md)

## Open questions

Chốt các quyết định liên quan trong decision ledger trước khi đổi contract hoặc triển khai.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](../11-traceability/README.md)
- [06-navigation/navigation.md](../06-navigation/navigation.md)
- [05-use-cases-uml/use-cases.md](../05-use-cases-uml/use-cases.md)
- [06-data-model/data-flows.md](../06-data-model/data-flows.md)

## Verification criteria

Đối chiếu nguồn, ID và downstream links; acceptance runtime chỉ được ghi pass sau khi thực chạy.
