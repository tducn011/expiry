# DOC-DECISIONS — Decision ledger and open questions

- Document ID: `DOC-DECISIONS`
- Status: **Approved**
- Updated: 2026-10-10T18:00:00+07:00

## Purpose

Sổ theo dõi các quyết định kiến trúc đã chốt (Decision Ledger) và trạng thái các câu hỏi kỹ thuật còn mở trong dự án Expiry.

## Evidence sources

- [00-context/source-register.md](source-register.md)
- [08-architecture/07_Architecture_Components_and_Alternatives.md](../08-architecture/07_Architecture_Components_and_Alternatives.md)
- [08-architecture/ADR-006-hybrid-architecture.md](../08-architecture/ADR-006-hybrid-architecture.md)

## Decision Ledger

| ID | Quyết định kỹ thuật | Trạng thái | Artifact & Ranh giới ảnh hưởng |
| :--- | :--- | :--- | :--- |
| **DEC-01** | Private food inventory | **User Confirmed** | Mỗi bản ghi thực phẩm gắn với owner (user_id). Phân quyền theo owner. |
| **DEC-02** | Manual capture + In-app attention | **User Confirmed** | Form nhập tay rõ ràng; tính toán attention badges ngay trong app. |
| **DEC-03** | Food entry + Movement ledger; remaining_quantity làm source of truth | **Approved** | Bảng `food_entries` lưu số lượng hiện tại; bảng `stock_movements` lưu vết biến động (consume, discard, recount). |
| **DEC-04** | DATE riêng với TIMESTAMPTZ; uncertainty tách khỏi opening | **Approved** | Trường ngày hết hạn `expiry_date` kiểu DATE; `date_certainty` ('exact'/'inferred'/null). |
| **DEC-05** | Soft delete là quản trị bản ghi; không ghi discard | **Approved** | Thao tác xóa dùng `deleted_at`, có chức năng khôi phục từ thùng rác; không nhầm lẫn với hành vi tiêu thụ/vứt bỏ. |
| **DEC-06** | Warning lead mặc định 2 ngày; user cấu hình 0–30 ngày | **Approved** | Cấu hình `attention_lead_days` trong bảng `users`, người dùng tự chỉnh sửa. |
| **DEC-07** | Node.js Modular Monolith với 3 module: inventory, expiry, scan | **Approved** | Tổ chức backend theo module tại `backend/src/modules/`. ADR-001. |
| **DEC-08** | Cơ sở dữ liệu: MySQL 8+ với engine InnoDB | **Approved** | Sử dụng schema và migrations tại `database/mysql/`. Hỗ trợ row locking và ACID transactions. ADR-002. |
| **DEC-09** | Read-before-sign-in: Public demo + draft form, auth khi lưu | **Approved** | Cho phép trải nghiệm nhập liệu thử nghiệm trước khi yêu cầu tài khoản. |
| **DEC-10** | Triển khai containerized bằng Docker Compose (`compose.yaml`) | **Approved** | Điều phối 4 dịch vụ: `uidemo`, `backend`, `python-scan`, `mysql`. ADR-006, DOC-DEPLOY. |
| **DEC-12** | **Chốt Architecture mới của Expiry:** Monorepo + Node.js Modular Monolith + Python Scan Service + MySQL | **Approved** | Mô hình Hybrid Monolith + Python service độc lập. Node.js sở hữu nghiệp vụ và DB; Python chỉ xử lý ảnh và OCR. ADR-006. |
| **DEC-13** | **Bỏ toàn bộ ML/DL, training, model evaluation và LLM ra khỏi architecture hiện tại** | **Approved** | Loại bỏ hoàn toàn mã huấn luyện model sâu, pipeline đánh giá và tích hợp LLM để giữ hệ thống tinh gọn, deterministic và không hallucination. Chỉ giữ Python service cho chức năng scan. |

---

## Status of Open Questions

| ID | Chủ đề | Câu hỏi / Xung đột ban đầu | Trạng thái giải quyết | Kết luận & Quyết định |
| :--- | :--- | :--- | :--- | :--- |
| **OQ-01** | Scope provenance | Scope kế thừa cũ (OCR, push, multi-domain) so với MVP hiện tại | **Đã giải quyết (Resolved)** | Chốt phạm vi quản lý thực phẩm cá nhân; scan chỉ là trợ thủ (assistive); push notifications đưa về giai đoạn sau. |
| **OQ-02** | Data contracts | Thống nhất đơn vị, quy ước ngày và mapping DTO | **Đã giải quyết (Resolved)** | Chuẩn hóa DTO OpenAPI trong `contracts/public-api.yaml` và `contracts/scan-api.yaml`. |
| **OQ-03** | Stack / DB Engine | Chọn Node/Express vs Nest, MySQL vs PostgreSQL, ORM | **Đã giải quyết (Resolved)** | Chốt Node.js + Express Modular Monolith và MySQL 8+ InnoDB (DEC-07, DEC-08, ADR-002). |
| **OQ-04** | Auth Provider | Session cookie vs JWT token | **Đang hoàn thiện (In Progress)** | Ưu tiên Session / Bearer Token cơ bản, không đưa thêm bên thứ 3 phức tạp vào MVP. |
| **OQ-05** | OCR Execution Boundary | Cách thức tích hợp OCR và ranh giới với Python | **Đã giải quyết (Resolved)** | Xây dựng Python FastAPI Scan Service độc lập (`POST /scan`), stateless, không truy cập MySQL. Loại bỏ ML/DL/LLM (ADR-004, ADR-006). |
| **OQ-06** | UI Alignment | Đồng bộ giao diện với Canva / Wireframe | **Đang hoàn thiện (In Progress)** | Màn hình `uidemo` (React+Vite) đã có bản demo trực quan, khớp 6 wireframe chính. |
| **OQ-07** | User Validation | Thử nghiệm với các Persona P1, P2, P3 | **Mở (Open)** | Sẽ tiến hành usability testing sau khi hoàn thành tích hợp backend và scan flow. |
| **OQ-08** | Sensors | Cảm biến thiết bị vs Error tracking | **Đã giải quyết (Resolved)** | Chỉ theo dõi lỗi ứng dụng (Error tracking), không sử dụng phần cứng cảm biến IoT. |
| **OQ-09** | Deployment Topology | Cấu hình triển khai hạ tầng | **Đã giải quyết (Resolved)** | Triển khai bằng Docker Compose (`compose.yaml`) phối hợp 4 container (DEC-10, DOC-DEPLOY). |

## Dependencies

- [08-architecture/ADR-006-hybrid-architecture.md](../08-architecture/ADR-006-hybrid-architecture.md)
- [00-context/scope.md](scope.md)

## Related documents

- [README.md](../README.md)
- [08-architecture/README.md](../08-architecture/README.md)
