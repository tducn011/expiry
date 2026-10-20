import assert from 'node:assert/strict';
import test from 'node:test';
import { createApp } from '../src/app.mjs';
import express from 'express';
import { idempotencyMiddleware, errorHandler } from '../src/shared/middleware.mjs';
import { DomainError } from '../src/shared/domain.mjs';

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
    for (const path of ['/food-entries', '/me/preferences', '/scan/health']) {
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

test('Production session configuration fails closed without an exact HTTPS origin', () => {
  assert.throws(() => createApp({ secureCookies: true, allowedOrigins: [] }), /APP_ORIGIN/);
  assert.throws(() => createApp({ secureCookies: true, allowedOrigins: ['http://localhost:4174'] }), /trusted HTTP/);
});
