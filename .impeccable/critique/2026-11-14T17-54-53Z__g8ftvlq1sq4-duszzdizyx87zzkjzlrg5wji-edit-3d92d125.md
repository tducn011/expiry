---
target: Logic persona to six features, 31 UC, preconditions, NR and business goals; specification review
na_heuristics: 1,2,3,4,5,6,7,8,9,10
p0_count: 0
p1_count: 1
target_identity: "url:https://docs.google.com/document/d/1p2hYcmkg8FTVLQ1sq4_dUSzZdiZYx87ZZKjzLrg5wJI/edit"
timestamp: 2026-11-14T17-54-53Z
slug: g8ftvlq1sq4-duszzdizyx87zzkjzlrg5wji-edit-3d92d125
---
# Review tổng hợp 6 feature / 31 UC — UXCritique và Research, 15/11/2026

Method: dual-agent (A: /root/ux_semantic_a · B: /root/uc_precondition_b), đối chiếu nguồn sơ cấp độc lập bởi /root/uc_primary_research. Root tổng hợp và đọc lại các định vị nguồn. Đây là critique logic đặc tả và tác vụ; không chấm điểm giao diện đang chạy.

## Kết luận có thể bảo vệ bằng nguồn

[C] Cấu trúc sáu feature và 31 danh tính CAT-UC phù hợp với phạm vi cá nhân đã chốt, có đường đóng góp tới G1…G5, BG-MUA và BG-DUYTRI. Không thấy feature mồ côi hoặc lý do bắt buộc thêm feature thứ bảy. Độ kín vận hành chưa đủ để khẳng định toàn bộ UC đã hoàn thiện: C01 là lỗ hổng bảo toàn lượng; C02/C03 cần làm rõ ranh giới và vòng đời; C04 còn thiếu tiêu chí chấp nhận công duy trì; C05 là chi tiết toàn vẹn cần chốt trước thực hiện.

[A] Phạm vi đọc: toàn bộ 5 tab Feature/UC/NR/BR/Goals ở revision AHj4eMTDUOZl8LiiIIy_aW-NsKTWbfAtw6cTuHwbMAHAl-7_OyHilUbYK6-TtR55IX0FLFq__ZhEHBgBLW8l_srWVN6IAK1kPsKcROOZfyE. Sau đó chỉ 6 đoạn mô tả/provenance P02/P03 được cập nhật theo quyền PO, revision AHj4eMTABhmW78dFP0jIGEs8dJtJCljWl-2UQR2nwMkDCVkk790WIytXG9djwWE6qVzmP7N-xBdb7YnP1f0HRW4tbavGnZtVkwozP6RJlEw; cả6đoạn đã đọc lại khớp. Catalog/BR/FR/NR hành vi không được sửa ngầm trong lần review.

## Persona sau tinh chỉnh được PO cho phép

[A/D] P02 — Người quản lý thực phẩm khi kế hoạch sinh hoạt thay đổi: cần biết đang có gì, nơi cất, lượng đã ghi và lý do cần chú ý để chọn kiểm tra/hẹn/hoãn hoặc sửa dự định mua. UC06/07/08 → UC09 hoặc UC18/20/22 → UC24/25/26 khi thực tế đổi → UC30/31. Kết quả cần kiểm: tìm đúng, hiểu lý do, chọn bước phù hợp; M01/M02/M06/M10.

[A/D] P03 — Người cần lượng thực phẩm đáng tin với công duy trì hợp lý: có thể bỏ sót cập nhật hoặc ghi nhầm; cần kiểm kê, hiệu chỉnh và giải thích lượng trước lần mua tiếp. UC24/25/26 ↔ UC28 → UC27/31; UC29→05 cho lần ghi mới. Kết quả cần kiểm: đối soát/sửa được, hiểu lịch sử, quyết định mua trên dữ liệu có mức chắc chắn rõ; M03/M04/M05/M06/M10.

Đã dùng nhãn persona thiết kế/giả thuyết theo quyền PO, giữ nguồn thẻ cũ riêng; chưa bịa nghiên cứu participant mới. Sự phù hợp sau tinh chỉnh không tự chứng minh nhu cầu thị trường. Xem R4 và nguồn NN/g ở trên.

## Feature, toàn bộ UC và đường tới goal

