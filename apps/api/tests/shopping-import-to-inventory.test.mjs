import assert from 'node:assert/strict';
import test from 'node:test';
import { ShoppingService } from '../src/modules/shopping/shopping.service.mjs';
import { InventoryRepository } from '../src/shared/repository.mjs';

const owner = 'owner-1';
const itemId = 'shopping-item-1';
const commandKey = 'shopping_atomic_import_001';

test('atomic import inventory writer accepts and stores the selected unit', async () => {
  const calls = [];
  const row = {
    id: 'food-entry-1', name: 'Sữa', storage_location: 'unspecified',
    category: 'dairy_eggs', remaining_quantity: '3.000', unit: 'hộp',
    expiry_date: null, date_certainty: 'unknown', date_source: 'unknown',
    date_label_type: 'unspecified', opened_on: null, manufactured_on: null,
    review_at: null, note: null, barcode: null, barcode_format: null,
    version: 1, deleted_at: null, created_at: '2026-11-19 10:00:00.000000',
    updated_at: '2026-11-19 10:00:00.000000',
  };
  const connection = {
    execute: async (sql, values) => {
      calls.push({ sql, values });
      return sql.startsWith('SELECT * FROM food_entries') ? [[row], []] : [{ affectedRows: 1 }, []];
    },
  };
  const repository = new InventoryRepository('unused');
  const entry = await repository.createEntryInTransaction(connection, owner, {
    name: 'Sữa', quantity: '3', unit: 'hộp', category: 'dairy_eggs',
  });
  assert.equal(entry.unit, 'hộp');
  assert.equal(calls[0].values.at(-1), 'hộp');
  assert.equal(calls[0].values.at(-2), '3.000');
  assert.equal(calls[1].values.at(-1), '3.000');
});
const entryInput = {
  name: 'Sữa', storage_location: 'unspecified', category: 'dairy_eggs',
  expiry_date: null, date_certainty: 'unknown', date_source: 'unknown',
  date_label_type: 'unspecified', opened_on: null, manufactured_on: null,
  review_at: null, note: null, barcode: null, quantity: '1.000', unit: 'piece',
};

function fixture(overrides = {}) {
  const state = {
    item: {
      id: itemId,
      payload: { name: 'Sữa', quantity: 1, unit: 'hộp', category: 'dairy_eggs', checked: true },
      version: 3,
      created_at: '2026-11-19 10:00:00.000000',
    },
    commands: new Map(),
    insertedEntry: 0,
    commits: 0,
    rollbacks: 0,
    itemWrites: 0,
  };
  const connection = {
    async beginTransaction() {},
    async commit() { state.commits++; },
    async rollback() { state.rollbacks++; },
    async end() {},
    async execute(sql, values = []) {
      if (sql.startsWith('INSERT INTO api_requests')) {
        const key = `${values[0]}:${values[1]}`;
        if (state.commands.has(key)) {
          const error = new Error('duplicate');
          error.code = 'ER_DUP_ENTRY';
          throw error;
        }
        state.commands.set(key, { operation: values[2], hash: values[3], response: null });
        return [{ affectedRows: 1 }];
      }
      if (sql.startsWith('SELECT operation,request_hash,response_status,response_body')) {
        const saved = state.commands.get(`${values[0]}:${values[1]}`);
        return [[saved && saved.response ? {
          operation: saved.operation,
          request_hash: saved.hash,
          response_status: saved.response.status,
          response_body: saved.response.body,
        } : null]];
      }
      if (sql.startsWith('UPDATE api_requests SET response_status=')) {
        const saved = state.commands.get(`${values[2]}:${values[3]}`);
        saved.response = { status: values[0], body: JSON.parse(values[1]) };
        return [{ affectedRows: 1 }];
      }
      if (sql.startsWith('SELECT id,payload,version,created_at FROM shopping_items')) {
        if (sql.includes('FOR UPDATE') && overrides.missing) return [[null]];
        return [[state.item]];
      }
      if (sql.startsWith("UPDATE shopping_items SET payload=JSON_SET")) {
        if (overrides.markerError) throw overrides.markerError;
        state.item = { ...state.item, payload: { ...state.item.payload, inventoryAddedAt: values[0] }, version: state.item.version + 1 };
        state.itemWrites++;
        return [{ affectedRows: 1 }];
      }
      if (sql.startsWith('SELECT timezone,attention_lead_days,version FROM users')) {
        return [[{ timezone: 'Asia/Ho_Chi_Minh', attention_lead_days: 3, version: 1 }]];
      }
      throw new Error(`Unexpected SQL: ${sql}`);
    },
  };
  const inventoryRepository = {
    async createEntryInTransaction() {
      state.insertedEntry++;
      if (overrides.createError) throw overrides.createError;
      return {
        id: 'food-entry-1', name: 'Sữa', storage_location: 'unspecified',
        category: 'dairy_eggs', remaining_quantity: '1.000', unit: 'piece',
        expiry_date: null, date_certainty: 'unknown', date_source: 'unknown',
        date_label_type: 'unspecified', opened_on: null, manufactured_on: null,
        review_at: null, note: null, barcode: null, barcode_format: null,
        version: 1, deleted_at: null,
        created_at: '2026-11-19 10:00:00.000000', updated_at: '2026-11-19 10:00:00.000000',
      };
    },
  };
  const service = new ShoppingService('expiry_test', {
    connect: async () => connection,
    inventoryRepository,
    clock: () => new Date('2026-11-19T10:01:00.000Z'),
  });
  return { service, state };
}

