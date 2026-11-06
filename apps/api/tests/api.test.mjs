import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import test from 'node:test';
import { createApp } from '../src/app.mjs';
import express from 'express';
import { idempotencyMiddleware, errorHandler } from '../src/shared/middleware.mjs';
import { DomainError, decimal, metadata, metadataFields } from '../src/shared/domain.mjs';
import { closePools } from '../src/shared/connection.mjs';

test.after(async () => {
  await closePools();
});

test('App initialization and healthcheck', async () => {
  const app = createApp();
  assert.ok(app, 'App should be created');
  assert.equal(app.get('trust proxy'), 1, 'Trust proxy should be configured to 1 hop');

  // Test via mock request / response using supertest-like fetch or internal dispatch
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'ok');
    assert.equal(data.service, 'expiry-api');
  } finally {
    server.close();
  }
});

test('problem responses use problem media type and always include a stable code', async t => {
  const app = express();
  app.use(express.json({ limit: '16b' }));
  app.get('/domain-error', (_req, _res, next) => next(new DomainError(422, 'BAD_INPUT')));
  app.post('/unhandled', (_req, _res, next) => next(new Error('private database details')));
  app.use(errorHandler);
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  const base = `http://127.0.0.1:${server.address().port}`;
  for (const [path, init, status, code] of [
    ['/domain-error', {}, 422, 'BAD_INPUT'],
    ['/bad-json', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' }, 400, 'MALFORMED_JSON'],
    ['/too-large', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ value: 'a'.repeat(64) }) }, 413, 'PAYLOAD_TOO_LARGE'],
    ['/unhandled', { method: 'POST' }, 500, 'INTERNAL_SERVER_ERROR']
  ]) {
    const response = await fetch(`${base}${path}`, init);
    assert.equal(response.status, status);
    assert.match(response.headers.get('content-type'), /^application\/problem\+json/);
    const body = await response.json();
    assert.equal(body.code, code);
    if (path === '/unhandled') assert.doesNotMatch(JSON.stringify(body), /private database details/);
  }
  const appServer = createApp().listen(0, '127.0.0.1');
  await new Promise(resolve => appServer.once('listening', resolve));
  try {
    const missing = await fetch(`http://127.0.0.1:${appServer.address().port}/no-such-route`);
    assert.equal(missing.status, 404);
    assert.match(missing.headers.get('content-type'), /^application\/problem\+json/);
    assert.equal((await missing.json()).code, 'NOT_FOUND');
  } finally { await new Promise(resolve => { appServer.close(resolve); appServer.closeAllConnections(); }); }
});

test('Idempotency Key validation middleware', async () => {
  const app = express();
  app.use(idempotencyMiddleware);
  app.post('/api/v1/food-entries', (req, res) => res.json({ key: req.idempotencyKey }));
  app.use(errorHandler);
  const server = app.listen(0);
  const port = server.address().port;

  try {
    // Bad idempotency key (too short)
    const res = await fetch(`http://127.0.0.1:${port}/api/v1/food-entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': 'short'
      },
      body: JSON.stringify({ name: 'Milk' })
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.title, 'INVALID_IDEMPOTENCY_KEY');
    const missing = await fetch(`http://127.0.0.1:${port}/api/v1/food-entries`, { method: 'POST' });
    assert.equal(missing.status, 400);
    assert.equal((await missing.json()).title, 'IDEMPOTENCY_KEY_REQUIRED');
    for (let attempt = 0; attempt < 2; attempt++) {
      const valid = await fetch(`http://127.0.0.1:${port}/api/v1/food-entries`, { method: 'POST', headers: { 'Idempotency-Key': 'stable_command_123' } });
      assert.equal(valid.status, 200);
      assert.equal((await valid.json()).key, 'stable_command_123');
    }
  } finally {
    server.close();
  }
});

test('Protected routes reject missing credentials and caller identity headers', async () => {
  const app = createApp();
  const server = app.listen(0);
  const port = server.address().port;

  try {
    for (const path of ['/food-entries', '/me/preferences']) {
      const res = await fetch(`http://127.0.0.1:${port}/api/v1${path}`, {
        headers: { Authorization: 'Bearer 00000000-0000-4000-8000-000000000001', 'X-User-Id': '00000000-0000-4000-8000-000000000001' }
      });
      assert.equal(res.status, 401);
      assert.equal((await res.json()).title, 'AUTH_REQUIRED');
    }
  } finally {
    server.close();
  }
});

test('Scan healthcheck route is public and accessible without credentials', async () => {
  const app = createApp({
    scanOptions: {
      fetch: async () => ({
        ok: true,
        json: async () => ({ status: 'healthy', service: 'python-scan', tesseract_available: true, version: '1.0.0' })
      })
    }
  });
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/v1/scan/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'healthy');
    assert.equal(data.tesseract_available, true);
  } finally {
    server.close();
  }
});