| Feature | Toàn bộ CAT-UC | Nhu cầu → hành vi → chất lượng | Goal và evidence cần có |
| --- | --- | --- | --- |
| Nền tảng | 01 Đăng ký;02 Đăng nhập | UR-C01 → FR-C01/02; BR-C01/20; NR-01/06/09 | G4/G6; M04/M10; V01/V11. Hỗ trợ chuỗi, không là benefit độc lập. |
| F01 Thêm | 03 Ảnh;04 Camera;05 Nhập/kiểm tra/lưu | UR-C02 → FR-C03/04/05; BR-C02/03/04/09/20; NR-02/05/06/08/09/13/14 | G1/G4; M10; V02/V03/V11. C02 phải rõ; chỉ05save. |
| F02 Quản lý | 06 Danh sách;07 Tìm;08 Chi tiết;09 Sửa/phân loại;10 Thùng rác;11 Xem rác;12 Khôi phục;13 Purge | UR-C03/07 → FR-C06…13; NR quyền/phục hồi/kiểm soát/vòng đời | G1/G4; M01/M04; V04/V06/V09/V11. C05 cho purge/restore. |
| F03 Danh mục/nơi | 14 Tạo nơi;15 Đổi tên nơi;16 Xóa nơi;17 Tạo danh mục | UR-C04 → FR-C14…17, gắn ở05/09; BR-C13/14; NR-01/06/08/09/10/13/14 | G1/G4; M01/M04; V05/V11. Tổ chức hỗ trợ tìm món. |
| F04 Hạn/nhắc | 18 Chú ý;19 Ngày mở;20 Hẹn kiểm;21 Thông báo;22 Hoãn;23 Thiết lập | UR-C05 → FR-C18…23; BR-C03…08; NR-02/06/07/08/09/13/14 | G2/G4; M02; V03/V07/V08/V09. C01/C02/C03 liên quan. |
| F05 Lượng/Insights | 24 Dùng;25 Bỏ;26 Kiểm kê;27 Insights;28 Lịch sử/sửa;29 Thêm lại→05 | UR-C06/08 → FR-C24…29; BR-C09…12/15/16/20; NR-03/04/05/06/08/09/10/11/13/14/15 | G3/G4/G5; M03/M04/M05/M10; V10/V11/V12. C01 chặn kết luận kín. |
| F06 Mua sắm | 30 Danh sách;31 Đối chiếu; nhập kho bàn giao05 | UR-C09 → FR-C30/31; BR-C17…21; NR-01/03/05/06/08/09/12/13/14 | BG-MUA/G1/G4; M06/M08; V13. Có căn cứ cơ chế EPA/FDA; outcome chưa đo. |

UR-C10, NR-06/09/13/14 và M07/M10 áp xuyên các feature cho công duy trì. NFR là chất lượng cần bảo đảm của hành vi; biểu diễn nó như bước thực hiện sau UC sẽ sai loại quan hệ. Các UC hỗ trợ như khôi phục, đăng nhập, tổ chức nơi cất không cần mỗi UC có KPI giảm lãng phí riêng.

## Những phát hiện ưu tiên và cách xử lý cụ thể

### C01 — P1: Tách nhóm chưa bảo toàn lượng

[A] BR-C04 và UC19 yêu cầu nhóm gói khác ngày mở phải tách qua UC05/26. [C] Hai phép ghi riêng có thể tạo trạng thái trung gian sai: 2chai→mở1; giảm nhóm cũ rồi hủy tạo mới cho tổng1, tạo mới trước rồi giảm lỗi cho tổng3. BR-C10 bảo vệ từng phép ghi, chưa bảo vệ toàn nhánh tách. G3/G4 và thông tin F06 đều chịu ảnh hưởng.

[D] Chọn một hợp đồng trong scope: nhánh tách có nguồn/đích, xem trước và một xác nhận chung bảo toàn tổng lượng cùng đơn vị; giảm nguồn+tạo đích cùng thành công, cùng operation ID; hủy/lỗi không ghi nửa, retry không lặp. Một lựa chọn đơn giản hơn là giới hạn một gói mỗi bản ghi, nhưng phải công bố và đối chiếu nhu cầu quản lý lượng. Không cần feature/UC mới. V03/V10 cần ca thành công, hủy, lỗi giữa bước và retry.

### C02 — P2: Phân định precondition, guard và điểm hủy/bàn giao

