import assert from 'node:assert/strict';
import test from 'node:test';
import express from 'express';
import { randomBytes } from 'node:crypto';
import { connect, rootSql, migrate, grants } from '../../../database/mysql/src/connection.mjs';
import { applyAuthMigration } from '../../../database/mysql/scripts/auth-migration.mjs';
import { AuthRepository } from '../src/modules/auth/auth.repository.mjs';
import { createAuthBoundary } from '../src/modules/auth/auth.routes.mjs';
import { tokenHash } from '../src/modules/auth/auth.crypto.mjs';

const enabled = process.env.EXPIRY_AUTH_MYSQL_TEST === '1';
const origin = 'http://127.0.0.1:5173';
const password = 'A strong local test password 2026!';

test('approved local-auth migration and HTTP lifecycle against isolated real MySQL', { skip: !enabled }, async t => {
  const database = `expiry_test_auth_${randomBytes(6).toString('hex')}`;
  let timestamp = Date.parse('2026-10-11T03:00:00.000Z');
  let server;
  let base;
  let createdDatabase = false;
  const repository = () => new AuthRepository(database, { connect });
  const start = async () => {
    const boundary = createAuthBoundary({ repository: repository(), allowedOrigins: [origin], secureCookies: false, now: () => new Date(timestamp), absoluteTimeoutMs: 3000, idleTimeoutMs: 1000 });
    const app = express();
    app.use(express.json({ limit: '16kb' }));
    app.use('/api/v1/auth', boundary.router);
    app.get('/private', boundary.requireAuth, (req, res) => res.json({ user_id: req.userId }));
    app.use((error, req, res, next) => res.status(error.status ?? 500).json({ title: error.code ?? 'INTERNAL_SERVER_ERROR' }));
    server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    base = `http://127.0.0.1:${server.address().port}`;
  };
  const stop = async () => {
    if (server) await new Promise((resolve, reject) => { server.close(error => error ? reject(error) : resolve()); server.closeAllConnections(); });
    server = null;
  };
  const request = (path, { method = 'GET', body, cookie, csrf, headers = {} } = {}) => fetch(`${base}${path}`, {
    method,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(method !== 'GET' ? { Origin: origin } : {}), ...(cookie ? { Cookie: cookie } : {}), ...(csrf ? { 'X-CSRF-Token': csrf } : {}), ...headers },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const query = async (sql, values = []) => {
    const c = await connect(database);
    try { const [rows] = await c.execute(sql, values); return rows; } finally { await c.end(); }
  };
  const issue = async (path, body, cookie) => {
    const response = await request(path, { method: 'POST', body, cookie });
    assert.equal(response.status, path.endsWith('register') ? 201 : 200);
    return { response, body: await response.json(), cookie: response.headers.get('set-cookie').split(';')[0] };
  };
  let owner;
  let secondOwner;
  let firstCookie;
  try {
    await rootSql(`CREATE DATABASE \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;`);
    createdDatabase = true;
    await migrate(database);
    await grants(database);
    await applyAuthMigration(database);
    await start();

    await t.test('the approved additive migration records one stable version and replays without changes', async () => {
      await applyAuthMigration(database);
      const versions = await query('SELECT version,sha256 FROM schema_migrations ORDER BY version');
      assert.deepEqual(versions.map(row => row.version), [1, 2]);
      assert.match(versions[1].sha256, /^[0-9a-f]{64}$/);
      const users = await query('SELECT COUNT(*) AS count FROM users');
      assert.equal(Number(users[0].count), 0);
    });

    await t.test('registration persists a stable user, salted verifier and token hash in MySQL without seeds', async () => {
      owner = await issue('/api/v1/auth/register', { email: 'Owner@Example.com', password, display_name: 'Owner' });
      firstCookie = owner.cookie;
      const rows = await query(`SELECT u.identity_subject,c.email_normalized,c.password_verifier,s.token_hash
        FROM users u JOIN local_credentials c ON c.user_id=u.id JOIN user_sessions s ON s.user_id=u.id WHERE u.id=?`, [owner.body.user.id]);
      assert.equal(rows.length, 1);
      assert.equal(rows[0].identity_subject, `local:${owner.body.user.id}`);
      assert.equal(rows[0].email_normalized, 'owner@example.com');
      assert.match(rows[0].password_verifier, /^scrypt\$131072\$8\$1\$/);
      assert.equal(rows[0].password_verifier.includes(password), false);
      const rawToken = owner.cookie.split('=')[1];
      assert.ok(rows[0].token_hash !== rawToken, 'Raw tokens must not be persisted');
      assert.ok(rows[0].token_hash === tokenHash(rawToken), 'Persisted hash must correspond to the issued opaque token');
    });

    await t.test('case-normalized duplicate registration rolls back its attempted user and session inserts', async () => {
      const rejected = await request('/api/v1/auth/register', { method: 'POST', body: { email: 'OWNER@EXAMPLE.COM', password, display_name: 'Duplicate' } });
      assert.equal(rejected.status, 409);
      assert.equal(rejected.headers.get('set-cookie'), null);
      for (const table of ['users', 'local_credentials', 'user_sessions']) {
        const rows = await query(`SELECT COUNT(*) AS count FROM ${table}`);
        assert.equal(Number(rows[0].count), 1);
      }
    });

    await t.test('distinct accounts establish distinct owner principals and arbitrary identity headers cannot replace them', async () => {
      secondOwner = await issue('/api/v1/auth/register', { email: 'second@example.com', password, display_name: 'Second owner' });
      assert.notEqual(owner.body.user.id, secondOwner.body.user.id);
      const spoof = await request('/private', { headers: { Authorization: `Bearer ${owner.body.user.id}`, 'X-User-Id': owner.body.user.id } });
      assert.equal(spoof.status, 401);
      const own = await request('/private', { cookie: secondOwner.cookie, headers: { 'X-User-Id': owner.body.user.id } });
      assert.equal(own.status, 200);
      assert.deepEqual(await own.json(), { user_id: secondOwner.body.user.id });
    });

    await t.test('HTTP server recreation and a fresh AuthRepository recover the same durable session', async () => {
      await stop();
      await start();
      const recovered = await request('/api/v1/auth/session', { cookie: owner.cookie });
      assert.equal(recovered.status, 200);
      const body = await recovered.json();
      assert.deepEqual(body.user, owner.body.user);
      assert.equal(body.expires_at, owner.body.expires_at);
      assert.ok(body.csrf_token === owner.body.csrf_token, 'CSRF recovery must remain valid across an API restart');
    });

    await t.test('login rotates the presented persisted session and revokes its old hash', async () => {
      owner = await issue('/api/v1/auth/login', { email: 'owner@example.com', password }, firstCookie);
      assert.ok(owner.cookie !== firstCookie, 'Login must issue a fresh browser credential');
      assert.equal((await request('/private', { cookie: firstCookie })).status, 401);
      const old = await query('SELECT revoked_at FROM user_sessions WHERE token_hash=?', [tokenHash(firstCookie.split('=')[1])]);
      assert.notEqual(old[0].revoked_at, null);
    });

    await t.test('logout rejects missing CSRF before revocation, then valid logout persists revocation', async () => {
      const rejected = await request('/api/v1/auth/logout', { method: 'POST', cookie: owner.cookie });
      assert.equal(rejected.status, 403);
      assert.equal((await request('/private', { cookie: owner.cookie })).status, 200);
      const accepted = await request('/api/v1/auth/logout', { method: 'POST', cookie: owner.cookie, csrf: owner.body.csrf_token });
      assert.equal(accepted.status, 204);
      assert.equal((await request('/private', { cookie: owner.cookie })).status, 401);
      const revoked = await query('SELECT revoked_at FROM user_sessions WHERE token_hash=?', [tokenHash(owner.cookie.split('=')[1])]);
      assert.notEqual(revoked[0].revoked_at, null);
    });

    await t.test('the durable store enforces idle expiry and activity cannot extend absolute expiry', async () => {
      timestamp += 1000;
      assert.equal((await request('/private', { cookie: secondOwner.cookie })).status, 401);
      owner = await issue('/api/v1/auth/login', { email: 'owner@example.com', password });
      for (let i = 0; i < 3; i += 1) {
        timestamp += 900;
        assert.equal((await request('/private', { cookie: owner.cookie })).status, 200);
      }
      timestamp += 300;
      assert.equal((await request('/private', { cookie: owner.cookie })).status, 401);
    });
  } finally {
    await stop();
    // Only this randomly named, newly created and explicitly scoped test database is removed.
    if (createdDatabase) await rootSql(`DROP DATABASE \`${database}\`;`);
  }
});