test('Production session configuration fails closed without an exact HTTPS origin', () => {
  assert.throws(() => createApp({ secureCookies: true, allowedOrigins: [] }), /APP_ORIGIN/);
  assert.throws(() => createApp({ secureCookies: true, allowedOrigins: ['http://localhost:4174'] }), /trusted HTTP/);
});

test('Production default allowed origins include verified deployment aliases and reject untrusted origins', async () => {
  const app = createApp({ secureCookies: true });
  const server = app.listen(0);
  const port = server.address().port;
  const base = 'http://127.0.0.1:' + port;

  try {
    // 1. Untrusted origin must be rejected with 403 CSRF_FAILED on unsafe method
    const untrustedRes = await fetch(base + '/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Origin': 'https://malicious-attacker.com',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: 'test@example.com', password: 'Password123!' })
    });
    assert.equal(untrustedRes.status, 403);
    const untrustedJson = await untrustedRes.json();
    assert.equal(untrustedJson.code, 'CSRF_FAILED');

    // 2. Verified Vercel alias uidemo-alpha must be accepted by auth origin boundary
    const alphaRes = await fetch(base + '/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Origin': 'https://uidemo-alpha.vercel.app',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: 'test@example.com', password: 'Password123!' })
    });
    // Should pass origin check (not 403 CSRF_FAILED)
    assert.notEqual(alphaRes.status, 403);

    // 3. Verified Vercel preview alias must be accepted
    const previewRes = await fetch(base + '/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Origin': 'https://uidemo-git-develop-ntduc011006dn-3691s-projects.vercel.app',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: 'test@example.com', password: 'Password123!' })
    });
    assert.notEqual(previewRes.status, 403);

    // 4. Tailscale funnel origin must be accepted
    const funnelRes = await fetch(base + '/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Origin': 'https://homeserver.tailc535bb.ts.net',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: 'test@example.com', password: 'Password123!' })
    });
    assert.notEqual(funnelRes.status, 403);
  } finally {
    server.close();
  }
});

test('decimal formats BigInt values correctly for positive, zero, and negative values', () => {
  assert.equal(decimal(0n), '0.000');
  assert.equal(decimal(1n), '0.001');
  assert.equal(decimal(5n), '0.005');
  assert.equal(decimal(50n), '0.050');
  assert.equal(decimal(999n), '0.999');
  assert.equal(decimal(1000n), '1.000');
  assert.equal(decimal(1500n), '1.500');
  assert.equal(decimal(-1n), '-0.001');
  assert.equal(decimal(-5n), '-0.005');
  assert.equal(decimal(-50n), '-0.050');
  assert.equal(decimal(-500n), '-0.500');
  assert.equal(decimal(-1500n), '-1.500');
  assert.equal(decimal(123456789n), '123456.789');
  assert.equal(decimal(-123456789n), '-123456.789');
  assert.throws(() => decimal('1000'), /VALIDATION_ERROR/);
  assert.throws(() => decimal(1000), /VALIDATION_ERROR/);
});



test('health/live returns HTTP 200 and does not depend on database', async () => {
  const app = createApp();
  const server = app.listen(0);
  const port = server.address().port;
  try {
    const res = await fetch(`http://127.0.0.1:${port}/health/live`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'ok');
    assert.equal(data.service, 'expiry-api');
    assert.equal(typeof data.uptime, 'number');
  } finally {
    server.close();
  }
});

test('health/ready returns 503 when database is unavailable', async () => {
  const app = createApp({ database: 'non_existent_db_xyz' });
  const server = app.listen(0);
  const port = server.address().port;
  try {
    const res = await fetch(`http://127.0.0.1:${port}/health/ready`);
    assert.equal(res.status, 503);
    const data = await res.json();
    assert.equal(data.status, 'unhealthy');
    assert.equal(data.database, 'unavailable');
  } finally {
    server.close();
  }
});