[A] UC04 precondition camera đã cho phép/hoạt động nhưng mô tả luôn kiểm quyền/từ chối trong cùng câu. UC03/04 có Hủy nhưng kết quả diễn đạt như luôn bàn giao05. UC19 có hồ sơ hoạt động nhưng bao quát Mở lúc thêm. UC01/FR-C01 còn dẫn chính sách xác thực hiện hành mà chưa định vị chính sách phiên đầu ra.

[D] Giữ precondition04 theo PO: bước kiểm quyền/khả dụng đứng trước04, từ chối/hỏng→03; lỗi sau khi vào04 là exception04.03/04 là mục tiêu thành phần có kết quả riêng. Bỏ qua/tiếp tục→05, hủy toàn bộ→quay ngữ cảnh trước không bàn giao/lưu. Ngày mở nhập trước lưu nằm trong05;19 cập nhật hồ sơ sau lưu, cùng BR-C03/04. Chốt đầu ra01 là có phiên ngay hay quay02/xác minh theo policy được chọn; không thêm UC chỉ vì nhánh quyền hoặc lỗi.

### C03 — P2: Điều khiển và ưu tiên lịch nhắc chưa kín

[A] UC20/22/23, BR-C06…08 đã có mốc, hoãn xuyên trạng thái và ngoại lệ daily cap; còn thiếu sửa/hủy hẹn riêng, bỏ mốc hoãn và tác động Tắt/đổi múi giờ tới lịch cũ.

[D] Phương án để chốt: tắt nhắc hạn hủy auto+snooze của chuỗi, lịch kiểm tra thủ công giữ độc lập và có sửa/hủy trong20;22 cho thay/bỏ mốc hoãn với tác động hiển thị rõ; giờ lặp dùng múi giờ tài khoản, hẹn cụ thể giữ instant đã xác nhận và hiển thị giờ quy đổi. V08 kiểm tắt/bật, sửa/hủy, đổi múi giờ và lịch đồng thời. Đây là khuyến nghị chưa ghi thành BR được phê duyệt.

### C04 — P2: Đo công duy trì chưa có chuẩn để kết luận chấp nhận được

[A] M10 đã đo ba flow thêm/cập nhật/mua→kho; gate8/9 và2/3 theo nhóm mới là gate hoàn thành. Chưa có gate so sánh công OCR/tay hay mức công người dùng chấp nhận ở những lần lặp.

[C] Có thể thao tác đúng trong một phiên và vẫn bỏ dùng lâu dài. Vì vậy không thể suy BG-DUYTRI hoặc giảm công từ mapping hay thời gian riêng OCR.

[D] Chốt trước thử tác vụ tiêu chí so sánh theo cùng bối cảnh: thời gian đầu–cuối, tỷ lệ hoàn thành/lỗi, số lần sửa/thử lại, mức chấp nhận công cập nhật và dữ liệu lần đầu/lặp. Dùng baseline quan sát để đặt mức hợp lý; không bịa ngưỡng phổ quát. M07 phải báo tác vụ giá trị, đầy đủ cohort và rơi rụng; M08/M09 cần nhật ký/baseline ngoài đời như đã lên kế hoạch.

### C05 — P2: Hai chi tiết toàn vẹn cần chốt trước thực hiện

[A/C] BR-C11 nói mốc kiểm kê là neo nhưng câu sửa chính mốc tính lại từ mốc đó chưa tường minh việc dừng ở mốc neo hiệu lực kế tiếp. Đây là rủi ro diễn giải, chưa chứng minh thuật toán hiện có sai. [D] Ghi rõ tái tính đoạn bị ảnh hưởng tới mốc neo kế tiếp; nếu còn neo phía sau, hiệu chỉnh trước đó không đổi tồn hiện tại. Ca: khởi tạo10→dùng2→kiểm kê5→dùng1→kiểm kê7→sửa kiểm kê5thành4; tồn hiện tại vẫn7.

[A/C] BR-C15 hứa xóa mọi snapshot có danh tính món; NR-15 giữ7backup ngày, QP-02/TR-C04 dùng snapshot phục hồi. Chưa có contract nối purge và restore. [D] Chọn phạm vi xóa ngay và retention backup rõ, cùng purge manifest/tombstone phải áp trước mở lại dữ liệu sau restore; hoặc thật sự xóa/crypto-erase mọi bản. Chưa được kết luận có lỗi hay vi phạm hạ tầng thực tế. V06/V15 cần restore bản trước purge và xác nhận không tái xuất danh tính đã xóa.

