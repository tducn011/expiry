"""Execute with Workbench --run-script; genuine native GRT, no simulated clicks."""
import hashlib
import json
import struct
import shutil
import zipfile
from datetime import datetime, timezone
from pathlib import Path
import grt
from workbench.db_utils import MySQLConnection

ROOT = Path('/home/pro/Downloads/expiry')
OUT = ROOT / 'docs/erd'
MODEL = OUT / 'expiry_mysql.mwb'
PNG = OUT / 'expiry_mysql_eer.png'
EVIDENCE = OUT / 'workbench_native_evidence.json'
evidence = {'status': 'RUNNING', 'method': 'MySQL Workbench embedded Python/GRT',
            'gui_test_connection_clicked': False, 'reverse_engineer_wizard_used': False,
            'started_at_utc': datetime.now(timezone.utc).isoformat()}
stage = 'configuration'
native = None
connection = None
reverse_connected = False
config = {}

def rows(sql, fields):
    result = native.executeQuery(sql)
    output = []
    has_row = result.firstRow()
    while has_row:
        output.append({field: result.stringByName(field) for field in fields})
        has_row = result.nextRow()
    return output

def file_evidence(path):
    return {'path': str(path), 'bytes': path.stat().st_size,
            'sha256': hashlib.sha256(path.read_bytes()).hexdigest()}

