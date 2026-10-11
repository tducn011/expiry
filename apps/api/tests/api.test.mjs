import assert from 'node:assert/strict';
import test from 'node:test';
import { createApp } from '../src/app.mjs';
import express from 'express';
import { idempotencyMiddleware, errorHandler } from '../src/shared/middleware.mjs';

test('App initialization and healthcheck', async () => {
  const app = createApp();
  assert.ok(app, 'App should be created');

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
