# Sub-issue i2c: Python Scan Service Barcode Parameter & Vision Fallback

- **Parent Issue**: [i2: Barcode Scanning & Vision Date Extraction Support](./i2.md)
- **Assignee**: Antigravity (`@tducn110`)
- **Status**: **READY TO CLAIM**
- **Branch**: `feature/barcode`
- **Target Branch**: `develop`
- **Date**: 2026-10-19

---

## 1. Khung Sub-issue (Framework)

### INPUT
- Service files:
  - `services/python-scan/app/routes/scan.py`
  - `services/python-scan/app/scanner/date_parser.py`
  - `services/python-scan/app/scanner/vision_llm_adapter.py`
  - `services/python-scan/tests/test_scanner.py`

### VẤN ĐỀ RA SAO? (Problem Statement)
- Trên các bao bì thực phẩm có bề mặt bóng, cong hoặc bị nhăn gập, OCR Tesseract truyền thống thường không đọc được định dạng ngày tháng (tỷ lệ thất bại ~35%).
- Nếu người dùng đã quét được mã vạch (ví dụ: tiền tố GS1 `893` là hàng Việt Nam, `880` là Hàn Quốc, `490` là Nhật Bản), dịch vụ quét có thể tận dụng manh mối này để suy đoán định dạng ngày mặc định (DD/MM/YYYY vs YYYY/MM/DD).
- Đồng thời, khi cả DateReg và Tesseract đều không phát hiện được ngày hết hạn hợp lệ, dịch vụ cần có cơ chế fallback thông minh gọi `vision_llm_adapter` để phân tích ngữ nghĩa hình ảnh trước khi trả về kết quả rỗng.

### OUTPUT
1. Cập nhật route `POST /scan` trong FastAPI:
   - Tiếp nhận tham số tùy chọn `barcode: Optional[str] = None`.
2. Cập nhật `app/scanner/date_parser.py`:
   - Hàm `normalized_candidates`: Tích hợp logic nhận diện định dạng ngày theo quốc gia từ tiền tố mã vạch GS1.
3. Cập nhật `app/scanner/vision_llm_adapter.py`:
   - Trích xuất candidate an toàn với timeout giới hạn (<= 2.5s) để không làm block client.
4. Bổ sung test cases trong `services/python-scan/tests/test_scanner.py` để xác nhận cả fast-path và fallback path.

### FINAL CONTRACT
- Response `ScanResult`:
  ```json
  {
    "raw_text": "HSD 25/12/2026",
    "candidates": [
      {
        "food_name": "Sữa tươi tiệt trùng",
        "expiry_date": "2026-12-25",
        "certainty": "exact"
      }
    ],
    "warnings": []
  }
  ```

### LÀM SAO ĐỂ NHẬN ĐỊNH OUTPUT ĐÚNG HAY SAI (VERIFICATION)
1. **Python Scan Unit Tests**:
   ```bash
   docker run --rm -v ./services/python-scan:/app expiry-python-scan python -m unittest discover tests
   ```
   *Tiêu chí đạt*: Tất cả test assertions trong `test_scanner.py` đều PASS.
2. **Endpoint Smoke Test**:
   - Gửi ảnh mẫu bao bì kèm param `barcode=8934567890123` qua `POST /api/v1/scans` -> Nhận diện chính xác định dạng ngày Việt Nam.
