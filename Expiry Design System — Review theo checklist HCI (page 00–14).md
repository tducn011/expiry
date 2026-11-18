# Expiry Design System — Review theo checklist HCI (page 00–14)

Nov 17, 2026 · @Tam Duc Nguyen

Foundations (00–06) và Components (09–12) đạt phần lớn checklist HCI; page 07, 08 và 14 chưa theo chính quy tắc của hệ thống, và có 3 lỗi cần sửa trước khi publish.

## Đối chiếu checklist HCI

Trong 19 mục rút từ 8 bộ slide (tuần 1–10): 8 mục đạt, 11 mục đạt một phần; riêng prototype của Web đang thiếu.

| # | Tuần | Mục checklist | Kết quả | Bằng chứng trong file |
| --- | --- | --- | --- | --- |
| 1 | 1 | Useful / Usable / Used | Một phần | Có UX gates ở page 00; chưa có bằng chứng "Used" như thử nghiệm với người dùng |
| 2 | 1, 8, 9 | Quy trình: persona, user stories, flow, prototype, usability test | Một phần | Có flow và prototype (page 13); không thấy persona, user stories hay kết quả usability test trong page 00–14 |
| 3 | 2–3 | Thị giác: contrast, màu, không chỉ dựa vào màu | Đạt | 4 theme mode, manifest 32/32 cặp chữ, trạng thái luôn kèm nhãn. Ngoại lệ: page 10, 12, 14 |
| 4 | 2–3 | Đọc và chữ tiếng Việt | Đạt | Be Vietnam Pro, 14 Text Style, test dấu và mô phỏng 200%; test trên thiết bị còn mở |
| 5 | 2–3 | Vận động: Fitts's Law, vùng chạm | Đạt | Vùng chạm 44 px mobile, 24 px web; icon 24 px tách khỏi hit area |
| 6 | 2–3 | Trí nhớ: chunking, nhận biết hơn ghi nhớ | Đạt | Gate "Cognitive load" ở page 00 và 06; filter hiển thị sẵn lựa chọn thay vì bắt nhập |
| 7 | 2–3 | Lỗi: slip và mistake | Đạt | Snackbar Hoàn tác, dialog xóa mặc định focus ở Hủy, giữ dữ liệu đã nhập khi quay lại |
| 8 | 2–3 | Cảm xúc, khác biệt cá nhân | Một phần | Màu botanical dịu, copy thân thiện; chưa test Dynamic Type, VoiceOver, người dùng lớn tuổi |
| 9 | 4–5 | Thiết bị vào/ra: màn hình, camera, bàn phím | Một phần | iPhone 12 (390 × 844), frame responsive 320 và 430, chụp nhãn / mã vạch / nhập tay; chưa quy định loại bàn phím (số, ngày) và phản hồi haptic, âm thanh |
| 10 | 6 | Mô hình Norman: 7 bước, gulf of execution / evaluation | Đạt | Interaction contract Ý định → Hành động → Phản hồi → Phục hồi; 12 trạng thái component |
| 11 | 6 | Kiểu tương tác, thành phần WIMP | Một phần | Có button, checkbox, text field, menu, dialog, snackbar; chưa thấy radio, switch, select / date picker, stepper, tabs trong page 09–12 |
| 12 | 6 | Error & repair, modal dùng thận trọng | Một phần | Dialog đặt focus ở Hủy; nội dung dialog xóa chưa thống nhất giữa page 04, 09, 12, 13 |
| 13 | 7 | Paradigm: ẩn dụ, direct manipulation, đa phương thức | Đạt | Ẩn dụ tủ lạnh / giỏ hàng, checkbox + gạch ngang, camera + mã vạch + nhập tay |
| 14 | 8 | Scenario, navigation, prototype | Đạt (App) · Thiếu (Web) | App: 221 frame, 1.806 liên kết prototype, đủ trạng thái rỗng / lỗi / hoàn tác. Web: 8 màn hình, 0 liên kết |
| 15 | 9 | Nguyên tắc UX: hierarchy, consistency, feedback, confirmation | Một phần | Nguyên tắc rõ ở page 00 và 06; consistency bị phá ở page 07, 08, 14 và ở thuật ngữ (HSD / hạn, Insight / Thống kê) |
| 16 | 9–10 | Style guide: typography, màu, giọng văn, logo, hình ảnh | Một phần | Màu, chữ, UX writing có; logo, hình ảnh, giọng văn chưa thấy (page 00 chủ động hoãn Art Direction) |
| 17 | 10 | UI principles: kiểm soát, thoải mái, giảm tải nhận thức, nhất quán | Một phần | Phần lớn đạt ở App; Web tách khỏi hệ thống token và component |
| 18 | 10 | Interaction & animation | Một phần | Page 08 có token và reduced-motion nhưng chỉ là chữ, chưa có mẫu chuyển động |
| 19 | 10 | Tools: design system, graphic checklist, test case | Một phần | Có page QA 91–96, chưa nằm trong phạm vi review này |

