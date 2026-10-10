# DOC-SCENARIOS — Scenario engineering catalog

- Document ID: `DOC-SCENARIOS`
- Status: **Review**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

15 concrete test situations derived from persona mechanisms; not field-study observations.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)

## Definitions and assumptions

[C/D] Scenario contexts are design/test constructions. Persona mechanism is card evidence; outcome not usability-validated.

## Analysis

### SC-01

| Aspect | Scenario specification [C/D] |
|---|---|
| Persona/context | An cất 2 hộp sữa cùng hạn, muốn ghi trước khi quên |
| Trigger | An cất 2 hộp sữa cùng hạn, muốn ghi trước khi quên |
| Goal | Capture nhanh |
| Start | Owned entry/current version; SC-13 deliberately tests foreign ownership; SC-01/02 start at capture |
| Actions | UF-01/UC-01 — follow referenced UC/UF ordered actions |
| System response | Một entry quantity 2 piece |
| Successful outcome | Một entry quantity 2 piece |
| Alternative outcome | Unknown date/no-op/empty state follows applicable rule, no inferred safety |
| Failure outcome | Validation, conflict, auth or transport failure must not silently mutate twice |
| Recovery | 422 fix retained draft; 409 refetch/compare; timeout preserve command key; auth continuation retains draft |
| Required data | Dictionary + route contract for UF-01/UC-01 |

### SC-02

| Aspect | Scenario specification [C/D] |
|---|---|
| Persona/context | An có rau không thấy nhãn ngày |
| Trigger | An có rau không thấy nhãn ngày |
| Goal | Vẫn theo dõi được |
| Start | Owned entry/current version; SC-13 deliberately tests foreign ownership; SC-01/02 start at capture |
| Actions | UF-02/UC-01 — follow referenced UC/UF ordered actions |
| System response | unknown date; không bị chặn |
| Successful outcome | unknown date; không bị chặn |
| Alternative outcome | Unknown date/no-op/empty state follows applicable rule, no inferred safety |
| Failure outcome | Validation, conflict, auth or transport failure must not silently mutate twice |
| Recovery | 422 fix retained draft; 409 refetch/compare; timeout preserve command key; auth continuation retains draft |
| Required data | Dictionary + route contract for UF-02/UC-01 |

### SC-03

| Aspect | Scenario specification [C/D] |
|---|---|
| Persona/context | Trước bữa tối An mở app, món ở sau tủ đã gần ngày theo dõi |
| Trigger | Trước bữa tối An mở app, món ở sau tủ đã gần ngày theo dõi |
| Goal | Nhớ món đang có |
| Start | Owned entry/current version; SC-13 deliberately tests foreign ownership; SC-01/02 start at capture |
| Actions | UF-03/UC-02/03 — follow referenced UC/UF ordered actions |
| System response | Soon group + reason/date/location |
| Successful outcome | Soon group + reason/date/location |
| Alternative outcome | Unknown date/no-op/empty state follows applicable rule, no inferred safety |
| Failure outcome | Validation, conflict, auth or transport failure must not silently mutate twice |
| Recovery | 422 fix retained draft; 409 refetch/compare; timeout preserve command key; auth continuation retains draft |
| Required data | Dictionary + route contract for UF-03/UC-02/03 |

### SC-04

| Aspect | Scenario specification [C/D] |
|---|---|
| Persona/context | Huyền đổi món ăn tối sau thay đổi lịch gia đình |
| Trigger | Huyền đổi món ăn tối sau thay đổi lịch gia đình |
| Goal | Chọn đồ cần chú ý |
| Start | Owned entry/current version; SC-13 deliberately tests foreign ownership; SC-01/02 start at capture |
| Actions | UF-04/UC-03/04 — follow referenced UC/UF ordered actions |
| System response | Filter/detail trước action; không chỉ bật alert |
| Successful outcome | Filter/detail trước action; không chỉ bật alert |
| Alternative outcome | Unknown date/no-op/empty state follows applicable rule, no inferred safety |
| Failure outcome | Validation, conflict, auth or transport failure must not silently mutate twice |
| Recovery | 422 fix retained draft; 409 refetch/compare; timeout preserve command key; auth continuation retains draft |
| Required data | Dictionary + route contract for UF-04/UC-03/04 |

### SC-05

| Aspect | Scenario specification [C/D] |
|---|---|
| Persona/context | Thiên An dùng 250g từ entry 1000g |
| Trigger | Thiên An dùng 250g từ entry 1000g |
| Goal | Cập nhật chính xác |
| Start | Owned entry/current version; SC-13 deliberately tests foreign ownership; SC-01/02 start at capture |
| Actions | UF-05/UC-04 — follow referenced UC/UF ordered actions |
| System response | Remaining 750g; movement -250g |
| Successful outcome | Remaining 750g; movement -250g |
| Alternative outcome | Unknown date/no-op/empty state follows applicable rule, no inferred safety |
| Failure outcome | Validation, conflict, auth or transport failure must not silently mutate twice |
| Recovery | 422 fix retained draft; 409 refetch/compare; timeout preserve command key; auth continuation retains draft |
| Required data | Dictionary + route contract for UF-05/UC-04 |

