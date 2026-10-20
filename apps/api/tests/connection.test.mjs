import assert from 'node:assert/strict';
import test, { mock } from 'node:test';
import mysql from 'mysql2/promise';
import { connect } from '../src/shared/connection.mjs';

test('configures UTC once per pooled connection and rolls back before release', async t => {
  const queries = [];
  const calls = [];
  let onConnection;
  let initialized = false;
  const rawConnection = {
    query(sql, callback) {
      queries.push(sql);
      callback?.(null);
    },
    execute: async () => {},
    beginTransaction: async () => { calls.push('begin'); },
    commit: async () => { calls.push('commit'); },
    rollback: async () => { calls.push('rollback'); },
    release: () => { calls.push('release'); },
    destroy: () => { calls.push('destroy'); }
  };
  const pool = {
    on(event, listener) {
      assert.equal(event, 'connection');
      onConnection = listener;
      return this;
    },
    async getConnection() {
      if (!initialized) {
        initialized = true;
        onConnection(rawConnection);
      }
      return rawConnection;
    }
  };
  const createPool = mock.method(mysql, 'createPool', () => pool);
  t.after(() => mock.restoreAll());

  const database = `expiry_connection_test_${Date.now()}`;
  const first = await connect(database);
  await first.beginTransaction();
  await first.end();

  const second = await connect(database);
  await second.beginTransaction();
  await second.commit();
  await second.end();

  assert.deepEqual(queries, ["SET SESSION time_zone='+00:00'"]);
  assert.deepEqual(calls, ['begin', 'rollback', 'release', 'begin', 'commit', 'release']);
  assert.equal(createPool.mock.callCount(), 1);
});

test('destroys a connection when rollback fails during release', async t => {
  const calls = [];
  let onConnection;
  const rawConnection = {
    query(_sql, callback) { callback?.(null); },
    execute: async () => {},
    beginTransaction: async () => {},
    rollback: async () => { throw new Error('rollback failed'); },
    release: () => { calls.push('release'); },
    destroy: () => { calls.push('destroy'); }
  };
  const pool = {
    on(_event, listener) { onConnection = listener; return this; },
    async getConnection() { onConnection(rawConnection); return rawConnection; }
  };
  mock.method(mysql, 'createPool', () => pool);
  t.after(() => mock.restoreAll());

  const connection = await connect(`expiry_connection_rollback_test_${Date.now()}`);
  await connection.beginTransaction();
  await assert.rejects(connection.end(), /rollback failed/);
  assert.deepEqual(calls, ['destroy']);
});
