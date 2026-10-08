# [S1] Problem và [S4–S5] Research/root cause

## S1.1 Problem definition
- Symptom: thực phẩm bị quên; người dùng biết hạn nhưng không biết dùng món nào; app tồn kho dễ sai sau khi dùng/bỏ.
- Expected: biết mình có gì, cái gì cần chú ý và cập nhật được việc đã làm với công nhỏ.
- Actual: thông tin phân tán ở bao bì/tủ lạnh/trí nhớ; kế hoạch đổi; thao tác cập nhật chậm hơn thay đổi thực tế.
- Impact: quyết định muộn, mua trùng, bản ghi sai và giảm tin tưởng. Chưa có số liệu baseline của nhóm để lượng hóa.
- Scope: thực phẩm trong tồn kho cá nhân, ba core functions CTX-03, nhập tay và in-app.
- Out of scope MVP: shared household, OCR/barcode integration, push, recipes/AI, tự suy hạn theo loại đồ, finance savings claims, medicine/warranty, offline sync và học thích nghi.

## S5.1 Phương pháp research đã làm
1. Truy xuất conversation có persona/BR gần nhất; phân biệt user fact và assistant đề xuất.
2. Đọc file hiện có để phát hiện khác biệt giữa persona, BR, ERD/API cũ.
3. Tra paper gốc và docs chính thức; dùng kết quả nghiên cứu để kiểm tra **cơ chế**, không suy tỉ lệ thị trường từ mẫu nhỏ.
4. Chuyển cơ chế thành hypothesis tính năng; ghi test và artifact chịu ảnh hưởng.
5. Kiểm tra ngược mỗi entity/route có task cần nó hay không.

Đây là research synthesis + engineering design; chưa có phỏng vấn mới, usability study hoặc competitor app walkthrough trực tiếp. Không gắn nhãn “đã validated”.

## S5.2 Source ledger
| Source | Nguồn và phạm vi | Finding dùng | Giới hạn |
|---|---|---|---|
| RES-01 | Mesiranta et al., CozZo, conference abstract, 2024; https://zenodo.org/records/14164532 | 52 households, 3–6 tuần; stock/expiry awareness và planning có giá trị; maintenance effort, expiry estimate và perceived value là trở ngại | Conference abstract, không chứng minh ba persona VN là market segments; kết quả giảm waste không dùng làm KPI mặc định |
| RES-02 | Mathisen et al., TotalCtrl/Too Good To Go, 2022; https://formative.jmir.org/2022/9/e38520 ; index https://pmc.ncbi.nlm.nih.gov/articles/PMC9482070/ | Search index nguồn paper: 6 students, nhiều manual operations gây khó duy trì | Full-text hôm nay bị anti-bot; chỉ dùng mức finding đã có trong index + audit cũ; chưa tái đọc full paper |
| RES-03 | EATiT, Taiwan, Graham-Rowe trong REPORT.md | Visibility, disrupted plans, inconvenience là background hypotheses | Chưa truy lại paper gốc lần này; không dùng sample/quote từ đây làm new verified claim |
| DOC-01 | PostgreSQL constraints https://www.postgresql.org/docs/current/ddl-constraints.html | PK/FK/UNIQUE/CHECK giữ integrity | Không thay validation/ownership nghiệp vụ |
| DOC-02 | PostgreSQL locking https://www.postgresql.org/docs/current/explicit-locking.html | FOR UPDATE hỗ trợ serialize cập nhật cùng hàng | Vẫn phải có transaction; thứ tự lock ổn định |
| DOC-03 | Date/time https://www.postgresql.org/docs/current/datatype-datetime.html | DATE khác timestamp/timezone | Cách ưu tiên hôm nay là rule project |
| DOC-04 | Numeric https://www.postgresql.org/docs/current/datatype-numeric.html | numeric là exact decimal | Không tự quyết định unit/conversion |
| DOC-05 | React https://react.dev/learn/sharing-state-between-components | Shared UI state ở common parent gần nhất | Không phải mọi state lên App |
| DOC-06 | OpenAPI 3.1.1 https://spec.openapis.org/oas/v3.1.1.html | Contract operations, schema, request/response | Không quy định phải map route 1:1 table |
| DOC-07 | RFC 9457 https://www.rfc-editor.org/rfc/rfc9457 | Problem details cho lỗi HTTP | code/request_id là extension project |
| DOC-08 | OWASP https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html | Endpoint access control, input validation, server workflow enforcement | Cần kiểm tra thực thi trên code sau |
| DOC-09 | OMG UML 2.5.1 https://www.omg.org/spec/UML/2.5.1 | Use case, activity, sequence, class/state thuộc UML | Mermaid flowchart và ERD không tự trở thành UML chuẩn |
| DOC-10 | UK official label guide https://www.gov.uk/understanding-food-labelling/best-before-and-use-by-dates | Use-by và best-before có nghĩa khác; storage/opening quan trọng | Không dùng như pháp luật nhãn VN; không suy shelf-life hay an toàn từ app |