## Lỗi ưu tiên

15 vấn đề: 3 lỗi P0 (sửa trước khi publish), 5 lỗi P1, 7 lỗi P2. Mã trong ngoặc là node ID để tìm nhanh trong Figma.

| # | Mức | Vấn đề | Vị trí | Cách sửa |
| --- | --- | --- | --- | --- |
| 1 | P0 | Filter Control trạng thái Expanded hiển thị khối đen #333333, nhãn "HSD" không đọc được (đã xác nhận bằng ảnh chụp) | Page 10, component set Filter Control (439:45), variant 472:128 | Gắn lại fill và màu chữ của variant vào token surface / text của trạng thái chọn |
| 2 | P0 | Badge đếm thông báo: chữ trắng 11 px trên danger/500 #c97866 chỉ đạt 3,30:1 (cần 4,5:1); dùng primitive thay vì token ngữ nghĩa | Page 12, Sidebar Navigation / Web › Badge (686:289); lặp lại ở page 14 | Dùng token feedback/error (#853426 trên trắng ≈ 8,3:1) hoặc tăng cỡ chữ |
| 3 | P0 | Web Screens có 66/356 chữ không đạt AA, ví dụ placeholder #8c998c trên #fafafa 2,85:1, #bf801a trên #fcf5e5 3,07:1, #808c80 trên trắng 3,51:1 | Page 14, cả 8 màn hình | Gắn lại màu chữ vào text/primary, text/secondary, status/\* |
| 4 | P1 | Web Screens không dùng token: 183/356 chữ và 91/143 fill dùng màu thô; 295/356 chữ không có Text Style; cỡ chữ 11, 13, 15 nằm ngoài 14 style; 339 giá trị padding/gap lệch lưới 4 px; 0 liên kết prototype | Page 14 | Dựng lại từ component và variable như App; ánh xạ 11/13/15 vào Caption, Label, Body |
| 5 | P1 | Page 07 và 08 là bức tường chữ: 0/21 chữ gắn variable, 0 Text Style, fill thô #fff9ee, tiêu đề 36 px ngoài thang chữ (tối đa 28 px), không minh họa, không Auto Layout, header khác các page còn lại | Page 07, 08 | Dựng lại theo khung page 03–06; thêm sơ đồ điều hướng và mẫu chuyển động (duration, easing, reduced-motion) |
| 6 | P1 | Pop-up Thông báo dựng từ frame thô: nút đóng là ký tự "✕", chữ 10–11 px (dưới mức 12 px của thang chữ), overlay #000000 ×6 không có token, Status Badge không phải component | Page 13, "Thông báo (Pop-up)" và Prototype / Overlay | Thay bằng Lucide Close, Status Badge, Notification Card; tạo token overlay/scrim |
| 7 | P1 | Thuật ngữ không thống nhất: "Quá HSD" (Web) và "Quá hạn" (App); "Insight" (Web) và "Thống kê" (App); "Trang chủ" (page 12) và "Hôm nay" (màn hình); dấu "•" (Web) và "·" (App); "n=0" là thuật ngữ hệ thống | Page 12, 13, 14 | Chốt một bộ nhãn trong UX writing (page 06); bỏ "n=0" |
| 8 | P1 | Dialog xóa có 3 tiêu đề ("Xóa Rau bina?", "Xóa vĩnh viễn?", "Xóa món?") và 3 nhãn nút ("Xóa", "Xóa vĩnh viễn", "Xóa khỏi danh sách"); page 04 yêu cầu dialog nêu rõ món bị xóa | Page 04, 09, 12, 13 | Một component dialog có biến tên món; một nhãn nút cho mỗi mức hậu quả |
| 9 | P2 | Chưa thấy radio, switch, select / date picker, stepper số lượng, tabs và trạng thái loading cấp màn hình | Page 09–12 | Bổ sung component hoặc ghi rõ lý do không cần |
| 10 | P2 | Số liệu icon không khớp: page 00 ghi 24, page 05 ghi 27, thực tế 28 component; Bell, User Round, Chart, Camera chưa có thẻ hướng dẫn | Page 00, 05 | Đồng bộ số liệu; thêm 4 thẻ usage |
| 11 | P2 | Giá trị lệch lưới 4 px: page 06 (18), 11 (18), 12 (23), 13 (51), chủ yếu 6, 10, 14 px; thang spacing ở page 03 không có các giá trị này | Page 03, 06, 11, 12, 13 | Thêm token hoặc đưa về 8 / 12 / 16 |
| 12 | P2 | Ký tự dùng thay icon: "⌵", "(!)", "+", ">" trên Web; "✕" trên App | Page 13, 14 | Dùng Lucide Chevron Down, Info, Plus, Chevron Right, Close |
| 13 | P2 | Có hai component bottom navigation (Bottom Navigation và App Bottom Navigation); spec checkbox radius 6 px nhưng page 09–12 dùng 5 px (cần xác nhận) | Page 04, 09–12 | Gộp thành một component; thống nhất radius |
| 14 | P2 | Mục kiểm còn mở trong chính file: clipping và wrap trên màn hình, zoom 200%, Dynamic Type, VoiceOver, Dark / High Contrast trên thiết bị | Page 01, 02 | Chuyển thành test case có người phụ trách (page 96) |
| 15 | P2 | 412/416 chữ ở page 01 và 99/127 chữ ở page 02 chưa dùng Text Style; 134 nhãn 10–11 px ở page 01 | Page 01, 02 | Gắn Caption/Meta (12 px) cho nhãn tài liệu |

