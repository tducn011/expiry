import { connect } from '../../shared/connection.mjs';
import { entryDTO, movementDTO, inactiveAttention, publicAttention } from '../../shared/public-dto.mjs';
import { PublicInventoryRepository, ownerPreferences } from './public-inventory.repository.mjs';

export class InventoryService {
  constructor(database, options = {}) {
    this.database = database;
    this.clock = options.clock ?? (() => new Date());
    this.repo = options.repository ?? new PublicInventoryRepository(database, { ...options, clock: this.clock });
    this.readPreferences = options.readPreferences ?? (async owner => {
      const connection = await connect(this.database);
      try { return await ownerPreferences(connection, owner); }
      finally { await connection.end(); }
    });
  }

  async createEntry(owner, idempotencyKey, input) {
    return this.repo.create(owner, idempotencyKey, input);
  }

  async listEntries(owner, query) {
    return this.publicList(await this.repo.list(owner, query));
  }

  async getEntry(owner, id) {
    const entry = await this.repo.get(owner, id, false);
    const prefs = (entry.timezone && entry.attention_lead_days !== undefined)
      ? { timezone: entry.timezone, attention_lead_days: entry.attention_lead_days }
      : await this.readPreferences(owner);
    return entryDTO(entry, publicAttention(entry, prefs, this.clock()));
  }

  async editEntry(owner, idempotencyKey, id, input) {
    return this.repo.edit(owner, idempotencyKey, id, input);
  }

  async removeEntry(owner, idempotencyKey, id, input) {
    return this.repo.remove(owner, idempotencyKey, id, input);
  }

  async restoreEntry(owner, idempotencyKey, id, input) {
    return this.repo.restore(owner, idempotencyKey, id, input);
  }

  async recordMovement(owner, idempotencyKey, id, input) {
    return this.repo.consume(owner, idempotencyKey, id, input);
  }

  async listMovements(owner, id, { page = 1, limit = 20 } = {}) {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(limit) || 20));
    if (typeof this.repo.listMovements === 'function') {
      const { events, total } = await this.repo.listMovements(owner, id, { page: pageNum, limit: limitNum });
      return { items: events.map(movementDTO), pagination: { page: pageNum, limit: limitNum, total } };
    }
    const result = await this.repo.get(owner, id, true, { page: pageNum, limit: limitNum });
    if (Array.isArray(result)) {
      const start = (pageNum - 1) * limitNum;
      return { items: result.slice(start, start + limitNum).map(movementDTO), pagination: { page: pageNum, limit: limitNum, total: result.length } };
    }
    return { items: (result.events || []).map(movementDTO), pagination: { page: pageNum, limit: limitNum, total: result.total } };
  }

  async recountQuantity(owner, idempotencyKey, id, input) {
    return this.repo.recount(owner, idempotencyKey, id, input);
  }

  async listTrash(owner, query = {}) {
    return this.publicList(await this.repo.list(owner, { ...query, view: 'trash', lifecycle: 'all' }));
  }

  publicList(result) {
    return {
      items: result.items.map(entry => entryDTO(entry, entry.attention ?? inactiveAttention(result.as_of_date))),
      as_of_date: result.as_of_date,
      pagination: { page: result.page, limit: result.limit, total: result.total }
    };
  }
}
