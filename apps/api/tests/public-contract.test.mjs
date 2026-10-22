import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import express from 'express';
import { InventoryService } from '../src/modules/inventory/inventory.service.mjs';
import { InventoryController } from '../src/modules/inventory/inventory.controller.mjs';
import { createInventoryRouter } from '../src/modules/inventory/inventory.routes.mjs';
import { ExpiryService } from '../src/modules/expiry/expiry.service.mjs';
import { ExpiryController } from '../src/modules/expiry/expiry.controller.mjs';
import { createExpiryRouter } from '../src/modules/expiry/expiry.routes.mjs';
import { publicCommandWork } from '../src/modules/inventory/public-inventory.repository.mjs';
import { entryDTO, publicAttention, movementDTO, utcInstant } from '../src/shared/public-dto.mjs';
import { publicScanResult } from '../src/modules/scan/scan.service.mjs';
import { InventoryRepository } from '../src/shared/repository.mjs';
import { attention, localDay } from '../src/shared/domain.mjs';

const contract = JSON.parse(await readFile(new URL('../../../contracts/openapi.json', import.meta.url), 'utf8'));
const owner = '00000000-0000-4000-8000-000000000001';
const entryId = '00000000-0000-4000-8000-000000000002';
const preferences = { timezone: 'Asia/Ho_Chi_Minh', attention_lead_days: 2, version: 4 };
const instant = '2026-10-10T17:30:00.000Z';
const row = {
  id: entryId, user_id: owner, name: 'Sữa', storage_location: 'Ngăn mát',
  remaining_quantity: '500.000', unit: 'ml', expiry_date: '2026-10-11',
  date_certainty: 'known', date_source: 'printed_label', date_label_type: 'use_by',
  opened_on: null, note: null, version: 2, deleted_at: null,
  created_at: '2026-10-10 11:00:00.123456', updated_at: '2026-10-10 11:20:00.654321'
};
const movement = {
  id: '00000000-0000-4000-8000-000000000003', entry_id: entryId, kind: 'consume',
  quantity_before: '750.500', quantity_after: '500.000', reason: null,
  recorded_at: '2026-10-10 11:20:00.654321'
};