try:
    config = dict(line.split('=', 1) for line in (ROOT / 'database/mysql/.env').read_text().splitlines()
                  if line and not line.startswith('#'))
    if config['MYSQL_DATABASE'] != 'expiry_dev' or config['MYSQL_USER'] != 'expiry_app':
        raise ValueError('Unexpected sandbox configuration')
    port = int(config['MYSQL_HOST_PORT'])
    OUT.mkdir(parents=True, exist_ok=True)
    if MODEL.exists() or PNG.exists():
        previous = json.loads(EVIDENCE.read_text())
        if previous.get('status') != 'PASS':
            raise FileExistsError('Existing outputs are not from a verified export')
        for target, key in [(MODEL, 'model_file'), (PNG, 'image_file')]:
            if not target.exists() or hashlib.sha256(target.read_bytes()).hexdigest() != previous[key]['sha256']:
                raise FileExistsError('Existing output has changed; preserve user edits')
        backup = ROOT / 'database/mysql/evidence/runtime-private/previous-workbench-export'
        backup.mkdir(parents=True, exist_ok=True)
        for target in [MODEL, PNG, EVIDENCE]:
            shutil.copy2(str(target), str(backup / target.name))
    stage = 'connection'
    management = grt.root.wb.rdbmsMgmt
    driver = next(d for r in management.rdbms for d in r.drivers if d.name == 'MysqlNative')
    connection = grt.classes.db_mgmt_Connection()
    connection.owner = management
    connection.name = 'Expiry Local Docker'
    connection.driver = driver
    for key, value in {'hostName': '127.0.0.1', 'port': port, 'userName': 'expiry_app',
                       'schema': 'expiry_dev', 'useSSL': 1}.items():
        connection.parameterValues[key] = value
    connection.hostIdentifier = 'Mysql@127.0.0.1:%d' % port
    native = MySQLConnection(connection, password=config['MYSQL_PASSWORD'])
    native.connect()
    native.execute('USE `expiry_dev`')
    native.execute("SET time_zone='+00:00'")
    evidence['server'] = rows('SELECT DATABASE() db, VERSION() version, CURRENT_USER() account',
                              ['db', 'version', 'account'])[0]
    if evidence['server']['db'] != 'expiry_dev':
        raise RuntimeError('Wrong live schema')
    evidence['live_tables'] = rows("SELECT TABLE_NAME table_name FROM information_schema.TABLES WHERE TABLE_SCHEMA='expiry_dev' ORDER BY TABLE_NAME", ['table_name'])
    evidence['live_foreign_keys'] = rows("SELECT CONSTRAINT_NAME fk FROM information_schema.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_SCHEMA='expiry_dev' ORDER BY CONSTRAINT_NAME", ['fk'])
    stage = 'reverse_engineering'
    grt.modules.DbMySQLRE.connect(connection, config['MYSQL_PASSWORD'])
    reverse_connected = True
    catalog = grt.modules.DbMySQLRE.reverseEngineer(connection, 'def', ['expiry_dev'],
        {'reverseEngineerTables': True, 'reverseEngineerViews': True,
         'reverseEngineerTriggers': True, 'reverseEngineerRoutines': True})
    schema = next(s for s in catalog.schemata if s.name == 'expiry_dev')
    evidence['model_tables'] = sorted(t.name for t in schema.tables)
    evidence['model_foreign_keys'] = sum(len(t.foreignKeys) for t in schema.tables)
    if evidence['model_tables'] != sorted(t['table_name'] for t in evidence['live_tables']):
        # Installed DbMySQLRE8.0.36 does not register catalog character sets and
        # ignores parser errors. Use Workbench's own checked native parser with
        # the complete charset registry on untouched live SHOW CREATE statements.
        evidence['original_helper_tables'] = evidence['model_tables']
        evidence['parser_recovery'] = 'Native parser, full driver charset registry, unchanged live SHOW CREATE TABLE'
        catalog = grt.classes.db_mysql_Catalog()
        catalog.name = 'def'
        catalog.simpleDatatypes.extend(driver.owner.simpleDatatypes)
        catalog.characterSets.extend(driver.owner.characterSets)
        version = grt.classes.GrtVersion()
        major, minor, release = evidence['server']['version'].split('.')[:3]
        version.majorNumber = int(major)
        version.minorNumber = int(minor)
        version.releaseNumber = int(release)
        mode = rows('SELECT @@sql_mode sql_mode', ['sql_mode'])[0]['sql_mode']
        parser = grt.modules.MySQLParserServices.createNewParserContext(catalog.characterSets, version, mode, 1)
        definitions = []
        for table in evidence['live_tables']:
            result = native.executeQuery('SHOW CREATE TABLE `expiry_dev`.`%s`' % table['table_name'])
            if not result.firstRow():
                raise RuntimeError('Missing live SHOW CREATE result')
            definitions.append(result.stringByIndex(2) + ';')
        errors = grt.List(grt.STRING)
        options = {'errors': errors}
        error_count = grt.modules.MySQLParserServices.parseSQLIntoCatalogSql(
            parser, catalog, 'USE `expiry_dev`;\n' + '\n'.join(definitions), options)
        evidence['native_parser_errors'] = list(errors)
        evidence['native_parser_error_count'] = error_count
        evidence['charset_registry_count'] = len(catalog.characterSets)
        if error_count or errors:
            raise RuntimeError('Checked native live-DDL parser failed')
        schema = next(s for s in catalog.schemata if s.name == 'expiry_dev')
        evidence['model_tables'] = sorted(t.name for t in schema.tables)
        evidence['model_foreign_keys'] = sum(len(t.foreignKeys) for t in schema.tables)
        if evidence['model_tables'] != sorted(t['table_name'] for t in evidence['live_tables']):
            raise RuntimeError('Checked native model table set differs from live SQL')
    if evidence['model_foreign_keys'] != len(evidence['live_foreign_keys']):
        raise RuntimeError('Model FK count differs from live SQL')
    if any(t.isStub for t in schema.tables):
        raise RuntimeError('Unresolved native table stub')
    evidence['live_columns'] = rows("SELECT TABLE_NAME table_name,COLUMN_NAME column_name FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='expiry_dev' ORDER BY TABLE_NAME,ORDINAL_POSITION", ['table_name', 'column_name'])
    evidence['model_columns'] = [{'table_name': t.name, 'column_name': c.name} for t in schema.tables for c in t.columns]
    if sorted((c['table_name'], c['column_name']) for c in evidence['live_columns']) != sorted((c['table_name'], c['column_name']) for c in evidence['model_columns']):
        raise RuntimeError('Native model column set differs from live SQL')
    evidence['live_fk_mapping'] = rows("SELECT TABLE_NAME table_name,CONSTRAINT_NAME fk,COLUMN_NAME column_name,REFERENCED_TABLE_NAME parent,REFERENCED_COLUMN_NAME parent_column FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA='expiry_dev' AND REFERENCED_TABLE_NAME IS NOT NULL ORDER BY TABLE_NAME,CONSTRAINT_NAME,ORDINAL_POSITION", ['table_name','fk','column_name','parent','parent_column'])
    evidence['model_fk_mapping'] = [{'table_name': t.name, 'fk': f.name, 'column_name': c.name, 'parent': f.referencedTable.name, 'parent_column': p.name} for t in schema.tables for f in t.foreignKeys for c, p in zip(f.columns, f.referencedColumns)]
    if sorted(tuple(sorted(f.items())) for f in evidence['live_fk_mapping']) != sorted(tuple(sorted(f.items())) for f in evidence['model_fk_mapping']):
        raise RuntimeError('Native FK mapping differs from live SQL')
    movement_table = next(t for t in schema.tables if t.name == 'stock_movements')
    generated = next(c for c in movement_table.columns if c.name == 'initial_entry_id')
    if generated.generated != 1 or generated.generatedStorage != 'STORED':
        raise RuntimeError('Generated uniqueness column lost')
    evidence['generated_column'] = {'generated': int(generated.generated), 'expression': generated.expression, 'storage': generated.generatedStorage}
    evidence['descending_indexes'] = [{'table': t.name, 'index': i.name, 'column': c.referencedColumn.name} for t in schema.tables for i in t.indices for c in i.columns if c.descend]
    evidence['check_constraint_modeling'] = 'NOT REPRESENTED by installed Workbench table model; live SQL and DB tests are authority'
    stage = 'diagram'
    grt.modules.Workbench.newDocument()
    model = grt.root.wb.doc.physicalModels[0]
    catalog.owner = model
    model.catalog = catalog
    model.currentConnection = connection
    grt.modules.WbModel.createDiagramWithCatalog(model, catalog)
    diagram = model.diagrams[-1]
    diagram.name = 'Expiry live MySQL schema'
    grt.modules.WbModel.autolayout(diagram)
    # Source-owned native layout: three actual FK chains avoid unrelated tables.
    positions = {'users': (20, 20), 'food_entries': (340, 20),
                 'stock_movements': (690, 20), 'api_requests': (20, 360),
                 'schema_migrations': (340, 580)}
    for figure in diagram.figures:
        figure.left, figure.top = positions[figure.table.name]
    grt.modules.Workbench.activateDiagram(diagram)
    evidence['diagram_figures'] = len(diagram.figures)
    evidence['diagram_connections'] = len(diagram.connections)
    stage = 'native_serialization'
    grt.modules.Workbench.saveModelAs(str(MODEL))
    with zipfile.ZipFile(str(MODEL)) as archive:
        if archive.testzip() is not None or 'document.mwb.xml' not in archive.namelist():
            raise RuntimeError('Native model archive failed integrity check')
    stage = 'native_png_export'
    grt.modules.Workbench.exportDiagramToPng(diagram, str(PNG))
    header = PNG.read_bytes()[:24]
    if header[:8] != b'\x89PNG\r\n\x1a\n':
        raise RuntimeError('PNG signature failed')
    width, height = struct.unpack('>II', header[16:24])
    if not width or not height:
        raise RuntimeError('Empty diagram')
    evidence['model_file'] = file_evidence(MODEL)
    evidence['image_file'] = dict(file_evidence(PNG), width=width, height=height)
    evidence['status'] = 'PASS'
except Exception as error:
    message = str(error)
    for key in ['MYSQL_PASSWORD', 'MYSQL_ROOT_PASSWORD']:
        if config.get(key):
            message = message.replace(config[key], '[REDACTED]')
    evidence.update(status='FAIL', failed_stage=stage, error_type=type(error).__name__, message=message)
finally:
    if native:
        try:
            native.disconnect()
        except Exception:
            pass
    if reverse_connected:
        try:
            grt.modules.DbMySQLRE.disconnect(connection)
        except Exception:
            pass
    evidence['completed_at_utc'] = datetime.now(timezone.utc).isoformat()
    EVIDENCE.write_text(json.dumps(evidence, ensure_ascii=False, indent=2)+'\n')
    print(json.dumps(evidence, ensure_ascii=False))