## Checklist riêng từng UC — 31/31

Điều kiện chung UC dữ liệu cá nhân: actor là người dùng có phiên hợp lệ, quyền sở hữu đúng tài khoản; không cần nhắc lại mọi ô. Preconditions là trạng thái bắt đầu, không bảo đảm trạng thái không đổi trong suốt UC; vẫn phải xử lý phiên hết hạn, race/xung đột và mất quyền khi đang thực hiện. Các mô tả dưới là kiểm cấp catalog, chưa thay bảng BF/AF/EF.

| CAT-UC | Tên | Điều kiện đầu vào cần giữ | Kết quả/handoff | Đánh giá |
| --- | --- | --- | --- | --- |
| 01 | Đăng ký | Chưa có phiên hợp lệ; vào đăng ký | Tài khoản được hệ thống xác nhận | C02: cần định vị policy phiên sau đăng ký. |
| 02 | Đăng nhập | Có tài khoản; chưa có phiên hợp lệ | Phiên đúng chủ thể; nháp đúng tài khoản | Hợp lý ở cấp catalog. |
| 03 | Đọc ảnh có sẵn | Đang Thêm; tự chọn ảnh hoặc fallback camera | Gợi ý/nháp trống →05; chưa lưu | C02: Bỏ qua→05 khác Hủy toàn bộ→kết thúc. |
| 04 | Đọc camera | Qua kiểm tra trước: camera được phép và dùng được | Gợi ý→05; mất camera có nhánh03/05 | C02: phân định preflight và lỗi trong phiên; giữ UC riêng. |
| 05 | Nhập/kiểm tra/lưu | Nháp trống hoặc bàn giao03/04/29/30 | Một bản ghi sau xác nhận thành công | Hợp lý; C01 nếu dùng như một nửa thao tác tách. |
| 06 | Xem danh sách | Phiên/quyền kho cá nhân; không cần kho có món | Danh sách/lọc/sắp xếp hoặc empty/error | Hợp lý; empty không bị precondition chặn. |
| 07 | Tìm thực phẩm | Quyền đọc kho; có ngữ cảnh truy vấn | Kết quả riêng từng gói hoặc không tìm thấy | Hợp lý. |
| 08 | Xem chi tiết | Đúng chủ thể và tham chiếu bản ghi | Thông tin mới nhất hoặc không thể xem | Hợp lý; kiểm lại khi món đổi/xóa giữa phiên. |
| 09 | Sửa/phân loại | Hồ sơ hoạt động thuộc tài khoản | Thuộc tính xác nhận; tính lại lịch liên quan | Hợp lý; lượng đi24…26. |
| 10 | Chuyển thùng rác | Hồ sơ hoạt động, đúng chủ thể | Xóa mềm, hủy lịch; không ghi Đã bỏ | Hợp lý. |
| 11 | Xem thùng rác | Quyền đọc thùng rác cá nhân | Danh sách/hạn khôi phục hoặc empty/error | Hợp lý. |
| 12 | Khôi phục | Hồ sơ trong thùng rác, còn30ngày, đúng chủ thể | Cùng ID; tính trạng thái/lịch hiện tại | Hợp lý; kiểm hạn lúc xác nhận; C05 khi restore backup. |
| 13 | Xóa vĩnh viễn | Hồ sơ trong thùng rác, đúng chủ thể, chưa purge | Xóa danh tính món; dấu lượng chỉ đọc | C05: nối chính sách purge với backup/restore. |
| 14 | Tạo nơi | Phiên hợp lệ; mở tạo nơi | Nơi mới thuộc tài khoản, không tự lưu món | Hợp lý. |
| 15 | Đổi tên nơi | Nơi thuộc tài khoản và còn sửa được | Tên mới; ID/liên kết giữ nguyên | Hợp lý. |
| 16 | Xóa nơi | Nơi thuộc tài khoản | Xóa nơi+bỏ liên kết cùng thành công; giữ món | Hợp lý; có số món ảnh hưởng. |
| 17 | Tạo danh mục | Phiên hợp lệ; mở tạo danh mục | Danh mục mới; gắn ở05/09 | Hợp lý trong scope; chưa cần tự thêm mọi CRUD. |
| 18 | Món cần chú ý | Quyền đọc kho; không cần có món hay Push | Món hoạt động còn lượng, nhóm/lý do rõ | Hợp lý; thiếu HSD→Chưa rõ hạn. |
| 19 | Ghi ngày mở | Hồ sơ đã lưu, hoạt động, đồng nhất trạng thái mở | Ngày mở riêng; không tự suy HSD | C01 tách nhóm; C02 ngày mở lúc thêm thuộc05. |
| 20 | Hẹn kiểm tra | Món hoạt động còn lượng, đúng chủ thể | Lịch riêng; không đổi HSD/hoãn | C03: sửa/hủy lịch, quan hệ với tắt nhắc. |
| 21 | Xem/đọc thông báo | Quyền đọc thông báo cá nhân; không cần Push | Tạo/gửi/đọc/xử lý riêng; mở món hiện tại | Hợp lý; đọc không là dùng/bỏ. |
| 22 | Hoãn nhắc | Lời nhắc/món đúng chủ thể và còn hợp lệ | Một mốc hoãn xuyên trạng thái, chống phát trùng | C03: bỏ/đổi mốc hoãn khi23 đổi thiết lập. |
| 23 | Thiết lập nhắc | Phiên/quyền đổi thiết lập | N/giờ/múi giờ/tần suất/kênh được lưu | C03: auto/snooze/manual và đổi múi giờ. |
| 24 | Ghi đã dùng | Hồ sơ hoạt động; mới cần tồn>0; sửa được khi tồn0 | Tồn+sự kiện cùng nhau, sửa có bản hiệu chỉnh | Hợp lý; C05 phạm vi giữa các mốc kiểm kê. |
| 25 | Ghi đã bỏ | Như24 | Giảm tồn với sự kiện Bỏ, không vào thùng rác | Hợp lý; cùng lưu ý C05. |
| 26 | Kiểm kê | Hồ sơ hoạt động thuộc tài khoản | Lượng neo+sự kiện Điều chỉnh, không suy dùng/bỏ | C01 tách nhóm; C05 các mốc kiểm kê. |
| 27 | Insights | Quyền đọc dữ liệu cá nhân | Tổng theo kỳ/đơn vị và nguồn28 | Hợp lý; phụ thuộc toàn vẹn lượng/lịch sử. |
| 28 | Lịch sử/sửa nhầm | Đọc đúng tài khoản; sửa cần hồ sơ hoạt động | Gốc/hiệu chỉnh; bàn giao24/25/26 | Hợp lý; dấu đã purge chỉ đọc. |
| 29 | Thêm lại từ lịch sử | Nguồn còn được phép đọc; không phải dấu đã purge | Nháp→05; ID mới chỉ sau lưu | Hợp lý; ngày/lượng/mở phải kiểm lại. |
| 30 | Danh sách mua | Phiên và danh sách đúng chủ thể | Mục mua thay đổi; nhập kho→05 tùy chọn | Hợp lý; Đã mua không tự tạo tồn. |
| 31 | Đối chiếu kho | Mục mua và quyền kho cùng chủ thể | Mức khớp/cơ sở/mốc đọc; liên kết metadata có xác nhận | Hợp lý; kho trống khác đọc lỗi, không suy tồn vật lý. |

