# Expiry — Backlog UX toàn hệ thống · 18/11/2026

Yêu cầu: ghi đầy đủ việc cần làm từ audit user cung cấp ở turn18/11/2026 và7 lỗi
navigation đã kiểm tại local. Đây là backlog để review/thực hiện sau; không phải
kết luận audit mới, không chứng minh tất cả31UC hay cho phép tự triển khai toàn bộ.
Không thay đổi source trong task ghi nhận này.

**Status owner:** [root ROADMAP](../../ROADMAP.md). Mỗi ID bên dưới có đúng một
checkbox ở root. File này giữ scope, evidence gate, owner và dependency; không duy
trì checkbox/trạng thái hoàn thành riêng. SPEC ghi nhận:
[UX-SYSTEM-BACKLOG-20261118](../../.tmb/tasks/UX-SYSTEM-BACKLOG-20261118/SPEC.md).

## 1. Nguồn, mức bằng chứng và boundary

- Audit hiện tại do user paste, gồm10 subsystem, F01–F05, H01–H03, RC01–RC05,
  priorities/phases vàT01–T15. Đây là claim đầu vào; run 40 bước/270 giây của TinyFish
  là reported, chưa mở/replay lại trong lượt ghi task này.
- Source local được đọc để gắn owner và giữ xung đột: App, ShoppingView,
  StorageView, FoodForm, AuthForm, Settings, InsightView. Checkout tại1d214ae,
  branch codex/publish-all-local-20261118;4 file UI dirty từ đợt trước được giữ.
- [QA navigation đã thực chạy](../../.tmb/tasks/UI-SHOPPING-NAV-QA-20261118/report.md):
  20 browser checks,19 PNG,7 findings OPEN findings; Vitest 148/148 PASS không chứng minh navigation PASS.
- [Local popup/Kho/Shopping fixes](../../.tmb/tasks/UI-MOBILE-STORAGE-SHOPPING-20261118/WORK-REPORT.md)
  và [Home fixes](../../.tmb/tasks/UI-HOME-HIERARCHY-20261118/WORK-REPORT.md) có evidence
  phạm vi riêng. Ghi backlog không đổi các kết quả đó thành production/acceptance.
