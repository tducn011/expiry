# Rà soát UI, icon và xử lý ảnh — 06/11/2026

Nguồn đầu vào là `develop@2f401d3ed9469965f6bb690fcba559baf967c47c` sau khi gom
toàn bộ nhánh. Lần này triển khai icon Lucide và cách tải bộ đọc mã vạch; phần
luồng ảnh bên dưới là đánh giá hiện trạng, không phải tuyên bố đã sửa các lỗi OCR.
Context `.tmb` là công cụ làm việc local, có trạng thái kiểm tra riêng.

Đã quét 55 file nguồn web, cộng HTML và favicon. Đã bỏ 65 component SVG tự vẽ,
23 hình vẽ trong registry cũ, logo Clock-e tự vẽ, 6 icon SVG viết trực tiếp trong
Insight/bộ lọc, emoji/ký hiệu danh mục và spinner CSS. Các màn hình nhập icon trực
tiếp từ `lucide-react@1.70.0`. Adapter `components/ui/Icon.tsx` còn giữ API tên icon
cho Button/Shell cũ nhưng chỉ trỏ tới component Lucide; không còn dữ liệu đường vẽ.
Hai header đăng nhập và favicon dùng Timer từ cùng thư viện. Một SVG biểu đồ dữ
liệu trong Insight được giữ nguyên. Ảnh nhãn do người dùng chọn vẫn là nội dung.

