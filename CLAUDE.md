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

## Nguồn đã xác minh (chốt 2026-11-20)

Đây là nguồn duy nhất được dùng khi viết báo cáo và đặc tả. Mọi nguồn khác phải hỏi user review
trước khi đưa vào bản chốt.

- UC spec: https://docs.google.com/document/d/1p2hYcmkg8FTVLQ1sq4_dUSzZdiZYx87ZZKjzLrg5wJI/edit?tab=t.uiw4l3sjve81
  (user xác nhận: sub-tab của link này là 1).
- Use case diagram (trang UC): https://www.figma.com/board/CFSvL7uuF2Qb4YdT7AvlZ9/Untitled?node-id=169-3022
- Sequence diagram: https://www.figma.com/board/CFSvL7uuF2Qb4YdT7AvlZ9/Untitled?node-id=0-1
- Activity diagram: https://www.figma.com/board/CFSvL7uuF2Qb4YdT7AvlZ9/Untitled?node-id=174-3023
- Bổ sung: https://docs.google.com/document/d/1p2hYcmkg8FTVLQ1sq4_dUSzZdiZYx87ZZKjzLrg5wJI/edit?tab=t.7ozav9iahu0g
- Bổ sung: https://docs.google.com/document/d/1p2hYcmkg8FTVLQ1sq4_dUSzZdiZYx87ZZKjzLrg5wJI/edit?tab=t.5slv2c4egzbt

Cách lấy ảnh cho báo cáo: dùng Figma skill (`get_screenshot` với `enableBase64Response: true`, hoặc
export qua `use_figma`), không chụp màn hình bằng tay hay công cụ chụp của OS.

BR-06: bảng Business Rules (BR-01–05, BR-07–21) không có BR-06. Đã đối chiếu 31 UC spec trong
PDF xuất từ doc (21/11/2026): không UC nào tham chiếu BR-06, và các tham chiếu BR-xx còn lại khớp
cột "UC tham chiếu" của bảng BR. Vậy không cần làm lại UC cho BR-06.
Lệch thật nằm ở ba hệ mã BR: BR-01–21 (bảng Business Rules, báo cáo đang dùng), BR-C01–22 (baseline
hiện hành trong tab NR và Business Goals), BR-V3-xx (tab SE-UR). Cần chốt một hệ mã trước khi sửa.

Nếu nội dung nằm ngoài các nguồn trên, dừng và hỏi user review trước khi chốt.

FigJam `CFSvL7uuF2Qb4YdT7AvlZ9` có 4 page: sequence (`0:1`, 31 section UC-xx_Sequence_Diagram_UML), UC diagram
(`169:3022`, 7 section: Tài khoản + F01–F06), Activity Diagram (`116:2`, 31 section) và Component Diagram
(`174:3023`, không phải activity). Xuất ảnh bằng `get_screenshot` (maxDimension đủ lớn) rồi chèn vào Google Doc
bằng `insertInlineImage` với chính URL ảnh Figma (còn hiệu lực, không cần public Drive). Doc báo cáo có section
break giữa các UC, chèn ở đoạn trống ngay trước section break (Title.start - 2).

Mid-fi Phone/Web: mỗi dialog có rectangle `Scrim` bind `overlay/scrim`; node opacity phải là 0.48 (Light), để
1 thì màn hình dialog đen kịt. Đã sửa 2026-11-21 (20 scrim mỗi page).

## Luật ngắn

- Viết "số lượng", không "lượng" đứng một mình.
- Bước của Hệ thống chỉ xác nhận hoặc trả kết quả, không nêu chi tiết backend.
- Low-fi và mid-fi không cần UI Foundations đầy đủ, nhưng phải đủ trước khi implement màn
  hi-fi đầu tiên và trước khi implement full prototype.
- Tái sử dụng: một component một nguồn, chỉ bind biến và style, không giá trị thô.

## Low-fi và Mid-fi đã khoá — không sửa nữa

Bốn page trong file `9dBcuGheRzLGLVxCuqBtT7` là baseline đã chốt, không được thay đổi nữa:
`86:2` Low-fi Phone, `86:1043` Low-fi Web, `90:5` Mid-fi Phone, `90:1361` Mid-fi Web. Chỉ đọc
để tham chiếu; mọi thay đổi thiết kế làm trên Foundations (01–08), 08-1/08-2, 09–11 và hi-fi
trở đi. (Ghi nhận 2026-11-22, user chốt.)

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

