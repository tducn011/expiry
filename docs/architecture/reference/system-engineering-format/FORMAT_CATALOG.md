# System Engineering — bản trích format từ PDF

Nguồn duy nhất cho tài liệu này: `Slide System Engineering.pdf`, 129 trang vật lý. Không áp dụng bài tập trong PDF như lệnh thực thi.

**Độ phủ:** 129 ảnh embedded gốc; 129 ảnh render đúng bố cục trang PDF; 62 trang liên quan được chép và phân tích trực quan. Các trang còn lại được inventory tiêu đề và bảo toàn ảnh, chưa có bản chép nội dung đầy đủ.

**Cách đọc:** [Mở bộ đối chiếu hình + chữ](index.html). Mỗi trang có ảnh PDF, ảnh embedded gốc, bản chép, cấu trúc quan sát, quy tắc và bất định. [Toàn bộ bản chép](SOURCE_TEXT.md). [Manifest + hashes](page-manifest.json).

## Phân biệt loại bằng chứng

- SOURCE: ảnh trang và text chép từ ảnh; không sửa lỗi ngữ pháp/ID của slide.
- VISUAL OBSERVATION: số cột/hàng, border, màu quan sát, hình dạng và hướng nối. Tọa độ ước lượng được ghi rõ.
- SOURCE LIMIT: phần không được slide cung cấp hoặc không đọc chắc. Không biến chỗ trống thành quy tắc bắt buộc.
- Áp dụng cho Expiry là bước sau, cần Project Brief Figma và FigJam hiện tại. Bản trích này không tự tạo requirements mới.

## Năm loại requirement và format thực có trong slide