Sources truy cập 08/10/2026. Không tìm thấy tài liệu chính thức xác nhận warning **2 ngày** là phù hợp cho mọi thực phẩm; đó là policy thử nghiệm DEC-06. Không tìm thấy evidence trong nguồn đã đọc chứng minh chỉ bật reminder là đủ giải quyết P2.

## S4.1 Root cause theo persona
| Persona | Symptom | Immediate cause | System cause | Root mechanism |
|---|---|---|---|---|
| P1 | Có đồ nhưng quên sử dụng | Đồ khuất không tạo tín hiệu nhớ | Phải tự nhớ toàn bộ inventory, không có điểm review nhẹ | Visibility/attention failure dù có khả năng plan |
| P2 | Có đồ gần hạn nhưng kế hoạch không thực hiện | Lịch/sở thích/nhu cầu thay đổi | Thông tin hạn không nối với quyết định hiện tại | Decision/action gap |
| P3 | Theo dõi một thời gian rồi số lượng app sai | Dùng/bỏ không được cập nhật | Cost của maintenance cao hơn giá trị nhận ở thời điểm đó | Maintenance burden và reconciliation failure |

[C] Feedback loop nguy hiểm: cập nhật chậm → stock sai → attention sai → giảm tin tưởng → ít cập nhật hơn. Vì vậy data accuracy là điều kiện upstream của reminder quality.

## S1.2 Persona → pain → challenge → opportunity → feature
Pain point = điều gây khó chịu/thiệt hại hiện có; challenge = trở ngại khi muốn đạt goal; opportunity = chỗ sản phẩm có thể can thiệp. Opportunity chưa phải bằng chứng cần feature.

| ID | Context/behavior nguồn | Pain point [C trừ phần user nói] | Challenge | Opportunity | Candidate feature | Cần research thêm |
|---|---|---|---|---|---|---|
| PP-11 | P1 mua có plan, cất tủ rồi quên | Không nhớ đang có món gì | Review phải nhanh, không đòi nhớ từng món | Hiển thị food cần chú ý theo vị trí/ngày | F-02 attention list, F-03 detail | Có mở app trước nấu/mua không? |
| PP-12 | P1 ngại sơ chế, quên thỉnh thoảng | Biết có đồ nhưng chưa xử lý | Notification không tạo thời gian/động lực chế biến | Đi thẳng từ attention đến hành động ngắn | F-04 record used/discarded; recipes để sau | Cản trở do thiếu thời gian hay không muốn ăn? |
| PP-13 | P1 ít muốn quản trị | Nhập dữ liệu thành việc mới | Capture không được dài hơn khả năng duy trì | Chỉ bắt buộc name/quantity/unit | F-01 quick manual add, optional date | Thời gian nhập chấp nhận thực tế? |
| PP-21 | P2 đồ mua cho dự định gia đình nhưng plan đổi | Không biết món nào ưu tiên | Quyết định cần lượng/vị trí/date context | Ranking có reason dễ hiểu, lọc nhanh | F-02/F-03 | Có giúp chọn hành động hay chỉ xem cảnh báo? |
| PP-22 | P2 lựa chọn chưa rõ với đồ không nhãn | Thiếu thông tin đáng tin | Không phải món nào có date chắc chắn | Tách unknown/estimated và source | F-01/F-03/F-05 edit metadata | User hiểu nhãn uncertainty ra sao? |
| PP-23 | P2 có household context | Người khác có thể thay đổi đồ vật thật | Private app không tự đồng bộ việc người khác làm | Quick recount cho owner; sharing phase sau | F-05 recount | Private scope đáp ứng học phần nhưng coordination vẫn là gap |
| PP-31 | P3 thường kiểm tra tồn kho | Chỉnh nhiều bản ghi phiền | Accuracy cần nhiều thao tác lặp | Action rõ quantity, edit nhanh, history | F-04/F-05/F-06 | Tần suất cập nhật và kiểu sai phổ biến? |
| PP-32 | P3 muốn số liệu đúng | Double tap/retry hoặc tab cũ làm sai lượng | Không thể dựa UI disable button | Version + idempotency + atomic movement | F-04 server guarantees | Mobile network/retry là giả thuyết cần thử |
| PP-33 | P3 sửa nhầm/xóa nhầm | Mất dữ liệu đã quản lý | Restore không được tạo fake stock movement | Soft-delete, trash/restore, correction có history | F-06/F-07 | Có cần batch edit ngay không? |

