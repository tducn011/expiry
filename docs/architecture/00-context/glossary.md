# DOC-GLOSSARY — Glossary and ID policy

- Document ID: `DOC-GLOSSARY`
- Status: **Review**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

Phân biệt thuật ngữ và giữ ID qua ba môn.

## Evidence sources

- [00-context/source-register.md](source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

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

Namespace policy: canonical new workspace preserves P1/P2/P3, BR-V1-xx, FR-xx, RULE-xx, NFR-xx, F-xx, UC-xx, SC-xx, UF-xx, WF-xx, API-xx, VT-xx. P01/P02/P03 filenames are aliases for P1/P2/P3, not new people. New needs use NEED-xx and stakeholder drafts ST-V1-xx so they cannot collide with the illustrative ST-01 in the earlier pasted message. Raw legacy IDs are referenced with source scope; no silent remapping.

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [traceability/id-register.md](../11-traceability/id-register.md)

## Open questions

Chốt các quyết định liên quan trong decision ledger trước khi đổi contract hoặc triển khai.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](../11-traceability/README.md)
- [11-traceability/id-register.md](../11-traceability/id-register.md)

## Verification criteria

Đối chiếu nguồn, ID và downstream links; acceptance runtime chỉ được ghi pass sau khi thực chạy.
