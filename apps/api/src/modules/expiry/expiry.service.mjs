import { InventoryRepository } from '../../shared/repository.mjs';
import { connect } from '../../shared/connection.mjs';
import { DomainError } from '../../shared/domain.mjs';
import { preferencesDTO } from '../../shared/public-dto.mjs';

export class ExpiryService {
  constructor(database, options = {}) {
    this.database = database;
    this.repo = options.repository ?? new InventoryRepository(database, options);
    this.connection = options.connect ?? connect;
  }

  async getPreferences(owner) {
    this.repo.principal(owner);
    const c = await this.connection(this.database);
    try {
      const [[user]] = await c.execute('SELECT timezone, attention_lead_days, version FROM users WHERE id = ?', [owner]);
      if (!user) throw new DomainError(401, 'AUTH_REQUIRED');
      return preferencesDTO(user);
    } finally {
      await c.end();
    }
  }

  async updatePreferences(owner, idempotencyKey, input) {
    return this.repo.setPreferences(owner, idempotencyKey, input);
  }
}