## Khả năng đạt từng business goal

| Goal | Cơ chế đóng góp | Kết luận review |
| --- | --- | --- |
| G1 Nhận biết đang có | F01→F02/F03; F06 đưa kho vào lúc mua | Đường thiết kế rõ; đúng/đủ ngoài đời phụ thuộc nhập và cập nhật. Kiểm M01/M10. |
| G2 Chọn món chú ý | F04 lý do/ngày→chi tiết→kiểm tra/hẹn/dùng/bỏ | Phù hợp nhu cầu trong scope; C02/C03 phải rõ. Kiểm hiểu và lựa chọn M02, không lấy Push làm thành công. |
| G3 Lượng sát ghi nhận | F05 dùng/bỏ/kiểm kê/hiệu chỉnh | Chưa thể gọi kín cho nhóm nhiều gói vì C01; C05 cần rõ. M03 dùng kiểm kê độc lập. |
| G4 Dữ liệu kiểm tra được | Xác nhận, nguồn, idempotency, lịch sử, phục hồi | Cơ chế có; C01/C05 còn mở. V01…V15 kiểm hành vi, không chỉ kiểm tồn tại ID. |
| G5 Hiểu tổng quan | UC27 tổng hợp hiệu lực theo đơn vị/kỳ→28 | Phù hợp thiết kế, phụ thuộc tính đúng nguồn; M05 kiểm cách hiểu/truy nguồn. |
| BG-MUA | 30→31 đọc/hiểu kho→giữ/sửa/bỏ nhu cầu→05 nếu nhập kho | Cơ chế hợp lý theo EPA/FDA; M06 cho tác vụ, M08 mới đo mua trùng thực tế. |
| BG-DUYTRI | Tác vụ giá trị lặp lại với công phù hợp | Yếu nhất về bằng chứng; C04. M07/M10 chưa chạy, chưa có tỷ lệ mục tiêu được xác nhận. |
| Giảm lượng bỏ/tiết kiệm kỳ vọng | Thông tin→quyết định→hành động vật lý→duy trì | M09/baseline riêng; chưa có bằng chứng outcome/nhân quả. Không suy tiền tiết kiệm từ số món hoặc nhắc. |
| G6 Phạm vi cá nhân | Quyền và dữ liệu theo tài khoản | Ràng buộc scope; không là KPI lợi ích. |

