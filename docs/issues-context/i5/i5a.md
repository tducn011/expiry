# Sub-issue i5a: Open Food Facts API Client & Response Normalizer

- **Parent Issue**: [i5: Open Food Facts Product Catalog Integration & Metadata Enrichment](./i5.md)
- **Assignee**: Unassigned
- **Status**: **READY TO CLAIM**
- **Branch**: `feature/i5a-off-client`
- **Target Branch**: `develop`
- **Date**: 2026-10-19

---

## 1. Khung Sub-issue (Framework)

### INPUT
- Source files:
  - `apps/web/src/lib/barcode.ts`
  - `apps/web/src/domain/types.ts`
- External API:
  - Open Food Facts JSON API v2: `https://world.openfoodfacts.org/api/v2/product/{barcode}.json`

### VẤN ĐỀ RA SAO? (Problem Statement)
- Khi người dùng quét mã vạch thành công trong `BarcodeScannerModal.tsx`, ứng dụng hiện tại chỉ hiển thị chuỗi số mã vạch thô.
- Người dùng vẫn phải tự gõ lại toàn bộ tên món ăn từ đầu, làm giảm đáng kể giá trị tiện ích của tính năng quét mã vạch.
- Cần có module client an toàn, có timeout (<= 2 giây) và in-memory cache để tra cứu thông tin sản phẩm từ Open Food Facts.

### OUTPUT
1. Tạo module `apps/web/src/lib/openFoodFacts.ts`:
   - Hàm `fetchProductByBarcode(barcode: string): Promise<ProductLookupResult | null>`.
   - Chuẩn hóa trường tên sản phẩm: Ưu tiên `product_name_vi`, fallback sang `product_name_en` hoặc `product_name`.
   - Trích xuất `brands`, `image_front_small_url`, `categories_tags`.
   - Triển khai LRU cache trong bộ nhớ (tối đa 200 items) để tránh gọi trùng lặp.

### FINAL CONTRACT
- Schema `ProductLookupResult`:
  ```typescript
  export interface ProductLookupResult {
    barcode: string;
    name: string;
    brand?: string;
    imageUrl?: string;
    categories: string[];
    suggestedLocation?: 'fridge' | 'freezer' | 'pantry';
    suggestedShelfLifeDays?: number;
  }
  ```

### LÀM SAO ĐỂ NHẬN ĐỊNH OUTPUT ĐÚNG HAY SAI (VERIFICATION)
1. **Unit Test**:
   - Viết test trong `apps/web/tests/openfoodfacts.test.ts`:
     - Test mock API trả về sản phẩm thành công.
     - Test xử lý timeout khi mạng chậm (fallback trả về `null` không làm đơ UI).
     - Test cơ chế cache không gọi HTTP lần 2.
2. **Typecheck**:
   ```bash
   npm run typecheck
   ```