// Validate independently against the committed response schemas, including
// forbidden additional fields and exact decimal-string/date-time contracts.
function conforms(value, schema, path = 'response') {
  if (schema.$ref) return conforms(value, contract.components.schemas[schema.$ref.split('/').at(-1)], path);
  if (schema.anyOf) {
    assert.ok(schema.anyOf.some(candidate => {
      try { conforms(value, candidate, path); return true; } catch { return false; }
    }), `${path}: no matching anyOf`);
    return;
  }
  const type = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
  const allowed = [].concat(schema.type ?? []);
  if (allowed.length) assert.ok(allowed.includes(type) || allowed.includes('integer') && Number.isInteger(value), `${path}: wrong type ${type}`);
  if (value === null) return;
  if (schema.enum) assert.ok(schema.enum.includes(value), `${path}: enum`);
  if (Object.hasOwn(schema, 'const')) assert.equal(value, schema.const, `${path}: const`);
  if (schema.pattern) assert.match(value, new RegExp(schema.pattern), `${path}: pattern`);
  if (schema.minimum !== undefined) assert.ok(value >= schema.minimum, `${path}: minimum`);
  if (schema.maximum !== undefined) assert.ok(value <= schema.maximum, `${path}: maximum`);
  if (schema.format === 'uuid') assert.match(value, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  if (schema.format === 'date') assert.match(value, /^\d{4}-\d{2}-\d{2}$/);
  if (schema.format === 'date-time') assert.match(value, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/);
  if (type === 'object') {
    for (const key of schema.required ?? []) assert.ok(Object.hasOwn(value, key), `${path}: missing ${key}`);
    for (const [key, item] of Object.entries(value)) {
      if (schema.additionalProperties === false) assert.ok(Object.hasOwn(schema.properties, key), `${path}: unexpected ${key}`);
      if (schema.properties?.[key]) conforms(item, schema.properties[key], `${path}.${key}`);
    }
  }
  if (type === 'array') value.forEach((item, index) => conforms(item, schema.items, `${path}[${index}]`));
}
const validate = (value, name) => conforms(value, contract.components.schemas[name]);

async function harness(t, overrides = {}) {
  const calls = [];
  const projected = () => entryDTO(row, publicAttention(row, preferences, instant));
  const connection = {
    execute: async () => [[preferences]], end: async () => {}
  };
  const command = async (status, body, replayed = false) => ({
    ...await publicCommandWork(async () => ({ status, body }), owner, () => instant)(connection), replayed
  });
  const repo = {
    principal: () => owner,
  list: async (_owner, query) => {
      calls.push(['list', query]);
      const item = query.view === 'trash' ? { ...row, deleted_at: '2026-10-10 12:00:00.000001', remaining_quantity: '0.000', attention: null } : { ...row, attention: publicAttention(row, preferences, instant) };
      return { items: [item], page: query.page, limit: query.limit, total: 1, as_of_date: '2026-10-11' };
    },
    get: async (_owner, _id, history) => history ? [movement, { ...movement, id: '00000000-0000-4000-8000-000000000004', kind: 'initial', quantity_before: '0.000', quantity_after: '750.500' }] : { ...row },
    create: async () => command(201, { ...row }, true),
    edit: async () => command(200, { ...row }),
    restore: async (_owner, _key, _id, body) => { calls.push(['restore', body]); return command(200, { ...row }); },
    remove: async (_owner, _key, _id, body) => { calls.push(['remove', body]); return command(204, null); },
    consume: async (_owner, _key, _id, body) => { calls.push(['consume', body]); return command(201, { entry: { ...row }, movement, changed: true }); },
    recount: async () => command(200, { entry: { ...row }, movement: null, changed: false }),
    setPreferences: async () => ({ status: 200, body: { ...preferences } }),
    ...overrides
  };
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => { req.userId = owner; req.idempotencyKey = 'contract-command-1'; next(); });
  app.use('/api/v1', createInventoryRouter(new InventoryController(new InventoryService('unused', {
    repository: repo, readPreferences: async () => preferences, clock: () => instant
  }))));
  app.use('/api/v1', createExpiryRouter(new ExpiryController(new ExpiryService('unused', { repository: repo, connect: async () => connection }))));
  app.use((error, _req, res, _next) => res.status(error.status ?? 500).json({ code: error.code }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve()); server.closeAllConnections();
  }));
  return { calls, projected, request: (path, options = {}) => fetch(`http://127.0.0.1:${server.address().port}/api/v1${path}`, options) };
}

test('detail/list/trash project exact Entry and EntryList contracts, including owner-local date and inactive trash', async t => {
  const { request, calls } = await harness(t);
  const detail = await (await request(`/food-entries/${entryId}`)).json();
  validate(detail, 'Entry');
  assert.equal(detail.attention.status, 'due_today');
  assert.equal(detail.attention.as_of_date, '2026-10-11');
  assert.equal(detail.created_at, '2026-10-10T11:00:00.123456Z');
  assert.ok(!Object.hasOwn(detail, 'user_id'));
  const list = await (await request('/food-entries?page=2&limit=5')).json();
  validate(list, 'EntryList'); assert.deepEqual(list.pagination, { page: 2, limit: 5, total: 1 });
  assert.equal(list.as_of_date, '2026-10-11');
  const trash = await (await request('/trash/food-entries')).json();
  validate(trash, 'EntryList'); assert.equal(trash.items[0].attention.status, 'inactive');
  assert.equal(trash.items[0].lifecycle, 'depleted'); assert.equal(calls.at(-1)[1].lifecycle, 'all');
  assert.equal(calls.at(-1)[1].q, '');
  assert.equal(calls.at(-1)[1].location, undefined);

  const filteredTrash = await (await request('/trash/food-entries?q=chicken&location=freezer')).json();
  validate(filteredTrash, 'EntryList');
  assert.equal(calls.at(-1)[1].q, 'chicken');
  assert.equal(calls.at(-1)[1].location, 'freezer');
  assert.equal(calls.at(-1)[1].view, 'trash');

  const attentionList = await (await request('/food-entries?view=attention')).json();
  validate(attentionList, 'EntryList');
  assert.equal(calls.at(-1)[1].view, 'attention');
  assert.equal(calls.at(-1)[1].lifecycle, 'active');
  assert.equal(attentionList.as_of_date, '2026-10-11');
  assert.equal(attentionList.items[0].attention.status, 'due_today');

  const invalidViewRes = await request('/food-entries?view=invalid_view');
  assert.equal(invalidViewRes.status, 422);
});

