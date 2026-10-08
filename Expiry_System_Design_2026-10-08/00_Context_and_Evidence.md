# [S0] Context, evidence và phạm vi quyết định
Version: 0.1 — 08/10/2026 — thiết kế để review, chưa phải specification đã phê duyệt toàn bộ.

## S0.1 Confidence
**Medium tổng thể**. High cho ba cơ chế persona và ba core functions; High cho scope user vừa chọn; Medium cho suy luận tính năng; Medium cho thiết kế dữ liệu/API; chưa kiểm chứng bằng field study địa phương hoặc code hiện tại.

Không có quyền đọc toàn bộ lịch sử chat như một bản export. Đã truy xuất các đoạn liên quan Expiry bằng context search, đọc tài liệu được tìm thấy và tra nguồn công khai. Không tuyên bố đã đọc mọi tin nhắn. Canva bị chặn khi đọc qua web search, sau đó đã đọc trực tiếp rich text qua Canva connector trong lượt tiếp tục. Persona source hiện đã đối chiếu bản thiết kế hiện tại.

## S0.2 Evidence classes
| Nhãn | Ý nghĩa | Cách dùng |
|---|---|---|
| [A-U] | User nói/chọn rõ trong conversation | Constraint của thiết kế |
| [A-R] | Nội dung conversation được truy xuất | Giữ nguồn và độ chắc chắn; không giả thành đọc nguyên bản |
| [A-F] | Nội dung file đã đọc | Evidence về nội dung file, chưa chứng minh research trong file đúng |
| [B] | Paper nguồn hoặc docs chính thức được tra | Hỗ trợ kết luận đúng phạm vi nguồn |
| [C] | Suy luận của bộ tài liệu này | Cần verify với user/test |
| [D] | Đề xuất thiết kế | Có thể thay sau review; không gọi là quyết định user |

## S0.3 Canonical context hiện tại
| ID | Nội dung | Nguồn/trạng thái |
|---|---|---|
| CTX-01 | Một project Expiry cho HCI, Systems Engineering và Advanced Web | [A-U] context đã cung cấp |
| CTX-02 | HCI: persona, UX/UI; SE: problem/requirements/flows/use cases/UML/data/ERD; Web: middleware/controller/API/business logic/repository/queries | [A-U] |
| CTX-03 | CF-01 Add/Capture; CF-02 View/Prioritise & Explain; CF-03 Resolve/Act & Reconcile | [A-F] tracker 06/10 |
| CTX-04 | User flow theo Screen → User Action → Next Screen; decision dành cho điều kiện/validation | [A-F] tracker |
| CTX-05 | Auth xuất hiện tại điểm cần dữ liệu riêng/persist, không mặc định đặt ở đầu toàn journey | [A-F] tracker |
| CTX-06 | Tồn kho riêng từng tài khoản | [A-U] trả lời hôm nay; đã thay giả định trước đây |
| CTX-07 | MVP nhập tay, nhắc trong app; OCR/push chưa ở MVP | [A-U] hôm nay |
| CTX-08 | Stack chưa chốt | [A-U] hôm nay; React/Express/PostgreSQL chỉ [D] |
| CTX-09 | Team khoảng 5 người; task tự claim, có thể đồng đảm nhiệm, review theo dependency | [A-U] context; chưa phân công tên mới |
| CTX-10 | Food-first từ persona hiện tại | [C/D] nhất quán corpus; mở rộng medicines/cosmetics/warranty cần nghiên cứu riêng |

## S0.4 Persona mới nhất và các phần chưa biết
Nguồn được truy xuất: https://www.canva.com/design/DAHXSrL9WU4 (08/10). Link cũ https://www.canva.com/d/ZhG7BWcn6eP6q5V và https://www.canva.com/d/n-qOUVfDmewzZFz là lịch sử; không dùng ghi đè persona mới.

