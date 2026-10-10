import assert from 'node:assert/strict';
import {randomUUID,randomBytes} from 'node:crypto';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {performance} from 'node:perf_hooks';
import {connect,rootSql,migrate,grants,base,run,containerId} from '../src/connection.mjs';
import {InventoryRepository} from '../src/repository.mjs';
import {attention} from '../src/domain.mjs';

const stamp=new Date().toISOString().replace(/[-:TZ.]/g,'').toLowerCase();
const database=`expiry_test_${stamp}_${randomBytes(3).toString('hex')}`;
const report={started_at:new Date().toISOString(),database,results:[],notes:[],commands:['node database/mysql/tests/run.mjs'],schema:null};
const evidence=new URL('evidence/',base);
await mkdir(evidence,{recursive:true});
async function check(test_id,requirements,setup,command,expected,fn) {
  const start=performance.now();
  try {
    const actual=await fn();
    report.results.push({test_id,requirements,setup,command,expected,actual,status:'PASS',duration_ms:+(performance.now()-start).toFixed(2)});
    console.log(`PASS ${test_id}`);
  } catch(error) {
    report.results.push({test_id,requirements,setup,command,expected,actual:{error:error.message,code:error.code},status:'FAIL',duration_ms:+(performance.now()-start).toFixed(2)});
    console.log(`FAIL ${test_id}: ${error.message}`);
  }
}
async function db(fn) {const c=await connect(database);try{return await fn(c);}finally{await c.end();}}
const key=prefix=>`${prefix}_${randomUUID()}`;
const repository=options=>new InventoryRepository(database,options);
async function user(timezone='Asia/Ho_Chi_Minh') {
  const id=randomUUID();
  await db(c=>c.execute('INSERT INTO users(id,identity_subject,display_name,timezone) VALUES (?,?,?,?)',[id,'test:'+id,'Test owner',timezone]));return id;
}
const draft=(overrides={})=>({name:'Rice',quantity:'500.000',unit:'g',...overrides});
async function create(owner,overrides={}) {return (await repository().create(owner,key('create'),draft(overrides))).body;}
async function snapshot(id) {
  return db(async c=>{
    const [[entry]]=await c.execute('SELECT * FROM food_entries WHERE id=?',[id]);
    const [movements]=await c.execute('SELECT * FROM stock_movements WHERE entry_id=? ORDER BY recorded_at,id',[id]);
    return {entry,movements};
  });
}
async function code(fn,expectedCode,status) {await assert.rejects(fn,error=>error.code===expectedCode && (status===undefined || error.status===status));}
function barrier(count) {
  let arrived=0,release;
  const ready=new Promise(resolve=>release=resolve);
  const connections=new Set();
  return {connections,async wait({c}) {
    const [[row]]=await c.query('SELECT CONNECTION_ID() id');connections.add(String(row.id));
    if(++arrived===count) release();
    let timer;
    try {await Promise.race([ready,new Promise((_,reject)=>timer=setTimeout(()=>reject(new Error('Concurrency barrier timed out')),5000))]);}
    finally {clearTimeout(timer);}
  }};
}
await rootSql(`CREATE DATABASE \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;`);
const applied=await migrate(database);assert.equal(applied.applied,true);await grants(database);

