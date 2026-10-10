# System Engineering Gr2

- Document ID: 1js1KBfrVrgDn9EVC4_sNGIvUlWQNlLRC66nyTeAvBmA
- Revision ID: AHj4eMS5EWe-jr7L4pHoM2K-E6BEo9zjw16uvcESw_yvGNDsovpQqmff6fOg2H3XwNoA0TY9TPgjRNyuN9QjckK20SN4AjaiSwSTns135X8
- Selected tab: t.1rjc5vc4ma1w
- Protected controls: 0
- Opaque controls: 0
- Authoritative dropdowns: 0

Protected-control annotations are preservation instructions. Do not insert their displayed placeholder text to recreate a native control.

## FINAL CHECK (t.1rjc5vc4ma1w)

[P00001 | 1:8 | HEADING_1]
NHÓM 2

[P00002 | 8:132 | HEADING_2]
ĐỀ TÀI: XÂY DỰNG HỆ THỐNG QUẢN LÝ VÀ CẢNH BÁO VÒNG ĐỜI SẢN PHẨM CÁ NHÂN DỰA TRÊN DỮ LIỆU HẠN DÙNG VÀ PHẢN HỒI TỪ NGƯỜI DÙNG

[P00003 | 132:359 | NORMAL_TEXT]
Tên hệ thống: Expiry ThingsTài liệu: Đặc tả yêu cầu nghiệp vụ và yêu cầu hệ thốngTrạng thái: Bản dự thảo phục vụ đánh giá và thống nhất yêu cầuPhạm vi triển khai đề xuất: Quản lý thực phẩm trong hộ gia đình (Food-first MVP)

[P00004 | 359:392 | HEADING_1]
1. Giới thiệu và xác định vấn đề

[P00005 | 392:406 | HEADING_2]
1.1. Bối cảnh

[P00006 | 406:720 | NORMAL_TEXT]
Trong sinh hoạt hằng ngày, các cá nhân và hộ gia đình thường xuyên mua sắm, lưu trữ và sử dụng nhiều loại thực phẩm khác nhau. Tuy nhiên, thông tin về số lượng thực phẩm hiện có, vị trí lưu trữ, thời hạn sử dụng và tình trạng sử dụng thường phân tán giữa nhãn sản phẩm, khu vực bảo quản và trí nhớ của người dùng.

[P00007 | 720:756 | NORMAL_TEXT]
Điều này có thể dẫn đến các vấn đề:

[P00008 | 756:812 | NORMAL_TEXT | LIST id=kix.tgafdf3stwjg level=0]
Người dùng quên những thực phẩm đã mua và đang lưu trữ.

[P00009 | 812:863 | NORMAL_TEXT | LIST id=kix.tgafdf3stwjg level=0]
Không nhận biết kịp thời các sản phẩm sắp hết hạn.

[P00010 | 863:922 | NORMAL_TEXT | LIST id=kix.tgafdf3stwjg level=0]
Mua thêm thực phẩm dù trong nhà vẫn còn sản phẩm tương tự.

[P00011 | 922:968 | NORMAL_TEXT | LIST id=kix.tgafdf3stwjg level=0]
Không biết nên ưu tiên sử dụng thực phẩm nào.

[P00012 | 968:1016 | NORMAL_TEXT | LIST id=kix.tgafdf3stwjg level=0]
Phải bỏ đi thực phẩm do không sử dụng kịp thời.

[P00013 | 1016:1126 | NORMAL_TEXT | LIST id=kix.tgafdf3stwjg level=0]
Gặp khó khăn trong việc duy trì thông tin tồn kho khi thực phẩm liên tục được thêm vào, sử dụng hoặc loại bỏ.

[P00014 | 1126:1357 | NORMAL_TEXT]
Các phương pháp quản lý thủ công phụ thuộc nhiều vào khả năng ghi nhớ và thói quen cập nhật thông tin của người dùng. Khi việc cập nhật đòi hỏi quá nhiều thao tác, dữ liệu quản lý có thể không còn phản ánh đúng tình trạng thực tế.

[P00015 | 1357:1404 | HEADING_2]
1.2. Vấn đề cần giải quyết (Problem Statement)

[P00016 | 1404:1824 | NORMAL_TEXT]
Cá nhân và hộ gia đình chưa có một phương thức thuận tiện và đáng tin cậy để theo dõi thực phẩm đang lưu trữ, quản lý thông tin hạn dùng và xác định những sản phẩm cần được chú ý trong quá trình sử dụng. Việc thiếu thông tin tập trung và cập nhật kịp thời có thể gây lãng phí thực phẩm, phát sinh chi phí mua sắm không cần thiết và khiến người dùng gặp khó khăn trong việc đưa ra quyết định sử dụng hoặc xử lý sản phẩm.

[P00017 | 1824:2157 | NORMAL_TEXT]
Trong ba persona hiện có, vấn đề biểu hiện theo ba cơ chế: P-01 mất chú ý sau khi cất thực phẩm; P-02 khó chọn việc tiếp theo khi kế hoạch bữa ăn thay đổi; P-03 chịu công cập nhật lặp lại khiến hồ sơ số dễ lệch với thực tế. Đây là các cơ chế mô tả trong tài liệu persona, cần được kiểm chứng bằng tác vụ và bối cảnh sử dụng thực tế.

[P00018 | 2157:2202 | HEADING_2]
1.3. Định nghĩa hệ thống (System Definition)

[P00019 | 2202:2322 | NORMAL_TEXT]
Expiry Things là hệ thống thông tin hỗ trợ cá nhân và hộ gia đình quản lý thực phẩm trong quá trình lưu trữ và sử dụng.

[P00020 | 2322:2546 | NORMAL_TEXT]
Hệ thống có nhiệm vụ ghi nhận thông tin sản phẩm, quản lý số lượng và vị trí lưu trữ, theo dõi các mốc thời gian liên quan đến hạn dùng, xác định sản phẩm cần được chú ý và hỗ trợ người dùng đưa ra quyết định xử lý phù hợp.

[P00021 | 2546:2705 | NORMAL_TEXT]
Khi người dùng xác nhận một hành động như sử dụng, di chuyển, loại bỏ hoặc chỉnh sửa sản phẩm, hệ thống cập nhật thông tin và đánh giá lại trạng thái quản lý.

[P00022 | 2705:2734 | NORMAL_TEXT]
Mục đích chính của hệ thống:

[P00023 | 2734:2788 | NORMAL_TEXT | LIST id=kix.2oumcls0571 level=0]
Giảm tình trạng lãng phí thực phẩm có thể tránh được.

[P00024 | 2788:2870 | NORMAL_TEXT | LIST id=kix.2oumcls0571 level=0]
Hỗ trợ người dùng đưa ra quyết định sử dụng thực phẩm dựa trên thông tin phù hợp.

[P00025 | 2870:2950 | NORMAL_TEXT | LIST id=kix.2oumcls0571 level=0]
Nâng cao hiệu quả sử dụng nguồn thực phẩm và chi phí mua sắm trong hộ gia đình.

[P00026 | 2950:3022 | NORMAL_TEXT | LIST id=kix.2oumcls0571 level=0]
Giảm công sức ghi nhớ, kiểm tra và duy trì thông tin quản lý thực phẩm.

[P00027 | 3022:3218 | NORMAL_TEXT]
Hệ thống không trực tiếp kiểm tra chất lượng vật lý hoặc xác nhận mức độ an toàn của thực phẩm. Các thông tin đánh giá phụ thuộc vào dữ liệu đã ghi nhận, quy tắc xử lý và xác nhận của người dùng.

[P00028 | 3218:3249 | HEADING_2]
1.4. Luồng hoạt động tổng quát

[P00029 | 3249:3266 | NORMAL_TEXT]
Đầu vào (Input):

[P00030 | 3266:3296 | NORMAL_TEXT | LIST id=kix.ufakt9srg0de level=0]
Thông tin nhận diện sản phẩm.

[P00031 | 3296:3321 | NORMAL_TEXT | LIST id=kix.ufakt9srg0de level=0]
Số lượng và đơn vị tính.

[P00032 | 3321:3337 | NORMAL_TEXT | LIST id=kix.ufakt9srg0de level=0]
Vị trí lưu trữ.

[P00033 | 3337:3400 | NORMAL_TEXT | LIST id=kix.ufakt9srg0de level=0]
Ngày sản xuất, ngày hết hạn hoặc thông tin hạn dùng liên quan.

[P00034 | 3400:3437 | NORMAL_TEXT | LIST id=kix.ufakt9srg0de level=0]
Hành động và phản hồi từ người dùng.

[P00035 | 3437:3471 | NORMAL_TEXT | LIST id=kix.ufakt9srg0de level=0]
Các thiết lập và quy tắc áp dụng.

[P00036 | 3471:3488 | NORMAL_TEXT]
Xử lý (Process):

[P00037 | 3488:3514 | NORMAL_TEXT | LIST id=kix.s81p7cmc4yh9 level=0]
Kiểm tra dữ liệu đầu vào.

[P00038 | 3514:3556 | NORMAL_TEXT | LIST id=kix.s81p7cmc4yh9 level=0]
Ghi nhận và truy xuất thông tin sản phẩm.

[P00039 | 3556:3598 | NORMAL_TEXT | LIST id=kix.s81p7cmc4yh9 level=0]
Đánh giá thông tin vòng đời theo quy tắc.

[P00040 | 3598:3625 | NORMAL_TEXT | LIST id=kix.s81p7cmc4yh9 level=0]
Xác định mức độ cần chú ý.

[P00041 | 3625:3663 | NORMAL_TEXT | LIST id=kix.s81p7cmc4yh9 level=0]
Xử lý các hành động đã được xác nhận.

[P00042 | 3663:3683 | NORMAL_TEXT]
Trạng thái (State):

[P00043 | 3683:3711 | NORMAL_TEXT | LIST id=kix.hlsezko1eh2r level=0]
Danh sách sản phẩm hiện có.

[P00044 | 3711:3739 | NORMAL_TEXT | LIST id=kix.hlsezko1eh2r level=0]
Số lượng và vị trí lưu trữ.

[P00045 | 3739:3759 | NORMAL_TEXT | LIST id=kix.hlsezko1eh2r level=0]
Thông tin vòng đời.

[P00046 | 3759:3777 | NORMAL_TEXT | LIST id=kix.hlsezko1eh2r level=0]
Lịch sử thay đổi.

[P00047 | 3777:3821 | NORMAL_TEXT | LIST id=kix.hlsezko1eh2r level=0]
Trạng thái cần chú ý và cấu hình liên quan.

[P00048 | 3821:3838 | NORMAL_TEXT]
Đầu ra (Output):

[P00049 | 3838:3858 | NORMAL_TEXT | LIST id=kix.az1i31giaiej level=0]
Danh sách sản phẩm.

[P00050 | 3858:3902 | NORMAL_TEXT | LIST id=kix.az1i31giaiej level=0]
Thông tin hạn dùng và trạng thái liên quan.

[P00051 | 3902:3934 | NORMAL_TEXT | LIST id=kix.az1i31giaiej level=0]
Danh sách sản phẩm cần ưu tiên.

[P00052 | 3934:3963 | NORMAL_TEXT | LIST id=kix.az1i31giaiej level=0]
Các hành động xử lý phù hợp.

[P00053 | 3963:4003 | NORMAL_TEXT | LIST id=kix.az1i31giaiej level=0]
Thông báo nhắc nhở nếu được triển khai.

[P00054 | 4003:4024 | NORMAL_TEXT]
Phản hồi (Feedback):

[P00055 | 4024:4310 | NORMAL_TEXT]
Người dùng xác nhận hoặc chỉnh sửa thông tin sau khi sử dụng, di chuyển hoặc loại bỏ sản phẩm. Hệ thống tiếp nhận thay đổi, cập nhật hồ sơ và đánh giá lại trạng thái. Việc gửi thông báo hoặc hiển thị một hành động không đồng nghĩa với việc hành động đó đã được thực hiện ngoài thực tế.

[P00056 | 4310:4355 | HEADING_1]
3. Business Requirements — Yêu cầu nghiệp vụ

[P00057 | 4355:4404 | HEADING_2]
BR-01. Giảm lãng phí thực phẩm trong hộ gia đình

[P00058 | 4404:4414 | NORMAL_TEXT]
Mục tiêu:

[P00059 | 4414:4558 | NORMAL_TEXT]
Giảm lượng thực phẩm bị bỏ phí do người dùng quên sản phẩm đang lưu trữ, không nhận biết kịp thời hạn dùng hoặc bỏ lỡ thời điểm có thể sử dụng.

[P00060 | 4558:4577 | NORMAL_TEXT]
Lợi ích mong muốn:

[P00061 | 4577:4618 | NORMAL_TEXT | LIST id=kix.puzsrcbq98np level=0]
Hạn chế tình trạng thực phẩm bị bỏ quên.

[P00062 | 4618:4690 | NORMAL_TEXT | LIST id=kix.puzsrcbq98np level=0]
Tăng khả năng sử dụng thực phẩm trước khi phải loại bỏ không cần thiết.

[P00063 | 4690:4751 | NORMAL_TEXT | LIST id=kix.puzsrcbq98np level=0]
Giúp người dùng nhận biết sớm những sản phẩm cần được chú ý.

[P00064 | 4751:4768 | NORMAL_TEXT]
Chỉ số đánh giá:

[P00065 | 4768:4814 | NORMAL_TEXT | LIST id=kix.7jbf3uic5imq level=0]
Số lượng hoặc khối lượng thực phẩm bị bỏ phí.

[P00066 | 4814:4873 | NORMAL_TEXT | LIST id=kix.7jbf3uic5imq level=0]
Tỷ lệ thực phẩm bị loại bỏ do quên hoặc không sử dụng kịp.

[P00067 | 4873:4948 | NORMAL_TEXT | LIST id=kix.7jbf3uic5imq level=0]
Sự thay đổi lượng thực phẩm bị lãng phí trước và sau khi sử dụng hệ thống.

[P00068 | 4948:5032 | NORMAL_TEXT]
Trạng thái: Chưa xác định số liệu ban đầu, thời gian đánh giá và mức giảm mục tiêu.

[P00069 | 5032:5084 | HEADING_2]
BR-02. Hỗ trợ quyết định sử dụng và xử lý thực phẩm

[P00070 | 5084:5094 | NORMAL_TEXT]
Mục tiêu:

[P00071 | 5094:5238 | NORMAL_TEXT]
Hỗ trợ người dùng hiểu thông tin liên quan đến hạn dùng và xác định những sản phẩm cần được kiểm tra, sử dụng hoặc xử lý vào thời điểm phù hợp.

[P00072 | 5238:5257 | NORMAL_TEXT]
Lợi ích mong muốn:

[P00073 | 5257:5312 | NORMAL_TEXT | LIST id=kix.w61ll4isjcq8 level=0]
Giúp người dùng nhận biết các sản phẩm cần được chú ý.

[P00074 | 5312:5383 | NORMAL_TEXT | LIST id=kix.w61ll4isjcq8 level=0]
Hạn chế việc bỏ sót những thông tin quan trọng liên quan đến hạn dùng.

[P00075 | 5383:5449 | NORMAL_TEXT | LIST id=kix.w61ll4isjcq8 level=0]
Hỗ trợ người dùng đưa ra quyết định dựa trên thông tin có căn cứ.

