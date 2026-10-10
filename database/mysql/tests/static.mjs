import assert from 'node:assert/strict';
import {readFile,readdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../../',import.meta.url));
const read=path=>readFile(root+path,'utf8');
const required=['docs/erd/01_MODEL_AUDIT.md','docs/erd/02_LOGICAL_ERD.mmd','docs/erd/03_ENTITY_DICTIONARY.md','docs/erd/04_RELATIONSHIP_MATRIX.md','docs/erd/05_DESIGN_DECISIONS.md','docs/erd/06_MYSQL_IMPLEMENTATION_NOTES.md','docs/erd/07_DB_VERIFICATION_REPORT.md','docs/erd/expiry_mysql_live_schema.sql','database/mysql/compose.yaml','database/mysql/.env.example','database/mysql/README.md','database/mysql/migrations/001_initial_schema.sql','database/mysql/seed.sql','database/mysql/tests/run.mjs'];
for(const path of required)assert((await stat(root+path)).size>0,path);
const logical=await read('docs/erd/02_LOGICAL_ERD.mmd');assert.match(logical,/^erDiagram/m);assert.equal((logical.match(/\|\|--/g)||[]).length,3);
for(const table of ['USERS','FOOD_ENTRIES','STOCK_MOVEMENTS','API_REQUESTS'])assert(logical.includes(table+' {'));
const migration=await read('database/mysql/migrations/001_initial_schema.sql');assert(!/\b(timestamptz|jsonb|uuid PRIMARY|ON CONFLICT)\b/i.test(migration));assert(!/CREATE\s+(?:UNIQUE\s+)?INDEX[^;]+WHERE/is.test(migration));assert.equal((migration.match(/^CREATE TABLE/gm)||[]).length,4);assert.match(migration,/GENERATED ALWAYS AS/);assert.match(migration,/ON DELETE RESTRICT/);
const compose=await read('database/mysql/compose.yaml');assert.match(compose,/image: mysql:8\.4/);assert.match(compose,/127\.0\.0\.1:/);assert(!compose.includes('0.0.0.0'));assert(compose.includes('SELECT 1'));assert(!/3307:3306/.test(compose.replace('127.0.0.1:${MYSQL_HOST_PORT:-3307}:3306','')));
const envExample=await read('database/mysql/.env.example');for(const line of envExample.split('\n'))if(/^MYSQL_(ROOT_)?PASSWORD=/.test(line))assert.equal(line.split('=')[1],'');
const env=await read('database/mysql/.env');const secrets=env.split('\n').filter(l=>/^MYSQL_(ROOT_)?PASSWORD=/.test(l)).map(l=>l.split('=')[1]);assert.equal(secrets.length,2);assert.equal((await stat(root+'database/mysql/.env')).mode&0o777,0o600);
assert(execFileSync('git',['check-ignore','database/mysql/.env'],{cwd:root,encoding:'utf8'}).trim());
async function authored(path){for(const item of await readdir(root+path,{withFileTypes:true})){if(['node_modules','.tools','runtime-private'].includes(item.name)||item.name==='.env')continue;const child=path+item.name;if(item.isDirectory())await authored(child+'/');else{const content=await readFile(root+child);for(const secret of secrets)assert(!content.includes(Buffer.from(secret)),'Credential leaked into authored artifact: '+child);}}}
await authored('database/mysql/');await authored('docs/erd/');
const tests=JSON.parse(await read('database/mysql/evidence/latest-tests.json'));assert.equal(tests.summary.FAIL,0);assert.equal(tests.summary.PASS,tests.results.filter(t=>t.status==='PASS').length);assert(tests.summary.PASS>=30);for(const test of tests.results)assert(test.test_id&&test.requirements&&test.setup&&test.expected&&test.actual!==undefined);
const dev=JSON.parse(await read('database/mysql/evidence/dev-verification.json'));assert.equal(dev.migration.hash,createHash('sha256').update(migration).digest('hex'));
const wb=JSON.parse(await read('docs/erd/workbench_native_evidence.json'));assert.equal(wb.status,'PASS');assert.equal(wb.model_tables.length,dev.tableNames.length);assert.equal(wb.model_foreign_keys,3);assert.equal(wb.native_parser_error_count,0);assert.equal(wb.generated_column.storage,'STORED');assert.equal(wb.live_columns.length,tests.schema.columns.length);
for(const [path,expected] of [['docs/erd/expiry_mysql.mwb',wb.model_file.sha256],['docs/erd/expiry_mysql_eer.png',wb.image_file.sha256]])assert.equal(createHash('sha256').update(await readFile(root+path)).digest('hex'),expected);
const nativeXml=execFileSync('unzip',['-p',root+'docs/erd/expiry_mysql.mwb','document.mwb.xml']);
for(const secret of secrets)assert(!nativeXml.includes(Buffer.from(secret)),'Credential leaked into native model XML');
const report=await read('docs/erd/07_DB_VERIFICATION_REPORT.md');assert(report.includes(`PASS: ${tests.summary.PASS}`));assert(report.includes('FAIL: 0'));assert(report.includes(`NOT TESTED: ${tests.summary['NOT TESTED']}`));assert(report.includes('Test Connection'));assert(report.includes('filesort'));
// Negative controls: absence detector must reject its known positive samples.
assert(/\bjsonb\b/i.test('response_body jsonb'));assert(/CREATE\s+(?:UNIQUE\s+)?INDEX[^;]+WHERE/is.test("CREATE INDEX x ON t(id) WHERE active;"));assert(Buffer.from('before'+secrets[0]+'after').includes(Buffer.from(secrets[0])));
console.log('EXPIRY_STATIC_VERIFIED');
