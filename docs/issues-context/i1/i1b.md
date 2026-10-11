# Sub-issue i1b: Mount Real API & Auth Flow into App.tsx

- **Parent Issue**: [i1: Connect API & Web](./i1.md)
- **Assignee**: Antigravity (`@tducn110`)
- **Status**: **READY TO CLAIM**
- **Branch**: `feature/i1b-app-auth-connect`
- **Target Branch**: `develop`
- **Date**: 2026-10-11

---

## 1. Khung Sub-issue (Framework)

### INPUT
- Source files:
  - `apps/web/src/App.tsx`
  - `apps/web/src/demo/DemoApp.tsx`
  - `apps/web/src/hooks/useExpiry.ts`
  - `apps/web/src/features/AuthForm.tsx`

### VẤN ĐỀ RA SAO?
- Hiện tại `apps/web/src/App.tsx` vẫn import trực tiếp singleton `mockApi` từ `./mockApi`.
- Dù đã viết sẵn `ApiClient`, `useExpiry.ts`, và `AuthForm.tsx`, giao diện người dùng vẫn chưa kết nối với backend.
- Cần có cơ chế định tuyến: nếu người dùng truy cập với tham số `?demo=1` hoặc `?demo=true` thì chuyển sang `DemoApp.tsx` (chế độ demo mock cô lập); ngược lại ở chế độ thông thường sẽ nạp dữ liệu thật thông qua hook `useExpiry()`.
- Nếu chưa có cookie phiên làm việc (`session == null`), hiển thị modal `AuthForm` để người dùng đăng nhập hoặc tạo tài khoản mới.

### OUTPUT
- Cập nhật `apps/web/src/App.tsx` để tích hợp:
  1. Kiểm tra tham số `?demo` -> Render `DemoApp.tsx`.
  2. Ở chế độ production/real -> Khởi chạy `useExpiry()`.
  3. Mở `AuthForm` khi cần xác thực danh tính.
  4. Hiển thị thông tin người dùng đang đăng nhập và hỗ trợ đăng xuất.
- Build gói frontend `npm run build:web` thành công 100%.

### FINAL CONTRACT
- Các request xác thực sử dụng đúng chuẩn cookie HttpOnly và CSRF header:
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `GET /api/v1/auth/session`
  - `POST /api/v1/auth/logout`

### LÀM SAO ĐỂ NHẬN ĐỊNH OUTPUT ĐÚNG HAY SAI (VERIFICATION)
1. `npm run build:web` không có lỗi TypeScript.
2. Kiểm tra trên browser:
   - Truy cập URL bình thường: Hiển thị form đăng nhập / đăng ký của `AuthForm`.
   - Đăng nhập/đăng ký thành công: Tải dữ liệu từ backend API `/api/v1/entries`.
   - Truy cập URL có `?demo=1`: Chạy trơn tru chế độ Demo mà không cần backend.
