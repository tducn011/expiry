# OCR Standard Test Fixtures (Expiry Project)

Bộ ảnh mẫu chuẩn hóa độ phân giải cao phục vụ kiểm thử OCR nhận diện Hạn sử dụng (HSD/EXP) và Ngày sản xuất (NSX/MFG).

| Tên File | Tiêu Đề Mẫu | Định Dạng Date | Kết Quả Mong Đợi |
| :--- | :--- | :--- | :--- |
| `sample-01-vietnamese-dairy-hsd.png` | Vinamilk 100% Fresh Milk | `NSX: 15/10/2026` <br> `HSD: 15/04/2027` | **HSD:** `2027-04-15` (Tự động ưu tiên HSD thay vì NSX) |
| `sample-02-iso-standard-exp.png` | Heinz Tomato Ketchup | `EXP: 2027-01-20` | **EXP:** `2027-01-20` (Chuẩn ISO YYYY-MM-DD) |
| `sample-03-best-before-date.png` | Premium Oat Milk | `BEST BEFORE: 28/12/2026` | **Best Before:** `2026-12-28` (Định dạng Anh / Châu Âu DD/MM/YYYY) |
| `sample-04-use-by-format.png` | Fresh Salmon Fillet | `USE BY: 15/11/2026` | **Use By:** `2026-11-15` |
| `sample-05-vietnamese-dot-format.png` | Bánh Mì Que Pháp | `HSD: 30.12.2026` <br> `NSX: 30.10.2026` | **HSD:** `2026-12-30` (Định dạng chấm DD.MM.YYYY phổ biến ở VN) |
| `sample-06-printed-stamp-mfg-exp.png` | Soy Sauce Premium | `MFG: 2026-09-01` <br> `EXP: 2027-09-01` | **EXP:** `2027-09-01` |
