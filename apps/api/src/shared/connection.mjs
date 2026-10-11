import mysql from 'mysql2/promise';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function loadEnv() {
  const envCandidates = [
    resolve(process.cwd(), '.env'),
    resolve(__dirname, '../../.env'),
    resolve(__dirname, '../../../../database/mysql/.env')
  ];

  for (const envPath of envCandidates) {
    if (existsSync(envPath)) {
      try {
        const content = await readFile(envPath, 'utf8');
        const lines = content.split('\n').filter(l => l && !l.startsWith('#'));
        for (const line of lines) {
          const idx = line.indexOf('=');
          if (idx !== -1) {
            const key = line.slice(0, idx).trim();
            const val = line.slice(idx + 1).trim();
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
        break;
      } catch {
        // Continue fallback
      }
    }
  }

  return {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_HOST_PORT || process.env.MYSQL_PORT || 3307),
    user: process.env.MYSQL_USER || 'expiry_app',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'expiry_dev'
  };
}

const pools = new Map();

export async function getPool(customDb) {
  const config = await loadEnv();
  const database = customDb || config.database;
  const key = JSON.stringify([config.host, config.port, config.user, config.password, database]);
  if (!pools.has(key)) {
    pools.set(key, mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      timezone: 'Z',
      dateStrings: true,
      decimalNumbers: false,
      supportBigNumbers: true,
      bigNumberStrings: true
    }));
  }
  return pools.get(key);
}

export async function closePools() {
  const current = [...pools.values()];
  pools.clear();
  await Promise.all(current.map(pool => pool.end()));
}

export async function connect(database) {
  const p = await getPool(database);
  const conn = await p.getConnection();
  try { await conn.query("SET SESSION time_zone='+00:00'"); }
  catch (error) { conn.destroy(); throw error; }
  // Return wrapper with commit/rollback/end matching single connection semantics
  return {
    execute: (sql, values) => conn.execute(sql, values),
    query: (sql, values) => conn.query(sql, values),
    beginTransaction: () => conn.beginTransaction(),
    commit: () => conn.commit(),
    rollback: () => conn.rollback(),
    end: () => conn.release()
  };
}
