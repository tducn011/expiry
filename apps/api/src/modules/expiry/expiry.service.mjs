import { InventoryRepository } from '../../shared/repository.mjs';
import { connect } from '../../shared/connection.mjs';

export class ExpiryService {
  constructor(database) {
    this.database = database;
    this.repo = new InventoryRepository(database);
  }

  async getPreferences(owner) {
    this.repo.principal(owner);
    const c = await connect(this.database);
    try {
      const [[user]] = await c.execute('SELECT id, identity_subject, display_name, timezone, attention_lead_days, version FROM users WHERE id = ?', [owner]);
      if (!user) {
        return {
          timezone: 'Asia/Ho_Chi_Minh',
          attention_lead_days: 3,
          version: 1
        };
      }
      return user;
    } finally {
      await c.end();
    }
  }

  async updatePreferences(owner, idempotencyKey, input) {
    return this.repo.setPreferences(owner, idempotencyKey, input);
  }
}