[P00076 | 5449:5524 | NORMAL_TEXT | LIST id=kix.w61ll4isjcq8 level=0]
Góp phần nâng cao nhận thức về việc sử dụng và bảo quản thực phẩm phù hợp.

[P00077 | 5524:5541 | NORMAL_TEXT]
Chỉ số đánh giá:

[P00078 | 5541:5594 | NORMAL_TEXT | LIST id=kix.dps3ptjnyupv level=0]
Khả năng nhận biết và giải thích thông tin hạn dùng.

[P00079 | 5594:5662 | NORMAL_TEXT | LIST id=kix.dps3ptjnyupv level=0]
Tỷ lệ hoàn thành đúng các tình huống lựa chọn sản phẩm cần ưu tiên.

[P00080 | 5662:5722 | NORMAL_TEXT | LIST id=kix.dps3ptjnyupv level=0]
Khả năng nhận biết thông tin thiếu hoặc chưa được xác nhận.

[P00081 | 5722:5732 | NORMAL_TEXT]
Giới hạn:

[P00082 | 5732:5823 | NORMAL_TEXT]
Hệ thống không thể bảo đảm thực phẩm an toàn hoặc ngăn chặn hoàn toàn các rủi ro sức khỏe.

[P00083 | 5823:5878 | HEADING_2]
BR-03. Tối ưu việc sử dụng nguồn lực trong hộ gia đình

[P00084 | 5878:5888 | NORMAL_TEXT]
Mục tiêu:

[P00085 | 5888:6034 | NORMAL_TEXT]
Nâng cao hiệu quả sử dụng thực phẩm đã mua, đồng thời hạn chế các khoản chi phí phát sinh do mua trùng hoặc không tận dụng được sản phẩm hiện có.

[P00086 | 6034:6053 | NORMAL_TEXT]
Lợi ích mong muốn:

[P00087 | 6053:6109 | NORMAL_TEXT | LIST id=kix.gv5ifn55wa47 level=0]
Giúp người dùng biết những thực phẩm đang có trong nhà.

[P00088 | 6109:6164 | NORMAL_TEXT | LIST id=kix.gv5ifn55wa47 level=0]
Hạn chế việc mua sản phẩm tương tự khi chưa cần thiết.

[P00089 | 6164:6209 | NORMAL_TEXT | LIST id=kix.gv5ifn55wa47 level=0]
Tăng khả năng tận dụng thực phẩm đã lưu trữ.

[P00090 | 6209:6258 | NORMAL_TEXT | LIST id=kix.gv5ifn55wa47 level=0]
Góp phần sử dụng ngân sách mua sắm hiệu quả hơn.

[P00091 | 6258:6275 | NORMAL_TEXT]
Chỉ số đánh giá:

[P00092 | 6275:6318 | NORMAL_TEXT | LIST id=kix.9ncu02mywngf level=0]
Số lần mua trùng sản phẩm không cần thiết.

[P00093 | 6318:6356 | NORMAL_TEXT | LIST id=kix.9ncu02mywngf level=0]
Mức độ tận dụng các sản phẩm đang có.

[P00094 | 6356:6430 | NORMAL_TEXT | LIST id=kix.9ncu02mywngf level=0]
Giá trị chi phí tiết kiệm được theo phương pháp đo lường được thống nhất.

[P00095 | 6430:6557 | NORMAL_TEXT]
BR-01 tập trung vào giảm lượng thực phẩm bị lãng phí. BR-03 tập trung vào hiệu quả sử dụng nguồn thực phẩm và chi phí mua sắm.

[P00096 | 6557:6607 | HEADING_2]
BR-04. Duy trì hiệu quả quản lý thực phẩm lâu dài

[P00097 | 6607:6617 | NORMAL_TEXT]
Mục tiêu:

[P00098 | 6617:6770 | NORMAL_TEXT]
Xây dựng phương thức quản lý thực phẩm có khả năng duy trì sử dụng trong thời gian dài mà không yêu cầu người dùng thực hiện quá nhiều thao tác quản lý.

[P00099 | 6770:6789 | NORMAL_TEXT]
Lợi ích mong muốn:

[P00100 | 6789:6839 | NORMAL_TEXT | LIST id=kix.q87m8e2yf03x level=0]
Hạn chế việc người dùng ngừng cập nhật thông tin.

[P00101 | 6839:6905 | NORMAL_TEXT | LIST id=kix.q87m8e2yf03x level=0]
Giảm chênh lệch giữa dữ liệu trên hệ thống và tình trạng thực tế.

[P00102 | 6905:6950 | NORMAL_TEXT | LIST id=kix.q87m8e2yf03x level=0]
Nâng cao khả năng duy trì thói quen quản lý.

[P00103 | 6950:6998 | NORMAL_TEXT | LIST id=kix.q87m8e2yf03x level=0]
Giảm công sức quản lý so với giá trị nhận được.

[P00104 | 6998:7015 | NORMAL_TEXT]
Chỉ số đánh giá:

[P00105 | 7015:7062 | NORMAL_TEXT | LIST id=kix.5b8i014nmtqc level=0]
Thời gian thực hiện các tác vụ quản lý cơ bản.

[P00106 | 7062:7091 | NORMAL_TEXT | LIST id=kix.5b8i014nmtqc level=0]
Tỷ lệ hoàn thành các tác vụ.

[P00107 | 7091:7131 | NORMAL_TEXT | LIST id=kix.5b8i014nmtqc level=0]
Mức độ chính xác của thông tin tồn kho.

[P00108 | 7131:7163 | NORMAL_TEXT | LIST id=kix.5b8i014nmtqc level=0]
Tỷ lệ duy trì sử dụng hệ thống.

[P00109 | 7163:7212 | NORMAL_TEXT | LIST id=kix.5b8i014nmtqc level=0]
Nguyên nhân người dùng bỏ dở hoặc ngừng sử dụng.

[P00110 | 7212:7249 | HEADING_2]
3.1. Tổng hợp các mục tiêu nghiệp vụ

[P00111 | 7249:7250 | NORMAL_TEXT]
⟦EMPTY PARAGRAPH⟧

[P00112 | 7253:7256 | NORMAL_TEXT | TABLE row=0 col=0]
Mã

[P00113 | 7257:7266 | NORMAL_TEXT | TABLE row=0 col=1]
Mục tiêu

[P00114 | 7267:7288 | NORMAL_TEXT | TABLE row=0 col=2]
Kết quả cần đánh giá

[P00115 | 7290:7296 | NORMAL_TEXT | TABLE row=1 col=0]
BR-01

[P00116 | 7297:7321 | NORMAL_TEXT | TABLE row=1 col=1]
Giảm lãng phí thực phẩm

[P00117 | 7322:7348 | NORMAL_TEXT | TABLE row=1 col=2]
Lượng thực phẩm bị bỏ phí

[P00118 | 7350:7356 | NORMAL_TEXT | TABLE row=2 col=0]
BR-02

[P00119 | 7357:7383 | NORMAL_TEXT | TABLE row=2 col=1]
Hỗ trợ quyết định sử dụng

[P00120 | 7384:7421 | NORMAL_TEXT | TABLE row=2 col=2]
Mức độ hiểu và ra quyết định phù hợp

[P00121 | 7423:7429 | NORMAL_TEXT | TABLE row=3 col=0]
BR-03

[P00122 | 7430:7447 | NORMAL_TEXT | TABLE row=3 col=1]
Tối ưu nguồn lực

[P00123 | 7448:7487 | NORMAL_TEXT | TABLE row=3 col=2]
Hiệu quả tận dụng thực phẩm và chi phí

[P00124 | 7489:7495 | NORMAL_TEXT | TABLE row=4 col=0]
BR-04

[P00125 | 7496:7520 | NORMAL_TEXT | TABLE row=4 col=1]
Duy trì quản lý lâu dài

[P00126 | 7521:7577 | NORMAL_TEXT | TABLE row=4 col=2]
Mức độ chính xác, công sức và khả năng tiếp tục sử dụng

[P00127 | 7578:7579 | NORMAL_TEXT]
⟦EMPTY PARAGRAPH⟧

[P00128 | 7579:7678 | NORMAL_TEXT]
Nhóm cần xác định dữ liệu ban đầu và phương pháp đo trước khi phê duyệt những mục tiêu định lượng.

[P00129 | 7678:7679 | NORMAL_TEXT]
⟦EMPTY PARAGRAPH⟧

[P00130 | 7679:7680 | NORMAL_TEXT]
⟦EMPTY PARAGRAPH⟧

[P00131 | 7680:7681 | NORMAL_TEXT]
⟦EMPTY PARAGRAPH⟧

[P00132 | 7681:7682 | NORMAL_TEXT]
⟦EMPTY PARAGRAPH⟧

[P00133 | 7682:7683 | NORMAL_TEXT]
⟦EMPTY PARAGRAPH⟧

[P00134 | 7683:8102 | NORMAL_TEXT]
Liên hệ với persona: BR-01 gắn với việc giữ thực phẩm trong sự chú ý của P-01 và điều chỉnh kế hoạch của P-02; BR-02 gắn trực tiếp với quyết định tiếp theo của P-02; BR-03 gắn với tận dụng thực phẩm của P-02 và thông tin tồn kho đáng tin cậy của P-03; BR-04 gắn với công nhập/cập nhật của cả ba persona, trọng tâm ở P-03. Quan hệ này giải thích hướng đáp ứng nhu cầu, chưa chứng minh hệ thống đã đạt kết quả nghiệp vụ.

[P00135 | 8102:8179 | HEADING_1]
4. User / Stakeholder Requirements — Yêu cầu người dùng và các bên liên quan

[P00136 | 8179:8380 | NORMAL_TEXT]
Theo Slide System Engineering, trang 70–73, Business Requirements (BR) thể hiện mục tiêu và lợi ích của dự án; User (stakeholder) Requirements thể hiện những nhu cầu cần được đáp ứng để đạt các BR đó.

[P00137 | 8380:8549 | NORMAL_TEXT]
Trong Expiry Things, persona cung cấp căn cứ mô tả người dùng trực tiếp. Bên liên quan còn gồm các nhóm có trách nhiệm quản lý, đánh giá, xây dựng và vận hành hệ thống.

[P00138 | 8549:8705 | NORMAL_TEXT]
Quan hệ truy vết: Mục tiêu BR ↔ bên liên quan và nhu cầu của họ ↔ yêu cầu chức năng/phi chức năng. Persona làm rõ bối cảnh và khó khăn của nhóm người dùng.

[P00139 | 8705:8737 | HEADING_2]
4.1. Xác định các bên liên quan

[P00140 | 8737:8738 | NORMAL_TEXT]
⟦EMPTY PARAGRAPH⟧

[P00141 | 8741:8744 | NORMAL_TEXT | TABLE row=0 col=0]
Mã

[P00142 | 8745:8764 | NORMAL_TEXT | TABLE row=0 col=1]
Nhóm bên liên quan

[P00143 | 8765:8794 | NORMAL_TEXT | TABLE row=0 col=2]
Mối quan tâm và BR liên quan

[P00144 | 8796:8802 | NORMAL_TEXT | TABLE row=1 col=0]
ST-01

[P00145 | 8803:8869 | NORMAL_TEXT | TABLE row=1 col=1]
Người dùng cá nhân và người phụ trách thực phẩm trong hộ gia đình

[P00146 | 8870:8991 | NORMAL_TEXT | TABLE row=1 col=2]
Nhớ thực phẩm đang có, chọn món cần ưu tiên và cập nhật thông tin thuận tiện. BR-01 đến BR-04; persona P-01, P-02, P-03.

[P00147 | 8993:8999 | NORMAL_TEXT | TABLE row=2 col=0]
ST-02

[P00148 | 9000:9031 | NORMAL_TEXT | TABLE row=2 col=1]
Nhóm quản lý và đánh giá dự án

[P00149 | 9032:9120 | NORMAL_TEXT | TABLE row=2 col=2]
Thống nhất mục tiêu, phạm vi và đánh giá lợi ích thực tế của hệ thống. BR-01 đến BR-04.

[P00150 | 9122:9128 | NORMAL_TEXT | TABLE row=3 col=0]
ST-03

[P00151 | 9129:9166 | NORMAL_TEXT | TABLE row=3 col=1]
Nhóm phát triển và vận hành hệ thống

[P00152 | 9167:9255 | NORMAL_TEXT | TABLE row=3 col=2]
Có yêu cầu nhất quán và điều kiện kiểm tra để xây dựng, duy trì hệ thống. Hỗ trợ BR-04.

[P00153 | 9256:9454 | NORMAL_TEXT]
Người dùng có thể cùng lúc mua, lưu trữ, sử dụng, cập nhật và nhận nhắc nhở về thực phẩm. Các hoạt động này là vai trò tương tác của ST-01, không phải các nhóm stakeholder hay loại tài khoản riêng.

[P00154 | 9454:9687 | NORMAL_TEXT]
Persona mô tả các kiểu bối cảnh, hành vi và nhu cầu trong nhóm ST-01. Ba persona dưới đây được tổng hợp từ tài liệu Canva hiện có của nhóm; chưa có hồ sơ nghiên cứu gốc kèm theo để xác minh mức độ đại diện hoặc tần suất các hành vi.

