# DOC-UNSUPPORTED — Unsupported, rejected or deferred proposals

- Document ID: `DOC-UNSUPPORTED`
- Status: **Approved**
- Updated: 2026-10-10T18:00:00+07:00

## Purpose

Tài liệu ghi nhận các đề xuất tính năng và công nghệ đã bị **bác bỏ (Rejected)**, **loại bỏ (Excluded)** hoặc **hoãn lại (Deferred)** trong kiến trúc Expiry, nhằm ngăn ngừa tình trạng mở rộng phạm vi tùy tiện (scope creep) và lạm dụng công nghệ quá mức (over-engineering).

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)
- [00-context/scope.md](../00-context/scope.md)
- [08-architecture/ADR-006-hybrid-architecture.md](../08-architecture/ADR-006-hybrid-architecture.md)

## Classification of Feature & Tech Proposals

| Đề xuất | Giả định nhu cầu ban đầu | Trạng thái | Lý do kỹ thuật & Ranh giới |
| :--- | :--- | :--- | :--- |
| **Custom Deep Learning / Model Training** | Tự huấn luyện mạng nơ-ron nhận diện bao bì và chữ số hạn dùng. | **Bác bỏ (Rejected)** | Không có tập dữ liệu chuẩn được gán nhãn; chi phí huấn luyện GPU lớn; Tesseract OCR và regex parser đã giải quyết tốt mà không cần custom weights. |
| **Model Evaluation Pipeline & Benchmarks** | Xây dựng pipeline tự động tính mAP, loss curves, benchmark độ chính xác mô hình. | **Bác bỏ (Rejected)** | Do đã loại bỏ training model nên pipeline đánh giá mô hình ML trở nên thừa thãi. Kiểm thử chất lượng tập trung vào unit test regex parser và integration contract tests. |
| **Large Language Models (LLM / VLM)** | Dùng GPT-4V/Claude để nhìn ảnh và tóm tắt hạn dùng; hoặc dùng LLM parser JSON. | **Bác bỏ (Rejected)** | Chi phí API cao; độ trễ mạng lớn (>3–5s); rủi ro nghiêm trọng về ảo giác ngày tháng (hallucination) có thể gây ngộ độc thực phẩm. Regex heuristics cho kết quả xác định 100%. |
| **Distributed Queue Cluster (Celery, Redis)** | Hàng đợi tác vụ bất đồng bộ cho việc xử lý ảnh và scan. | **Hoãn lại (Deferred)** | Thêm 2 dịch vụ hạ tầng phức tạp khi lưu lượng hiện tại hoàn toàn xử lý đồng bộ HTTP trong < 1.5s. Kiến trúc hiện tại ưu tiên sync HTTP đơn giản, tin cậy. |
| **Microservices phân mảnh theo từng tính năng** | Tách riêng Expiry Service, Inventory Service, User Service. | **Bác bỏ (Rejected)** | Làm phân mảnh ACID transactions, tăng độ trễ mạng và chi phí vận hành. Giữ mô hình Node.js Modular Monolith. |
| **Tự động gia hạn khi đông đá / mở nắp** | Tự động cộng thêm ngày khi đổi vị trí sang ngăn đông. | **Bác bỏ (Rejected)** | Quy tắc an toàn thực phẩm của FDA/USDA phụ thuộc vào từng loại thực phẩm cụ thể; tự động đoán ngày mà không có nguồn tin cậy là rủi ro. Chỉ cho phép người dùng tự sửa ngày. |
| **Phần cứng cảm biến IoT (Device Sensors)** | Cảm biến mùi/nhiệt độ phát hiện thực phẩm hỏng. | **Bác bỏ (Rejected)** | Nằm ngoài phạm vi phần mềm web/mobile. "Bắt lỗi" chỉ áp dụng cho theo dõi lỗi ứng dụng (Error tracking). |
| **Chia sẻ kho đa người dùng (Shared Household)** | Quản lý chung tủ lạnh gia đình nhiều thành viên. | **Hoãn lại (Deferred)** | Cần mô hình phân quyền và giải quyết xung đột phức tạp; tập trung tối ưu trải nghiệm cá nhân trước. |
| **Thông báo đẩy qua hệ điều hành (OS Push Notifications)** | Nhắc hạn dùng qua background worker / push service. | **Hoãn lại (Deferred)** | Phụ thuộc quyền OS và notification server; ưu tiên hiển thị attention badges và danh sách ưu tiên ngay trong app. |

---

## Chuyển đổi trạng thái tính năng Scan

> [!NOTE]
> Khác với đề xuất "Custom ML/DL OCR" phức tạp trước đây đã bị bác bỏ, tính năng **Assistive Scan tinh gọn** sử dụng **Python FastAPI Service (OpenCV/Pillow + Tesseract + Regex parser)** đã được **CHẤP THUẬN CHÍNH THỨC (Approved)** tại [ADR-004](../08-architecture/ADR-004-ocr-boundary.md) và [ADR-006](../08-architecture/ADR-006-hybrid-architecture.md).

## Decisions and rationale

[D] Quyết định kiên quyết loại bỏ toàn bộ ML/DL, training, model evaluation và LLM giúp Expiry giữ vững tính khả thi, dễ bảo trì và tập trung vào trải nghiệm cốt lõi của người dùng.

## Dependencies

- [00-context/scope.md](../00-context/scope.md)
- [08-architecture/ADR-006-hybrid-architecture.md](../08-architecture/ADR-006-hybrid-architecture.md)

## Related documents

- [00-context/scope.md](../00-context/scope.md)
- [08-architecture/07_Architecture_Components_and_Alternatives.md](../08-architecture/07_Architecture_Components_and_Alternatives.md)
