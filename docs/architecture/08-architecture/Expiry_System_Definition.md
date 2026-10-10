# Expiry Things — Định nghĩa hệ thống

**Trạng thái:** Bản làm rõ để review. **Tầng mô tả:** toàn hệ thống, trước lựa chọn MVP và thiết kế giao diện.

## 1. Hệ thống này là gì, làm gì và giúp ai?

**Expiry Things là hệ thống thông tin hỗ trợ người dùng theo dõi những sản phẩm họ đang sở hữu hoặc quản lý trong quá trình sử dụng. Hệ thống tập hợp thông tin sản phẩm, các mốc thời gian và những thay đổi đã được ghi nhận; từ đó cho biết sản phẩm nào cần chú ý, vì sao cần chú ý và có thể thực hiện bước tiếp theo nào. Khi người dùng xác nhận một hành động hoặc sửa thông tin, hệ thống cập nhật hồ sơ, ghi lịch sử và đánh giá lại trạng thái.**

Giá trị hướng tới là giúp người dùng bớt phải ghi nhớ và kiểm tra từng sản phẩm, có đủ thông tin để quyết định kịp thời, và duy trì hồ sơ gần với thực tế bằng công sức hợp lý. Hạn chế bỏ quên, lãng phí hoặc bỏ lỡ quyền lợi là kết quả mong muốn cần đánh giá thực tế; tài liệu này không khẳng định các kết quả ấy đã đạt được.

Người dùng chính là người sở hữu, sử dụng hoặc chịu trách nhiệm quản lý sản phẩm. Nếu lựa chọn quản lý chung, quyền của từng người phải được xác định riêng. Định nghĩa này chưa quyết định mô hình cá nhân/hộ gia đình, loại sản phẩm triển khai hay thứ tự phiên bản.

## 2. Vấn đề cần giải quyết

Thông tin thường nằm ở nhãn, hóa đơn, nơi lưu trữ, trí nhớ và những lần sử dụng khác nhau. Tình trạng thực tế thay đổi sau khi mua, mở, sử dụng, di chuyển hoặc xử lý. Người dùng có thể quên mình đang có gì, không hiểu ý nghĩa một mốc ngày, bỏ sót việc cần làm hoặc tiếp tục dựa vào hồ sơ đã cũ.

Hệ thống cần cung cấp thông tin hữu ích cho quyết định và giúp sửa/cập nhật thông tin khi thực tế thay đổi. Nếu chỉ lưu một ngày rồi cảnh báo, hồ sơ vẫn có thể sai và người dùng vẫn có thể không biết làm gì tiếp theo.

## 3. Năng lực và giá trị cho người dùng

| Năng lực | Hệ thống thực hiện | Người dùng nhận được |
|---|---|---|
| Tập hợp và truy xuất | Lưu hồ sơ nhận diện sản phẩm và dữ liệu vòng đời liên quan | Biết mình đang quản lý gì và tìm lại khi cần |
| Giải thích trạng thái | Đánh giá dữ liệu, sự kiện, thời gian và quy tắc theo loại; nêu nguồn và phần chưa biết | Hiểu kết quả dựa trên căn cứ nào |
| Làm rõ việc cần chú ý | Nêu sản phẩm cần xem xét, lý do và thời điểm liên quan | Ưu tiên việc cần làm mà không kiểm tra mọi hồ sơ |
| Hỗ trợ bước tiếp theo | Cung cấp hành động phù hợp hoặc yêu cầu kiểm tra/xác nhận khi thiếu căn cứ | Biết bước xử lý có thể chọn và giới hạn thông tin |
| Đối soát và phản hồi | Nhận hành động đã xác nhận hoặc thông tin sửa lại; cập nhật hồ sơ và lịch sử | Giảm chênh lệch giữa thông tin số và thực tế |

## 4. Cấu trúc, môi trường và ranh giới

Hệ thống được thiết kế ở đây là phần mềm và quy tắc xử lý thông tin của Expiry Things. Người dùng là tác nhân tương tác; sản phẩm vật lý và hoạt động thực tế thuộc môi trường.

Bên trong gồm các trách nhiệm phối hợp: hồ sơ sản phẩm; thông tin/sự kiện vòng đời; quy tắc theo loại; đánh giá trạng thái; việc cần chú ý; luồng xác nhận/chỉnh sửa; lưu trữ, lịch sử và kiểm soát quyền. Đây là các phần logic, chưa phải tên bảng hay module trong code.

Các nguồn/dịch vụ bên ngoài có thể cung cấp nhãn, thời gian, dữ liệu danh mục, nhận dạng hoặc kênh thông báo. OCR/barcode/push là phương án hỗ trợ cần đánh giá riêng; có hay không có chúng trong demo không xác định toàn bộ hệ thống.

