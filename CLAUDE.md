# CLAUDE.md — Figma, FigJam và Google Docs

Chỉ áp dụng khi thao tác trên Google Doc, FigJam và Figma của Expiry. Không đụng source,
DB, API hay backend (việc đó theo `AGENTS.md`).

## Đọc trước khi làm

Luật đầy đủ và mọi ID nằm ở hai file dưới đây. Lấy ID và liên kết từ đó, không từ trí nhớ;
ID không khớp thì dừng lại và hỏi.

- Google Doc quy tắc Docs (tab ID của 31 UC, luật đặc tả, câu chữ, cách sửa Doc):
  https://docs.google.com/document/d/1fhyQU_NrcncDQbhJmPt0f4mZEZwRKZnGMU5qjIwsems/edit
- Figma Rules (FigJam, ID section diagram, luật Figma và UI Foundations):
  https://www.figma.com/design/FAaUCb0mm89zuv1PnWVrTJ

Tài nguyên được quản lý: Doc đặc tả `1p2hYcmkg8FTVLQ1sq4_dUSzZdiZYx87ZZKjzLrg5wJI`,
FigJam `CFSvL7uuF2Qb4YdT7AvlZ9`, Figma low-fi/mid-fi `9dBcuGheRzLGLVxCuqBtT7`.

## Luật ngắn

- Viết "số lượng", không "lượng" đứng một mình.
- Bước của Hệ thống chỉ xác nhận hoặc trả kết quả, không nêu chi tiết backend.
- Low-fi và mid-fi không cần UI Foundations đầy đủ, nhưng phải đủ trước khi implement màn
  hi-fi đầu tiên và trước khi implement full prototype.
- Tái sử dụng: một component một nguồn, chỉ bind biến và style, không giá trị thô.

## Sau mỗi thay đổi đặc tả

1. Đọc lại Doc, chạy `python3 .tmb/tools/format-audit/uc_format_audit.py <file read_doc>`.
2. Đổi chữ bước thì vẽ lại diagram và chạy `.tmb/tools/diagram-audit`; đổi dòng Wireframe
   thì cập nhật Figma và `_tools`.
3. ID đổi (vẽ lại diagram, thêm tab) thì cập nhật hai file luật ở trên.

## Lỗi hay gặp khi thao tác Figma và cách làm tốt nhất hiện tại

Ghi 2026-11-19. Các lỗi này đã xảy ra thật; làm theo cột "Cách làm" để khỏi lặp lại.

- `create_session` trước, rồi truyền đúng `sessionId` vào mọi lệnh Figma. Mỗi lần `use_figma`
  chỉ đổi page một lần; việc nhiều page thì tách thành nhiều lệnh.
- `get_screenshot`: sandbox không tải được URL ảnh, luôn đặt `enableBase64Response: true`.
- Duyệt node: `findAllWithCriteria` chỉ có trên node có con. Gọi trên TEXT sẽ lỗi
  `no such property`; kiểm tra `n.type === "TEXT"` trước.
- Sửa chữ: tải font của chính node (`getStyledTextSegments(["fontName"])`) rồi mới gán
  `characters`.
- Màu và hình: cái gì cũng bind variable. Muốn đổi màu cả hệ thống thì đổi alias ở
  `Expiry / Brand / Primitives` trỏ sang `Expiry / Coral Tea / Primitives`, không sửa từng node.
- Doc đặc tả `1p2h…` quá lớn, `read_doc` làm đứt kết nối MCP. Đừng đọc cả Doc; chỉ ghi qua
  `update_doc` theo tab ID, và đọc bằng trình duyệt khi cần ID.
- Không dùng connector ngoài Figma, Google Docs, Google Drive.

## Branding

- Một nguồn màu duy nhất là Coral Tea (UI Foundations). Brand dùng alias sang Coral Tea:
  logo Coral 600 `#D43A52`, chữ và nút Coral 700 `#B72F45`, Warm Ink `#2D2524`, nền
  `#FFF8F7`. Không dùng xanh ink `#173B3A` và Sage `#496C5B` nữa.
- Giữ nguyên hình học logo Clock-e, wordmark và tagline; chỉ đổi màu và cách dựng.
- Chưa làm nền đen/Dark. Logo reversed đặt trên nền Coral 700, không đặt trên nền đen.
  Dark mode chỉ làm sau khi xong toàn bộ màn sáng.

## Trả lời sai: "so sánh với goals" (ghi 2026-11-19)

Câu hỏi gốc: "so sánh code, feature, use case đã đạt goals chưa". Ý đúng của người dùng:
kiểm tra ứng dụng hiện tại có chạy không, và các feature đã đặc tả có đạt business goals
không. Đây là đánh giá kết quả, không phải đối chiếu tài liệu.

Đã làm sai:

- Đối chiếu tài liệu với tài liệu: Brief, UC catalog, ROADMAP và grep source. Cột "Code"
  chỉ cho biết có file hay không, không cho biết ứng dụng có chạy.
- Kết luận "chưa đạt" từ checkbox roadmap thay vì từ việc chạy app.
- Không đi qua tác vụ của P01, P02, P03 (Brief mục 04) và không đo từng business goal.
- Liệt kê lệch giữa spec và code (UC-17, UC-29, mặc định danh mục) rồi hỏi lại cuối câu,
  dù việc chạy app chỉ đọc, không cần xin phép.

Cách làm đúng:

1. Lấy goals gốc: SE-BREQ-01…06, BG-MUA, BG-DUYTRI và tiêu chí "Thành công khi" của từng
   persona. Không dùng ROADMAP làm goals.
2. Chạy ứng dụng thật (demo web hoặc bản local) theo từng tác vụ persona, từng feature
   F01…F06, kể cả nhánh lỗi, hủy và nhập sai.
3. Trả bảng: goal → feature/UC → đã chạy thử chưa → kết quả (đạt, một phần, không đạt)
   → bằng chứng (ảnh, log, bước tái hiện).
4. Phân biệt ba mức: source có, chạy được, đạt goal. Mục nào chưa chạy thì ghi "chưa
   chạy", không suy từ roadmap hay tên file.
5. Câu hỏi đủ rõ thì làm luôn, không hỏi lại ở cuối.
