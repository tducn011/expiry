# Sub-issue i1a: Fix Scan Route & Baseline API Verification

- **Parent Issue**: [i1: Connect API & Web](./i1.md)
- **Assignee**: Antigravity (`@tducn110`)
- **Status**: **CLAIMED / COMPLETED**
- **Branch**: `feature/i1a-scan-route`
- **Target Branch**: `develop`
- **Date**: 2026-10-11

---

## 1. Khung Sub-issue (Framework)

### INPUT
- Source files:
  - `apps/api/src/modules/scan/scan.routes.mjs`
  - `apps/api/src/modules/scan/scan.controller.mjs`
  - `apps/api/tests/api.test.mjs`

### VẤN ĐỀ RA SAO?
- Trong `scan.routes.mjs`, router khai báo:
  ```js
  router.post('/scans', controller.upload);
  ```
  Tuy nhiên, `ScanController` chỉ khai báo `scan` và `health`, hoàn toàn thiếu method `upload`.
- Hậu quả: Khi khởi tạo Express router, Express ném ra ngoại lệ:
  `Error: Route.post() requires a callback function but got a [object Undefined]`
- Lỗi này làm gãy ứng dụng khi khởi động và làm fail 2 test case trong `apps/api/tests/api.test.mjs`:
  1. `App initialization and healthcheck`
  2. `Protected routes reject missing credentials and caller identity headers`

### OUTPUT
- Thêm alias handler trong `ScanController`:
  ```js
  upload = (req, res, next) => this.scan(req, res, next);
  ```
- Khắc phục triệt để lỗi khởi tạo route `/scans`.
- Toàn bộ suite `npm run test:api` đạt kết quả xanh (19 passed, 0 failed, 1 skipped).

### FINAL CONTRACT
- Endpoint `POST /api/v1/scans` tiếp nhận `multipart/form-data` (trường `image` hoặc `file`) hoặc `application/json` (Base64) theo đúng đặc tả OpenAPI trong `contracts/public-api.yaml`.
- Kết quả phản hồi HTTP 200 dạng `ScanResult`:
  ```json
  {
    "raw_text": "...",
    "candidates": [
      {
        "food_name": "...",
        "expiry_date": "YYYY-MM-DD",
        "certainty": "exact|estimated|unknown"
      }
    ],
    "warnings": []
  }
  ```

### LÀM SAO ĐỂ NHẬN ĐỊNH OUTPUT ĐÚNG HAY SAI (VERIFICATION)
1. **Chạy test suite API**:
   ```bash
   npm run test:api
   ```
   *Tiêu chí đạt*: Exit code 0, 0 test fail, `App initialization and healthcheck` PASS.
2. **Kiểm tra build web frontend**:
   ```bash
   npm run build:web
   ```
   *Tiêu chí đạt*: Vite build thành công không có lỗi typecheck TypeScript.

---

## 2. Quy trình Git, PR & Deployment
1. Tạo branch: `feature/i1a-scan-route`.
2. Commit theo chuẩn Conventional Commits: `fix(api): bind scan upload handler and pass api test suite`.
3. Push lên GitHub: `git push -u origin feature/i1a-scan-route`.
4. Tạo PR vào nhánh `develop`: `gh pr create --base develop --fill`.
5. Tự merge PR vào `develop` qua chiến lược Rebase & Merge: `gh pr merge --rebase`.
6. Nhánh `develop` kích hoạt Preview Deployment trên Vercel để test trực tiếp.
