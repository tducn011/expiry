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
| **DEC-04** | Calendar dates use DATE; instants use DATETIME(6) under UTC policy; certainty separate from opened date | **Approved (logical decision; physical representation reconciled)** | `expiry_date`/`opened_on` are MySQL DATE; persisted instants are MySQL DATETIME(6); date certainty is `known`/`estimated`/`unknown`. |
| **DEC-05** | Soft delete là quản trị bản ghi; không ghi discard | **Approved** | Thao tác xóa dùng `deleted_at`, có chức năng khôi phục từ thùng rác; không nhầm lẫn với hành vi tiêu thụ/vứt bỏ. |
| **DEC-06** | Warning lead mặc định 2 ngày; user cấu hình 0–30 ngày | **Approved** | Cấu hình `attention_lead_days` trong bảng `users`, người dùng tự chỉnh sửa. |
| **DEC-07** | Node.js Modular Monolith với 3 module: inventory, expiry, scan | **Approved** | Tổ chức backend theo module tại `backend/src/modules/`. ADR-001. |
| **DEC-08** | Cơ sở dữ liệu: MySQL 8.4/InnoDB candidate | **Approved (current candidate)** | Migrations và dev verification nằm ở `database/mysql/`; sandbox checks support row locks/transactions but are not production approval. ADR-002. |
| **DEC-09** | Real-mode Add requires authentication before the Add form opens; demo is a separate in-memory mode | **Current behavior [A], not product approval** | Current `App` opens Auth before Add for an unauthenticated owner; successful auth continues to Add. The explicit demo is separately selected and does not persist to backend. The prior read-before-sign-in form flow is not the current implementation; any product change to this gate remains for review. |
| **DEC-10** | Triển khai containerized bằng Docker Compose (`compose.yaml`) | **Approved** | Điều phối 4 dịch vụ: `uidemo`, `backend`, `python-scan`, `mysql`. ADR-006, DOC-DEPLOY. |
| **DEC-12** | **Chốt Architecture mới của Expiry:** Monorepo + Node.js Modular Monolith + Python Scan Service + MySQL | **Approved** | Mô hình Hybrid Monolith + Python service độc lập. Node.js sở hữu nghiệp vụ và DB; Python chỉ xử lý ảnh và OCR. ADR-006. |
| **DEC-13** | No ML/DL training, evaluation, or LLM pipeline is implemented in the current runtime | **Current scope [A]; table idea remains [D] review only** | Python scan returns transient OCR assistance. The proposed `ocr_training_samples` table is a separate review artifact and does not authorize upload, collection, evaluation, or training. ADR-004/006 describe current runtime scope. |

---

## Status of Open Questions

| ID | Chủ đề | Câu hỏi / Xung đột ban đầu | Trạng thái giải quyết | Kết luận & Quyết định |
| :--- | :--- | :--- | :--- | :--- |
| **OQ-01** | Scope provenance | Scope kế thừa cũ (OCR, push, multi-domain) so với MVP hiện tại | **Đã giải quyết (Resolved)** | Chốt phạm vi quản lý thực phẩm cá nhân; scan chỉ là trợ thủ (assistive); push notifications đưa về giai đoạn sau. |
| **OQ-02** | Data contracts | Thống nhất đơn vị, quy ước ngày và mapping DTO | **Đã giải quyết (Resolved)** | Chuẩn hóa DTO OpenAPI trong `contracts/public-api.yaml` và `contracts/scan-api.yaml`. |
| **OQ-03** | Stack / DB Engine | Node/Express vs Nest; database and ORM selection | **Resolved for current candidate** | Node.js + Express modular monolith and MySQL 8.4/InnoDB candidate; ORM status follows ADR-002. Sandbox evidence is not production approval. |
| **OQ-04** | Authentication mechanism | Session cookie vs JWT / external provider | **Current candidate implemented; policy/deployment review remains separate** | Current contract and migrations provide local email/password with durable server sessions and CSRF protection. This documents source state and bounded tests, not production auth approval. |
| **OQ-05** | OCR execution boundary | OCR/scan service and persistence boundary | **Current boundary verified [A]** | Python scan is a separate stateless request path with no MySQL write; its transient result is reviewed in Add. No DL/LLM training or evaluation runtime is implemented. The optional sample-table idea remains [D] review only. |
| **OQ-06** | UI Alignment | Compare current implementation with Canva/Figma references | **Comparison recorded; visual alignment remains open** | The dated Figma/source review records modal composition, separate History/Trash, and Settings differences. Static frames are not evidence that implemented screens match. |
| **OQ-07** | User Validation | Thử nghiệm với các Persona P1, P2, P3 | **Mở (Open)** | Sẽ tiến hành usability testing sau khi hoàn thành tích hợp backend và scan flow. |
| **OQ-08** | Sensors | Cảm biến thiết bị vs Error tracking | **Đã giải quyết (Resolved)** | Chỉ theo dõi lỗi ứng dụng (Error tracking), không sử dụng phần cứng cảm biến IoT. |
| **OQ-09** | Deployment Topology | Cấu hình triển khai hạ tầng | **Đã giải quyết (Resolved)** | Triển khai bằng Docker Compose (`compose.yaml`) phối hợp 4 container (DEC-10, DOC-DEPLOY). |

## Dependencies

- [08-architecture/ADR-006-hybrid-architecture.md](../08-architecture/ADR-006-hybrid-architecture.md)
- [00-context/scope.md](scope.md)

## Related documents

- [README.md](../README.md)
- [08-architecture/README.md](../08-architecture/README.md)

## Current schema/OCR boundary — 2026-10-13 [A/D]

Current schema remains seven tables from migrations 001/002 plus the migration ledger. A single OCR labeled-sample table is a **[D] review proposal only**, pending source eligibility, consent, retention, reviewer access, label policy, and leakage-safe dataset versioning decisions. No DDL or collection behavior is approved by this note. See [schema input/output](../06-data-model/schema-input-output.md).

## Definitions and assumptions

Decision state labels retain their existing meaning; proposal text does not equal approval.

## Analysis

Current schema and OCR proposal distinctions are summarized in the dated reconciliation section below.

## Decisions and rationale

No new product decision is made by this documentation reconciliation.

## Open questions

Open items are recorded in the decision rows above and the linked schema proposal.

## Verification criteria

Verify the decision owner and evidence before marking any decision approved.
