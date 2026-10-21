# Sub-issue i2b: Apply MySQL Migration 003 & Barcode Domain Invariants

- **Parent Issue**: [i2: Barcode Scanning & Vision Date Extraction Support](./i2.md)
- **Assignee**: Antigravity (`@tducn110`)
- **Status**: **READY TO CLAIM**
- **Branch**: `feature/barcode`
- **Target Branch**: `develop`
- **Date**: 2026-10-19

---

## 1. Khung Sub-issue (Framework)

### INPUT
- Database files:
  - `database/mysql/migrations/003_add_barcode.sql`
- Domain files:
  - `apps/api/src/shared/domain.mjs`
  - `apps/api/src/shared/repository.mjs`
  - `database/mysql/src/domain.mjs`

### VẤN ĐỀ RA SAO? (Problem Statement)
- Để lưu trữ mã vạch quét được từ bao bì sản phẩm, bảng `food_entries` trong MySQL cần được mở rộng thêm 2 cột: `barcode` (chuỗi mã vạch) và `barcode_format` (loại định dạng chuẩn GS1/EAN/QR).
- Đồng thời phải bảo toàn tính nhất quán dữ liệu ở tầng DB:
  - Nếu `barcode` có giá trị thì độ dài sau khi trim phải > 0 và <= 64 ký tự (`entries_barcode_shape`).
  - `barcode_format` phải thuộc danh sách hợp lệ: `EAN_13`, `EAN_8`, `CODE_128`, `CODE_39`, `ITF`, `QR_CODE`, `DATA_MATRIX`, `PDF_417`, `AZTEC`, `other` (`entries_barcode_format`).
  - Tính nhất quán (`entries_barcode_coherence`): Không cho phép có `barcode_format` mà `barcode` lại là `NULL`.
- Cần có index tối ưu `(user_id, deleted_at, barcode)` để phục vụ tra cứu nhanh món ăn từ mã vạch.

### OUTPUT
1. Chạy migration `003_add_barcode.sql` vào cơ sở dữ liệu MySQL 8.4.
2. Đồng bộ hóa hàm `metadata()` trong `apps/api/src/shared/domain.mjs` và `database/mysql/src/domain.mjs` để kiểm tra các ràng buộc này ngay trước khi insert/update.
3. Cập nhật `metadataFields` trong repository để đưa `barcode` và `barcode_format` vào câu truy vấn parameterized SQL.

### FINAL CONTRACT
- Schema bảng `food_entries`:
  ```sql
  barcode VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NULL,
  barcode_format VARCHAR(20) CHARACTER SET ascii COLLATE ascii_bin NULL,
  INDEX entries_owner_barcode (user_id, deleted_at, barcode)
  ```
- API DTO trả về cho các endpoint `POST /food-entries`, `GET /food-entries/:id` chứa đầy đủ trường `barcode` và `barcode_format`.

### LÀM SAO ĐỂ NHẬN ĐỊNH OUTPUT ĐÚNG HAY SAI (VERIFICATION)
1. **Kiểm tra DB Operations**:
   ```bash
   npm run test:dbops
   ```
   *Tiêu chí đạt*: Exit code 0, migration 003 được áp dụng thành công.
2. **Kiểm tra API Test Suite**:
   ```bash
   npm run test:api
   ```
   *Tiêu chí đạt*: 22 passed, 0 failed.