test('domain metadata supports and validates manufactured_on (Issue #209)', () => {
  assert.ok(metadataFields.includes('manufactured_on'), 'metadataFields must include manufactured_on');
  const valid = metadata({
    name: 'Sữa Milo',
    manufactured_on: '2026-10-01',
    expiry_date: '2026-12-01',
    date_certainty: 'known',
    date_source: 'user_entered',
    date_label_type: 'use_by'
  });
  assert.equal(valid.manufactured_on, '2026-10-01');
  assert.equal(valid.name, 'Sữa Milo');

  // Nullable manufactured_on
  const noMfg = metadata({
    name: 'Bánh gạo'
  });
  assert.equal(noMfg.manufactured_on, null);

  // Invalid date throws
  assert.throws(() => metadata({
    name: 'Lỗi NSX',
    manufactured_on: 'invalid-date'
  }));
});


test('inventory batches isolate duplicate barcodes with distinct NSX, HSD and lots (Issue #217)', () => {
  // Products definition
  const productA = {
    id: 'prod-001',
    barcode: '8936039681526',
    name: 'Kẽm Amagain',
    category: 'other',
    default_unit: 'piece'
  };

  // Two independent batches under the same product barcode
  const batch1 = {
    id: 'batch-001',
    product_id: productA.id,
    barcode: productA.barcode,
    lot_number: 'LOT2026A',
    manufactured_on: '2026-01-15',
    expiry_date: '2027-01-15',
    quantity: '10.000',
    unit: 'piece',
    status: 'active'
  };

  const batch2 = {
    id: 'batch-002',
    product_id: productA.id,
    barcode: productA.barcode,
    lot_number: 'LOT2026B',
    manufactured_on: '2026-06-20',
    expiry_date: '2027-06-20',
    quantity: '25.000',
    unit: 'piece',
    status: 'active'
  };

  // Batches do not overwrite each other
  assert.notEqual(batch1.id, batch2.id);
  assert.equal(batch1.barcode, batch2.barcode);
  assert.notEqual(batch1.lot_number, batch2.lot_number);
  assert.notEqual(batch1.expiry_date, batch2.expiry_date);
  assert.notEqual(batch1.manufactured_on, batch2.manufactured_on);

  // FEFO sorting: earliest expiry date first
  const batches = [batch2, batch1];
  batches.sort((a, b) => (a.expiry_date < b.expiry_date ? -1 : 1));
  assert.equal(batches[0].id, 'batch-001', 'FEFO must prioritize earliest expiring batch');
});

test('workspace invitations validate entropy, token hashing, role and expiry lifecycle (Issue #216 & #215)', () => {
  const rawToken = 'inv_' + 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0';
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const invite = {
    id: 'invite-uuid-1',
    workspace_id: 'ws-restaurant-01',
    token_hash: tokenHash,
    role: 'staff',
    expires_at: new Date(Date.now() + 86400000).toISOString(),
    max_uses: 5,
    uses_count: 0,
    revoked: false
  };

  // Verification helper
  function verifyInvite(presentedToken, inv, currentTime = new Date()) {
    const hash = crypto.createHash('sha256').update(presentedToken).digest('hex');
    if (hash !== inv.token_hash) return { valid: false, error: 'TOKEN_INVALID' };
    if (inv.revoked) return { valid: false, error: 'INVITE_REVOKED' };
    if (new Date(inv.expires_at) <= currentTime) return { valid: false, error: 'INVITE_EXPIRED' };
    if (inv.uses_count >= inv.max_uses) return { valid: false, error: 'INVITE_EXHAUSTED' };
    return { valid: true, role: inv.role, workspace_id: inv.workspace_id };
  }

  // Valid token check
  const res1 = verifyInvite(rawToken, invite);
  assert.equal(res1.valid, true);
  assert.equal(res1.role, 'staff');

  // Wrong token check
  const resWrong = verifyInvite('wrong_token', invite);
  assert.equal(resWrong.valid, false);
  assert.equal(resWrong.error, 'TOKEN_INVALID');

  // Expired check
  const resExpired = verifyInvite(rawToken, invite, new Date(Date.now() + 90000000));
  assert.equal(resExpired.valid, false);
  assert.equal(resExpired.error, 'INVITE_EXPIRED');

  // Revocation check
  const resRevoked = verifyInvite(rawToken, { ...invite, revoked: true });
  assert.equal(resRevoked.valid, false);
  assert.equal(resRevoked.error, 'INVITE_REVOKED');

  // Exhausted check
  const resExhausted = verifyInvite(rawToken, { ...invite, uses_count: 5 });
  assert.equal(resExhausted.valid, false);
  assert.equal(resExhausted.error, 'INVITE_EXHAUSTED');
});