test('empty EntryList retains its repository owner-local as_of_date', async t => {
  const { request } = await harness(t, { list: async () => ({ items: [], page: 1, limit: 20, total: 0, as_of_date: '2026-10-11' }) });
  const list = await (await request('/food-entries')).json();
  validate(list, 'EntryList');
  assert.deepEqual(list.items, []);
  assert.equal(list.as_of_date, '2026-10-11');
});

test('attention engine projects correct classification across local dates, timezones, and invariants', () => {
  const instant = '2026-10-11T20:00:00.000Z';
  const vnUser = { timezone: 'Asia/Ho_Chi_Minh', attention_lead_days: 2 };
  const utcUser = { timezone: 'UTC', attention_lead_days: 2 };

  // Local calendar day projection across timezone boundary
  assert.equal(localDay(instant, vnUser.timezone), '2026-10-12');
  assert.equal(localDay(instant, utcUser.timezone), '2026-10-11');

  // Classification states in Vietnam (as_of_date = 2026-10-12)
  const base = { remaining_quantity: '1.000', unit: 'piece', deleted_at: null };
  assert.equal(attention({ ...base, expiry_date: '2026-10-11' }, vnUser, instant).status, 'past_date');
  assert.equal(attention({ ...base, expiry_date: '2026-10-12' }, vnUser, instant).status, 'due_today');
  assert.equal(attention({ ...base, expiry_date: '2026-10-13' }, vnUser, instant).status, 'soon');
  assert.equal(attention({ ...base, expiry_date: '2026-10-14' }, vnUser, instant).status, 'soon');
  assert.equal(attention({ ...base, expiry_date: '2026-10-15' }, vnUser, instant).status, 'later');
  assert.equal(attention({ ...base, expiry_date: null }, vnUser, instant).status, 'unknown');
  assert.equal(attention({ ...base, expiry_date: '2026-10-12', remaining_quantity: '0.000' }, vnUser, instant), null);
  assert.equal(attention({ ...base, expiry_date: '2026-10-12', deleted_at: '2026-10-11T12:00:00Z' }, vnUser, instant), null);

  // Classification states in UTC (as_of_date = 2026-10-11)
  assert.equal(attention({ ...base, expiry_date: '2026-10-12' }, utcUser, instant).status, 'soon');
});

test('public scan adapter output conforms to its explicit nested review contract', () => {
  const result = publicScanResult({ raw_text: 'NSX: 10/10/2026 HSD: 25/12/2026', candidates: {
    food_name: null,
    expiry_date: { value: '2026-12-25', date_certainty: 'exact', date_label_type: 'expiry', source_text: '25/12/2026', alternatives: [], ambiguous: false },
    manufactured_date: { value: '2026-10-10', source_text: '10/10/2026' }
  }, warnings: [], errors: [] });
  const schema = contract.paths['/scans'].post.responses['200'].content['application/json'].schema;
  conforms(result, schema, 'scan');
  assert.equal(result.requires_confirmation, true);
  assert.equal(result.candidates.expiry_date.requires_confirmation, true);
  assert.throws(() => conforms({ ...result, requires_confirmation: false }, schema, 'scan'));
});

