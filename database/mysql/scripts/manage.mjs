import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {connect,rootSql,migrate,grants,base,run,containerId,environment} from '../src/connection.mjs';
const mode=process.argv[2];
const dir=new URL('evidence/',base);
await mkdir(dir,{recursive:true});
export async function seed() {
  const sql=await readFile(new URL('seed.sql',base),'utf8');
  const c=await connect('expiry_dev');
  let locked=false;
  try {
    const [[{acquired}]]=await c.query("SELECT GET_LOCK('expiry_dev_seed',30) acquired");
    assert.equal(Number(acquired),1,'Development seed lock unavailable'); locked=true;
    // This file has ordinary DML only and no stored-program bodies/semicolon literals.
    for(const statement of sql.replace(/^--.*$/gm,'').split(';').filter(s=>s.trim())) await c.query(statement);
  } catch(error) {await c.rollback();throw error;}
  finally {
    if(locked) await c.query("SELECT RELEASE_LOCK('expiry_dev_seed')");
    await c.end();
  }
}
export async function devCounts() {
  const c=await connect('expiry_dev');
  try { const [rows]=await c.query("SELECT 'users' t,COUNT(*) n FROM users UNION ALL SELECT 'food_entries',COUNT(*) FROM food_entries UNION ALL SELECT 'stock_movements',COUNT(*) FROM stock_movements UNION ALL SELECT 'api_requests',COUNT(*) FROM api_requests"); return rows; } finally {await c.end();}
}
async function devFingerprint() {
  const c=await connect('expiry_dev');
  try {
    const rows={};
    for(const table of ['users','food_entries','stock_movements','api_requests']) {
      [rows[table]]=await c.query(`SELECT * FROM ${table} ORDER BY ${table==='api_requests'?'user_id,idempotency_key':'id'}`);
    }
    return createHash('sha256').update(JSON.stringify(rows)).digest('hex');
  } finally {await c.end();}
}
if(mode==='migrate-dev') {
  const migration=await migrate('expiry_dev'); await grants('expiry_dev'); await seed();
  console.log(JSON.stringify({migration,counts:await devCounts()}));
} else if(mode==='verify-dev') {
  const before=await devCounts();
  const seedBefore=await devFingerprint();
  const migration=await migrate('expiry_dev'); assert.equal(migration.applied,false);
  await seed(); assert.deepEqual(await devCounts(),before);
  const seedAfter=await devFingerprint();assert.equal(seedAfter,seedBefore,'Seed replay overwrote existing rows');
  const c=await connect('expiry_dev');
  let identity,tableNames;
  try {
    [[identity]]=await c.query('SELECT DATABASE() db,VERSION() version,@@time_zone time_zone,@@transaction_isolation isolation,@@default_storage_engine engine,CURRENT_USER() authenticated_account');
    assert.equal(identity.db,'expiry_dev'); assert.match(identity.version,/^8\.4\./); assert.equal(identity.time_zone,'+00:00'); assert.equal(identity.engine,'InnoDB');
    const [tables]=await c.query('SHOW TABLES'); tableNames=tables.map(r=>Object.values(r)[0]).sort(); assert.equal(tableNames.length,5);
    const [bad]=await c.query('SELECT e.id FROM food_entries e LEFT JOIN stock_movements m ON m.entry_id=e.id GROUP BY e.id,e.remaining_quantity HAVING COUNT(m.id)=0 OR COALESCE(SUM(m.quantity_after-m.quantity_before),0)<>e.remaining_quantity'); assert.equal(bad.length,0);
  } finally {await c.end();}
  const id=await containerId(), env=await environment();
  const inspect=JSON.parse(await run('docker',['inspect','--format','{{json .NetworkSettings.Ports}}',id]));
  assert.deepEqual(inspect['3306/tcp'],[{HostIp:'127.0.0.1',HostPort:env.MYSQL_HOST_PORT}]);
  const health=(await run('docker',['inspect','--format','{{.State.Health.Status}}',id])).trim(); assert.equal(health,'healthy');
  const image=JSON.parse(await run('docker',['image','inspect','mysql:8.4','--format','{{json .RepoDigests}}']));
  const dockerVersion=(await run('docker',['version','--format','{{.Server.Version}}'])).trim();
  const evidence={timestamp:new Date().toISOString(),identity,tableNames,counts:before,migration,seed_fingerprint_before:seedBefore,seed_fingerprint_after:seedAfter,health,binding:inspect['3306/tcp'],image,dockerVersion};
  await writeFile(new URL('dev-verification.json',dir),JSON.stringify(evidence,null,2)+'\n');
  console.log(JSON.stringify(evidence)); console.log('EXPIRY_DEV_VERIFIED');
} else if(mode==='dump-dev') {
  const dump=await run('docker',['exec',await containerId(),'sh','-c','MYSQL_PWD="$MYSQL_ROOT_PASSWORD" exec mysqldump --user=root --no-data --skip-comments --set-gtid-purged=OFF expiry_dev']);
  await writeFile(new URL('../../docs/erd/expiry_mysql_live_schema.sql',base),dump);
  console.log('Live schema dump saved (no rows/secrets).');
} else if(mode) { throw new Error('Use migrate-dev, verify-dev or dump-dev'); }
