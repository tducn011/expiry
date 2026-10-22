# Sub-issue i1c: Connect Domain Operations (Create, Movement, Trash, Scan)

- **Parent Issue**: [i1: Connect API & Web](./i1.md)
- **Assignee**: Antigravity (`@tducn110`)
- **Status**: **COMPLETED**
- **Branch**: `feature/i1c-domain-mutations`
- **Target Branch**: `develop`
- **Date**: 2026-10-20

---

## 1. Khung Sub-issue (Standard Framework)

### INPUT
- Source files:
  - `apps/web/src/features/EntryForm.tsx`
  - `apps/web/src/features/MovementForm.tsx`
  - `apps/web/src/features/Trash.tsx`
  - `apps/web/src/features/Detail.tsx`
  - `apps/web/src/hooks/useExpiry.ts`
  - `apps/web/src/App.tsx`
  - `apps/web/src/api/client.ts`

### VẤN ĐỀ RA SAO?
- Khi người dùng thực hiện các thao tác ghi dữ liệu:
  1. Thêm thực phẩm mới (`EntryForm`)
  2. Dùng bớt / Bỏ đi / Thêm số lượng (`MovementForm`)
  3. Xóa món ăn vào thùng rác hoặc Khôi phục từ thùng rác (`Trash`)
  4. Sửa thông tin món ăn (`Detail` edit modal)
- Các thao tác này cần gửi mutations lên Backend API thật kèm:
  - Khóa lạc quan (`expected_version`): Để ngăn ngừa ghi đè dữ liệu khi có nhiều tab hoặc nhiều thiết bị cùng thao tác (tránh Lost Update).
  - Khóa chống lặp (`Idempotency-Key`): Để ngăn ngừa trừ kho 2 lần khi mạng chập chờn hoặc người dùng click đúp nút submit.
- Cần đấu nối các callbacks từ các component form vào các phương thức tương ứng của hook `useExpiry`: `createFood`, `recordMovement`, `recountFood`, `deleteFood`, `restoreFood`, `updateFood`.
- Bắt các lỗi domain (ví dụ: 409 `VERSION_CONFLICT` / `CONCURRENT_MODIFICATION`, 409 `INSUFFICIENT_QUANTITY`) và hiển thị thông báo lỗi thân thiện bằng tiếng Việt trên `StatusDialog` và UI Toast.

### OUTPUT
1. Cập nhật `apps/web/src/api/client.ts`:
   - Bổ sung alias `CONCURRENT_MODIFICATION` vào `errorMessage` tương đương `VERSION_CONFLICT`.
2. Cập nhật `apps/web/src/hooks/useExpiry.ts`:
   - Hàm `run` trả về `{ ok: boolean, body?: unknown, error?: ApiError }`.
   - Cung cấp các domain mutation helpers: `createFood`, `recordMovement`, `recountFood`, `updateFood`, `deleteFood`, `restoreFood`.
3. Cập nhật `apps/web/src/App.tsx`:
   - Đấu nối form callbacks vào các helper methods của `useExpiry`.
   - Bắt lỗi 409 `VERSION_CONFLICT` / `CONCURRENT_MODIFICATION` -> Kích hoạt modal `StatusDialog` `"conflict"` và gọi `real.refresh()`.
   - Bắt lỗi 409 `INSUFFICIENT_QUANTITY` -> Kích hoạt modal `StatusDialog` `"insufficient"` và gọi `real.refresh()`.
   - Khi phiên hết hạn (401) -> Kích hoạt modal `AuthForm` để đăng nhập lại.
4. Bổ sung test suite `apps/web/tests/domain-mutations.test.ts` kiểm chứng:
   - Dịch lỗi tiếng Việt chính xác.
   - Idempotency key là UUID hợp lệ và bất biến.
   - DTOs và decimal format đúng chuẩn API contract.
   - Header `Idempotency-Key` được truyền đầy đủ qua `ApiClient.execute`.

### FINAL CONTRACT
- Header bắt buộc cho các mutation POST/PATCH/DELETE: `Idempotency-Key: <unique-uuid>`
- Body/query các thao tác sửa/xóa/movement bắt buộc kèm trường `expected_version`.
- Response 200/201 trả về đối tượng `Entry` với `version` mới nhất.

### LÀM SAO ĐỂ NHẬN ĐỊNH ĐÚNG/SAI (VERIFICATION)
1. `npm run typecheck` thành công 100% không có lỗi TypeScript.
2. `npm run build:web` biên dịch thành công.
3. `npm --workspace=apps/web test` đạt 18/18 tests pass.
4. `npm --workspace=apps/api test` đạt 25/25 tests pass.