## Số liệu theo page

Page 14 là ngoại lệ lớn nhất (dưới 50% chữ gắn variable, 66 chữ lỗi contrast); page 07 và 08 chưa gắn token nào. Các page còn lại gần như tuân thủ.

| Page | Chữ gắn variable | Chữ có Text Style | Chữ lỗi contrast / đã đo | Giá trị lệch lưới 4 px |
| --- | --- | --- | --- | --- |
| 00 Overview & Governance | 58/64 | 58/64 | 0/64 | 0 |
| 01 Color | 328/416 | 4/416 | 0/416 | 0 |
| 02 Typography | 127/127 | 28/127 | 0/127 | 0 |
| 03 Spacing & Layout | 138/138 | 138/138 | 0/138 | 0 |
| 04 Shape & Elevation | 144/144 | 144/144 | 0/144 | 2 |
| 05 Iconography | 71/71 | 71/71 | 0/71 | 0 |
| 06 Interaction & Accessibility | 120/120 | 120/120 | 0/120 | 18 |
| 07 Navigation | 0/21 | 0/21 | 0/16 | 0 |
| 08 Motion | 0/21 | 0/21 | 0/16 | 0 |
| 09 Components / Actions | 33/33 | 33/33 | 0/31 | 0 |
| 10 Components / Forms | 67/67 | 61/67 | 1/43 | 0 |
| 11 Components / Data Display | 83/83 | 68/83 | 0/68 | 18 |
| 12 Components / Navigation & Feedback | 63/65 | 54/65 | 1/54 | 23 |
| 13 App Screens | 2.790/2.813 | 2.790/2.813 | 0/2.813 | 51 |
| 14 Web Screens | 173/356 | 61/356 | 66/356 | 339 |