Kiểm kê chi tiết từng file và từng import được lưu local tại
`.tmb/tasks/UI-LUCIDE-20261106/ui-icon-inventory.json`; có thể chạy lại bằng
`node .tmb/tasks/UI-LUCIDE-20261106/audit-ui-icons.mjs`. Kiểm tra chính sách icon:
PASS, không có SVG icon tự vẽ, emoji icon hay thư viện icon thứ hai trong nguồn UI.
Lucide chỉ đưa các icon được import vào bundle theo
[tài liệu React chính thức của Lucide](https://lucide.dev/guide/react).

Các vùng đã đối chiếu gồm Inventory, StorageView, Attention, Detail, FoodForm,
Scanner, ManualBarcodeModal, GoogleReminderPicker, InsightView, History, Trash,
Notifications, Settings, AuthForm, Onboarding, FoodCard; cùng các primitive/layout,
trạng thái loading/error/empty và entry point desktop/mobile.

Browser preview dùng dữ liệu mẫu, không ghi backend. Đã mở các trang chính ở
390 px và desktop, kiểm tra icon, tràn ngang, form review, đăng nhập, chi tiết và
calendar nhắc nhở. Icon trong DOM đều có class Lucide; ngoại lệ SVG duy nhất là
biểu đồ dữ liệu. Hai header auth đều render Timer. Ảnh screenshot desktop/mobile
đã được quan sát trực tiếp; kết quả DOM và fixture được giữ trong evidence local.

Build trước đây tải cả ZXing ngay khi mở trang, do `lib/barcode.ts` import tĩnh
hai package đọc mã. Nay factory đọc mã và reader dùng chung được tạo bất đồng bộ,
chỉ import ZXing khi native detector không giải được và cần fallback. Các hàm
tra catalog, checksum và nhập mã bằng tay vẫn không cần tải decoder.

| Build production | Trước | Sau |
| --- | ---: | ---: |
| JS khởi động, minified | 944,43 kB | 471,60 kB |
| JS khởi động, gzip theo build | 257,81 kB | 136,26 kB |
| JS decoder tải khi cần, minified | Gộp vào file chính | 453,90 + 26,86 kB |
| Cảnh báo chunk vượt 500 kB | Có | Không |

Đây là giảm phần tải khởi động, không phải giảm một nửa tổng JS nếu sau đó dùng
ZXing. Browser xác nhận mở Inventory và chuyển qua các trang, kể cả mở Scanner,
chưa tải hai chunk decoder. Khi chọn PNG chứa QR fixture hợp lệ, hai chunk mới
được tải, mã `8935001710012` đọc được và chuyển đến form review. OCR trong bước
này được stub; request thực trong browser gửi đúng file PNG 2.983 byte.

Cơ chế xử lý ảnh hiện tại có hiệu quả giảm upload nhưng chưa tối ưu toàn bộ.
Ảnh file được decode, giữ nguyên nếu đã nhỏ và hợp lệ, hoặc thu cạnh dài xuống
tối đa 1.920 px, thử JPEG quality 0,85 đến 0,35 rồi giảm tiếp kích thước để đạt
dưới 1.000.000 byte. Preview được tạo từ đúng file upload. Batch xử lý tuần tự.
Camera live dùng chính sách riêng: frame tối đa 1.200 px, JPEG quality 0,8.
Node nhận tối đa 5 MiB, kiểm MIME/chữ ký rồi base64 hóa để gửi Python; Python
tiền xử lý, OCR và có thể dùng Vision. Kết quả là ứng viên để đưa vào form.

| Ảnh tổng hợp trên Chromium desktop | Trước | Sau | Chuẩn bị ảnh |
| --- | --- | --- | ---: |
| Nhãn 640 × 480 | PNG 12.583 byte | Giữ nguyên | 3,8 ms |
| Nhãn 4.000 × 3.000 | PNG 266.141 byte | JPEG 1.920 × 1.440, 27.906 byte | 79,6 ms |
| Nhiễu 4.000 × 3.000 | PNG 35.299.896 byte | JPEG 1.920 × 1.440, 841.373 byte | 339,9 ms |
| Nhãn 8.000 × 6.000 | PNG 977.817 byte | JPEG 1.920 × 1.440, 28.468 byte | 215,1 ms |

Các thời gian là một lượt đo cho mỗi fixture trên Chromium 157/Linux, không phải
p50/p95 hay tốc độ điện thoại. Chỉ đo `prepareScanImage`, không tính OCR/network.
Ảnh nhiễu giảm khoảng 97,6% số byte. Ảnh hỏng bị từ chối decode, không upload.
Chưa có bộ nhãn thật với đáp án chuẩn để kết luận độ chính xác HSD sau nén.

Các phát hiện ảnh còn mở được ưu tiên như sau. P1/P2 là đề xuất ưu tiên sửa trong
review này; các lỗi đã tồn tại ở baseline, không do thay bộ icon tạo ra.

| ID / ưu tiên | Phát hiện, cơ chế và ảnh hưởng | Cần sửa / bằng chứng |
| --- | --- | --- |
| IMG-01 / P1 | Nhánh Vision `return vision` trước validator chung của `ApiClient.scan`. Probe nhận ngày không tồn tại `2026-02-31`; validator chạy 0 lần. Khi thay toàn kết quả bằng Vision, tên/NSX hợp lệ từ backend còn có thể mất. | Gom mọi nhánh về cùng validator và merge theo trường. Source: `apps/web/src/api/client.ts`, `scan` và `callClientGeminiVision`. Probe P03. |
| IMG-02 / P1 | Quyền camera có thể trả về sau khi rời Scanner; `start()` vẫn gán stream mà không kiểm generation lại. Probe thấy 0 lần dừng track trong trường hợp này. | Kiểm generation sau `getUserMedia`, dừng stream đến muộn. Source: `Scanner.start`/cleanup. Probe P01. |
| IMG-03 / P1 | Batch thiếu guard ngay sau decode mã vạch; hủy tại đó vẫn gửi thêm 1 upload dù không điều hướng bằng kết quả cũ. Request đang chạy chưa nhận tín hiệu hủy từ màn hình. | Guard trước mọi side effect, truyền AbortSignal xuyên các nhánh scan. Source: `Scanner.recognizeBatch`, `FoodForm.handleScanHsdPhoto`, `ApiClient.scan`. Probe P02. |
| IMG-04 / P2 | Crop mã vạch tính tọa độ theo ảnh đã thu về 960 px nhưng lại cắt trực tiếp ảnh gốc. Với ảnh 4.000 × 3.000, crop giữa dùng `(144,108,672,504)` thay vì khoảng `(600,450,2800,2100)`; crop đáy cũng sai. | Cắt trên canvas đã thu nhỏ hoặc quy đổi về hệ tọa độ ảnh gốc. Source: `lib/barcode.ts`, các pass center/bottom/rotate. Đã ghi nhận `drawImage` thực trong browser. Native/full-image pass vẫn có thể thành công; chưa đo tỷ lệ đọc mã bị ảnh hưởng. |
| IMG-05 / P2 | Timeout request chính không bao trùm direct `/scan` và các lần thử Vision; hủy request Node cũng chưa chứng minh dừng job Python. | Một deadline/AbortSignal cho toàn tác vụ, giới hạn retry và truyền hủy đến owner phù hợp. Probe P04 xác nhận direct fallback không có signal; stub pending 25 ms không phải thời gian timeout production. |
| IMG-06 / P2 | Giới hạn 1 MB là đầu ra; browser decode ảnh gốc trước khi resize, chưa giới hạn pixel/byte đầu vào. Batch và ảnh HSD giữ nhiều preview base64. Fixture khó nén giả lập gây 60 lần encode. | Chọn ngân sách pixel, số ảnh và số encode; quản lý preview/object URL và release. Một buffer RGBA 48 MP đã cần khoảng 183 MiB theo phép tính, chưa phải RAM đỉnh đo thực tế. Probe P05 dùng metadata giả, không cấp phát ảnh 144 MP/1 GB. |
| IMG-07 / P2 | Camera encode hai lần cho preview/upload; Node base64 hóa, Python tạo PNG trung gian; Vision có thể lặp ở server và browser. | Đo từng công đoạn rồi bỏ encode/decode/call lặp. Base64 có thêm khoảng 33% ký tự so với binary, chưa đồng nghĩa RAM tăng đúng 33%. |
| IMG-08 / P2 | Batch không có giới hạn/backoff phù hợp limiter 10 request/phút. Scan mount trước auth nên limiter ở đường này dùng IP; nhiều người cùng mạng chia quota. | Đồng bộ chính sách batch, 429/backoff và giới hạn OCR concurrency. Source: `scan.routes.mjs`, `app.mjs`, Python threadpool. Chưa load-test nhiều người. |
| IMG-09 / P2 | Hạ tầng OCR thiếu có thể bị đổi thành lỗi ảnh không đọc được. Probe biến `OCR_ENGINE_UNAVAILABLE`/503 thành `NO_LEGIBLE_TEXT`/422. | Giữ nguyên nhóm lỗi hạ tầng qua fallback để UI hướng dẫn đúng. Python `process_scan`; probe P06. |

Thứ tự hợp lý là IMG-01 → IMG-02/03 → IMG-04 → deadline/bộ nhớ/quota → đo chất
lượng. Trước khi giảm chất lượng hoặc tăng độ phức tạp xử lý, cần bộ nhãn có đáp
án cho chữ nhỏ, phản sáng, dot-matrix, EXIF, NSX/HSD và ngày mơ hồ; đo tỷ lệ đúng
từng trường, gán sai HSD và latency p50/p95. Thay ảnh tổng hợp bằng nhãn thật là
điều kiện để kết luận tối ưu OCR, không thể suy từ số byte giảm.

Các probe chạy source thật cố định ở baseline với codec/camera/network/OCR stub;
không gọi AI thật, không dùng credential, không ghi DB. Harness và actual results:
`.tmb/tasks/UI-LUCIDE-20261106/image-audit/`. Browser benchmark chạy helper hiện
hành; raw drawImage đã xác nhận lỗi crop vẫn còn sau thay đổi lazy decoder.
[MDN drawImage](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage)
mô tả các tham số hình chữ nhật nguồn/đích làm cơ sở đối chiếu hệ tọa độ.

Trạng thái context local và kiểm tra bàn giao cuối được ghi trong
`.tmb/tasks/UI-LUCIDE-20261106/WORK-REPORT.md` và `VERIFICATION.json`. Bản gốc tài
liệu thiếu được giữ thành vấn đề còn mở; snapshot mới không tự khôi phục lịch sử
hoặc chứng minh runtime/production.