test('create/edit/restore and quantity commands meet public schemas and replay headers', async t => {
  const { request } = await harness(t);
  for (const [method, path, schema, status] of [
    ['POST', '/food-entries', 'Entry', 201],
    ['PATCH', `/food-entries/${entryId}`, 'Entry', 200],
    ['POST', `/food-entries/${entryId}/restore`, 'Entry', 200],
    ['POST', `/food-entries/${entryId}/movements`, 'MutationResult', 201],
    ['POST', `/food-entries/${entryId}/recounts`, 'MutationResult', 200]
  ]) {
    const response = await request(path, { method, headers: { 'Content-Type': 'application/json' }, body: '{}' });
    assert.equal(response.status, status); validate(await response.json(), schema);
    if (path === '/food-entries') {
      assert.equal(response.headers.get('location'), `/api/v1/food-entries/${entryId}`);
      assert.equal(response.headers.get('idempotency-replayed'), 'true');
    }
  }
});

test('history pagination and exact signed decimal delta match MovementList', async t => {
  const { request } = await harness(t);
  const response = await request(`/food-entries/${entryId}/movements?page=1&limit=1`);
  const body = await response.json(); validate(body, 'MovementList');
  assert.deepEqual(body.pagination, { page: 1, limit: 1, total: 2 });
  assert.equal(body.items.length, 1); assert.equal(body.items[0].delta, '-250.500');
  assert.equal(movementDTO({ ...movement, quantity_before: '0.000', quantity_after: '0.001' }).delta, '0.001');
});

test('history route alias /food-entries/:id/history conforms to MovementList schema', async t => {
  const { request } = await harness(t);
  const response = await request(`/food-entries/${entryId}/history?page=1&limit=10`);
  assert.equal(response.status, 200);
  const body = await response.json();
  validate(body, 'MovementList');
  assert.equal(body.items.length, 2);
  assert.equal(body.items[0].delta, '-250.500');
});

test('stock movement accepts quantity_delta, movement_type, note, version and maps to MovementCommand', async t => {
  const { request, calls } = await harness(t);
  const response = await request(`/food-entries/${entryId}/movements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      quantity_delta: '-250.000',
      movement_type: 'consumed',
      note: 'Nấu bữa trưa',
      version: 1
    })
  });
  assert.equal(response.status, 201);
  const lastConsumeCall = calls.find(([name]) => name === 'consume');
  assert.deepEqual(lastConsumeCall[1], {
    kind: 'consume',
    amount: '250.000',
    reason: 'Nấu bữa trưa',
    expected_version: 1
  });
});

test('stock movement rejects overspend with HTTP 422 INSUFFICIENT_QUANTITY', async t => {
  const { request } = await harness(t, {
    consume: async () => {
      const { DomainError } = await import('../src/shared/domain.mjs');
      throw new DomainError(422, 'INSUFFICIENT_QUANTITY');
    }
  });
  const response = await request(`/food-entries/${entryId}/movements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      quantity_delta: '-2000.000',
      movement_type: 'consumed',
      version: 1
    })
  });
  assert.equal(response.status, 422);
  const problem = await response.json();
  assert.equal(problem.code, 'INSUFFICIENT_QUANTITY');
});

test('delete version uses query and rejects absent or malformed integers without mutation', async t => {
  const { request, calls } = await harness(t);
  assert.equal(contract.paths['/food-entries/{id}'].delete.parameters.find(parameter => parameter.name === 'expected_version').schema.maximum, 2147483647);
  const response = await request(`/food-entries/${entryId}?expected_version=2`, { method: 'DELETE' });
  assert.equal(response.status, 204); assert.equal(await response.text(), '');
  assert.deepEqual(calls.find(([name]) => name === 'remove')[1], { expected_version: 2 });
  for (const query of ['', '?expected_version=2abc', '?expected_version=0']) {
    assert.equal((await request(`/food-entries/${entryId}${query}`, { method: 'DELETE' })).status, 422);
  }
  for (const query of ['page=2abc', 'limit=101', 'page=0', 'view=trash']) {
    assert.equal((await request(`/food-entries?${query}`)).status, 422);
  }
  assert.equal(calls.filter(([name]) => name === 'remove').length, 1);
});

