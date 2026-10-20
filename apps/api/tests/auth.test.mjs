import assert from 'node:assert/strict';
import test from 'node:test';
import express from 'express';
import { randomUUID } from 'node:crypto';
import { createAuthBoundary, createAuthRateLimiter } from '../src/modules/auth/auth.routes.mjs';
import { AuthRepository } from '../src/modules/auth/auth.repository.mjs';
import { passwordVerifier, verifyPassword, tokenHash } from '../src/modules/auth/auth.crypto.mjs';
import { DomainError } from '../src/shared/domain.mjs';

const origin = 'http://127.0.0.1:5173';
const password = 'Một mật khẩu dài 2026!';
const registration = { email: 'Owner@Example.com', password, display_name: 'Người dùng' };

// Test fixture only: production has no memory credential/session implementation.
class AuthFixture {
  users = new Map();
  sessions = new Map();
  async findCredential(email) { return this.users.get(email) ?? null; }
  async register(input, session, previousHash) {
    if (this.users.has(input.email)) throw new DomainError(409, 'EMAIL_ALREADY_REGISTERED');
    const user = { id: randomUUID(), display_name: input.display_name, email: input.email, timezone: input.timezone, attention_lead_days: 2, version: 1 };
    this.users.set(input.email, { user, password_verifier: input.password_verifier });
    await this.createSession(user.id, session, previousHash);
    return user;
  }
  async createSession(id, session, previousHash) {
    if (previousHash && this.sessions.has(previousHash)) this.sessions.get(previousHash).revoked_at = session.created_at;
    this.sessions.set(session.token_hash, { ...session, user_id: id, last_seen_at: session.created_at, revoked_at: null });
  }
  async current(hash, clock, idle) {
    const now = clock();
    const session = this.sessions.get(hash);
    if (!session || session.revoked_at || session.expires_at <= now || session.last_seen_at.getTime() + idle <= now.getTime()) return null;
    session.last_seen_at = now;
    const credential = [...this.users.values()].find(value => value.user.id === session.user_id);
    return { user: credential.user, expires_at: session.expires_at.toISOString() };
  }
  async revoke(hash, now) { if (this.sessions.has(hash)) this.sessions.get(hash).revoked_at = now; }
}

