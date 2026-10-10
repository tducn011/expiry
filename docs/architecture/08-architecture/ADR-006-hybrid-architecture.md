# DOC-ADR-006 — Hybrid Architecture: Node.js Modular Monolith + Python Scan Service + MySQL

- Document ID: `DOC-ADR-006`
- Status: **Approved**
- Updated: 2026-10-10T18:00:00+07:00

## Purpose

Ghi nhận quyết định kiến trúc tổng thể chính thức của hệ thống Expiry:
1. Chốt mô hình **Hybrid Architecture** trong Monorepo: Core backend là **Node.js Modular Monolith**, cơ sở dữ liệu là **MySQL**, kết hợp duy nhất **một Python Scan Service** độc lập phục vụ chức năng scan.
2. **Loại bỏ toàn bộ** các thành phần Machine Learning / Deep Learning tùy chỉnh, pipeline huấn luyện (training pipelines), hệ thống đánh giá mô hình (model evaluation) và Large Language Models (LLM).

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)
- [08-architecture/07_Architecture_Components_and_Alternatives.md](07_Architecture_Components_and_Alternatives.md)
- [08-architecture/components.md](components.md)
- [08-architecture/deployment.md](deployment.md)

## Context & Problem Statement

Trong các giai đoạn nghiên cứu ban đầu, một số đề xuất đã đưa vào các công nghệ AI phức tạp: huấn luyện mô hình nhận diện hạn dùng riêng, đánh giá độ chính xác qua pipeline ML, hoặc tích hợp LLM để phân tích ngữ cảnh nhãn thực phẩm. Đồng thời, kiến trúc microservices phân tán và các hàng đợi message broker (Redis, Celery) cũng được cân nhắc.

Tuy nhiên, phân tích thực tế cho thấy:
- **Nguy cơ over-engineering:** Đội ngũ phát triển và phạm vi sản phẩm MVP là ứng dụng theo dõi thực phẩm cá nhân. Việc duy trì hạ tầng training ML/DL và tích hợp LLM làm tăng vọt chi phí vận hành, độ phức tạp bảo trì và thời gian phản hồi.
- **Rủi ro ảo giác (Hallucination):** LLM và các mô hình sinh có nguy cơ tự suy đoán ngày hạn dùng khi ảnh mờ, gây nguy hiểm cho an toàn thực phẩm.
- **Giải pháp thực dụng:** Tiền xử lý ảnh (OpenCV/Pillow) kết hợp OCR (Tesseract) và các quy tắc bóc tách regex (rule-based parser) hoàn toàn đáp ứng được nhu cầu trích xuất thông tin hạn dùng một cách xác định (deterministic) và có thể kiểm thử minh bạch.

## Decision

1. **Loại bỏ hoàn toàn khỏi kiến trúc:**
   - Mọi mã nguồn huấn luyện mô hình ML/DL (PyTorch, TensorFlow, Keras, v.v.).
   - Mọi pipeline đánh giá mô hình (model evaluation benchmarks, loss curves).
   - Mọi tích hợp LLM (OpenAI API, Anthropic, local LLM).
   - Mọi hạ tầng hàng đợi phân tán chưa cần thiết (Redis, Celery).
2. **Kiến trúc chính thức được phê duyệt:**
   - **Frontend:** React + Vite (`uidemo/`).
   - **Backend:** Node.js + Express Modular Monolith (`backend/`) gồm các module `inventory`, `expiry`, `scan`. Sở hữu toàn bộ logic nghiệp vụ, xác thực và lưu trữ.
   - **Scan Service:** Python FastAPI Service (`services/python-scan/`) chỉ phục vụ chức năng scan: `preprocess.py` -> `ocr.py` -> `parser.py`.
   - **Database:** MySQL 8+ InnoDB (`database/mysql/`).
   - **Contracts:** Hợp đồng giao tiếp được chuẩn hóa tại `contracts/public-api.yaml` và `contracts/scan-api.yaml`.
3. **Quy tắc phân định trách nhiệm:**
   - Python Scan Service là stateless, không có quyền truy cập trực tiếp MySQL.
   - Node.js là nguồn sự thật duy nhất cho dữ liệu nghiệp vụ và điều phối luồng scan.

## Architecture Structure

```text
expiry/
├── uidemo/                 # React + Vite
├── backend/                # Node.js + Express
│   └── src/
│       ├── modules/
│       │   ├── inventory/
│       │   ├── expiry/
│       │   └── scan/
│       ├── shared/
│       └── app.ts
├── services/
│   └── python-scan/
│       ├── app/
│       │   ├── main.py
│       │   ├── routes/
│       │   ├── schemas/
│       │   └── scanner/
│       │       ├── preprocess.py
│       │       ├── ocr.py
│       │       └── parser.py
│       ├── tests/
│       ├── requirements.txt
│       └── Dockerfile
├── database/
│   └── mysql/
├── contracts/
│   ├── public-api.yaml
│   └── scan-api.yaml
├── docs/
└── compose.yaml
```

## Luồng Scan tuần tự

```text
User -> Upload image -> React -> POST /api/v1/scans -> Node.js
  -> POST /scan (Internal HTTP) -> Python Scan Service
  -> Preprocess + OCR + Parse -> Extracted candidate data -> Node.js
  -> Scan result -> React -> Review & Edit form -> User
  -> Confirm -> Save confirmed data -> Node.js
  -> INSERT inventory item -> MySQL -> Success -> Created item -> React -> User
```

## Consequences & Trade-offs

- **Tích cực:**
  - Hệ thống tinh gọn, dễ hiểu, khởi động nhanh và chi phí tài nguyên thấp.
  - Tách biệt rõ ràng: Node.js làm tốt vai trò I/O nghiệp vụ và web API; Python làm tốt vai trò xử lý ảnh và OCR.
  - Dễ kiểm thử tự động (automated testing) và CI/CD với Docker Compose.
  - Vẫn giữ nguyên khả năng nâng cấp module Python Scan bên trong mà không ảnh hưởng tới API contract giữa 2 service.
- **Hạn chế / Đánh đổi:**
  - Nhận diện ký tự OCR phụ thuộc vào chất lượng ảnh chụp; nếu ảnh quá mờ hoặc góc chụp nghiêng gắt, hệ thống sẽ trả về cảnh báo `ambiguous` và yêu cầu người dùng nhập/sửa tay trên form review.
  - Cần duy trì 2 môi trường runtime (Node.js và Python) được đóng gói qua Docker.

## Implementation Order

1. Giữ nguyên `uidemo`, `database/mysql`, `contracts`, `docs`.
2. Tạo backend Node.js với các module nghiệp vụ chính.
3. Thiết lập MySQL và test CRUD inventory.
4. Tạo Python FastAPI service với `/health` và `/scan`.
5. Thiết lập API contract Node ↔ Python.
6. Tích hợp một luồng scan từ React đến Python và trả kết quả.
7. Test end-to-end với Docker Compose.

## Related Documents

- [08-architecture/07_Architecture_Components_and_Alternatives.md](07_Architecture_Components_and_Alternatives.md)
- [08-architecture/ADR-001-modular-monolith.md](ADR-001-modular-monolith.md)
- [08-architecture/ADR-002-storage-orm.md](ADR-002-storage-orm.md)
- [08-architecture/ADR-004-ocr-boundary.md](ADR-004-ocr-boundary.md)
- [08-architecture/components.md](components.md)
- [08-architecture/deployment.md](deployment.md)
- [07-api/integration-contract.md](../07-api/integration-contract.md)
