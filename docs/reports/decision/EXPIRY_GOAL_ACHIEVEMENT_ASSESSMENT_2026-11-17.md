# Expiry — Đánh giá khả năng đạt mục tiêu (G0–G5, BG-MUA, BG-DUYTRI)

Ngày: 17/11/2026. Căn cứ: `EXPIRY_FINAL_DECISION_SPEC.tex`, bộ SE baseline V2, và đọc mã nguồn
hiện tại (`apps/api`, `apps/web/src`, `database/mysql/migrations/001–010`).

**Mức bằng chứng.** Kết quả dưới đây từ đọc mã và `grep`, không chạy ứng dụng, không chạy
test, không có số đo người dùng. Web đang có nhiều thay đổi chưa commit, nên trạng thái có thể
đổi. Không dùng tài liệu này làm bằng chứng nghiệm thu.

## 1. Kết luận ngắn

| Câu hỏi | Trả lời |
|---|---|
| Spec có đủ cơ chế để đạt G0? | Một nửa. Có đường từ G0 xuống UC, BR, NFR. Nhưng hai chỉ số của G0 chưa đo được bằng đặc tả hiện tại (mục 3). |
| Mã nguồn hiện tại đạt được G0 chưa? | Chưa, và chưa thể khẳng định. Thiếu nhắc hạn phía máy chủ, thiếu đối chiếu mua sắm, thiếu số đo. |
| Nền tảng nào đã vững? | Ghi lượng (dùng, bỏ, điều chỉnh), ràng buộc dữ liệu, chống ghi lặp, xóa mềm và khôi phục, danh sách cần chú ý. |
| Khoảng trống lớn nhất? | Nhắc nhở (UC-21..23), mua sắm và đối chiếu (UC-30/31), sửa sai lịch sử (UC-28), xóa vĩnh viễn và dọn nền (UC-13), tách nhóm nguyên tử (C01). |

## 2. Hiện trạng 31 UC so với mã nguồn

Mức: **Có** = thấy đủ đường chính trong mã; **Một phần** = có nhưng thiếu hành vi spec đòi;
**Thiếu** = không thấy. Tổng: 14 Có, 11 Một phần, 6 Thiếu.

| UC | Mức | Bằng chứng / điều còn thiếu |
|---|---|---|
| 01 Đăng ký | Có | `POST /register`, có `Onboarding` với Bỏ qua. Chưa kiểm tự cấp phiên (C02.2). |
| 02 Đăng nhập | Một phần | `POST /login` có. Không thấy nút “Đăng ký ngay” điền sẵn email, không thấy thông báo “Tài khoản chưa tồn tại”. |
| 03 Đọc ảnh | Có | `POST /scans`, `/scan`; Scanner chuyển sang FoodForm. |
| 04 Đọc máy ảnh | Có | Scanner; chưa kiểm dự phòng 3 lần (BR-C02). |
| 05 Nhập và lưu | Có | `POST /food-entries`; khóa chống ghi lặp qua `api_requests`. |
| 06 Danh sách | Có | `GET /food-entries` có lọc và phân trang. |
| 07 Tìm kiếm | Có | Tìm và mã vạch ở web. |
| 08 Chi tiết | Có | `GET /food-entries/:id`, màn Detail. |
| 09 Sửa thông tin | Một phần | `PATCH` có. Spec khóa ô số lượng; form thêm/sửa vẫn có ô số lượng. Chưa xác nhận khóa ở chế độ sửa. |
| 10 Vào thùng rác | Một phần | Xóa mềm và hộp xác nhận có. Không thấy hộp hai lựa chọn “hỏng/vứt” và “nhập nhầm”. |
| 11 Xem thùng rác | Có | `GET /trash/food-entries`; màn Trash. |
| 12 Khôi phục | Có | `POST /restore`. Vị trí mồ côi không xảy ra vì `storage_location` là chuỗi tự do. |
| 13 Xóa vĩnh viễn | Thiếu | Không có route xóa vĩnh viễn, không có tiến trình dọn 02:00, không có `purge_manifest`. Màn Trash có nút nhưng ghi “khỏi thiết bị”. |
| 14 Tạo nơi lưu trữ | Một phần | Chỉ là cột chuỗi; quản lý nơi ở `StorageView` dùng `localStorage`, không có bảng ở máy chủ. |
| 15 Đổi tên nơi | Một phần | Như UC-14. |
| 16 Xóa nơi | Một phần | Như UC-14; “Chưa chọn nơi” là giá trị mặc định của cột. |
| 17 Tạo danh mục | Một phần | Có cột `category` (migration 005); không có bảng danh mục riêng. |
| 18 Món cần chú ý | Có | `attention_status` trong truy vấn danh sách; màn Attention. |
| 19 Ghi ngày mở | Một phần | Có `opened_on` và trường ở form. Không có tách nhóm nguyên tử C01. |
| 20 Hẹn kiểm tra | Có | `review_at` (migration 010), thao tác trong Detail. |
| 21 Xem/đọc thông báo | Thiếu | Chỉ thấy thông báo thử của trình duyệt trong Settings; không có bảng/route thông báo. |
| 22 Hoãn nhắc | Thiếu | Không có route hay trạng thái hoãn. |
| 23 Cài đặt nhắc | Một phần | Có `remindDays` và quyền trình duyệt trong Settings; `/me/preferences` có. Không có lịch phát 09:00. |
| 24 Đã dùng | Có | `POST /movements` loại `consume`; ràng buộc CHECK. |
| 25 Đã bỏ | Có | Loại `discard`. |
| 26 Kiểm kê | Có | `POST /recounts`, loại `adjustment`. Chưa kiểm ngữ nghĩa mốc neo C05.1. |
| 27 Thống kê | Một phần | Màn Insights có tỷ lệ theo đơn vị. Tỷ lệ tổng tính `100 − tiêu thụ`, chưa đúng công thức spec; không có bản ghi ẩn danh của món đã xóa vĩnh viễn. |
| 28 Lịch sử và sửa sai | Thiếu | Chỉ `GET /history` và `POST /movements`; không có route sửa sự kiện cũ. |
| 29 Thêm lại | Một phần | History và FoodForm có “Thêm lại”. Chưa xác nhận xóa trắng HSD và ngày mở. |
| 30 Danh sách mua | Một phần | `shoppingStorage.ts` dùng `localStorage`, có sẵn dữ liệu mẫu. Không đồng bộ giữa máy, không có API. |
| 31 Đối chiếu kho | Thiếu | Không thấy cảnh báo “Trong kho hiện đang có…”, không có trạng thái “Không kiểm tra được”. |

