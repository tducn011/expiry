import assert from 'node:assert/strict';
import test from 'node:test';
import { createApp } from '../src/app.mjs';

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
  const app = createApp();
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
  } finally {
    server.close();
  }
});

test('Scan healthcheck delegation endpoint', async () => {
  const app = createApp();
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/v1/scan/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.service === 'python-scan');
  } finally {
    server.close();
  }
});
