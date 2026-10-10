import mysql from 'mysql2/promise';
import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
export const base = new URL('../', import.meta.url);
export async function environment() {
  const content = await readFile(new URL('.env', base), 'utf8');
  const entries = content.split('\n').filter(line => line && !line.startsWith('#')).map(line => {
    const pos = line.indexOf('='); return [line.slice(0, pos), line.slice(pos + 1)];
  });
  const config = Object.fromEntries(entries);
  if (config.MYSQL_DATABASE !== 'expiry_dev' || config.MYSQL_USER !== 'expiry_app' || !/^\d+$/.test(config.MYSQL_HOST_PORT)) throw new Error('Unexpected sandbox configuration');
  for (const key of ['MYSQL_PASSWORD', 'MYSQL_ROOT_PASSWORD']) if (!/^[a-f0-9]{64}$/.test(config[key])) throw new Error('Use generated sandbox credentials');
  return config;
}
export async function connect(database) {
  if (!/^expiry_(dev|test_[a-z0-9_]+)$/.test(database)) throw new Error('Only explicit Expiry sandbox DB names are allowed');
  const env = await environment();
  const c = await mysql.createConnection({host:'127.0.0.1', port:Number(env.MYSQL_HOST_PORT), user:env.MYSQL_USER, password:env.MYSQL_PASSWORD, database, timezone:'Z', dateStrings:true, decimalNumbers:false, supportBigNumbers:true, bigNumberStrings:true});
  await c.query("SET SESSION time_zone='+00:00'");
  return c;
}
export function run(program, args, input = '') {
  return new Promise((resolve, reject) => {
    const child = spawn(program, args, {stdio:['pipe','pipe','pipe']});
    let stdout='', stderr='';
    child.stdout.on('data', data => stdout += data);
    child.stderr.on('data', data => stderr += data);
    child.on('error', reject);
    child.on('close', code => code === 0 ? resolve(stdout) : reject(new Error(`${program} exit ${code}: ${stderr.slice(0,3000)}`)));
    child.stdin.end(input);
  });
}
export async function containerId() {
  const names = await run('docker', ['ps','--filter','label=com.docker.compose.project=expiry-mysql84','--filter','label=com.docker.compose.service=mysql','--format','{{.ID}}']);
  const ids = names.trim().split('\n').filter(Boolean);
  if (ids.length !== 1) throw new Error('Expected exactly one running dedicated MySQL container');
  return ids[0];
}
export async function rootSql(sql, database) {
  if (database && !/^expiry_(dev|test_[a-z0-9_]+)$/.test(database)) throw new Error('Invalid sandbox database');
  const args = ['exec','-i',await containerId(),'sh','-c','MYSQL_PWD="$MYSQL_ROOT_PASSWORD" exec mysql --user=root --batch --skip-column-names "$@"','sh'];
  if (database) args.push('--database',database);
  return run('docker',args, "SET SESSION time_zone='+00:00';\n" + sql);
}
export async function migrate(database) {
  const sql = await readFile(new URL('migrations/001_initial_schema.sql',base),'utf8');
  const hash = createHash('sha256').update(sql).digest('hex');
  await rootSql('CREATE TABLE IF NOT EXISTS schema_migrations (version INT PRIMARY KEY, sha256 CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL, applied_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)) ENGINE=InnoDB;',database);
  const old = (await rootSql('SELECT sha256 FROM schema_migrations WHERE version=1;',database)).trim();
  if (old) { if (old !== hash) throw new Error('Applied migration checksum drift: create a new version'); return {applied:false,hash}; }
  const tables = (await rootSql("SELECT table_name FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name <> 'schema_migrations';",database)).trim();
  if (tables) throw new Error('Unversioned/partial schema found; preserve data and use explicit forward recovery');
  await rootSql(sql,database);
  await rootSql(`INSERT INTO schema_migrations(version,sha256) VALUES (1,'${hash}');`,database);
  return {applied:true,hash};
}
export async function grants(database) {
  if (!/^expiry_(dev|test_[a-z0-9_]+)$/.test(database)) throw new Error('Invalid database grants');
  // Official image escapes underscores in schema grants. Resolve the actual grant
  // before revoking; do not broaden/drop privileges on other test or project DBs.
  const hex=(await rootSql("SELECT HEX(Db) FROM mysql.db WHERE User='expiry_app' AND Host='%';")).trim();
  for(const row of hex.split('\n').filter(Boolean)) {
    const pattern=Buffer.from(row,'hex').toString('utf8');
    if(pattern.replaceAll('\\_','_')===database) {
      if(!/^[a-z0-9_\\]+$/.test(pattern)) throw new Error('Unexpected grant pattern');
      await rootSql(`REVOKE ALL PRIVILEGES ON \`${pattern}\`.* FROM 'expiry_app'@'%';`);
    }
  }
  const exact=database.replaceAll('_','\\_');
  await rootSql(`GRANT SELECT ON \`${exact}\`.* TO 'expiry_app'@'%';\nGRANT INSERT, UPDATE ON \`${database}\`.users TO 'expiry_app'@'%';\nGRANT INSERT, UPDATE ON \`${database}\`.food_entries TO 'expiry_app'@'%';\nGRANT INSERT ON \`${database}\`.stock_movements TO 'expiry_app'@'%';\nGRANT INSERT, UPDATE ON \`${database}\`.api_requests TO 'expiry_app'@'%';`);
}