### SC-06

| Aspect | Scenario specification [C/D] |
|---|---|
| Persona/context | Bỏ 200g trong phần 750g còn |
| Trigger | Bỏ 200g trong phần 750g còn |
| Goal | Ghi waste riêng với use |
| Start | Owned entry/current version; SC-13 deliberately tests foreign ownership; SC-01/02 start at capture |
| Actions | UF-06/UC-05 — follow referenced UC/UF ordered actions |
| System response | Remaining 550g; discard 200g |
| Successful outcome | Remaining 550g; discard 200g |
| Alternative outcome | Unknown date/no-op/empty state follows applicable rule, no inferred safety |
| Failure outcome | Validation, conflict, auth or transport failure must not silently mutate twice |
| Recovery | 422 fix retained draft; 409 refetch/compare; timeout preserve command key; auth continuation retains draft |
| Required data | Dictionary + route contract for UF-06/UC-05 |

### SC-07

| Aspect | Scenario specification [C/D] |
|---|---|
| Persona/context | Kiểm tra thực tế chỉ còn 500g |
| Trigger | Kiểm tra thực tế chỉ còn 500g |
| Goal | Reconcile mismatch |
| Start | Owned entry/current version; SC-13 deliberately tests foreign ownership; SC-01/02 start at capture |
| Actions | UF-07/UC-07 — follow referenced UC/UF ordered actions |
| System response | Adjustment -50g có reason |
| Successful outcome | Adjustment -50g có reason |
| Alternative outcome | Unknown date/no-op/empty state follows applicable rule, no inferred safety |
| Failure outcome | Validation, conflict, auth or transport failure must not silently mutate twice |
| Recovery | 422 fix retained draft; 409 refetch/compare; timeout preserve command key; auth continuation retains draft |
| Required data | Dictionary + route contract for UF-07/UC-07 |

### SC-08

| Aspect | Scenario specification [C/D] |
|---|---|
| Persona/context | Dùng mobile, server commit nhưng response mất |
| Trigger | Dùng mobile, server commit nhưng response mất |
| Goal | Không ghi lặp |
| Start | Owned entry/current version; SC-13 deliberately tests foreign ownership; SC-01/02 start at capture |
| Actions | UF-05/UC-04 — follow referenced UC/UF ordered actions |
| System response | Retry cùng key/payload replay, chỉ 1 movement |
| Successful outcome | Retry cùng key/payload replay, chỉ 1 movement |
| Alternative outcome | Unknown date/no-op/empty state follows applicable rule, no inferred safety |
| Failure outcome | Validation, conflict, auth or transport failure must not silently mutate twice |
| Recovery | 422 fix retained draft; 409 refetch/compare; timeout preserve command key; auth continuation retains draft |
| Required data | Dictionary + route contract for UF-05/UC-04 |

### SC-09

| Aspect | Scenario specification [C/D] |
|---|---|
| Persona/context | Hai tab cùng version, mỗi tab yêu cầu dùng 400g từ 500g |
| Trigger | Hai tab cùng version, mỗi tab yêu cầu dùng 400g từ 500g |
| Goal | Không negative/lost update |
| Start | Owned entry/current version; SC-13 deliberately tests foreign ownership; SC-01/02 start at capture |
| Actions | UC-04 — follow referenced UC/UF ordered actions |
| System response | Một success; tab còn lại 409, refetch |
| Successful outcome | Một success; tab còn lại 409, refetch |
| Alternative outcome | Unknown date/no-op/empty state follows applicable rule, no inferred safety |
| Failure outcome | Validation, conflict, auth or transport failure must not silently mutate twice |
| Recovery | 422 fix retained draft; 409 refetch/compare; timeout preserve command key; auth continuation retains draft |
| Required data | Dictionary + route contract for UC-04 |

### SC-10

| Aspect | Scenario specification [C/D] |
|---|---|
| Persona/context | Lỡ xóa bản ghi còn 500g |
| Trigger | Lỡ xóa bản ghi còn 500g |
| Goal | Khôi phục record |
| Start | Owned entry/current version; SC-13 deliberately tests foreign ownership; SC-01/02 start at capture |
| Actions | UF-09/UC-09/10 — follow referenced UC/UF ordered actions |
| System response | Restore vẫn 500g, không giả đã dùng/bỏ |
| Successful outcome | Restore vẫn 500g, không giả đã dùng/bỏ |
| Alternative outcome | Unknown date/no-op/empty state follows applicable rule, no inferred safety |
| Failure outcome | Validation, conflict, auth or transport failure must not silently mutate twice |
| Recovery | 422 fix retained draft; 409 refetch/compare; timeout preserve command key; auth continuation retains draft |
| Required data | Dictionary + route contract for UF-09/UC-09/10 |

### SC-11

