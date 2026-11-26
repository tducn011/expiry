# Expiry — nghiên cứu nguồn và review đầy đủ persona, 6 feature, 31 UC, business goals

- Document ID: `RESEARCH-UC-GOAL-20261115`
- Status: **Review — nghiên cứu và đối chiếu đặc tả; chưa kiểm triển khai hoặc người dùng**
- Ngày đọc nguồn: 2026-11-15, Asia/Ho_Chi_Minh.
- Phạm vi: 6 feature `F01…F06`, 31 danh tính `CAT-UC-01…31`; giữ riêng UC03 ảnh có sẵn, UC04 camera và UC05 nhập/kiểm tra/lưu. Chỉ UC05 lưu bản ghi thực phẩm.
- Phương pháp: nguồn chuẩn kỹ thuật, bài do chính tổ chức UX công bố, hướng dẫn cơ quan quản lý và nghiên cứu thực nghiệm gốc. Không coi sản phẩm đối thủ hoặc bài tổng hợp là bằng chứng nhu cầu của người dùng Expiry.

## Nguồn đặc tả hiện hành đã đọc

| Nguồn | Định vị và quan sát [A] |
|---|---|
| [UC Catalog — Tiếng Việt · 31 UC](https://docs.google.com/document/d/1p2hYcmkg8FTVLQ1sq4_dUSzZdiZYx87ZZKjzLrg5wJI/edit?tab=t.6r97sabiw7ew) | Đọc toàn bộ 80 đoạn. Revision `AHj4eMTDUOZl8LiiIIy_aW-NsKTWbfAtw6cTuHwbMAHAl-7_OyHilUbYK6-TtR55IX0FLFq__ZhEHBgBLW8l_srWVN6IAK1kPsKcROOZfyE`. Mỗi UC đã có mục tiêu, điều kiện trước, bao quát và kết quả; chưa là bảng BF/AF/EF chi tiết. |
| [BR & Requirements — Baseline](https://docs.google.com/document/d/1p2hYcmkg8FTVLQ1sq4_dUSzZdiZYx87ZZKjzLrg5wJI/edit?tab=t.zfh89zxm3cc2) | Đọc 225 đoạn, gồm BR-C01…22, UR-C01…10, FR-C01…31, TR-C01…05 và bảng truy vết feature. FR-C03/04 chưa lưu; FR-C05 xác nhận lưu một bản ghi. |
| [Business Goals — Chuỗi giá trị · Review](https://docs.google.com/document/d/1p2hYcmkg8FTVLQ1sq4_dUSzZdiZYx87ZZKjzLrg5wJI/edit?tab=t.gyq15xocirah) | Đọc 291 đoạn. G1…G5, G6 là phạm vi cá nhân, BG-MUA và BG-DUYTRI, M01…M10 và V01…V15. Đã phân biệt phù hợp thiết kế với outcome chưa quan sát. |

Snapshot này có thể khác revision sau khi root đồng bộ tài liệu. Chỉ những tab và nội dung trên được dùng để nhận xét hiện trạng; các nguồn SE/HCI mang namespace cũ không được ghép ID theo số.

## Sáu kết luận từ nguồn sơ cấp

### R1 — UC cần kết quả có giá trị và ranh giới kết thúc quan sát được

**[B] Nguồn:** OMG UML 2.5.1 §18.1.1, §18.1.3.1, trang in 639–640 mô tả UC bằng hành vi và kết quả có giá trị cho actor/stakeholder. UC có thể chứa biến thể, ngoại lệ và xử lý lỗi; có thể dùng pre/postcondition hoặc ngôn ngữ tự nhiên. UML không quy định mọi dự án phải có cùng số UC hay cùng bảng mẫu. [OMG specification landing page](https://www.omg.org/spec/UML/2.5.1/), [normative PDF](https://www.omg.org/spec/UML/2.5.1/PDF).

**[A] Áp vào Expiry:** UC03/04 kết thúc bằng dữ liệu gợi ý hoặc trạng thái bàn giao; UC05 kết thúc bằng bản ghi đã xác nhận hoặc hủy/lỗi. Cả ba nằm trong một feature F01. [UC Catalog, F01](https://docs.google.com/document/d/1p2hYcmkg8FTVLQ1sq4_dUSzZdiZYx87ZZKjzLrg5wJI/edit?tab=t.6r97sabiw7ew).

**[C] Diễn giải:** Có thể giữ ba UC đã chốt nếu ghi rõ UC03/04 là mục tiêu thành phần “có dữ liệu để kiểm tra”, và phân biệt với mục tiêu đầu cuối “thêm món thành công”. Thay đổi precondition một mình chưa chứng minh cần thêm một UC mới; mục tiêu, kết quả và ranh giới cũng phải có nghĩa.

**[D] Khuyến nghị:** Giữ 31 ID và ba UC F01. Trong đặc tả sau này, đánh dấu cấp mục tiêu và dữ liệu bàn giao. Số UC hoàn thành trong hành trình không phải số lần tạo món.

### R2 — Precondition là trạng thái đầu vào; sự kiện phát sinh cần nằm đúng nhánh

**[B] Nguồn:** Bài gốc của Michael Jastram và Andreas Kara trong IREB RE Magazine trình bày precondition như ràng buộc phải đúng trước hành vi và postcondition phải đúng sau hành vi; ví dụ đăng xuất có trạng thái đã đăng nhập trước khi bắt đầu. Các điều kiện ràng buộc hành vi nhưng không thay thế mô tả hành vi. [Modeling Requirements with Constraints, phần Constraints và ví dụ Logging out](https://re-magazine.ireb.org/articles/modeling-requirements-with-constraints).

**[A] Áp vào Expiry:** UC04 vừa đặt “camera được phép và hoạt động” trong precondition, vừa ghi kiểm quyền/khả dụng và chuyển UC03 nếu bị từ chối/lỗi. UC03 đã cho phép người dùng chủ động chọn ảnh, nên không bị giới hạn chỉ khi camera hỏng. [UC04 và UC03](https://docs.google.com/document/d/1p2hYcmkg8FTVLQ1sq4_dUSzZdiZYx87ZZKjzLrg5wJI/edit?tab=t.6r97sabiw7ew), [FR-C03/04](https://docs.google.com/document/d/1p2hYcmkg8FTVLQ1sq4_dUSzZdiZYx87ZZKjzLrg5wJI/edit?tab=t.zfh89zxm3cc2).

**[C] Rủi ro diễn đạt:** Hai ranh giới đang bị trộn: kiểm trước khi vào camera và trạng thái đã vào phiên đọc. Điều này dễ làm người đặc tả bỏ nhánh quyền chưa hỏi hoặc camera dừng sau khi bắt đầu.

**[D] Khuyến nghị:** Chọn một ranh giới nhất quán. Theo ranh giới Product Owner đã chốt cho Expiry, giữ camera được phép và dùng được là precondition04; đặt việc kiểm quyền/khả dụng ở bước định tuyến trước04, từ chối/hỏng chuyển03. Camera mất hoạt động sau khi vào04 là ngoại lệ. Một ranh giới khác có thể đặt việc xin quyền trong04 và dùng precondition rộng hơn, nhưng không cần đổi sang lựa chọn đó trong review này. Mô tả điểm bàn giao03/05, kết quả một phần và hủy; giữ nguyên31ID.

### R3 — NFR bảo vệ chất lượng của các hành vi trong chuỗi giá trị

**[B] Nguồn:** IREB phân biệt FR về hành vi/kết quả, NFR về chất lượng/ràng buộc, và traceability về quan hệ giữa các work product. Vì vậy NR được gắn vào tác vụ và điều kiện đo. [IREB CPRE Glossary, Functional requirement, Non-functional requirement, Traceability](https://cpre.ireb.org/en/downloads-and-resources/glossary).

**[C] Diễn giải cho Expiry:** Mô hình phù hợp là nhu cầu → mục tiêu tác vụ → feature/UC → hành vi BR/FR → kết quả tác vụ, với NFR áp lên các đoạn liên quan. NFR không phải một bước màn hình được thực hiện sau UC. “Lưu chỉ một lần”, “giữ nháp khi lỗi” và “chuyển nhập tay” cần FR/BR xác định hành vi; NR định nghĩa chất lượng như tính toàn vẹn, thời gian, khả năng hiểu/khôi phục.

**[A] Mức phù hợp hiện có:** Baseline đã gắn BR/FR/NR vào từng feature; F01 có NR-02/05/06/08/09/13/14 và F06 có NR-01/03/05/06/08/09/12/13/14. [Baseline §7 truy vết](https://docs.google.com/document/d/1p2hYcmkg8FTVLQ1sq4_dUSzZdiZYx87ZZKjzLrg5wJI/edit?tab=t.zfh89zxm3cc2).

**[D] Khuyến nghị:** Khi review từng UC, kiểm ba câu riêng: hành vi có xác định được kết quả, chất lượng có tiêu chí đo, và kết quả đó có góp phần vào goal của persona. Một hàng có nhiều ID chưa đủ để trả lời ba câu này.

### R4 — Có thể tinh chỉnh P02/P03 theo scope, với trạng thái bằng chứng rõ

**[B] Nguồn:** NN/g phân biệt proto-persona dựa trên giả định nhóm với qualitative/statistical persona dựa trên nghiên cứu. Proto-persona có ích để làm giả định rõ và tiếp tục sửa khi có dữ liệu; rủi ro là vòng lặp củng cố giả định. [3 Persona Types, phần Proto Personas](https://www.nngroup.com/articles/persona-types/). Persona dựa trên nghiên cứu vẫn là mô tả nhân vật hư cấu tổng hợp các hành vi/nhu cầu có liên quan đến thiết kế. [Personas Make Users Memorable, Creating Personas](https://www.nngroup.com/articles/persona/).

**[A] Áp vào Expiry:** P02 hiện nhấn “kế hoạch đổi nhưng biết có gì, ở đâu, còn bao nhiêu để kiểm tra/dùng/hoãn”; P03 nhấn “công cập nhật đủ dễ để kho số đáng tin trước lần mua tiếp”. [Business Goals §3 ba persona](https://docs.google.com/document/d/1p2hYcmkg8FTVLQ1sq4_dUSzZdiZYx87ZZKjzLrg5wJI/edit?tab=t.gyq15xocirah).

**[C] Diễn giải:** Cho phép của Product Owner đủ để điều chỉnh mô tả và phạm vi persona. Sự đồng bộ đó tạo tính nhất quán thiết kế; nó chưa xác nhận người ngoài đời có đúng các nhu cầu đã viết. Nếu chưa có nguồn participant, dùng nhãn proto-persona/giả thuyết và không bịa tuổi, tỷ lệ phân khúc hay lời trích dẫn.

**[D] Khuyến nghị:** P02 tập trung quyết định trong hoàn cảnh kế hoạch mua/dùng thay đổi; P03 tập trung đối chiếu lượng và sửa ghi nhầm qua nhiều lần. Giữ họ phân biệt bằng cơ chế khó khăn và tác vụ thành công; không viết cả hai thành “người cần sáu feature”.

### R5 — F06 có căn cứ nhu cầu; tác động phụ thuộc kho đủ đúng và việc mua thực tế

**[B] Nguồn:** EPA hướng dẫn kiểm tủ lạnh/tủ đông/tủ khô trước khi mua, lập danh sách có lượng để tránh mua quá nhu cầu, và ưu tiên thực phẩm đang có. FDA cũng khuyến nghị lập danh sách, kiểm đồ đã có và kiểm tủ thường xuyên. [EPA, Planning and Shopping Tips](https://www.epa.gov/recycle/preventing-wasted-food-home), [FDA, At the Grocery Store và Storage and Prep](https://www.fda.gov/food/consumers/tips-reduce-food-waste).

**[A] Áp vào Expiry:** UC30 ghi kế hoạch mua; UC31 đối chiếu kho đã ghi và cho quyết định giữ/sửa/bỏ dự định. Mua xong đi UC05, không tự đổi tồn từ check “đã mua”. Các trạng thái khớp, mốc đọc và lần cập nhật lượng đã phân biệt với hàng vật lý. [UC30/31](https://docs.google.com/document/d/1p2hYcmkg8FTVLQ1sq4_dUSzZdiZYx87ZZKjzLrg5wJI/edit?tab=t.6r97sabiw7ew), [BR-C17…21](https://docs.google.com/document/d/1p2hYcmkg8FTVLQ1sq4_dUSzZdiZYx87ZZKjzLrg5wJI/edit?tab=t.zfh89zxm3cc2).

**[C] Diễn giải:** F06 phù hợp một hành vi phòng ngừa lãng phí được hướng dẫn bởi cơ quan chính thức. Đây là căn cứ cho cơ chế sản phẩm; không xác nhận tỷ lệ người dùng quốc tế cần app này hoặc mức giảm mua trùng của Expiry. F06 phụ thuộc nhập kho, cập nhật lượng và khả năng nhận ra dữ liệu cũ.

**[D] Khuyến nghị:** Theo dõi cả quyết định đúng khi đối chiếu và mua trùng thực tế theo baseline. Mỗi lần so sánh phải hiện cơ sở và độ mới; “không tìm thấy trong kho đã ghi” không được chuyển nghĩa thành “nhà không còn”.

### R6 — Review logic, usability và business outcome cần ba loại bằng chứng

**[B] Nguồn:** IREB định nghĩa verification về khớp đặc tả và validation về khớp nhu cầu stakeholder. [CPRE Glossary, Validation, Verification](https://cpre.ireb.org/en/downloads-and-resources/glossary). NN/g xác định heuristic review là đánh giá chuyên gia để phát hiện vấn đề có thể xảy ra; phương pháp này bổ trợ nghiên cứu với người dùng. [How to Conduct a Heuristic Evaluation](https://www.nngroup.com/articles/how-to-conduct-a-heuristic-evaluation/). Thử usability quan sát người phù hợp làm tác vụ thực tế; cách đặt tác vụ có thể tác động kết quả. [Usability Testing 101, Tasks và Participant](https://www.nngroup.com/articles/usability-testing-101/).

**[B] Minh họa thực nghiệm gốc:** RCT của Roe và cộng sự có 42 người được phân ngẫu nhiên, can thiệp cá nhân hóa với công nghệ và hỗ trợ chuyên môn trong khoảng một tuần. Bài báo ghi nhận kết quả khác nhau giữa rác khi ăn và tổng rác mọi giai đoạn. Thiết kế ấy khác Expiry và không cung cấp hiệu quả dự báo cho catalog này. [Roe et al., 2022, Methods và Results, DOI 10.1016/j.resconrec.2021.106121](https://pmc.ncbi.nlm.nih.gov/articles/PMC8788996/).

**[C] Diễn giải:** Có đường truy vết đủ và không mâu thuẫn cho phép kết luận thiết kế có cơ chế hợp lý để đạt goal. Hành vi chạy đúng, người dùng quyết định đúng, và giảm lãng phí/tiết kiệm/duy trì ngoài đời là ba claim có dữ liệu khác nhau.

**[D] Khuyến nghị:** Giữ M01…M10 và V01…V15 là kế hoạch đo. Gắn `NOT EXECUTED` tới khi có actual/evidence. G1…G5 và BG-MUA/BG-DUYTRI được đánh giá mức phù hợp thiết kế; G6 được kiểm như ràng buộc phạm vi. Không dùng số feature, UC, lượt mở app hoặc lượt Push làm bằng chứng đủ cho outcome.

## Các lỗi cần tránh khi chuyển thành bảng UC chi tiết

| Ranh giới kiểm | Quy tắc review đề xuất [D] | Căn cứ |
|---|---|---|
| Actor và persona | Persona mô tả hoàn cảnh/hành vi; actor mô tả vai trò tương tác. Một người có thể thỏa nhiều cơ chế persona mà vẫn dùng cùng actor tài khoản cá nhân. | [OMG §18.1.3.1](https://www.omg.org/spec/UML/2.5.1/PDF), [NN/g persona types](https://www.nngroup.com/articles/persona-types/). |
| Trigger và precondition | “Bấm quét” là sự kiện bắt đầu; “có phiên hợp lệ” là trạng thái yêu cầu. Từ chối quyền sau khi được hỏi là nhánh diễn ra; lỗi camera giữa phiên là ngoại lệ. | [IREB Constraints](https://re-magazine.ireb.org/articles/modeling-requirements-with-constraints). |
| Có dữ liệu và hiển thị lỗi | UC06/18/27/31 phải vào được khi kho trống. Điều kiện “có thực phẩm” không được chặn luôn các trạng thái empty cần mô tả. UC truy cập một món cần món tồn tại/quyền truy cập, nhưng vẫn xử lý món vừa đổi hoặc mất trong lúc làm. | [Catalog UC06/08/18/27/31](https://docs.google.com/document/d/1p2hYcmkg8FTVLQ1sq4_dUSzZdiZYx87ZZKjzLrg5wJI/edit?tab=t.6r97sabiw7ew), [IREB Constraints](https://re-magazine.ireb.org/articles/modeling-requirements-with-constraints). |
| Handoff | Ghi rõ dữ liệu/trạng thái nào sang UC đích, nguồn sở hữu nháp và việc hủy có làm lưu không. Chuyển màn hình không tự tạo quan hệ UML `include` hoặc `extend`. | [OMG §18.1.3.1…3](https://www.omg.org/spec/UML/2.5.1/PDF). |
| Lỗi/hủy/chưa biết kết quả ghi | Postcondition tối thiểu phải bảo vệ dữ liệu, quyền sở hữu và chống ghi lặp. Tách kết quả thành công với tình trạng hủy/lỗi/chưa biết, có đường xác minh kết quả thay vì tự thêm lại. | [Catalog UC05 và BR-C20](https://docs.google.com/document/d/1p2hYcmkg8FTVLQ1sq4_dUSzZdiZYx87ZZKjzLrg5wJI/edit?tab=t.zfh89zxm3cc2), [NN/g error prevention và user control](https://www.nngroup.com/articles/ten-usability-heuristics/). |
| Đầy đủ | Đầy đủ được kết luận trong scope và các requirement đã biết, không phải bảo đảm bao quát mọi hành vi tương lai. Một feature cần đường tạo giá trị, sửa sai và nhận phản hồi đủ cho mục tiêu của nó. | [IREB Completeness](https://cpre.ireb.org/en/downloads-and-resources/glossary), [NN/g heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/). |

## Giới hạn kết luận và đầu ra bàn giao

[C] Từ ba tab hiện hành và nguồn sơ cấp đã đọc, có căn cứ giữ cấu trúc 6 feature/31 UC để tiếp tục đặc tả. Tính hợp lý của từng nhánh và phép đo còn phải đối chiếu toàn bộ catalog, 15 NR, các persona nguồn và UI cụ thể bởi review chính. Note này cung cấp căn cứ phương pháp và các điểm phân biệt, không thay audit toàn bộ hoặc chứng nhận các nhánh đã vận hành.

[D] Bước triển khai tài liệu phù hợp là làm rõ điều kiện/trigger UC04, cấp mục tiêu UC03/04/05 và quan hệ handoff; chỉnh P02/P03 có nhãn bằng chứng; sau đó đặc tả BF/AF/EF theo baseline. Chưa có căn cứ từ các nguồn trên để thêm feature thứ bảy hoặc gộp ba UC nhập liệu đã được Product Owner chốt.

Đã kiểm trong nhánh nghiên cứu: đọc lại file Markdown và kiểm link/ID ở mức tĩnh. Nhánh nghiên cứu không chạy app, thử device/camera, kiểm database, thu dữ liệu participant hoặc sửa Google Docs. Root tiếp tục tổng hợp audit đầy đủ và tinh chỉnh persona theo quyền user trong phần dưới.

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

Questions skipped: phạm vi toàn bộ6feature/31UC và quyền tinh chỉnhP02/P03 đã được user xác định; không cần hỏi lại lựa chọn phạm vi hoặc hướng thiết kế để trả kết quả review. Workflow critique được áp dụng cho product specification; không áp điểm visual/runtime vào dữ liệu không quan sát được.

Điều kiện để chốt kín thiết kế: giải quyếtC01; làm rõC02/C03/C05 trong BR/FR và đặc tả nhánh tương ứng; đặt tiêu chíC04 trước đánh giá. Sau đó chạy V theo expected/actual và M với người phù hợp, vẫn giữ business outcome ở trạng thái chưa quan sát tới khi có dữ liệu.