## UXCritique — phạm vi bằng chứng và heuristic

[A] Impeccable context nhận repo có apps/api và apps/web, cả hai thiếu PRODUCT/DESIGN; target lần này là URL đặc tả Docs, không có yêu cầu đánh giá app nào. Detector đã thực sự chạy trên snapshot Markdown và trả []: không có markup frontend để đánh giá, vì vậy kết quả đó KHÔNG chứng minh giao diện không lỗi. Không mở/inject overlay trên Google Docs editor vì đó không phải giao diện Expiry cần kiểm. Browser/device/camera/Push và trải nghiệm hình ảnh chưa được quan sát trong lần này.

| Heuristic | Điều đã có hoặc còn thiếu trong đặc tả; chưa phải điểm UI |
| --- | --- |
| 1 Visibility | Có trạng thái empty/error/unknown/success; cần kiểm UI thực tế. |
| 2 Match real world | Phân biệt dùng/bỏ/kiểm kê, ba ngày và stock vật lý; C01 tách nhóm chưa đủ. |
| 3 Control/freedom | Có hủy/xác nhận/khôi phục; C02/C03 còn thiếu nghĩa hủy/đổi lịch. |
| 4 Consistency | Namespace hiện hành riêng; C02 cần nhất quán ranh giới trước/sau UC. |
| 5 Error prevention | Có kiểm ngày/lượng/phiên bản/chống lặp; C01 transaction toàn nhánh chưa chốt. |
| 6 Recognition | Ngày/lượng/nơi/cơ sở khớp đã yêu cầu hiện; không có chứng cứ bố trí UI. |
| 7 Efficiency | Có tái dùng nháp, đường thay thế và M10; C04 chưa chốt mức công chấp nhận. |
| 8 Minimalism | Chưa đánh giá thị giác hoặc số lựa chọn hiển thị từ catalog. |
| 9 Recovery | Có nháp/retry/hiệu chỉnh; C05 restore/purge cần nối rõ. |
| 10 Help | Có nhãn/trạng thái yêu cầu dễ hiểu; chưa có dữ liệu thử tác vụ để chấm. |

Không tính tổng Nielsen /40 từ tài liệu vì chưa quan sát UI. Không tạo điểm trend giả hoặc claim có overlay. Ba nhóm bằng chứng tiếp theo phải tách: kiểm đúng đặc tả, thử người dùng đúng tác vụ, quan sát outcome dài hạn.

## Phần đã thay đổi, phần còn là finding

Đã thay đổi nativeDoc: 6đoạn persona/provenance trong Feature§3, Goals§3 và lời dẫn UR trong Baseline; đã đọc lại sau ghi. Không chỉnh tuổi/quote/thẻ nguồn hay thay đổi feature/UC/BR. Các findingC01…05 là review recommendation, chưa được ghi ngầm thành thay đổi hành vi. Không có kiểm app, DB/migration, triển khai hoặc nghiên cứu participant mới.
