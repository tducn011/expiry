import { InventoryRepository } from '../../shared/repository.mjs';

export class InventoryService {
  constructor(database, options = {}) {
    this.repo = new InventoryRepository(database, options);
  }

  async createEntry(owner, idempotencyKey, input) {
    return this.repo.create(owner, idempotencyKey, input);
  }

  async listEntries(owner, query) {
    return this.repo.list(owner, query);
  }

  async getEntry(owner, id) {
    return this.repo.get(owner, id, false);
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

  async listMovements(owner, id) {
    return this.repo.get(owner, id, true);
  }

  async recountQuantity(owner, idempotencyKey, id, input) {
    return this.repo.recount(owner, idempotencyKey, id, input);
  }

  async listTrash(owner, query = {}) {
    return this.repo.list(owner, { ...query, view: 'trash' });
  }
}