Lỗi contrast duy nhất ở page 10 là Filter Control Expanded, ở page 12 là badge thông báo (cả hai nằm trong bảng lỗi ưu tiên).

## Review Foundations (page 00–08)

Page 00–06 là phần mạnh nhất của file; page 07 và 08 là hai điểm yếu rõ ràng.

### Page 00 · Overview & Governance

- Tốt: 8 foundation có chủ sở hữu và tiêu chí nghiệm thu; luồng Primitives → Semantic → Component → Product UI; 6 UX gate khớp W9 (hierarchy, consistency, feedback, user control, cognitive load, accessibility); ghi rõ nguồn HCI tuần 8–10 và WCAG 2.2.
- Cần sửa: số icon ghi 24 nhưng page 05 ghi 27 và thực tế có 28 component; chưa có chỗ cho persona, user stories, kết quả usability test (W1, W8).

### Page 01 · Color

- Tốt: Primitive → Semantic, 4 mode (Light, Dark, Light HC, Dark HC); quy tắc 60-30-10; màu trạng thái luôn đi kèm nhãn hoặc icon; bảng contrast 32/32 cặp chữ và 7/7 cặp control đều đạt; 0 lỗi contrast khi đo tự động.
- Cần sửa: 412/416 chữ chưa dùng Text Style và 134 nhãn cỡ 10–11 px (nhỏ hơn mức 12 px của thang chữ); Dark và High Contrast còn "cần kiểm trên thiết bị".

### Page 02 · Typography

- Tốt: 14 Text Style theo vai trò nội dung; Be Vietnam Pro 400/500/600; mẫu dấu tiếng Việt, số, đơn vị ₫ và mô phỏng 200%; quy tắc tránh ALL CAPS cho đoạn dài và không cắt giá tiền bằng dấu ba chấm.
- Cần sửa: 99/127 chữ chưa dùng style (nhãn tài liệu); 4 ô kiểm chưa tick (clipping và wrap, zoom 200%, Dynamic Type / font scaling, VoiceOver / TalkBack); Lora vẫn nằm trong file dù không dùng cho production.

### Page 03 · Spacing & Layout

- Tốt: thang 4–48 px; 3 lớp viewport (4, 8, 12 cột) kèm Grid Style; quy tắc đặt hành động (CTA full-width, Hủy đứng trước) đúng tinh thần Fitts's Law; 100% chữ gắn variable và Text Style.
- Cần sửa: 40/46 frame không dùng Auto Layout dù page nêu quy tắc dùng Auto Layout; thang spacing thiếu 6, 10, 14 px trong khi các page 06, 11, 12, 13, 14 dùng nhiều.

### Page 04 · Shape & Elevation

- Tốt: thang radius theo vai trò; shadow chỉ dành cho lớp nổi; ba mẫu xóa vĩnh viễn, xóa có hoàn tác, đánh dấu hoàn thành — khớp nguyên tắc "make actions reversible" (W10).
- Cần sửa: 2 giá trị 10 px lệch lưới; spec checkbox radius 6 px nhưng page 09–12 có component dùng 5 px (cần xác nhận); mẫu dialog xóa ở đây khác bản component ở page 12.

### Page 05 · Iconography

- Tốt: Lucide 24 px, stroke 2 px; mỗi icon có quy tắc dùng riêng; tách kích thước hiển thị khỏi vùng chạm 44 px; nhắc không dùng icon hoặc màu làm tín hiệu duy nhất cho trạng thái.
- Cần sửa: tiêu đề ghi 27 component, thực tế 28; Bell, User Round, Chart, Camera chưa có thẻ hướng dẫn; tên thẻ bằng tiếng Anh (Home, Trash) trong khi UI tiếng Việt.

