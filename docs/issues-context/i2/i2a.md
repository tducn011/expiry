# Sub-issue i2a: Fix Barcode TypeScript Errors & Scanner UI Adapter Contracts

- **Parent Issue**: [i2: Barcode Scanning & Vision Date Extraction Support](./i2.md)
- **Assignee**: Antigravity (`@tducn110`)
- **Status**: **READY TO CLAIM**
- **Branch**: `feature/barcode`
- **Target Branch**: `develop`
- **Date**: 2026-10-19

---

## 1. Khung Sub-issue (Framework)

### INPUT
- Source files:
  - `apps/web/src/App.tsx`
  - `apps/web/src/hooks/useExpiry.ts`
  - `apps/web/src/components/ui/BarcodeScannerModal.tsx`
  - `apps/web/src/features/EntryForm.tsx`

### VẤN ĐỀ RA SAO? (Problem Statement)
Khi chạy lệnh kiểm tra tĩnh TypeScript `npm run typecheck`, trình biên dịch `tsc` báo 4 lỗi nghiêm trọng:
1. `src/App.tsx:591:77`: `real.scan(file, barcode)` truyền 2 đối số, trong khi chữ ký method trong `useExpiry.ts` chỉ nhận 1 đối số (`file: File`).
2. `src/components/ui/BarcodeScannerModal.tsx:212`: Thuộc tính `className="barcode-modal"` không tồn tại trong interface của `Modal` component.
3. `src/components/ui/BarcodeScannerModal.tsx:460`: Thuộc tính `style={{ whiteSpace: "nowrap" }}` không thuộc props interface của `Button` component.
4. `src/features/EntryForm.tsx:293`: Thuộc tính `title="Quét mã vạch sản phẩm"` không nằm trong props interface của `Button` component.

Hậu quả: Không thể hoàn tất lệnh build sản phẩm `npm run build:web` và làm vỡ pipeline kiểm thử CI.

### OUTPUT
1. Cập nhật `apps/web/src/hooks/useExpiry.ts`:
   - Mở rộng hàm `scan`: `const scan = async (file: File, barcode?: string) => { return await api.scan(file, barcode); }`.
2. Cập nhật `apps/web/src/components/ui/BarcodeScannerModal.tsx`:
   - Bỏ `className="barcode-modal"` thừa trên component `<Modal>`.
   - Chuyển `style={{ whiteSpace: "nowrap" }}` trên `<Button>` sang class CSS `whitespace-nowrap` hợp lệ với Tailwind.
3. Cập nhật `apps/web/src/features/EntryForm.tsx`:
   - Bỏ thuộc tính `title` không hợp lệ trên `<Button>` hoặc bọc ngoài bằng thẻ `div`/`span` có `title`.
4. Đảm bảo lệnh `npm run typecheck` đạt kết quả xanh (0 errors).

### FINAL CONTRACT
- Chữ ký hàm quét ảnh kèm mã vạch trong frontend:
  ```typescript
  scan: (file: File, barcode?: string) => Promise<ScanResult>
  ```
- Toàn bộ component UI tuân thủ nghiêm ngặt props contract đã định nghĩa trong `apps/web/src/components/ui/`.

### LÀM SAO ĐỂ NHẬN ĐỊNH OUTPUT ĐÚNG HAY SAI (VERIFICATION)
1. **TypeScript Typecheck**:
   ```bash
   npm run typecheck
   ```
   *Tiêu chí đạt*: Exit code 0, không có bất kỳ thông báo lỗi typecheck nào.
2. **Build Web Frontend**:
   ```bash
   npm run build:web
   ```
   *Tiêu chí đạt*: Vite build thành công bundle production vào thư mục `dist/`.
3. **Web UI Test Suite**:
   ```bash
   npm run test:ui
   ```
   *Tiêu chí đạt*: 15 passed, 0 failed.
