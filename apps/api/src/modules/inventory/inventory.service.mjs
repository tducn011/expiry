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
    return entryDTO(entry, publicAttention(entry, await this.readPreferences(owner), this.clock()));
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
    const movements = await this.repo.get(owner, id, true);
    const start = (page - 1) * limit;
    return { items: movements.slice(start, start + limit).map(movementDTO), pagination: { page, limit, total: movements.length } };
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
