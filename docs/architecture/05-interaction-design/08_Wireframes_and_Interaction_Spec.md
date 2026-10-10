# [S3] Low-fidelity wireframes và interaction contract

`wireframes/expiry_wireframes.png` có 6 màn hình mobile: inventory, add, detail, action, history, settings. Đây là wireframe để review task/field/navigation, chưa phải final Figma UI. Diagram/source được đưa vào Sheets tab Diagrams; screen/interaction spec vào Wireframes. Sheet không render Mermaid/PlantUML tự động.

| Screen | Primary information order | Primary action | States phải thiết kế | UC/route |
|---|---|---|---|---|
| WF-01 | Attention summary → filters → cards amount/date/reason/location → Add | Xem món hoặc Add | Loading, empty kho, empty filter, read error, unknown/date groups, depleted tab | UC-02/03; API-02 |
| WF-02 | Name → quantity/unit(create) → location → known/unknown date → label/source → optional opened/note | Save | Field invalid, unknown-date no blocker, auth continuation, pending, network retry, version conflict(edit) | UC-01/06; API-01/04 |
| WF-03 | Name/current amount → attention reason/source/date → location/opened/note → actions → history | Use; discard/recount rõ label | Deleted, depleted, load error, conflict/refetch; metadata edit vẫn cho depleted | UC-03/04…09; API-03…08 |
| WF-04 | Action name → current amount → amount hoặc actual_quantity → reason → confirm | Confirm command | Quantity >remaining, zero/negative, pending, timeout retry same key, stale version, no-op recount | UC-04/05/07; API-05/06 |
| WF-05 | Event kind/time → before/after/delta/reason; trash list riêng | Back hoặc Restore ở trash | Empty, pagination, foreign ID safe404; history no public edits | UC-08/10; API-07/09/10 |
| WF-06 | Timezone → attention lead days → explanation scope in-app | Save settings | Input invalid, pending, conflict; list refresh sau success | UC-11; API-11/12 |

## S3.33 Interaction details
- EntryCard hiển thị amount/unit và reason bằng text, không chỉ màu. Unknown date có copy “Chưa có ngày theo dõi” và edit action.
- Không dùng “Fresh/Safe” cho later. Past date copy phân biệt recorded date đã qua; detail có meaning label/certainty.
- Buttons Use/Discard disabled khi depleted/deleted; API vẫn enforce independent. Recount cho phép reopen depleted bằng actual amount thực tế.
- ActionSheet amount mặc định **không tự submit hết**. User chọn số lượng; có explicit “Dùng hết/Bỏ hết” prefill cần confirm để tránh trừ nhầm.
- Remove record dialog: “Xóa bản ghi này khỏi danh sách? Số lượng thực phẩm không được ghi là đã dùng/bỏ.” Đây là meaningful distinction user cần biết.
- 401: preserve draft trước auth. Không show dữ liệu thật trong public demo. Refresh identity cache trước private query.
- 409: refetch current entry và hiện current amount/version với draft để user quyết định; không auto-submit amount cũ như command mới.
- Timeout: trạng thái kết quả chưa rõ, retry cùng key+payload; khi server replay snapshot, refetch latest.
- Mobile touch targets và labels cần accessibility review, low-tech P2 phải đọc được amount/date/action không cần biết API jargon.
- Desktop: inventory list bên trái/detail bên phải là candidate, chưa high-fidelity; cùng use cases/API, không tạo nghiệp vụ riêng.

## S3.34 Wireframe → field mapping
WF-02 name→food_entries.name; date controls→expiry_date+date_certainty+date_source+date_label_type; location→storage_location; quantity create→remaining_quantity+initial movement; WF-04 Use/Discard→movement kind/before/after; Recount→adjustment+reason; WF-06→users settings. Attention badge là DTO derived, không input field persisted.
