# Sub-issue i3a: MySQL Push Subscriptions Schema & Repository

- **Parent Issue**: [i3: Background Expiry Alert Dispatcher & Web Push Subsystem](./i3.md)
- **Assignee**: Unassigned
- **Status**: **READY TO CLAIM**
- **Branch**: `feature/i3a-push-schema`
- **Target Branch**: `develop`
- **Date**: 2026-10-19

---

## 1. Khung Sub-issue (Framework)

### INPUT
- Database files:
  - `database/mysql/migrations/`
  - `apps/api/src/shared/connection.mjs`

### VẤN ĐỀ RA SAO? (Problem Statement)
- Hiện tại hệ thống không lưu trữ bất kỳ thông tin thiết bị (PushSubscription) nào của người dùng.
- Khi người dùng đồng ý nhận thông báo trên điện thoại hoặc trình duyệt web, frontend nhận được một đối tượng `PushSubscription` (chứa `endpoint`, `keys.p256dh`, `keys.auth`). Cần có bảng lưu trữ an toàn trong MySQL gắn với `user_id`.

### OUTPUT
1. Tạo migration mới `database/mysql/migrations/004_add_push_subscriptions.sql`:
   ```sql
   CREATE TABLE push_subscriptions (
     id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
     user_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
     endpoint TEXT NOT NULL,
     endpoint_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
     p256dh_key VARCHAR(255) NOT NULL,
     auth_secret VARCHAR(255) NOT NULL,
     user_agent VARCHAR(255) NULL,
     created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
     revoked_at DATETIME(6) NULL,
     CONSTRAINT push_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
     CONSTRAINT push_endpoint_unique UNIQUE (user_id, endpoint_hash)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
   ```
2. Tạo `PushRepository` trong `apps/api/src/modules/expiry/push.repository.mjs`:
   - `saveSubscription(userId, subscription, userAgent)`
   - `listActiveSubscriptions(userId)`
   - `revokeSubscription(endpointHash)`

### FINAL CONTRACT
- Endpoint API:
  - `POST /api/v1/me/push-subscriptions` (201 Created)
  - `DELETE /api/v1/me/push-subscriptions` (204 No Content)

### LÀM SAO ĐỂ NHẬN ĐỊNH OUTPUT ĐÚNG HAY SAI (VERIFICATION)
1. **Chạy Migration**:
   ```bash
   node database/mysql/scripts/manage.mjs migrate
   ```
   *Tiêu chí*: Migration 004 hoàn thành không lỗi.
2. **Repository Unit Test**:
   - Thêm test case vào `apps/api/tests/api.test.mjs` kiểm tra lưu và revoke subscription.
