# Expiry Things — Business & System Requirements tóm tắt

**Trạng thái:** Review. **Mức mô tả:** yêu cầu logic toàn hệ thống. **Cập nhật liên kết persona:** 2026-10-10. Bản này thay thế bản tóm tắt theo MVP trước đó; ID `SYS-BR-*`, `SYS-FR-*`, `SYS-NFR-*` có namespace riêng, không đổi nghĩa ID trong thiết kế cũ.

Tab [FINAL CHECK](https://docs.google.com/document/d/1js1KBfrVrgDn9EVC4_sNGIvUlWQNlLRC66nyTeAvBmA/edit?tab=t.1rjc5vc4ma1w) đang dùng `BR-01…04`, `SYS-SR-01…07` và `UR-01…10` cho bài System Engineering. Các mã đó khác bộ mã tổng hợp trong tài liệu này; xem [bản đối chiếu FINAL CHECK → persona → phương án food/UI](architecture/03-requirements-features/final-check-persona-alignment.md) trước khi truy vết. `SYS-BR-01` ở đây nói về nhận biết thông tin, còn `BR-01` trong FINAL CHECK nói về giảm lãng phí; chúng có quan hệ hỗ trợ, không đồng nghĩa.

## 1. Mục đích hệ thống

Expiry Things giúp người dùng biết mình đang quản lý gì, thông tin vòng đời nào cần chú ý, vì sao và có thể làm gì tiếp theo. Sau khi người dùng xác nhận hành động hoặc sửa thông tin, hệ thống cập nhật hồ sơ và đánh giá lại để giảm chênh lệch với thực tế. Xem [định nghĩa hệ thống](Expiry_System_Definition.md) về cấu trúc, ranh giới, đầu vào/đầu ra và phản hồi.

## 2. Business requirements — kết quả hướng tới

| ID | Kết quả cho người dùng | Cách đánh giá dự kiến |
|---|---|---|
| SYS-BR-01 | Nhận biết sản phẩm đang quản lý và việc cần chú ý mà không phải nhớ/kiểm tra từng sản phẩm | Tác vụ tìm/phát hiện; thời gian và trường hợp bỏ sót |
| SYS-BR-02 | Có đủ thông tin và hiểu giới hạn của nó để quyết định sử dụng/xử lý kịp thời | Tác vụ quyết định; hiểu lý do/trạng thái; việc bị bỏ lỡ |
| SYS-BR-03 | Duy trì hồ sơ phản ánh các thay đổi thực tế đã được xác nhận | Sai lệch khi đối chiếu thực tế; khả năng sửa lại và hiểu lịch sử |
| SYS-BR-04 | Nhận giá trị theo dõi với công sức nhập, kiểm tra, cập nhật hợp lý | Thời gian/công sức duy trì; tỷ lệ bỏ dở/ngừng sử dụng |

Đây là mục tiêu cần validation với người dùng. Tỷ lệ giảm lãng phí, tiết kiệm hoặc tận dụng quyền lợi cần baseline và nghiên cứu thực tế; không tự kế thừa các mục tiêu cũ 40%/100%/80%.

## 3. Stakeholder needs — nhu cầu cần đáp ứng

Stakeholder là bên có nhu cầu, lợi ích hoặc trách nhiệm liên quan đến hệ thống. Persona làm rõ bối cảnh và cơ chế hành vi của người dùng trực tiếp; cùng một người có thể xem, sử dụng và cập nhật sản phẩm. Những thao tác đó không tạo thành ba persona hay ba loại tài khoản riêng.

| Nhóm stakeholder | Nhu cầu cần đáp ứng | Căn cứ và giới hạn |
|---|---|---|
| Người dùng cá nhân / người phụ trách thực phẩm trong hộ gia đình | Nhận biết sản phẩm đang có, hiểu việc cần chú ý và chọn bước tiếp theo; xác nhận hoặc sửa thay đổi với công sức hợp lý | Ba [persona Canva](architecture/01-personas/README.md) cụ thể hóa nhu cầu người dùng thực phẩm; chưa là nghiên cứu người dùng đã được xác nhận |
| Nhóm quản lý và đánh giá dự án | Có phạm vi, yêu cầu, căn cứ và tiêu chí kiểm tra truy vết được để đánh giá hệ thống | Trách nhiệm đối với tài liệu và nghiệm thu; không tự tạo vai trò quản trị trong ứng dụng |
| Nhóm phát triển và vận hành hệ thống | Có hợp đồng và quy tắc rõ, bảo vệ dữ liệu, giữ tính nhất quán và cung cấp đường khôi phục khi lỗi | Yêu cầu hỗ trợ việc đáp ứng nhu cầu người dùng; cần kiểm tra theo kiến trúc và môi trường triển khai được chọn |

| Persona nguồn | Cơ chế hành vi trong tài liệu | Nhu cầu cụ thể | Yêu cầu logic liên quan trong bản tóm tắt này |
|---|---|---|---|
| P-01 / P1 — Phạm Hoàng An | Mua có kế hoạch nhưng dễ mất chú ý sau khi cất thực phẩm; không muốn thêm việc quản lý hằng ngày | Thấy lại thực phẩm đang có và món cần chú ý; nhập và cập nhật với công sức hợp lý | SYS-FR-01, SYS-FR-05, SYS-FR-07, SYS-FR-09 |
| P-02 / P2 — Tôn Nữ Như Huyền | Kế hoạch bữa ăn thay đổi; chỉ biết hạn dùng chưa đủ để quyết định bước tiếp theo | Xem lý do ưu tiên, số lượng, vị trí và thông tin còn thiếu để chọn kiểm tra hoặc xử lý phù hợp | SYS-FR-02, SYS-FR-04, SYS-FR-05, SYS-FR-06 |
| P-03 / P3 — Phạm Ngọc Thiên An | Muốn tồn kho chính xác nhưng công cập nhật lặp lại khiến hồ sơ số lệch với thực tế | Ghi nhận sử dụng, loại bỏ và sửa sai rõ ràng; thấy kết quả và lịch sử với ít công duy trì | SYS-FR-01, SYS-FR-03, SYS-FR-07; SYS-NFR-01, SYS-NFR-04 |

[A] Tên và cơ chế hành vi lấy từ tài liệu Canva đã lưu trong [source register](architecture/00-context/source-register.md). [C/D] Quan hệ từ persona đến yêu cầu là diễn giải thiết kế cần validation bằng tác vụ; không suy từ tuổi, nghề hoặc thiết bị thành một tính năng. Bối cảnh hộ gia đình của P-02 chưa quyết định nhiều tài khoản dùng chung kho. Việc giảm công sức là nhu cầu cốt lõi; OCR, thao tác hàng loạt và tự động lập thực đơn là những phương án cần đánh giá phạm vi riêng.

## 4. Functional system requirements — hành vi cần đáp ứng

| ID | Yêu cầu logic | Dấu hiệu kiểm tra | BR |
|---|---|---|---|
| SYS-FR-01 | Hệ thống phải cho tạo, sửa và truy xuất hồ sơ với thông tin nhận diện/theo dõi phù hợp loại sản phẩm | Lưu và truy xuất đúng danh tính/thông tin đã chấp nhận | 01, 04 |
| SYS-FR-02 | Hệ thống phải biểu diễn nguồn và mức chắc chắn của thông tin vòng đời | Phân biệt đã xác nhận, ước tính, chưa biết; không tự đoán dữ liệu thiếu | 01, 02 |
| SYS-FR-03 | Hệ thống phải ghi sự kiện được chấp nhận gắn với đúng hồ sơ | Ghi đúng loại và đối tượng; không coi hành động chưa xác nhận là đã xảy ra | 03 |
| SYS-FR-04 | Hệ thống phải đánh giá trạng thái từ thông tin, sự kiện, thời gian và quy tắc theo loại | Bộ đầu vào xác định cho kết quả đúng quy tắc; thiếu căn cứ được thể hiện | 01, 02 |
| SYS-FR-05 | Hệ thống phải xác định và ưu tiên việc cần chú ý theo quy tắc đã chọn, cùng lý do và thời điểm liên quan | Ưu tiên đúng bộ dữ liệu/quy tắc kiểm tra; thấy lý do; không dùng một nghĩa hạn cho mọi loại | 01, 02 |
| SYS-FR-06 | Hệ thống phải cung cấp bước xử lý phù hợp với loại sản phẩm và dữ liệu hiện có | Có hành động được phép hoặc yêu cầu kiểm tra/xác nhận khi thiếu thông tin | 02, 04 |
| SYS-FR-07 | Hệ thống phải nhận xác nhận/chỉnh sửa để đối soát, giữ lịch sử và đánh giá lại | Hồ sơ/lịch sử và việc cần chú ý phản ánh thay đổi đã chấp nhận | 03 |
| SYS-FR-08 | Hệ thống phải áp dụng lựa chọn chú ý/nhắc nhở của người dùng trong phạm vi được triển khai | Kết quả chú ý/nhắc nhở áp dụng đúng lựa chọn hiện tại | 02, 04 |
| SYS-FR-09 | Hệ thống phải cho nhập/sửa bởi người dùng khi nguồn hỗ trợ không có hoặc bị lỗi | Vẫn tạo/sửa được hồ sơ và nhận kết quả rõ khi tích hợp hỗ trợ thất bại | 03, 04 |
| SYS-FR-10 | Hệ thống phải kiểm soát quyền xem/thay đổi theo phạm vi quản lý được cấp | Từ chối người không có quyền; cho phép thao tác hợp lệ | 03 |

BR viết tắt cho `SYS-BR-xx`. Quy tắc miền, nhắc nhở và quản lý chung cần đặc tả theo scope đã chọn. Yêu cầu logic không tự chọn OCR, push, owner-only, enum trạng thái hay UI demo.

## 5. Nonfunctional requirements — điều kiện chất lượng

| ID | Điều kiện cần đáp ứng | Cách kiểm tra dự kiến |
|---|---|---|
| SYS-NFR-01 | Hồ sơ/lịch sử nhất quán; gửi lại thao tác không tạo hai thay đổi cho cùng hành động | Lỗi giữa chừng, gửi lại và cập nhật đồng thời |
| SYS-NFR-02 | Bảo vệ dữ liệu/lịch sử theo quyền; không lộ bí mật xác thực qua log/lỗi | Truy cập trái quyền và dữ liệu trong lỗi/log |
| SYS-NFR-03 | Giữ đúng ý nghĩa ngày/giờ theo quy tắc đã chọn | Ranh giới ngày/giờ và bối cảnh thời gian từng policy |
| SYS-NFR-04 | Đầu vào sai/thao tác thất bại có thông báo và đường sửa/thử lại; không báo thành công khi chưa chấp nhận thay đổi | Kịch bản lỗi, gián đoạn và khôi phục |
| SYS-NFR-05 | Nhãn/trạng thái hiểu được, dùng bằng bàn phím, không phụ thuộc riêng vào màu | Review tác vụ, bàn phím và công nghệ hỗ trợ |
| SYS-NFR-06 | Mục tiêu phản hồi/khối lượng xử lý được chốt cùng bối cảnh đo | **TBD** tải, môi trường và ngưỡng trước nghiệm thu hiệu năng |

## 6. Ranh giới và điểm chưa chốt

Hệ thống quản lý hồ sơ số và thông tin phối hợp. Sản phẩm vật lý, quyết định cuối cùng và hành động ngoài đời nằm ở môi trường. Ngày/trạng thái không tự chứng minh chất lượng hoặc tính an toàn. Loại sản phẩm, quản lý cá nhân/chung, quy tắc miền, kênh nhắc, nhập hỗ trợ và thời hạn lưu dữ liệu cần quyết định scope riêng.

Use case chi tiết, UI, API, schema và công nghệ là thiết kế thực hiện yêu cầu đã chọn. Các FR/NFR của [architecture hiện tại](architecture/README.md) thuộc phương án food inventory cụ thể. Bản này là tóm tắt để review, chưa là SRS đầy đủ đã nghiệm thu.

## 7. Căn cứ và cách kiểm tra

- [Slide System Engineering.pdf](../doc/SystemEngineer/Slide%20System%20Engineering.pdf): trang PDF 3, 63–67, 69–76 về hệ thống, vấn đề/lợi ích và phân tầng requirements.
- [Định nghĩa hệ thống](Expiry_System_Definition.md) và nguồn dẫn tại đó. ID `SYS-*` là bản tổng hợp/diễn giải để review, không lấy code demo làm chuẩn.
- [FINAL CHECK và bản đối chiếu hiện hành](architecture/03-requirements-features/final-check-persona-alignment.md): nhóm stakeholder, persona, requirement và scenario đọc lại sau chỉnh ngày 2026-10-10; snapshot giữ revision nguồn.
- Verification kiểm tra hành vi/điều kiện bằng dấu hiệu ở bảng; validation kiểm tra người dùng có đạt BR trong bối cảnh thực tế. Đây là cách dùng thuật ngữ trong bản này, không phải báo cáo các kiểm tra đã chạy.