| ID | Persona | Profile đã truy xuất [A-R] | Cơ chế đã bàn |
|---|---|---|---|
| P1 | Phạm Hoàng An — Occasional/Passive Forgetter | 20, Student, TP.HCM, Single, iPhone/Laptop | Có thể lên kế hoạch, vẫn quên đồ khi khuất chú ý; không được diễn giải thành người hoàn toàn thiếu tổ chức |
| P2 | Tôn Nữ Như Huyền — Busy Improviser | 49, Household, Đà Nẵng, Married, Android/Laptop | Kế hoạch thực phẩm gia đình thay đổi; khó chuyển đồ đang có thành hành động |
| P3 | Phạm Ngọc Thiên An — Conscious Maintainer | 20, Student, Đà Nẵng, Single, iPhone/Android/Laptop | Muốn theo dõi chính xác nhưng cập nhật từng món tốn công |

Đã đọc personality/quote/behavior/habits/goals/pains/challenges/opportunities trực tiếp từ Canva. Income và giờ sử dụng cụ thể không có trong rich text, không tự thêm. Canva là persona artifact, không phải raw interview transcript; quotes được ghi là quote trong slide, chưa xác minh nguồn interview. P1 trong lời user visible context: biết plan trước mua nhưng thỉnh thoảng quên, ngại sơ chế, bỏ tủ lạnh rồi quên có đồ đó.

## S0.5 Files đã đọc
- `REPORT.md` (30/09): evidence audit và các BR-01…08 cũ; đọc đủ 1.163 dòng. Đây là synthesis cũ, có thể chứa inference/nguồn không tái kiểm chứng.
- `Tóm tắt (Executive Summary)` (08/10): ERD/Product/InventoryBatch/API đề xuất cũ, đọc đủ. Không kế thừa mù quáng unique product name, nhận userId từ client, gộp delete với discard hoặc quantity status không nhất quán.
- `Audit backend và kế hoạch cải thiện toàn diện cho Expiry App` (06/10): đọc các mục architecture, trust boundary, schema, concurrency và API; không đọc hết mọi mục của report.
- `Expiry_App_Task_Tracker_2026-10-06.xlsx`: đọc ba tab và acceptance criteria.

## S0.6 Decision log và blockers
| ID | Quyết định/phần còn mở | Status | Artifact ảnh hưởng |
|---|---|---|---|
| DEC-01 | Private inventory | User confirmed | Owner FK/API scope |
| DEC-02 | Manual + in-app attention | User confirmed | Không cần scan/worker/push tables ở MVP |
| DEC-03 | Food entry + movement ledger; remaining_quantity làm operational source of truth | Proposed | ERD, transaction, resolve API |
| DEC-04 | DATE riêng với TIMESTAMPTZ; uncertainty tách khỏi opening | Proposed | Dictionary, API |
| DEC-05 | Soft delete là quản trị bản ghi; không ghi discard | Proposed | History/trash/restore |
| DEC-06 | Warning lead mặc định 2 ngày chỉ là cấu hình thử nghiệm; user sửa 0–30 | Proposed, chưa validated | UX/priority/settings |
| DEC-07 | Modular monolith; feature modules và service/repo boundary | Proposed | Repo |
| DEC-08 | Auth provider/session strategy và stack | Open | Auth adapter, implementation; domain/API business có thể làm trước |
| DEC-09 | Read-before-sign-in: public demo + draft form, auth khi đọc kho riêng hoặc lưu | Proposed từ CTX-05 | UX auth continuation |
| DEC-10 | Rich text Canva đã đọc trực tiếp; image/layout chưa inspect | Source retrieved | Persona fidelity; raw interview validation còn mở |
| DEC-11 | Deployment, backend runtime, hosting, vận hành DB | Open | Chưa triển khai infra |

Không có blocker cho bộ logical design này. Trước khi gọi ERD/API là final: review DEC-03…09 và thử các task với người thuộc ba cơ chế. Không yêu cầu user gửi lại quyết định DEC-01/02 hoặc chốt stack giả.