[P00155 | 9687:9732 | NORMAL_TEXT]
Nguồn persona: [Canva — User Persona Insight](https://www.canva.com/design/DAHXSrL9WU4).

[P00156 | 9732:9789 | HEADING_3]
P-01. Phạm Hoàng An — Thỉnh thoảng quên thực phẩm đã cất

[P00157 | 9789:9972 | NORMAL_TEXT]
Bối cảnh và hành vi: Sinh viên, 20 tuổi, TP.HCM; sử dụng iPhone và laptop. Có kế hoạch mua thực phẩm cho 2–3 ngày nhưng thường chưa sơ chế ngay, cất vào tủ lạnh rồi trì hoãn sử dụng.

[P00158 | 9972:10105 | NORMAL_TEXT]
Khó khăn: Đồ đã cất dễ bị quên và chỉ được chú ý lại khi gần hết hạn. Việc nhập liệu và cập nhật lặp lại tạo thêm công việc quản lý.

[P00159 | 10105:10205 | NORMAL_TEXT]
Nhu cầu trọng tâm: Nhớ thực phẩm đang có, biết món cần ưu tiên và duy trì theo dõi với ít công sức.

[P00160 | 10205:10254 | NORMAL_TEXT]
Liên hệ BR: BR-01 và BR-04; hỗ trợ BR-02, BR-03.

[P00161 | 10254:10319 | HEADING_3]
P-02. Tôn Nữ Như Huyền — Điều chỉnh bữa ăn khi kế hoạch thay đổi

[P00162 | 10319:10520 | NORMAL_TEXT]
Bối cảnh và hành vi: Người phụ trách thực phẩm hộ gia đình, 49 tuổi, Đà Nẵng; sử dụng Android và laptop. Đi chợ thường xuyên, kiểm tra thực phẩm trước khi nấu và điều chỉnh bữa ăn theo lịch sinh hoạt.

[P00163 | 10520:10711 | NORMAL_TEXT]
Khó khăn: Kế hoạch thay đổi khiến nguyên liệu đã mua còn lại chưa dùng. Thông tin hạn dùng đơn thuần không giúp chọn việc nên làm tiếp; việc xem nhiều món và thao tác phức tạp tốn thời gian.

[P00164 | 10711:10849 | NORMAL_TEXT]
Nhu cầu trọng tâm: Biết nên ưu tiên thực phẩm nào và có đủ thông tin để quyết định cách sử dụng hoặc xử lý phù hợp khi kế hoạch thay đổi.

[P00165 | 10849:10896 | NORMAL_TEXT]
Liên hệ BR: BR-01, BR-02, BR-03; hỗ trợ BR-04.

[P00166 | 10896:10961 | HEADING_3]
P-03. Phạm Ngọc Thiên An — Duy trì thông tin thực phẩm chính xác

[P00167 | 10961:11147 | NORMAL_TEXT]
Bối cảnh và hành vi: Sinh viên, 20 tuổi, Đà Nẵng; sử dụng iPhone, Android và laptop. Thường kiểm tra, sắp xếp thực phẩm, xem những món còn lại trước khi mua và cập nhật sau khi sử dụng.

[P00168 | 11147:11328 | NORMAL_TEXT]
Khó khăn: Cập nhật từng món, nhập lại thông tin và nhiều bước thao tác làm việc duy trì dữ liệu trở nên mệt mỏi. Bỏ qua cập nhật khiến hồ sơ số lệch với thực tế và giảm độ tin cậy.

[P00169 | 11328:11456 | NORMAL_TEXT]
Nhu cầu trọng tâm: Giữ số lượng và tình trạng quản lý sát thực tế, cập nhật hoặc sửa sai thuận tiện, hạn chế công việc lặp lại.

[P00170 | 11456:11505 | NORMAL_TEXT]
Liên hệ BR: BR-04 và BR-03; hỗ trợ BR-01, BR-02.

[P00171 | 11505:11816 | NORMAL_TEXT]
Phạm vi sử dụng: Bối cảnh hộ gia đình của P-02 cho thấy người dùng quản lý thực phẩm phục vụ nhiều người; chưa xác nhận chức năng nhiều tài khoản cùng chia sẻ một kho. Persona không được dùng làm mô hình phân quyền. OCR, thông báo và xử lý hàng loạt là các phương án giải pháp cần được xác nhận ở phần phạm vi.

[P00172 | 11816:11846 | HEADING_2]
4.2. Stakeholder Requirements

[P00173 | 11846:12044 | NORMAL_TEXT]
Các yêu cầu sau diễn đạt nhu cầu của từng nhóm stakeholder ở mức cần đạt được, trước khi lựa chọn cách triển khai. SYS-SR-01 đến SYS-SR-05 thuộc ST-01; SYS-SR-06 thuộc ST-02; SYS-SR-07 thuộc ST-03.

[P00174 | 12044:12088 | HEADING_3]
SYS-SR-01. Nhận biết thực phẩm đang quản lý

[P00175 | 12088:12241 | NORMAL_TEXT]
Người dùng cần nhận biết thực phẩm đã mua và đang lưu trữ, kể cả khi sản phẩm nằm ngoài tầm nhìn, để không bỏ quên và biết món nào cần được chú ý trước.

[P00176 | 12241:12297 | NORMAL_TEXT]
Bên liên quan: ST-01. Căn cứ persona: P-01, P-02, P-03.

[P00177 | 12297:12334 | NORMAL_TEXT]
Phục vụ: BR-01, BR-03; hỗ trợ BR-04.

[P00178 | 12334:12379 | HEADING_3]
SYS-SR-02. Có thông tin để đưa ra quyết định

[P00179 | 12379:12576 | NORMAL_TEXT]
Người dùng cần hiểu thông tin hạn dùng, nguồn và giới hạn dữ liệu, đồng thời xác định được thực phẩm cần ưu tiên và lựa chọn cách sử dụng, kiểm tra hoặc xử lý phù hợp khi kế hoạch bữa ăn thay đổi.

[P00180 | 12576:12729 | NORMAL_TEXT]
Bên liên quan: ST-01. Căn cứ persona: P-02 là trọng tâm; P-01, P-03 cùng có nhu cầu biết món cần chú ý. Giới hạn dữ liệu kế thừa yêu cầu của bản đặc tả.

[P00181 | 12729:12759 | NORMAL_TEXT]
Phục vụ: BR-01, BR-02, BR-03.

[P00182 | 12759:12801 | HEADING_3]
SYS-SR-03. Giảm công sức cập nhật dữ liệu

[P00183 | 12801:12987 | NORMAL_TEXT]
Người dùng cần thêm, chỉnh sửa và cập nhật sau khi sử dụng hoặc loại bỏ thực phẩm với công sức hợp lý, để thông tin quản lý không lệch với thực tế vì thao tác lặp lại hoặc quá phức tạp.

[P00184 | 12987:13083 | NORMAL_TEXT]
Bên liên quan: ST-01. Căn cứ persona: P-01, P-02, P-03; trọng tâm công cập nhật lặp lại ở P-03.

[P00185 | 13083:13120 | NORMAL_TEXT]
Phục vụ: BR-04; hỗ trợ BR-01, BR-03.

[P00186 | 13120:13159 | HEADING_3]
SYS-SR-04. Nhận được thông báo phù hợp

[P00187 | 13159:13409 | NORMAL_TEXT]
Người dùng cần được đưa các thực phẩm dễ bỏ quên trở lại sự chú ý vào thời điểm phù hợp, đồng thời tránh bị làm phiền quá mức. Nếu triển khai thông báo, người dùng cần kiểm soát việc nhận nhắc nhở; nhu cầu này không tự xác định kênh hoặc cơ chế gửi.

[P00188 | 13409:13586 | NORMAL_TEXT]
Bên liên quan: ST-01. Căn cứ persona: P-01 về việc quên đồ đã cất và P-02 về nhắc nhở có ý nghĩa hành động. Khả năng kiểm soát thông báo là nhu cầu của bản đặc tả cần xác nhận.

[P00189 | 13586:13644 | NORMAL_TEXT]
Phục vụ: BR-01, BR-04. Giải pháp thông báo: Cần xác nhận.

[P00190 | 13644:13680 | HEADING_3]
SYS-SR-05. Bảo vệ thông tin quản lý

[P00191 | 13680:13836 | NORMAL_TEXT]
Người dùng cần thông tin quản lý của mình được bảo vệ khỏi việc xem hoặc chỉnh sửa bởi người không có quyền, để có thể tin cậy và duy trì sử dụng hệ thống.

[P00192 | 13836:13981 | NORMAL_TEXT]
Bên liên quan: ST-01. Căn cứ: yêu cầu bảo vệ dữ liệu trong bản đặc tả hiện có; không phải phát biểu được ghi nhận trực tiếp từ ba persona Canva.

[P00193 | 13981:14046 | NORMAL_TEXT]
Phục vụ: BR-04. Mô hình sở hữu và chia sẻ dữ liệu: Cần xác nhận.

[P00194 | 14046:14089 | HEADING_3]
SYS-SR-06. Đánh giá được hiệu quả hệ thống

[P00195 | 14089:14290 | NORMAL_TEXT]
Nhóm quản lý và đánh giá dự án cần thống nhất cách đánh giá các mục tiêu BR, phân biệt chức năng đã triển khai với lợi ích người dùng thực sự đạt được, và nhận biết phần nào còn thiếu căn cứ đo lường.

[P00196 | 14290:14391 | NORMAL_TEXT]
Bên liên quan: ST-02. Căn cứ: mục tiêu và trách nhiệm đánh giá dự án; không phải persona người dùng.

[P00197 | 14391:14417 | NORMAL_TEXT]
Phục vụ: BR-01 đến BR-04.

[P00198 | 14417:14468 | HEADING_3]
SYS-SR-07. Duy trì tính nhất quán trong phát triển

[P00199 | 14468:14643 | NORMAL_TEXT]
Nhóm phát triển và vận hành cần một bộ yêu cầu, thuật ngữ, quy tắc xử lý và điều kiện kiểm tra nhất quán để xây dựng, kiểm thử và duy trì hệ thống theo phạm vi đã thống nhất.

[P00200 | 14643:14740 | NORMAL_TEXT]
Bên liên quan: ST-03. Căn cứ: trách nhiệm phát triển và vận hành; không phải persona người dùng.

[P00201 | 14740:14794 | NORMAL_TEXT]
Phục vụ: BR-04; hỗ trợ việc thực hiện các BR còn lại.

[P00202 | 14794:14817 | HEADING_2]
4.3. User Requirements

[P00203 | 14817:15164 | NORMAL_TEXT]
Các User Requirements dưới đây cụ thể hóa nhu cầu của ST-01 để liên kết với Functional Requirements ở mục 6. Chúng thuộc cùng nhóm User (stakeholder) Requirements trong cách phân loại của slide, không tạo thêm một tầng yêu cầu bắt buộc. Nguồn persona và liên hệ SYS-SR/BR được nêu cho từng yêu cầu; những điểm suy ra từ bản đặc tả được ghi riêng.

[P00204 | 15164:15198 | HEADING_3]
UR-01. Theo dõi thực phẩm hiện có

[P00205 | 15198:15329 | NORMAL_TEXT]
Người dùng muốn biết thực phẩm đã mua và đang lưu trữ, tìm lại thông tin khi cần và nhận biết những món dễ bị bỏ quên sau khi cất.

[P00206 | 15329:15390 | NORMAL_TEXT]
Persona: P-01, P-02, P-03. Liên hệ: SYS-SR-01; BR-01, BR-03.

[P00207 | 15390:15432 | HEADING_3]
UR-02. Nhập thông tin sản phẩm thuận tiện

[P00208 | 15432:15580 | NORMAL_TEXT]
Người dùng muốn ghi nhận thực phẩm mới thuận tiện, hạn chế nhập lại thông tin và giảm sai sót mà không phải thêm nhiều công việc quản lý hằng ngày.

[P00209 | 15580:15634 | NORMAL_TEXT]
Persona: P-01, P-02, P-03. Liên hệ: SYS-SR-03; BR-04.

[P00210 | 15634:15676 | HEADING_3]
UR-03. Quản lý số lượng và vị trí lưu trữ

[P00211 | 15676:15794 | NORMAL_TEXT]
Người dùng muốn biết số lượng còn lại và vị trí lưu trữ để kiểm tra, sử dụng và tránh mua thêm khi vẫn còn thực phẩm.

[P00212 | 15794:15957 | NORMAL_TEXT]
Persona: P-03; hỗ trợ nhu cầu kiểm tra trước khi nấu của P-02. Số lượng và vị trí là chi tiết quản lý của bản đặc tả. Liên hệ: SYS-SR-01, SYS-SR-03; BR-03, BR-04.

[P00213 | 15957:15993 | HEADING_3]
UR-04. Nhận biết sản phẩm cần chú ý

[P00214 | 15993:16095 | NORMAL_TEXT]
Người dùng muốn biết những sản phẩm cần chú ý trước và hiểu lý do ưu tiên dựa trên thông tin hiện có.

[P00215 | 16095:16167 | NORMAL_TEXT]
Persona: P-01, P-02, P-03. Liên hệ: SYS-SR-01, SYS-SR-02; BR-01, BR-02.

[P00216 | 16167:16205 | HEADING_3]
UR-05. Có thông tin hỗ trợ quyết định

[P00217 | 16205:16385 | NORMAL_TEXT]
Người dùng muốn có đủ thông tin về thực phẩm đang có, mức độ cần chú ý và giới hạn dữ liệu để lựa chọn sử dụng, kiểm tra hoặc xử lý phù hợp, đặc biệt khi kế hoạch bữa ăn thay đổi.

[P00218 | 16385:16500 | NORMAL_TEXT]
Persona: P-02 là trọng tâm; P-01, P-03 có nhu cầu xác định món cần chú ý. Liên hệ: SYS-SR-02; BR-01, BR-02, BR-03.

[P00219 | 16500:16539 | HEADING_3]
UR-06. Nhận thông báo nhắc nhở phù hợp

[P00220 | 16539:16765 | NORMAL_TEXT]
Người dùng muốn những thực phẩm dễ bỏ quên được nhắc lại vào thời điểm thích hợp, với thông tin giúp xác định việc cần làm. Khi triển khai thông báo, người dùng muốn kiểm soát việc nhận nhắc nhở để tránh bị làm phiền quá mức.

[P00221 | 16765:16884 | NORMAL_TEXT]
Persona: P-01, P-02. Thiết lập kiểm soát thông báo kế thừa bản đặc tả, cần xác nhận. Liên hệ: SYS-SR-04; BR-01, BR-04.

[P00222 | 16884:16928 | HEADING_3]
UR-07. Cập nhật tình trạng sản phẩm dễ dàng

[P00223 | 16928:17078 | NORMAL_TEXT]
Người dùng muốn ghi nhận việc sử dụng, di chuyển, dùng hết, loại bỏ hoặc sửa sai thuận tiện để thông tin quản lý phản ánh những thay đổi đã xác nhận.

[P00224 | 17078:17198 | NORMAL_TEXT]
Persona: P-03 là trọng tâm; P-01, P-02 cùng gặp công sức nhập/cập nhật. Liên hệ: SYS-SR-03; BR-04; hỗ trợ BR-01, BR-03.

[P00225 | 17198:17232 | HEADING_3]
UR-08. Truy xuất thông tin đã lưu

[P00226 | 17232:17330 | NORMAL_TEXT]
Người dùng muốn xem lại thông tin đã lưu và các thay đổi liên quan khi cần kiểm tra hoặc sửa sai.

[P00227 | 17330:17519 | NORMAL_TEXT]
Persona: P-03 về kiểm tra và độ chính xác. Việc lưu lịch sử là cách đáp ứng được đề xuất trong bản đặc tả, không phải tính năng được persona xác nhận. Liên hệ: SYS-SR-01, SYS-SR-03; BR-04.

[P00228 | 17519:17561 | HEADING_3]
UR-09. Sử dụng giao diện rõ ràng, dễ hiểu

[P00229 | 17561:17705 | NORMAL_TEXT]
Người dùng muốn thông tin dễ đọc, chức năng dễ nhận biết và thao tác dễ hiểu trên thiết bị sử dụng, để việc quản lý không trở nên quá phức tạp.

[P00230 | 17705:17818 | NORMAL_TEXT]
Persona: P-02 về thao tác dễ hiểu; P-01, P-03 về giảm công quản lý. Liên hệ: SYS-SR-02, SYS-SR-03; BR-02, BR-04.

[P00231 | 17818:17860 | HEADING_3]
UR-10. Nhận biết độ tin cậy của thông tin

[P00232 | 17860:18017 | NORMAL_TEXT]
Người dùng muốn phân biệt thông tin đã xác nhận, thông tin ước tính và thông tin còn thiếu, đồng thời biết kết quả cập nhật đã được lưu thành công hay chưa.

[P00233 | 18017:18220 | NORMAL_TEXT]
Căn cứ: yêu cầu về giới hạn dữ liệu và kết quả lưu trong bản đặc tả; hỗ trợ nhu cầu tin cậy thông tin của P-03 nhưng không phải phát biểu trực tiếp từ Canva. Liên hệ: SYS-SR-02, SYS-SR-03; BR-02, BR-04.

[P00234 | 18220:18263 | HEADING_1]
5. Phạm vi hệ thống và phân loại tính năng

[P00235 | 18263:18288 | HEADING_2]
5.1. Định hướng hệ thống

[P00236 | 18288:18375 | NORMAL_TEXT]
Expiry Things hướng tới khả năng quản lý vòng đời nhiều loại sản phẩm trong tương lai.

[P00237 | 18375:18518 | NORMAL_TEXT]
Tuy nhiên, thực phẩm, mỹ phẩm, thuốc và sản phẩm bảo hành không nhất thiết có cùng quy tắc xác định hạn dùng, trạng thái hoặc hành động xử lý.

[P00238 | 18518:18617 | NORMAL_TEXT]
Do đó, hệ thống cần phân biệt giữa định hướng mở rộng và phạm vi thực tế của phiên bản triển khai.

[P00239 | 18617:18642 | HEADING_2]
5.2. Phạm vi MVP đề xuất

[P00240 | 18645:18648 | NORMAL_TEXT | TABLE row=0 col=0]
Mã

[P00241 | 18649:18659 | NORMAL_TEXT | TABLE row=0 col=1]
Tính năng

[P00242 | 18660:18670 | NORMAL_TEXT | TABLE row=0 col=2]
Phân loại

[P00243 | 18672:18680 | NORMAL_TEXT | TABLE row=1 col=0]
FEAT-01

[P00244 | 18681:18715 | NORMAL_TEXT | TABLE row=1 col=1]
Nhập thông tin thực phẩm thủ công

[P00245 | 18716:18724 | NORMAL_TEXT | TABLE row=1 col=2]
Cốt lõi

[P00246 | 18726:18734 | NORMAL_TEXT | TABLE row=2 col=0]
FEAT-02

[P00247 | 18735:18781 | NORMAL_TEXT | TABLE row=2 col=1]
Quản lý danh sách, số lượng và vị trí lưu trữ

[P00248 | 18782:18790 | NORMAL_TEXT | TABLE row=2 col=2]
Cốt lõi

[P00249 | 18792:18800 | NORMAL_TEXT | TABLE row=3 col=0]
FEAT-03

[P00250 | 18801:18837 | NORMAL_TEXT | TABLE row=3 col=1]
Theo dõi hạn dùng và mức độ ưu tiên

[P00251 | 18838:18846 | NORMAL_TEXT | TABLE row=3 col=2]
Cốt lõi

[P00252 | 18848:18856 | NORMAL_TEXT | TABLE row=4 col=0]
FEAT-04

[P00253 | 18857:18897 | NORMAL_TEXT | TABLE row=4 col=1]
Cập nhật hành động sử dụng hoặc loại bỏ

[P00254 | 18898:18906 | NORMAL_TEXT | TABLE row=4 col=2]
Cốt lõi

[P00255 | 18908:18916 | NORMAL_TEXT | TABLE row=5 col=0]
FEAT-05

[P00256 | 18917:18957 | NORMAL_TEXT | TABLE row=5 col=1]
Hiển thị thông tin và hỗ trợ quyết định

[P00257 | 18958:18966 | NORMAL_TEXT | TABLE row=5 col=2]
Cốt lõi

[P00258 | 18968:18976 | NORMAL_TEXT | TABLE row=6 col=0]
FEAT-06

[P00259 | 18977:19004 | NORMAL_TEXT | TABLE row=6 col=1]
Thiết lập và gửi thông báo

[P00260 | 19005:19018 | NORMAL_TEXT | TABLE row=6 col=2]
Cần xác nhận

[P00261 | 19020:19028 | NORMAL_TEXT | TABLE row=7 col=0]
FEAT-07

[P00262 | 19029:19061 | NORMAL_TEXT | TABLE row=7 col=1]
Nhập liệu bằng OCR hoặc mã vạch

[P00263 | 19062:19075 | NORMAL_TEXT | TABLE row=7 col=2]
Cần xác nhận

[P00264 | 19077:19085 | NORMAL_TEXT | TABLE row=8 col=0]
FEAT-08

[P00265 | 19086:19126 | NORMAL_TEXT | TABLE row=8 col=1]
Xử lý nhiều sản phẩm trong một thao tác

[P00266 | 19127:19145 | NORMAL_TEXT | TABLE row=8 col=2]
Tính năng đề xuất

[P00267 | 19147:19155 | NORMAL_TEXT | TABLE row=9 col=0]
FEAT-09

[P00268 | 19156:19185 | NORMAL_TEXT | TABLE row=9 col=1]
Quản lý chứng từ và bảo hành

[P00269 | 19186:19212 | NORMAL_TEXT | TABLE row=9 col=2]
Chưa triển khai trong MVP

[P00270 | 19214:19222 | NORMAL_TEXT | TABLE row=10 col=0]
FEAT-10

[P00271 | 19223:19255 | NORMAL_TEXT | TABLE row=10 col=1]
Quản lý vòng đời mỹ phẩm, thuốc

[P00272 | 19256:19282 | NORMAL_TEXT | TABLE row=10 col=2]
Chưa triển khai trong MVP

[P00273 | 19283:19335 | NORMAL_TEXT]
Cốt lõi: Đề xuất thuộc phạm vi triển khai đầu tiên.

[P00274 | 19335:19415 | NORMAL_TEXT]
Cần xác nhận: Chưa có quyết định cuối cùng về tính khả thi hoặc mức độ ưu tiên.

[P00275 | 19415:19482 | NORMAL_TEXT]
Chưa triển khai: Không được mặc định là một phần của MVP hiện tại.

[P00276 | 19482:19785 | NORMAL_TEXT]
Nhu cầu nhập, xem và cập nhật với công sức hợp lý thuộc các chức năng cốt lõi phục vụ ba persona. Thao tác thuận tiện trên từng sản phẩm được đáp ứng qua FR-01, FR-03, FR-08 và NFR-04. Xử lý hàng loạt (FEAT-08/FR-15), OCR và thông báo gửi ngoài ứng dụng là các phương án cần đánh giá và xác nhận riêng.

[P00277 | 19785:19816 | HEADING_2]
5.3. Ngoài phạm vi MVP đề xuất

[P00278 | 19816:19851 | NORMAL_TEXT | LIST id=kix.cwzyv3hkk5i6 level=0]
Quản lý yêu cầu bảo hành thiết bị.

[P00279 | 19851:19896 | NORMAL_TEXT | LIST id=kix.cwzyv3hkk5i6 level=0]
Quản lý thời hạn sử dụng mỹ phẩm sau mở nắp.

[P00280 | 19896:19938 | NORMAL_TEXT | LIST id=kix.cwzyv3hkk5i6 level=0]
Đưa ra quyết định an toàn và xử lý thuốc.

[P00281 | 19938:19988 | NORMAL_TEXT | LIST id=kix.cwzyv3hkk5i6 level=0]
Tự động xác định chất lượng vật lý của thực phẩm.

[P00282 | 19988:20051 | NORMAL_TEXT | LIST id=kix.cwzyv3hkk5i6 level=0]
Tự động xác nhận người dùng đã tiêu thụ hoặc loại bỏ sản phẩm.

[P00283 | 20051:20086 | NORMAL_TEXT | LIST id=kix.cwzyv3hkk5i6 level=0]
Cam kết an toàn thực phẩm bằng AI.

[P00284 | 20086:20153 | NORMAL_TEXT | LIST id=kix.cwzyv3hkk5i6 level=0]
Tự động cá nhân hóa quy tắc vòng đời khi chưa có dữ liệu xác thực.

[P00285 | 20153:20196 | HEADING_2]
5.4. Hướng thiết kế prototype theo persona

[P00286 | 20196:20374 | NORMAL_TEXT]
P-01: Đưa thực phẩm cần chú ý trở lại tầm nhìn khi mở ứng dụng; hỗ trợ đường nhập thủ công với dữ liệu tối thiểu và cho phép ngày chưa biết. Dữ liệu tùy chọn có thể bổ sung sau.

[P00287 | 20374:20577 | NORMAL_TEXT]
P-02: Hiển thị lý do ưu tiên, số lượng, vị trí và giới hạn thông tin; giúp chọn bước tiếp theo khi kế hoạch thay đổi. Trường hợp thiếu ngày hoặc đã qua mốc theo dõi phải có đường kiểm tra lại thông tin.

[P00288 | 20577:20754 | NORMAL_TEXT]
P-03: Cho phép bắt đầu ghi nhận sử dụng, loại bỏ hoặc sửa số lượng từ ngữ cảnh đang quản lý, giảm việc điều hướng lặp lại. Mọi thay đổi vẫn cần xác nhận rõ và phản hồi kết quả.

[P00289 | 20754:21011 | NORMAL_TEXT]
Prototype dùng một hệ thống chung cho ba kiểu nhu cầu; người dùng không cần chọn persona để mở chức năng. Những đường tương tác này minh họa phạm vi cốt lõi, chưa xác nhận tính năng hàng loạt, OCR, thông báo đẩy, kho dùng chung hoặc hiệu quả giảm lãng phí.

[P00290 | 21011:21058 | HEADING_1]
6. Functional Requirements — Yêu cầu chức năng

[P00291 | 21058:21091 | HEADING_2]
6.1. Quản lý thông tin thực phẩm

[P00292 | 21091:21132 | HEADING_3]
FR-01. Nhập thông tin thực phẩm thủ công

[P00293 | 21132:21141 | NORMAL_TEXT]
Yêu cầu:

[P00294 | 21141:21394 | NORMAL_TEXT]
Hệ thống phải cho phép người dùng có quyền tạo hồ sơ thực phẩm bằng dữ liệu tối thiểu đã thống nhất, với đường nhập thủ công rõ ràng. Người dùng phải có thể hoàn tất việc ghi nhận khi thông tin tùy chọn chưa có; giá trị chưa biết được giữ đúng ý nghĩa.

[P00295 | 21394:21414 | NORMAL_TEXT]
Điều kiện kiểm tra:

[P00296 | 21414:21450 | NORMAL_TEXT | LIST id=kix.4qb9o1qu667j level=0]
Dữ liệu hợp lệ được lưu thành công.

[P00297 | 21450:21485 | NORMAL_TEXT | LIST id=kix.4qb9o1qu667j level=0]
Có thể truy xuất lại hồ sơ đã tạo.

[P00298 | 21485:21547 | NORMAL_TEXT | LIST id=kix.4qb9o1qu667j level=0]
Thông tin chưa biết được thể hiện rõ, không tự động suy đoán.

[P00299 | 21547:21588 | NORMAL_TEXT]
Phục vụ: UR-02, UR-10; SYS-SR-03; BR-04.

[P00300 | 21588:21625 | NORMAL_TEXT]
Persona liên quan: P-01, P-02, P-03.

[P00301 | 21625:21646 | NORMAL_TEXT]
Trạng thái: Cốt lõi.

[P00302 | 21646:21683 | HEADING_3]
FR-02. Truy xuất danh sách thực phẩm

[P00303 | 21683:21692 | NORMAL_TEXT]
Yêu cầu:

[P00304 | 21692:21826 | NORMAL_TEXT]
Hệ thống phải cho phép người dùng xem danh sách thực phẩm đã lưu và các thông tin liên quan như số lượng, vị trí lưu trữ và hạn dùng.

[P00305 | 21826:21846 | NORMAL_TEXT]
Điều kiện kiểm tra:

[P00306 | 21846:21880 | NORMAL_TEXT | LIST id=kix.oattd83w25o1 level=0]
Có thể tìm và mở hồ sơ thực phẩm.

[P00307 | 21880:21927 | NORMAL_TEXT | LIST id=kix.oattd83w25o1 level=0]
Thông tin hiển thị phù hợp với dữ liệu đã lưu.

[P00308 | 21927:22000 | NORMAL_TEXT | LIST id=kix.oattd83w25o1 level=0]
Không hiển thị dữ liệu thuộc phạm vi người dùng không có quyền truy cập.

[P00309 | 22000:22055 | NORMAL_TEXT]
Phục vụ: UR-01, UR-03, UR-08; SYS-SR-01; BR-01, BR-03.

[P00310 | 22055:22092 | NORMAL_TEXT]
Persona liên quan: P-01, P-02, P-03.

[P00311 | 22092:22113 | NORMAL_TEXT]
Trạng thái: Cốt lõi.

[P00312 | 22113:22149 | HEADING_3]
FR-03. Cập nhật thông tin thực phẩm

[P00313 | 22149:22158 | NORMAL_TEXT]
Yêu cầu:

[P00314 | 22158:22279 | NORMAL_TEXT]
Hệ thống phải cho phép người dùng chỉnh sửa thông tin sản phẩm, số lượng và vị trí lưu trữ trong phạm vi được cấp quyền.

[P00315 | 22279:22299 | NORMAL_TEXT]
Điều kiện kiểm tra:

[P00316 | 22299:22330 | NORMAL_TEXT | LIST id=kix.r7yqwioii8uf level=0]
Chấp nhận các thay đổi hợp lệ.

[P00317 | 22330:22373 | NORMAL_TEXT | LIST id=kix.r7yqwioii8uf level=0]
Từ chối dữ liệu không phù hợp với quy tắc.

[P00318 | 22373:22414 | NORMAL_TEXT | LIST id=kix.r7yqwioii8uf level=0]
Dữ liệu sau cập nhật được lưu nhất quán.

[P00319 | 22414:22462 | NORMAL_TEXT]
Phục vụ: UR-03, UR-07; SYS-SR-03; BR-03, BR-04.

[P00320 | 22462:22506 | NORMAL_TEXT]
Persona liên quan: P-03; hỗ trợ P-01, P-02.

[P00321 | 22506:22527 | NORMAL_TEXT]
Trạng thái: Cốt lõi.

[P00322 | 22527:22559 | HEADING_2]
6.2. Quản lý thông tin vòng đời

[P00323 | 22559:22593 | HEADING_3]
FR-04. Quản lý thông tin hạn dùng

[P00324 | 22593:22602 | NORMAL_TEXT]
Yêu cầu:

[P00325 | 22602:22723 | NORMAL_TEXT]
Hệ thống phải ghi nhận các thông tin liên quan đến hạn dùng và phân biệt nguồn gốc cũng như mức độ xác nhận của dữ liệu.

[P00326 | 22723:22743 | NORMAL_TEXT]
Điều kiện kiểm tra:

[P00327 | 22743:22799 | NORMAL_TEXT | LIST id=kix.cy3qh760qscj level=0]
Phân biệt thông tin đã xác nhận, ước tính và chưa biết.

[P00328 | 22799:22852 | NORMAL_TEXT | LIST id=kix.cy3qh760qscj level=0]
Không tự động coi thông tin thiếu là dữ liệu hợp lệ.

[P00329 | 22852:22905 | NORMAL_TEXT | LIST id=kix.cy3qh760qscj level=0]
Giữ đúng ý nghĩa của từng loại thông tin ngày tháng.

[P00330 | 22905:22953 | NORMAL_TEXT]
Phục vụ: UR-04, UR-05, UR-10; SYS-SR-02; BR-02.

[P00331 | 22953:22990 | NORMAL_TEXT]
Persona liên quan: P-01, P-02, P-03.

[P00332 | 22990:23011 | NORMAL_TEXT]
Trạng thái: Cốt lõi.

[P00333 | 23011:23047 | HEADING_3]
FR-05. Đánh giá trạng thái vòng đời

[P00334 | 23047:23056 | NORMAL_TEXT]
Yêu cầu:

[P00335 | 23056:23191 | NORMAL_TEXT]
Hệ thống phải đánh giá mức độ cần chú ý của thực phẩm dựa trên dữ liệu đã ghi nhận, thời gian hiện tại và các quy tắc được thống nhất.

[P00336 | 23191:23211 | NORMAL_TEXT]
Điều kiện kiểm tra:

[P00337 | 23211:23269 | NORMAL_TEXT | LIST id=kix.b4ggcge0i65t level=0]
Dữ liệu giống nhau và cùng quy tắc cho kết quả nhất quán.

[P00338 | 23269:23313 | NORMAL_TEXT | LIST id=kix.b4ggcge0i65t level=0]
Xử lý đúng các trường hợp gần mốc hạn dùng.

[P00339 | 23313:23355 | NORMAL_TEXT | LIST id=kix.b4ggcge0i65t level=0]
Thể hiện rõ khi thiếu căn cứ để đánh giá.

[P00340 | 23355:23414 | NORMAL_TEXT]
Phục vụ: UR-04, UR-10; SYS-SR-01, SYS-SR-02; BR-01, BR-02.

[P00341 | 23414:23451 | NORMAL_TEXT]
Persona liên quan: P-01, P-02, P-03.

[P00342 | 23451:23472 | NORMAL_TEXT]
Trạng thái: Cốt lõi.

[P00343 | 23472:23507 | HEADING_3]
FR-06. Ưu tiên thực phẩm cần chú ý

[P00344 | 23507:23516 | NORMAL_TEXT]
Yêu cầu:

[P00345 | 23516:23711 | NORMAL_TEXT]
Hệ thống phải trình bày sản phẩm cần được xem xét cùng lý do ưu tiên và thông tin giúp nhận biết lại món đã lưu. Các nhóm cần ưu tiên theo ngày và nhóm thiếu căn cứ đánh giá phải được phân biệt.

[P00346 | 23711:23731 | NORMAL_TEXT]
Điều kiện kiểm tra:

[P00347 | 23731:23781 | NORMAL_TEXT | LIST id=kix.2zfh8jlr56sa level=0]
Sản phẩm được phân loại theo quy tắc đã xác định.

[P00348 | 23781:23925 | NORMAL_TEXT | LIST id=kix.2zfh8jlr56sa level=0]
Người dùng nhận biết được món nào cần chú ý và vì sao; bộ lọc trên danh sách ưu tiên phải thực sự giới hạn các sản phẩm hiển thị theo lựa chọn.

[P00349 | 23925:23998 | NORMAL_TEXT | LIST id=kix.2zfh8jlr56sa level=0]
Không sử dụng màu sắc làm phương tiện duy nhất để truyền đạt trạng thái.

[P00350 | 23998:24064 | NORMAL_TEXT]
Phục vụ: UR-01, UR-04, UR-05; SYS-SR-01, SYS-SR-02; BR-01, BR-02.

[P00351 | 24064:24101 | NORMAL_TEXT]
Persona liên quan: P-01, P-02, P-03.

[P00352 | 24101:24122 | NORMAL_TEXT]
Trạng thái: Cốt lõi.

[P00353 | 24122:24153 | HEADING_3]
FR-07. Hỗ trợ quyết định xử lý

[P00354 | 24153:24162 | NORMAL_TEXT]
Yêu cầu:

[P00355 | 24162:24356 | NORMAL_TEXT]
Hệ thống phải cung cấp thông tin về thực phẩm đang có, lý do ưu tiên, dữ liệu còn thiếu và những hành động được hỗ trợ để người dùng lựa chọn bước tiếp theo, kể cả khi kế hoạch bữa ăn thay đổi.

[P00356 | 24356:24615 | NORMAL_TEXT]
Khi chưa đủ căn cứ, hệ thống phải nêu giới hạn thông tin và hỗ trợ kiểm tra hoặc chỉnh sửa. Các nhãn và hành động không được diễn đạt rằng sản phẩm chắc chắn sẵn sàng hoặc an toàn để sử dụng. Chức năng này chưa bao gồm tự động lập thực đơn hay tạo công thức.

[P00357 | 24615:24635 | NORMAL_TEXT]
Điều kiện kiểm tra:

[P00358 | 24635:24679 | NORMAL_TEXT | LIST id=kix.rnpd61jkuv4 level=0]
Hiển thị các hành động phù hợp với quy tắc.

[P00359 | 24679:24729 | NORMAL_TEXT | LIST id=kix.rnpd61jkuv4 level=0]
Không đưa ra khẳng định an toàn khi thiếu căn cứ.

[P00360 | 24729:24771 | NORMAL_TEXT | LIST id=kix.rnpd61jkuv4 level=0]
Thông tin chưa xác nhận được thể hiện rõ.

[P00361 | 24771:24826 | NORMAL_TEXT]
Phục vụ: UR-05, UR-10; SYS-SR-02; BR-01, BR-02, BR-03.

[P00362 | 24826:24870 | NORMAL_TEXT]
Persona liên quan: P-02; hỗ trợ P-01, P-03.

[P00363 | 24870:24891 | NORMAL_TEXT]
Trạng thái: Cốt lõi.

[P00364 | 24891:24939 | HEADING_2]
6.3. Cập nhật thay đổi giữa thực tế và hệ thống

[P00365 | 24939:24980 | HEADING_3]
FR-08. Ghi nhận hành động của người dùng

[P00366 | 24980:24989 | NORMAL_TEXT]
Yêu cầu:

[P00367 | 24989:25197 | NORMAL_TEXT]
Hệ thống phải cho phép người dùng bắt đầu và xác nhận các hành động sử dụng, di chuyển, dùng hết hoặc loại bỏ thực phẩm từ ngữ cảnh quản lý phù hợp, đồng thời phân biệt các hành động này với sửa sai dữ liệu.

[P00368 | 25197:25256 | NORMAL_TEXT]
Chỉ những hành động được chấp nhận mới làm thay đổi hồ sơ.

[P00369 | 25256:25276 | NORMAL_TEXT]
Điều kiện kiểm tra:

[P00370 | 25276:25317 | NORMAL_TEXT | LIST id=kix.29amtljpl9xj level=0]
Hành động hợp lệ cập nhật đúng sản phẩm.

[P00371 | 25317:25375 | NORMAL_TEXT | LIST id=kix.29amtljpl9xj level=0]
Hành động bị hủy hoặc từ chối không làm thay đổi dữ liệu.

[P00372 | 25375:25566 | NORMAL_TEXT | LIST id=kix.29amtljpl9xj level=0]
Kết quả cập nhật phải cho biết thông tin sau thao tác; việc hủy giữ nguyên dữ liệu. Công sức thực hiện được đánh giá bằng tác vụ ở mục 13 thay vì mặc định một số bước hoặc thời gian chưa đo.

[P00373 | 25566:25621 | NORMAL_TEXT]
Phục vụ: UR-03, UR-07; SYS-SR-03; BR-01, BR-03, BR-04.

[P00374 | 25621:25665 | NORMAL_TEXT]
Persona liên quan: P-03; hỗ trợ P-01, P-02.

[P00375 | 25665:25686 | NORMAL_TEXT]
Trạng thái: Cốt lõi.

[P00376 | 25686:25725 | HEADING_3]
FR-09. Hoàn tất và đóng hồ sơ sản phẩm

[P00377 | 25725:25734 | NORMAL_TEXT]
Yêu cầu:

[P00378 | 25734:25886 | NORMAL_TEXT]
Hệ thống phải phân biệt việc sửa thông tin sai với việc ghi nhận sản phẩm đã được sử dụng hết, loại bỏ hoặc không còn thuộc danh sách quản lý hiện tại.

[P00379 | 25886:25906 | NORMAL_TEXT]
Điều kiện kiểm tra:

[P00380 | 25906:25970 | NORMAL_TEXT | LIST id=kix.t9mt6rj5682u level=0]
Hồ sơ đã đóng không tiếp tục được xem là sản phẩm đang sử dụng.

[P00381 | 25970:26013 | NORMAL_TEXT | LIST id=kix.t9mt6rj5682u level=0]
Lịch sử được duy trì theo quy tắc lưu trữ.

[P00382 | 26013:26076 | NORMAL_TEXT | LIST id=kix.t9mt6rj5682u level=0]
Việc khôi phục, nếu được hỗ trợ, phải tuân theo quy tắc riêng.

[P00383 | 26076:26117 | NORMAL_TEXT]
Phục vụ: UR-07, UR-08; SYS-SR-03; BR-04.

[P00384 | 26117:26142 | NORMAL_TEXT]
Persona liên quan: P-03.

[P00385 | 26142:26205 | NORMAL_TEXT]
Trạng thái: Cốt lõi; chưa chốt quy tắc lưu trữ và xóa dữ liệu.

[P00386 | 26205:26254 | HEADING_3]
FR-10. Chỉnh sửa và khôi phục thao tác nhập liệu

[P00387 | 26254:26263 | NORMAL_TEXT]
Yêu cầu:

[P00388 | 26263:26351 | NORMAL_TEXT]
Hệ thống phải cho phép người dùng chỉnh sửa thông tin không chính xác hoặc chưa đầy đủ.

[P00389 | 26351:26452 | NORMAL_TEXT]
Khi chức năng nhập liệu tự động gặp lỗi, người dùng vẫn có thể nhập và chỉnh sửa thông tin thủ công.

[P00390 | 26452:26472 | NORMAL_TEXT]
Điều kiện kiểm tra:

[P00391 | 26472:26508 | NORMAL_TEXT | LIST id=kix.aeokok6r6q76 level=0]
Có thể sửa dữ liệu không chính xác.

[P00392 | 26508:26569 | NORMAL_TEXT | LIST id=kix.aeokok6r6q76 level=0]
Lỗi OCR hoặc mã vạch không làm gián đoạn chức năng nhập tay.

[P00393 | 26569:26610 | NORMAL_TEXT | LIST id=kix.aeokok6r6q76 level=0]
Dữ liệu sửa được kiểm tra trước khi lưu.

[P00394 | 26610:26658 | NORMAL_TEXT]
Phục vụ: UR-02, UR-07, UR-10; SYS-SR-03; BR-04.

[P00395 | 26658:26695 | NORMAL_TEXT]
Persona liên quan: P-01, P-02, P-03.

[P00396 | 26695:26716 | NORMAL_TEXT]
Trạng thái: Cốt lõi.

[P00397 | 26716:26748 | HEADING_3]
FR-11. Kiểm soát quyền truy cập

[P00398 | 26748:26757 | NORMAL_TEXT]
Yêu cầu:

[P00399 | 26757:26841 | NORMAL_TEXT]
Hệ thống phải kiểm tra quyền trước khi cho phép người dùng xem hoặc thay đổi hồ sơ.

[P00400 | 26841:26861 | NORMAL_TEXT]
Điều kiện kiểm tra:

[P00401 | 26861:26908 | NORMAL_TEXT | LIST id=kix.cqfz75styjd level=0]
Người dùng không có quyền bị từ chối truy cập.

[P00402 | 26908:26976 | NORMAL_TEXT | LIST id=kix.cqfz75styjd level=0]
Người dùng hợp lệ có thể thực hiện thao tác trong phạm vi được cấp.

[P00403 | 26976:27048 | NORMAL_TEXT | LIST id=kix.cqfz75styjd level=0]
Việc quản lý quyền tuân theo mô hình sở hữu dữ liệu đã được thống nhất.

[P00404 | 27048:27082 | NORMAL_TEXT]
Phục vụ: SYS-SR-05; ST-01; BR-04.

[P00405 | 27082:27166 | NORMAL_TEXT]
Căn cứ bảo vệ dữ liệu: bản đặc tả; không suy từ các đặc điểm nhân khẩu của persona.

[P00406 | 27166:27235 | NORMAL_TEXT]
Trạng thái: Cốt lõi; mô hình chia sẻ hộ gia đình chưa được xác nhận.

[P00407 | 27235:27259 | HEADING_2]
6.4. Thông báo nhắc nhở

[P00408 | 27259:27286 | HEADING_3]
FR-12. Thiết lập thông báo

[P00409 | 27286:27295 | NORMAL_TEXT]
Yêu cầu:

[P00410 | 27295:27479 | NORMAL_TEXT]
Khi tính năng thông báo được triển khai, hệ thống phải cho phép người dùng quản lý các tùy chọn nhắc nhở được hỗ trợ, bao gồm bật/tắt và các thiết lập thời điểm hoặc tần suất phù hợp.

[P00411 | 27479:27499 | NORMAL_TEXT]
Điều kiện kiểm tra:

[P00412 | 27499:27526 | NORMAL_TEXT | LIST id=kix.ujzzboobjmrx level=0]
Thiết lập hợp lệ được lưu.

[P00413 | 27526:27577 | NORMAL_TEXT | LIST id=kix.ujzzboobjmrx level=0]
Các thông báo tiếp theo áp dụng cấu hình hiện tại.

[P00414 | 27577:27618 | NORMAL_TEXT]
Phục vụ: UR-06; SYS-SR-04; BR-01, BR-04.

[P00415 | 27618:27649 | NORMAL_TEXT]
Persona liên quan: P-01, P-02.

[P00416 | 27649:27675 | NORMAL_TEXT]
Trạng thái: Cần xác nhận.

[P00417 | 27675:27708 | HEADING_3]
FR-13. Lập lịch và gửi thông báo

[P00418 | 27708:27717 | NORMAL_TEXT]
Yêu cầu:

[P00419 | 27717:27876 | NORMAL_TEXT]
Hệ thống phải tạo và gửi yêu cầu thông báo dựa trên dữ liệu thực phẩm hiện tại, quy tắc nhắc nhở và cấu hình của người dùng khi tính năng này được triển khai.

[P00420 | 27876:27896 | NORMAL_TEXT]
Điều kiện kiểm tra:

[P00421 | 27896:27929 | NORMAL_TEXT | LIST id=kix.52oaa2wgaa5x level=0]
Thông báo được tạo theo quy tắc.

[P00422 | 27929:27959 | NORMAL_TEXT | LIST id=kix.52oaa2wgaa5x level=0]
Hạn chế việc xử lý trùng lặp.

[P00423 | 27959:28042 | NORMAL_TEXT | LIST id=kix.52oaa2wgaa5x level=0]
Phân biệt trạng thái lập lịch, gửi và các kết quả được dịch vụ thông báo phản hồi.

[P00424 | 28042:28130 | NORMAL_TEXT | LIST id=kix.52oaa2wgaa5x level=0]
Không tự động xác nhận sản phẩm đã được sử dụng chỉ vì thông báo đã được gửi hoặc đóng.

[P00425 | 28130:28171 | NORMAL_TEXT]
Phục vụ: UR-04, UR-06; SYS-SR-04; BR-01.

[P00426 | 28171:28202 | NORMAL_TEXT]
Persona liên quan: P-01, P-02.

[P00427 | 28202:28228 | NORMAL_TEXT]
Trạng thái: Cần xác nhận.

[P00428 | 28228:28268 | HEADING_2]
6.5. Hỗ trợ nhập liệu và thao tác nhanh

[P00429 | 28268:28324 | HEADING_3]
FR-14. Hỗ trợ nhập thông tin bằng hình ảnh hoặc mã vạch

[P00430 | 28324:28333 | NORMAL_TEXT]
Yêu cầu:

[P00431 | 28333:28525 | NORMAL_TEXT]
Nếu chức năng OCR hoặc quét mã vạch được triển khai, hệ thống phải cho phép tiếp nhận thông tin nhận dạng và hiển thị các dữ liệu được đề xuất để người dùng kiểm tra, chỉnh sửa hoặc xác nhận.

[P00432 | 28525:28545 | NORMAL_TEXT]
Điều kiện kiểm tra:

[P00433 | 28545:28607 | NORMAL_TEXT | LIST id=kix.pllp4pjave4e level=0]
Dữ liệu nhận dạng không tự động ghi đè thông tin đã xác nhận.

[P00434 | 28607:28644 | NORMAL_TEXT | LIST id=kix.pllp4pjave4e level=0]
Người dùng có thể sửa thông tin sai.

[P00435 | 28644:28703 | NORMAL_TEXT | LIST id=kix.pllp4pjave4e level=0]
Không làm mất dữ liệu nhập tay khi xử lý tự động thất bại.

[P00436 | 28703:28744 | NORMAL_TEXT]
Phục vụ: UR-02, UR-10; SYS-SR-03; BR-04.

[P00437 | 28744:28856 | NORMAL_TEXT]
Phương án hỗ trợ nhập liệu cần xác nhận; nhu cầu giảm công nhập không tự chứng minh phải dùng OCR hoặc mã vạch.

[P00438 | 28856:28882 | NORMAL_TEXT]
Trạng thái: Cần xác nhận.

[P00439 | 28882:28929 | HEADING_3]
FR-15. Xử lý nhiều sản phẩm trong một thao tác

[P00440 | 28929:28938 | NORMAL_TEXT]
Yêu cầu:

[P00441 | 28938:29168 | NORMAL_TEXT]
Nếu được phê duyệt, hệ thống phải cho phép lựa chọn nhiều sản phẩm và áp dụng một hành động quản lý được hỗ trợ cho đúng những sản phẩm đã chọn. Chức năng này không thay thế yêu cầu làm rõ và giảm công sức cập nhật từng sản phẩm.

[P00442 | 29168:29188 | NORMAL_TEXT]
Điều kiện kiểm tra:

[P00443 | 29188:29241 | NORMAL_TEXT | LIST id=kix.neon9n5b5u25 level=0]
Thao tác chỉ ảnh hưởng tới những sản phẩm được chọn.

[P00444 | 29241:29381 | NORMAL_TEXT | LIST id=kix.neon9n5b5u25 level=0]
Kết quả và lỗi của từng sản phẩm phải được thể hiện rõ; hành động bị hủy không thay đổi dữ liệu và việc sửa sai tuân theo quy tắc cập nhật.

[P00445 | 29381:29415 | NORMAL_TEXT]
Phục vụ: UR-07; SYS-SR-03; BR-04.

[P00446 | 29415:29529 | NORMAL_TEXT]
Phương án hàng loạt cần xác nhận; nhu cầu cập nhật thuận tiện của P-03 vẫn thuộc chức năng từng sản phẩm cốt lõi.

[P00447 | 29529:29560 | NORMAL_TEXT]
Trạng thái: Tính năng đề xuất.

[P00448 | 29560:29585 | HEADING_2]
6.6. Lịch sử và phản hồi

[P00449 | 29585:29626 | HEADING_3]
FR-16. Lưu và truy xuất lịch sử thay đổi

[P00450 | 29626:29635 | NORMAL_TEXT]
Yêu cầu:

[P00451 | 29635:29776 | NORMAL_TEXT]
Hệ thống phải lưu lại những thay đổi đã được chấp nhận khi cần thiết để người dùng có thể kiểm tra thông tin và trạng thái quản lý sản phẩm.

[P00452 | 29776:29796 | NORMAL_TEXT]
Điều kiện kiểm tra:

[P00453 | 29796:29857 | NORMAL_TEXT | LIST id=kix.ew9xgwphqrv4 level=0]
Có thể phân biệt dữ liệu hiện tại với các thay đổi trước đó.

[P00454 | 29857:29918 | NORMAL_TEXT | LIST id=kix.ew9xgwphqrv4 level=0]
Lịch sử phản ánh những hành động đã được hệ thống chấp nhận.

[P00455 | 29918:29959 | NORMAL_TEXT]
Phục vụ: UR-08, UR-10; SYS-SR-03; BR-04.

[P00456 | 29959:29984 | NORMAL_TEXT]
Persona liên quan: P-03.

[P00457 | 29984:30040 | NORMAL_TEXT]
Trạng thái: Cốt lõi; thời hạn lưu lịch sử cần xác nhận.

[P00458 | 30040:30080 | HEADING_3]
FR-17. Tiếp nhận phản hồi từ người dùng

[P00459 | 30080:30089 | NORMAL_TEXT]
Yêu cầu:

[P00460 | 30089:30198 | NORMAL_TEXT]
Hệ thống phải phân biệt giữa phản hồi về thông tin hoặc cấu hình với sự kiện thực tế liên quan đến sản phẩm.

[P00461 | 30198:30294 | NORMAL_TEXT]
Ví dụ, việc bỏ qua một thông báo không đồng nghĩa người dùng đã sử dụng hoặc loại bỏ thực phẩm.

[P00462 | 30294:30314 | NORMAL_TEXT]
Điều kiện kiểm tra:

[P00463 | 30314:30385 | NORMAL_TEXT | LIST id=kix.u5v2sgs1m2n4 level=0]
Phản hồi chỉ làm thay đổi những dữ liệu phù hợp với mục đích phản hồi.

[P00464 | 30385:30477 | NORMAL_TEXT | LIST id=kix.u5v2sgs1m2n4 level=0]
Không tự động thay đổi số lượng hoặc tình trạng sản phẩm nếu chưa có sự kiện được xác nhận.

[P00465 | 30477:30536 | NORMAL_TEXT]
Phục vụ: UR-06, UR-07, UR-10; SYS-SR-03, SYS-SR-04; BR-04.

[P00466 | 30536:30580 | NORMAL_TEXT]
Persona liên quan: P-03; hỗ trợ P-01, P-02.

[P00467 | 30580:30707 | NORMAL_TEXT]
Trạng thái: Cốt lõi đối với việc bảo đảm tính chính xác; tự động tối ưu thông báo theo hành vi chưa thuộc phạm vi đã xác nhận.

[P00468 | 30707:30761 | HEADING_1]
7. Nonfunctional Requirements — Yêu cầu phi chức năng

[P00469 | 30761:30804 | HEADING_2]
NFR-01. Tính toàn vẹn và nhất quán dữ liệu

[P00470 | 30804:30813 | NORMAL_TEXT]
Yêu cầu:

[P00471 | 30813:30924 | NORMAL_TEXT]
Hệ thống phải duy trì sự nhất quán giữa thông tin sản phẩm hiện tại và lịch sử các thay đổi đã được chấp nhận.

[P00472 | 30924:31011 | NORMAL_TEXT]
Việc gửi lại cùng một hành động không được tạo ra các thay đổi trùng lặp ngoài ý muốn.

[P00473 | 31011:31021 | NORMAL_TEXT]
Kiểm tra:

[P00474 | 31021:31042 | NORMAL_TEXT | LIST id=kix.2aegk3dgeiwp level=0]
Gửi yêu cầu lặp lại.

[P00475 | 31042:31067 | NORMAL_TEXT | LIST id=kix.2aegk3dgeiwp level=0]
Lỗi trong quá trình lưu.

[P00476 | 31067:31087 | NORMAL_TEXT | LIST id=kix.2aegk3dgeiwp level=0]
Cập nhật đồng thời.

[P00477 | 31087:31113 | HEADING_2]
NFR-02. Bảo mật thông tin

[P00478 | 31113:31122 | NORMAL_TEXT]
Yêu cầu:

[P00479 | 31122:31209 | NORMAL_TEXT]
Hệ thống phải bảo vệ thông tin sản phẩm và dữ liệu người dùng khỏi truy cập trái phép.

[P00480 | 31209:31322 | NORMAL_TEXT]
Các thông tin xác thực, token và dữ liệu bí mật không được xuất hiện trong thông báo lỗi hoặc log không phù hợp.

[P00481 | 31322:31332 | NORMAL_TEXT]
Kiểm tra:

[P00482 | 31332:31357 | NORMAL_TEXT | LIST id=kix.qjltplelrmnn level=0]
Truy cập không có quyền.

[P00483 | 31357:31395 | NORMAL_TEXT | LIST id=kix.qjltplelrmnn level=0]
Truy cập dữ liệu của người dùng khác.

[P00484 | 31395:31450 | NORMAL_TEXT | LIST id=kix.qjltplelrmnn level=0]
Kiểm tra dữ liệu xuất hiện trong log và thông báo lỗi.

[P00485 | 31450:31495 | HEADING_2]
NFR-03. Tính chính xác của ngày và thời gian

[P00486 | 31495:31504 | NORMAL_TEXT]
Yêu cầu:

[P00487 | 31504:31599 | NORMAL_TEXT]
Hệ thống phải xử lý thông tin ngày và giờ phù hợp với ý nghĩa hạn dùng và quy tắc đã xác định.

[P00488 | 31599:31609 | NORMAL_TEXT]
Kiểm tra:

[P00489 | 31609:31639 | NORMAL_TEXT | LIST id=kix.7e22yp2haa8f level=0]
Trường hợp đúng ngày hết hạn.

[P00490 | 31639:31679 | NORMAL_TEXT | LIST id=kix.7e22yp2haa8f level=0]
Trường hợp trước hoặc sau mốc hạn dùng.

[P00491 | 31679:31702 | NORMAL_TEXT | LIST id=kix.7e22yp2haa8f level=0]
Dữ liệu không có ngày.

[P00492 | 31702:31736 | NORMAL_TEXT | LIST id=kix.7e22yp2haa8f level=0]
Trường hợp liên quan đến múi giờ.

[P00493 | 31736:31781 | HEADING_2]
NFR-04. Tính dễ sử dụng và khả năng tiếp cận

[P00494 | 31781:31790 | NORMAL_TEXT]
Yêu cầu:

[P00495 | 31790:31924 | NORMAL_TEXT]
Giao diện phải trình bày thông tin dễ đọc, thao tác rõ ràng và không sử dụng màu sắc làm phương tiện duy nhất để thể hiện trạng thái.

[P00496 | 31924:32018 | NORMAL_TEXT]
Các thành phần tương tác phải phù hợp với loại thiết bị và phương thức tương tác được hỗ trợ.

[P00497 | 32018:32028 | NORMAL_TEXT]
Kiểm tra:

[P00498 | 32028:32063 | NORMAL_TEXT | LIST id=kix.mr4c4q1urdrg level=0]
Kiểm tra độ rõ ràng của giao diện.

[P00499 | 32063:32108 | NORMAL_TEXT | LIST id=kix.mr4c4q1urdrg level=0]
Kiểm tra thao tác bằng bàn phím khi phù hợp.

[P00500 | 32108:32155 | NORMAL_TEXT | LIST id=kix.mr4c4q1urdrg level=0]
Kiểm tra khả năng đọc và phân biệt trạng thái.

[P00501 | 32155:32454 | NORMAL_TEXT | LIST id=kix.mr4c4q1urdrg level=0]
Kiểm thử tác vụ với người dùng có cơ chế hành vi phù hợp: P-01 nhận biết lại món đã cất; P-02 giải thích và chọn bước tiếp khi kế hoạch đổi; P-03 ghi nhận thay đổi hoặc sửa sai. Đo tỷ lệ hoàn thành, sai sót, số thao tác, thời gian và nhu cầu trợ giúp; thống nhất ngưỡng nghiệm thu trước thử nghiệm.

[P00502 | 32454:32522 | NORMAL_TEXT]
Mục tiêu đề xuất: Xem xét áp dụng WCAG 2.2 mức AA cho ứng dụng web.

[P00503 | 32522:32549 | HEADING_2]
NFR-05. Hiệu năng hệ thống

[P00504 | 32549:32558 | NORMAL_TEXT]
Yêu cầu:

[P00505 | 32558:32664 | NORMAL_TEXT]
Các chức năng quản lý thực phẩm phải đáp ứng trong thời gian phù hợp với điều kiện sử dụng được xác định.

[P00506 | 32664:32689 | NORMAL_TEXT]
Điều kiện đo cần làm rõ:

[P00507 | 32689:32708 | NORMAL_TEXT | LIST id=kix.2ozl0jlu29el level=0]
Thiết bị kiểm thử.

[P00508 | 32708:32721 | NORMAL_TEXT | LIST id=kix.2ozl0jlu29el level=0]
Tốc độ mạng.

[P00509 | 32721:32740 | NORMAL_TEXT | LIST id=kix.2ozl0jlu29el level=0]
Số lượng sản phẩm.

[P00510 | 32740:32753 | NORMAL_TEXT | LIST id=kix.2ozl0jlu29el level=0]
Loại tác vụ.

[P00511 | 32753:32779 | NORMAL_TEXT | LIST id=kix.2ozl0jlu29el level=0]
Phương pháp và ngưỡng đo.

[P00512 | 32779:32887 | NORMAL_TEXT]
Các giá trị 1,5 giây cho Dashboard và 3 giây cho OCR từ bản ban đầu được giữ ở trạng thái chỉ tiêu đề xuất.

[P00513 | 32887:32956 | NORMAL_TEXT]
Chưa đủ căn cứ để sử dụng chúng làm điều kiện nghiệm thu chính thức.

[P00514 | 32956:32996 | HEADING_2]
NFR-06. Khả năng xử lý lỗi và khôi phục

[P00515 | 32996:33005 | NORMAL_TEXT]
Yêu cầu:

[P00516 | 33005:33140 | NORMAL_TEXT]
Khi thao tác thất bại, hệ thống phải thông báo rõ nguyên nhân hoặc tình trạng lỗi trong phạm vi có thể và cung cấp cách xử lý phù hợp.

[P00517 | 33140:33375 | NORMAL_TEXT]
Không được hiển thị cập nhật thành công khi thay đổi chưa được lưu. Khi thất bại hoặc cần xác thực lại, dữ liệu người dùng đang nhập phải được giữ trong phạm vi phiên thao tác để họ có thể xử lý tiếp, hạn chế nhập lại không cần thiết.

[P00518 | 33375:33385 | NORMAL_TEXT]
Kiểm tra:

[P00519 | 33385:33404 | NORMAL_TEXT | LIST id=kix.wokhai7m5g48 level=0]
Gián đoạn kết nối.

[P00520 | 33404:33434 | NORMAL_TEXT | LIST id=kix.wokhai7m5g48 level=0]
Dữ liệu đầu vào không hợp lệ.

[P00521 | 33434:33447 | NORMAL_TEXT | LIST id=kix.wokhai7m5g48 level=0]
Lỗi máy chủ.

[P00522 | 33447:33465 | NORMAL_TEXT | LIST id=kix.wokhai7m5g48 level=0]
Thử lại thao tác.

[P00523 | 33465:33519 | HEADING_2]
NFR-07. Khả năng hoạt động khi dịch vụ hỗ trợ gặp lỗi

[P00524 | 33519:33528 | NORMAL_TEXT]
Yêu cầu:

[P00525 | 33528:33725 | NORMAL_TEXT]
Sự cố của các dịch vụ không bắt buộc như OCR, quét mã vạch, analytics hoặc thông báo không được làm hỏng dữ liệu hoặc ngăn người dùng thực hiện các chức năng nhập liệu và quản lý thủ công cốt lõi.

[P00526 | 33725:33735 | NORMAL_TEXT]
Kiểm tra:

[P00527 | 33735:33781 | NORMAL_TEXT]
Mô phỏng từng dịch vụ hỗ trợ ngừng hoạt động.

[P00528 | 33781:33832 | HEADING_2]
NFR-08. Quyền riêng tư và thời hạn lưu trữ dữ liệu

[P00529 | 33832:33841 | NORMAL_TEXT]
Yêu cầu:

[P00530 | 33841:34012 | NORMAL_TEXT]
Hệ thống phải giới hạn việc thu thập và sử dụng dữ liệu cá nhân theo nhu cầu đã được xác định, đồng thời tuân thủ quy tắc truy cập, lưu trữ và xóa dữ liệu được phê duyệt.

[P00531 | 34012:34022 | NORMAL_TEXT]
Kiểm tra:

[P00532 | 34022:34038 | NORMAL_TEXT | LIST id=kix.2soexeq6lpr4 level=0]
Quyền truy cập.

[P00533 | 34038:34051 | NORMAL_TEXT | LIST id=kix.2soexeq6lpr4 level=0]
Xóa dữ liệu.

[P00534 | 34051:34068 | NORMAL_TEXT | LIST id=kix.2soexeq6lpr4 level=0]
Lưu trữ dữ liệu.

[P00535 | 34068:34090 | NORMAL_TEXT | LIST id=kix.2soexeq6lpr4 level=0]
Ngăn rò rỉ thông tin.

[P00536 | 34090:34145 | NORMAL_TEXT]
Trạng thái: Chưa xác định thời hạn lưu trữ chính thức.

[P00537 | 34145:34178 | HEADING_2]
NFR-09. Độ tin cậy của thông báo

[P00538 | 34178:34187 | NORMAL_TEXT]
Yêu cầu:

[P00539 | 34187:34323 | NORMAL_TEXT]
Nếu chức năng gửi thông báo được triển khai, hệ thống phải theo dõi trạng thái lập lịch, gửi thông báo và các lỗi có thể xác định được.

[P00540 | 34323:34333 | NORMAL_TEXT]
Kiểm tra:

[P00541 | 34333:34343 | NORMAL_TEXT | LIST id=kix.cdn9g4gho38o level=0]
Lập lịch.

[P00542 | 34343:34358 | NORMAL_TEXT | LIST id=kix.cdn9g4gho38o level=0]
Gửi thông báo.

[P00543 | 34358:34381 | NORMAL_TEXT | LIST id=kix.cdn9g4gho38o level=0]
Xử lý thông báo trùng.

[P00544 | 34381:34416 | NORMAL_TEXT | LIST id=kix.cdn9g4gho38o level=0]
Trường hợp dịch vụ không phản hồi.

[P00545 | 34416:34531 | NORMAL_TEXT]
Mục tiêu độ lệch tối đa ±5 phút cần được đánh giá dựa trên nền tảng và cơ chế thông báo thực tế trước khi cam kết.

[P00546 | 34531:34574 | HEADING_2]
NFR-10. Khả năng giám sát và phát hiện lỗi

[P00547 | 34574:34583 | NORMAL_TEXT]
Yêu cầu:

[P00548 | 34583:34740 | NORMAL_TEXT]
Hệ thống phải cung cấp thông tin kỹ thuật phù hợp để hỗ trợ xác định nguyên nhân khi xảy ra lỗi, đồng thời tránh lưu những dữ liệu nhạy cảm không cần thiết.

[P00549 | 34740:34750 | NORMAL_TEXT]
Kiểm tra:

[P00550 | 34750:34764 | NORMAL_TEXT | LIST id=kix.b9cpdi24dcke level=0]
Ghi nhận lỗi.

[P00551 | 34764:34782 | NORMAL_TEXT | LIST id=kix.b9cpdi24dcke level=0]
Truy vết yêu cầu.

[P00552 | 34782:34811 | NORMAL_TEXT | LIST id=kix.b9cpdi24dcke level=0]
Che giấu thông tin nhạy cảm.

[P00553 | 34811:34847 | NORMAL_TEXT | LIST id=kix.b9cpdi24dcke level=0]
Kiểm tra trạng thái xử lý thất bại.

[P00554 | 34847:34885 | HEADING_1]
8. Business Rules — Quy tắc nghiệp vụ

[P00555 | 34885:34937 | HEADING_3]
RULE-01. Phân biệt dữ liệu số và tình trạng thực tế

[P00556 | 34937:35053 | NORMAL_TEXT]
Thông tin được lưu trong hệ thống là biểu diễn số của sản phẩm, không tự động chứng minh tình trạng vật lý thực tế.

[P00557 | 35053:35104 | HEADING_3]
RULE-02. Chỉ cập nhật theo thay đổi được chấp nhận

[P00558 | 35104:35235 | NORMAL_TEXT]
Thông báo hoặc hành động được đề xuất không được xem là một sự kiện thực tế đã hoàn thành nếu chưa có căn cứ hoặc xác nhận hợp lệ.

[P00559 | 35235:35288 | HEADING_3]
RULE-03. Phân biệt nguồn và độ chắc chắn của dữ liệu

[P00560 | 35288:35407 | NORMAL_TEXT]
Thông tin không có, thông tin ước tính, thông tin lấy từ nhãn và thông tin người dùng xác nhận phải được phân biệt rõ.

[P00561 | 35407:35457 | HEADING_3]
RULE-04. Phân biệt ý nghĩa của thông tin hạn dùng

[P00562 | 35457:35549 | NORMAL_TEXT]
Không được đồng nhất các loại ngày có ý nghĩa khác nhau về chất lượng và an toàn thực phẩm.

[P00563 | 35549:35592 | HEADING_3]
RULE-05. Phân biệt các trạng thái số lượng

[P00564 | 35592:35690 | NORMAL_TEXT]
Không biết số lượng, số lượng bằng không và hồ sơ đã đóng không mặc nhiên là cùng một trạng thái.

[P00565 | 35690:35731 | HEADING_3]
RULE-06. Phân biệt chỉnh sửa và tiêu thụ

[P00566 | 35731:35925 | NORMAL_TEXT]
Việc chỉnh số lượng do đếm lại hoặc nhập sai phải được phân biệt với ghi nhận đã sử dụng hay loại bỏ thực phẩm. Chênh lệch chưa rõ nguyên nhân không tự động được tính là tiêu thụ hoặc lãng phí.

[P00567 | 35925:35986 | HEADING_3]
RULE-07. Không khẳng định an toàn chỉ từ trạng thái ứng dụng

[P00568 | 35986:36089 | NORMAL_TEXT]
Việc hệ thống chưa đánh dấu sản phẩm cần chú ý không chứng minh sản phẩm chắc chắn an toàn để sử dụng.

[P00569 | 36089:36139 | HEADING_3]
RULE-08. Quy tắc vòng đời phụ thuộc loại sản phẩm

[P00570 | 36139:36239 | NORMAL_TEXT]
Các loại sản phẩm khác nhau có thể có quy tắc vòng đời, mốc thời gian và hành động xử lý khác nhau.

[P00571 | 36239:36285 | HEADING_3]
RULE-09. Xác định nguồn dữ liệu có thẩm quyền

[P00572 | 36285:36381 | NORMAL_TEXT]
Dữ liệu sản phẩm được hệ thống chấp nhận và các quy tắc nghiệp vụ là căn cứ quản lý chính thức.

[P00573 | 36381:36490 | NORMAL_TEXT]
Trạng thái giao diện, dữ liệu analytics hoặc việc gửi thông báo không được tự ý thay đổi thông tin sản phẩm.

[P00574 | 36490:36558 | HEADING_1]
9. Transition Requirements — Yêu cầu chuyển giao và đưa vào sử dụng

[P00575 | 36558:36590 | HEADING_3]
TR-01. Chuẩn bị dữ liệu ban đầu

[P00576 | 36590:36714 | NORMAL_TEXT]
Trước khi thử nghiệm, hệ thống cần có cấu hình hoặc danh mục cơ bản phù hợp để người dùng có thể bắt đầu quản lý thực phẩm.

[P00577 | 36714:36810 | NORMAL_TEXT]
Kiểm tra: Người dùng mới có thể tạo hồ sơ đầu tiên mà không cần quản trị viên trực tiếp hỗ trợ.

[P00578 | 36810:36837 | HEADING_3]
TR-02. Chuẩn bị thử nghiệm

[P00579 | 36837:36895 | NORMAL_TEXT]
Trước khi đánh giá hiệu quả nghiệp vụ, nhóm cần xác định:

[P00580 | 36895:37099 | NORMAL_TEXT | LIST id=kix.g6erjfktlxso level=0]
Đối tượng tham gia được chọn theo các cơ chế hành vi P-01/P-02/P-03, thay vì suy từ tuổi, nghề hoặc thiết bị. Ghi nhận mức phù hợp với tác vụ; ba persona chưa được coi là ba phân khúc đã được chứng minh.

[P00581 | 37099:37116 | NORMAL_TEXT | LIST id=kix.g6erjfktlxso level=0]
Dữ liệu ban đầu.

[P00582 | 37116:37136 | NORMAL_TEXT | LIST id=kix.g6erjfktlxso level=0]
Thời gian đánh giá.

[P00583 | 37136:37158 | NORMAL_TEXT | LIST id=kix.g6erjfktlxso level=0]
Phương pháp thu thập.

[P00584 | 37158:37173 | NORMAL_TEXT | LIST id=kix.g6erjfktlxso level=0]
Chỉ số cần đo.

[P00585 | 37173:37249 | NORMAL_TEXT | LIST id=kix.g6erjfktlxso level=0]
Các điều kiện liên quan đến quyền riêng tư và sự đồng ý của người tham gia.

[P00586 | 37249:37328 | NORMAL_TEXT]
Kiểm tra: Có kế hoạch thử nghiệm được thống nhất trước khi tiến hành đo lường.

[P00587 | 37328:37366 | HEADING_3]
TR-03. Chuẩn bị môi trường triển khai

[P00588 | 37366:37509 | NORMAL_TEXT]
Hệ thống cần được chuẩn bị về môi trường hoạt động, cơ sở dữ liệu, cấu hình, sao lưu và phương án khôi phục trước khi sử dụng dữ liệu thực tế.

[P00589 | 37509:37595 | NORMAL_TEXT]
Kiểm tra: Có thể triển khai, cập nhật và khôi phục trên môi trường kiểm thử đại diện.

[P00590 | 37595:37628 | HEADING_3]
TR-04. Hướng dẫn sử dụng ban đầu

[P00591 | 37628:37770 | NORMAL_TEXT]
Người dùng tham gia thử nghiệm cần được cung cấp hướng dẫn đủ để thực hiện các tác vụ cơ bản và hiểu giới hạn thông tin mà hệ thống cung cấp.

[P00592 | 37770:38005 | NORMAL_TEXT]
Kiểm tra: Người dùng có thể hoàn thành các tác vụ nhập, xem, quyết định bước tiếp và cập nhật thực phẩm theo ba persona với hướng dẫn đã chuẩn bị. Người tham gia không cần chọn một loại tài khoản hoặc nhận diện mình thuộc persona nào.

[P00593 | 38005:38052 | HEADING_1]
12. Scenario — Các tình huống sử dụng minh họa

[P00594 | 38052:38270 | NORMAL_TEXT]
Các scenario là tình huống minh họa đề xuất dựa trên cơ chế hành vi của persona để kiểm tra yêu cầu; không phải tường thuật một quan sát hoặc phỏng vấn đã diễn ra. Chúng chưa thay thế use case và user flow chính thức.

[P00595 | 38270:38318 | HEADING_2]
SC-01. Ghi nhận thực phẩm trước khi quên — P-01

[P00596 | 38318:38397 | NORMAL_TEXT]
Tác nhân: ST-01 — người dùng trực tiếp; persona minh họa P-01 (Phạm Hoàng An).

[P00597 | 38397:38541 | NORMAL_TEXT]
Bối cảnh minh họa: Người dùng vừa cất thực phẩm vào tủ lạnh và chưa chuẩn bị ngay. Có thông tin tối thiểu về món nhưng chưa biết ngày theo dõi.

[P00598 | 38541:38634 | NORMAL_TEXT]
Điều kiện ban đầu: Có quyền quản lý hồ sơ; phiên thao tác có thể cần xác thực trước khi lưu.

[P00599 | 38634:38713 | NORMAL_TEXT]
Mục tiêu: Ghi nhận thực phẩm với công sức hợp lý và nhận biết lại món khi cần.

[P00600 | 38713:38726 | NORMAL_TEXT]
Luồng chính:

[P00601 | 38726:38781 | NORMAL_TEXT | LIST id=kix.gkfmu4cp6stx level=0]
Người dùng bắt đầu thêm món và nhập dữ liệu tối thiểu.

[P00602 | 38781:38853 | NORMAL_TEXT | LIST id=kix.gkfmu4cp6stx level=0]
Người dùng chọn lưu với ngày chưa biết hoặc bổ sung ngày nếu có căn cứ.

[P00603 | 38853:38917 | NORMAL_TEXT | LIST id=kix.gkfmu4cp6stx level=0]
Nếu cần xác thực, hệ thống giữ bản nháp để người dùng tiếp tục.

[P00604 | 38917:38980 | NORMAL_TEXT | LIST id=kix.gkfmu4cp6stx level=0]
Hệ thống kiểm tra, lưu hồ sơ hợp lệ và thông báo đúng kết quả.

[P00605 | 38980:39066 | NORMAL_TEXT | LIST id=kix.gkfmu4cp6stx level=0]
Người dùng thấy lại tên, số lượng, vị trí và trạng thái dữ liệu ngày trong danh sách.

[P00606 | 39066:39227 | NORMAL_TEXT]
Ngoại lệ: Lưu thất bại hoặc hủy thao tác không được báo đã lưu; bản nháp đang nhập được giữ theo quy tắc phiên. Dữ liệu thiếu không tự biến thành ngày xác nhận.

[P00607 | 39227:39332 | NORMAL_TEXT]
Yêu cầu liên quan: UR-01, UR-02, UR-10; FR-01, FR-02, FR-04, FR-10; NFR-04, NFR-06; BR-01, BR-03, BR-04.

[P00608 | 39332:39390 | HEADING_2]
SC-02. Chọn bước tiếp khi kế hoạch bữa ăn thay đổi — P-02

[P00609 | 39390:39472 | NORMAL_TEXT]
Tác nhân: ST-01 — người dùng trực tiếp; persona minh họa P-02 (Tôn Nữ Như Huyền).

[P00610 | 39472:39584 | NORMAL_TEXT]
Bối cảnh minh họa: Kế hoạch bữa tối thay đổi sau khi đã mua thực phẩm; một số món còn trong kho và cần xem xét.

[P00611 | 39584:39669 | NORMAL_TEXT]
Điều kiện ban đầu: Hệ thống có các hồ sơ với mốc theo dõi và độ chắc chắn khác nhau.

[P00612 | 39669:39735 | NORMAL_TEXT]
Mục tiêu: Chọn món cần chú ý và giải thích được việc sẽ làm tiếp.

[P00613 | 39735:39748 | NORMAL_TEXT]
Luồng chính:

[P00614 | 39748:39813 | NORMAL_TEXT | LIST id=kix.9hjm7zamwxav level=0]
Người dùng mở danh sách cần chú ý hoặc lọc kho theo mức ưu tiên.

[P00615 | 39813:39907 | NORMAL_TEXT | LIST id=kix.9hjm7zamwxav level=0]
Hệ thống hiển thị các món đúng bộ lọc, lý do ưu tiên, số lượng, vị trí và giới hạn thông tin.

[P00616 | 39907:39982 | NORMAL_TEXT | LIST id=kix.9hjm7zamwxav level=0]
Người dùng chọn món, xem dữ liệu liên quan và những hành động được hỗ trợ.

[P00617 | 39982:40095 | NORMAL_TEXT | LIST id=kix.9hjm7zamwxav level=0]
Nếu ngày thiếu hoặc đã qua mốc theo dõi, người dùng có thể kiểm tra và chỉnh lại thông tin trước khi quyết định.

[P00618 | 40095:40206 | NORMAL_TEXT | LIST id=kix.9hjm7zamwxav level=0]
Người dùng chọn kiểm tra, ghi nhận sử dụng hoặc loại bỏ phù hợp; hệ thống chỉ cập nhật sau xác nhận hành động.

[P00619 | 40206:40335 | NORMAL_TEXT]
Kết quả hợp lệ: Người dùng hiểu lý do ưu tiên và lựa chọn được bước tiếp; kiểm tra thêm cũng là kết quả hợp lệ khi thiếu căn cứ.

[P00620 | 40335:40457 | NORMAL_TEXT]
Giới hạn: Trạng thái trong ứng dụng không xác nhận an toàn thực phẩm và chưa bao gồm tự động tạo công thức hoặc thực đơn.

[P00621 | 40457:40612 | NORMAL_TEXT]
Yêu cầu liên quan: UR-03, UR-04, UR-05, UR-07, UR-10; FR-02, FR-03, FR-04, FR-05, FR-06, FR-07, FR-08, FR-10; NFR-01, NFR-04, NFR-06; BR-01, BR-02, BR-03.

[P00622 | 40612:40661 | HEADING_2]
SC-03. Ghi nhận sử dụng và sửa chênh lệch — P-03

[P00623 | 40661:40745 | NORMAL_TEXT]
Tác nhân: ST-01 — người dùng trực tiếp; persona minh họa P-03 (Phạm Ngọc Thiên An).

[P00624 | 40745:40870 | NORMAL_TEXT]
Bối cảnh minh họa: Người dùng đã dùng một phần thực phẩm, sau đó kiểm tra số lượng thực tế và phát hiện thông tin cần chỉnh.

[P00625 | 40870:41010 | NORMAL_TEXT]
Điều kiện ban đầu: Có hồ sơ đang quản lý với số lượng xác định. Số lượng minh họa là dữ liệu kiểm thử, không phải kết quả quan sát persona.

[P00626 | 41010:41103 | NORMAL_TEXT]
Mục tiêu: Giữ hồ sơ sát thực tế với ít công cập nhật và không ghi nhầm nguyên nhân thay đổi.

[P00627 | 41103:41116 | NORMAL_TEXT]
Luồng chính:

[P00628 | 41116:41190 | NORMAL_TEXT | LIST id=kix.9g94uyuevtr8 level=0]
Người dùng bắt đầu hành động sử dụng từ danh sách hoặc chi tiết sản phẩm.

[P00629 | 41190:41261 | NORMAL_TEXT | LIST id=kix.9g94uyuevtr8 level=0]
Hệ thống hiển thị sản phẩm, số lượng hiện tại và dữ liệu cần xác nhận.

[P00630 | 41261:41341 | NORMAL_TEXT | LIST id=kix.9g94uyuevtr8 level=0]
Người dùng xác nhận lượng đã dùng; hệ thống kiểm tra và cập nhật đúng số lượng.

[P00631 | 41341:41428 | NORMAL_TEXT | LIST id=kix.9g94uyuevtr8 level=0]
Nếu cần đếm lại hoặc sửa sai, người dùng chọn hành động điều chỉnh riêng và nêu lý do.

[P00632 | 41428:41521 | NORMAL_TEXT | LIST id=kix.9g94uyuevtr8 level=0]
Người dùng kiểm tra số lượng sau thao tác và lịch sử phân biệt sử dụng, loại bỏ, điều chỉnh.

[P00633 | 41521:41710 | NORMAL_TEXT]
Ngoại lệ: Hủy không đổi dữ liệu; lỗi lưu không báo thành công; yêu cầu gửi lại không làm giảm số lượng hai lần. Không tính chênh lệch chưa rõ nguyên nhân thành lượng đã dùng hoặc lãng phí.

[P00634 | 41710:41839 | NORMAL_TEXT]
Yêu cầu liên quan: UR-03, UR-07, UR-08, UR-10; FR-03, FR-08, FR-09, FR-10, FR-16; NFR-01, NFR-04, NFR-06; RULE-06; BR-03, BR-04.

[P00635 | 41839:41882 | HEADING_2]
SC-04. Nhận dạng thông tin không chính xác

[P00636 | 41882:41945 | NORMAL_TEXT]
Điều kiện ban đầu: Chức năng OCR được phê duyệt và triển khai.

[P00637 | 41945:41998 | NORMAL_TEXT]
Mục tiêu: Chỉnh sửa dữ liệu nhận dạng trước khi lưu.

[P00638 | 41998:42011 | NORMAL_TEXT]
Luồng chính:

[P00639 | 42011:42051 | NORMAL_TEXT | LIST id=kix.jq6qfpidqofj level=0]
Người dùng sử dụng chức năng nhận dạng.

[P00640 | 42051:42086 | NORMAL_TEXT | LIST id=kix.jq6qfpidqofj level=0]
Hệ thống hiển thị dữ liệu đề xuất.

[P00641 | 42086:42122 | NORMAL_TEXT | LIST id=kix.jq6qfpidqofj level=0]
Người dùng phát hiện thông tin sai.

[P00642 | 42122:42144 | NORMAL_TEXT | LIST id=kix.jq6qfpidqofj level=0]
Người dùng chỉnh sửa.

[P00643 | 42144:42175 | NORMAL_TEXT | LIST id=kix.jq6qfpidqofj level=0]
Hệ thống kiểm tra lại dữ liệu.

[P00644 | 42175:42200 | NORMAL_TEXT | LIST id=kix.jq6qfpidqofj level=0]
Người dùng xác nhận lưu.

[P00645 | 42200:42210 | NORMAL_TEXT]
Ngoại lệ:

[P00646 | 42210:42289 | NORMAL_TEXT]
Dữ liệu nhận dạng không chính xác không được tự động ghi đè hồ sơ đã xác nhận.

[P00647 | 42289:42337 | NORMAL_TEXT]
Yêu cầu liên quan: FR-04, FR-10, FR-14; NFR-07.

[P00648 | 42337:42368 | HEADING_1]
13. Verification và Validation

[P00649 | 42368:42423 | HEADING_2]
13.1. Verification — Kiểm tra hệ thống đáp ứng yêu cầu

[P00650 | 42423:42536 | NORMAL_TEXT]
Verification nhằm xác định hệ thống đã được xây dựng đúng theo yêu cầu kỹ thuật và hành vi đã xác định hay chưa.

[P00651 | 42536:42568 | NORMAL_TEXT]
Các hoạt động kiểm tra bao gồm:

[P00652 | 42568:42610 | NORMAL_TEXT | LIST id=kix.xpx22ku3uowi level=0]
Kiểm thử các chức năng quản lý thực phẩm.

[P00653 | 42610:42648 | NORMAL_TEXT | LIST id=kix.xpx22ku3uowi level=0]
Kiểm thử quy tắc đánh giá trạng thái.

[P00654 | 42648:42679 | NORMAL_TEXT | LIST id=kix.xpx22ku3uowi level=0]
Kiểm thử API và cơ sở dữ liệu.

[P00655 | 42679:42704 | NORMAL_TEXT | LIST id=kix.xpx22ku3uowi level=0]
Kiểm thử quyền truy cập.

[P00656 | 42704:42744 | NORMAL_TEXT | LIST id=kix.xpx22ku3uowi level=0]
Kiểm thử giao diện và khả năng sử dụng.

[P00657 | 42744:42764 | NORMAL_TEXT | LIST id=kix.xpx22ku3uowi level=0]
Kiểm thử xử lý lỗi.

[P00658 | 42764:42792 | NORMAL_TEXT | LIST id=kix.xpx22ku3uowi level=0]
Kiểm thử các mốc thời gian.

[P00659 | 42792:42839 | NORMAL_TEXT | LIST id=kix.xpx22ku3uowi level=0]
Kiểm thử OCR và thông báo nếu được triển khai.

[P00660 | 42839:42929 | NORMAL_TEXT]
Mỗi Functional Requirement được phê duyệt cần có ít nhất một trường hợp kiểm thử phù hợp.

[P00661 | 42929:43253 | NORMAL_TEXT]
Liên hệ scenario: SC-01 kiểm dữ liệu tối thiểu, ngày chưa biết, giữ bản nháp và truy xuất sau lưu; SC-02 kiểm bộ lọc, lý do ưu tiên, giới hạn dữ liệu và đường hành động; SC-03 kiểm số lượng sau cập nhật, phân biệt sửa sai/sử dụng/loại bỏ, hủy, lỗi lưu và yêu cầu lặp. Các kiểm tra này không tự chứng minh lợi ích nghiệp vụ.

[P00662 | 43253:43317 | HEADING_2]
13.2. Validation — Đánh giá hệ thống có đáp ứng nhu cầu thực tế

[P00663 | 43317:43439 | NORMAL_TEXT]
Validation nhằm xác định hệ thống có thực sự đáp ứng nhu cầu người dùng và đóng góp vào các mục tiêu nghiệp vụ hay không.

[P00664 | 43439:43471 | NORMAL_TEXT]
Các phương pháp có thể sử dụng:

[P00665 | 43471:43594 | NORMAL_TEXT | LIST id=kix.3tiu3tjtrste level=0]
Dùng persona và scenario để chọn đối tượng, tác vụ và giả thuyết; việc đọc lại tài liệu persona không tự xác nhận nhu cầu.

[P00666 | 43594:43626 | NORMAL_TEXT | LIST id=kix.3tiu3tjtrste level=0]
Kiểm thử tác vụ với người dùng.

[P00667 | 43626:43676 | NORMAL_TEXT | LIST id=kix.3tiu3tjtrste level=0]
Đối chiếu dữ liệu tồn kho với tình trạng thực tế.

[P00668 | 43676:43726 | NORMAL_TEXT | LIST id=kix.3tiu3tjtrste level=0]
So sánh lượng thực phẩm bị bỏ phí theo thời gian.

[P00669 | 43726:43765 | NORMAL_TEXT | LIST id=kix.3tiu3tjtrste level=0]
Thu thập phản hồi về công sức sử dụng.

[P00670 | 43765:43800 | NORMAL_TEXT | LIST id=kix.3tiu3tjtrste level=0]
Đánh giá khả năng duy trì sử dụng.

[P00671 | 43800:44121 | NORMAL_TEXT]
Kế hoạch validation cần ghi rõ số người tham gia, cách tuyển, dữ liệu ban đầu, tác vụ, điều kiện thử nghiệm, mẫu số và những tác vụ chưa hoàn thành. Ngưỡng đánh giá phải thống nhất trước thu thập dữ liệu. Dữ liệu demo hoặc một phiên usability chưa chứng minh giảm lãng phí, tiết kiệm chi phí hay duy trì sử dụng lâu dài.

[P00672 | 44121:44175 | HEADING_2]
13.3. Phân biệt kết quả kỹ thuật và kết quả nghiệp vụ

[P00673 | 44175:44329 | NORMAL_TEXT]
Kết quả hệ thống: Bộ lọc, lý do ưu tiên và dữ liệu sau thao tác hoạt động đúng yêu cầu; nếu có dịch vụ thông báo, trạng thái tạo/gửi được kiểm tra riêng.

[P00674 | 44329:44471 | NORMAL_TEXT]
Hành vi người dùng: Người dùng nhận biết được món cần chú ý, hiểu giới hạn dữ liệu và chọn được hành động có lý do trong tình huống của mình.

[P00675 | 44471:44630 | NORMAL_TEXT]
Kết quả nghiệp vụ: Mức lãng phí, việc tận dụng thực phẩm, chi phí và công duy trì thay đổi qua thời gian; cần baseline và phương pháp đánh giá phù hợp với BR.

[P00676 | 44630:44687 | HEADING_2]
13.4. Tác vụ đánh giá theo persona và giới hạn prototype

[P00677 | 44687:44727 | HEADING_3]
VAL-P01. Nhận biết lại thực phẩm đã cất

[P00678 | 44727:44959 | NORMAL_TEXT]
Tác vụ: Ghi nhận món bằng dữ liệu tối thiểu, rồi tìm lại món và nhận biết thông tin cần chú ý. Đo hoàn thành tác vụ, món bị bỏ sót, sai sót nhập, thời gian, số thao tác và trợ giúp. Liên hệ SC-01; UR-01, UR-02, UR-04; BR-01, BR-04.

[P00679 | 44959:45001 | HEADING_3]
VAL-P02. Quyết định khi kế hoạch thay đổi

[P00680 | 45001:45279 | NORMAL_TEXT]
Tác vụ: Với nhiều món và thông tin ngày khác nhau, chọn món cần xem xét và giải thích bước tiếp theo. Đo quyết định có lý do, khả năng nhận biết dữ liệu chưa chắc chắn, thời gian, trợ giúp và nguyên nhân tác vụ chưa hoàn thành. Liên hệ SC-02; UR-04, UR-05, UR-10; BR-02, BR-03.

[P00681 | 45279:45314 | HEADING_3]
VAL-P03. Duy trì hồ sơ sát thực tế

[P00682 | 45314:45578 | NORMAL_TEXT]
Tác vụ: Ghi nhận đã dùng, loại bỏ và sửa sai trong các tình huống riêng, rồi đối chiếu số lượng và lịch sử. Đo lỗi số lượng, việc nhầm nguyên nhân thay đổi, công sửa sai, thời gian, số thao tác và trợ giúp. Liên hệ SC-03; UR-03, UR-07, UR-08, UR-10; BR-03, BR-04.

[P00683 | 45578:45695 | NORMAL_TEXT]
Ngưỡng đánh giá các tác vụ còn cần thống nhất trước thử nghiệm; những chỉ số trên là kế hoạch đo, chưa phải kết quả.

[P00684 | 45695:45988 | NORMAL_TEXT]
Giới hạn prototype: UI demo chỉ mô phỏng dữ liệu, xác thực và lệnh cập nhật trong bộ nhớ. Build, kiểm tra kiểu và browser smoke chỉ kiểm chứng hành vi frontend được thực chạy; chưa xác nhận backend, lưu trữ lâu dài, quyền truy cập thật, dịch vụ thông báo/OCR hay usability với người tham gia.

[P00685 | 45988:45989 | NORMAL_TEXT]
⟦EMPTY PARAGRAPH⟧

[P00686 | 45989:45990 | NORMAL_TEXT]
⟦EMPTY PARAGRAPH⟧

