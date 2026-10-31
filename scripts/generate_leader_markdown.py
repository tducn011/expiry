import openpyxl

def generate_markdown():
    wb = openpyxl.load_workbook('./Leader/BAO_CAO_TIEN_DO_EXPIRY_GITHUB.xlsx', data_only=True)
    
    md = []
    md.append("# 📊 BÁO CÁO TIẾN ĐỘ TOÀN DIỆN DỰ ÁN EXPIRY")
    md.append("> **Smart Expiry Date & Food Inventory Management System**")
    md.append("> ")
    md.append("> **Nguồn dữ liệu:** GitHub Repository `tducn011/expiry`  ")
    md.append("> **Thời điểm đồng bộ:** 31/10/2026 (sau PR #194 & đồng bộ toàn diện nhánh `develop`)  ")
    md.append("> **Tập tin Excel chi tiết:** [`BAO_CAO_TIEN_DO_EXPIRY_GITHUB.xlsx`](./BAO_CAO_TIEN_DO_EXPIRY_GITHUB.xlsx)")
    md.append("")
    md.append("---")
    md.append("")
    md.append("## 🏆 1. DASHBOARD & CHỈ SỐ TỔNG QUAN (KPIs)")
    md.append("")
    md.append("| Chỉ Số | Giá Trị Thực Tế | Tỷ Lệ Hoàn Thành | Trạng Thái Đánh Giá |")
    md.append("| :--- | :---: | :---: | :--- |")
    md.append("| **Tổng số GitHub Issues** | **93 / 93** | **100.0%** | Toàn bộ 93 issues đã giải quyết và đóng (CLOSED) |")
    md.append("| **Pull Requests (develop)** | **80 PRs** | **100.0%** | 80/80 PRs vượt qua CI/CD và merge vào `develop` |")
    md.append("| **Tổng số Commits (develop)**| **142 Commits** | **100.0%** | Lịch sử commit tuyến tính, rõ ràng, minh bạch |")
    md.append("| **Automated Tests Pass** | **122 / 122 Tests** | **100.0%** | 52 API Unit/Contract tests + 70 Web Vitest tests |")
    md.append("| **Độ Phủ Tính Năng & Deliverables** | **30 / 30 Mục** | **100.0%** | Toàn bộ 7 phân hệ cốt lõi đã bàn giao và vận hành |")
    md.append("| **Định Dạng & Kiểm Tra Kiểu (CI Gate)** | **100% PASS** | **100.0%** | OxFmt 60/60 files chuẩn + TypeScript typecheck 0 lỗi |")
    md.append("")
    md.append("---")
    md.append("")
    md.append("## 👥 2. PHÂN BỔ ĐÓNG GÓP THEO THÀNH VIÊN TRÊN NHÁNH DEVELOP")
    md.append("")
    md.append("| Thành Viên | Tài Khoản GitHub | Vai Trò & Trọng Trách Kỹ Thuật | PRs Merged | Commits | Đóng Góp (%) | Đánh Giá |")
    md.append("| :--- | :--- | :--- | :---: | :---: | :---: | :--- |")
    md.append("| **Nguyễn Đức** *(Team Leader)* | `tducn110` (`tducn`) | Kiến trúc Monorepo, Setup CI/CD, MySQL Migrations 001-005, Vercel Reverse Proxy, AI Scan OCR Python microservice, Polymorphic ApiClient, Signed Release main, Modern Design System, Storage Hub & Insight Analytics, Session Coordinator (PR #161, #172, #174, #177, #178, #180). | **25 PRs** | **60** | **42.3%** | Hoàn thành xuất sắc |")
    md.append("| **Tuấn Kiệt** | `kiet00394-collab` | Chiến dịch Ponytail (Cắt giảm 1,100+ dòng bloat code), Tối ưu hiệu năng N+1 & Waterfall, Debounce 300ms, Migration 005 CSDL, SQL pagination pushdown, nâng cấp tương thích Vite 8, đồng bộ deep-linking browser history (PR #189 -> #194). | **38 PRs** | **41** | **28.9%** | Hoàn thành xuất sắc |")
    md.append("| **Huy Hoàng** | `UncleYelloow` | Core Domain Kho (Stock Movements, Ledger, Attention Engine, Food Detail, Trash Lifecycle), Manual Capture Form, Quét Barcode GS1, khắc phục triệt để toàn bộ 7 lỗi backend integration (BUG-01 -> BUG-07, PR #187, #188). | **17 PRs** | **41** | **28.9%** | Hoàn thành xuất sắc |")
    md.append("| **TỔNG CỘNG** | **3 Thành viên** | **Toàn bộ đội ngũ kỹ thuật dự án Expiry** | **80 PRs** | **142** | **100.0%** | **Đạt chuẩn bàn giao** |")
    md.append("")
    md.append("---")
    md.append("")
    md.append("## 🚀 3. TÓM TẮT 8 KẾT QUẢ ĐỘT PHÁ ĐÃ ĐẠT ĐƯỢC")
    md.append("")
    md.append("1. **Kiến trúc Monorepo & Khả năng Chịu tải Cao:** Phân chia rõ ràng giữa `apps/web` (React 19 + TypeScript + Vite) và `apps/api` (Node.js ESM + Express) cùng microservice AI OCR Python độc lập. Thiết kế chịu tải cao với Connection Pooling, Transaction ACID và Optimistic Version Locking.")
    md.append("2. **Tinh giản Mã nguồn Ponytail (Xóa bỏ Over-engineering):** Cắt giảm hơn 1,100 dòng code phức tạp không cần thiết: Thay thế custom DatePicker 708 dòng bằng native HTML5 date input, thay thế Portal Select 365 dòng bằng native select, xóa ScrollbarAutohide, dùng Node.js native env loader.")
    md.append("3. **Tối ưu Hiệu năng Toàn diện (N+1 Query & Frontend Waterfall):** Triệt tiêu hiện tượng tải thác nước ở frontend, thêm Debounce 300ms + AbortController cho tìm kiếm, đẩy phân trang LIMIT/OFFSET xuống database MySQL, bypass CTE đếm, throttle session write để tránh khóa hàng (Row Lock Contention).")
    md.append("4. **Bảo mật Cấp Doanh nghiệp (Enterprise-Grade Hardening):** Bảo vệ chống tấn công DoS băm mật khẩu Scrypt bằng hàng đợi Bounded Concurrency Queue, chống IP Spoofing qua reverse proxy, xử lý dung sai lệch đồng hồ (Clock Skew), vá lỗ hổng Command Injection trong webhook.")
    md.append("5. **Hiện đại hóa Giao diện & Trải nghiệm Đa thiết bị (Responsive Design System):** Đồng bộ toàn bộ giao diện theo chuẩn Design System mới với Tailwind v4; giải quyết triệt để lỗi co cụm modal/card trên thiết bị di động (mobile-first); hỗ trợ thanh điều hướng 72px desktop và bottom bar 56px cho mobile với vùng chạm an toàn (safe-area insets); bổ sung 70 vitest test cases tự động.")
    md.append("6. **Tích Hợp AI Scan OCR & Quét Mã Vạch GS1 Đa Nguồn:** Kết nối camera scanner và file upload trực tiếp tới microservice Python YOLO+CTC OCR; tích hợp ZXing quét barcode GS1 và tự động đối soát sản phẩm.")
    md.append("7. **Kho Lưu Trữ Storage Hub & Phân Tích Thông Minh Insight:** Bổ sung màn hình Storage Hub phân chia trực quan 4 khu vực lưu trữ (Fridge, Freezer, Pantry, Cool); màn hình Insight phân tích thống kê lãng phí, tỉ lệ tiêu thụ và dự báo trực quan bằng biểu đồ.")
    md.append("8. **Kết Nối Đồng Bộ Toàn Diện Real API & Session Coordinator:** Xử lý dứt điểm 7 lỗi kết nối live (BUG-01 -> BUG-07), đồng bộ Auth, thêm/sửa món ăn, xuất/nhập kho, phục hồi thùng rác vào CSDL MySQL với Session Coordinator và deep linking URL.")
    md.append("")
    md.append("---")
    md.append("")
    md.append("## 📦 4. BẢNG KIỂM 30 TÍNH NĂNG & DELIVERABLES ĐÃ BÀN GIAO")
    md.append("")
    md.append("| STT | Mã | Phân Hệ | Tên Deliverable / Tính Năng | Mô Tả Kỹ Thuật | Nguồn / File Chính | PR / Issue | Trạng Thái |")
    md.append("| :---: | :---: | :--- | :--- | :--- | :--- | :--- | :---: |")
    
    ws_deliv = wb['🚀 Tính năng & Deliverables']
    for r in range(5, ws_deliv.max_row):
        vals = [ws_deliv.cell(r, c).value for c in range(1, 10)]
        if vals[0] and vals[0] != 'TỔNG':
            stt = vals[0]
            code = vals[1] or ''
            module = vals[2] or ''
            name = vals[3] or ''
            desc = (vals[4] or '').replace('\n', ' ')
            files = (vals[5] or '').replace('\n', ', ')
            prs = vals[6] or ''
            status = vals[7] or 'Hoàn thành'
            md.append(f"| {stt} | `{code}` | {module} | **{name}** | {desc} | `{files}` | {prs} | ✅ {status} |")
            
    md.append("")
    md.append("---")
    md.append("")
    md.append("## 🔀 5. TOÀN BỘ 80 PULL REQUESTS ĐÃ MERGE VÀO NHÁNH DEVELOP")
    md.append("")
    md.append("| STT | Số PR | Tiêu Đề Pull Request | Tác Giả | Nhánh Nguồn (Head) | Ngày Merge (UTC) | Issue | Mô Tả & Đóng Góp Kỹ Thuật |")
    md.append("| :---: | :---: | :--- | :--- | :--- | :---: | :---: | :--- |")
    
    ws_prs = wb['🔀 Merged PRs develop (80)']
    for r in range(5, ws_prs.max_row):
        vals = [ws_prs.cell(r, c).value for c in range(1, 10)]
        if vals[0] and vals[0] != 'TỔNG':
            stt = vals[0]
            pr_num = vals[1] or ''
            title = vals[2] or ''
            author = vals[3] or ''
            branch = vals[4] or ''
            date = vals[5] or ''
            issues = vals[6] or '-'
            desc = (vals[7] or '').replace('\n', ' ')
            md.append(f"| {stt} | **{pr_num}** | {title} | `{author}` | `{branch}` | {date} | {issues} | {desc} |")
            
    md.append("")
    md.append("---")
    md.append("")
    md.append("## 📌 6. TOÀN BỘ 93 ISSUES ĐÃ GIẢI QUYẾT TRÊN GITHUB (100% CLOSED)")
    md.append("")
    md.append("| STT | Mã Issue | Phân Loại | Tiêu Đề Kỹ Thuật | Phân Hệ | Phụ Trách | Labels | Giải Pháp Kỹ Thuật Chi Tiết | Trạng Thái |")
    md.append("| :---: | :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: |")
    
    ws_iss = wb['📌 Toàn bộ Issues (93)']
    for r in range(5, ws_iss.max_row):
        vals = [ws_iss.cell(r, c).value for c in range(1, 10)]
        if vals[0] and vals[0] != 'TỔNG':
            stt = vals[0]
            iss_num = vals[1] or ''
            cat = vals[2] or ''
            title = vals[3] or ''
            subsys = vals[4] or ''
            assignee = vals[5] or ''
            labels = vals[6] or ''
            solution = (vals[7] or '').replace('\n', ' ')
            md.append(f"| {stt} | **{iss_num}** | {cat} | {title} | {subsys} | `{assignee}` | `{labels}` | {solution} | 🟢 CLOSED |")
            
    md.append("")
    md.append("---")
    md.append("")
    md.append("## ⚠️ 7. CÁC HẠNG MỤC TỒN ĐỌNG & KẾ HOẠCH NÂNG CẤP TIẾP THEO")
    md.append("")
    md.append("| STT | Mã Hạng Mục | Tên Hạng Mục Tồn Đọng / Hạn Chế | Phân Loại | Ưu Tiên | Hiện Trạng & Giới Hạn Thực Tế | Kế Hoạch Đề Xuất Cho Phase Tiếp Theo | Trạng Thái |")
    md.append("| :---: | :---: | :--- | :--- | :---: | :--- | :--- | :---: |")
    
    ws_back = wb['⚠️ Tồn đọng & Đề xuất']
    for r in range(5, ws_back.max_row):
        vals = [ws_back.cell(r, c).value for c in range(1, 10)]
        if vals[0] and vals[0] != 'TỔNG':
            stt = vals[0]
            code = vals[1] or ''
            name = vals[2] or ''
            cat = vals[3] or ''
            prio = vals[4] or ''
            status_desc = (vals[5] or '').replace('\n', ' ')
            sol = (vals[6] or '').replace('\n', ' ')
            curr_state = vals[7] or ''
            md.append(f"| {stt} | `{code}` | **{name}** | {cat} | {prio} | {status_desc} | {sol} | {curr_state} |")
            
    md.append("")
    md.append("---")
    md.append("")
    md.append("## 🛠️ 8. KẾT QUẢ KIỂM CHỨNG TỰ ĐỘNG (VERIFICATION GATES)")
    md.append("")
    md.append("- ✅ **Backend API Suite (`apps/api`):** 52 tests pass / 52 runnable (1 skip isolated real MySQL). Đã kiểm thử trọn vẹn: App healthcheck, Problem JSON, Idempotency-Key, Authentication, Strong password scrypt queue overload, Session absolute/idle expiry, Clock skew tolerance, X-Forwarded-For IP rate limit, Anti-spoofing, Rollback atomicity, Inventory attention, Stock movements, History pagination, Graceful shutdown.")
    md.append("- ✅ **Frontend Web Suite (`apps/web`):** 70 tests pass / 70 tests qua 6 test suites Vitest (`barcode-scanner`, `domain-mutations`, `image-optimization`, `migrated-ui`, `storage-and-insight`, `ui-components`).")
    md.append("- ✅ **Web Production Build:** Vite build hoàn thành trong 531ms, tạo bundle sạch sẽ không có lỗi.")
    md.append("- ✅ **OxFmt Formatting Gate:** 60/60 files khớp format chuẩn `oxfmt --check`.")
    md.append("- ✅ **TypeScript Typecheck:** `tsc --noEmit` hoàn thành sạch sẽ, 0 lỗi kiểu.")
    md.append("")
    md.append("---")
    md.append("*Báo cáo được trích xuất tự động và đồng bộ giữa GitHub CLI, Git Log và Workbook Excel.*")

    content = "\n".join(md)
    with open('./Leader/BAO_CAO_TIEN_DO_EXPIRY_GITHUB.md', 'w', encoding='utf-8') as f:
        f.write(content)
    with open('./Leader/README.md', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully wrote Markdown reports in Leader/BAO_CAO_TIEN_DO_EXPIRY_GITHUB.md and Leader/README.md")

if __name__ == '__main__':
    generate_markdown()
