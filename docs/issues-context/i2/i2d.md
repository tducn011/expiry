# Sub-issue i2d: Full-Stack Barcode Integration & Test Suite Verification

- **Parent Issue**: [i2: Barcode Scanning & Vision Date Extraction Support](./i2.md)
- **Assignee**: Antigravity (`@tducn110`)
- **Status**: **PLANNED**
- **Branch**: `feature/barcode`
- **Target Branch**: `develop`
- **Date**: 2026-10-19

---

## 1. Khung Sub-issue (Framework)

### INPUT
- Monorepo test suites:
  - `npm run test:api`
  - `npm run test:ui`
  - `npm run test:python`
  - `npm run test:dbops`
  - `npm run typecheck`
  - `npm run build:web`
  - `npm run test:behavior`

### VẤN ĐỀ RA SAO? (Problem Statement)
- Trước khi mở Pull Request từ nhánh `feature/barcode` vào nhánh `develop`, toàn bộ hệ thống phải vượt qua 100% các bài kiểm tra tự động mà không có bất kỳ regression hay typecheck error nào.

### OUTPUT
1. Chạy thành công toàn bộ test pipeline monorepo: `npm run test:all`.
2. Kiểm tra định dạng code: `npm run test:format`.
3. Kiểm tra tính toàn vẹn build bundle: `npm run build:web`.
4. Chuẩn bị PR merge vào `develop`.

### FINAL CONTRACT
- Tất cả các gate kiểm định CI đều đạt Exit Code 0.
- Không tồn tại commit lỗi hay xung đột rebase với `develop`.

### LÀM SAO ĐỂ NHẬN ĐỊNH OUTPUT ĐÚNG HAY SAI (VERIFICATION)
```bash
npm run test:all
```
*Tiêu chí đạt*:
- `test:api`: 22 passed, 0 failed.
- `test:ui`: 15 passed, 0 failed.
- `test:python`: PASS.
- `test:dbops`: PASS.
- `typecheck`: PASS (0 errors).
- `build:web`: PASS.
- `test:behavior`: PASS.