await check('SCHEMA-STRUCTURE','VT-01/16; RULE-01/03/04/09/10/18','Fresh isolated schema','INFORMATION_SCHEMA tables/columns/constraints/statistics','Exactly four domain tables + one migration table; all expected columns/keys/checks',async()=>{
  return db(async c=>{
    const [tables]=await c.query('SELECT TABLE_NAME,ENGINE FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA=? ORDER BY TABLE_NAME',[database]);
    assert.deepEqual(tables.map(t=>t.TABLE_NAME),['api_requests','food_entries','schema_migrations','stock_movements','users']);assert(tables.every(t=>t.ENGINE==='InnoDB'));
    const [columns]=await c.query('SELECT TABLE_NAME,COLUMN_NAME,COLUMN_TYPE,IS_NULLABLE,COLUMN_DEFAULT,COLLATION_NAME,EXTRA,GENERATION_EXPRESSION FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=? ORDER BY TABLE_NAME,ORDINAL_POSITION',[database]);
    const expectedColumns={users:['id','identity_subject','display_name','timezone','attention_lead_days','version','created_at','updated_at'],food_entries:['id','user_id','name','storage_location','remaining_quantity','unit','expiry_date','date_certainty','date_source','date_label_type','opened_on','note','version','deleted_at','created_at','updated_at'],stock_movements:['id','entry_id','kind','quantity_before','quantity_after','reason','recorded_at','initial_entry_id'],api_requests:['user_id','idempotency_key','operation','request_hash','response_status','response_body','created_at'],schema_migrations:['version','sha256','applied_at']};
    for(const [name,fields] of Object.entries(expectedColumns)) assert.deepEqual(columns.filter(v=>v.TABLE_NAME===name).map(v=>v.COLUMN_NAME),fields);
    const nullable={users:[],food_entries:['expiry_date','opened_on','note','deleted_at'],stock_movements:['reason','initial_entry_id'],api_requests:['response_status','response_body'],schema_migrations:[]};
    for(const column of columns) assert.equal(column.IS_NULLABLE,nullable[column.TABLE_NAME].includes(column.COLUMN_NAME)?'YES':'NO');
    const col=(t,n)=>columns.find(v=>v.TABLE_NAME===t&&v.COLUMN_NAME===n);
    for(const [t,n] of [['users','id'],['food_entries','id'],['food_entries','user_id'],['stock_movements','entry_id'],['api_requests','user_id'],['api_requests','idempotency_key'],['api_requests','request_hash']]) assert.equal(col(t,n).COLLATION_NAME,'ascii_bin');
    assert.equal(col('food_entries','remaining_quantity').COLUMN_TYPE,'decimal(12,3)');assert.equal(col('food_entries','expiry_date').COLUMN_TYPE,'date');assert.equal(col('food_entries','expiry_date').IS_NULLABLE,'YES');assert.equal(col('food_entries','created_at').COLUMN_TYPE,'datetime(6)');assert.equal(col('api_requests','response_body').COLUMN_TYPE,'json');assert.match(col('stock_movements','initial_entry_id').EXTRA,/STORED GENERATED/);
    assert.equal(col('users','attention_lead_days').COLUMN_DEFAULT,'2');assert.equal(col('users','timezone').COLUMN_DEFAULT,'Asia/Ho_Chi_Minh');assert.equal(col('food_entries','date_certainty').COLUMN_DEFAULT,'unknown');assert.equal(col('food_entries','date_source').COLUMN_DEFAULT,'unknown');assert.equal(col('food_entries','date_label_type').COLUMN_DEFAULT,'unspecified');
    const [fks]=await c.query('SELECT CONSTRAINT_NAME,TABLE_NAME,REFERENCED_TABLE_NAME,UPDATE_RULE,DELETE_RULE FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=? ORDER BY CONSTRAINT_NAME',[database]);
    assert.equal(fks.length,3);assert(fks.every(f=>f.DELETE_RULE==='RESTRICT'&&f.UPDATE_RULE==='RESTRICT'));
    const [references]=await c.query('SELECT TABLE_NAME,COLUMN_NAME,REFERENCED_TABLE_NAME,REFERENCED_COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA=? AND REFERENCED_TABLE_NAME IS NOT NULL ORDER BY TABLE_NAME',[database]);
    assert.deepEqual(references.map(r=>[r.TABLE_NAME,r.COLUMN_NAME,r.REFERENCED_TABLE_NAME,r.REFERENCED_COLUMN_NAME]),[['api_requests','user_id','users','id'],['food_entries','user_id','users','id'],['stock_movements','entry_id','food_entries','id']]);
    const [constraints]=await c.query('SELECT TABLE_NAME,CONSTRAINT_NAME,CONSTRAINT_TYPE,ENFORCED FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA=? ORDER BY TABLE_NAME,CONSTRAINT_NAME',[database]);
    assert(constraints.filter(v=>v.CONSTRAINT_TYPE==='CHECK').every(v=>v.ENFORCED==='YES'));
    const declaredChecks=[...((await readFile(new URL('migrations/001_initial_schema.sql',base),'utf8')).matchAll(/CONSTRAINT\s+(\w+)\s+CHECK/g))].map(m=>m[1]).sort();
    assert.deepEqual(constraints.filter(v=>v.CONSTRAINT_TYPE==='CHECK').map(v=>v.CONSTRAINT_NAME).sort(),declaredChecks);
    const [indexes]=await c.query('SELECT TABLE_NAME,INDEX_NAME,COLUMN_NAME,SEQ_IN_INDEX,NON_UNIQUE,COLLATION FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA=? ORDER BY TABLE_NAME,INDEX_NAME,SEQ_IN_INDEX',[database]);
    const fields=(table,index)=>indexes.filter(i=>i.TABLE_NAME===table&&i.INDEX_NAME===index).map(i=>i.COLUMN_NAME);
    assert.deepEqual(fields('api_requests','PRIMARY'),['user_id','idempotency_key']);assert.deepEqual(fields('stock_movements','one_initial_per_entry'),['initial_entry_id']);assert.deepEqual(fields('food_entries','entries_owner_visible'),['user_id','deleted_at','expiry_date','id']);assert.deepEqual(fields('food_entries','entries_owner_quantity'),['user_id','deleted_at','remaining_quantity','id']);assert.deepEqual(fields('food_entries','entries_owner_trash'),['user_id','deleted_at','id']);assert.deepEqual(fields('stock_movements','movements_entry_history'),['entry_id','recorded_at','id']);
    assert(!indexes.some(v=>v.TABLE_NAME==='food_entries'&&v.NON_UNIQUE===0&&v.COLUMN_NAME==='name'));
    report.schema={tables,columns,fks,constraints,indexes,check_count:constraints.filter(v=>v.CONSTRAINT_TYPE==='CHECK').length};return {table_count:tables.length,column_count:columns.length,fk_count:fks.length,check_count:report.schema.check_count};
  });
});
await check('MIGRATION-REPLAY','VT-16; NFR-07','Applied version001','migrate(database) again; sha256 comparison','No DDL replay or duplicate metadata record',async()=>{const second=await migrate(database);assert.equal(second.applied,false);assert.equal(second.hash,applied.hash);return second;});
await check('FK-ORPHANS','RULE-01/04; VT-01','Existing owner; random nonexistent owner/entry','Direct INSERT orphan entries, movements, api_requests; administrator DELETE owner','FK rejects all orphans and RESTRICT rejects parent delete',async()=>{
  const owner=await user(),entry=await create(owner);
  await db(async c=>{
    await code(()=>c.execute("INSERT INTO food_entries(id,user_id,name,remaining_quantity,unit) VALUES (?,?,'Orphan',1,'piece')",[randomUUID(),randomUUID()]),'ER_NO_REFERENCED_ROW_2');
    await code(()=>c.execute("INSERT INTO stock_movements(id,entry_id,kind,quantity_before,quantity_after) VALUES (?,?,'initial',0,1)",[randomUUID(),randomUUID()]),'ER_NO_REFERENCED_ROW_2');
    await code(()=>c.execute("INSERT INTO api_requests(user_id,idempotency_key,operation,request_hash) VALUES (?,'orphan_key','test',?)",[randomUUID(),'a'.repeat(64)]),'ER_NO_REFERENCED_ROW_2');
  });
  await assert.rejects(()=>rootSql(`DELETE FROM users WHERE id='${owner}';`,database),/1451/);
  return {orphan_rejections:3,parent_delete_rejected:true,entry:entry.id};
});
await check('DB-ROW-GUARDS','RULE-03/09/10/17/18; VT-04/14','Valid owner and entry','Direct invalid INSERT/UPDATE CHECK writes','Negative/fractional piece/version0/date conflicts/invalid key/hash/result rejected by DB',async()=>{
  const owner=await user(),entry=await create(owner,{unit:'piece',quantity:'2'});
  const rejected=[];
  await db(async c=>{
    for(const [field,value] of [['remaining_quantity','-1'],['remaining_quantity','1.5'],['unit','kg'],['version',0],['name',' '],['date_source','printed_label'],['date_certainty','known']]) {
      await code(()=>c.execute(`UPDATE food_entries SET ${field}=? WHERE id=?`,[value,entry.id]),'ER_CHECK_CONSTRAINT_VIOLATED');rejected.push(field+':'+value);
    }
    await code(()=>c.execute('UPDATE users SET attention_lead_days=31 WHERE id=?',[owner]),'ER_CHECK_CONSTRAINT_VIOLATED');
    await code(()=>c.execute("INSERT INTO api_requests(user_id,idempotency_key,operation,request_hash) VALUES (?,'bad key!','op',?)",[owner,'a'.repeat(64)]),'ER_CHECK_CONSTRAINT_VIOLATED');
    await code(()=>c.execute("INSERT INTO api_requests(user_id,idempotency_key,operation,request_hash) VALUES (?,'good_key','op','not_sha')",[owner]),'ER_CHECK_CONSTRAINT_VIOLATED');
    await code(()=>c.execute("INSERT INTO api_requests(user_id,idempotency_key,operation,request_hash,response_status) VALUES (?,'good_key','op',?,204)",[owner,'a'.repeat(64)]),'ER_CHECK_CONSTRAINT_VIOLATED');
  });return {rejected,additional_rejections:4};
});
await check('DB-CREATE','SC-01/02; VT-01; FR-01; RULE-02/04','Same-name captures with known, unknown and estimated date','repository.create; SELECT initial and entry rows','Separate IDs; one initial each; correct nullable dates/trimmed input',async()=>{
  const owner=await user();const a=await create(owner,{name:'  Rice  ',storage_location:'  Fridge  ',expiry_date:'2026-10-10',date_certainty:'known',date_source:'printed_label',date_label_type:'use_by'});
  const b=await create(owner,{name:'Rice',storage_location:'Fridge'}),d=await create(owner,{expiry_date:'2026-10-09',date_certainty:'estimated',date_source:'user_estimate'});
  assert.notEqual(a.id,b.id);assert.equal(a.name,'Rice');assert.equal(a.storage_location,'Fridge');assert.equal(b.expiry_date,null);assert.equal(b.date_source,'unknown');assert.equal(d.expiry_date,'2026-10-09');
  for(const entry of [a,b,d]){const s=await snapshot(entry.id);assert.equal(s.movements.length,1);assert.equal(s.movements[0].kind,'initial');assert.equal(s.movements[0].quantity_after,entry.remaining_quantity);}
  return {ids:[a.id,b.id,d.id],dates:[a.expiry_date,b.expiry_date,d.expiry_date],initial_each:1};
});
await check('INITIAL-CARDINALITY','RULE-04; VT-01/02','Created entry and transaction-local raw parent','INSERT second initial; low-level parent with no movement then rollback','DB limits max1 initial; workflow enforces min1; FK alone does not enforce min1',async()=>{
  const owner=await user(),entry=await create(owner);let missingParent;
  await db(async c=>{
    await code(()=>c.execute("INSERT INTO stock_movements(id,entry_id,kind,quantity_before,quantity_after) VALUES (?,?,'initial',0,500)",[randomUUID(),entry.id]),'ER_DUP_ENTRY');
    await c.beginTransaction();missingParent=randomUUID();
    await c.execute("INSERT INTO food_entries(id,user_id,name,remaining_quantity,unit) VALUES (?,?,'Raw parent',1,'piece')",[missingParent,owner]);
    const [[{n}]]=await c.execute('SELECT COUNT(*) n FROM stock_movements WHERE entry_id=?',[missingParent]);assert.equal(Number(n),0);await c.rollback();
  });return {second_initial:'ER_DUP_ENTRY',minimum_child:'service transaction; low-level zero child accepted only in rolled-back probe'};
});
await check('QUANTITY-VALIDATION','SC-05/06; VT-04; RULE-03/05','Input validation before any SQL write','Capture negative/zero/overflow/4decimal/fractional piece; overspend','422 invalid; 409 overspend; no mutation',async()=>{
  const owner=await user();const invalidAmounts=['-1','0','1000000000','1.0004','1.0000'];
  for(const quantity of invalidAmounts) await code(()=>repository().create(owner,key('invalid'),draft({quantity})),'VALIDATION_ERROR',422);
  await code(()=>create(owner,{unit:'piece',quantity:'1.500'}),'VALIDATION_ERROR',422);
  const entry=await create(owner);
  await code(()=>repository().consume(owner,key('over'),entry.id,{kind:'consume',amount:'501',expected_version:1}),'INSUFFICIENT_QUANTITY',409);
  await code(()=>repository().consume(owner,key('neg'),entry.id,{kind:'consume',amount:'-1',expected_version:1}),'VALIDATION_ERROR',422);
  assert.equal((await snapshot(entry.id)).entry.remaining_quantity,'500.000');
  return {invalid_capture_count:6,overspend:'409',remaining:'500.000'};
});
await check('DECIMAL-COERCION','RULE-03; VT-04','Transaction-local raw insert versus domain string validation','INSERT g quantity1.0004; SHOW WARNINGS; ROLLBACK','MySQL stores1.000 with warning; domain rejects extra scale before SQL',async()=>{
  const owner=await user();let actual,warnings;
  await db(async c=>{await c.beginTransaction();const id=randomUUID();await c.execute("INSERT INTO food_entries(id,user_id,name,remaining_quantity,unit) VALUES (?,?,'Rounding probe','1.0004','g')",[id,owner]);[warnings]=await c.query('SHOW WARNINGS');[[actual]]=await c.execute('SELECT remaining_quantity FROM food_entries WHERE id=?',[id]);assert.equal(actual.remaining_quantity,'1.000');assert(warnings.some(w=>w.Code===1265));await c.rollback();});
  const exact=await create(owner,{quantity:'999999999.999'});assert.equal(exact.remaining_quantity,'999999999.999');return {raw_storage:actual,warnings,max_exact:exact.remaining_quantity};
});
await check('DATE-STATES','SC-02/11; VT-01/14; RULE-09/10/11/21/22','Known, unknown, estimated, past and opened inputs','repository.create with contradictory metadata and invalid dates','Valid past allowed; conflicts/null location/invalid dates rejected; opened_on does not derive expiry',async()=>{
  const owner=await user();
  for(const input of [{date_certainty:'known'},{expiry_date:'2026-10-10'},{expiry_date:'2026-02-30',date_certainty:'known',date_source:'user_entered'},{expiry_date:'2026-10-10',date_certainty:'estimated',date_source:'printed_label'},{storage_location:null}])await code(()=>create(owner,input),'VALIDATION_ERROR',422);
  const past=await create(owner,{expiry_date:'2020-01-01',date_certainty:'known',date_source:'user_entered',opened_on:'2026-10-01'});assert.equal(past.expiry_date,'2020-01-01');
  const unknown=await create(owner,{opened_on:'2026-10-01'});assert.equal(unknown.expiry_date,null);return {rejected:5,past_date:past.expiry_date,opened_unknown_expiry:unknown.expiry_date};
});
await check('LEDGER-KINDS','SC-05/06/12; VT-03/10; FR-04/07; RULE-05/16','1000g entry','consume250 then discard750; query ledger','750 then0; consume/discard separate; depleted derived',async()=>{
  const owner=await user(),entry=await create(owner,{quantity:'1000'}),repo=repository();
  const a=await repo.consume(owner,key('consume'),entry.id,{kind:'consume',amount:'250',expected_version:1});assert.equal(a.body.entry.remaining_quantity,'750.000');assert.equal(a.body.entry.version,2);
  const b=await repo.consume(owner,key('discard'),entry.id,{kind:'discard',amount:'750',expected_version:2});assert.equal(b.body.entry.remaining_quantity,'0.000');
  const s=await snapshot(entry.id);assert.deepEqual(s.movements.map(m=>m.kind),['initial','consume','discard']);
  const depleted=await repo.list(owner,{lifecycle:'depleted'});assert.equal(depleted.total,1);assert.equal(depleted.items[0].attention,null);assert.equal((await repo.list(owner,{view:'attention'})).total,0);
  return {remaining:s.entry.remaining_quantity,kinds:s.movements.map(m=>m.kind),version:s.entry.version,lifecycle:depleted.items[0].lifecycle};
});
await check('RECOUNT','SC-07; VT-08/09; FR-06; RULE-06','Same amount; then depleted→positive','recount same; consume all; recount with reason','No-op preserves version/event; adjustment reactivates with reason',async()=>{
  const owner=await user(),entry=await create(owner),repo=repository();
  const noop=await repo.recount(owner,key('noop'),entry.id,{actual_quantity:'500',reason:'Counted',expected_version:1});assert.equal(noop.status,200);assert.equal(noop.body.changed,false);assert.equal(noop.body.entry.version,1);assert.equal((await snapshot(entry.id)).movements.length,1);
  await code(()=>repo.recount(owner,key('empty'),entry.id,{actual_quantity:'500',reason:' ',expected_version:1}),'VALIDATION_ERROR',422);
  await repo.consume(owner,key('all'),entry.id,{kind:'consume',amount:'500',expected_version:1});
  const corrected=await repo.recount(owner,key('recount'),entry.id,{actual_quantity:'200.125',reason:'Actual physical count',expected_version:2});assert.equal(corrected.body.movement.kind,'adjustment');assert.equal(corrected.body.entry.version,3);
  const down=await repo.recount(owner,key('downward'),entry.id,{actual_quantity:'150.125',reason:'Recount found 50g less',expected_version:3});
  assert.equal(down.body.entry.version,4);assert.equal(down.body.movement.quantity_before,'200.125');assert.equal(down.body.movement.quantity_after,'150.125');assert.equal(down.body.movement.kind,'adjustment');assert.equal(down.body.movement.reason,'Recount found 50g less');
  return {noop_version:1,increased:corrected.body.movement,downward:down.body.movement,remaining:down.body.entry.remaining_quantity};
});
await check('DELETE-RESTORE','SC-10; VT-11; FR-08; RULE-15/17/18','Active entry','remove; replay same key with old version; restore current version; query JSON null','Quantity/history unchanged; 204 JSON null complete; restore version3',async()=>{
  const owner=await user(),entry=await create(owner),repo=repository(),removeKey=key('remove');const before=await snapshot(entry.id);
  const removed=await repo.remove(owner,removeKey,entry.id,{expected_version:1});assert.equal(removed.status,204);assert.equal(removed.body,null);
  const replay=await repo.remove(owner,removeKey,entry.id,{expected_version:1});assert.equal(replay.replayed,true);assert.equal(replay.status,204);
  await db(async c=>{const [[row]]=await c.execute('SELECT response_status,response_body IS NULL sql_null,JSON_TYPE(response_body) json_type FROM api_requests WHERE user_id=? AND idempotency_key=?',[owner,removeKey]);assert.equal(Number(row.sql_null),0);assert.equal(row.json_type,'NULL');});
  assert.equal((await repo.list(owner,{view:'trash'})).total,1);assert.equal((await repo.list(owner)).total,0);
  await code(()=>repo.restore(owner,key('stale'),entry.id,{expected_version:1}),'VERSION_CONFLICT',409);
  await repo.restore(owner,key('restore'),entry.id,{expected_version:2});const after=await snapshot(entry.id);assert.equal(after.entry.remaining_quantity,before.entry.remaining_quantity);assert.deepEqual(after.movements,before.movements);assert.equal(after.entry.deleted_at,null);assert.equal(after.entry.version,3);
  return {quantity:after.entry.remaining_quantity,movement_count:after.movements.length,version:3,stored_204:'JSON null (not SQL NULL)'};
});
await check('METADATA','SC-11; VT-14; FR-05; RULE-07/08/09/17','Known-date entry','Merged PATCH validation and forbidden fields','Malformed date or quantity/unit/owner patch422; valid metadata changes no history',async()=>{
  const owner=await user(),entry=await create(owner,{expiry_date:'2026-10-10',date_certainty:'known',date_source:'printed_label'}),repo=repository();
  for(const input of [{expiry_date:null},{remaining_quantity:'4'},{unit:'ml'},{user_id:randomUUID()}])await code(()=>repo.edit(owner,key('badedit'),entry.id,{...input,expected_version:1}),'VALIDATION_ERROR',422);
  const edited=await repo.edit(owner,key('edit'),entry.id,{expiry_date:null,date_certainty:'unknown',date_source:'unknown',date_label_type:'unspecified',expected_version:1});assert.equal(edited.body.version,2);assert.equal(edited.body.remaining_quantity,'500.000');assert.equal((await snapshot(entry.id)).movements.length,1);return {version:2,expiry:edited.body.expiry_date,movement_count:1};
});
for(const phase of ['after_reserve','after_entry','after_movement','after_domain','after_result']) {
  await check(`TX-CREATE-${phase}`,'SC-01; VT-02; RULE-04/19',`Fault injection ${phase}`,'Throw before commit; SELECT owned entries and request key','Entry, initial and reservation/result all rolled back',async()=>{
    const owner=await user(),requestKey=key('fault');let injected=false;
    const repo=repository({hooks:{[phase]:()=>{injected=true;throw new Error('INJECTED_FAULT');}}});
    await assert.rejects(()=>repo.create(owner,requestKey,draft()),/INJECTED_FAULT/);assert(injected);
    return db(async c=>{const [[row]]=await c.execute('SELECT (SELECT COUNT(*) FROM food_entries WHERE user_id=?) entries,(SELECT COUNT(*) FROM api_requests WHERE user_id=? AND idempotency_key=?) requests',[owner,owner,requestKey]);assert.equal(Number(row.entries),0);assert.equal(Number(row.requests),0);return row;});
  });
}
for(const phase of ['after_quantity','after_movement','after_domain','after_result']) {
  await check(`TX-MOVEMENT-${phase}`,'SC-05; VT-02/03; RULE-05/19',`500g entry; fault ${phase}`,'Throw before commit; compare full entry/ledger snapshot and key','Quantity/version/history unchanged; reservation absent',async()=>{
    const owner=await user(),entry=await create(owner),before=await snapshot(entry.id),requestKey=key('fault');
    const repo=repository({hooks:{[phase]:()=>{throw new Error('INJECTED_FAULT');}}});
    await assert.rejects(()=>repo.consume(owner,requestKey,entry.id,{kind:'consume',amount:'100',expected_version:1}),/INJECTED_FAULT/);assert.deepEqual(await snapshot(entry.id),before);
    await db(async c=>{const [[{n}]]=await c.execute('SELECT COUNT(*) n FROM api_requests WHERE user_id=? AND idempotency_key=?',[owner,requestKey]);assert.equal(Number(n),0);});return {remaining:'500.000',version:1,movements:1,reservation:0};
  });
}
await check('CONCURRENT-VERSION','SC-09; VT-05; NFR-02; RULE-05/17','Two live transactions;500g;expected1;use350 each','Barrier before reservation; Promise.allSettled two connections','Exactly1 success and1 VERSION_CONFLICT; remaining150;one new event',async()=>{
  const owner=await user(),entry=await create(owner),sync=barrier(2),repo=repository({hooks:{before_reserve:context=>sync.wait(context)}});
  const outcomes=await Promise.allSettled([repo.consume(owner,key('tabA'),entry.id,{kind:'consume',amount:'350',expected_version:1}),repo.consume(owner,key('tabB'),entry.id,{kind:'consume',amount:'350',expected_version:1})]);
  assert.equal(outcomes.filter(o=>o.status==='fulfilled').length,1);const failure=outcomes.find(o=>o.status==='rejected');assert.equal(failure.reason.code,'VERSION_CONFLICT');assert.equal(sync.connections.size,2);const after=await snapshot(entry.id);assert.equal(after.entry.remaining_quantity,'150.000');assert.equal(after.movements.length,2);
  return {connection_ids:[...sync.connections],outcomes:outcomes.map(o=>o.status==='fulfilled'?'201':o.reason.code),remaining:'150.000',events:2};
});
await check('CONCURRENT-REPLAY','SC-08; VT-06; RULE-18/19','Three simultaneous identical commands;500g','Barrier on3 live transactions;same key/operation/payload','One mutation;two replays;all identical saved bodies',async()=>{
  const owner=await user(),entry=await create(owner),sync=barrier(3),repo=repository({hooks:{before_reserve:context=>sync.wait(context)}}),requestKey=key('same');
  const outcomes=await Promise.all(Array.from({length:3},()=>repo.consume(owner,requestKey,entry.id,{kind:'consume',amount:'200',expected_version:1})));
  assert.equal(outcomes.filter(o=>!o.replayed).length,1);assert.equal(outcomes.filter(o=>o.replayed).length,2);assert(sync.connections.size>=3);for(const o of outcomes)assert.deepEqual(o.body,outcomes[0].body);
  const after=await snapshot(entry.id);assert.equal(after.entry.remaining_quantity,'300.000');assert.equal(after.movements.length,2);
  return {connection_ids:[...sync.connections],replays:2,remaining:'300.000',events:2};
});
await check('PREFERENCES-CONCURRENCY','SC-14; VT-05/13; RULE-13/17','Two reserved keys take owner FK shared locks then upgrade owner row','Barrier after_reserve;two settings commands expected1','One settings mutation;one VERSION_CONFLICT;deadlock retries stay atomic',async()=>{
  const owner=await user(),sync=barrier(2),repo=repository({hooks:{after_reserve:context=>sync.wait(context)}});
  const outcomes=await Promise.allSettled([repo.setPreferences(owner,key('prefA'),{attention_lead_days:1,expected_version:1}),repo.setPreferences(owner,key('prefB'),{attention_lead_days:3,expected_version:1})]);
  assert.equal(outcomes.filter(o=>o.status==='fulfilled').length,1);assert.equal(outcomes.find(o=>o.status==='rejected').reason.code,'VERSION_CONFLICT');
  return db(async c=>{const [[row]]=await c.execute('SELECT version,attention_lead_days FROM users WHERE id=?',[owner]);assert.equal(row.version,2);const [[{n}]]=await c.execute('SELECT COUNT(*) n FROM api_requests WHERE user_id=?',[owner]);assert.equal(Number(n),1);return {connection_ids:[...sync.connections],user:row,completed_requests:1};});
});
await check('REPLAY-KEY-CONFLICT','SC-08; VT-07; RULE-18','Lost response after commit;new target/payload/key case/owner','Retry old version then reuse key with changed amount/target','Original result replay;changed input409;case-sensitive and owner-scoped keys',async()=>{
  const owner=await user(),other=await user(),entry=await create(owner),another=await create(owner),repo=repository(),requestKey='CaseKey_ABCDEFG';
  const first=await repo.consume(owner,requestKey,entry.id,{kind:'consume',amount:'100',expected_version:1});const replay=await repo.consume(owner,requestKey,entry.id,{expected_version:1,amount:'100.000',kind:'consume'});assert.equal(replay.replayed,true);assert.deepEqual(first.body,replay.body);
  await code(()=>repo.consume(owner,requestKey,entry.id,{kind:'consume',amount:'101',expected_version:1}),'IDEMPOTENCY_KEY_REUSED',409);
  await code(()=>repo.consume(owner,requestKey,another.id,{kind:'consume',amount:'100',expected_version:1}),'IDEMPOTENCY_KEY_REUSED',409);
  await repo.consume(owner,requestKey.toLowerCase(),entry.id,{kind:'consume',amount:'100',expected_version:2});
  const foreign=await create(other);await repo.consume(other,requestKey,foreign.id,{kind:'consume',amount:'100',expected_version:1});return {original_status:first.status,lost_response_replayed:true,payload_target_conflicts:2,case_and_owner_separate:true};
});
await check('OWNER-SCOPE','SC-13; VT-12 repository layer; RULE-01/24','UserA entry;UserB principal','get/history/edit/consume/remove/restore foreign IDs;DTO owner injection','All foreign entry operations404;missing principal401;no foreign changes',async()=>{
  const a=await user(),b=await user(),entry=await create(a),before=await snapshot(entry.id),repo=repository();
  const actions=[()=>repo.get(b,entry.id),()=>repo.get(b,entry.id,true),()=>repo.edit(b,key('foreign'),entry.id,{name:'bad',expected_version:1}),()=>repo.consume(b,key('foreign'),entry.id,{kind:'consume',amount:'1',expected_version:1}),()=>repo.remove(b,key('foreign'),entry.id,{expected_version:1}),()=>repo.restore(b,key('foreign'),entry.id,{expected_version:1})];
  for(const action of actions)await code(action,'ENTRY_NOT_FOUND',404);
  await code(()=>repo.get(null,entry.id),'AUTH_REQUIRED',401);await code(()=>repo.create(a,key('owner'),draft({user_id:b})),'VALIDATION_ERROR',422);
  assert.equal((await repo.list(b,{lifecycle:'all'})).total,0);assert.deepEqual(await snapshot(entry.id),before);return {foreign_rejections:6,missing_principal:401,owner_dto:422,http_auth:'NOT TESTED'};
});
await check('LEDGER-APPEND-PRIVILEGES','RULE-23; FR-07','Application SQL account','Direct UPDATE/DELETE stock_movements;CREATE TABLE;DELETE entry','Privileges prevent rewriting history/DDL/hard-delete',async()=>{
  const owner=await user(),entry=await create(owner);
  await db(async c=>{for(const sql of ['UPDATE stock_movements SET reason=NULL WHERE entry_id=?','DELETE FROM stock_movements WHERE entry_id=?','DELETE FROM food_entries WHERE id=?'])await code(()=>c.execute(sql,[entry.id]),'ER_TABLEACCESS_DENIED_ERROR');await code(()=>c.query('CREATE TABLE forbidden(id INT)'),'ER_TABLEACCESS_DENIED_ERROR');});return {denied_operations:4,history:'append-only application grant'};
});
await check('LOCAL-MIDNIGHT','SC-14; VT-13; RULE-12/13','OwnerHoChiMinh;UTC16:59:59→17:00:00;expiry10Oct','Injected clock;SQL classification plus JS projection','Local9Oct soon→local10Oct due_today;single frozen instant per response',async()=>{
  const owner=await user();await create(owner,{expiry_date:'2026-10-10',date_certainty:'known',date_source:'printed_label'});
  const a=await repository({clock:()=>new Date('2026-10-09T16:59:59Z')}).list(owner);
  const b=await repository({clock:()=>new Date('2026-10-09T17:00:00Z')}).list(owner);
  assert.equal(a.as_of_date,'2026-10-09');assert.equal(a.items[0].attention.status,'soon');assert.equal(b.as_of_date,'2026-10-10');assert.equal(b.items[0].attention.status,'due_today');
  let calls=0;const advancing=await repository({clock:()=>new Date(calls++===0?'2026-10-09T16:59:59Z':'2026-10-09T17:00:00Z')}).list(owner);assert.equal(calls,1);assert.equal(advancing.items[0].attention.as_of_date,advancing.as_of_date);
  const west=await user('America/Los_Angeles');await create(west,{expiry_date:'2026-10-09',date_certainty:'known',date_source:'user_entered'});const w=await repository({clock:()=>new Date('2026-10-10T01:00:00Z')}).list(west);assert.equal(w.as_of_date,'2026-10-09');assert.equal(w.items[0].attention.status,'due_today');return {east:[a.as_of_date,a.items[0].attention.status,b.as_of_date,b.items[0].attention.status],west:[w.as_of_date,w.items[0].attention.status],clock_calls:calls};
});
await check('PREFERENCES-BOUNDARY','SC-14; VT-13; FR-09; RULE-13','Owned entry and preferences','lead0/30;invalid timezone;31;-1;fractional;food snapshot','Valid changes versioned;invalid rejected;food rows unchanged',async()=>{
  const owner=await user(),entry=await create(owner),before=await snapshot(entry.id),repo=repository();
  await repo.setPreferences(owner,key('lead0'),{attention_lead_days:0,expected_version:1});await repo.setPreferences(owner,key('lead30'),{attention_lead_days:30,expected_version:2});
  for(const value of [-1,31,1.5])await code(()=>repo.setPreferences(owner,key('badpref'),{attention_lead_days:value,expected_version:3}),'VALIDATION_ERROR',422);
  await code(()=>repo.setPreferences(owner,key('badzone'),{timezone:'MadeUp/Zone',expected_version:3}),'VALIDATION_ERROR',422);assert.deepEqual(await snapshot(entry.id),before);return {valid_leads:[0,30],invalid_rejections:4,food_unchanged:true};
});
await check('QUERY-PRIORITY','SC-03/04/15; FR-02/03; RULE-12/20','Groups later/unknown/soon/today/past;two owners','list attention then page limit2;filter;trash/depleted;escaped q','Priority before pages;stable IDs;owner-scoped;derived policy parity',async()=>{
  const owner=await user(),other=await user(),repo=repository({clock:()=>new Date('2026-10-10T05:00:00Z')});
  for(const value of ['2026-11-01',null,'2026-10-12','2026-10-10','2026-10-09','2026-10-09'])await create(owner,value?{expiry_date:value,date_certainty:'known',date_source:'printed_label'}:{});
  await create(other);const all=await repo.list(owner,{view:'attention',limit:100});assert.deepEqual(all.items.map(e=>e.attention.status),['past_date','past_date','due_today','soon','unknown','later']);assert.equal(all.total,6);
  const pages=await Promise.all([1,2,3].map(page=>repo.list(owner,{view:'attention',page,limit:2})));assert.deepEqual(pages.flatMap(p=>p.items.map(e=>e.id)),all.items.map(e=>e.id));
  for(const item of all.items)assert.equal(attention(item,{timezone:'Asia/Ho_Chi_Minh',attention_lead_days:2},'2026-10-10T05:00:00Z').status,item.attention.status);
  assert.equal((await repo.list(owner,{attention:'unknown'})).total,1);assert.equal((await repo.list(owner,{view:'trash'})).total,0);
  await code(()=>repo.list(owner,{view:'attention',lifecycle:'all'}),'VALIDATION_ERROR',422);
  await create(owner,{name:'100%_Rice',storage_location:'Fridge'});assert.equal((await repo.list(owner,{q:'%_'})).total,1);assert.equal((await repo.list(owner,{location:'Fridge'})).total,1);
  return {priority:all.items.map(e=>e.attention.status),pagination_ids:pages.flatMap(p=>p.items.map(e=>e.id)),unknown_visible:true};
});
await check('QUERY-EXPLAIN','FR-02; NFR-08 measured baseline only','400 representative owner entries plus other existing owners','ANALYZE TABLE;EXPLAIN FORMAT=JSON;real list latency','Valid scoped plan;classification/sort before limit;report filesort without SLA',async()=>{
  const owner=await user();
  await db(async c=>{await c.beginTransaction();for(let i=0;i<400;i++){const id=randomUUID(),date=i%5===0?null:`2026-10-${String(1+i%28).padStart(2,'0')}`;await c.execute('INSERT INTO food_entries(id,user_id,name,remaining_quantity,unit,expiry_date,date_certainty,date_source) VALUES (?,?,?,?,?,?,?,?)',[id,owner,'Representative '+i,'500.000','g',date,date?'known':'unknown',date?'user_entered':'unknown']);await c.execute("INSERT INTO stock_movements(id,entry_id,kind,quantity_before,quantity_after) VALUES (?,?,'initial',0,500)",[randomUUID(),id]);}await c.commit();});
  await rootSql('ANALYZE TABLE food_entries;',database);
  const repo=repository({clock:()=>new Date('2026-10-10T05:00:00Z')}),plan=await repo.list(owner,{view:'attention'},true);const start=performance.now(),list=await repo.list(owner,{view:'attention'}),elapsed=performance.now()-start;assert.equal(list.total,400);assert.equal(list.items.length,20);const parsed=JSON.parse(plan.plan[0].EXPLAIN);assert(parsed.query_block);
  report.query_plan={...plan,measured_ms:+elapsed.toFixed(2),representative_owner_rows:400,benchmark:'Single local warm query; not production SLA/throughput'};return report.query_plan;
});
await check('LEDGER-SUM','RULE-04/19; VT-03/09/10','All committed test fixtures','GROUP BY entry;sum(after-before);pending reservations','Every entry has initial and ledger sum=current;no incomplete request commits',async()=>{
  return db(async c=>{const [bad]=await c.query("SELECT e.id,e.remaining_quantity,COUNT(m.id) events,SUM(m.kind='initial') initials,SUM(m.quantity_after-m.quantity_before) total FROM food_entries e LEFT JOIN stock_movements m ON m.entry_id=e.id GROUP BY e.id,e.remaining_quantity HAVING events=0 OR initials<>1 OR total<>e.remaining_quantity");assert.equal(bad.length,0);const [[row]]=await c.query('SELECT COUNT(*) requests,SUM(response_status IS NULL) incomplete FROM api_requests');assert.equal(Number(row.incomplete),0);const [[{n}]]=await c.query('SELECT COUNT(*) n FROM food_entries');return {entries:Number(n),requests:Number(row.requests),incomplete:0,ledger_violations:0};});
});
await check('API-FE-PARITY-AUDIT','NFR-03; VT-01/14; FR-01/04/08','Actual draft OpenAPI/fixtures and observed mock source','Parse JSON;inspect enums/decimal/UUID/restore/date/table names','Known discrepancies recorded;no claim mock/HTTP adapter integrated',async()=>{
  const api=JSON.parse(await readFile(new URL('../../contracts/openapi.json',base),'utf8')),fixtures=JSON.parse(await readFile(new URL('../../contracts/fixtures.json',base),'utf8')),mock=await readFile(new URL('../../uidemo/src/mockApi.ts',base),'utf8');
  assert.equal(api.openapi,'3.1.1');assert.equal(fixtures.create_known.date_certainty,'known');assert.match(mock,/"exact"/);assert.match(mock,/quantity_movements/);assert.match(mock,/DEMO_DATE = "2026-10-08"/);
  const restore=api.paths['/api/v1/food-entries/{id}/restore']?.post??api.paths['/food-entries/{id}/restore']?.post;
  assert(restore,'Restore contract path missing');assert.equal(restore.requestBody.content['application/json'].schema.$ref,'#/components/schemas/VersionCommand');assert(api.components.schemas.VersionCommand.required.includes('expected_version'));
  assert.match(mock,/restoreEntry\(key: string, id: string\)/);assert.match(mock,/response_status: 200/);assert.match(mock,/new ApiError\(422, "IDEMPOTENCY_PAYLOAD_MISMATCH"\)/);
  report.parity={contract_version:api.openapi,mismatches:['known versus exact; date_* versus expiry_date_*','stock_movements/adjustment versus quantity_movements/recount','UUID/decimal-string versus ent_/numbers','SQL composite owner/key versus mock synthetic id','OpenAPI restore VersionCommand requires expected_version; mock restoreEntry(key,id) omits it','mock saved response_status always200; DB create/movement201, delete204, recount no-op200','mock key reuse422 IDEMPOTENCY_PAYLOAD_MISMATCH; contract/repository409 IDEMPOTENCY_KEY_REUSED','mock JSON.stringify payload fingerprint versus canonical normalized SHA256','fixed DEMO_DATE versus injected owner-local day'],required_adapter:'Explicit DTO/enum/decimal/UUID/date and error mapping; history pagination; no UI changes in this task'};return report.parity;
});
await check('BACKUP-RESTORE','VT-16 sandbox scope; NFR-07','Fresh test DB with fixtures;new distinct restore DB','mysqldump single transaction then rootSQL import;counts/ledger/FKs','Full fixture/schema restore matches;original dev preserved',async()=>{
  const restored=database+'_restore';
  const dump=await run('docker',['exec',await containerId(),'sh','-c','MYSQL_PWD="$MYSQL_ROOT_PASSWORD" exec mysqldump --user=root --single-transaction --skip-comments --set-gtid-purged=OFF "$1"','sh',database]);
  await rootSql(`CREATE DATABASE \`${restored}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;`);await rootSql(dump,restored);await grants(restored);
  const c=await connect(restored);
  try {for(const table of ['users','food_entries','stock_movements','api_requests','schema_migrations']){const [[original]]=await db(o=>o.query(`SELECT COUNT(*) n FROM ${table}`));const [[copy]]=await c.query(`SELECT COUNT(*) n FROM ${table}`);assert.equal(copy.n,original.n);}const [bad]=await c.query('SELECT e.id FROM food_entries e LEFT JOIN stock_movements m ON m.entry_id=e.id GROUP BY e.id,e.remaining_quantity HAVING SUM(m.quantity_after-m.quantity_before)<>e.remaining_quantity OR COUNT(m.id)=0');assert.equal(bad.length,0);const [[{n}]]=await c.query('SELECT COUNT(*) n FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=?',[restored]);assert.equal(Number(n),3);}finally{await c.end();}
  report.restore_database=restored;return {restored_database:restored,dump_bytes:Buffer.byteLength(dump),table_counts_equal:true,ledger_equal:true,fk_count:3,staging_production:'NOT TESTED'};
});
for(const [test_id,requirements,reason] of [
  ['HTTP-AUTH-INTEGRATION','SC-13; VT-12; FR-10; NFR-01','No HTTP API/auth provider exists in repository; trusted-principal sandbox tests do not verify identity establishment.'],
  ['UI-RECOVERY-INTEGRATION','SC-08/09/15; VT-15; NFR-04','New repository is not wired into uidemo; draft/401/timeout/refetch behavior requires FE/API integration.'],
  ['UX-ACCESSIBILITY','VT-17; NFR-05','No UI change or keyboard/screen-reader/device acceptance performed in this DB task.'],
  ['BUSINESS-MODEL-APPROVAL','BR-V1-01/02/03; DEC-03…09','Stakeholder/user research approval is separate from database constraints and SQL tests.'],
  ['PRODUCTION-PERFORMANCE','NFR-08','Representative local EXPLAIN is recorded; no hosting/volume/SLA approved or benchmarked.']
]) report.results.push({test_id,requirements,setup:'External integration or stakeholder boundary',command:null,expected:'Independent acceptance evidence',actual:reason,status:'NOT TESTED'});

report.completed_at=new Date().toISOString();
report.summary=Object.fromEntries(['PASS','FAIL','BLOCKED','NOT TESTED'].map(status=>[status,report.results.filter(t=>t.status===status).length]));
await writeFile(new URL(`${database}.json`,evidence),JSON.stringify(report,null,2)+'\n');
await writeFile(new URL('latest-tests.json',evidence),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({database,summary:report.summary,restore_database:report.restore_database}));
if(report.summary.FAIL)process.exitCode=1;else console.log('EXPIRY_DB_TESTS_VERIFIED');
