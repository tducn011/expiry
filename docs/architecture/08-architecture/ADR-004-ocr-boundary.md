# DOC-ADR-004 — Python Scan Service and OCR Execution Boundary

- Document ID: `DOC-ADR-004`
- Status: **Approved**
- Updated: 2026-10-10T18:00:00+07:00

## Purpose

Thiết lập ranh giới kỹ thuật, phương thức thực thi và phạm vi xử lý cho tính năng Scan (tiền xử lý ảnh, OCR và trích xuất thông tin hạn dùng).

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)
- [08-architecture/07_Architecture_Components_and_Alternatives.md](07_Architecture_Components_and_Alternatives.md)
- [07-api/integration-contract.md](../07-api/integration-contract.md)

## Definitions and assumptions

- Người dùng thường gặp khó khăn khi phải nhập tay ngày hết hạn từ bao bì thực phẩm.
- Tính năng scan chỉ đóng vai trò **hỗ trợ trích xuất ứng viên (candidate extraction)**; người dùng luôn có bước xem trước (review & edit) trước khi xác nhận lưu vào kho.
- **Quyết định cốt lõi:** Bỏ toàn bộ các mô hình Deep Learning tùy chỉnh, pipeline huấn luyện (training pipeline), framework đánh giá mô hình (model evaluation) và LLM ra khỏi kiến trúc.

## Analysis

| Khía cạnh | Quyết định & Phân tích |
| :--- | :--- |
| **Vấn đề** | Giảm thiểu ma sát nhập liệu bằng scan nhưng không làm phức tạp hóa hạ tầng, không tăng vọt độ trễ và không phụ thuộc vào các mô hình AI cồng kềnh. |
| **Phương án xem xét** | 1. **Dịch vụ Python FastAPI độc lập** (Chọn).<br/>2. Node.js in-process OCR (Loại bỏ vì C-bindings thiếu ổn định và chặn event loop).<br/>3. LLM API (GPT-4 Vision / Claude) (Loại bỏ do chi phí, độ trễ và rủi ro ảo giác hạn dùng).<br/>4. Custom Deep Learning & Training pipeline (Loại bỏ vì thừa thãi cho phạm vi hiện tại). |
| **Bằng chứng** | Các thuật toán xử lý ảnh truyền thống (OpenCV / Pillow) kết hợp OCR (Tesseract) và regex parser đủ độ chính xác để nhận diện định dạng ngày chuẩn (`DD/MM/YYYY`, `EXP 03/04/26`) mà thời gian phản hồi chỉ dưới 1.5 giây. |
| **Đánh đổi** | Cần vận hành thêm 1 container Python FastAPI và duy trì API contract nội bộ (`scan-api.yaml`). |
| **Quyết định** | **Chấp thuận (Approved):** Xây dựng `services/python-scan` với FastAPI. Cung cấp route `POST /scan` nhận ảnh và trả về dữ liệu bóc tách. |
| **Ranh giới an toàn** | **Python Scan Service hoàn toàn không có quyền truy cập MySQL.** Service này là stateless; ảnh chỉ được xử lý tạm thời trong bộ nhớ và không lưu trữ lâu dài. |

## Decisions and rationale

[D] Quyết định phê duyệt dịch vụ Python Scan chuyên biệt cho OCR và tiền xử lý ảnh. Toàn bộ ML/DL, training, model evaluation và LLM được loại bỏ khỏi hệ thống.

## Dependencies

- [08-architecture/components.md](components.md)
- [07-api/integration-contract.md](../07-api/integration-contract.md)
- [08-architecture/ADR-006-hybrid-architecture.md](ADR-006-hybrid-architecture.md)

## Related documents

- [07-api/integration-contract.md](../07-api/integration-contract.md)
- [contracts/scan-api.yaml](../../../contracts/scan-api.yaml)
- [08-architecture/ADR-006-hybrid-architecture.md](ADR-006-hybrid-architecture.md)

## Verification criteria

- Gửi ảnh hợp lệ lên `POST /scan` trả về kết quả JSON có cấu trúc `raw_text`, `candidates` và `warnings` trong < 2.0 giây.
- Python container không chứa thư viện training nặng (PyTorch, TensorFlow, CUDA) hoặc API key gọi LLM.
- Khởi động Python service hoàn toàn độc lập mà không cần kết nối tới MySQL.
