# DOC-FINAL-CHECK-PERSONA — FINAL CHECK, persona và phương án UI food

- Document ID: `DOC-FINAL-CHECK-PERSONA`
- Status: **Review**
- Updated: 2026-10-10

## Purpose

Giữ truy vết từ nhu cầu trong ba persona Canva qua bản FINAL CHECK hiện hành đến phương án food inventory và UI demo. Mỗi quan hệ hỗ trợ được đọc theo ý nghĩa yêu cầu; số ID giống nhau giữa hai tài liệu không tạo ra quan hệ tương đương.

## Evidence sources

- [FINAL CHECK — System Engineering Gr2](https://docs.google.com/document/d/1js1KBfrVrgDn9EVC4_sNGIvUlWQNlLRC66nyTeAvBmA/edit?tab=t.1rjc5vc4ma1w), bản native readback sau cập nhật ngày 2026-10-10: [snapshot](../00-context/sources/google-doc-final-check-2026-10-10.md).
- Revision readback: `AHj4eMS5EWe-jr7L4pHoM2K-E6BEo9zjw16uvcESw_yvGNDsovpQqmff6fOg2H3XwNoA0TY9TPgjRNyuN9QjckK20SN4AjaiSwSTns135X8`.
- [Source register](../00-context/source-register.md), [Canva persona source](../00-context/sources/canva-personas.txt) và [ba persona](../01-personas/README.md).
- [Slide System Engineering.pdf](../../../doc/SystemEngineer/Slide%20System%20Engineering.pdf), trang 70–73: phân tầng Business, User (stakeholder), Functional, Nonfunctional và Transition Requirements.

## Definitions and assumptions

[A] FINAL CHECK là bản đặc tả đang được chỉnh cho môn System Engineering; nó vẫn ghi trạng thái dự thảo phục vụ đánh giá và thống nhất yêu cầu. Canva cung cấp nội dung persona, chưa cung cấp hồ sơ phỏng vấn gốc hoặc mẫu người dùng để xác nhận tính đại diện.

| Không gian ID | Nơi định nghĩa | Cách đọc |
|---|---|---|
| `FINAL CHECK::BR-01…04`, `SYS-SR-01…07`, `UR-01…10`, `FR-*`, `NFR-*`, `FEAT-*`, `RULE-*`, `SC-*` | Tab FINAL CHECK và snapshot đọc lại ở trên | Prefix `FINAL CHECK::` trong bản đối chiếu chỉ xác định tài liệu nguồn; ID trong Google Docs được giữ nguyên |
| `SYS-BR-*`, `SYS-FR-*`, `SYS-NFR-*` | [Bản tóm tắt toàn hệ thống](../../Expiry_System_Requirements_Summary.md) | Bản tổng hợp yêu cầu logic riêng; `SYS-BR-01` không đồng nghĩa `FINAL CHECK::BR-01` |
| `BR-V1-*`, `ST-V1-*`, `FR-*`, `NFR-*`, `F-*`, `RULE-*`, `UC-*`, `SC-*`, `UF-*`, `WF-*` | Bộ architecture food và [registry](../11-traceability/registry.json) | Phương án thiết kế food để review; `food::FR-03` là attention, còn `FINAL CHECK::FR-03` là cập nhật thông tin |
| `P-01/P-02/P-03` và `P1/P2/P3` | FINAL CHECK và bộ persona architecture | Cùng ba persona Canva, hai cách viết; không phải hai bộ người dùng hay RBAC roles |

[C/D] Bảng dưới đây là đối chiếu hỗ trợ theo ngữ nghĩa, chưa xác nhận hai requirement tương đương hoàn toàn. Các ID food trong registry được giữ nguyên; không nhập các ID FINAL CHECK vào graph như các định nghĩa thay thế.

## Analysis

### Stakeholder rộng hơn persona

| FINAL CHECK | Nhóm và trách nhiệm | Căn cứ |
|---|---|---|
| ST-01 | Người dùng cá nhân / người phụ trách thực phẩm trong hộ gia đình | P-01, P-02, P-03 làm rõ bối cảnh, khó khăn và nhu cầu trong nhóm người dùng trực tiếp |
| ST-02 | Nhóm quản lý và đánh giá dự án | Cần phạm vi, căn cứ và tiêu chí đánh giá BR; không phải persona người dùng |
| ST-03 | Nhóm phát triển và vận hành | Cần yêu cầu, thuật ngữ, quy tắc và điều kiện kiểm tra nhất quán; không phải persona người dùng |

Một người có thể mua, cất, xem, sử dụng, cập nhật và nhận nhắc. Các hoạt động đó không tự tạo nhóm stakeholder, persona hoặc loại tài khoản riêng. Bối cảnh hộ gia đình của P-02 chưa xác nhận kho dùng chung nhiều tài khoản.

### BR hiện hành và quan hệ hỗ trợ từ phương án food

| FINAL CHECK BR — giữ nguyên mục tiêu | Persona liên quan | Phương án food hỗ trợ | Giới hạn đánh giá |
|---|---|---|---|
| BR-01: Giảm lãng phí thực phẩm trong hộ gia đình | P1 về mất chú ý; P2 về kế hoạch đổi | BR-V1-01 (visibility), BR-V1-02 (decision); NEED-01/02 | Món hiện lại hoặc thao tác thành công chưa chứng minh giảm lãng phí; cần baseline và theo dõi thực tế |
| BR-02: Hỗ trợ quyết định sử dụng và xử lý thực phẩm | P2 là trọng tâm; cả ba cần lý do và giới hạn dữ liệu | BR-V1-02; NEED-02 | Đánh giá người dùng hiểu lý do, nhận biết thiếu căn cứ và chọn được bước tiếp |
| BR-03: Tối ưu việc sử dụng nguồn lực trong hộ gia đình | P2 tận dụng món đã mua; P3 tin cậy tồn kho | BR-V1-01/02/03; NEED-01/02/03 | Tồn kho đúng hỗ trợ quyết định; chưa chứng minh tiết kiệm chi phí hoặc giảm mua trùng |
| BR-04: Duy trì hiệu quả quản lý thực phẩm lâu dài | Công nhập/cập nhật của cả ba; P3 là trọng tâm | BR-V1-01/03; NEED-01/03 | Cần đo công duy trì và sử dụng qua thời gian; không tự đặt ngưỡng giây/số chạm |

### Stakeholder requirements hiện hành và phương án đáp ứng

| FINAL CHECK ID | Nhu cầu / bên sở hữu | Quan hệ trong phương án food | Trạng thái đáp ứng của demo |
|---|---|---|---|
| SYS-SR-01 | Nhận biết thực phẩm đang quản lý — ST-01 | ST-V1-01; NEED-01; FR-01/02/03 | Có đường nhập, danh sách và attention trong mock; cần kiểm tra tác vụ P1 và dữ liệu cụ thể |
| SYS-SR-02 | Có thông tin để đưa ra quyết định — ST-01, P2 trọng tâm | ST-V1-02; NEED-02; FR-03/04/05 | Prototype minh họa lý do, dữ liệu ngày và hành động; chưa là validation quyết định |
| SYS-SR-03 | Giảm công sức cập nhật — ST-01, P3 trọng tâm | ST-V1-03; NEED-03; FR-01/04/05/06/07/08 | Các đường từng sản phẩm thuộc core; mức công sức cần đo với người dùng |
| SYS-SR-04 | Nhận được thông báo phù hợp — ST-01 | FR-03/09 hỗ trợ attention trong app | Kênh gửi, lập lịch và kiểm soát thông báo ngoài app chưa được xác nhận/triển khai |
| SYS-SR-05 | Bảo vệ thông tin quản lý — ST-01 | ST-V1-04; FR-10; NFR-01/04 | Auth và quyền trong mock không chứng minh bảo mật production; chia sẻ hộ gia đình chưa chốt |
| SYS-SR-06 | Đánh giá được hiệu quả hệ thống — ST-02 | [Research validation](../10-testing/research-validation.md), [coverage](../11-traceability/coverage.md) | Có kế hoạch và liên kết; chưa có nghiên cứu người dùng hoặc outcome data |
| SYS-SR-07 | Duy trì tính nhất quán phát triển — ST-03 | ST-V1-05; registry, rules, dictionary, contracts | Kiểm tra cấu trúc tài liệu không nghiệm thu backend, database hay vận hành |

### User requirements đến thiết kế và source UI

Các FR trong cột thứ ba thuộc **FINAL CHECK**. Các FR trong cột thứ tư thuộc **phương án food architecture**. Quan hệ này không đổi tên hoặc đổi nghĩa của bất kỳ ID hiện có nào.

| FINAL CHECK UR | Persona / nhu cầu | FINAL CHECK FR liên quan | Phương án food liên quan | Source UI sở hữu đường minh họa |
|---|---|---|---|---|
| UR-01: Theo dõi thực phẩm hiện có | P1/P2/P3; NEED-01 | FR-02/06 | FR-02/03 | Inventory, FoodCard, App query snapshot |
| UR-02: Nhập thông tin thuận tiện | Cả ba; giảm công capture | FR-01/10; FR-14 có điều kiện | FR-01 | EntryForm; App auth/draft continuation |
| UR-03: Số lượng và vị trí | P3; hỗ trợ P2; NEED-03 | FR-02/03/08 | FR-02/04/05/06 | FoodCard, Detail, EntryForm, MovementForm |
| UR-04: Sản phẩm cần chú ý | Cả ba; NEED-01/02 | FR-04/05/06 | FR-03 | mockApi attentionFor; Inventory, Badge |
| UR-05: Thông tin hỗ trợ quyết định | P2 trọng tâm; NEED-02 | FR-04/07 | FR-03/04/05 | Inventory/FoodCard/Detail hiển thị căn cứ và phát ý định; App điều phối |
| UR-06: Nhắc nhở phù hợp | P1/P2; phương án gửi cần xác nhận | FR-12/13 có điều kiện; FR-17 phản hồi | FR-09 hỗ trợ attention trong app | Settings và mock preference; chưa có dịch vụ gửi |
| UR-07: Cập nhật dễ dàng | P3 trọng tâm; NEED-03 | FR-03/08/10; FR-15 batch đề xuất | FR-04/05/06/08 | MovementForm/EntryForm; App command; mockApi |
| UR-08: Truy xuất thông tin đã lưu | P3; kiểm tra và sửa sai | FR-02/09/16 | FR-02/07/08 | Detail, History, Trash |
| UR-09: Giao diện rõ ràng | P2 thao tác dễ hiểu; cả ba giảm công | NFR-04 | NFR-05 accessibility; research-validation usability tasks | Shell, PageHeader, Badge, Button, Field, Modal, CSS |
| UR-10: Độ tin cậy của thông tin | Yêu cầu bản đặc tả; hỗ trợ P3, không là phát biểu trực tiếp từ Canva | FR-01/04/07/10/16/17 | FR-01/03/05/07; recovery conditions | Form date metadata, Detail caveat, StatusDialog, App commit feedback |

### Hướng build theo persona và acceptance cần quan sát

| Persona | FINAL CHECK scenario / hướng thiết kế | Đường UI cần có | Kiểm tra trực tiếp cần thực hiện |
|---|---|---|---|
| P1 | SC-01; mục 5.4 và 13.4 | Capture dữ liệu tối thiểu; có đường ngày chưa biết; thấy lại món trong kho/attention | Lưu dữ liệu hợp lệ; không tự đoán ngày; thấy tên/lượng/vị trí; bản nháp/auth continuation theo phạm vi đã chọn |
| P2 | SC-02; mục 5.4 và 13.4 | Nhận biết ưu tiên, xem lý do/lượng/vị trí/uncertainty; chọn kiểm tra hoặc hành động khi kế hoạch đổi | Bộ lọc đúng; ngày thiếu/qua mốc có đường xem/sửa; hủy hoặc chỉ xem không tạo physical event |
| P3 | SC-03; mục 5.4 và 13.4 | Bắt đầu dùng/bỏ/sửa lượng từ ngữ cảnh hiện tại; xác nhận rõ; xem kết quả và lịch sử | Dùng một phần cập nhật đúng; correction khác consume/discard; hủy không đổi; retry không giảm hai lần |

Ở bản đọc lại cuối, FINAL CHECK::SC-02 truy vết đến UR-03/04/05/07/10; FR-02/03/04/05/06/07/08/10; NFR-01/04/06 và BR-01/02/03. Quan hệ này bao phủ cả quyết định lẫn nhánh xác nhận hành động/sửa thông tin, không chỉ hiển thị priority.

Paths ở trên là acceptance cho prototype đã được người dùng cho phép chỉnh trong lượt này. Tài liệu này không tự ghi PASS cho browser hay usability; ghi kết quả thực chạy riêng trong handoff/verification report. Nguồn lượng và ngày demo vẫn thuộc mockApi, không phải quan sát ngoài đời.

### Ranh giới scope sau cập nhật

[A] FINAL CHECK mục 5.2/5.4 và FR-15 tách rõ công sức hợp lý của đường từng sản phẩm khỏi batch. Core thuận tiện được nêu ở FR-01/03/08 và NFR-04. FEAT-08/FR-15 chỉ là xử lý nhiều sản phẩm trong một thao tác, trạng thái **Tính năng đề xuất**. Persona chưa tự phê duyệt OCR/barcode, thông báo đẩy, tự động tạo công thức/thực đơn, kho dùng chung hoặc quản lý miền ngoài food.

[A] RULE-06 và SC-03 phân biệt correction, consume và discard. Chênh lệch chưa rõ nguyên nhân không tự ghi thành thực phẩm đã dùng hoặc lãng phí. Việc hiển thị hành động, gửi/đóng nhắc hoặc đổi bộ lọc không là physical event đã được xác nhận.

## Decisions and rationale

- Dùng ba persona chung trong một hệ thống, không tạo selector persona hoặc vai trò tài khoản mới.
- Giữ nguyên mục tiêu BR và nghĩa ID trong từng tài liệu; tạo crosswalk để tránh dùng nhầm ID cùng số.
- Dùng nguồn FINAL CHECK mới làm căn cứ cho thay đổi liên quan hiện tại; giữ flattened snapshot và thiết kế 08/10 làm provenance riêng.
- Tách verification về đúng dữ liệu/command/UI khỏi validation về quyết định/công sức và outcome về lãng phí/chi phí theo thời gian.

## Dependencies

- [Stakeholder requirements food](stakeholder-requirements.md)
- [Functional requirements food](system-requirements.md)
- [Business outcomes food](business-requirements.md)
- [Frontend owners](../09-advanced-web/state-and-integration.md)
- [Research validation](../10-testing/research-validation.md)
- [Prototype handoff](../../../uidemo/HANDOFF.md)

## Open questions

Phỏng vấn gốc, tính đại diện của persona, scope chia sẻ, kênh gửi nhắc, thời hạn lưu lịch sử và mục tiêu usability/outcome còn cần bằng chứng hoặc quyết định riêng. Quyền chỉnh prototype trong lượt này chưa là nghiệm thu production hay xác nhận lợi ích thực tế.

## Related documents

- [Requirements index](README.md)
- [Source register](../00-context/source-register.md)
- [System summary](../../Expiry_System_Requirements_Summary.md)
- [Architecture coverage](../11-traceability/coverage.md)

## Verification criteria

Chạy `python3 docs/architecture/scripts/validate_architecture.py` để kiểm tra đăng ký tài liệu và link. Đối chiếu từng source ID theo snapshot native, đảm bảo nghĩa graph hiện có không thay đổi. Các đường UI ở bảng persona phải được kiểm tra trên runtime cụ thể; kết quả chỉ được ghi nhận sau khi thực chạy và không thay cho user validation hoặc đo outcome.

Kết quả local ngày 2026-10-10: architecture structural validation **PASS**, 87 tài liệu, 203 artifact, 335 edge; graph artifact/edge count giữ nguyên. Snapshot trong repo trùng byte với native readback cuối và revision ở đầu tài liệu. Kết quả này kiểm tra nguồn/liên kết/cấu trúc, chưa ghi PASS cho browser, device, backend hay user validation.

### Runtime prototype — các đường đã quan sát ngày 2026-10-10

[A] Root task đã thực hiện các kiểm tra dưới đây trên browser preview local và báo lại kết quả. Dữ liệu, xác thực và command vẫn dùng mock của prototype; đây là verification các đường tương tác cụ thể, chưa là thử nghiệm người dùng theo persona.

| Đường kiểm tra | Kết quả quan sát | Phạm vi claim |
|---|---|---|
| P1: tạo món với ngày chưa biết, đi qua xác thực demo | Payload bản nháp được giữ; món được tạo có đúng một bản ghi lịch sử khởi tạo | PASS cho đường create/continuation đã thử; không là xác thực thật hoặc persistence sau reload |
| P2: lọc món thiếu ngày | Danh sách từ 5 món còn 1 món theo bộ lọc chưa biết ngày | PASS cho dữ liệu/bộ lọc đã thử; chưa xác nhận người dùng ra quyết định tốt hơn |
| P3: ghi dùng từ danh sách | Shortcut mở xác nhận; hủy giữ lượng 3; xác nhận dùng 1 còn 2; giữ ngữ cảnh danh sách | PASS cho hủy và commit đã thử; không thay cho mọi tình huống concurrency/transport |
| P3: đếm lại/sửa chênh lệch | Số lượng không đổi làm nút xác nhận bị vô hiệu hóa; đếm lại 2→4 tạo lịch sử “Kiểm lại” riêng với “Đã dùng” 3→2 | PASS cho no-op guard và phân biệt correction/consume đã thử; không tự quy correction thành waste |
| Đường sửa ngày và sửa thông tin | Shortcut sửa ngày từ cả dòng và chi tiết mở bước ngày; nút “Sửa” chung mở bước thông tin cơ bản | PASS cho bước form/ngữ cảnh mở; chưa PASS cho nhập thành công giá trị ngày native và lưu ngày mới |
| Validation khi chọn ngày chính xác nhưng bỏ trống | Form từ chối lưu, thể hiện lỗi và giữ ghi chú đã nhập | PASS cho validation/draft đã thử; chưa xác minh toàn bộ native date-input flow |
| Console trên đường create đã thử | Không quan sát warning/error | Giới hạn ở đường create và phiên browser đã kiểm tra |

Runtime đã quan sát form ngày ở viewport 320×568: vùng nội dung client 289 px / scroll 545 px và footer nằm trong viewport (đáy 552 ≤ 568 px). Kiểm tra nhận giá trị ngày từ native date control chưa hoàn thành; không suy từ việc mở được form hoặc hiển thị lỗi đúng thành việc đã lưu ngày mới thành công.

Sau thay đổi CSS cuối, root xác nhận các kích thước sau trên browser preview:

| Viewport | Document client / scroll width | Quan sát |
|---|---|---|
| 1440 px desktop | 1425 / 1425 px | Không có horizontal overflow trên view đã thử |
| 390×844 | 375 / 375 px | Urgency strip 2 cột; bốn control đã đo đều cao 49 px |
| 320×568 | 305 / 305 px | Urgency strip 2 cột; các control đã đo cao 49/49/68.5/68.5 px; trong kho, control nhóm later (“Chưa đến ngày theo dõi”) trải hai cột, rộng 241 px và cao 44 px |

Ảnh bằng chứng local: [desktop attention](../../../../../.codex/visualizations/2026/10/10/expiry-persona/desktop-attention.jpg), [mobile attention](../../../../../.codex/visualizations/2026/10/10/expiry-persona/mobile-attention.jpg), [mobile date form](../../../../../.codex/visualizations/2026/10/10/expiry-persona/mobile-date-form.jpg). Chúng minh họa view/viewport đã chụp; không là chứng nhận cho thiết bị thực hoặc mọi trạng thái ứng dụng. Root không quan sát warning/error trong log của các đường cuối đã thử.

Các lệnh do UI agent chạy và báo **PASS**, working directory `uidemo`:

```sh
pnpm exec tsc --noEmit
pnpm build
pnpm exec oxfmt --check src/App.tsx src/features/Inventory.tsx src/features/FoodCard.tsx src/features/Detail.tsx src/features/EntryForm.tsx src/features/MovementForm.tsx src/lib/format.ts src/mockApi.ts
git diff --check
```

Structural/source checks và runtime checks được ghi riêng vì mỗi nhóm trả lời một loại acceptance khác nhau. Việc hoàn tất các kiểm tra prototype có giới hạn ở đây không đánh dấu user validation đã hoàn thành.

UI agent xác nhận không thay TypeScript sau lần typecheck PASS; các lần sửa CSS cuối được build và diff-check lại. Asset cuối được báo là `index-D0ZrCCKG.js` và `index-BiFEQAVb.css`.

User validation theo mục 13.4, thiết bị thực/Safari, backend/auth/database và các kết quả giảm lãng phí, tiết kiệm chi phí, duy trì sử dụng lâu dài vẫn chưa được xác nhận bởi những kiểm tra trên.
