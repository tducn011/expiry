# DOC-SCOPE — Product scope and exclusions

- Document ID: `DOC-SCOPE`
- Status: **Approved**
- Updated: 2026-10-10T18:00:00+07:00

## Purpose

Xác định ranh giới tính năng trong phạm vi (In-Scope) và ngoài phạm vi (Out-of-Scope) của hệ thống Expiry, tách biệt giữa nhu cầu thực tế của sản phẩm và các giả định công nghệ phức tạp.

## Evidence sources

- [00-context/source-register.md](source-register.md)
- [08-architecture/07_Architecture_Components_and_Alternatives.md](../08-architecture/07_Architecture_Components_and_Alternatives.md)
- [08-architecture/ADR-006-hybrid-architecture.md](../08-architecture/ADR-006-hybrid-architecture.md)

## Definitions and assumptions

Hệ thống tập trung giải quyết bài toán theo dõi thực phẩm cá nhân, quản lý hạn dùng chính xác, hỗ trợ nhập liệu qua tính năng Scan tinh gọn và cung cấp thông tin cảnh báo hạn dùng kịp thời.

## Capability Scope Matrix

| Năng lực / Công nghệ | Trạng thái Scope | Căn cứ & Quyết định | Ghi chú & Ranh giới |
| :--- | :--- | :--- | :--- |
| **Private food inventory** | **In-Scope (P0 MVP)** | DEC-01 | Quản lý kho thực phẩm cá nhân, kiểm soát quyền sở hữu theo user. |
| **Manual capture & In-app attention** | **In-Scope (P0 MVP)** | DEC-02 | Nhập liệu bằng tay với form rõ ràng; tính toán attention badges trong app. |
| **Food entry & Movement ledger** | **In-Scope (P0 MVP)** | DEC-03 | Quản lý số lượng hiện tại (`remaining_quantity`) và lưu vết biến động (`stock_movements`). |
| **Node.js Modular Monolith & MySQL** | **In-Scope (Approved)** | ADR-001, ADR-002, ADR-006 | Kiến trúc backend chính thức gồm các module `inventory`, `expiry`, `scan` kết nối MySQL 8+ InnoDB. |
| **Assistive Scan via Python Service** | **In-Scope (Approved)** | ADR-004, ADR-006 | Python FastAPI service chuyên biệt: tiền xử lý ảnh (OpenCV/Pillow), OCR (Tesseract) và regex parser. |
| **User Review & Confirmation** | **In-Scope (Approved)** | S3 Scan Flow | Mọi kết quả scan chỉ là ứng viên (candidates); người dùng bắt buộc kiểm tra và bấm xác nhận trước khi lưu. |
| **Custom ML/DL Model Training** | **Out-of-Scope (Bị loại)** | ADR-006 | Loại bỏ hoàn toàn mã huấn luyện mô hình sâu, dataset annotation và GPU infrastructure. |
| **Model Evaluation Frameworks** | **Out-of-Scope (Bị loại)** | ADR-006 | Loại bỏ pipeline đánh giá loss/mAP/benchmark tự động. |
| **Large Language Models (LLM)** | **Out-of-Scope (Bị loại)** | ADR-006 | Loại bỏ OpenAI/Claude API và local LLM để tránh chi phí, độ trễ và rủi ro ảo giác hạn dùng. |
| **Distributed Broker (Celery, Redis)** | **Out-of-Scope (Bị loại)** | ADR-006 | Không thêm hàng đợi phân tán khi lưu lượng hiện tại hoàn toàn xử lý đồng bộ HTTP < 2s. |
| **Microservices phân mảnh theo tính năng** | **Out-of-Scope (Bị loại)** | ADR-001 | Tránh distributed transactions và phân mảnh database không cần thiết. |
| **Push/Background reminders qua OS** | **Deferred (Giai đoạn sau)** | OQ-01 | Chưa đưa vào MVP; ưu tiên attention trực tiếp trong ứng dụng. |
| **Household sharing đa người dùng** | **Deferred (Giai đoạn sau)** | DEC-01 | Giữ phạm vi kho cá nhân trước khi mở rộng mô hình nhóm/gia đình. |

## Decisions and rationale

[D] Quyết định khóa phạm vi tập trung vào: Core Modular Monolith + Python Scan Service + MySQL. Loại bỏ toàn bộ ML/DL, training, model evaluation và LLM giúp hệ thống nhẹ, dễ kiểm thử và vận hành tin cậy.

## Dependencies

- [00-context/decisions-and-questions.md](decisions-and-questions.md)
- [03-requirements-features/unsupported-proposals.md](../03-requirements-features/unsupported-proposals.md)
- [08-architecture/ADR-006-hybrid-architecture.md](../08-architecture/ADR-006-hybrid-architecture.md)

## Related documents

- [README.md](../README.md)
- [08-architecture/07_Architecture_Components_and_Alternatives.md](../08-architecture/07_Architecture_Components_and_Alternatives.md)
- [03-requirements-features/unsupported-proposals.md](../03-requirements-features/unsupported-proposals.md)

## Verification criteria

- Kiến trúc hệ thống không chứa file training `.pt`, `.h5`, `train.py`, hay phụ thuộc PyTorch/TensorFlow.
- Kiểm thử end-to-end các use-case nghiệp vụ P0 hoàn thành trọn vẹn trong phạm vi đã chốt.