Khác biệt tên: spec dùng `operation_id`; mã dùng khóa `Idempotency-Key` và bảng `api_requests`.
Về ý nghĩa là cùng cơ chế chống ghi lặp, nhưng spec cần thống nhất tên.

## 3. Từng mục tiêu

| Mục tiêu | Khả năng đạt | Lý do |
|---|---|---|
| **G0** Giảm lãng phí, tiết kiệm chi tiêu | **Chưa đạt, chưa đo được** | Xem bên dưới. |
| G1 Biết đang có gì | Có thể đạt | UC-05..08 có. M01 (< 5 s) chưa đo. |
| G2 Chọn món cần chú ý | Đạt một phần | Danh sách chú ý có. Nhắc, hoãn, thông báo (UC-21..23) thiếu nên người dùng phải tự mở app. |
| G3 Số lượng sát thực tế | Nền tảng tốt, chưa đủ | Có sự kiện dùng/bỏ/điều chỉnh, CHECK, `version`, khóa chống lặp. Thiếu tách nhóm nguyên tử (C01) và ngữ nghĩa mốc neo. |
| G4 Dữ liệu kiểm tra được | Đạt một phần | Có lịch sử và khôi phục. Thiếu sửa sai (UC-28), xóa vĩnh viễn và `purge_manifest`. |
| G5 Hiểu tiêu dùng | Đạt một phần | Insights có; công thức cần chỉnh theo C05 / UC-27. |
| BG-MUA Giảm mua trùng | Yếu | Mua sắm chỉ ở trình duyệt, chưa có đối chiếu. |
| BG-DUYTRI Công sức thấp | Chưa đo | Thao tác dùng/bỏ có sẵn. Thiếu nhắc làm yếu động lực quay lại. CỔNG-01..07 chưa đo. |

### Vì sao G0 chưa đạt và chưa đo được

1. **Nửa “tiết kiệm chi tiêu” không có dữ liệu.** Không có trường giá hay chi phí ở bảng `food_entries`. BR-C22 còn cấm tự quy đổi tiền tiết kiệm. Hệ thống chỉ ghi nhận lượng, nên nửa này chỉ đo được bằng khảo sát ngoài hệ thống.
2. **“Giảm 25–30% sau 30 ngày” cần mốc gốc.** Spec không có bước ghi lượng bỏ trước khi dùng app. Không có mốc gốc thì phần trăm giảm không tính được.
3. **“Tiêu thụ trước hạn ≥ 85%” chưa có công thức.** Dữ liệu cần có sẵn (`stock_movements.recorded_at`, `expiry_date`), nhưng spec chưa định nghĩa phép tính (theo số bản ghi hay theo lượng, cách xử lý món thiếu HSD).
4. **Trụ cột 3 (xử lý kịp thời) phụ thuộc nhắc hạn**, mà nhắc hạn phía máy chủ chưa có.
5. **Trụ cột 1 (phòng mua thừa) phụ thuộc UC-30/31**, hiện chỉ ở trình duyệt và chưa đối chiếu.

## 4. Việc cần làm để G0 có thể đạt (theo thứ tự ảnh hưởng)

1. Bổ sung định nghĩa đo cho G0: công thức “tiêu thụ trước hạn”, cách lấy mốc gốc lãng phí, cách xử lý nửa chi tiêu (khảo sát ngoài hệ thống). Cần quyết định của Chủ nhiệm Dự án.
2. Làm nhắc hạn có phía máy chủ: UC-21..23 và bảng thông báo (BR-C06..C08).
3. Đưa mua sắm lên máy chủ và làm đối chiếu kho (UC-30/31, BR-C17..C19).
4. Đóng khoảng trống dữ liệu: UC-28 sửa sai, UC-13 xóa vĩnh viễn kèm `purge_manifest`, C01 tách nhóm nguyên tử.
5. Chỉnh công thức Insights theo UC-27 và khóa ô số lượng ở UC-09; thêm hộp hai lựa chọn ở UC-10.
6. Chạy đo CỔNG-01..07 với người dùng thật theo TR-C05.

Mỗi mục trên là thay đổi mã hoặc cơ sở dữ liệu. Theo `AGENTS.md`, cần đưa vào `ROADMAP.md`
và được phép riêng trước khi làm; không có thay đổi nào được thực hiện trong tài liệu này.