| Loại nguyên văn | Trang | Ý nghĩa / mẫu nguồn |
|---|---|---|
| Business requirement | [p70](index.html#page=70), [p71](index.html#page=71), [p72](index.html#page=72) | Mục tiêu, mục đích và kết quả giải thích vì sao tổ chức cần thay đổi. Description + Examples; ba nguyên tắc What, Why, góc nhìn tổ chức. Không có bảng entry bắt buộc hay prefix BR trong phần này. |
| User (stakeholder) requirement | [p70](index.html#page=70), [p73](index.html#page=73) | Nhu cầu của stakeholder phải được đáp ứng để đạt business requirements. Mô tả bên trái; stakeholder và requirement boxes phân cấp bên phải. Không có bảng entry hay prefix UR bắt buộc. |
| Functional (solution) requirement | [p70](index.html#page=70), [p74](index.html#page=74) | Khả năng solution cần có về behavior và information mà solution quản lý. Bảng ID \| Description, ví dụ FR-1…FR-3, header xám; kèm một ví dụ sơ đồ requirement hierarchy riêng. |
| Non-functional (quality of service) requirement | [p70](index.html#page=70), [p75](index.html#page=75), [p127](index.html#page=127) | Tên loại được liệt kê ở p70; sơ đồ p75 minh họa các ràng buộc dịch vụ. Phần prose p75 mâu thuẫn tiêu đề nên không dùng như định nghĩa sạch. p75: prose + requirement hierarchy; p127: Rule ID \| Name \| Description. Ví dụ timeout/MD5 thuộc slide, không áp thành yêu cầu Expiry. |
| Implementation (transition). | [p70](index.html#page=70) | Slide chỉ liệt kê tên loại này; không có định nghĩa/template riêng đã xác định trong chương requirements. Không tìm thấy mẫu chi tiết riêng trong p69–76. Không tự dựng một bảng rồi gắn nhãn format bắt buộc của PDF. |

## Các mẫu chính cần lấy đúng

| Mẫu | Trang nguồn | Cấu trúc thực tế |
|---|---|---|
| Functional requirement | [74](index.html#page=74) | ID / Description; header xám nhạt, thân trắng, full grid đen mảnh. |
| Use case diagram | [84](index.html#page=84), [101](index.html#page=101) | Actor người que, ellipse tên hành động, system boundary chữ nhật; sample có include. Không có extend trong phần79–105. |
| Activity diagram | [105](index.html#page=105) | Initial dot, action bo góc, decision hình thoi, guard [Yes]/[No], final bullseye. |
| Summary sử dụng trong đặc tả | [110](index.html#page=110) | Heading [UC-1]: Title ở ngoài; bảng 2 cột × 5 hàng: Description, Actors, Preconditions, Postconditions, Trigger. Không thêm header màu vào mẫu này. |
| Flow dùng trong đặc tả | [114](index.html#page=114), [115](index.html#page=115), [118](index.html#page=118), [119](index.html#page=119), [121](index.html#page=121) | 4 cột Step ID / Actor / Action / Notes and References. Header xám nhạt, thân trắng, full grid đen mảnh. |
| Basic / Alternate / Exception | [113](index.html#page=113), [116](index.html#page=116), [120](index.html#page=120), [122](index.html#page=122) | 1 BF=happy path; 0–n AF và 0–n EF. BF/AF đạt goal; EF không đạt goal. Mỗi nhánh có mã và Return / End rõ. |
| Business Rules | [124](index.html#page=124), [125](index.html#page=125), [126](index.html#page=126) | p124 giải thích/reference; p125 bảng Rule ID / Name / Description; p126 là lifecycle illustration. Business requirement khác Business Rule. |
| NFR | [127](index.html#page=127) | Rule ID / Name / Description. Timeout/MD5 là ví dụ lớp học. |
| Wireframe | [128](index.html#page=128) | UI design illustration. Không đồng nhất wireframe với user flow hay use-case ellipse. |

**Bảng giảng giải khác bảng điền đặc tả:** p109 và p112 dùng bảng olive/zebra để giải thích; p110/p114… là specimen thực tế. Không trộn hai dạng rồi gọi là đúng nguyên mẫu.

## Mâu thuẫn và phần nguồn chưa cung cấp

- [PDF 75](index.html#page=75): Tiêu đề NFR nhưng prose mô tả nhu cầu phục vụ transition, không còn cần sau khi thay đổi hoàn tất. Giữ nguyên text và ảnh; chưa dùng đoạn prose làm định nghĩa NFR đã xác nhận.
- [PDF 70](index.html#page=70): Implementation (transition) có trong danh sách nhưng không có trang định nghĩa/template riêng trong p69–76. Ghi thiếu mẫu nguồn, không tự suy thành một template có sẵn trong slide.
- [PDF 71](index.html#page=71): Nguồn có “They is”, ví dụ kết thúc “by the end of next.”, và token nhìn thấy là “10T”. Bản chép giữ nguyên; không tự sửa câu hoặc đổi thành 10%.
- [PDF 91](index.html#page=91): Văn bản ghi 13 loại UML nhưng các danh sách trên trang chỉ liệt kê 11. Giữ cả văn bản và danh sách; không tự bổ sung hai loại còn thiếu.
- [PDF 119](index.html#page=119): Bảng ghi AF-B nhưng hình minh họa bên phải ghi AF-A. Giữ nguyên hai phần, đánh dấu bất nhất ID trong nguồn.
- [PDF 121](index.html#page=121): Tiêu đề ví dụ EF-1 nhưng step IDs là EF-A-1, EF-A-2. Giữ nguyên sự khác biệt trong SOURCE.
- [PDF 128](index.html#page=128): Nhãn nhỏ bên trong wireframe không đọc đủ chắc; PDF không có text/vector layer. Ảnh nguồn là bằng chứng; không dựng lời chép chắc chắn cho nhãn khó đọc.

## Typography và ảnh

PDF không có text/vector layer; không khôi phục chắc chắn được font family và point size gốc. Ảnh render giữ màu, tỷ lệ, vị trí và ký hiệu của trang PDF. Các tên font thay thế hoặc thông số layout suy ra sau này không được gọi là metadata font gốc.

129 ảnh embedded được giữ byte-for-byte. Ảnh trong PDF có chỗ scale/crop rất nhỏ so với khung trang; thư mục `renders/` giữ kết quả render đúng composition trang, còn `pages/` giữ ảnh embedded nguyên byte.

## Những khác biệt với FigJam đã làm trước

- Header flow màu đen đã dùng trước đây khác header xám nhạt của specimen PDF.
- Phần requirements trước đây chưa trích đủ đúng năm loại, nhất là Implementation (transition).
- Các cột bổ sung hoặc ID mới để truy vết dự án phải có nhãn là adaptation; không quy thành mẫu nguyên văn của slide.
- Việc chuẩn hóa 27 UC trước đây chưa bao phủ toàn bộ requirements, BR, FR/NFR và portfolio System Engineering.
- Chưa sửa thêm FigJam trong bước trích xuất này.

## Inventory toàn bộ PDF

| Trang | Tiêu đề nguồn | Trích chi tiết | Ảnh |
|---|---|---|---|
| 1 | INTRODUCE TO SYSTEM ENGINEERING | Inventory ảnh/tiêu đề | [Xem](index.html#page=1) |
| 2 | CONTENT | Inventory ảnh/tiêu đề | [Xem](index.html#page=2) |
| 3 | WHAT IS A SYSTEM? | Inventory ảnh/tiêu đề | [Xem](index.html#page=3) |
| 4 | Examples: Computer System | Inventory ảnh/tiêu đề | [Xem](index.html#page=4) |
| 5 | Example: School System | Inventory ảnh/tiêu đề | [Xem](index.html#page=5) |
| 6 | WHAT IS A SYSTEM? | Inventory ảnh/tiêu đề | [Xem](index.html#page=6) |
| 7 | WHAT IS SYSTEMS THINKING | Inventory ảnh/tiêu đề | [Xem](index.html#page=7) |
| 8 | WHAT IS SYSTEMS THINKING | Inventory ảnh/tiêu đề | [Xem](index.html#page=8) |
| 9 | Q&A | Inventory ảnh/tiêu đề | [Xem](index.html#page=9) |
| 10 | The Importance of Systems Thinking in Engineering | Inventory ảnh/tiêu đề | [Xem](index.html#page=10) |
| 11 | WHAT IS SYSTEMS ENGINEERING | Inventory ảnh/tiêu đề | [Xem](index.html#page=11) |
| 12 | WHAT IS SYSTEMS ENGINEERING | Inventory ảnh/tiêu đề | [Xem](index.html#page=12) |
| 13 | WHAT IS SYSTEMS ENGINEERING | Inventory ảnh/tiêu đề | [Xem](index.html#page=13) |
| 14 | TYPES OF SYSTEMS ENGINEERING | Inventory ảnh/tiêu đề | [Xem](index.html#page=14) |
| 15 | SYSTEMS ENGINEERING PROCESS | Inventory ảnh/tiêu đề | [Xem](index.html#page=15) |
| 16 | MANAGING COMPLEXITY | Inventory ảnh/tiêu đề | [Xem](index.html#page=16) |
| 17 | SYSTEMS DEVELOPMENT LIFE CYCLE | Inventory ảnh/tiêu đề | [Xem](index.html#page=17) |
| 18 | SYSTEMS DEVELOPMENT LIFE CYCLE | Inventory ảnh/tiêu đề | [Xem](index.html#page=18) |
| 19 | INTRODUCE TO SYSTEM DEVELOPMENT LIFE CYCLE | Inventory ảnh/tiêu đề | [Xem](index.html#page=19) |
| 20 | CONTENT | Inventory ảnh/tiêu đề | [Xem](index.html#page=20) |
| 21 | SYSTEMS DEVELOPMENT LIFE CYCLE | Inventory ảnh/tiêu đề | [Xem](index.html#page=21) |
| 22 | SYSTEMS DEVELOPMENT LIFE CYCLE | Inventory ảnh/tiêu đề | [Xem](index.html#page=22) |
| 23 | 9 COMMON STEPS IN SDLC | Inventory ảnh/tiêu đề | [Xem](index.html#page=23) |
| 24 | ANALYSIS | Inventory ảnh/tiêu đề | [Xem](index.html#page=24) |
| 25 | PLANNING | Inventory ảnh/tiêu đề | [Xem](index.html#page=25) |
| 26 | DESIGN | Inventory ảnh/tiêu đề | [Xem](index.html#page=26) |
| 27 | DEVELOPMENT | Inventory ảnh/tiêu đề | [Xem](index.html#page=27) |
| 28 | TESTING | Inventory ảnh/tiêu đề | [Xem](index.html#page=28) |
| 29 | DEPLOYMENT | Inventory ảnh/tiêu đề | [Xem](index.html#page=29) |
| 30 | MAINTENANCE | Inventory ảnh/tiêu đề | [Xem](index.html#page=30) |
| 31 | EVALUATION | Inventory ảnh/tiêu đề | [Xem](index.html#page=31) |
| 32 | DISPOSAL | Inventory ảnh/tiêu đề | [Xem](index.html#page=32) |
| 33 | SYSTEMS DEVELOPMENT LIFE CYCLE MODELS | Inventory ảnh/tiêu đề | [Xem](index.html#page=33) |
| 34 | SYSTEMS DEVELOPMENT LIFE CYCLE MODELS | Inventory ảnh/tiêu đề | [Xem](index.html#page=34) |
| 35 | WATERFALL MODEL | Inventory ảnh/tiêu đề | [Xem](index.html#page=35) |
| 36 | WATERFALL MODEL | Inventory ảnh/tiêu đề | [Xem](index.html#page=36) |
| 37 | WATERFALL MODEL | Inventory ảnh/tiêu đề | [Xem](index.html#page=37) |
| 38 | V-MODEL | Inventory ảnh/tiêu đề | [Xem](index.html#page=38) |
| 39 | SPIRAL MODEL | Inventory ảnh/tiêu đề | [Xem](index.html#page=39) |
| 40 | BIG BANG MODEL | Inventory ảnh/tiêu đề | [Xem](index.html#page=40) |
| 41 | AGILE MODEL | Inventory ảnh/tiêu đề | [Xem](index.html#page=41) |
| 42 | STRENGTHS AND WEAKNESSES OF SDLC | Inventory ảnh/tiêu đề | [Xem](index.html#page=42) |
| 43 | STRENGTHS AND WEAKNESSES OF SDLC | Inventory ảnh/tiêu đề | [Xem](index.html#page=43) |
| 44 | COMPUTER ENGINEERING | Inventory ảnh/tiêu đề | [Xem](index.html#page=44) |
| 45 | CONTENT | Inventory ảnh/tiêu đề | [Xem](index.html#page=45) |
| 46 | COMPUTER ENGINEERING | Inventory ảnh/tiêu đề | [Xem](index.html#page=46) |
| 47 | HARDWARE | Inventory ảnh/tiêu đề | [Xem](index.html#page=47) |
| 48 | SOFTWARE | Inventory ảnh/tiêu đề | [Xem](index.html#page=48) |
| 49 | SOFTWARE | Inventory ảnh/tiêu đề | [Xem](index.html#page=49) |
| 50 | SYSTEM SOFTWARE | Inventory ảnh/tiêu đề | [Xem](index.html#page=50) |
| 51 | APPLICATION SOFTWARE | Inventory ảnh/tiêu đề | [Xem](index.html#page=51) |
| 52 | APPLICATION SOFTWARE | Inventory ảnh/tiêu đề | [Xem](index.html#page=52) |
| 53 | PROGRAMMING SOFTWARE | Inventory ảnh/tiêu đề | [Xem](index.html#page=53) |
| 54 | DRIVER SOFTWARE | Inventory ảnh/tiêu đề | [Xem](index.html#page=54) |
| 55 | DESKTOP APPLICATIONS | Inventory ảnh/tiêu đề | [Xem](index.html#page=55) |
| 56 | WEB APPLICATION | Inventory ảnh/tiêu đề | [Xem](index.html#page=56) |
| 57 | MOBILE APPLICATION | Inventory ảnh/tiêu đề | [Xem](index.html#page=57) |
| 58 | Analysis Phase | Inventory ảnh/tiêu đề | [Xem](index.html#page=58) |
| 59 | CONTENT | Inventory ảnh/tiêu đề | [Xem](index.html#page=59) |
| 60 | Analysis | Inventory ảnh/tiêu đề | [Xem](index.html#page=60) |
| 61 | Objective of the analysis phase | Inventory ảnh/tiêu đề | [Xem](index.html#page=61) |
| 62 | Overview of analysis phase | Inventory ảnh/tiêu đề | [Xem](index.html#page=62) |
| 63 | Input to the analysis phase | Inventory ảnh/tiêu đề | [Xem](index.html#page=63) |
| 64 | Main activities of the analysis phase | Inventory ảnh/tiêu đề | [Xem](index.html#page=64) |
| 65 | Output of the analysis phase | Có | [Xem](index.html#page=65) |
| 66 | Best practices for an analysis phase | Có | [Xem](index.html#page=66) |
| 67 | Best practices for an analysis phase | Có | [Xem](index.html#page=67) |
| 68 | REQUIREMENT | Inventory ảnh/tiêu đề | [Xem](index.html#page=68) |
| 69 | Requirement | Có | [Xem](index.html#page=69) |
| 70 | Requirement | Có | [Xem](index.html#page=70) |
| 71 | Business requirement | Có | [Xem](index.html#page=71) |
| 72 | Business requirement | Có | [Xem](index.html#page=72) |
| 73 | Stakeholder requirement | Có | [Xem](index.html#page=73) |
| 74 | Functional (solution) requirement | Có | [Xem](index.html#page=74) |
| 75 | Non-functional (quality of service) requirement | Có | [Xem](index.html#page=75) |
| 76 | Some requirement document | Có | [Xem](index.html#page=76) |
| 77 | Unified Modeling Language | Inventory ảnh/tiêu đề | [Xem](index.html#page=77) |
| 78 | CONTENT | Inventory ảnh/tiêu đề | [Xem](index.html#page=78) |
| 79 | What is UML | Có | [Xem](index.html#page=79) |
| 80 | Building blocks | Có | [Xem](index.html#page=80) |
| 81 | Building blocks - Things | Có | [Xem](index.html#page=81) |
| 82 | Building blocks - Structural Things | Có | [Xem](index.html#page=82) |
| 83 | Building blocks - Structural Things | Có | [Xem](index.html#page=83) |
| 84 | Building blocks - Structural Things | Có | [Xem](index.html#page=84) |
| 85 | Building blocks - Structural Things | Có | [Xem](index.html#page=85) |
| 86 | Building blocks - Behavioral Things | Có | [Xem](index.html#page=86) |
| 87 | Building blocks - Behavioral Things | Có | [Xem](index.html#page=87) |
| 88 | Building blocks - Group Things | Có | [Xem](index.html#page=88) |
| 89 | Building blocks - Annotational Things | Có | [Xem](index.html#page=89) |
| 90 | Building blocks - Relationship | Có | [Xem](index.html#page=90) |
| 91 | Building blocks - Diagrams | Có | [Xem](index.html#page=91) |
| 92 | UML - Architecture | Có | [Xem](index.html#page=92) |
| 93 | UML - Architecture | Có | [Xem](index.html#page=93) |
| 94 | Class Diagram | Có | [Xem](index.html#page=94) |
| 95 | Class Diagram | Có | [Xem](index.html#page=95) |
| 96 | Object Diagram | Có | [Xem](index.html#page=96) |
| 97 | Component Diagram | Có | [Xem](index.html#page=97) |
| 98 | Component Diagram | Có | [Xem](index.html#page=98) |
| 99 | Component Diagram | Có | [Xem](index.html#page=99) |
| 100 | Deployment Diagram | Có | [Xem](index.html#page=100) |
| 101 | Use-case Diagram | Có | [Xem](index.html#page=101) |
| 102 | Interaction Diagram | Có | [Xem](index.html#page=102) |
| 103 | Interaction Diagram | Có | [Xem](index.html#page=103) |
| 104 | Statechart Diagram | Có | [Xem](index.html#page=104) |
| 105 | Activity Diagram | Có | [Xem](index.html#page=105) |
| 106 | USE CASE SPECIFICATION | Có | [Xem](index.html#page=106) |
| 107 | USE CASE SPECIFICATION | Có | [Xem](index.html#page=107) |
| 108 | USE CASE SPECIFICATION | Có | [Xem](index.html#page=108) |
| 109 | SUMMARY | Có | [Xem](index.html#page=109) |
| 110 | SUMMARY | Có | [Xem](index.html#page=110) |
| 111 | THREE TYPES OF FLOW | Có | [Xem](index.html#page=111) |
| 112 | FLOW COMPONENTS | Có | [Xem](index.html#page=112) |
| 113 | BASIC FLOWS | Có | [Xem](index.html#page=113) |
| 114 | THE BASIC FLOW | Có | [Xem](index.html#page=114) |
| 115 | THE BASIC FLOW | Có | [Xem](index.html#page=115) |
| 116 | ALTERNATE FLOWS | Có | [Xem](index.html#page=116) |
| 117 | ALTERNATE FLOWS | Có | [Xem](index.html#page=117) |
| 118 | ALTERNATE FLOWS | Có | [Xem](index.html#page=118) |
| 119 | ALTERNATE FLOWS | Có | [Xem](index.html#page=119) |
| 120 | EXCEPTION FLOWS | Có | [Xem](index.html#page=120) |
| 121 | EXCEPTION FLOWS | Có | [Xem](index.html#page=121) |
| 122 | WRAP UP | Có | [Xem](index.html#page=122) |
| 123 | ADDITIONAL INFORMATION | Có | [Xem](index.html#page=123) |
| 124 | BUSINESS RULES | Có | [Xem](index.html#page=124) |
| 125 | BUSINESS RULES | Có | [Xem](index.html#page=125) |
| 126 | BUSINESS RULES | Có | [Xem](index.html#page=126) |
| 127 | NON-FUNCTIONAL REQUIREMENTS: | Có | [Xem](index.html#page=127) |
| 128 | WIREFRAMES | Có | [Xem](index.html#page=128) |
| 129 | ASSIGNMENT | Có | [Xem](index.html#page=129) |