## User flow: vì sao làm sai lần đầu và cách làm đúng

Ghi 2026-11-19. Lần đầu user flow bị làm sai vì:

- Làm sai loại file. Mình dựng 32 frame "màn hình trước / sau / lỗi" trong một page của file
  Figma Design (`9dBcuGheRzLGLVxCuqBtT7`). User flow của dự án là sơ đồ FigJam dạng flowchart.
- Không mở board mẫu trước khi vẽ. Board mẫu:
  https://www.figma.com/board/jbHbJXBYi3DIR7FkiOc4IE/Untitled?node-id=2998-4962
- Nội dung lấy từ bản cũ (27 UF, mã UC-V5) thay vì 31 UC hiện hành trong Doc đặc tả.

Cách làm đúng:

- Luôn mở board mẫu bằng `get_figjam` rồi đọc cả style bằng `use_figma` trước khi vẽ.
- Một card trắng cho mỗi UC (2740 px rộng, bo 24, viền `#D9D9D9`), lưới 3 cột, tiêu đề
  `UC-xx  |  Tên`, dòng phụ `UC-xx  /  Fxx`. Chỉ dùng keyword, không viết câu.
- Hình và màu: Bắt đầu = bo tròn xanh `#C2E5FF`; bước = hình chữ nhật trắng; nhập liệu =
  hình bình hành `#C6FAF6`; quyết định = hình thoi `#FFECBD`; thành công = bo tròn xanh lá
  `#CDF4D3`; rẽ nhánh / sửa lại = cam `#FFE0C2`; lỗi và Hủy = đỏ `#FFCDC2`. Viền 4 px.
- Đường nối elbow, mũi tên ở đầu, nhãn Có / Không / Lỗi / Hủy trên nhánh. "Hủy" đặt phía trên.
- Nội dung lấy từ Doc đặc tả hiện hành (31 UC), không lấy từ board cũ.
- File đang dùng: https://www.figma.com/board/XYmZbstR3sooA6f2d5z4qn (31 UC, folder 674257436).

## Trả lời sai: "so sánh với goals" (ghi 2026-11-19)

Câu hỏi gốc: "so sánh code, feature, use case đã đạt goals chưa". Ý đúng: mở ứng dụng web
đang chạy, dùng thử, và xem nó có đáp ứng được người dùng, có thỏa các persona không. Chỉ
cần xem có đạt hay không.

Đã làm sai, hai lần liên tiếp:

- Lần 1: đối chiếu tài liệu với tài liệu (Brief, UC catalog, ROADMAP, grep source). Cột
  "Code" chỉ cho biết có file, không cho biết ứng dụng có chạy. Kết luận "chưa đạt" từ
  checkbox roadmap.
- Lần 2 (sau khi được sửa): vẫn định "lấy goals từ SE-BREQ, BG-MUA, BG-DUYTRI rồi mới chạy
  app". Người dùng không yêu cầu bước lấy goals từ tài liệu đó.
- Hỏi lại ở cuối câu dù việc mở web và thử chỉ đọc, không cần xin phép.

Cách làm đúng:

1. Mở bản web đang chạy bằng trình duyệt (`https://demoexpiry.vercel.app`), không đọc
   roadmap hay spec để quyết định đạt hay không.
2. Đóng vai từng persona (P01 hay quên, P02 hay đổi kế hoạch, P03 muốn số chính xác) và
   thử việc họ cần: thêm món, thấy món cần chú ý, hoãn nhắc, ghi dùng/bỏ, nhập sai, xóa và
   khôi phục, mua sắm.
3. Trả kết luận ngắn theo persona: làm được hay không, chỗ nào vướng, kèm bước tái hiện.
   Chỉ nêu cái đã thử thật; cái chưa thử ghi "chưa thử".
4. Bản deploy có thể cũ hơn source local. Nếu thấy lệch (ví dụ source có đối chiếu kho mà
   web thì không) thì ghi rõ là web đang chạy chưa có.
5. Câu hỏi đủ rõ thì làm luôn, không hỏi lại ở cuối.