Hệ thống chịu trách nhiệm lưu và giải thích **hồ sơ số** dựa trên căn cứ đã nhận. Nó không tự quan sát mọi thay đổi ngoài đời, không thực hiện hành động vật lý thay người dùng và không chứng minh chất lượng/tính an toàn chỉ từ ngày hoặc nhãn trạng thái. Những thay đổi thực tế cần người dùng hoặc nguồn được chấp nhận cung cấp/xác nhận.

Ý nghĩa hạn dùng, thời gian sau mở, thời điểm thay thế hay thời hạn quyền lợi phụ thuộc loại sản phẩm và quy tắc được lựa chọn. Không áp cùng một chuỗi trạng thái cho mọi loại. Các ví dụ này minh họa ranh giới khái niệm, không tự phê duyệt tất cả lĩnh vực triển khai.

## 5. Đầu vào, đầu ra và vòng phản hồi

**Đầu vào:** thông tin nhận diện; mốc thời gian và ý nghĩa; nguồn/độ chắc chắn; sự kiện được xác nhận; thời gian hiện tại; quy tắc theo loại; thông tin sửa lại và lựa chọn người dùng.

**Đầu ra:** hồ sơ hiện tại và lịch sử; trạng thái kèm căn cứ/giới hạn; việc cần chú ý; hành động có thể chọn hoặc yêu cầu xác nhận; kết quả cập nhật sau xử lý.

**Luồng chính:** Thông tin và sự kiện → cập nhật hồ sơ → đánh giá theo thời gian/quy tắc → nêu việc cần chú ý và bước tiếp theo → người dùng xử lý/xác nhận → ghi lịch sử, đối soát và đánh giá lại.

Thời gian thay đổi có thể khiến kết quả được tính lại. Việc gửi nhắc hoặc hiển thị một thao tác không chứng minh người dùng đã thực hiện nó. Khi thiếu dữ liệu/xác nhận, hệ thống thể hiện phần chưa biết thay vì tự bổ sung sự thật.

## 6. Ví dụ minh họa

Người dùng ghi nhận sản phẩm và ngày trên nhãn. Hệ thống giữ ý nghĩa/nguồn của ngày, đánh giá việc cần chú ý và giải thích lý do. Người đó sử dụng, xử lý hoặc phát hiện dữ liệu sai rồi xác nhận thay đổi. Hệ thống ghi đúng loại thay đổi, cập nhật hồ sơ và đánh giá lại. Nếu chưa có ngày, hồ sơ vẫn có thể được lưu nhưng phải thể hiện thiếu căn cứ về mốc hạn.

Ví dụ này giải thích vòng thông tin–hành động–phản hồi; không bắt buộc màn hình, enum, cách nhập hay API cụ thể.

## 7. Quan hệ với requirements và scope

Định nghĩa trả lời hệ thống là gì và có mục đích gì. [Business/System Requirements](Expiry_System_Requirements_Summary.md) chuyển mục đích thành kết quả và hành vi/điều kiện cần kiểm tra. Scope chọn miền sản phẩm, đối tượng và năng lực triển khai. Use case, UI, API, schema và công nghệ cụ thể hóa yêu cầu đã chọn.

UI demo là một phương án thể hiện và nguồn quan sát giải pháp hiện tại, không là căn cứ đóng toàn bộ requirements. Bộ [architecture hiện tại](architecture/README.md) mô tả một phương án food inventory chi tiết để review; cần đọc kèm phạm vi của phương án đó.

## 8. Căn cứ biên soạn

- **[A] Phương pháp:** [Slide System Engineering.pdf](../doc/SystemEngineer/Slide%20System%20Engineering.pdf), trang PDF 3 và 6 về hệ thống; 63–67 về phân tích vấn đề/lợi ích; 69–76 về phân tầng requirements. Các trang liên quan đã được đọc trực quan.
- **[A] Nội dung nguồn:** tab “Định nghĩa hệ thống” và các tab phân tích/Scope trong [System Engineering Gr2](https://docs.google.com/document/d/1js1KBfrVrgDn9EVC4_sNGIvUlWQNlLRC66nyTeAvBmA/edit?tab=t.cvfhfbppty7u), đọc trực tiếp trước khi chỉnh.
- **[A] Nguồn tổng hợp bài toán:** [food-expiry.md](../doc/SystemEngineer/food-expiry.md), [REPORT.md](../doc/SystemEngineer/REPORT.md), [DEEP RESEARCH.md](../doc/SystemEngineer/rawdocs/DEEP%20RESEARCH.md). Chúng cung cấp nội dung và giới hạn chứng cứ, không là phỏng vấn người dùng mới trong lần chỉnh này.
- **[C] Bản làm rõ:** phát biểu riêng cho Expiry được tổng hợp/diễn giải để review. Slide là tài liệu học phần; bản này không tuyên bố chứng nhận ISO/IEEE hay nghiệm thu sản phẩm.
