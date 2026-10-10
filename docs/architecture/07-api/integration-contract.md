# DOC-SCAN-CONTRACT — Python Scan Service Integration Contract

- Document ID: `DOC-SCAN-CONTRACT`
- Status: **Approved**
- Updated: 2026-10-10T18:00:00+07:00

## Purpose

Quy định hợp đồng kỹ thuật và giao diện API nội bộ (`contracts/scan-api.yaml`) giữa **Node.js Backend (Modular Monolith)** và **Python Scan Service (FastAPI)** phục vụ chức năng tiền xử lý ảnh, OCR và trích xuất dữ liệu hạn dùng.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)
- [08-architecture/07_Architecture_Components_and_Alternatives.md](../08-architecture/07_Architecture_Components_and_Alternatives.md)
- [08-architecture/ADR-004-ocr-boundary.md](../08-architecture/ADR-004-ocr-boundary.md)
- [08-architecture/ADR-006-hybrid-architecture.md](../08-architecture/ADR-006-hybrid-architecture.md)

## Architecture Boundary & Invariants

```text
[React UI] 
   │  (Upload multipart image)
   ▼
[Node.js Backend: modules/scan]
   │  (Internal HTTP call: POST http://python-scan:8000/scan)
   ▼
[Python Scan Service: FastAPI]
   ├── 1. preprocess.py (Làm sạch, xoay, tăng tương phản)
   ├── 2. ocr.py (Tesseract OCR Engine)
   └── 3. parser.py (Regex match ngày hết hạn & tên)
   │
   ▼  (JSON response: candidates & raw text)
[Node.js Backend]
   │  (Trả ScanResult về UI để User Review & Edit)
   ▼
[React UI] (User kiểm tra -> Bấm Confirm -> Gọi POST /api/v1/food-entries lưu vào MySQL)
```

> [!IMPORTANT]
> **Quy tắc bất biến:**
> 1. **Stateless:** Python Scan Service hoàn toàn phi trạng thái. Không lưu ảnh trên đĩa cứng lâu dài.
> 2. **Không chạm Database:** Python Scan Service **không kết nối tới MySQL**. Mọi thao tác lưu dữ liệu đều do Node.js Backend đảm nhận sau khi người dùng xác nhận.
> 3. **Không ML/DL/LLM:** Dịch vụ không chứa pipeline huấn luyện, không tải mô hình AI cồng kềnh, không gọi external LLM API. Chỉ dùng OpenCV/Pillow, Tesseract và regex heuristics có thể kiểm thử xác định.

---

## Contract Endpoints

### 1. `GET /health`
- **Mục đích:** Health check (Liveness & Readiness probe) cho Docker Compose và Node.js adapter.
- **Request:** Không có tham số.
- **Response (200 OK):**
  ```json
  {
    "status": "healthy",
    "service": "python-scan",
    "version": "1.0.0",
    "tesseract_available": true
  }
  ```

### 2. `POST /scan`
- **Mục đích:** Nhận dữ liệu ảnh, tiền xử lý, chạy OCR và trích xuất các trường ứng viên.
- **Content-Type:** `multipart/form-data` (form field `file`) hoặc `application/json` (với `image_base64`).
- **Headers:**
  - `X-Correlation-ID`: Chuỗi UUID để correlate log giữa Node.js và Python.
- **Giới hạn đầu vào:**
  - Kích thước tối đa: 5MB.
  - Định dạng: JPEG, PNG, WebP.
  - Độ phân giải khuyến nghị: tối thiểu 800x600, tối đa 4000x4000.
- **SLA thời gian:**
  - Mục tiêu: < 1500ms.
  - Hard timeout phía Node.js: 3000ms.

#### Schema Phản hồi Thành công (200 OK):
```json
{
  "raw_text": "NSX: 10/10/2026\nHSD: 25/12/2026\nLOT: 884B",
  "candidates": {
    "food_name": null,
    "expiry_date": {
      "value": "2026-12-25",
      "date_certainty": "exact",
      "date_label_type": "expiry",
      "source_text": "25/12/2026",
      "alternatives": [],
      "ambiguous": false,
      "requires_confirmation": true
    },
    "manufactured_date": {
      "value": "2026-10-10",
      "source_text": "10/10/2026"
    }
  },
  "warnings": [],
  "errors": [],
  "execution_time_ms": 420
}
```

#### Schema Phản hồi khi ngày bị nhập nhằng (Ambiguous Date - 200 OK):
```json
{
  "raw_text": "EXP 03/04/26",
  "candidates": {
    "food_name": null,
    "expiry_date": {
      "value": null,
      "date_certainty": "inferred",
      "date_label_type": "expiry",
      "source_text": "03/04/26",
      "alternatives": [
        "2026-04-03",
        "2026-03-04"
      ],
      "ambiguous": true,
      "requires_confirmation": true
    }
  },
  "warnings": [
    "AMBIGUOUS_DATE_FORMAT_DAY_MONTH_REVERSIBLE"
  ],
  "errors": [],
  "execution_time_ms": 380
}
```

#### Mã lỗi (Error Responses):
| HTTP Status | Error Code | Ý nghĩa |
| :--- | :--- | :--- |
| `400 Bad Request` | `INVALID_IMAGE_BYTES` | Dữ liệu tải lên bị hỏng hoặc không thể giải mã hình ảnh. |
| `413 Payload Too Large` | `IMAGE_TOO_LARGE` | Dung lượng ảnh vượt quá 5MB. |
| `415 Unsupported Media` | `UNSUPPORTED_FORMAT` | Không hỗ trợ định dạng ảnh (chỉ chấp nhận JPEG, PNG, WebP). |
| `422 Unprocessable` | `NO_TEXT_DETECTED` | Ảnh quá mờ, không tìm thấy ký tự văn bản nào. |
| `500 Server Error` | `OCR_ENGINE_ERROR` | Lỗi nội bộ trong quá trình thực thi Tesseract. |

---

## File Machine-Readable

Contract OpenAPI chuẩn định dạng YAML được lưu trữ tại:
```text
contracts/scan-api.yaml
```

## Decisions and rationale

[D] Quyết định tách biệt Python Scan Service và chuẩn hóa qua `scan-api.yaml` đảm bảo sự độc lập tuyệt đối giữa 2 service:
1. Node.js backend không bị phụ thuộc vào môi trường Python/C-bindings.
2. Python Scan Service có thể kiểm thử tự động độc lập bằng pytest và fixtures ảnh giả lập.
3. Người dùng luôn là người kiểm duyệt cuối cùng trước khi ghi nhận bất kỳ dữ liệu nào vào database.

## Dependencies

- [08-architecture/ADR-004-ocr-boundary.md](../08-architecture/ADR-004-ocr-boundary.md)
- [08-architecture/ADR-006-hybrid-architecture.md](../08-architecture/ADR-006-hybrid-architecture.md)
- [07-api/06_API_Routes_and_Contracts.md](06_API_Routes_and_Contracts.md)

## Verification criteria

- Endpoint `/health` trả về `{"status":"healthy"}`.
- Kiểm thử unit test `test_scan_endpoint` với ảnh mẫu test fixture trả về kết quả đúng cấu trúc `candidates` và `warnings`.
- Khi Python service mất kết nối, Node.js fallback an toàn thông báo người dùng nhập tay mà không làm crash server.
