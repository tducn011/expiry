#!/usr/bin/env node
import { AuthRepository } from '../apps/api/src/modules/auth/auth.repository.mjs';
import { InventoryRepository } from '../apps/api/src/shared/repository.mjs';
import { loadEnv, closePools } from '../apps/api/src/shared/connection.mjs';

async function main() {
  const env = await loadEnv();
  const authRepo = new AuthRepository(env.database);
  const inventoryRepo = new InventoryRepository(env.database);

  console.log(`[PRUNE] Đang dọn dẹp database ${env.database}...`);
  const sessionCount = await authRepo.pruneExpiredSessions();
  console.log(`[PRUNE] user_sessions: Đã xóa ${sessionCount} session hết hạn/bị thu hồi.`);

  const requestCount = await inventoryRepo.pruneExpiredIdempotencyKeys(2);
  console.log(`[PRUNE] api_requests: Đã xóa ${requestCount} idempotency key cũ hơn 48h.`);

  await closePools();
  console.log('[PRUNE] Hoàn tất dọn dẹp.');
}

main().catch(err => {
  console.error('[PRUNE ERROR]', err);
  process.exit(1);
});