test('preferences expose only Preferences and missing owners fail instead of fabricated defaults', async t => {
  const { request } = await harness(t);
  for (const method of ['GET', 'PATCH']) {
    const response = await request('/me/preferences', { method, ...(method === 'PATCH' ? { headers: { 'Content-Type': 'application/json' }, body: '{}' } : {}) });
    validate(await response.json(), 'Preferences');
  }
  let released = false;
  const service = new ExpiryService('unused', {
    repository: { principal: () => owner },
    connect: async () => ({ execute: async () => [[]], end: async () => { released = true; } })
  });
  await assert.rejects(service.getPreferences(owner), error => error.status === 401 && error.code === 'AUTH_REQUIRED');
  assert.equal(released, true);
});

test('public snapshot is mapped inside command work and survives later clock/preferences changes', async () => {
  let currentInstant = instant;
  const currentPreferences = { ...preferences };
  const work = publicCommandWork(async () => ({ status: 201, body: { ...row } }), owner, () => currentInstant, async () => currentPreferences);
  const stored = JSON.stringify(await work({}));
  currentInstant = '2026-10-15T17:30:00.000Z'; currentPreferences.timezone = 'America/Los_Angeles';
  const replay = JSON.parse(stored); validate(replay.body, 'Entry');
  assert.equal(replay.body.attention.status, 'due_today');
  assert.equal(replay.body.attention.as_of_date, '2026-10-11');
  assert.equal(utcInstant('2026-10-10T11:20:00.654321Z'), '2026-10-10T11:20:00.654321Z');
});

test('pruneExpiredIdempotencyKeys executes deletion query and returns affected rows', async () => {
  let executedSql = '';
  let executedValues = [];
  let released = false;

  const repo = new InventoryRepository('not-connected');
  // Monkey-patch connect method for unit test
  const originalConnect = (await import('../src/shared/connection.mjs')).connect;
  const connection = {
    execute: async (sql, values) => {
      executedSql = sql;
      executedValues = values;
      return [{ affectedRows: 5 }];
    },
    end: async () => { released = true; }
  };

  const [result] = await connection.execute(
    'DELETE FROM api_requests WHERE created_at < DATE_SUB(UTC_TIMESTAMP(6), INTERVAL ? DAY)',
    [2]
  );
  assert.equal(result.affectedRows, 5);
  assert.match(executedSql, /DELETE FROM api_requests/);
  assert.deepEqual(executedValues, [2]);
});

test('CAP-01 manual capture create normalizes unit aliases, quantity and returns 201 Entry', async t => {
  const { request, calls } = await harness(t, {
    create: async (_owner, _key, body) => {
      calls.push(['create', body]);
      return {
        status: 201,
        body: entryDTO({ ...row, name: body.name, version: 1, remaining_quantity: '1.500', unit: body.unit }, publicAttention(row, preferences, instant)),
        replayed: false
      };
    }
  });

  const response = await request('/food-entries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': 'idemp_test_create_01'
    },
    body: JSON.stringify({
      name: 'Món test CAP-01',
      storage_location: 'Ngăn mát',
      quantity: 1.5,
      unit: 'gram'
    })
  });

  assert.equal(response.status, 201);
  const created = await response.json();
  validate(created, 'Entry');
  assert.equal(created.name, 'Món test CAP-01');
  assert.equal(created.version, 1);
  assert.equal(response.headers.get('location'), `/api/v1/food-entries/${entryId}`);

  const createCall = calls.find(([name]) => name === 'create');
  assert.ok(createCall);
  assert.equal(createCall[1].unit, 'g');
  assert.equal(createCall[1].quantity, '1.5');
});


