import mysql from 'mysql2/promise';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ponytail: standard Node.js env loading without custom file parsers
export function getDbConfig() {
  return {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_HOST_PORT || process.env.MYSQL_PORT || 3307),
    user: process.env.MYSQL_USER || 'expiry_app',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'expiry_dev'
  };
}

export async function loadEnv() {
  const envCandidates = [
    resolve(process.cwd(), '.env'),
    resolve(__dirname, '../../.env'),
    resolve(__dirname, '../../../../database/mysql/.env')
  ];

  for (const envPath of envCandidates) {
    if (existsSync(envPath)) {
      try {
        process.loadEnvFile?.(envPath);
        break;
      } catch {
        // Continue fallback
      }
    }
  }

  return getDbConfig();
}

const pools = new Map();

export async function getPool(customDb) {
  const config = await loadEnv();
  const database = customDb || config.database;
  const key = JSON.stringify([config.host, config.port, config.user, config.password, database]);
  if (!pools.has(key)) {
    const pool = mysql.createPool({
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
    });
    pool.on('connection', conn => {
      conn.query("SET SESSION time_zone='+00:00'", error => {
        if (error) {
          console.error('[Expiry API] Failed to set MySQL session time zone to UTC:', error);
          conn.destroy();
        }
      });
    });
    pools.set(key, pool);
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
  let inTransaction = false;
  return {
    execute: (sql, values) => conn.execute(sql, values),
    query: (sql, values) => conn.query(sql, values),
    beginTransaction: async () => {
      await conn.beginTransaction();
      inTransaction = true;
    },
    commit: async () => {
      await conn.commit();
      inTransaction = false;
    },
    rollback: async () => {
      await conn.rollback();
      inTransaction = false;
    },
    end: async () => {
      if (inTransaction) {
        try {
          await conn.rollback();
          inTransaction = false;
        } catch (error) {
          conn.destroy();
          throw error;
        }
      }
      conn.release();
    }
  };
}