### Page 06 · Interaction & Accessibility

- Tốt: 6 nguyên tắc HCI; interaction contract 4 bước; 12 trạng thái component có token tương ứng; ba mẫu phục hồi; ánh xạ WCAG 2.2 (1.4.3, 1.4.11, 2.4.11, 2.5.8); phần UX writing tiếng Việt (ngày dd/MM/yyyy, đơn vị, trạng thái thực phẩm).
- Cần sửa: 18 giá trị lệch lưới (18 px ×12, 10 px ×6).

### Page 07 · Navigation

- Tốt: nội dung đủ ý — nguyên tắc, hành vi App và Web, ma trận responsive, khôi phục trạng thái, kịch bản nghiệm thu.
- Cần sửa: toàn bộ 21 chữ không gắn variable hay Text Style; fill thô #fff9ee; tiêu đề 36 px ngoài thang chữ; không Auto Layout; không có sơ đồ điều hướng nào dù đây là nội dung có hình dạng (cây điều hướng, luồng Back).

### Page 08 · Motion

- Tốt: token duration và easing, 4 Motion style, quy tắc reduced-motion theo WCAG 2.2.2 và 2.3.3.
- Cần sửa: cùng khung và cùng lỗi với page 07; không có mẫu chuyển động hay bảng so sánh duration để người xem thấy được token; phần "Duration tokens" và "Easing tokens" nên là bảng thay vì đoạn chữ.

## Review Components (page 09–12)

Component có cấu trúc variant tốt và gắn token gần như tuyệt đối; điểm yếu là hai lỗi hiển thị và một số component còn thiếu.

### Page 09 · Components / Actions

- Tốt: Button Primary, Secondary, Destructive đủ 2 kích thước × 5 trạng thái (10 variant mỗi bộ); Icon Button 5 trạng thái; Back Button 44 × 44; 100% chữ gắn variable và Text Style; 0 lỗi contrast.
- Cần sửa: Loading Button và Back Button chỉ có một biến thể, chưa có đủ trạng thái; nhãn xóa là "Xóa vĩnh viễn" nhưng dialog ở page 12 dùng "Xóa".

### Page 10 · Components / Forms

- Tốt: Checkbox 9 variant với ô 24 px trong vùng chạm 44 px; Text Field có trạng thái gợi ý, đang nhập, lỗi, khóa; Search Field 6 variant; Filter Control và Filter Menu theo HSD và danh mục; Food Entry Form có lựa chọn "Chưa biết", "Chưa mở" nên không ép nhập dữ liệu người dùng chưa có.
- Cần sửa: Filter Control Expanded bị lỗi hiển thị (P0); 6 chữ trong HSD Filter Menu Item chưa dùng Text Style; "HSD" viết tắt trong nhãn filter; chưa có component riêng cho ngày hết hạn, số lượng, radio.

### Page 11 · Components / Data Display

- Tốt: Status Badge 4 trạng thái (Còn hạn, Sắp hết hạn, Quá hạn, Thông tin) gồm chữ và màu; Food Card 7 variant; Empty State 3 loại, có nút hành động (Thêm thực phẩm, Xóa bộ lọc, Thử lại); bảng tồn kho cho Web (Table Header, Table Row).
- Cần sửa: 15 chữ chưa dùng Text Style; dòng meta ALL CAPS 12 px ("4 HỘP · NGĂN MÁT · TRỨNG & SỮA") trái quy tắc ở page 02; 18 giá trị lệch lưới; 3 chữ mang màu thô #333333, nên kiểm tra cùng nguyên nhân với lỗi Filter Control.

### Page 12 · Components / Navigation & Feedback

