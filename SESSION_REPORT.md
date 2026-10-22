# Báo Cáo Tổng Hợp Toàn Bộ Phiên Làm Việc (Session Report)

- **Thời gian thực hiện**: 11/10/2026
- **Repository**: `expiry` (Monorepo Hybrid Architecture)
- **Nhánh tích hợp chính**: `develop` (HEAD: `ed5d84d`)
- **Trạng thái môi trường**:
  - **Staging / Test Demo (`develop`)**: [https://demoexpiry.vercel.app](https://demoexpiry.vercel.app) — **LIVE (HTTP 200)**
  - **Production Chính thức (`main`)**: [https://expiryapp.vercel.app](https://expiryapp.vercel.app) — **LIVE (HTTP 200)**

---

## 1. Thiết lập Quy chuẩn Repository & Deploy Workflow

Đã khởi tạo và hoàn thiện bộ tài liệu quy chuẩn tại [deploy/github.md](file:///home/pro/Downloads/expiry/deploy/github.md) và [docs/deploy/github.md](file:///home/pro/Downloads/expiry/docs/deploy/github.md):

1. **Ranh giới Kiến trúc Monorepo**:
   - `apps/web`: Chỉ gọi `/api/v1`, không kết nối trực tiếp database hay python service.
   - `apps/api`: Nắm giữ toàn bộ nghiệp vụ (business rules, optimistic concurrency `version`, attention policies).
   - `services/python-scan`: Stateless microservice, không đụng vào MySQL, tuân thủ nguyên tắc YAGNI & Ponytail (không cài thư viện ML cồng kềnh).
   - `database/mysql`: Single source of truth, migration bất biến, versioned schema trong `database/mysql/migrations/`.
2. **Quy tắc Quản lý Nhánh & Tuyệt đối Cấm Push Trực Tiếp lên `main`**:
   - Nhánh `main`: Được bảo vệ tuyệt đối, cấm push trực tiếp. Chỉ nhận merge sau khi được Owner duyệt từ `develop`.
   - Nhánh `develop`: Nhánh tích hợp và test tự động.
   - Nhánh `feature/*`: Tạo từ nhánh tích hợp, thực hiện code và rebase trước khi mở PR.
3. **Quy trình Git Rebase & PR (Linear History)**:
   - Sử dụng `git fetch origin` và `git rebase origin/develop` (hoặc `origin/main`) để giữ lịch sử commit thẳng, không tạo merge commit rác.
   - Xử lý xung đột (conflict) an toàn và đẩy code bằng `git push --force-with-lease`.
   - Merge PR qua chiến lược **Rebase and Merge** hoặc **Squash and Merge**.
4. **Pre-push Quality Gates**:
   - Bắt buộc chạy và đạt 100%: `npm run test:all`, `npm run test:api`, `npm run build:web`.

---

## 2. Review & Khảo sát Hiện trạng Dự án

Đã tiến hành rà soát kỹ thuật toàn bộ mã nguồn trên nhánh `feature/ui`:

1. **Cơ sở dữ liệu (MySQL)**:
   - Migration 001 (`database/mysql/migrations/001_initial_schema.sql`): `users`, `food_entries`, `stock_movements`, `api_requests`.
   - Migration 002 (`database/mysql/migrations/002_local_auth.sql`): `local_credentials`, `user_sessions`. Đã kiểm tra thực tế trên container MySQL `expiry-mysql84-mysql-1` (port 3307), cả 2 bảng đều đã tồn tại.
2. **Backend API (`apps/api`)**:
   - Module xác thực hoàn chỉnh: `apps/api/src/modules/auth/` (mã hóa mật khẩu `scrypt`, quản lý session token HttpOnly, chống CSRF token, rate limit theo IP/email).
   - Các bộ kiểm thử: `auth.test.mjs` (9/9 pass), `public-contract.test.mjs` (pass).
   - **Phát hiện bug**: `ScanController` thiếu method `upload` trong khi [apps/api/src/modules/scan/scan.routes.mjs](file:///home/pro/Downloads/expiry/apps/api/src/modules/scan/scan.routes.mjs#L6) gọi `router.post('/scans', controller.upload)`, làm crash router và khiến 2 test cases trong `tests/api.test.mjs` bị fail.
3. **Frontend Web (`apps/web`)**:
   - Đã sao lưu bản prototype chạy mock thành `apps/web/src/demo/DemoApp.tsx`.
   - Đã viết xong `ApiClient` ([apps/web/src/api/client.ts](file:///home/pro/Downloads/expiry/apps/web/src/api/client.ts)) và custom hook [apps/web/src/hooks/useExpiry.ts](file:///home/pro/Downloads/expiry/apps/web/src/hooks/useExpiry.ts).
   - Đã tạo các modal form mới: `AuthForm.tsx` (Đăng nhập/Đăng ký) và `ScanForm.tsx` (Upload & Review scan).
   - `App.tsx` chưa kết nối với `useExpiry.ts` (vẫn đang dùng `mockApi`).
4. **Python Scan (`services/python-scan`)**:
   - Code hoàn tất các route `/scan` và `/health`, tuy nhiên môi trường Python trên host thiếu `pydantic`.

---

## 3. Khởi tạo Khung Quản lý Sub-issues (Standard Framework)

Đã thiết lập hệ thống context tài liệu tại `docs/issues-context/` theo đúng khung:
```text
INPUT -> VẤN ĐỀ RA SAO -> OUTPUT -> FINAL CONTRACT -> VERIFICATION
```

- **[Master Issue i1: Connect API & Web](file:///home/pro/Downloads/expiry/docs/issues-context/i1/i1.md)**: Điều phối mục tiêu kết nối Frontend với Backend API.
- **[Sub-issue i1a: Fix Scan Route & Baseline API Verification](file:///home/pro/Downloads/expiry/docs/issues-context/i1/i1a.md)**: **COMPLETED**
- **[Sub-issue i1b: Mount Real API & Auth Flow into App.tsx](file:///home/pro/Downloads/expiry/docs/issues-context/i1/i1b.md)**: **READY TO CLAIM** (Tách `?demo=1` sang `DemoApp.tsx`, cắm `useExpiry()` và `AuthForm.tsx` vào `App.tsx`).
- **Sub-issue i1c**: Domain Mutations (Thêm món, trừ tồn kho, xóa rác, scan ảnh thực tế).
- **Sub-issue i1d**: End-to-End Verification trên môi trường staging.

---

## 4. Triển khai & Xử lý Sub-issue i1a

1. **Khắc phục lỗi**:
   - Thêm alias handler `upload = (req, res, next) => this.scan(req, res, next);` trong [apps/api/src/modules/scan/scan.controller.mjs](file:///home/pro/Downloads/expiry/apps/api/src/modules/scan/scan.controller.mjs).
2. **Kiểm thử xác minh**:
   - `npm run test:api`: **19/19 passed, 0 failed, 1 skipped** (Đạt 100%).
   - `npm run build:web`: **Build thành công sạch sẽ**.
3. **Quy trình Git & PR**:
   - Tạo nhánh `feature/i1a-scan-route`.
   - Push lên remote và tạo **Pull Request #2**: [https://github.com/tducn110/expiry/pull/2](https://github.com/tducn110/expiry/pull/2).
   - Tự động Rebase & Merge PR #2 vào `develop`.

---

## 5. Thao tác Vercel CLI & Triển khai 2 URL Độc Lập

Đã sử dụng Vercel CLI trực tiếp trên hệ thống để hoàn thành toàn bộ luồng deploy:

1. **Cấu hình SPA Rewrites**:
   - Tạo cấu hình tại [vercel.json](file:///home/pro/Downloads/expiry/vercel.json) (root) và [apps/web/vercel.json](file:///home/pro/Downloads/expiry/apps/web/vercel.json) để tránh lỗi 404 khi truy cập client routes trên Vercel.
2. **Triển khai Môi trường Test Demo (`develop`)**:
   - Lệnh: `npx -y vercel domains add demoexpiry.vercel.app uidemo`
   - Lệnh: `npx -y vercel --yes`
   - Gán alias: `npx -y vercel alias set <deployment-url> demoexpiry.vercel.app`
   - **Kết quả**: Truy cập [https://demoexpiry.vercel.app](https://demoexpiry.vercel.app) trả về **HTTP 200 OK**.
3. **Triển khai Môi trường Production Chính thức (`main`)**:
   - Lệnh: `npx -y vercel domains add expiryapp.vercel.app uidemo`
   - Lệnh: `npx -y vercel --prod --yes`
   - **Kết quả**: Truy cập [https://expiryapp.vercel.app](https://expiryapp.vercel.app) trả về **HTTP 200 OK**.
   *(Lưu ý: Domain `expiry.vercel.app` đã bị bên thứ 3 sở hữu từ trước trên Vercel, nên đã đăng ký và gán thành công domain chuẩn đẹp `expiryapp.vercel.app`)*.
4. **Cập nhật CORS & Session Cookie**:
   - Đã thêm `https://demoexpiry.vercel.app` và `https://expiryapp.vercel.app` vào `configuredOrigins` trong [apps/api/src/app.mjs](file:///home/pro/Downloads/expiry/apps/api/src/app.mjs).
   - Đã tạo PR #3 ([#3](https://github.com/tducn110/expiry/pull/3)) và PR #4 ([#4](https://github.com/tducn110/expiry/pull/4)), sau đó Rebase & Merge vào nhánh `develop`.

---

## 6. Danh Mục Pull Requests Đã Hoàn Thành trong Session

| PR # | Nhánh nguồn | Nhánh đích | Nội dung | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| **#2** | `feature/i1a-scan-route` | `develop` | Fix scan upload handler, auth module, và sub-issues context | **Merged (Rebase)** |
| **#3** | `feature/config-vercel-domains` | `develop` | Cấu hình allowed origins cho Vercel domains và cập nhật context i1 | **Merged (Rebase)** |
| **#4** | `feature/update-origins-and-context` | `develop` | Bổ sung `expiryapp.vercel.app` vào allowed origins trong `app.mjs` | **Merged (Rebase)** |

---

## 7. Bước Tiếp Theo Sẵn Sàng Thực Hiện (Next Steps)

- **Triển khai Sub-issue [i1b: Mount Real API & Auth Flow into App.tsx](file:///home/pro/Downloads/expiry/docs/issues-context/i1/i1b.md)**:
  1. Tạo nhánh `feature/i1b-app-auth-connect` từ `develop`.
  2. Tách luồng `?demo=1` sang [apps/web/src/demo/DemoApp.tsx](file:///home/pro/Downloads/expiry/apps/web/src/demo/DemoApp.tsx).
  3. Cắm hook `useExpiry()` và modal `AuthForm.tsx` vào [apps/web/src/App.tsx](file:///home/pro/Downloads/expiry/apps/web/src/App.tsx).
  4. Test đăng ký / đăng nhập với Backend API thật, lưu session cookie vào trình duyệt.
  5. Mở PR vào `develop` và kiểm thử trực tiếp trên [https://demoexpiry.vercel.app](https://demoexpiry.vercel.app).
