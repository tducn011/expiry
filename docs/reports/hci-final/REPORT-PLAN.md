# Expiry HCI — Context hiện tại và kế hoạch hoàn thiện báo cáo

**Ngày chốt nguồn: 13/11/2026 · Ngôn ngữ báo cáo: English · Tác giả: Nguyễn Tâm Đức — 24020005.**

**Bản chính để review:** [Expiry — HCI Final Project Report — English](https://docs.google.com/document/d/1PnXzvgJW66KB6qph_41MDvn_2Scb3UIwdoDVP3GD7X0/edit?usp=drivesdk). Bản PDF xuất cùng nội dung nằm tại [Expiry_HCI_Report_EN.pdf](/home/pro/Downloads/expiry/docs/reports/hci-final/Expiry_HCI_Report_EN.pdf). Đã hoàn tất biên soạn và kiểm tra artifact ngày 14/11/2026; trạng thái **DRAFT FOR REVIEW**, chưa có user/lecturer acceptance.

Tài liệu kế hoạch này giữ quyết định chọn nguồn và lịch sử đối chiếu. Google Docs ở trên là bản master hiện tại; PDF và Markdown là bản xuất/companion, không phải các phiên bản nội dung cạnh tranh. Các draft cũ và nguồn SE/Figma vẫn được giữ nguyên.

**Điều đã chốt:** giữ cấu trúc và cách trình bày của template; thay nội dung bằng Expiry; dùng Brief Figma đang có cho phạm vi sản phẩm; dùng hi-fi App/Web đang có cho hình và mô tả thiết kế; dùng catalog 29 UC làm nguồn đặc tả có ánh xạ sang 24 UC-V4 của Design. Tài liệu cũ phục vụ đối chiếu lịch sử. Không gộp các phiên bản bằng cách nối văn bản.

**Bạn chỉ cần review bản master:** Brief → Feature list → Flow chart → Test cases → Prototype. Các mục dưới đây giúp truy quyết định và nguồn khi cần, không yêu cầu đọc lại mọi phiên bản.

## 1. Context đã chốt cho bản báo cáo mới

### 1.1. Yêu cầu và thông tin đã xác nhận

| Nội dung | Quyết định hiện tại | Căn cứ |
|---|---|---|
| Loại báo cáo | HCI Final Project Report cho Expiry | Yêu cầu hiện tại và lịch sử cung cấp |
| Ngôn ngữ | English như template | User xác nhận trong chat ngày 13/11/2026 |
| Bố cục | Bìa, mục lục, Part 1: Essay gồm Brief / Analyze / Produce / Test cases; Part 2: Prototype gồm Mobile / Web | Đọc trực tiếp template, 42 heading |
| Người ghi trên bìa | Nguyễn Tâm Đức — 24020005 | Lời user trong lịch sử, dòng 163–165 |
| Góp ý giảng viên | Chưa có hồ sơ góp ý được cung cấp | User xác nhận ngày 13/11/2026 |
| Usability test với participant | Chưa có dữ liệu thực hiện được cung cấp; giữ dạng kế hoạch | User xác nhận; trang Verification của Figma ghi NOT TESTED |
| Mức giống template | Giữ thứ tự mục, loại bảng/hình và cách giải thích; số liệu, tác giả, tính năng, links và kết quả phải thuộc Expiry | Yêu cầu dùng template của người khác cho báo cáo riêng |
| Mục tiêu gom context | Một bản để review, có quyết định rõ nguồn nào dùng; không yêu cầu user đọc lại mọi phiên bản | User chỉ rõ nguồn và phiên bản đang quá nhiều |

### 1.2. Sản phẩm và sáu nhóm tính năng hiện hành

Nguồn định hướng là **Figma Project Brief, page 173:225, root 1121:7**, được đọc trực tiếp ngày 13/11/2026. Đây là định hướng/đặc tả sản phẩm, không tự chứng minh behavior đã chạy trên thiết bị.

Expiry giúp **người dùng cá nhân** ghi lại thực phẩm, biết món nào cần chú ý và theo dõi lượng còn lại. Ba nhóm hành vi là P01 hay quên thực phẩm, P02 hay đổi kế hoạch và P03 muốn theo dõi chính xác. Bối cảnh hộ gia đình có thể xuất hiện trong scenario; không vì vậy suy ra shared household workspace hay nhiều account roles.

| Feature hiện hành | Nội dung dùng trong báo cáo | Phần phải giữ đúng |
|---|---|---|
| F01 · Manual entry | Nhập tay bằng biểu mẫu chung | Có thể chọn nhập tay hoặc chuyển sang khi OCR không đọc được; kiểm tra trước Lưu |
| F02 · OCR capture | OCR là lối nhập ưu tiên, điền gợi ý vào form | Người dùng kiểm tra, sửa và xác nhận; OCR không tự lưu |
| F03 · Food management | Xem/tìm/lọc/sửa/ghi chú; trash/restore/permanent delete; hẹn kiểm tra từ chi tiết | Hẹn kiểm tra lại không đổi HSD; lượng về 0 không đồng nghĩa xóa bản ghi |
| F04 · Category & storage | Danh mục và nơi cất là hai dữ liệu riêng; chọn/tạo/đổi tên/xóa nơi cất | Xóa nơi cất không xóa thực phẩm; có xác nhận chuyển nơi hoặc để trống |
| F05 · Expiry & reminders | Sắp hạn/quá hạn/chưa rõ hạn; thông báo và lịch kiểm tra lại | Xem/đọc/hoãn/thiết lập nhắc; không biến lịch nhắc thành gia hạn HSD |
| F06 · Quantity & Insights | Đã dùng, Đã bỏ, Điều chỉnh; Insights chứa Lịch sử và Thêm lại | Thêm lại tạo bản ghi mới; không tự dùng lại HSD cũ |

**Các nguyên tắc xuyên suốt:** thiếu hạn dùng phải thể hiện chưa rõ; không tự suy ngày từ ngày sản xuất; khác hạn dùng tạo bản ghi riêng; số lượng không âm, không trừ quá lượng đang có; không tự đổi đơn vị; Đã dùng / Đã bỏ / Điều chỉnh là ba intent khác nhau; Insights tổng hợp thao tác đã ghi nhận, tách theo đơn vị, không kết luận an toàn thực phẩm hoặc tiền tiết kiệm.

### 1.3. Thiết kế hiện tại và mức kiểm chứng

| Artifact | ID/page thật đã đọc | Cách dùng |
|---|---|---|
| UI Kit | 1374:7 | Đây là nơi link Figma trong lịch sử mở tới; không gọi chính link này là prototype Mobile/Web |
| Low-fi App / Web | 1865:399 / 1867:7 | Hình cho bước wireframe; đã inventory page, chưa audit mọi frame trong task này |
| Mid-fi App / Web | 1879:2503 / 1879:10218 | Hình phát triển tương tác; không đổi nhãn thành low-fi |
| Hi-fi App | 1496:177 | 126 FRAME states + 126 TEXT annotations trong 5 section; 5 flow starting points |
| Hi-fi Web | 1515:9 | 126 FRAME states + 126 TEXT annotations trong 5 section; 5 flow starting points |
| Screen-only App / Web | 2022:10243 / 2022:23230 | Hai gallery có tên ghi rõ không prototype; task này inventory page, receipt 11/11 là lịch sử |
| Design use-case specs | 459:2 | 24 UC-V4 atomic specs + 24 alternative/exception contracts |
| User flows | 173:233 | 24 UC-V4 flow roots + một onboarding flow; onboarding không là UC mới |
| State/consequence | 173:234 | 24 roots, nhãn DRAFT |
| Verification/trace | 173:236 | 24 roots, tên page có NOT TESTED; không dùng sự tồn tại của chúng để báo test pass |

Tổng topology Figma quan sát được là **31 page**. Đếm screen theo ID và type FRAME, không đếm annotation hoặc gộp các frame trùng tên. Có hai frame cùng mã HF-A020 và hai counterpart HF-W020; mỗi ID được giữ riêng trong inventory.

Luồng mà Brief và wiring source hiện tại cùng thể hiện: **Add → Scanner → biểu mẫu dùng chung (OCR/manual) → kiểm tra → Save → kết quả lưu**. Lịch sử nằm trong Insights. App.tsx hiện có History API pushState/replaceState. Các nhận định này là đọc source, **chưa phải kết quả chạy browser trong task này**.

Manifest hiện tại khai báo React ^19.0.0 và Vite ^8.0.5; API có Express/mysql2; service scan có FastAPI/pytesseract và các adapter DateReg/vision. Đây là dependency/source presence. Không giữ claim React 18, PaddleOCR, PWA/offline-first hoặc minimum OS như các capability đã được kiểm.

## 2. Nguồn và vai trò

| Source ID | Nguồn đã định danh | Quyền quyết định trong báo cáo |
|---|---|---|
| SRC-HISTORY | Toàn bộ 303 dòng CLI history + xác nhận hiện tại | Yêu cầu, tên/MSSV, links; lời assistant cũ chỉ là claim cần kiểm |
| SRC-TEMPLATE | [Opportunities HCI report](https://docs.google.com/document/d/1ocL8y__X-PFdTV-AkE01A1yXNLklaGJ6Fip-x3LzYaY) | Cấu trúc/format, không là bằng chứng về Expiry |
| SRC-BRIEF | [Figma Project Brief](https://www.figma.com/design/6IiKgkvUTzw2pCqRapbNK3/Expiry?node-id=1121-7), page 173:225 / root 1121:7 | Phạm vi, sáu features, các nguyên tắc sản phẩm hiện tại |
| SRC-UI | Cùng file Figma, các page ở §1.3 | Design artifacts, frame IDs, prototype starts; không suy usability hoặc runtime |
| SRC-SE | [System Engineering Gr2 trong folder user](https://docs.google.com/document/d/1RmwotnFoc0_vkIHhMJgvIo8LCQcErP6wYVPVYspn8SE) | Requirements/BR/thiết kế có phiên bản; nhiều tab đang có ghi chú review |
| SRC-UC | [Use Case Specifications — DRAFT](https://docs.google.com/document/d/1p2hYcmkg8FTVLQ1sq4_dUSzZdiZYx87ZZKjzLrg5wJI) | Catalog đầy đủ 29 SE UC và các biến thể đang review |
| SRC-PDF | [SE report ngày 29/10](https://drive.google.com/file/d/101lmYKEBLc3AnmgnuW0_2sqK-bEjrQvv/view) | Snapshot lịch sử, dùng cho trace và quá trình; không tự thắng nguồn live |
| SRC-LINKS | [Links spreadsheet](https://docs.google.com/spreadsheets/d/1vBfMhwO-qSurPSwp7Fbl_Ta-0gPWIEnNJDmqDpeNHHY) | Bảng công việc lịch sử, có nhiều người và cả Travelo; không là roster HCI hiện tại |
| SRC-LOCAL | Source/contracts/migrations, docs architecture 00–12 và .tmb task receipts | Source quyết định implementation; docs cũ/receipts quyết định lịch sử có ngày, không thay Brief |

Drive folder hiện có **4 file trực tiếp**, gồm hai Google Docs, một PDF và một Sheet; không còn dùng claim cũ rằng có ba tài liệu. Template có 1 tab, 26 bảng, 105 inline objects và 2 positioned objects. Đọc 42 heading không tương đương đã kiểm toàn bộ layout/hình; phần render template cần làm khi dựng báo cáo.

Đã kiểm kê **146 file** trong các thư mục architecture 00–12, cùng artifacts/task liên quan và source kỹ thuật được chọn. Một phần đã được đọc nội dung; các file còn lại ghi DISCOVERED_NOT_READ trong register. Không tuyên bố đã review nội dung mọi file chỉ từ kiểm kê.

## 3. Chọn phiên bản để viết, thay cho review mọi source

Các lựa chọn dưới đây là **baseline biên tập cho báo cáo mới** có căn cứ; chúng không sửa, xóa hoặc phê duyệt lại các tài liệu gốc.

| ID | Xung đột / phiên bản | Quyết định dùng cho báo cáo | Hệ quả |
|---|---|---|---|
| V01 | Brief local được nhiều map dẫn tới nhưng file không tồn tại | Dùng Brief Figma live; snapshot 29/10 là lịch sử | Không dựng lại Brief local bằng phỏng đoán |
| V02 | Figma Brief live đã có OCR ưu tiên / form chung / History trong Insights; Docs Brief còn văn bản 29/10 | Nội dung current theo Figma; Docs giúp provenance và rules còn phù hợp | Viết đúng điểm đổi, không copy Docs nguyên khối |
| V03 | 8 food::F-01…08 trong docs cũ; 8 features tự đặt trong draft; 6 F01–F06 hiện hành | Dùng đúng 6 nhóm ở §1.2 | Trash thuộc F03; F06 là quantity/Insights; tài khoản là hỗ trợ |
| V04 | 12 UC-00…11 cũ, 24 UC-V4 Design, 29 SE UC | Dùng mục tiêu hành vi hiện hành cho phần kể; bảng 29 SE UC và crosswalk giữ đủ coverage | Không cộng 12+24+29; không ghép cùng số |
| V05 | Tab SR đã sửa lại có namespace28 riêng: UC03=OCR có camera, UC04=OCR không camera, UC05=nhập tay, UC06=tạo nơi; các ID sau bị dịch so với SE29 | Gọi rõ SR28::UC và SE29::UC; dùng SE29 cho registry báo cáo, giữ permission branches của SR28 để đối chiếu nội dung | Không ghép ID cùng số; kiểm History/Add-again và coverage theo nghĩa, không gọi đây chỉ là bản rút gọn |
| V06 | UC-03/04 có nhiều tab và lưu đồ khác nhau | Dùng baseline shared form + user Save của Brief; t.0 là registry29, các tab riêng là review variants | Mỗi khác biệt precondition/permission/cancel/postcondition được đối chiếu, không nhập nhằng thứ tự mới nhất |
| V07 | Local scenarios có 15, receipt HCI-08 có 36; local user-flows có 11, receipt HCI-11 có 13, Figma live có 24 flow roots | Viết scenarios hiện hành theo ba persona và Figma live; số lịch sử chỉ dùng khi nói lịch sử | Không viện file 15 để chứng minh SC-16…36; không gọi 24 flow là 24 observed journeys |
| V08 | Auth-first Add trong docs cũ; source/Brief hiện tại đi Scanner/form | Mô tả entry và auth boundary theo layer; không khẳng định guest persistence/offline sync | Tách design path, UI wiring và điều kiện lưu phía API |
| V09 | Navigation doc cũ phủ nhận browser history; App có push/replace | Implementation note theo App.tsx | Không sửa runtime trong task báo cáo |
| V10 | Profile/quotes Canva cũ và ba nhóm research current | Dùng ba nhóm hiện hành; profile/quote chỉ là proto-persona có provenance | Không gọi quote là transcript hoặc validated research |
| V11 | Hi-fi prototype và screen-only gallery cùng nội dung | Hình lấy nguồn phù hợp, link tương tác trỏ hi-fi start nodes | Không lấy gallery không reaction để kết luận prototype hỏng |
| V12 | 30-day trash, precision/performance, platform minimums, SUS targets trong nguồn cũ | Policy/target có nhãn khi có nguồn; không ghi như measurement đã chạy | Những số không có căn cứ bị bỏ khỏi kết quả |
| V13 | Links Sheet có nhiều thành viên, user nói bìa chỉ có mình | Giữ Nguyễn Tâm Đức — 24020005 trên bìa | Không suy một người đã tự thực hiện mọi vai trò/full-stack/research |
| V14 | Góp ý giảng viên và severity=0 trong draft | User xác nhận chưa có feedback/data; viết đúng trạng thái | Bỏ lịch sử feedback bịa; heuristic chỉ có điểm sau review thật |
| V15 | Khoản 100 triệu, 16 tuần và team trong template | Giữ loại mục O/P/Q; Expiry phải có giả định/ước lượng riêng, nhãn proposed | Không sao chép số tiền/người/lịch như dữ kiện dự án |

### 3.1. Disposition từng tab Google Docs

| Tài liệu / tab ID | Tên hiện tại nguyên văn | Vai trò khi biên soạn |
|---|---|---|
| SRC-SE / t.47g9ppnmhftn | Porject brief | Baseline 29/10 để đối chiếu; Figma live quyết định nội dung current |
| SRC-SE / t.mk12q97jahu7 | System Requirements | Bản requirements đầy đủ có comments dạng ??? / cần xem lại; chưa gọi finalized |
| SRC-SE / t.e1u97ur3bqad | SR đã sửa lại | Namespace SR28 riêng, tách OCR theo camera permission và đánh lại số từ UC03; semantic crosswalk trước dùng |
| SRC-SE / t.dnk9du5ct57l | Bussiness rules (lấy) | Nguồn BR hỗ trợ; đối chiếu nghĩa với Brief |
| SRC-SE / t.x2l3prljmy9r | Use Case Specifications · UC-01–10 | Đặc tả chi tiết 10 UC đầu; không gọi là đầy đủ 29 |
| SRC-SE / t.91kc3ykx2ckn | Tab 6 | Hai external reference links; locator, chưa đọc hai đích ngoài này trong task |
| SRC-SE / t.6wn8fcwk1zyl | Tab 7 | Notes thảo luận, không tự thành yêu cầu đã duyệt |
| SRC-SE / t.v1fvfltgcd3u | Feature Thêm | Notes về nhóm Thêm; các mục tiêu thời gian phải có nhãn target |
| SRC-SE / t.woa7twd8na3b | Feature Reminder | Notes nhóm nhắc hạn/push; không chứng minh push chạy |
| SRC-UC / t.0 | Tab 1 | Registry 29 UC, DRAFT / NOT EXECUTED; dùng cho bảng coverage |
| SRC-UC / t.27xbyqlqq1e | Tab 2 | UC-04 variant; so nghĩa, không tính UC mới |
| SRC-UC / t.6kl2cvvsjxio | Tab 3 · UC-04 — Đặc tả BF/AF/EF (Review) | UC-04 đối chiếu sequence; không tự thay mọi nguồn khác |
| SRC-UC / t.vz8fp96861ea | UC-03 lh | UC-03 variant; so pre/post, error/cancel và Save |
| SRC-UC / t.dt3xh6pji21h | UC-04 lh | UC-04 variant; cùng nguyên tắc đối chiếu |
| SRC-UC / t.1e9l8hln1jfg | Tab 6 | Không trả text paragraphs trong readback; topology giữ riêng, không tính nội dung đã đọc |

### 3.2. Các khác biệt UC-03/04 đã đối chiếu theo nội dung

Các locator dưới đây là startIndex của paragraph trong đúng tab ở snapshot SRC-UC; chúng không là số dòng file. Bảng này ghi quyết định biên tập cho báo cáo. Những nhánh còn thiếu cần bổ sung vào nội dung báo cáo/flow dẫn xuất, không giả như nguồn gốc đã đầy đủ hoặc runtime đã chạy.

| ID | Khác biệt thực tế giữa các bản | Evidence định vị | Cách viết thống nhất cho báo cáo |
|---|---|---|---|
| U01 | Permission được đặt khi thì precondition, khi thì branch. Tab2 đặt các tình huống cho phép/không cho phép/không đọc được dưới Preconditions | t.0:18528; Tab2:416/472/533; Tab3:685/1445/1582 | Preconditions là truy cập màn Thêm và điều kiện phiên phù hợp để lưu. Camera permission chỉ áp cho nhánh chụp, không bắt các điều kiện loại trừ nhau cùng đúng |
| U02 | Từ chối camera: t.0/Tab2 mở form, Tab3 kết thúc OCR, OCR lh sang thư viện hoặc manual UC03 | t.0:21787/21914; Tab2:3719/3846; Tab3:3186/3267; OCR lh:2305/2352 | Theo Brief live, task Thêm vẫn có manual/shared form. Phân biệt kết thúc một OCR attempt với người dùng bỏ toàn bộ task. Gallery chỉ ghi như option khi thiết kế hiện hành xác nhận |
| U03 | OCR đọc được 0 trường: t.0/Tab2 mở form trống; Tab3 bắt retry/cancel; lh có retry/manual | t.0:19489/20658/20892; Tab2:1421/2590; Tab3:3506/3585; OCR lh:2426/2513/2551 | Empty recognition → shared form trống → nhập bổ sung → explicit Save. Quét lại là lựa chọn; không bắt quét lại mới được nhập |
| U04 | Note giới hạn quá 3 lần quét không có counter/threshold/reset trong flow | OCR lh:420/524 so với2513/2551 | Giữ unresolved/proposed; không công bố ứng dụng có giới hạn3lần hoặc tự tạo requirement từ note |
| U05 | OCR lh có demo hai bước barcode/tên rồi HSD; bản khác chỉ ảnh nhãn→kết quả→form | OCR lh:524/1242; t.0:19380/19489/19871; Tab3:1743/1873/2054 | Đây là demo-specific note nếu cần. Không đồng nhất barcode và OCR hoặc gọi hai bước là định nghĩa chung UC04 |
| U06 | Empty recognition khác OCR service unavailable; Tab3/lh có nhánh lỗi xử lý riêng, t.0 chưa explicit tương đương | Tab3:4827/4898/5026; OCR lh:3151/3219/3264; t.0:19489 và22659 | Tách recognition empty / processing unavailable / save failure. Manual fallback theo Brief; bổ sung phần recovery thiếu khi viết, không gọi đã executed |
| U07 | UC03 lh ngắn hơn, dễ bỏ mất rule lượng/category/storage/HSD và không tự gộp | t.0:14999/15125/15267; manual lh:1024/1138; create-storage: t.0:15935/16105, lh:1644/1779 | Lấy dữ liệu/rules từ Brief+BR+t.0; dùng lh hỗ trợ sequence clarity. Tạo nơi cất và Save món là hai mutation riêng; quay lại giữ draft |
| U08 | No record trước Save khác result unknown khi mất phản hồi sau Save; summary lh dễ bị hiểu quá rộng | OCR lh:788/3474/3600; t.0:18687/22659/22799/22862; Tab3:5300/5385/5469 | Before Save → chưa tạo; confirmed failure → thất bại; response lost → chưa xác nhận; confirmed success → một bản ghi. Không tự retry create hoặc khẳng định không có bản ghi chỉ vì mất phản hồi |

**Hai lỗi prose nguồn cần tránh sao chép:** Tab3 paragraph4747 ghi hình mẫu thầy đã duyệt; không có provenance cho approval này và user hiện chưa cung cấp feedback. Overview t.0 paragraph1375–1490 có câu bị cụt; phải viết synopsis lại từ chi tiết và Brief, không suy phần chữ thiếu thành requirement.

Quy tắc biên tập đã chọn là **shared form → người dùng kiểm tra/sửa → explicit Save; manual fallback luôn khả dụng theo Brief**. SE29 là registry/coverage; từng chi tiết mâu thuẫn vẫn được reconcile theo bảng này.

## 4. Các lỗi trong draft phải xử lý trước

Hai file cũ [Markdown](/home/pro/Downloads/expiry/docs/architecture/HCI_FINAL_PROJECT_REPORT_EXPIRY.md) và [Word](/home/pro/Downloads/expiry/docs/architecture/HCI_FINAL_PROJECT_REPORT_EXPIRY.docx) được giữ nguyên như draft đầu vào.

| ID | Phát hiện cụ thể | Evidence trong Markdown / DOCX | Cách sửa |
|---|---|---|---|
| D01 | Kể bốn thay đổi do lecturer review và form ban đầu 9 trường khi user chưa cung cấp feedback | MD 615–620; history 163–165 | Bỏ attribution và số trường không có nguồn; giữ heading với trạng thái thật |
| D02 | Tựa 29 UC nhưng chỉ UC-01…20; mappings sai nghĩa | MD 309–333 | Thay toàn bảng, đủ UC21…29, kiểm mọi feature/FR/UC mapping |
| D03 | F06 bị đổi thành Trash; thêm F07 Insights | MD 281–314 | Dùng F01–F06 của Brief, sửa toàn phụ thuộc |
| D04 | Nói every path implemented; mọi heuristic severity0 | MD 492, 528–542 | Tách expected design/test spec/actual evidence; review thật trước chấm severity |
| D05 | Offline-first/PWA/IndexedDB/OS/browser/shortcut và stack chưa phân lớp | MD 73, 91–116, 160–167 | Source-backed current implementation riêng, support target riêng |
| D06 | Quote/outcome/scenario được trình bày như thực nghiệm | MD 196–214, 264–274 | Proto-persona và illustrative scenario có nguồn; không zero-waste/100%-accurate như result |
| D07 | Lẫn attention, quantity và deletion vào một lifecycle | MD 414–435 | Tách các chiều trạng thái, chỉ ghi transition có event/condition rõ |
| D08 | Một Design URL được gọi là cả hai interactive prototypes | MD 551–552, 627 | Link đúng App/Web và start nodes, tách screenshot gallery |
| D09 | Thiếu hình thật, native links và mục lục tự cập nhật | DOCX: 0 media/drawings, 0 hyperlink relationships, 0 TOC fields | Dựng trên bản sao native template, thêm hình/caption/cross-reference/TOC |
| D10 | ASCII diagrams bị dồn một paragraph; LaTeX/Markdown còn thô | DOCX XML; text lỗi 44ext{px} | Thay bằng diagram hình rõ và text native; render QA từng trang |
| D11 | Target thời gian và N=10/SUS≥82 thiếu căn cứ, nội bộ không nhất quán | MD 512–526 | Protocol có nhãn proposed, chọn threshold có rationale; chưa có results |
| D12 | Không có source register và references theo claim | Toàn file | Trace nhu cầu → feature/rule → UC/flow → screen → test → report section |

Kiểm DOCX ở task này là kiểm cấu trúc XML, không phải visual render mọi trang. Không dùng file có tồn tại làm bằng chứng bản nộp đã hoàn chỉnh.

## 5. Mapping đủ từng heading template

Giữ heading và thứ tự của template. Riêng số tiền trong heading Q là nội dung bài mẫu: bản Expiry giữ mục Budget và dùng ngân sách riêng có căn cứ/giả định, không giả làm dữ kiện 100 triệu.

| ID | Mục gốc trong template | Nội dung / nguồn / hành động cho Expiry | Trạng thái |
|---|---|---|---|
| T01 | Part 1: Essay | Giữ khối Essay với bốn chương như template. | Khung đã chốt |
| T02 | I. Brief | SRC-BRIEF; tách định hướng sản phẩm và implementation. | Cần viết lại |
| T03 | Background | Ba vấn đề hành vi trong Brief; không bịa tỷ lệ food waste. | Có nguồn |
| T04 | A. Project | Expiry, personal food inventory/expiry/quantity/Insights. | Có nguồn |
| T05 | B. Brand | SRC-UI Foundations/UI Kit: logo, palette, typography hiện hành. | Cần trích hình |
| T06 | C. Client | HCI coursework, bìa một tác giả đã xác nhận. | Có nguồn |
| T07 | D. Project deliverables | Catalog/spec/wireframe/hi-fi/test plan/report; trạng thái từng loại. | Cần phân loại |
| T08 | E. Proposed Technology Stack | SRC-LOCAL: manifest/source, không gọi presence là deployment. | Cần sửa draft |
| T09 | F. Supported platforms | Mobile/Web design; OS/browser/PWA là target nếu chưa test. | Có giới hạn |
| T10 | G. Brand background | Lý do thiết kế theo Brief; không bịa ngày thành lập. | Cần viết lại |
| T11 | H. Target audience | P01/P02/P03 theo current Brief; proto-persona có nhãn. | Có nguồn |
| T12 | I. Coverage | Cá nhân, food; nhà hàng là future direction. | Có nguồn |
| T13 | J. Timing | Mốc source có ngày và lịch dự kiến tách riêng. | Chưa có deadline |
| T14 | K. Description | Capture/review/save → attention → action → recorded update. | Có nguồn |
| T15 | L. Objective | Mục tiêu thiết kế và kết quả cần đo; không outcome giả. | Có nguồn |
| T16 | M. Draft MVP | MoSCoW đề xuất dựa trên sáu features; không dùng scope cũ loại OCR. | Cần bảng |
| T17 | N. Scope: what we build and what we do not | In/out theo Brief; không thêm enterprise/co-edit/native release. | Có nguồn |
| T18 | O. Overall estimate | Work package, effort/assumptions/total rõ; proposed estimate. | Chưa có số thật |
| T19 | P. Human resources | Tác giả một người; role allocation có nhãn dự kiến, không timesheet. | Cần bảng |
| T20 | Q. Budget (100,000,000 VND) | Giữ mục Q, lập scenario budget cho Expiry, không copy 100 triệu. | Chưa có ngân sách |
| T21 | II. Analyze | Nối vấn đề → nhu cầu → quyết định thiết kế. | Cần biên soạn |
| T22 | A. Scenarios | Ba scenario theo persona, time/place/pain/action/feature/screen và recovery. | Cần viết từ nguồn |
| T23 | B. Persona | Ba nhóm current; card gốc có provenance, không interview result. | Có nguồn |
| T24 | C. Sympathy map | Giữ nhãn template; empathy synthesis có nguồn/giả thuyết rõ. | Cần hình/bảng |
| T25 | D. Feature list | F01–F06 và hỗ trợ tài khoản; FR/NFR tách scope/targets. | Có nguồn |
| T26 | III. Produce | Hình diagrams và giải thích thiết kế theo goal. | Cần dựng nội dung |
| T27 | A. Flow chart | Use case, user flow, sitemap, IA, sequence, HTA, journey, state; đủ coverage29 qua crosswalk. | Cần reconcile/hình |
| T28 | B. UX wireframe | Low-fi/mid-fi App/Web thật; mỗi hình principle → decision → frame ID. | Cần chọn/export |
| T29 | IV. Test cases | Precondition/steps/expected/actual/status/evidence; coverage29 và recovery. | Cần viết lại |
| T30 | Usability test plan | Method/tasks/metrics/procedure/sample/targets đề xuất; results chưa có. | Planned |
| T31 | Heuristic self-evaluation | 10 heuristics, frame evidence/finding/severity/rationale/action. | Chưa review mới |
| T32 | Part 2: Prototype | Giữ Mobile trước Web, native design links và scope rõ. | Khung đã chốt |
| T33 | I. Mobile | SRC-UI page1496:177; phân biệt inventory126 states và runtime. | Có inventory |
| T34 | Visual design | Foundations + App hiện hành, lý do và hình. | Cần hình/rationale |
| T35 | App map | Navigation thật, Add→Scanner, History trong Insights. | Cần sơ đồ |
| T36 | Key screens | Inventory/detail; scanner/form; quantity; Insights/history/re-add; settings/auth/recovery. | Có IDs, cần hình |
| T37 | Changes after lecturer review | Ghi chưa có documented feedback; internal iterations chỉ khi có nguồn riêng. | Chưa có feedback |
| T38 | II. Web | SRC-UI page1515:9; cùng business rules với Mobile. | Có inventory |
| T39 | Visual design | Foundations + Web hiện hành, layout và lý do. | Cần hình/rationale |
| T40 | App map | Sidebar/subviews theo design/source; không tự thêm shortcuts/bulk actions. | Cần sơ đồ |
| T41 | Key screens | Counterparts của tác vụ Mobile, có frame ID và caption. | Có IDs, cần hình |
| T42 | Differences from the mobile app | So sánh hierarchy/input/navigation/recovery quan sát được; support target riêng. | Cần bảng |

**Front matter và trình bày:** sao chép template natively để giữ layout/embedded features; thay bìa/people/project/date/links; mục lục tự cập nhật; heading styles; bảng native; numbering hình/bảng; caption và cross-reference; page numbers; references/source notes. Main body giữ đúng template. Chi tiết catalog/trace có thể đặt dưới mục liên quan hoặc appendix cuối, không biến báo cáo thành một template khác.

## 6. Catalog dùng cho coverage, không lẫn namespace

Bảng này dùng **SE UC-01…29** theo SRC-UC t.0. Cột Design lấy từ semantic crosswalk của package29/10 và topology live24; mapping là provenance hỗ trợ, chưa là xác nhận từng dòng spec của hai bên tương đương hoàn toàn. Nội dung khác Brief live phải reconcile trước đưa vào bản báo cáo.

| SE UC | Mục tiêu | Design ID đã có mapping |
|---|---|---|
| UC-01 | Đăng ký tài khoản | UC-V4-01 |
| UC-02 | Đăng nhập | UC-V4-02 |
| UC-03 | Thêm thực phẩm bằng tay | UC-V4-03 |
| UC-04 | Thêm thực phẩm bằng OCR | UC-V4-04 |
| UC-05 | Tạo nơi bảo quản | UC-V4-05 |
| UC-06 | Xem danh sách thực phẩm | UC-V4-06 |
| UC-07 | Xem thông tin thực phẩm | UC-V4-07 |
| UC-08 | Tìm kiếm thực phẩm | UC-V4-08 |
| UC-09 | Sửa thông tin thực phẩm | UC-V4-09 |
| UC-10 | Chuyển bản ghi vào Thùng rác | UC-V4-10 |
| UC-11 | Ghi nhận Đã dùng | UC-V4-11 |
| UC-12 | Ghi nhận Đã bỏ | UC-V4-12 |
| UC-13 | Điều chỉnh lượng thực tế | UC-V4-13 |
| UC-14 | Xem món cần chú ý | UC-V4-14 |
| UC-15 | Hẹn kiểm tra lại | UC-V4-15 |
| UC-16 | Xem thông báo | UC-V4-16 |
| UC-17 | Đánh dấu đã đọc | UC-V4-17 |
| UC-18 | Hoãn thông báo | UC-V4-18 |
| UC-19 | Thiết lập thông báo | UC-V4-19 |
| UC-20 | Xem Thùng rác | UC-V4-20 |
| UC-21 | Khôi phục bản ghi | UC-V4-21 |
| UC-22 | Xóa vĩnh viễn | UC-V4-22 |
| UC-23 | Xem Insights | Không có ID riêng trong crosswalk này |
| UC-24 | Lọc thực phẩm | Không có ID riêng trong crosswalk này |
| UC-25 | Đổi tên nơi bảo quản | Không có ID riêng trong crosswalk này |
| UC-26 | Xóa nơi bảo quản | Không có ID riêng trong crosswalk này |
| UC-27 | Phân loại thực phẩm | Không có ID riêng trong crosswalk này |
| UC-28 | Xem Lịch sử thực phẩm | UC-V4-23 |
| UC-29 | Thêm lại thực phẩm từ Lịch sử | UC-V4-24 |

UC-23 của SE là Insights, còn UC-V4-23 là History. Giữ tiền tố đầy đủ mỗi khi trace. Không thêm số lượng UC chỉ để làm bằng bản khác.

## 7. Kế hoạch thực hiện theo đầu ra

| Bước | Công việc và owner tài liệu | Đầu ra review được | Điều kiện qua bước | Hiện trạng |
|---|---|---|---|---|
| P0 | Chốt yêu cầu, nguồn, revision và version dispositions | Tài liệu này + snapshots/register | Đủ inputs đã cung cấp, 42 heading, 29SE/24Design phân biệt | Đã thực hiện trong task này |
| P1 | Reconcile nội dung: Brief/features/BR/UC03/04/auth/history; chọn dữ kiện hiện tại | Một content baseline trong bản master, bảng conflict resolutions | Không còn conflict trọng yếu bị giấu; full coverage29 và recovery | Hoàn tất:95requirements/17rules/29UC, nguồn và namespace riêng |
| P2 | Viết toàn bộ Essay bằng tiếng Anh đúng T01–T31 | Một bản prose duy nhất; scenario/persona/feature/flow/test tables | Mỗi claim có source/status; không feedback/measurement bịa | Hoàn tất;37test specifications đều NOT EXECUTED; usability protocol proposed |
| P3 | Lấy hình thật và hoàn thiện Prototype T32–T42 | Figures/captions/App-Web comparisons; figure manifest | Tất cả hình đúng file/page/frame; diagrams đọc được ở kích thước trang | Hoàn tất32figure placements; occupied-location delete-confirmation không có frame nguồn, được ghi rõ giới hạn |
| P4 | Dựng trên bản sao native của template | Một Google Doc master, tên Expiry — HCI Final Project Report — Nguyễn Tâm Đức | Không còn people/links/content Opportunities; native tables/TOC/figures hoạt động | Hoàn tất42headings,42linked nativeTOC entries,44tables,32inlinefigures; giữ bìa/styles/header/footer template |
| P5 | Kiểm nội dung và trình bày, xuất cùng revision | Readback native + PDF; DOCX export nếu cần; verification receipt | Đủ gates ở §8, kiểm từng trang và links; caveats rõ | Hoàn tấtreadback và render/xem83trangPDF; headers lặp, rows không bị cắt; evidence ở task production |
| P6 | User review bản báo cáo hợp nhất | Một link master và checklist ngắn về quyết định còn lại | Chỉ user/người có thẩm quyền mới xác nhận ACCEPTED | Chưa thực hiện |

**Cách giữ một bản rõ ràng:** Google Doc master là nơi biên tập sau khi bắt đầu viết. PDF/DOCX là export cùng mốc revision, không là ba bản sửa độc lập. Draft cũ giữ làm lịch sử, không đổi tên nó thành FINAL chỉ vì đã đủ chữ. Các bản gốc SE/Figma không bị di chuyển, xóa hay sửa bởi công việc báo cáo này.

### 7.1. Phạm vi hình và flow cần bao phủ

| Nhóm | Hình/diễn giải cần có | Recovery cần thể hiện |
|---|---|---|
| Research | Ba persona, empathy synthesis, scenario mapping | Giả thuyết và data thiếu được gắn nhãn |
| Produce | Use case diagram; goal flows; sitemap/IA; sequence OCR→form→Save và quantity; HTA; journey; consequence/state | Manual fallback, permission/input error, cancel, save failure/unknown outcome |
| Wireframe | Low-fi và mid-fi App/Web đối chiếu theo cùng task | Empty/loading/error/validation; không chỉ happy screenshot |
| Inventory/detail | Món đang có, hạn/lý do cần chú ý, lượng, nơi cất, action hierarchy | Chưa rõ hạn, empty/filter-none, return context |
| Capture/form | Scanner, OCR suggestions, manual/shared form, Save | OCR lỗi/không rõ, manual, dirty cancel, save failure giữ draft |
| Quantity | Đã dùng/Đã bỏ/Điều chỉnh, trước→sau | Vượt lượng, invalid input, xác nhận, kết quả chưa rõ |
| Insights/history | Tổng quan, Lịch sử, Thêm lại | Không có dữ liệu, bản ghi mới và kiểm lại HSD |
| Reminder/settings | Lịch kiểm tra, thông báo, đọc/hoãn/thiết lập | Quyền thông báo không được cấp; không đổi HSD |
| Trash/storage/auth | Xóa/khôi phục, nơi cất, tài khoản hỗ trợ | Confirm/cancel, xóa nơi có món, hết phiên/lỗi xác thực |

Các frame đại diện được chọn theo task coverage; toàn bộ126state/platform giữ trong manifest để không bỏ sót bắt buộc. Không chèn mọi annotation hoặc gallery copy vào báo cáo để tăng số trang.

### 7.2. Chỗ chưa có dữ liệu và cách viết để vẫn hoàn thiện báo cáo trung thực

| Thiếu gì | Cách xử lý trong bản báo cáo | Có ngăn viết không? |
|---|---|---|
| Lecturer feedback | Giữ mục, ghi No documented lecturer feedback has been supplied for this report. Không kể thay đổi như feedback thật | Không |
| Participant usability results | Có protocol planned và limitations; không tự tạo SUS/success/time | Không; chỉ chưa thể gọi study đã chạy |
| Deadline / effort / budget thật | Kế hoạch/ước lượng proposed có giả định và phép tính, hoặc ghi chưa xác định; không sao chép số mẫu | Không; cần chốt nếu muốn gọi committed/actual |
| Thông tin giảng viên/lớp/năm học ngoài template | Chỉ điền khi có nguồn; không dùng người của bài mẫu | Không ngăn draft; cần trước bản bìa nộp nếu trường bắt buộc |
| Minimum platforms, PWA/offline, device/playback results | Ghi designed/target/unverified đúng phạm vi, chỉ nâng claim sau check phù hợp | Không |
| Tab rỗng/ảnh hoặc external references chưa đọc | Inventory giữ trạng thái và ID; đọc bổ sung nếu claim cuối phụ thuộc | Chỉ chặn claim phụ thuộc |

## 8. Điều kiện hoàn tất bản báo cáo cuối

1. Có đủ 42 mục template theo thứ tự, bìa/mục lục và bảng/hình tương ứng; không còn project/tác giả/links của Opportunities.
2. F01–F06 đúng Brief; full29SE coverage có semantic crosswalk24Design; không còn bảng ghi29 nhưng chỉ20.
3. Cùng một hành vi xuyên scenario → feature/rule → UC/flow → wireframe/hi-fi → test. Hiện tại/đề xuất/lịch sử được phân biệt.
4. Hình thật, rõ ở kích thước trang, có caption, số thứ tự, frame/source và tham chiếu trong prose; không có ASCII diagram dồn dòng.
5. Test case có expected/status/evidence; usability chưa chạy ghi planned; heuristic có finding thật hoặc ghi chưa đánh giá. Không severity0 hàng loạt thiếu evidence.
6. State model tách attention/date, quantity và deletion; không ám chỉ quá hạn tự vào trash hoặc snooze gia hạn HSD.
7. Native headings/tables/hyperlinks/TOC còn hoạt động; đọc lại Google Doc và kiểm từng trang PDF: clipping, bảng vỡ, ảnh mờ, orphan heading, blank page, số trang/caption.
8. Budget/estimate/timing/team đúng scope và giả định; các tổng số/công thức tự khớp. Không giả lịch sử đóng góp cá nhân.
9. Ghi rõ checks đã chạy, giới hạn device/runtime/production/participant; CREATED/VERIFIED không tự thành ACCEPTED.
10. User chỉ review một bản master có trạng thái và các quyết định cần thiết; mọi source/version chi tiết có thể truy từ register.

## 9. Trạng thái và bằng chứng của task lập kế hoạch

Đã đọc toàn bộ lịch sử paste, toàn bộ draft Markdown, kiểm XML DOCX; đọc template native; đọc text mọi tab có nội dung mà connector trả về trong hai Docs, metadata topology đầy đủ 9/6tab; đọc bốn file Drive theo loại; đọc live Figma Brief và inventory các page/hi-fi/flow roots liên quan; đọc có chọn lọc các source local và receipts để phát hiện drift.

**Không có claim đã xem mọi hình, mọi dòng source, mọi nội dung của31page, hay đã chạy prototype/usability.** PDF source được đọc bằng text extraction trong task này, chưa render kiểm mọi trang; Sheet đọc text không kiểm formula/format. Low/mid-fi và screen-only chỉ được xác định topology ở task này.

Audit TMB baseline FAIL với 109 failures và 85 unresolved references, gồm Brief local bị thiếu và source/map drift. Sau refresh, audit FAIL với 110 failures / 85 unresolved: mục tăng thêm là file kế hoạch mới chưa tracked bị validator cũ gọi out of scope. File đó nằm trong yêu cầu hiện tại; không sửa validator hoặc commit chỉ để đổi kết quả audit. Checks riêng của kế hoạch kiểm links/hashes/coverage và bảo toàn source, tách khỏi audit chung.

Source register và snapshots: [thư mục task](/home/pro/Downloads/expiry/.tmb/tasks/HCI-REPORT-20261113/SPEC.md), [SOURCES.json](/home/pro/Downloads/expiry/.tmb/tasks/HCI-REPORT-20261113/SOURCES.json), [VERIFICATION.json](/home/pro/Downloads/expiry/.tmb/tasks/HCI-REPORT-20261113/VERIFICATION.json).

## 10. Bằng chứng biên soạn và trạng thái bàn giao

[Task production](/home/pro/Downloads/expiry/.tmb/tasks/HCI-REPORT-WRITE-20261113/SPEC.md), [verification](/home/pro/Downloads/expiry/.tmb/tasks/HCI-REPORT-WRITE-20261113/VERIFICATION.json) và [work report](/home/pro/Downloads/expiry/.tmb/tasks/HCI-REPORT-WRITE-20261113/WORK-REPORT.md) giữ baseline SE, full29UC specifications, figure provenance, native revision và PDF hash. Đã đọc lại cấu trúc native và kiểm tra toàn bộ83trang render; việc này không phải prototype playback, browser/database test, participant study hay acceptance.

Mục lục giữ nguyên loại phần tử native của template, được cập nhật đủ42heading và liên kết tới đúng heading IDs. Bản hiện tại dùng mục lục liên kết không số trang để tránh số trang cũ. Khi chỉnh heading trong Google Docs sau bàn giao, dùng thao tác Update table of contents của Google Docs để cập nhật lại.
