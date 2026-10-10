# DOC-RULES — Canonical business rules

- Document ID: `DOC-RULES`
- Status: **Review**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

Một nơi định nghĩa rule; artifact khác chỉ link/reference ID.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

| Rule | Chính xác cần enforce [D] | Owner |
|---|---|---|
| RULE-01 | Owner lấy từ principal authenticated; không nhận user_id trong business DTO | Service + scoped repo |
| RULE-02 | Một FoodEntry = food quantity có cùng unit/date/location/opening context. Cùng tên không phải cùng identity | Capture service |
| RULE-03 | Create quantity >0; remaining ≥0; max 999999999.999; piece số nguyên; g/ml 3 decimal; không convert unit ở MVP | Service + DB CHECK |
| RULE-04 | Create lưu initial movement trước 0 → quantity; operational remaining là nguồn đọc, ledger cập nhật cùng transaction | Create service + DB |
| RULE-05 | Consume/discard amount >0 và ≤remaining; deleted/depleted không cho movement giảm | RecordMovement |
| RULE-06 | Recount nhập actual_quantity ≥0, reason bắt buộc; cùng lượng hiện có thì 200 no-op, không thêm movement/version | Recount service |
| RULE-07 | Không mutate remaining, version, user_id, deleted_at hoặc attention bằng generic metadata PATCH | DTO/schema + service |
| RULE-08 | unit không đổi sau create; muốn đổi phải quyết định migration/conversion riêng | Service |
| RULE-09 | Date unknown → expiry_date null; known/estimated → cần ngày; nguồn printed_label/user_estimate/user_entered/unknown nhất quán | Metadata domain |
| RULE-10 | date_label_type use_by/best_before/unspecified là nghĩa nhãn, không certainty. estimated chỉ với user_estimate; unknown đi cùng source unknown và label unspecified | Metadata + DB |
| RULE-11 | opened_on là field riêng nullable; không tự tính hạn mới, không tự kéo dài date khi freezer | Metadata/attention policy |
| RULE-12 | Attention khi còn quantity và chưa deleted: unknown nếu chưa date; past_date nếu date<today; due_today nếu bằng; soon nếu 0<delta≤lead; later nếu delta>lead | AttentionPolicy |
| RULE-13 | Today là calendar date theo user timezone; response có as_of_date; lead 0…30, default thử 2 | AttentionPolicy |
| RULE-14 | Attention không chứng minh safe/fresh; explain source, label, uncertainty. Không tự kết luận nên ăn khi quá use-by | AttentionPolicy/presenter |
| RULE-15 | Soft-delete giữ quantity/history, không tạo discard movement; restore chỉ bỏ deleted_at, recompute attention | Delete/restore service |
| RULE-16 | Lifecycle active nếu remaining>0, depleted nếu 0; không ép một trạng thái consumed/discarded cho batch đã vừa dùng vừa bỏ | Derived presenter |
| RULE-17 | expected_version phải khớp current cho update/action/delete/restore; successful mutation tăng version đúng một lần; no-op không tăng | Services |
| RULE-18 | Mọi write yêu cầu Idempotency-Key; cùng owner+key+operation+payload replay saved response, khác payload/operation →409; replay trước version check | Mutation executor + api_requests |
| RULE-19 | Idempotency reservation/result và entry/history commit cùng transaction; thất bại rollback; MVP không tự expire keys | Transaction adapter |
| RULE-20 | Sort priority past_date,due_today,soon,unknown,later; trong nhóm date asc NULLS LAST rồi created_at,id; unknown nhóm riêng visible | Query/AttentionPolicy |
| RULE-21 | Past-date capture được phép, kèm reason; không reject vì quá ngày hôm nay | Create/UX |
| RULE-22 | Unknown không silently suy date; opening/date edit chỉ metadata cả entry; mở một phần batch cần ghi tách ngay khi capture, split sau này phải atomic | Service/UX |
| RULE-23 | History không có public edit/delete endpoint; sửa sai bằng recount có reason, không rewrite historical consumption | Repo/service |
| RULE-24 | Owner-only not-found hoặc foreign-owned ID →404; auth thiếu →401; lỗi input→422; conflict→409 | Error mapper |

### Attention decision table

| Deleted | Quantity | Date | Relationship với today | Output |
|---|---|---|---|---|
| Có | Bất kỳ | Bất kỳ | Bất kỳ | Không trong active list; trash riêng |
| Không | 0 | Bất kỳ | Bất kỳ | depleted, không trong attention list |
| Không | >0 | null | Không biết | unknown; yêu cầu xem/xác nhận, không gọi later |
| Không | >0 | Có | <today | past_date; reason theo label/source |
| Không | >0 | Có | =today | due_today |
| Không | >0 | Có | 1…lead days | soon |
| Không | >0 | Có | >lead days | later |

opened_on không thay đổi bảng này tự động. Cần hướng dẫn sau mở từ nhãn/người dùng trước khi model thêm effective deadline.

## Decisions and rationale

[D] Adopt these 24 rules as review baseline only. Older design remains provenance snapshot; do not maintain competing active definitions there.

## Dependencies

- [11-data-dictionary/dictionary.md](../06-data-model/dictionary.md)
- [07-api/endpoints.md](../07-api/endpoints.md)
- [10-testing/test-catalog.md](../10-testing/test-catalog.md)

## Open questions

Chốt các quyết định liên quan trong decision ledger trước khi đổi contract hoặc triển khai.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](../11-traceability/README.md)
- [06-data-model/dictionary.md](../06-data-model/dictionary.md)
- [07-api/endpoints.md](../07-api/endpoints.md)
- [10-testing/test-catalog.md](../10-testing/test-catalog.md)

## Verification criteria

Đối chiếu nguồn, ID và downstream links; acceptance runtime chỉ được ghi pass sau khi thực chạy.
