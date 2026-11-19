import assert from 'node:assert/strict';
import test from 'node:test';
import { ShoppingService } from '../src/modules/shopping/shopping.service.mjs';

test('shopping create validates and binds its command and item to the verified owner', async () => {
  const calls = [];
  let created;
  const connection = {
    async beginTransaction() {}, async commit() {}, async rollback() {}, async end() {},
    async execute(sql, values) {
      calls.push({ sql, values });
      if (sql.startsWith('INSERT INTO shopping_items')) {
        created = { id: values[0], payload: JSON.parse(values[2]), version: 1, created_at: '2026-11-19 10:00:00.000000' };
        return [{ affectedRows: 1 }];
      }
      if (sql.startsWith('SELECT id,payload,version,created_at')) return [[created]];
      return [{ affectedRows: 1 }];
    },
  };
  const service = new ShoppingService('expiry_test_shopping', { connect: async () => connection });
  const result = await service.create('owner-1', 'shopping_create_001', { name: 'Sữa', quantity: 1, unit: 'hộp' });
  assert.equal(result.body.name, 'Sữa');
  assert.equal(result.body.checked, false);
  assert.equal(calls.find(call => call.sql.startsWith('INSERT INTO api_requests')).values[0], 'owner-1');
  assert.equal(calls.find(call => call.sql.startsWith('INSERT INTO shopping_items')).values[1], 'owner-1');
  assert.match(calls.find(call => call.sql.startsWith('INSERT INTO shopping_items')).sql, /user_id/);
});

test('shopping create rejects invalid input before opening MySQL', async () => {
  const service = new ShoppingService('expiry_test_shopping', { connect: async () => { throw new Error('must not connect'); } });
  await assert.rejects(service.create('owner-1', 'shopping_create_002', { name: ' ', checked: false }), error => error.code === 'VALIDATION_ERROR' && error.status === 422);
});

test('shopping get scopes lookup to the verified owner', async () => {
  const calls = [];
  const connection = {
    async execute(sql, values) {
      calls.push({ sql, values });
      return [[{ id: 'item-1', payload: { name: 'Sữa', checked: true }, version: 2, created_at: '2026-11-19 10:00:00.000000' }]];
    },
    async end() {},
  };
  const service = new ShoppingService('expiry_test_shopping', { connect: async () => connection });
  const result = await service.get('owner-1', 'item-1');
  assert.equal(result.id, 'item-1');
  assert.equal(calls[0].values[0], 'item-1');
  assert.equal(calls[0].values[1], 'owner-1');
  assert.match(calls[0].sql, /WHERE id=\? AND user_id=\?/);
});