- Các nguồn audit trích cần đọc đúng revision/tab trước khi thực thi requirement:
  [Feature Catalog](https://docs.google.com/document/d/1p2hYcmkg8FTVLQ1sq4_dUSzZdiZYx87ZZKjzLrg5wJI/edit),
  [SE Baseline V2](https://docs.google.com/document/d/1NdDh_il8UtieqqUTnmFb-kpOB0pGtWowk2oxqSx5qMk/edit),
  [public app](https://demoexpiry.vercel.app/),
  [TinyFish run được audit dẫn](https://agent.tinyfish.ai/runs/fddef9a4-9b45-4c07-8ef0-b596a6367532).
  Norman PDF và page references trong audit là reference cần xác minh đúng edition;
  không chép citations hay page numbers chưa đọc thành bằng chứng mới.
- [A] source/runtime đã kiểm; [B] sách/docs có thẩm quyền khi thực sự đọc;
  [C] suy luận; [D] proposal. CREATED/VERIFIED/ACCEPTED khác nhau. Không có user test
  hay acceptance mới. Ghi task không cấp quyền DDL/deploy/account changes/Figma rewrite.

### Các claim cần reconcile trước khi code

| Claim trong audit | Source/evidence local hiện có | Disposition trong backlog |
|---|---|---|
| Sidebar và dock cùng có trong DOM | DOM presence chưa chứng minh cùng visible | UXA-NAV-01, UXA-RSP-01 kiểm computed visibility theo viewport |
| onlySoon mặc định ON | StorageView khởi tạo useState(false) | UXA-INV-01 xác minh public revision/reset/prefs, chưa gán lỗidefault |
| Date là text, chưa validation | FoodForm có date controls và validate NSX/opened/HSD | UXA-ADD-02 test rule/feedback, chưa kết luận thiếu implementation |
| Login không email/password | AuthForm local có hai trường và validate | UXA-AUTH-01 đối chiếu mode/deployed SHA, chưa gọi authcomplete |
| Settings Dữ liệu rỗng | Source có data actions | UXA-SET-02 kiểm đúngsection/runtime/account |
| Insight thiếu lượng dùng/bỏ | Local có unitStats và event trend | UXA-INS-01/02 đọc đủtab, metric và visibility |
| Không thấy snooze | Local đã có read/snooze và browser checks | UXA-NOT-02 verify exact public revision và vòngđời |
| Đếm16món theo vị trí | Audit tự đính chính: đã cộng All (8) + 5 + 1 + 2 | Không ghi bugđếm; chỉ regression scope và không cộngtrùng |
| Home CTA/sort/rows có vấn đề | Home đã sửa và có evidence trước | UXA-HOME tasks là closure/retest đúng build, không mặc định làm lại |
| Stock checkUC31 chưa thấy | Chưa đọc lại Catalog native ở task này | UXA-SHOP-01 là requirement gate trước implementation |

## 2. Goal, principles và quy tắc giữ nguyên

Goal namespace **của audit**: G0 giảm lãng phí/tiết kiệm (outcome chưa đo), G1 biết
có gì/ởđâu/bao nhiêu, G2 biết cần xử lý gì/vìsao, G3 quantity sát thực tế, G4 dữ liệu
truy xuất được, G5 hiểu consume/discard, BG-MUA tránh mua trùng, BG-DUYTRI ít công
bảo trì. Không tự đồng nhất với OV-G01…04 hoặc số requirement/UC ở namespace khác.
Audit gọi CAT-UC-30/31; giữ tham chiếu đó như alias nguồn audit, không tạo tiền tố
CAT- cho đặc tả mới và không nối với SEUC/DesignUC chỉ vì trùng số.

7 nguyên tắc được theo dõi: Discoverability, Feedback, Conceptual Model, Affordances,
Signifiers, Mapping, Constraints. Gulf of Execution/Evaluation được dùng như câu
hỏi kiểm task, không như bằng chứng root cause tự động.

- Shopping planned → bought → optional imported là các trạng thái riêng.
- Read/snooze reminder không giải quyết food task hay mutate quantity.
- Consume, discard, recount, Trash và restore khác nhau.
- Barcode nhận diện khác OCRđọcngày; candidate phải review và explicitSave.
- Unknown/khôngđọcdữliệu không thành0/khôngcó/safe. Không cộng g/ml/hộp.
- RC01 feature-vs-task, RC02 state/model, RC03 feedback/recovery, RC04 data trust,
  RC05 goalalignment là diagnosis của audit, không phải5 root cause đã chứng minh.

## 3. Trình tự phụ thuộc và phạm vi

0. Reconcile nguồn/revision/claims trước; xử lý7navigation bugs ảnh hưởng dữ liệu.
1. Navigation, foundation và trạng thái tương tác (audit Phase01).
2. Inventory + Add (Phase02) để input/quantity/unit đủ tin cậy.
3. Expiry + Reminder (Phase03).
4. Quantity + History (Phase04).
5. Shopping + Stock CheckUC30/31 (Phase05), sau rule inventory/unit/freshness.
6. Insight (Phase06), sau event history đáng tin; không suy outcome từ snapshot.
7. Settings + Auth/sync (Phase07).
8. Responsive/accessibility (Phase08) và regression chạy xuyên suốt từng phase;
   visual P3 sau behavior gates, không đợi cuối mới kiểm mobile.

P1/P2/P3 là priority từ audit, được bổ sung navigation High→P1. Không có deadline,
assignee cá nhân hay effort estimate được bịa. Owner dưới đây là module/discipline.
Dependency là gate cần đạt; không cấp quyền triển khai task chưa được yêu cầu.

## 4. Inventory: 65 task

| Nhóm | Số task |
|---|---|
| Nguồn chuẩn và điều kiện đóng | 3 |
| 7 lỗi navigation đã tái hiện | 7 |
| Navigation và conceptual model xuyên thiết bị | 3 |
| Hôm nay — quan sát và quyết định | 3 |
| Kho và nơi bảo quản | 3 |
| Nhập thực phẩm, Barcode và OCR | 6 |
| Quantity, lịch sử và vòng đời thực phẩm | 3 |
| Shopping UC30/UC31 và tránh mua trùng | 5 |
| Insight phục vụ kết quả tiêu dùng | 4 |
| Thông báo và Reminder | 3 |
| Settings và quản lý dữ liệu | 3 |
| Login, Guest và đồng bộ | 2 |
| Responsive và accessibility toàn luồng | 3 |
| Refinement sau khi flow đã đúng | 2 |
| Regression UX T01–T15 và usability | 15 |

Priority: P1=41, P2=22, P3=2. Tất cả task mới còn mở trong root ROADMAP; evidence local trước đó được giữ theo task cụ thể.

### SRC — Nguồn chuẩn và điều kiện đóng

Owner hiện có: Product/source owner; docs; QA. Phase: 0.

#### UXA-SRC-01 · P1 — Khóa nguồn và namespace của audit

- Căn cứ hiện có: Audit user cung cấp; các Doc/Norman/TinyFish chưa được mở lại trong task này.
- Cần đạt / điều kiện đóng: Đọc đúng Feature Catalog, SE Baseline17/11 và Brief; ghi revision/tab, xác nhận UC30/31 và bảng goal tương ứng. Giữ OV-G, G/BG audit, SE, Design, SR28 riêng; không dùng chữ phê duyệt trong audit làm approval mới.

#### UXA-SRC-02 · P1 — Chuyển heuristic và goal thành acceptance có thể kiểm

- Căn cứ hiện có: G0/G1/G2/G3/G4/G5/BG-MUA/BG-DUYTRI;7 nguyên tắc;RC01–05.
- Cần đạt / điều kiện đóng: Mỗi task truy về công việc/goal/UC và có discoverability/feedback/model/affordance/signifier/mapping/constraint phù hợp. Target5 giây/3 giây không ghi thành kết quả đã đo.

#### UXA-SRC-03 · P1 — Reconcile source local, public build và phần đã sửa

- Căn cứ hiện có: Home đã merged; popup/Kho/Shopping còn local; audit có claim mâu thuẫn source.
- Cần đạt / điều kiện đóng: Ghi branch/SHA/environment/deployed revision và screenshot cho từng claim. Đánh dấu còn lỗi/đã sửa local/cần public retest/chưa đủ bằng chứng. Chỉ đóng task với evidence đúng môi trường; không coi ghi backlog là implementation.

### BUG — 7 lỗi navigation đã tái hiện

Owner hiện có: App.tsx; ShoppingView; FoodForm; Modal. Phase: 1.

#### UXA-BUG-01 · P1 — N01 — Bảo vệ draft khi browser Back/Forward

- Căn cứ hiện có: VERIFIED_FAIL local: QA N01; ảnh06–08.
- Cần đạt / điều kiện đóng: Browser Back, Forward, reload/tab/global navigation trong scope đã chọn không âm thầm mất draft; có xác nhận hoặc recovery, giữ draft khi ở lại. Tái chạy cả Hủy trong app và Back trình duyệt.
- Dependency: UXA-SRC-03.

#### UXA-BUG-02 · P1 — N02 — Chặn submit lại stale shopping import

- Căn cứ hiện có: VERIFIED_FAIL local: QA N02; foods10→11→12 từ cùng shop_default_3.
- Cần đạt / điều kiện đóng: Shopping item đã nhập kho không tạo thêm entry từ history/form cũ hoặc thao tác lặp. Account uncertain response/idempotency được kiểm riêng; không suy rộng demo pass sang API.
- Dependency: UXA-SRC-03.

#### UXA-BUG-03 · P1 — N03 — Sửa ownership của route/history

- Căn cứ hiện có: VERIFIED_FAIL local: QA N03; Back1không đổi màn, Back2mở form đã hủy.
- Cần đạt / điều kiện đóng: Mỗi navigation tạo đúng entry; cancel/save không phục hồi tác vụ đã hoàn tất. Tách history side effect khỏi state updater; kiểm dev StrictMode và production preview, Scan→Manual, Back/Forward; giữ Settings guard.
- Dependency: UXA-SRC-03.

#### UXA-BUG-04 · P2 — N04 — Giữ tab và return context của Shopping

- Căn cứ hiện có: VERIFIED_FAIL local: QA N04.
- Cần đạt / điều kiện đóng: Đã mua→import→cancel/save/back giữ ngữ cảnh tab và item hợp lý; chính sách reset được xác định rõ, không reset do remount ngoài ý muốn.
- Dependency: UXA-SRC-03.

#### UXA-BUG-05 · P2 — N05 — Giữ keyboard focus trong modal

- Căn cứ hiện có: VERIFIED_FAIL local: QA N05; Tab vào input nền.
- Cần đạt / điều kiện đóng: Import/dirty-confirm dialog nhận focus, Tab/Shift+Tab không thoát; Escape/backdrop theo contract; đóng trả focus về opener còn tồn tại. Kiểm modal lồng/đổi trạng thái, không làm hỏng Notifications riêng.
- Dependency: UXA-SRC-03.

#### UXA-BUG-06 · P2 — N06 — Recovery khi reload route form/import

- Căn cứ hiện có: VERIFIED_FAIL local: QA N06; view=form→Home.
- Cần đạt / điều kiện đóng: Khôi phục route/context hợp lệ hoặc về entry có feedback recovery; không âm thầm bỏ ngữ cảnh. Chốt phạm vi draft persistence trước khi thiết kế storage mới.
- Dependency: UXA-SRC-03.

#### UXA-BUG-07 · P2 — N07 — Loại lỗi React khi mở/đóng modal

- Căn cứ hiện có: VERIFIED_FAIL console: QA N07; root cause chưa kết luận duy nhất.
- Cần đạt / điều kiện đóng: Trace Expected static flag was missing; kiểm early return trước hooks ở Modal; sửa nguyên nhân đã chứng minh. Không còn console error khi toggle modal liên tiếp; không thêm suppression.
- Dependency: UXA-SRC-03.

### NAV — Navigation và conceptual model xuyên thiết bị

Owner hiện có: App.tsx; SidebarNavigation; PageHeader. Phase: 1.

#### UXA-NAV-01 · P2 — Chuẩn hóa route catalog, primary/utility và điểm truy cập

- Căn cứ hiện có: F01/F04; desktop duplicate CTA đã có sửa; mobile access cần giữ.
- Cần đạt / điều kiện đóng: Một catalog thống nhất xác định Home/Kho/Shopping/Thống kê và utility Thông báo/Cài đặt. Mỗi viewport có entry cần thiết, không hai CTA ngang hàng vô cớ, không mất utility trên route con.
- Dependency: UXA-SRC-03, UXA-BUG-03.

#### UXA-NAV-02 · P2 — Thống nhất Insight/Thống kê và signifier

- Căn cứ hiện có: Audit NAV vấn đề2; source còn hai nhãn.
- Cần đạt / điều kiện đóng: Chọn một nhãn tiếng Việt và dùng nhất quán sidebar/dock/title/accessibility/empty/error; active state khớp URL trên desktop/tablet/mobile.
- Dependency: UXA-SRC-03, UXA-BUG-03.

#### UXA-NAV-03 · P2 — Chuẩn hóa trạng thái Guest/demo/account và banner/login

- Căn cứ hiện có: F04; banner đã thu gọn local/desktop login duplicate xử lý.
- Cần đạt / điều kiện đóng: Một tín hiệu dữ liệu rõ, entry login phù hợp ngữ cảnh, nói đúng giới hạn lưu local/đồng bộ. Không che lỗi data-source bằng copy demo; feedback chuyển mode/logout/back không gây nhầm.
- Dependency: UXA-SRC-03, UXA-BUG-03.

### HOME — Hôm nay — quan sát và quyết định

Owner hiện có: Inventory.tsx; statusOf; App routing. Phase: 3.

#### UXA-HOME-01 · P1 — H01 — Nối cảnh báo với món và hành động

- Căn cứ hiện có: Local đã có filter expired/soon, cần public retest.
- Cần đạt / điều kiện đóng: Cho biết nhóm/món, lý do và số lượng; CTA dẫn đúng danh sách/detail cần xử lý. Quá hạn không gợi ý sử dụng; không tự kết luận an toàn thực phẩm.
- Dependency: UXA-SRC-03, UXA-ADD-02, UXA-QTY-01.

#### UXA-HOME-02 · P1 — H02 — Xác nhận sort và scope danh sách

- Căn cứ hiện có: Local Home đã đưa expired vào và sort expired→soon; Kho có scope riêng.
- Cần đạt / điều kiện đóng: Chốt thứ tự quá hạn/hết hạn hôm nay/sắp hạn/chưa rõ HSD theo rule; dữ liệu và số đếm khớp scope. Không trộn thiếu HSD với an toàn; kiểm public revision và boundary Home/Kho.
- Dependency: UXA-SRC-03, UXA-ADD-02, UXA-QTY-01.

#### UXA-HOME-03 · P2 — H03 — Hoàn thiện search/filter empty và recovery

- Căn cứ hiện có: Local có EmptyState; audit chưa quan sát đủ.
- Cần đạt / điều kiện đóng: Kiểm không tìm thấy tên, danh mục rỗng, không có soon, tổ hợp filter và kho trống. Nêu trạng thái ngắn và có bỏ lọc/đường tiếp phù hợp; không hứa add vào vị trí nếu draft không mang vị trí.
- Dependency: UXA-SRC-03, UXA-ADD-02, UXA-QTY-01.

### INV — Kho và nơi bảo quản

Owner hiện có: StorageView.tsx; location manager; store. Phase: 2.

#### UXA-INV-01 · P1 — Xác minh default onlySoon và active-filter scope

- Căn cứ hiện có: CONFLICT: audit báo ON; source useState(false).
- Cần đạt / điều kiện đóng: Reset clean storage, deep link và saved prefs trên đúng public build. Mặc định Kho đúng phạm vi đã chốt, filter do user chọn; nhìn thấy filter active, bỏ lọc được. Không sửa false thành false chỉ để đóng finding.
- Dependency: UXA-SRC-03.

#### UXA-INV-02 · P2 — Hoàn tất tổ hợp location/category/search và kết quả rỗng

- Căn cứ hiện có: Card crowding/dropdown/recovery đã sửa local.
- Cần đạt / điều kiện đóng: Giữ selected location/category đúng URL và browser Back; badge không vỡ, nhãn chọn không lặp; kiểm all và location con không cộng trùng. Tủ bếp+dairy_eggs=0 không tự coi là bug đếm.
- Dependency: UXA-SRC-03.

#### UXA-INV-03 · P2 — Kiểm đủ tạo/đổi tên/xóa nơi bảo quản

- Căn cứ hiện có: Audit UC14–16; owner hiện có.
- Cần đạt / điều kiện đóng: Đối chiếu đúng UC authority. Validation trùng/rỗng, location đang được dùng, cancel/back/error/recovery và ảnh hưởng tới foods/prefs rõ ràng; không tự xóa thực phẩm hay migration.
- Dependency: UXA-SRC-03.

### ADD — Nhập thực phẩm, Barcode và OCR

Owner hiện có: Scanner.tsx; FoodForm.tsx; API boundary. Phase: 2.

#### UXA-ADD-01 · P1 — Chuẩn hóa quantity/unit và default theo nguồn nhập

- Căn cứ hiện có: Default cái được audit nêu; Shopping prefill đã kiểm đúng.
- Cần đạt / điều kiện đóng: Review default, signifier và giá trị từ manual/barcode/OCR/Shopping. User chọn/sửa được unit; không tự suy unit từ tên khi thiếu căn cứ; không cộng/chuyển đổi đơn vị không tương thích.
- Dependency: UXA-SRC-01, UXA-SRC-03.

#### UXA-ADD-02 · P1 — Kiểm date picker và validation NSX/ngày mở/HSD

- Căn cứ hiện có: CONFLICT: audit nói text/thiếu validation; source có validate và date controls.
- Cần đạt / điều kiện đóng: Test format, ngày không tồn tại, thứ tự ngày, HSD đã qua và thiếu ngày; lỗi tại trường, draft giữ nguyên để sửa. Chỉ bổ sung gap thực, giữ contract unknown expiry.
- Dependency: UXA-SRC-01, UXA-SRC-03.

#### UXA-ADD-03 · P1 — Phân biệt Barcode nhận diện với OCR đọc ngày

- Căn cứ hiện có: Audit ADD conceptual-model constraint.
- Cần đạt / điều kiện đóng: Entry/labels/feedback không ngụ ý barcode thường chứa HSD. Trace riêng capture→extract→prefill→review→confirm→Save; không ghi kho trước explicit Save.
- Dependency: UXA-SRC-01, UXA-SRC-03.

#### UXA-ADD-04 · P1 — Feedback cho quét và editable review

- Căn cứ hiện có: Audit Quét HSD không phản hồi; chưa test OCRthực.
- Cần đạt / điều kiện đóng: Thể hiện loading/success/no-result/partial/uncertain/error, provenance ngày và confidence khi có; mọi candidate sửa được, xử lý retry và cancel không nhân đôi request/write.
- Dependency: UXA-SRC-01, UXA-SRC-03.

#### UXA-ADD-05 · P1 — Camera/library/manual fallback và quyền truy cập

- Căn cứ hiện có: Camera/OCR thực còn NOT_VERIFIED.
- Cần đạt / điều kiện đóng: Kiểm denied/unsupported/no device, file invalid/cancel/oversize/service unavailable; luôn có đường nhập tay hoặc thoát phù hợp, không tự grant quyền hay tạo record.
- Dependency: UXA-SRC-01, UXA-SRC-03.

#### UXA-ADD-06 · P2 — Định hướng bước và return origin của shared form

- Căn cứ hiện có: Audit manual thiếu hướng dẫn flow; QA Shopping đã có return bugs.
- Cần đạt / điều kiện đóng: Giữ origin Home/Kho/Shopping/Detail; bước đang làm và tiến trình chỉ hiện khi giúp quyết định. Cancel/back/dirty/duplicate và lưu không chắc chắn có contract, không thêm bước bắt buộc để trang trí.
- Dependency: UXA-SRC-01, UXA-SRC-03.

### QTY — Quantity, lịch sử và vòng đời thực phẩm

Owner hiện có: Detail.tsx; store; movement API; Trash. Phase: 4.

#### UXA-QTY-01 · P1 — Giữ distinct consume/discard/recount và feedback

- Căn cứ hiện có: Audit Detail G3/G4; source có các action riêng.
- Cần đạt / điều kiện đóng: Đã dùng, Đã bỏ và Điều chỉnh tạo đúng loại sự kiện; lượng không âm/vượt contract, unit nhất quán. Xác nhận/feedback/lượng còn lại rõ; expired restrictions giữ đúng và kiểm trên runtime.
- Dependency: UXA-ADD-01, UXA-ADD-02, UXA-BUG-01, UXA-BUG-03.

#### UXA-QTY-02 · P1 — History đủ truy xuất và khả năng sửa sai

- Căn cứ hiện có: G4; history local/account còn boundary.
- Cần đạt / điều kiện đóng: Sau từng action có before/after/time/unit/source đúng; xử lý missing history, paging/error/retry, dữ liệu liên quan không bị bịa. Chốt cách sửa sai với event audit trail, không viết đè lịch sử vô căn cứ.
- Dependency: UXA-ADD-01, UXA-ADD-02, UXA-BUG-01, UXA-BUG-03.

#### UXA-QTY-03 · P1 — Trash/delete/restore toàn vòng đời

- Căn cứ hiện có: Audit Delete/Trash có recovery, chưa kiểm account.
- Cần đạt / điều kiện đóng: Kiểm delete-confirm/cancel, restore còn/lỗi/conflict, thay đổi quantity về0 và state. UI phân biệt bỏ thực phẩm với xóa record; không tạo consume khi delete. Không claim database lifecycle khi chỉ demo pass.
- Dependency: UXA-ADD-01, UXA-ADD-02, UXA-BUG-01, UXA-BUG-03.

### SHOP — Shopping UC30/UC31 và tránh mua trùng

Owner hiện có: ShoppingView.tsx; shoppingStorage; inventory reads; App. Phase: 5.

#### UXA-SHOP-01 · P1 — Xác lập contract UC31 và boundary stock check

- Căn cứ hiện có: Audit báo gap, native Catalog chưa reverified.
- Cần đạt / điều kiện đóng: Đọc đúng UC30/31 và BR, chốt input/output/actor/source/freshness/uncertainty. Phân biệt stock check với gợi ý mua lại; không tự tạo backend/storage/matching thuật toán trước contract.
- Dependency: UXA-SRC-01, UXA-ADD-01, UXA-QTY-01, UXA-QTY-02, UXA-BUG-02, UXA-BUG-04.

#### UXA-SHOP-02 · P1 — Hiển thị bốn trạng thái đối chiếu ngay shopping item

- Căn cứ hiện có: Audit: khớp/có thể khớp/không tìm thấy/không kiểm tra được.
- Cần đạt / điều kiện đóng: Sau khi requirement xác nhận, item thể hiện trạng thái và căn cứ: bản ghi/gói, quantity+unit, thời điểm đọc và lần đổi lượng gần nhất. Không kiểm tra được khác không có trong kho; unknown không thành0.
- Dependency: UXA-SRC-01, UXA-ADD-01, UXA-QTY-01, UXA-QTY-02, UXA-BUG-02, UXA-BUG-04.

#### UXA-SHOP-03 · P1 — Rule matching và decision recovery

- Căn cứ hiện có: Audit BG-MUA; inventory trust dependency.
- Cần đạt / điều kiện đóng: Chốt exact/candidate matching, nhiều gói, tên gần nhau, quantity/unit không quy đổi được, expired/finished/trash và stale/read failure. User quyết định giữ/sửa/mua; compare không mutate stock hoặc tự gộp gói.
- Dependency: UXA-SRC-01, UXA-ADD-01, UXA-QTY-01, UXA-QTY-02, UXA-BUG-02, UXA-BUG-04.

#### UXA-SHOP-04 · P1 — Phân biệt planned/bought/imported và optional import

- Căn cứ hiện có: F03; QA import pass thường nhưng stale submitfail.
- Cần đạt / điều kiện đóng: Đã mua không tự tăng tồn; Trong kho chỉ hiện sau Save được xác nhận. Import tách riêng qua shared form, cancel/error giữ purchased item, sửa/nhắc lại/read không mutate kho; N02 được regression.
- Dependency: UXA-SRC-01, UXA-ADD-01, UXA-QTY-01, UXA-QTY-02, UXA-BUG-02, UXA-BUG-04.

#### UXA-SHOP-05 · P2 — Hoàn thiện UC30 và nhãn một danh sách

- Căn cứ hiện có: F02; templates/multi-list chưa requirement.
- Cần đạt / điều kiện đóng: Kiểm add/edit/delete/check/uncheck, quantity/unit, empty/long text/duplicate/feedback/filter và persistence đúng user. Đánh giá Danh sách của tôi có gây hiểu lầm; không tự thêm nhiều danh sách/template. Return context và modal phải qua BUG gates.
- Dependency: UXA-SRC-01, UXA-ADD-01, UXA-QTY-01, UXA-QTY-02, UXA-BUG-02, UXA-BUG-04.

### INS — Insight phục vụ kết quả tiêu dùng

Owner hiện có: InsightView.tsx; event readers. Phase: 6.

#### UXA-INS-01 · P1 — Reconcile G5 với Overview/Categories/History hiện có

- Căn cứ hiện có: CONFLICT: audit cho rằng thiếu dùng/bỏ; local đã có unitStats/event trend.
- Cần đạt / điều kiện đóng: Đọc cả3tab và đối chiếu BREQ-G5. Xác định thiếu thật hay bị giấu; phân biệt Home/Kho/Insight, ưu tiên kết quả dùng/bỏ có thời gian; không thêm dashboard trùng.
- Dependency: UXA-QTY-01, UXA-QTY-02, UXA-SRC-01.

#### UXA-INS-02 · P1 — Kiểm công thức event, date window và unit breakdown

- Căn cứ hiện có: G5: quantity khác lượt event; source trend làevent ratio.
- Cần đạt / điều kiện đóng: Không cộng hộp/g/ml chung. Lượng và lượt có nhãn riêng, adjustment tách consume/discard; range/category/unit khớp event gốc và account bounded loader. Không tự đổi metric contract thành waste rate.
- Dependency: UXA-QTY-01, UXA-QTY-02, UXA-SRC-01.

#### UXA-INS-03 · P2 — Readability, so sánh và empty/gap/error chart

- Căn cứ hiện có: Audit nhãn nhỏ/pie khó so sánh; chart runtime cần reverify.
- Cần đạt / điều kiện đóng: Kiểm nhãn/axis/legend/tooltip ở mobile/tablet/desktop, zero-vs-no-event, sparse/missing/error/loading/retry. Chỉ thay pie nếu chart đó thực còn tồn tại và cản trở task; không bịa trend với thiếu dữ liệu.
- Dependency: UXA-QTY-01, UXA-QTY-02, UXA-SRC-01.

#### UXA-INS-04 · P2 — Giữ giới hạn suy luận từ data

- Căn cứ hiện có: Audit G0/G5, chưa usability/causal evidence.
- Cần đạt / điều kiện đóng: Không suy nguyên nhân lãng phí, tiết kiệm tiền hay safety từ counts. Nêu source/time/unit/unknown đủ ngắn để hiểu; kiểm hành trình từ Insight tới event/food giải thích được.
- Dependency: UXA-QTY-01, UXA-QTY-02, UXA-SRC-01.

### NOT — Thông báo và Reminder

Owner hiện có: Notifications.tsx; Attention.tsx; store. Phase: 3.

#### UXA-NOT-01 · P2 — Làm rõ unread preview và full Reminder queue

- Căn cứ hiện có: Audit5unread/3rows; local popup mới68px/row.
- Cần đạt / điều kiện đóng: Nêu/cho thấy preview tối đa3unread và tổng unread, link toàn bộ nhắc nhở đúng. Thứ tự có rule, popup không giả làm toàn bộ task queue; kiểm empty/off/loading/error và long messages.
- Dependency: UXA-SRC-03, UXA-HOME-01, UXA-BUG-05.

#### UXA-NOT-02 · P2 — Read/snooze/bulk feedback và persistence

- Căn cứ hiện có: Audit nói chưa thấy hoãn; local đã testread/snooze.
- Cần đạt / điều kiện đóng: Kiểm từng action, mark-all, refill list, feedback, count và per-user persistence. Snooze tạm ẩn chưa đọc rồi trở lại đúng hạn; đọc không đồng nghĩa xử lý xong thực phẩm.
- Dependency: UXA-SRC-03, UXA-HOME-01, UXA-BUG-05.

#### UXA-NOT-03 · P1 — Xử lý Reminder gắn trạng thái food và recovery

- Căn cứ hiện có: UC21/22 cần authority reconciliation.
- Cần đạt / điều kiện đóng: Kiểm expired/today/soon/review/unknown grouping, Detail return, cancel/error; hoãn/đọc không đổi quantity. Không hướng sử dụng expired food; giữ kết quả sau Back và sửa sai đúng owner.
- Dependency: UXA-SRC-03, UXA-HOME-01, UXA-BUG-05.

### SET — Settings và quản lý dữ liệu

Owner hiện có: Settings.tsx; App guards; location manager. Phase: 7.

#### UXA-SET-01 · P2 — Feedback của Gửi thông báo thử

- Căn cứ hiện có: Audit thiếufeedback; source sendTestNotification đã có.
- Cần đạt / điều kiện đóng: Kiểm granted/default/denied/unsupported, request pending/error, thông báo đã gửi hay bị chặn và hướng khôi phục. Không hứa background push khi chưa có capability; không lặp xin quyền vô cớ.
- Dependency: UXA-SRC-03, UXA-BUG-03, UXA-INV-03.

#### UXA-SET-02 · P2 — Xác minh và hoàn thiện mục Dữ liệu

- Căn cứ hiện có: Audit báo rỗng; source có data actions.
- Cần đạt / điều kiện đóng: Kiểm đúng route/section/public revision, demo/account và error/offline; giữ chức năng thật, bỏ entry rỗng hoặc giải thích capability thiếu. Reset/destructive action có cancel/feedback/recovery theo contract.
- Dependency: UXA-SRC-03, UXA-BUG-03, UXA-INV-03.

#### UXA-SET-03 · P2 — Phạm vi setting, Save/Cancel và nested navigation

- Căn cứ hiện có: F05; Settings save/dirty guard đã có local evidence.
- Cần đạt / điều kiện đóng: Rõ account-vs-device-vs-demo, đổi mục/back/dock/browserBack khi dirty/saving có guard; lỗi giữ draft/retry, version conflict xử lý. Xác minh server persistence riêng; reuse location CRUD, không nhân owner.
- Dependency: UXA-SRC-03, UXA-BUG-03, UXA-INV-03.

### AUTH — Login, Guest và đồng bộ

Owner hiện có: AuthForm.tsx; App session/hydration; API. Phase: 7.

#### UXA-AUTH-01 · P1 — Reconcile public login với AuthForm thực

- Căn cứ hiện có: CONFLICT: audit nói modal không field; source có email/password.
- Cần đạt / điều kiện đóng: Kiểm đúng deployed SHA/mode/entry/account; auth form hay demo-only được nói rõ. Nếu capability tắt, không hứa đăng nhập/đồng bộ mà không có đường thực hiện. Không gọi sourcepresence là CATUC01/02PASS.
- Dependency: UXA-SRC-03, UXA-NAV-03.

#### UXA-AUTH-02 · P1 — Auth/session/sync và account isolation end-to-end

- Căn cứ hiện có: Audit login/register/sync NOT_VERIFIED.
- Cần đạt / điều kiện đóng: Kiểm login/register/logout/session-expired/loading/error/retry/cancel, hydration và user switch. Guest local persistence khác account sync, demo không rò sang account; account/API/DB evidence riêng và không dùng dữ liệu thật để test khi chưa được phép.
- Dependency: UXA-SRC-03, UXA-NAV-03.

### RSP — Responsive và accessibility toàn luồng

Owner hiện có: Mounted UI owners; shared components. Phase: 8.

#### UXA-RSP-01 · P2 — Mobile375/390/412 và tablet768/933/1024

- Căn cứ hiện có: Audit đa thiết bị chưađủ; local có một sốchecks.
- Cần đạt / điều kiện đóng: Chạy task journeys với long/missing data, focus/keyboard, popup/form/empty/error/landscape/safearea; sidebar/dock/CTA không lặp, không che nội dung, không tràn ngang. Ghi viewport và screenshots từng scenario.
- Dependency: UXA-NAV-01, UXA-BUG-05.

#### UXA-RSP-02 · P2 — Keyboard, semantic controls và focus/reading order

- Căn cứ hiện có: Norman signifiers/constraints; N05 confirmed.
- Cần đạt / điều kiện đóng: Tab/ShiftTab/Enter/Space/Escape/arrow phù hợp control, accessible names và selected state; modal/inactive navigation không giữ tabstop nền; headings/error/live feedback hữu ích, không chỉ icon/màu.
- Dependency: UXA-NAV-01, UXA-BUG-05.

#### UXA-RSP-03 · P2 — Contrast và target sizing đo thực

- Căn cứ hiện có: Audit typography/readability; screenshot không chứng minhcontrast.
- Cần đạt / điều kiện đóng: Đo foreground/background thực cho brand/status/text/focus trên surface thực, zoom/textsize; targets phù hợp và không overlap. Report numeric contrast và giới hạn, không coi build hay nhìn đẹp là a11yPASS.
- Dependency: UXA-NAV-01, UXA-BUG-05.

### VIS — Refinement sau khi flow đã đúng

Owner hiện có: Semantic tokens/shared UI; chart owners. Phase: 8.

#### UXA-VIS-01 · P3 — Typography, spacing, semantic color và icon consistency

- Căn cứ hiện có: Audit P3; local refinements chưapublic.
- Cần đạt / điều kiện đóng: Giảm cạnh tranh CTA, density đúng task, reuse libraryicons/tokens/components; không đổi palette/logo ngoài quyết định đã chốt. Regression các state và width sau refinement.
- Dependency: UXA-RSP-01, UXA-RSP-03.

#### UXA-VIS-02 · P3 — Transition và micro-interaction hỗ trợ feedback

- Căn cứ hiện có: Audit P3; chưa có motion requirement mới.
- Cần đạt / điều kiện đóng: Animation không che loading/error hay trì hoãn action; reduced-motion, focus và scroll ổn. Chỉ thêm khi giải quyết feedback có mục đích, không tạo motion để lấp nội dung.
- Dependency: UXA-RSP-01, UXA-RSP-03.

### QA — Regression UX T01–T15 và usability

Owner hiện có: QA + product/research; subsystem owners. Phase: 8.

#### UXA-QA-01 · P1 — T01 — Tìm sản phẩm đang có

- Căn cứ hiện có: Audit đề xuất; chưa có participant result. Goal/principle: G1; Discoverability.
- Cần đạt / điều kiện đóng: Tìm đúng food/location/quantity từ inventory đầy đủ và filter; đo target thời gian nếu có protocol. Dependency: UXA-INV-01.
- Dependency: UXA-SRC-02.

#### UXA-QA-02 · P1 — T02 — Nhận ra món cần xử lý

- Căn cứ hiện có: Audit đề xuất; chưa có participant result. Goal/principle: G2; Signifiers.
- Cần đạt / điều kiện đóng: Người dùng nhận đúng món/lý do/mức độ và bước tiếp; phân biệt expired/soon/unknown. Dependency: UXA-HOME-01.
- Dependency: UXA-SRC-02.

#### UXA-QA-03 · P1 — T03 — Thêm một sản phẩm bằng OCR

- Căn cứ hiện có: Audit đề xuất; chưa có participant result. Goal/principle: G1/BG-DUYTRI; Affordances/Feedback.
- Cần đạt / điều kiện đóng: Capture/extract/prefill/review/Save thực; không lấy candidatefixture làm camera/OCR acceptance. Dependency: UXA-ADD-03.
- Dependency: UXA-SRC-02.

#### UXA-QA-04 · P1 — T04 — OCR sai HSD và sửa lại

- Căn cứ hiện có: Audit đề xuất; chưa có participant result. Goal/principle: Error recovery/Constraints.
- Cần đạt / điều kiện đóng: User sửa candidate, lỗi tại trường, Save đúng dữ liệu cuối; cancel không ghi. Dependency: UXA-ADD-04.
- Dependency: UXA-SRC-02.

#### UXA-QA-05 · P1 — T05 — Ghi nhận đã dùng

- Căn cứ hiện có: Audit đề xuất; chưa có participant result. Goal/principle: G3; Feedback.
- Cần đạt / điều kiện đóng: Movement consume đúng lượng/unit/history, feedback và cách sửa sai. Dependency: UXA-QTY-01.
- Dependency: UXA-SRC-02.

#### UXA-QA-06 · P1 — T06 — Ghi nhận đã bỏ

- Căn cứ hiện có: Audit đề xuất; chưa có participant result. Goal/principle: G3; Confirmation.
- Cần đạt / điều kiện đóng: Movement discard riêng, confirmation/cancel và data update đúng; không thành Trash. Dependency: UXA-QTY-01.
- Dependency: UXA-SRC-02.

#### UXA-QA-07 · P1 — T07 — Tìm Trash và khôi phục

- Căn cứ hiện có: Audit đề xuất; chưa có participant result. Goal/principle: G4; Constraints.
- Cần đạt / điều kiện đóng: Record restore đúng lifecycle và history; failed/conflict recovery có evidence. Dependency: UXA-QTY-03.
- Dependency: UXA-SRC-02.

#### UXA-QA-08 · P1 — T08 — Đối chiếu món trước khi mua

- Căn cứ hiện có: Audit đề xuất; chưa có participant result. Goal/principle: BG-MUA; Mapping.
- Cần đạt / điều kiện đóng: Bốn trạng thái stock check, basis/package/time/unit rõ; người dùng hiểu giới hạn. Dependency: UXA-SHOP-02.
- Dependency: UXA-SRC-02.

#### UXA-QA-09 · P1 — T09 — Đánh dấu đã mua, chưa nhập kho

- Căn cứ hiện có: Audit đề xuất; chưa có participant result. Goal/principle: Conceptual Model.
- Cần đạt / điều kiện đóng: Shopping checked cập nhật, foods không tăng; hiển thị rõ optional import. Dependency: UXA-SHOP-04.
- Dependency: UXA-SRC-02.

#### UXA-QA-10 · P1 — T10 — Thêm món đã mua vào kho

- Căn cứ hiện có: Audit đề xuất; chưa có participant result. Goal/principle: G1/G4; Navigation.
- Cần đạt / điều kiện đóng: Manual+Scan origins, cancel/back/dirty/save/error/retry/duplicate; chỉ một import đã xác nhận. Dependency: UXA-BUG-02.
- Dependency: UXA-SRC-02.

#### UXA-QA-11 · P1 — T11 — Xem lượng đã dùng và đã bỏ

- Căn cứ hiện có: Audit đề xuất; chưa có participant result. Goal/principle: G5; Evaluation.
- Cần đạt / điều kiện đóng: Thời gian/category/unit/event source khớp và người dùng đọc đúng ý nghĩa. Dependency: UXA-INS-02.
- Dependency: UXA-SRC-02.

#### UXA-QA-12 · P1 — T12 — Hoãn một lời nhắc

- Căn cứ hiện có: Audit đề xuất; chưa có participant result. Goal/principle: G2; Feedback.
- Cần đạt / điều kiện đóng: Snooze/time/read state đúng, count/feedback và trở lại sau delay. Dependency: UXA-NOT-02.
- Dependency: UXA-SRC-02.

#### UXA-QA-13 · P1 — T13 — Tìm không có kết quả

- Căn cứ hiện có: Audit đề xuất; chưa có participant result. Goal/principle: Empty/Error recovery.
- Cần đạt / điều kiện đóng: Home/Kho/Shopping scope liên quan: biết đang lọc gì và phục hồi được; không tự suy không tìm thấy = không có thực phẩm. Dependency: UXA-HOME-03.
- Dependency: UXA-SRC-02.

#### UXA-QA-14 · P1 — T14 — Mất kết nối trong lúc lưu

- Căn cứ hiện có: Audit đề xuất; chưa có participant result. Goal/principle: Recovery/G4.
- Cần đạt / điều kiện đóng: Trước gửi/timeout/sau commit không chắc chắn tách biệt; giữdraft, kiểm kết quả trước retry, không duplicate. Dependency: UXA-BUG-02.
- Dependency: UXA-SRC-02.

#### UXA-QA-15 · P1 — T15 — Hoàn thành task trên điện thoại

- Căn cứ hiện có: Audit đề xuất; chưa có participant result. Goal/principle: HCD/Responsive.
- Cần đạt / điều kiện đóng: Tác vụ chính và alternate/error/cancel/back/recovery trên375/390/412; thao tác chạm thật khiclaimdevice. Dependency: UXA-RSP-01.
- Dependency: UXA-SRC-02.

## 5. Regression protocol T01–T15

Mỗi test phải cover happy/empty/loading/error/cancel/back/duplicate/recovery và
missing/incomplete data trong phạm vi áp dụng; không ép state không liên quan.
Với script/automation: ghi route, actor/action, input, expected/actual, screenshot,
console/network, source SHA/build/environment và data before/after. Có assertion
persistence chỉ khi đọc đúng persistence owner. Không dùng screenshot/count/build
làm bằng chứng nghiệp vụ đã đúng.

Khi thực hiện usability với người dùng thật: ghi task completion, thời gian,
wrong actions, help requests, cách người dùng hiểu state/kết quả. Chưa có protocol,
participant hay phép đo thì giữ NOT_EXECUTED; automation không thay usability.
T01–T15 ở trên là task riêng để không bị bỏ sót trong implementation checklist.

## 6. Deferred, non-bugs và giới hạn

- Template và nhiều Shopping lists: DEFERRED, không là MVP bắt buộc cho đến khi
  requirement được xác nhận. Không thêm feature để giao diện phong phú hơn.
- Không ghi bug tổng16món từ phép cộngAll+children; không ghi bug mobile dock thiếu
  chỉ vì auditdesktop/DOMchung. Không tự xây chart pie nếu runtime không có pie.
- Chưa claim31UCcomplete, camera/OCR, database CRUD/restore/sync, thiết bị thực,
  networkuncertainwrite hoặc acceptance. Các phần này phải có test đúng môi trường.
- Không tự chuyển stock check thành training/storage migration; không tự thêm
  bank/price/financial analytics, automated advice hay safety inference.
- Đóng từng task cần requirement→output→evidence→status ở root ROADMAP. Khi nguồn
  phủ định finding, disposition có lý do và evidence thay vì sửa một bug không có.

## 7. Coverage đối với toàn bộ audit đầu vào

| Audit unit | Task/gate giữ phạm vi |
|---|---|
| F01 desktop/dock và NAV duplicate entry | NAV-01, RSP-01 |
| F02 một/nhiều danh sách | SHOP-05; templates/multi-list deferred |
| F03 bought vs stock | SHOP-04, QA-09/10 |
| F04 Guest/banner/login | NAV-03, AUTH-01/02 |
| F05 Settings categories | SET-01/02/03 |
| Home H01/H02/H03 | HOME-01/02/03 |
| Inventory default/search/filter/location | INV-01/02/03 |
| Add unit/date/validation/OCR/barcode/flow | ADD-01…06 |
| Detail quantity/events/Trash/recovery | QTY-01/02/03 |
| ShoppingUC30/31;4matchstates/package/time/changebasis | SHOP-01…05 |
| Insight goal/unit/time/readability/interpretation | INS-01…04 |
| Notification preview/read/snooze/bulk/taskstatus | NOT-01/02/03 |
| Settings testfeedback/data/location/Guest | SET + INV-03 + NAV-03 |
| Login/Guest/auth/sync | AUTH-01/02 |
| RC01…05 and7 nguyên tắc | SRC-02 plus task-specific gates |
| P1/P2/P3 và8phases | Priority/phase của mọi task; dependency §3 |
| T01…T15; no fake participant metrics | QA-01…15 và §5 |
| Earlier local N01…N07 | BUG-01…07, screenshots/raw evidence ở QA report |
| Screenshots user gửi là references, không Expiry runtime | SRC-01/03; không copy app tham chiếu thành requirement |
