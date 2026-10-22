import { InventoryRepository } from '../../shared/repository.mjs';
import { DomainError } from '../../shared/domain.mjs';
import { commandDTO } from '../../shared/public-dto.mjs';

export async function ownerPreferences(connection, owner) {
  const [[preferences]] = await connection.execute('SELECT timezone,attention_lead_days,version FROM users WHERE id=?', [owner]);
  if (!preferences) throw new DomainError(401, 'AUTH_REQUIRED');
  return preferences;
}

// The public snapshot is produced before the repository saves api_requests and
// commits. A replay therefore returns the original DTO and its original as-of
// day, even if preferences, the clock, or the entry later change.
export function publicCommandWork(work, owner, clock, readPreferences = ownerPreferences) {
  return async connection => {
    const result = await work(connection);
    if (result.body === null) return result;
    return commandDTO(result, await readPreferences(connection, owner), clock());
  };
}

export class PublicInventoryRepository extends InventoryRepository {
  execute(owner, key, operation, payload, work) {
    return super.execute(owner, key, operation, payload, publicCommandWork(work, owner, this.clock));
  }
}
