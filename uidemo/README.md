# EXPIRY UI — Prototype & Design System

> **Gọn kho, rõ ngày** — Ứng dụng quản lý hạn sử dụng thực phẩm thông minh, trực quan và tối ưu thao tác theo tiêu chuẩn Apple Human Interface Guidelines.

## ✨ Tính năng chính

1. **Trang chủ tổng quan (Command Center Dashboard)**:
   - Chỉ số thống kê nhanh (*Tổng kho, Cần xử lý ngay, Sắp tới hạn, Thời hạn còn xa*).
   - Danh sách món cấp bách với hành động 1 chạm: **✓ Đã dùng** và **❄️ Cấp đông**.
   - Phân bố vị trí kho (*Ngăn mát, Ngăn đông, Ngăn rau, Tủ bếp, Kệ ngoài*) và bộ lọc nhanh.
   - Dòng thời gian hoạt động thực tế (*Recent Activity Stream*).

2. **Chức năng Thêm mới ở vị trí trung tâm (Center Action Hero)**:
   - Trên Mobile: Nút thêm nổi bật được đặt ở **chính giữa** thanh điều hướng Bottom Dock, dạng floating action button với màu xanh gradient.
   - Trên Desktop: Nút Hero Action tại Sidebar giúp ghi nhận thực phẩm chỉ trong vài giây.

3. **Cụm 3 tính năng Reviews (Kiểm kê & Đánh giá theo BR-04 & BR-05)**:
   - **1. Kiểm tra khẩn cấp (*Quick Daily Triage*)**: Rà soát nhanh các món sắp/quá hạn chỉ với 1 chạm (*Đã dùng hết, Cấp đông, Đã bỏ, Đổi/Kiểm lại*).
   - **2. Kiểm kê theo khu vực (*Zone & Shelf Audit*)**: Lọc theo từng khu vực bảo quản, checklist kiểm đếm thực tế đối soát với app kèm bộ nút tính nhanh `-1`, `+1`, `Hết`.
   - **3. Đánh giá tiêu dùng & Lãng phí (*Waste & Consumption Insights*)**: Phân tích tỉ lệ bảo toàn thực phẩm (*Save Rate %*), số lần dùng vs bỏ, và gợi ý món ăn thông minh (*Smart Meal Recommendations*) dựa trên nguyên liệu sắp hết hạn.

4. **Hệ thống kho & Chi tiết toàn diện**:
   - Kho thực phẩm (Inventory) hỗ trợ tìm kiếm, lọc theo vị trí và vòng đời (*Còn hàng / Đã hết / Tất cả*).
   - Chi tiết thực phẩm (Detail) hiển thị đầy đủ 6 thông tin, nguồn gốc ngày, loại nhãn, lượng còn và lịch sử.
   - Thùng rác (Trash) cho phép khôi phục bản ghi nguyên vẹn lượng và lịch sử.
   - Cài đặt (Settings) cấu hình múi giờ, số ngày nhắc trước và mô phỏng 8 trạng thái hệ thống.

## 🛠️ Công nghệ

- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + Vanilla CSS Design System (Apple HIG aesthetics)
- **Build Tool**: Vite 8
- **Data Engine**: In-memory Idempotent API Boundary (`mockApi.ts`)

## 🚀 Chạy cục bộ

```bash
# Cài đặt thư viện
npm install

# Khởi chạy dev server
npm run dev

# Build production
npm run build
```