const request = expected_version => ({ expected_version, entry: entryInput });

test('Shopping import creates inventory and marks the item in one command', async () => {
  const { service, state } = fixture();
  const result = await service.importToInventory(owner, commandKey, itemId, request(3));
  assert.equal(result.status, 201);
  assert.equal(result.body.entry.id, 'food-entry-1');
  assert.equal(result.body.item.inventoryAddedAt, '2026-11-19T10:01:00.000Z');
  assert.equal(result.body.item.version, 4);
  assert.equal(state.insertedEntry, 1);
  assert.equal(state.itemWrites, 1);
  assert.equal(state.commits, 1);
  assert.equal(state.rollbacks, 0);
});

test('Shopping import rolls back entry and item marker when entry creation fails', async () => {
  const { service, state } = fixture({ createError: new Error('entry write failed') });
  await assert.rejects(service.importToInventory(owner, commandKey, itemId, request(3)), /entry write failed/);
  assert.equal(state.itemWrites, 0);
  assert.equal(state.rollbacks, 1);
  assert.equal(state.commits, 0);
});

test('Shopping import rolls back a created entry if the Shopping marker write fails', async () => {
  const { service, state } = fixture({ markerError: new Error('marker write failed') });
  await assert.rejects(service.importToInventory(owner, commandKey, itemId, request(3)), /marker write failed/);
  assert.equal(state.insertedEntry, 1);
  assert.equal(state.itemWrites, 0);
  assert.equal(state.rollbacks, 1);
  assert.equal(state.commits, 0);
});

test('Shopping import enforces owner, checked state, and expected item version', async () => {
  const missing = fixture({ missing: true });
  await assert.rejects(missing.service.importToInventory(owner, commandKey, itemId, request(3)), error => error.code === 'NOT_FOUND');

  const unchecked = fixture();
  unchecked.state.item.payload.checked = false;
  await assert.rejects(unchecked.service.importToInventory(owner, commandKey, itemId, request(3)), error => error.code === 'SHOPPING_NOT_CHECKED');
  assert.equal(unchecked.state.insertedEntry, 0);

  const imported = fixture();
  imported.state.item.payload.inventoryAddedAt = '2026-11-19T09:00:00.000Z';
  await assert.rejects(imported.service.importToInventory(owner, commandKey, itemId, request(3)), error => error.code === 'SHOPPING_ALREADY_IMPORTED');
  assert.equal(imported.state.insertedEntry, 0);

  const stale = fixture();
  await assert.rejects(stale.service.importToInventory(owner, commandKey, itemId, request(2)), error => error.code === 'VERSION_CONFLICT');
  assert.equal(stale.state.insertedEntry, 0);
});

test('Shopping import replays the same idempotent command without a second inventory entry', async () => {
  const { service, state } = fixture();
  const first = await service.importToInventory(owner, commandKey, itemId, request(3));
  const replay = await service.importToInventory(owner, commandKey, itemId, request(3));
  assert.deepEqual(replay.body, first.body);
  assert.equal(replay.replayed, true);
  assert.equal(state.insertedEntry, 1);
  assert.equal(state.itemWrites, 1);
});
