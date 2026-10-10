# [S2] Definitions và requirement model

## S2.1 Các khái niệm dùng trong bộ tài liệu
| Term | Định nghĩa đơn giản | Vai trò/ví dụ Expiry |
|---|---|---|
| Proto-persona | Mô hình hành vi tổng hợp còn cần kiểm chứng | P1 visibility; không phải một participant thật được interview hôm nay |
| Goal | Kết quả người dùng muốn đạt | Biết món nào cần xem trước khi nấu |
| Task | Việc cụ thể làm để đạt goal | Mở attention list, chọn món, ghi dùng 1 hộp |
| User flow | Đường đi qua screen/action/decision | WF-01 → chọn món → WF-03 |
| Scenario | Một tình huống cụ thể có bối cảnh và outcome | Huyền đổi bữa tối, xem món nào gần ngày theo dõi |
| Use case | Hợp đồng hành vi hệ thống phục vụ goal | UC-04 ghi sử dụng; gồm normal/alternate/error flow |
| Business requirement (BR) | Kết quả/giá trị business cần đạt | Giảm công cập nhật để inventory hữu ích |
| Functional requirement (FR) | Hệ thống phải làm gì | Save món với date nullable |
| Nonfunctional requirement (NFR) | Chất lượng/ràng buộc cách vận hành | Không ghi số lượng âm khi hai request đồng thời |
| Business rule (RULE) | Điều kiện/giới hạn quyết định nghiệp vụ | Không dùng nhiều hơn lượng còn |
| Entity | Khái niệm có identity và dữ liệu cần lưu | FoodEntry E-A khác E-B dù cùng tên |
| Data dictionary | Định nghĩa chính xác field trước schema | expiry_date là calendar date nullable |
| ERD | Sơ đồ entity và quan hệ/cardinality | Một user sở hữu 0…N entries |
| DTO | Định dạng truyền vào/ra API, không phải DB row | EntryResponse gồm attention dẫn xuất |
| Repository | Bộ hàm truy cập persistence có scope | findOwnedEntry(id,userId) |
| Use-case service | Điều phối rule, transaction và repo | RecordMovement kiểm tra lượng và commit cả history |
| Transaction | Nhóm thay đổi cùng commit hoặc rollback | Giảm quantity và thêm movement cùng thành công |
| Optimistic concurrency | Phát hiện request dùng version cũ | expected_version 3 nhưng hiện 4 → 409 |
| Idempotency | Retry cùng command không thực hiện lần hai | Replay movement dùng 1 hộp không trừ thêm |
| Modular monolith | Một backend deploy, bên trong chia module | inventory/accounts, chưa có microservices |
| Composition root | Nơi nối dependencies | server startup inject service/repo, không chứa toàn rule |
| Ledger | Lịch sử các thay đổi | Movements; MVP không event-sourcing |
| Source of truth | Giá trị chính được dùng để quyết định | DB remaining_quantity, không React copy |

## S2.2 BR mới: tách namespace để tránh xung đột
Ngày 30/09 dùng BR-01…08 cho hỗn hợp capability. Ngày 08/10 assistant đề xuất BR-01…03 cho outcome. Bộ này dùng **BR-V1-xx** cho outcome, **FR-xx** cho capability, **RULE-xx** cho business rules; không âm thầm đổi nghĩa ID cũ.

| ID | Outcome [D] | Persona | Indicators |
|---|---|---|---|
| BR-V1-01 | Người dùng nhận biết thực phẩm đang có và cần chú ý với công thấp | P1, P2 | Task chọn món; missed/stale records |
| BR-V1-02 | Người dùng có đủ context để quyết định bước tiếp khi kế hoạch đổi | P2 | Task decision completion + explanation; không tự claim recipes đã giải quyết |
| BR-V1-03 | Tồn kho số phản ánh thay đổi thực tế mà không tạo gánh nặng quản trị lớn | P3, P1 | Update time, amount errors, stale-record rate |

| FR | Hệ thống cần làm | UC/feature | Outcome |
|---|---|---|---|
| FR-01 | Capture name, amount, unit; date optional và source rõ | UC-01/F-01 | BR-V1-01/03 |
| FR-02 | List/search/filter kho của owner; stable pagination | UC-02/F-02 | BR-V1-01 |
| FR-03 | Attention classification + reason + calculated local date | UC-03/F-02/03 | BR-V1-01/02 |
| FR-04 | Ghi consume/discard một phần/toàn bộ, atomic và retry-safe | UC-04/05/F-04 | BR-V1-03 |
| FR-05 | Sửa metadata có version, không sửa quantity qua generic PATCH | UC-06/F-05 | BR-V1-02/03 |
| FR-06 | Recount lượng thực tế, lưu correction history | UC-07/F-05 | BR-V1-03 |
| FR-07 | History đọc được của owner | UC-08/F-06 | BR-V1-03 |
| FR-08 | Soft delete/trash/restore, tách physical disposal | UC-09/10/F-07 | BR-V1-03 |
| FR-09 | Setting timezone và attention lead, recompute | UC-11/F-08 | BR-V1-01/02 |
| FR-10 | Auth continuation giữ draft và gate kho riêng/persist | UC-00/support | CTX-05 |

## S2.3 Business logic inventory
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

## S2.4 Attention decision table
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

## S2.5 NFR và acceptance
| NFR | Yêu cầu | Verification |
|---|---|---|
| NFR-01 Privacy | Không cross-user read/write ở mọi endpoint và history | A/B user tests |
| NFR-02 Integrity | Atomic entry/movement/idempotency; không âm; conflict không overwrite | Concurrent transactions + rollback test |
| NFR-03 Contract | FE mock và BE trả đúng OpenAPI; stable error shape | Contract validation |
| NFR-04 UX recovery | 401 giữ draft; timeout retry cùng key; conflict refetch không silent replace | UI scenarios |
| NFR-05 Accessibility | Label/input rõ, keyboard usable, trạng thái không chỉ màu, focus/dialog/error đúng | Keyboard + screen reader review |
| NFR-06 Date accuracy | Date-only không bị lệch do UTC conversion; clock injection | Boundary timezone tests |
| NFR-07 Operations | Migration versioned, backup/restore baseline, generic errors, no secret logging | Staging acceptance |
| NFR-08 Performance | Chốt latency/volume sau biết hosting và dataset; chưa bịa SLA | Baseline measurements |
