import { createHash, randomUUID } from 'node:crypto';
import { connect } from '../../shared/connection.mjs';
import { DomainError } from '../../shared/domain.mjs';

const categories = new Set(['fresh_produce','meat_seafood','dairy_eggs','prepared_food','dry_pantry','beverage','other']);
const idPattern = /^[A-Za-z0-9_-]{1,100}$/;
function validate(input, partial = false) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new DomainError(422, 'VALIDATION_ERROR');
  const allowed = ['name','quantity','unit','category','checked','addedFromInventory','note','inventoryAddedAt','matchedFoodId'];
  if (Object.keys(input).some(key => !allowed.includes(key) && !(partial && key === 'expected_version')) || (!partial && typeof input.name !== 'string')) throw new DomainError(422, 'VALIDATION_ERROR');
  if (input.name !== undefined && (!input.name.trim() || [...input.name].length > 200)) throw new DomainError(422, 'VALIDATION_ERROR');
  if (input.quantity !== undefined && input.quantity !== null && (typeof input.quantity !== 'number' || !Number.isFinite(input.quantity) || input.quantity <= 0 || input.quantity > 999999999.999)) throw new DomainError(422, 'VALIDATION_ERROR');
  if (input.category !== undefined && input.category !== null && !categories.has(input.category)) throw new DomainError(422, 'VALIDATION_ERROR');
  for (const key of ['checked','addedFromInventory']) if (input[key] !== undefined && typeof input[key] !== 'boolean') throw new DomainError(422, 'VALIDATION_ERROR');
  for (const key of ['unit','note','inventoryAddedAt','matchedFoodId']) if (input[key] !== undefined && input[key] !== null && typeof input[key] !== 'string') throw new DomainError(422, 'VALIDATION_ERROR');
}
function dto(row) {
  const payload = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;
  return { ...payload, id: row.id, version: Number(row.version), createdAt: new Date(`${row.created_at}Z`).toISOString() };
}
function hash(value) { return createHash('sha256').update(JSON.stringify(value)).digest('hex'); }
export class ShoppingService {
  constructor(database, options = {}) { this.database = database; this.connection = options.connect ?? connect; }
  async command(owner, key, operation, input, work) {
    if (!/^[A-Za-z0-9_-]{8,100}$/.test(key ?? '')) throw new DomainError(400, 'IDEMPOTENCY_KEY_REQUIRED');
    const c = await this.connection(this.database);
    try {
      await c.beginTransaction();
      const fingerprint = hash(input);
      try { await c.execute('INSERT INTO api_requests(user_id,idempotency_key,operation,request_hash) VALUES (?,?,?,?)', [owner,key,operation,fingerprint]); }
      catch (error) {
        if (error.code !== 'ER_DUP_ENTRY') throw error;
        const [[old]] = await c.execute('SELECT operation,request_hash,response_status,response_body FROM api_requests WHERE user_id=? AND idempotency_key=?', [owner,key]);
        if (!old || old.operation !== operation || old.request_hash !== fingerprint) throw new DomainError(409, 'IDEMPOTENCY_KEY_REUSED');
        if (old.response_status === null) throw new DomainError(500, 'INCOMPLETE_RESERVATION');
        await c.commit();
        return { status: old.response_status, body: typeof old.response_body === 'string' ? JSON.parse(old.response_body) : old.response_body, replayed: true };
      }
      const result = await work(c);
      await c.execute('UPDATE api_requests SET response_status=?,response_body=CAST(? AS JSON) WHERE user_id=? AND idempotency_key=?', [result.status, JSON.stringify(result.body), owner,key]);
      await c.commit();
      return { ...result, replayed: false };
    } catch (error) { await c.rollback(); throw error; }
    finally { await c.end(); }
  }
  async list(owner) {
    const c = await this.connection(this.database);
    try { const [rows] = await c.execute('SELECT id,payload,version,created_at FROM shopping_items WHERE user_id=? ORDER BY created_at DESC,id DESC', [owner]); return rows.map(dto); }
    finally { await c.end(); }
  }
  async create(owner, key, input) {
    validate(input);
    const payload = { ...input, quantity: input.quantity ?? null, unit: input.unit ?? null, checked: input.checked ?? false, addedFromInventory: input.addedFromInventory ?? false, category: input.category ?? 'other' };
    const result = await this.command(owner,key,'shopping.create',payload,async c => {
      const id = randomUUID();
      await c.execute('INSERT INTO shopping_items (id,user_id,payload,version) VALUES (?,?,?,1)', [id,owner,JSON.stringify(payload)]);
      const [[row]] = await c.execute('SELECT id,payload,version,created_at FROM shopping_items WHERE id=? AND user_id=?', [id,owner]);
      return { status: 201, body: dto(row) };
    });
    return result;
  }
  async update(owner, key, id, input) {
    validate(input, true);
    if (!idPattern.test(id) || !Number.isSafeInteger(input.expected_version) || input.expected_version < 1) throw new DomainError(422, 'VALIDATION_ERROR');
    const { expected_version, ...patch } = input;
    return this.command(owner,key,'shopping.update',input,async c => {
      if (patch.matchedFoodId) {
        const [[food]] = await c.execute('SELECT id FROM food_entries WHERE id=? AND user_id=? AND deleted_at IS NULL', [patch.matchedFoodId,owner]);
        if (!food) throw new DomainError(404, 'NOT_FOUND');
      }
      const [result] = await c.execute('UPDATE shopping_items SET payload=JSON_MERGE_PATCH(payload,?),version=version+1 WHERE id=? AND user_id=? AND version=?', [JSON.stringify(patch),id,owner,expected_version]);
      if (!result.affectedRows) {
        const [[row]] = await c.execute('SELECT version FROM shopping_items WHERE id=? AND user_id=?', [id,owner]);
        if (!row) throw new DomainError(404, 'NOT_FOUND');
        throw new DomainError(409, 'VERSION_CONFLICT');
      }
      const [[row]] = await c.execute('SELECT id,payload,version,created_at FROM shopping_items WHERE id=? AND user_id=?', [id,owner]);
      return { status: 200, body: dto(row) };
    });
  }
  async remove(owner, key, id) {
    if (!idPattern.test(id)) throw new DomainError(422, 'VALIDATION_ERROR');
    return this.command(owner,key,'shopping.delete',{id},async c => {
      const [result] = await c.execute('DELETE FROM shopping_items WHERE id=? AND user_id=?', [id,owner]);
      if (!result.affectedRows) throw new DomainError(404, 'NOT_FOUND');
      return { status: 200, body: {} };
    });
  }
  async importLegacy(owner, key, items) {
    if (!Array.isArray(items) || items.length > 500) throw new DomainError(422, 'VALIDATION_ERROR');
    const candidates = items.map(item => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) throw new DomainError(422, 'VALIDATION_ERROR');
      const { id: _id, createdAt: _created, version: _version, ...candidate } = item;
      validate(candidate);
      return { ...candidate, quantity: candidate.quantity ?? null, unit: candidate.unit ?? null, checked: candidate.checked ?? false, addedFromInventory: candidate.addedFromInventory ?? false, category: candidate.category ?? 'other' };
    });
    return this.command(owner,key,'shopping.import',candidates,async c => {
      await c.execute('SELECT id FROM users WHERE id=? FOR UPDATE', [owner]);
      const [rows] = await c.execute('SELECT payload FROM shopping_items WHERE user_id=?', [owner]);
      const activeKeys = new Set(rows.map(row => typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload)
        .filter(item => !item.checked)
        .map(item => `${String(item.name).trim().toLocaleLowerCase()}|${item.quantity ?? ''}|${item.unit ?? ''}`));
      let imported = 0;
      for (const payload of candidates) {
        const key = `${String(payload.name).trim().toLocaleLowerCase()}|${payload.quantity ?? ''}|${payload.unit ?? ''}`;
        if (!payload.checked && activeKeys.has(key)) continue;
        await c.execute('INSERT INTO shopping_items (id,user_id,payload,version) VALUES (?,?,?,1)', [randomUUID(),owner,JSON.stringify(payload)]);
        if (!payload.checked) activeKeys.add(key);
        imported++;
      }
      return { status: 200, body: { imported: imported > 0, existing: rows.length > 0 } };
    });
  }
}