async function harness(options = {}) {
  const repository = options.repository ?? new AuthFixture();
  let timestamp = Date.parse('2026-10-11T00:00:00.000Z');
  const boundary = createAuthBoundary({ repository, allowedOrigins: [origin], now: () => new Date(timestamp), ...options });
  const app = express();
  app.use(express.json({ limit: '16kb' }));
  app.use('/api/v1/auth', boundary.router);
  app.use('/private', boundary.requireAuth, boundary.requireCsrf);
  app.get('/private', (req, res) => res.json({ owner: req.userId }));
  app.post('/private', (req, res) => res.json({ owner: req.userId }));
  app.use((error, req, res, next) => res.status(error.status ?? 500).json({ title: error.code ?? 'INTERNAL_SERVER_ERROR' }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  return {
    repository,
    boundary,
    advance: milliseconds => { timestamp += milliseconds; },
    request: (path, { method = 'GET', body, headers = {}, cookie, csrf } = {}) => fetch(`${base}${path}`, {
      method,
      headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(method !== 'GET' ? { Origin: origin } : {}), ...(cookie ? { Cookie: cookie } : {}), ...(csrf ? { 'X-CSRF-Token': csrf } : {}), ...headers },
      ...(body ? { body: JSON.stringify(body) } : {})
    }),
    close: () => new Promise((resolve, reject) => { server.close(error => error ? reject(error) : resolve()); server.closeAllConnections(); })
  };
}

async function register(h) {
  const response = await h.request('/api/v1/auth/register', { method: 'POST', body: registration });
  assert.equal(response.status, 201);
  return { body: await response.json(), cookie: response.headers.get('set-cookie').split(';')[0], header: response.headers.get('set-cookie') };
}

test('password verification uses independently salted strong verifiers, without truncating Unicode', async () => {
  const first = await passwordVerifier(password);
  const second = await passwordVerifier(password);
  assert.match(first, /^scrypt\$131072\$8\$1\$[0-9a-f]{32}\$[0-9a-f]{128}$/);
  assert.notEqual(first, second);
  assert.equal(first.includes(password), false);
  assert.equal(await verifyPassword(password, first), true);
  assert.equal(await verifyPassword(`${password}x`, first), false);
  assert.equal(await verifyPassword(password, null), false);
  await assert.rejects(verifyPassword(password, 'scrypt$1$8$1$bad'), error => error.code === 'AUTH_UNAVAILABLE');
});

test('registration establishes a durable-repository principal and hashed session; caller identity headers cannot authenticate', async () => {
  const h = await harness();
  try {
    const anonymous = await h.request('/private', { headers: { Authorization: 'Bearer 00000000-0000-4000-8000-000000000001', 'X-User-Id': '00000000-0000-4000-8000-000000000001' } });
    assert.equal(anonymous.status, 401);
    const session = await register(h);
    assert.match(session.body.user.id, /^[a-f0-9-]{36}$/);
    assert.equal(session.body.user.email, 'owner@example.com');
    assert.match(session.header, /HttpOnly/);
    assert.match(session.header, /SameSite=Lax/);
    assert.match(session.header, /Path=\//);
    const rawToken = session.cookie.split('=')[1];
    assert.equal(h.repository.sessions.has(rawToken), false);
    assert.equal(h.repository.sessions.has(tokenHash(rawToken)), true);
    const read = await h.request('/private', { cookie: session.cookie, headers: { 'X-User-Id': randomUUID() } });
    assert.equal(read.status, 200);
    assert.deepEqual(await read.json(), { owner: session.body.user.id });
    assert.equal(read.headers.get('cache-control'), 'no-store');
    const recovered = await h.request('/api/v1/auth/session', { cookie: session.cookie });
    assert.deepEqual(await recovered.json(), session.body);
  } finally { await h.close(); }
});

test('Origin and per-session CSRF defenses protect login and cookie-authenticated writes', async () => {
  const h = await harness();
  try {
    for (const badOrigin of ['http://evil.example', 'null', 'http://127.0.0.1:5173.evil.example', '']) {
      const denied = await h.request('/api/v1/auth/register', { method: 'POST', body: registration, headers: { Origin: badOrigin } });
      assert.equal(denied.status, 403);
    }
    const session = await register(h);
    for (const options of [{}, { csrf: '0'.repeat(64) }, { csrf: session.body.csrf_token, headers: { Origin: 'http://evil.example' } }, { csrf: session.body.csrf_token, headers: { 'Sec-Fetch-Site': 'cross-site' } }]) {
      const response = await h.request('/private', { method: 'POST', cookie: session.cookie, ...options });
      assert.equal(response.status, 403);
    }
    const accepted = await h.request('/private', { method: 'POST', cookie: session.cookie, csrf: session.body.csrf_token });
    assert.equal(accepted.status, 200);
  } finally { await h.close(); }
});

test('login rejects wrong and unknown credentials with the same response, rotates the prior session, and logout revokes it', async () => {
  const h = await harness();
  try {
    const original = await register(h);
    for (const body of [{ email: registration.email, password: `${password}wrong` }, { email: 'unknown@example.com', password }]) {
      const denied = await h.request('/api/v1/auth/login', { method: 'POST', body });
      assert.equal(denied.status, 401);
      assert.deepEqual(await denied.json(), { title: 'INVALID_CREDENTIALS' });
      assert.equal(denied.headers.get('set-cookie'), null);
    }
    const login = await h.request('/api/v1/auth/login', { method: 'POST', body: { email: registration.email, password }, cookie: original.cookie });
    assert.equal(login.status, 200);
    const body = await login.json();
    const cookie = login.headers.get('set-cookie').split(';')[0];
    assert.notEqual(cookie, original.cookie);
    assert.notEqual(body.csrf_token, original.body.csrf_token);
    assert.equal((await h.request('/private', { cookie: original.cookie })).status, 401);
    assert.equal((await h.request('/private', { method: 'POST', cookie, csrf: original.body.csrf_token })).status, 403);
    const logout = await h.request('/api/v1/auth/logout', { method: 'POST', cookie, csrf: body.csrf_token });
    assert.equal(logout.status, 204);
    assert.match(logout.headers.get('set-cookie'), /Expires=Thu, 01 Jan 1970/);
    assert.equal((await h.request('/private', { cookie })).status, 401);
  } finally { await h.close(); }
});

test('idle expiry and absolute expiry are enforced against injected server time', async () => {
  const h = await harness({ absoluteTimeoutMs: 3000, idleTimeoutMs: 1000 });
  try {
    let session = await register(h);
    h.advance(1000);
    assert.equal((await h.request('/private', { cookie: session.cookie })).status, 401);
    const login = await h.request('/api/v1/auth/login', { method: 'POST', body: { email: registration.email, password } });
    session = { cookie: login.headers.get('set-cookie').split(';')[0] };
    for (let i = 0; i < 3; i += 1) {
      h.advance(900);
      assert.equal((await h.request('/private', { cookie: session.cookie })).status, 200);
    }
    h.advance(300);
    assert.equal((await h.request('/private', { cookie: session.cookie })).status, 401);
  } finally { await h.close(); }
});

test('production policy requires explicit HTTPS origins and issues a host-only secure cookie', async () => {
  assert.throws(() => createAuthBoundary({ repository: new AuthFixture(), secureCookies: true, allowedOrigins: [origin] }), /trusted HTTP/);
  const h = await harness({ secureCookies: true, allowedOrigins: ['https://expiry.example'] });
  try {
    const response = await h.request('/api/v1/auth/register', { method: 'POST', body: registration, headers: { Origin: 'https://expiry.example' } });
    assert.equal(response.status, 201);
    const cookie = response.headers.get('set-cookie');
    assert.match(cookie, /^__Host-expiry_session=/);
    assert.match(cookie, /Secure/);
    assert.match(cookie, /HttpOnly/);
    assert.equal(cookie.includes('Domain='), false);
  } finally { await h.close(); }
});

test('authentication attempts are rate limited before repeated expensive verification', async () => {
  const h = await harness({ rateLimit: createAuthRateLimiter({ maxIp: 1, maxEmail: 1 }) });
  try {
    const body = { email: 'unknown@example.com', password };
    assert.equal((await h.request('/api/v1/auth/login', { method: 'POST', body })).status, 401);
    assert.equal((await h.request('/api/v1/auth/login', { method: 'POST', body })).status, 429);
    h.advance(15 * 60 * 1000);
    assert.equal((await h.request('/api/v1/auth/login', { method: 'POST', body })).status, 401);
  } finally { await h.close(); }
});

test('rate limiting isolates different client IPs behind reverse proxy using X-Forwarded-For', async () => {
  const h = await harness({ rateLimit: createAuthRateLimiter({ maxIp: 1, maxEmail: 10 }) });
  try {
    const body1 = { email: 'client1@example.com', password };
    assert.equal((await h.request('/api/v1/auth/login', { method: 'POST', body: body1, headers: { 'X-Forwarded-For': '203.0.113.1' } })).status, 401);
    assert.equal((await h.request('/api/v1/auth/login', { method: 'POST', body: body1, headers: { 'X-Forwarded-For': '203.0.113.1' } })).status, 429);

    const body2 = { email: 'client2@example.com', password };
    assert.equal((await h.request('/api/v1/auth/login', { method: 'POST', body: body2, headers: { 'X-Forwarded-For': '203.0.113.2' } })).status, 401);

    const body3 = { email: 'client3@example.com', password };
    assert.equal((await h.request('/api/v1/auth/login', { method: 'POST', body: body3, headers: { 'X-Forwarded-For': '203.0.113.3, 10.0.0.1' } })).status, 401);
    assert.equal((await h.request('/api/v1/auth/login', { method: 'POST', body: body3, headers: { 'X-Forwarded-For': '203.0.113.3, 10.0.0.1' } })).status, 429);
  } finally { await h.close(); }
});

test('missing auth tables fail closed with a controlled 503 and no issued session', async () => {
  let rollbacks = 0;
  let releases = 0;
  const repository = new AuthRepository('not-connected', { connect: async () => ({
    beginTransaction: async () => {}, commit: async () => {},
    execute: async () => { throw Object.assign(new Error('sensitive SQL details'), { code: 'ER_NO_SUCH_TABLE' }); },
    rollback: async () => { rollbacks += 1; }, end: async () => { releases += 1; }
  }) });
  const h = await harness({ repository });
  try {
    const response = await h.request('/api/v1/auth/login', { method: 'POST', body: { email: registration.email, password } });
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { title: 'AUTH_UNAVAILABLE' });
    assert.equal(response.headers.get('set-cookie'), null);
    assert.equal(rollbacks, 1);
    assert.equal(releases, 1);
  } finally { await h.close(); }
});

test('registration rollback prevents a partial account when credential/session writes fail', async () => {
  const events = [];
  let pendingUser = null;
  const repository = new AuthRepository('not-connected', { connect: async () => ({
    beginTransaction: async () => { events.push('begin'); },
    execute: async (sql, values) => {
      if (sql.includes('INSERT INTO users')) { pendingUser = values[0]; return [{ affectedRows: 1 }]; }
      throw Object.assign(new Error('missing credential table'), { code: 'ER_NO_SUCH_TABLE' });
    },
    commit: async () => { events.push('commit'); },
    rollback: async () => { pendingUser = null; events.push('rollback'); },
    end: async () => { events.push('release'); }
  }) });
  await assert.rejects(repository.register({ email: 'owner@example.com', display_name: 'Owner', timezone: 'Asia/Ho_Chi_Minh', password_verifier: 'fixture' }, {
    token_hash: 'a'.repeat(64), created_at: new Date('2026-10-11T00:00:00Z'), expires_at: new Date('2026-10-11T08:00:00Z')
  }), error => error.code === 'AUTH_UNAVAILABLE');
  assert.equal(pendingUser, null);
  assert.deepEqual(events, ['begin', 'rollback', 'release']);
});

test('duplicate registration returns 409 EMAIL_ALREADY_REGISTERED', async () => {
  const h = await harness();
  try {
    const session = await register(h);
    assert.equal(session.body.user.email, 'owner@example.com');
    const duplicate = await h.request('/api/v1/auth/register', { method: 'POST', body: registration });
    assert.equal(duplicate.status, 409);
    assert.deepEqual(await duplicate.json(), { title: 'EMAIL_ALREADY_REGISTERED' });
  } finally { await h.close(); }
});

test('duplicate registration triggers ER_DUP_ENTRY and maps to EMAIL_ALREADY_REGISTERED with rollback', async () => {
  let rollbacks = 0;
  let releases = 0;
  const repository = new AuthRepository('not-connected', { connect: async () => ({
    beginTransaction: async () => {}, commit: async () => {},
    execute: async () => { throw Object.assign(new Error('duplicate key'), { code: 'ER_DUP_ENTRY' }); },
    rollback: async () => { rollbacks += 1; }, end: async () => { releases += 1; }
  }) });
  await assert.rejects(
    repository.register({ email: 'owner@example.com', display_name: 'Owner', timezone: 'Asia/Ho_Chi_Minh', password_verifier: 'fixture' }, {
      token_hash: 'a'.repeat(64), created_at: new Date('2026-10-11T00:00:00Z'), expires_at: new Date('2026-10-11T08:00:00Z')
    }),
    error => error instanceof DomainError && error.status === 409 && error.code === 'EMAIL_ALREADY_REGISTERED'
  );
  assert.equal(rollbacks, 1);
  assert.equal(releases, 1);
});

