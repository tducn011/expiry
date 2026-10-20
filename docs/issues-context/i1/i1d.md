# Sub-issue i1d: Deploy Preview & End-to-End Verification on `develop`

- **Parent Issue**: [i1: Connect API & Web](./i1.md)
- **Assignee**: Antigravity (`@tducn110`)
- **Status**: **COMPLETED**
- **Branch**: `develop`
- **Target Branch**: `develop` -> `main`
- **Date**: 2026-10-20
- **Preview Environment**: `https://demoexpiry.vercel.app`

---

## 1. Khung Sub-issue (Standard Framework)

### INPUT
- Vercel Deployment URL: `https://demoexpiry.vercel.app`
- Backend API Endpoint: `https://demoexpiry.vercel.app/api/v1`
- E2E Test Suite: `scripts/test-behavior-contract.mjs`
- Test Suites:
  - `npm --workspace=apps/web test` (Vitest UI & component suite)
  - `npm --workspace=apps/api test` (Node API test suite)
  - `apps/web/tests/domain-mutations.test.ts`
  - `apps/web/tests/barcode-scanner.test.ts`
  - `apps/web/tests/client-contract.mjs`

### VẤN ĐỀ RA SAO?
- Sau khi hoàn thành các sub-issues `i1a`, `i1b`, `i1c`, toàn bộ mã nguồn frontend tích hợp real API đã được hợp nhất vào nhánh `develop`.
- Cần có cổng kiểm thử chất lượng (Release Gate) toàn diện nhằm đảm bảo:
  1. Hợp đồng OpenAPI (`contracts/openapi.json`) và hành vi runtime khớp 100%.
  2. Cơ chế Cookie session, bảo vệ CSRF và CORS hoạt động chính xác.
  3. Tất cả các luồng người dùng (User Journey: Đăng ký, Đăng nhập, Thêm món ăn, Quét mã vạch/OCR, Trừ kho, Xóa vào thùng rác, Khôi phục, Đăng xuất) hoạt động thông suốt.

### OUTPUT
1. Báo cáo kiểm thử E2E (End-to-End Verification Report):
   - **Quality Gate 1 (Typecheck)**: `node node_modules/typescript/bin/tsc -p apps/web/tsconfig.json --noEmit` đạt 0 lỗi.
   - **Quality Gate 2 (Production Build)**: `npm run build:web` biên dịch thành công bundle Vite.
   - **Quality Gate 3 (Web Vitest Suite)**: 23/23 tests pass (100%).
   - **Quality Gate 4 (Backend API Test Suite)**: 25/25 tests pass (100%).
   - **Quality Gate 5 (API Behavior & OpenAPI Contract)**: 13/13 stages trong `scripts/test-behavior-contract.mjs` đạt chuẩn.
2. Cập nhật trạng thái Master Issue `i1` và đóng Epic #36.

### FINAL CONTRACT
- 100% các route API trong `contracts/openapi.json` và UI flow trong `apps/web` hoạt động nhất quán, bảo mật và toàn vẹn.

### LÀM SAO ĐỂ NHẬN ĐỊNH ĐÚNG/SAI (VERIFICATION)
1. Kiểm tra build và test suites trên máy local:
   ```bash
   node node_modules/typescript/bin/tsc -p apps/web/tsconfig.json --noEmit
   npm run build:web
   npm --workspace=apps/web test
   npm --workspace=apps/api test
   ```
2. Kiểm tra trực quan trên môi trường Vercel Preview `https://demoexpiry.vercel.app` sau khi push lên remote `develop`.
