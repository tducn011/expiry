import { randomUUID } from 'node:crypto';
import { connect as defaultConnect } from '../../shared/connection.mjs';
import { DomainError } from '../../shared/domain.mjs';

const sqlDate = value => new Date(value).toISOString().slice(0, 23).replace('T', ' ');
const instant = value => new Date(typeof value === 'string' && !value.includes('T') ? `${value.replace(' ', 'T')}Z` : value);
const principal = row => ({
  id: row.id,
  display_name: row.display_name,
  email: row.email_normalized,
  timezone: row.timezone,
  attention_lead_days: row.attention_lead_days,
  version: row.version
});

export class AuthRepository {
  constructor(database, { connect = defaultConnect } = {}) {
    this.database = database;
    this.connect = connect;
  }

  async transaction(work) {
    let connection;
    try {
      connection = await this.connect(this.database);
      await connection.beginTransaction();
      const result = await work(connection);
      await connection.commit();
      return result;
    } catch (error) {
      if (connection) await connection.rollback().catch(() => {});
      if (error instanceof DomainError) throw error;
      if (error.code === 'ER_DUP_ENTRY') throw new DomainError(409, 'EMAIL_ALREADY_REGISTERED');
      // Missing proposal tables, unavailable DB, and unexpected storage errors cannot bypass auth.
      throw new DomainError(503, 'AUTH_UNAVAILABLE');
    } finally {
      if (connection) await connection.end();
    }
  }

  async findCredential(email) {
    return this.transaction(async connection => {
      const [[row]] = await connection.execute(
        `SELECT u.id,u.display_name,u.timezone,u.attention_lead_days,u.version,
                c.email_normalized,c.password_verifier
         FROM local_credentials c JOIN users u ON u.id=c.user_id WHERE c.email_normalized=?`,
        [email]
      );
      return row ? { user: principal(row), password_verifier: row.password_verifier } : null;
    });
  }

  async insertSession(connection, userId, session, previousHash) {
    if (previousHash) {
      await connection.execute(
        'UPDATE user_sessions SET revoked_at=? WHERE token_hash=? AND revoked_at IS NULL',
        [sqlDate(session.created_at), previousHash]
      );
    }
    await connection.execute(
      `INSERT INTO user_sessions (token_hash,user_id,created_at,last_seen_at,expires_at)
       VALUES (?,?,?,?,?)`,
      [session.token_hash, userId, sqlDate(session.created_at), sqlDate(session.created_at), sqlDate(session.expires_at)]
    );
  }

  async register(input, session, previousHash) {
    return this.transaction(async connection => {
      const id = randomUUID();
      await connection.execute(
        `INSERT INTO users (id,identity_subject,display_name,timezone,created_at,updated_at)
         VALUES (?,?,?,?,?,?)`,
        [id, `local:${id}`, input.display_name, input.timezone, sqlDate(session.created_at), sqlDate(session.created_at)]
      );
      await connection.execute(
        'INSERT INTO local_credentials (user_id,email_normalized,password_verifier,created_at,updated_at) VALUES (?,?,?,?,?)',
        [id, input.email, input.password_verifier, sqlDate(session.created_at), sqlDate(session.created_at)]
      );
      await this.insertSession(connection, id, session, previousHash);
      return { id, display_name: input.display_name, email: input.email, timezone: input.timezone, attention_lead_days: 2, version: 1 };
    });
  }

  async createSession(userId, session, previousHash) {
    return this.transaction(connection => this.insertSession(connection, userId, session, previousHash));
  }

  async current(hash, clock, idleTimeoutMs) {
    return this.transaction(async connection => {
      const [[row]] = await connection.execute(
        `SELECT u.id,u.display_name,u.timezone,u.attention_lead_days,u.version,c.email_normalized,
                s.created_at,s.last_seen_at,s.expires_at,s.revoked_at
         FROM user_sessions s JOIN users u ON u.id=s.user_id
         JOIN local_credentials c ON c.user_id=u.id WHERE s.token_hash=? FOR UPDATE`,
        [hash]
      );
      // Sample request time after FOR UPDATE returns. A request may have waited
      // behind a newer legitimate activity update while retaining an older
      // timestamp captured at middleware entry.
      const now = clock();
      if (!row || row.revoked_at !== null || instant(row.expires_at) <= now || instant(row.last_seen_at).getTime() + idleTimeoutMs <= now.getTime()) return null;
      if (instant(row.created_at) > now || instant(row.last_seen_at) > now) throw new DomainError(503, 'AUTH_UNAVAILABLE');
      await connection.execute('UPDATE user_sessions SET last_seen_at=? WHERE token_hash=?', [sqlDate(now), hash]);
      return { user: principal(row), expires_at: instant(row.expires_at).toISOString() };
    });
  }

  async revoke(hash, now) {
    return this.transaction(async connection => {
      await connection.execute('UPDATE user_sessions SET revoked_at=? WHERE token_hash=? AND revoked_at IS NULL', [sqlDate(now), hash]);
    });
  }
}
