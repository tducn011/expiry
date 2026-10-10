# DOC-ADR-002 — SQL engine and storage layer selection

- Document ID: `DOC-ADR-002`
- Status: **Approved**
- Updated: 2026-10-10T18:00:00+07:00

## Purpose

Lựa chọn hệ quản trị cơ sở dữ liệu quan hệ (RDBMS) và chiến lược truy cập dữ liệu để đảm bảo độ chính xác của số lượng tồn kho (remaining_quantity), ghi nhận audit ledger (`stock_movements`), khóa dòng (row locking `SELECT ... FOR UPDATE`) và tính toán idempotency nguyên khối.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)
- [06-data-model/05_Data_Definitions_and_ERD.md](../06-data-model/05_Data_Definitions_and_ERD.md)
- Repository code: `database/mysql/` (migrations, seed.sql, workbench_export.py)

## Definitions and assumptions

Hệ thống yêu cầu hỗ trợ ACID transaction, row-level locking cho concurrency control (tránh race condition khi cập nhật số lượng) và quản lý version (optimistic locking).

## Analysis

| Khía cạnh | Quyết định & Phân tích |
| :--- | :--- |
| **Vấn đề** | Đảm bảo tính nhất quán dữ liệu số lượng, lưu trữ nhật ký biến động và cơ chế Idempotency-Key. |
| **Phương án xem xét** | 1. **MySQL 8+ với engine InnoDB** (Chọn).<br/>2. PostgreSQL (Tham chiếu ban đầu, chuyển sang MySQL theo cấu trúc dự án).<br/>3. SQLite / NoSQL (Loại bỏ vì thiếu tính mở rộng hoặc ACID locking chuẩn). |
| **Bằng chứng** | Thư mục `database/mysql/` đã được thiết lập đầy đủ với migrations, scripts khởi tạo, file seed và ERD Workbench chuẩn. InnoDB hỗ trợ đầy đủ row locking (`FOR UPDATE`), repeatable read isolation và foreign keys. |
| **Đánh đổi** | Cần quản lý cấu hình transaction và timezone trên MySQL đúng chuẩn `UTC` / `+00:00`. |
| **Quyết định** | **Chấp thuận (Approved):** Chọn **MySQL 8+ (InnoDB)** làm cơ sở dữ liệu chính thức của Expiry. |
| **Hệ quả** | Toàn bộ schema, migration và seed tập trung tại `database/mysql/`. Node.js Backend truy cập qua connection pool với parameterized queries an toàn. Python Scan Service không có quyền truy cập MySQL. |

## Decisions and rationale

[D] Quyết định chốt MySQL 8+ InnoDB làm database duy nhất của hệ thống. Node.js backend sở hữu hoàn toàn các bảng `users`, `food_entries`, `stock_movements`, `api_requests`.

## Dependencies

- [06-data-model/05_Data_Definitions_and_ERD.md](../06-data-model/05_Data_Definitions_and_ERD.md)
- [08-architecture/components.md](components.md)

## Related documents

- [database/mysql/README.md](../../../database/mysql/README.md)
- [06-data-model/entities-and-migrations.md](../06-data-model/entities-and-migrations.md)
- [08-architecture/ADR-001-modular-monolith.md](ADR-001-modular-monolith.md)

## Verification criteria

- Các migration trong `database/mysql/migrations` thực thi thành công không lỗi cú pháp.
- Các lệnh `SELECT ... FOR UPDATE` và rollback khi gặp `INSUFFICIENT_QUANTITY` hoạt động chính xác trong môi trường kiểm thử.
