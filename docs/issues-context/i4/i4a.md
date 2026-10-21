# Sub-issue i4a: IndexedDB Mutation Store & Storage Adapter

- **Parent Issue**: [i4: Offline-First Mutation Queue & Background Reconnection Sync](./i4.md)
- **Assignee**: Unassigned
- **Status**: **READY TO CLAIM**
- **Branch**: `feature/i4a-indexeddb-store`
- **Target Branch**: `develop`
- **Date**: 2026-10-19

---

## 1. Khung Sub-issue (Framework)

### INPUT
- Source files:
  - `apps/web/src/api/client.ts`
  - `apps/web/src/domain/types.ts`

### VẤN ĐỀ RA SAO? (Problem Statement)
- Khi người dùng sử dụng ứng dụng trong môi trường không có kết nối Internet (nhà bếp, tầng hầm, siêu thị), mọi lệnh `POST /food-entries`, `POST /movements` đều ném ra lỗi `TypeError: Failed to fetch`.
- Dữ liệu người dùng vừa nhập vào form sẽ bị mất trắng nếu tắt ứng dụng hoặc refresh trang.
- Cần có cơ sở dữ liệu cục bộ phía client (IndexedDB) để lưu giữ hàng đợi mutation an toàn, bền vững qua các lần reload trang.

### OUTPUT
1. Tạo module `apps/web/src/lib/offlineStore.ts`:
   - Khởi tạo IndexedDB database `expiry_offline_db` với 2 object stores:
     - `pending_mutations`: `{ id, url, method, body, headers, idempotencyKey, createdAt, status }`
     - `cached_inventory`: lưu snapshot danh sách món ăn gần nhất để phục vụ hiển thị offline.
2. Cung cấp các hàm API:
   - `enqueueMutation(mutation)`
   - `peekNextMutation()`
   - `dequeueMutation(id)`
   - `listPendingMutations()`

### FINAL CONTRACT
- Schema IndexedDB:
  ```typescript
  interface StoredMutation {
    id: string;
    url: string;
    method: 'POST' | 'PATCH' | 'DELETE';
    body: any;
    idempotencyKey: string;
    createdAt: number;
    attempts: number;
  }
  ```

### LÀM SAO ĐỂ NHẬN ĐỊNH OUTPUT ĐÚNG HAY SAI (VERIFICATION)
1. **Unit Test với fake-indexeddb / Vitest**:
   - Viết test trong `apps/web/tests/offline-store.test.ts`:
     - Test enqueue -> reload -> dữ liệu vẫn còn trong IndexedDB.
     - Test FIFO ordering.
2. **Kiểm tra Typecheck**:
   ```bash
   npm run typecheck
   ```
   *Tiêu chí*: 0 lỗi TypeScript.