- Tốt: Alert 4 loại (thành công, cảnh báo, lỗi, thông tin) đều có nhãn chữ; Snackbar Hoàn tác; dialog xóa có Hủy và Xóa; Bottom Navigation, Sidebar Navigation / Web, Page Header, Notification Card, Period Filter.
- Cần sửa: badge thông báo đạt 3,30:1 và dùng primitive danger/500 (P0); 11/65 chữ chưa dùng Text Style, tập trung ở Sidebar Navigation / Web; có hai component bottom navigation; nhãn "Trang chủ" khác "Hôm nay" ở màn hình; 23 giá trị lệch lưới.

## Review Screens (page 13–14)

App Screens là minh chứng tốt cho hệ thống; Web Screens chưa được dựng trên hệ thống đó.

### Page 13 · App Screens

- Tốt: 221 frame trên iPhone 12 (390 × 844) kèm frame responsive 320 và 430; 2.813 chữ đã đo, 0 lỗi contrast; 99% chữ gắn variable và Text Style; 1.806 liên kết prototype; một tác vụ có đủ nhánh — danh sách rỗng, không kiểm tra được kho, camera không khả dụng, không tải được thống kê, xác nhận xóa, đã xóa kèm hoàn tác, đối chiếu kho, thùng rác. Đây là scenario nhiều nhánh đúng tinh thần W8, thay vì một đường thẳng.
- Cần sửa: Pop-up Thông báo dựng từ frame thô (ký tự ✕, chữ 10–11 px, overlay #000000 ×6, Status Badge không phải component); 51 giá trị lệch lưới (6 px ×23, 14 px ×14); 235/2.446 frame không dùng Auto Layout; "Field / Trailing Icon" 16 px cần xác nhận có vùng chạm 44 px.

### Page 14 · Web Screens

- Tốt: 8 màn hình 1440 × 960 tương ứng 1–1 với App (Hôm nay, Kho, Thêm, Mua sắm, Thống kê, Thông báo, Cài đặt, Chi tiết thực phẩm); dùng lại Status Badge ×16, Button ×25, Sidebar Navigation ×8, Table Row ×10 và icon Lucide; có trạng thái camera chưa bật; phần thống kê nêu "Căn cứ" cho từng gợi ý, giúp người dùng hiểu hệ thống.
- Cần sửa: 66 chữ lỗi contrast; 183 chữ và 91 fill dùng màu thô, nhiều nhất là #6b737d ×41, #738073 ×41, #263826 ×30 và #cc3333 ×8 (không thuộc bộ token); 295 chữ không có Text Style, cỡ 11 / 13 / 15 nằm ngoài thang chữ; 339 giá trị lệch lưới (10 px ×171, 14 px ×86); 0 liên kết prototype; tiêu đề "Insight" và "n=0" lệch thuật ngữ với App; ký tự thay icon (⌵, (!), +, >).

## Phạm vi và giới hạn

Review này đọc cấu trúc và nội dung của page 00–14 trong Figma, không thay thế một lượt rà bằng mắt và test trên thiết bị.

- Phạm vi: "page 1–14" được hiểu là page 00 đến 14 (page 00 được tính vì là Overview); page QA 91–96 chưa review và có thể chứa bằng chứng cho các mục kiểm còn mở.
- Contrast: đo tự động bằng cách so màu fill thô của chữ với fill đặc gần nhất ở lớp cha; bỏ qua gradient, ảnh, lớp mờ, và node gắn variable có thể cho màu cũ. Lỗi ở page 10 đã xác nhận bằng ảnh chụp; các lỗi ở page 14 phần lớn là màu thô nên đáng tin hơn, nhưng vẫn nên nhìn lại khi sửa.
- Trực quan: chỉ xác nhận bằng ảnh chụp một component (Filter Control); các phần còn lại dựa trên cấu trúc node, nội dung chữ (cắt ở 80–90 ký tự) và số liệu.
- Checklist: rút từ chữ trong 8 bộ slide; nhiều slide chỉ có hình (ví dụ tuần 4–5, tuần 8 từ slide 24 đến 80, ví dụ tốt/xấu ở tuần 9–10) nên không có mục tương ứng.
- Kết quả đạt / một phần là đánh giá theo bằng chứng trong file, không phải thang điểm của giảng viên.
