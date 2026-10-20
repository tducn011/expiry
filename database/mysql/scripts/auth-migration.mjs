import mysql from 'mysql2';
import { readFile } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { containerId, base } from '../src/connection.mjs';

const domainTables = ['users', 'food_entries', 'stock_movements', 'api_requests'];
const digest = value => createHash('sha256').update(value).digest('hex');

async function snapshot(connection) {
  const result = {};
  for (const table of domainTables) {
    const columns = (await connection.query(`SHOW COLUMNS FROM \`${table}\``)).map(row => row.split('\t')[0]);
    if (!columns.every(column => /^[a-z_]+$/.test(column))) throw new Error('Unexpected domain column identifier');
    const rows = await connection.query(`SELECT JSON_ARRAY(${columns.map(column => `\`${column}\``).join(',')}) FROM \`${table}\` ORDER BY ${table === 'api_requests' ? 'user_id,idempotency_key' : 'id'}`);
    result[table] = { count: rows.length, sha256: digest(rows.join('\n')) };
  }
  return result;
}

// Root is deliberately restricted to localhost inside the existing container.
// Keep one native mysql connection for the advisory lock and every DDL step;
// do not broaden root's host grants or place administrator secrets in argv.
async function administrator(database) {
  const child = spawn('docker', ['exec', '-i', await containerId(), 'sh', '-c',
    'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" exec mysql --user=root --batch --raw --silent --skip-column-names --unbuffered "$@"',
    'sh', `--database=${database}`], { stdio: ['pipe', 'pipe', 'pipe'] });
  let pending = null, buffer = '', stderr = '', closed = false;
  const completion = new Promise(resolve => child.on('close', code => {
    closed = true;
    if (pending) { clearTimeout(pending.timer); pending.reject(new Error(`Container-local administrator failed (${code}): ${stderr.slice(0,1000)}`)); pending = null; }
    resolve(code);
  }));
  child.on('error', error => { if (pending) { clearTimeout(pending.timer); pending.reject(error); pending = null; } });
  child.stderr.on('data', value => { stderr += value; });
  child.stdout.on('data', value => {
    buffer += value;
    let end;
    while ((end = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, end).replace(/\r$/, ''); buffer = buffer.slice(end + 1);
      if (!pending) continue;
      if (line === pending.marker) {
        const item = pending; pending = null; clearTimeout(item.timer); item.resolve(item.lines);
      } else if (line) pending.lines.push(line);
    }
  });
  return {
    query(sql, parameters = []) {
      if (closed || pending) return Promise.reject(new Error('Administrator connection unavailable or query already pending'));
      return new Promise((resolve, reject) => {
        const marker = `expiry_end_${randomUUID().replaceAll('-', '')}`;
        const timer = setTimeout(() => { pending = null; child.stdin.end(); reject(new Error('Administrator query timed out')); }, 30000);
        pending = { resolve, reject, marker, timer, lines: [] };
        child.stdin.write(`${mysql.format(sql, parameters)};\nSELECT '${marker}';\n`);
      });
    },
    async end() { child.stdin.end(); await completion; }
  };
}

// Explicitly selected by the operator; the baseline migration runner still
// installs/replays only001. No schema reset, seed, or automatic recovery.
export async function applyAuthMigration(database) {
  if (!/^expiry_(dev|test_[a-z0-9_]+)$/.test(database)) throw new Error('Only an explicit Expiry development/test database is allowed');
  const connection = await administrator(database);
  const lock = `${database}:auth_migration_002`;
  let locked = false;
  try {
    await connection.query("SET SESSION time_zone='+00:00'");
    const [lockResult] = await connection.query('SELECT GET_LOCK(?,10)', [lock]);
    if (Number(lockResult) !== 1) throw new Error('Migration lock unavailable');
    locked = true;
    const baseline = await readFile(new URL('migrations/001_initial_schema.sql', base), 'utf8');
    const [appliedBaseline] = await connection.query('SELECT sha256 FROM schema_migrations WHERE version=1');
    if (appliedBaseline !== digest(baseline)) throw new Error('Verified baseline001 is required; preserve the existing database for review');
    const sql = await readFile(new URL('migrations/002_local_auth.sql', base), 'utf8');
    const sha256 = digest(sql);
    const boundarySql = await readFile(new URL('migrations/003_session_expiry_boundary.sql', base), 'utf8');
    const boundarySha256 = digest(boundarySql);
    const before = await snapshot(connection);
    const [record002] = await connection.query('SELECT sha256 FROM schema_migrations WHERE version=2');
    if (record002 && record002 !== sha256) throw new Error('Applied migration002 checksum drift; create a new migration');
    if (!record002) {
      const partial = await connection.query("SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema=? AND table_name IN ('local_credentials','user_sessions')", [database]);
      if (partial.length) throw new Error('Unversioned/partial auth schema detected; explicit forward recovery is required');
      const statements = sql.replace(/^--.*$/gm, '').split(';').map(value => value.trim()).filter(Boolean);
      if (statements.length !== 2 || !statements.every(value => /^CREATE TABLE (local_credentials|user_sessions) \(/.test(value))) throw new Error('Unexpected additive auth migration shape');
      for (const statement of statements) await connection.query(statement);
      await connection.query('INSERT INTO schema_migrations(version,sha256) VALUES (2,?)', [sha256]);
    }
    const [record003] = await connection.query('SELECT sha256 FROM schema_migrations WHERE version=3');
    if (record003 && record003 !== boundarySha256) throw new Error('Applied migration003 checksum drift');
    if (!record003) {
      const [createTable] = await connection.query('SHOW CREATE TABLE user_sessions');
      if (/last_seen_at`?\s*<=\s*`?expires_at/i.test(createTable)) {
        // Recover the ledger if the atomic DDL completed but the version insert did not.
      } else if (/last_seen_at`?\s*<(?![=])\s*`?expires_at/i.test(createTable)) {
        const statements = boundarySql.replace(/^--.*$/gm, '').split(';').map(value => value.trim()).filter(Boolean);
        if (statements.length !== 1 || !/^ALTER TABLE user_sessions DROP CHECK sessions_time,\s*ADD CONSTRAINT sessions_time CHECK \(/.test(statements[0])) {
          throw new Error('Unexpected session-expiry migration shape');
        }
        await connection.query(statements[0]);
      } else {
        throw new Error('Unrecognized sessions_time constraint; explicit forward recovery is required');
      }
      await connection.query('INSERT INTO schema_migrations(version,sha256) VALUES (3,?)', [boundarySha256]);
    }
    for (const table of ['local_credentials', 'user_sessions']) {
      await connection.query(`GRANT SELECT,INSERT,UPDATE ON \`${database}\`.\`${table}\` TO 'expiry_app'@'%'`);
    }
    const after = await snapshot(connection);
    if (JSON.stringify(before) !== JSON.stringify(after)) throw new Error('Existing domain rows changed during auth migration; inspect before continuing');
    const versions = (await connection.query('SELECT version,sha256 FROM schema_migrations ORDER BY version')).map(row => { const [version, hash] = row.split('\t'); return { version: Number(version), sha256: hash }; });
    return { database, applied: !record002 || !record003, version: 3, sha256: boundarySha256, inventory_preserved: true, before, after, versions };
  } finally {
    if (locked) await connection.query('SELECT RELEASE_LOCK(?)', [lock]).catch(() => {});
    await connection.end();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const database = process.argv[2];
  if (!database) throw new Error('Pass an explicit expiry_dev or fresh expiry_test_* database');
  console.log(JSON.stringify(await applyAuthMigration(database), null, 2));
}