| Aspect | Scenario specification [C/D] |
|---|---|
| Persona/context | Sửa date khi tab khác đã cập nhật entry |
| Trigger | Sửa date khi tab khác đã cập nhật entry |
| Goal | Không overwrite silently |
| Start | Owned entry/current version; SC-13 deliberately tests foreign ownership; SC-01/02 start at capture |
| Actions | UF-08/UC-06 — follow referenced UC/UF ordered actions |
| System response | 409, hiển thị dữ liệu hiện tại/draft khác biệt |
| Successful outcome | 409, hiển thị dữ liệu hiện tại/draft khác biệt |
| Alternative outcome | Unknown date/no-op/empty state follows applicable rule, no inferred safety |
| Failure outcome | Validation, conflict, auth or transport failure must not silently mutate twice |
| Recovery | 422 fix retained draft; 409 refetch/compare; timeout preserve command key; auth continuation retains draft |
| Required data | Dictionary + route contract for UF-08/UC-06 |

### SC-12

| Aspect | Scenario specification [C/D] |
|---|---|
| Persona/context | Entry vừa dùng hết vừa bỏ phần cuối |
| Trigger | Entry vừa dùng hết vừa bỏ phần cuối |
| Goal | History đúng nghĩa |
| Start | Owned entry/current version; SC-13 deliberately tests foreign ownership; SC-01/02 start at capture |
| Actions | UC-04/05/08 — follow referenced UC/UF ordered actions |
| System response | lifecycle depleted; totals theo movement, không “all consumed” |
| Successful outcome | lifecycle depleted; totals theo movement, không “all consumed” |
| Alternative outcome | Unknown date/no-op/empty state follows applicable rule, no inferred safety |
| Failure outcome | Validation, conflict, auth or transport failure must not silently mutate twice |
| Recovery | 422 fix retained draft; 409 refetch/compare; timeout preserve command key; auth continuation retains draft |
| Required data | Dictionary + route contract for UC-04/05/08 |

### SC-13

| Aspect | Scenario specification [C/D] |
|---|---|
| Persona/context | User A thử ID của user B |
| Trigger | User A thử ID của user B |
| Goal | Bảo vệ kho riêng |
| Start | Owned entry/current version; SC-13 deliberately tests foreign ownership; SC-01/02 start at capture |
| Actions | Tất cả owned UCs — follow referenced UC/UF ordered actions |
| System response | 404; không data leak |
| Successful outcome | 404; không data leak |
| Alternative outcome | Unknown date/no-op/empty state follows applicable rule, no inferred safety |
| Failure outcome | Validation, conflict, auth or transport failure must not silently mutate twice |
| Recovery | 422 fix retained draft; 409 refetch/compare; timeout preserve command key; auth continuation retains draft |
| Required data | Dictionary + route contract for Tất cả owned UCs |

### SC-14

| Aspect | Scenario specification [C/D] |
|---|---|
| Persona/context | Date=ngày hiện tại user, máy client ở timezone khác |
| Trigger | Date=ngày hiện tại user, máy client ở timezone khác |
| Goal | Nhắc đúng calendar date |
| Start | Owned entry/current version; SC-13 deliberately tests foreign ownership; SC-01/02 start at capture |
| Actions | UC-03/11 — follow referenced UC/UF ordered actions |
| System response | due_today theo timezone owner |
| Successful outcome | due_today theo timezone owner |
| Alternative outcome | Unknown date/no-op/empty state follows applicable rule, no inferred safety |
| Failure outcome | Validation, conflict, auth or transport failure must not silently mutate twice |
| Recovery | 422 fix retained draft; 409 refetch/compare; timeout preserve command key; auth continuation retains draft |
| Required data | Dictionary + route contract for UC-03/11 |

### SC-15

| Aspect | Scenario specification [C/D] |
|---|---|
| Persona/context | Món quá date nhưng best_before hoặc date estimate |
| Trigger | Món quá date nhưng best_before hoặc date estimate |
| Goal | Không biến attention thành safety claim |
| Start | Owned entry/current version; SC-13 deliberately tests foreign ownership; SC-01/02 start at capture |
| Actions | UC-03 — follow referenced UC/UF ordered actions |
| System response | past_date + label/source explanation |
| Successful outcome | past_date + label/source explanation |
| Alternative outcome | Unknown date/no-op/empty state follows applicable rule, no inferred safety |
| Failure outcome | Validation, conflict, auth or transport failure must not silently mutate twice |
| Recovery | 422 fix retained draft; 409 refetch/compare; timeout preserve command key; auth continuation retains draft |
| Required data | Dictionary + route contract for UC-03 |

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [05-use-cases-uml/use-cases.md](../05-use-cases-uml/use-cases.md)
- [04-user-flows/user-flows.md](../04-user-flows/user-flows.md)
- [10-testing/test-catalog.md](../10-testing/test-catalog.md)

## Open questions

Chốt các quyết định liên quan trong decision ledger trước khi đổi contract hoặc triển khai.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](../11-traceability/README.md)
- [05-use-cases-uml/use-cases.md](../05-use-cases-uml/use-cases.md)
- [04-user-flows/user-flows.md](../04-user-flows/user-flows.md)
- [10-testing/test-catalog.md](../10-testing/test-catalog.md)

## Verification criteria

Đối chiếu nguồn, ID và downstream links; acceptance runtime chỉ được ghi pass sau khi thực chạy.