Không suy “married → shared household feature bắt buộc”: user đã chọn private scope. Không suy độ tuổi quyết định tech skill. Các persona cùng dùng một hệ thống; không có role P1/P2/P3 trong DB và không dựng ba dashboard khác nhau trước validation.

## S1.3 Feature relevance và priority
| Feature | P1 | P2 | P3 | MVP |
|---|---|---|---|---|
| F-01 Quick manual capture | Cao | Cao | Cao | Core |
| F-02 Inventory + attention reason + search/location/date filter | Cao | Cao | Cao | Core |
| F-03 Detail: amount/date type/source/opening note | Vừa | Cao | Cao | Core |
| F-04 Consume/discard phần hoặc hết | Cao | Cao | Cao | Core |
| F-05 Edit metadata + recount actual amount | Vừa | Vừa | Cao | Core |
| F-06 History | Thấp | Vừa | Cao | Core, phục vụ reconcile |
| F-07 Trash/restore | Vừa | Vừa | Cao | Core support |
| F-08 Attention lead/timezone settings | Vừa | Vừa | Vừa | Core support |
| OCR/barcode/push | Hypothesis | Hypothesis | Hypothesis | Deferred theo user |
| Recipes/meal plans/bulk maintenance | Chưa chứng minh | Potential cao | Potential | Research backlog |

“In-app reminder” MVP = attention list được tính khi mở/refetch app; không phải notification gửi khi app đóng. Nếu user kỳ vọng thông báo ngoài app thì scope cần đổi; không cần worker/scheduler cho định nghĩa này.

## S5.3 Validation research tiếp theo
- Phỏng vấn dựa incident gần nhất, không hỏi dẫn “bạn có muốn OCR không?”. Mỗi persona mechanism tìm 3–5 người phù hợp cho exploratory study; đây là kế hoạch, không đảm bảo đại diện dân số.
- P1: lần gần nhất đồ bị quên ở đâu, khi nào phát hiện, có plan trước không, cue nào làm nhớ.
- P2: kể lần đổi kế hoạch; tại sao không dùng đồ, thông tin nào thiếu; task chọn món ưu tiên có thực sự giúp quyết định.
- P3: quan sát thêm 5 món và ghi dùng/bỏ/sửa; count taps, time, wrong amounts, bỏ dở, stale records sau vài ngày.
- Task usability: thêm món không biết hạn; chọn món cần chú ý; dùng một phần; recount; xóa rồi restore; mạng chập chờn.
- Metrics: completion, median task time, error/correction rate, stale-record rate (digital active records sai physical state / records audited), relevant-action rate. Report denominator/sample và cách đo.
- Chưa đặt universal thresholds. Baseline trước; nhóm chốt acceptance targets trước test. Không dùng % giảm waste của CozZo làm lời hứa sản phẩm.
