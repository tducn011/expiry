"""Persist the authorized non-root connection and inspect the actual open model."""
import json
from datetime import datetime, timezone
from pathlib import Path
import grt
from workbench.db_utils import MySQLConnection

root = Path('/home/pro/Downloads/expiry')
config = dict(line.split('=', 1) for line in (root / 'database/mysql/.env').read_text().splitlines()
              if line and not line.startswith('#'))
management = grt.root.wb.rdbmsMgmt
matches = [c for c in management.storedConns if c.name == 'Expiry Local Docker']
if matches:
    connection = matches[0]
    if connection.parameterValues.get('hostName') != '127.0.0.1' or int(connection.parameterValues.get('port')) != int(config['MYSQL_HOST_PORT']) or connection.parameterValues.get('userName') != 'expiry_app':
        raise RuntimeError('Existing named connection differs; preserve it')
else:
    connection = grt.classes.db_mgmt_Connection()
    connection.owner = management
    connection.name = 'Expiry Local Docker'
    connection.driver = next(d for r in management.rdbms for d in r.drivers if d.name == 'MysqlNative')
    for key, value in {'hostName': '127.0.0.1', 'port': int(config['MYSQL_HOST_PORT']),
                       'userName': 'expiry_app', 'schema': 'expiry_dev', 'useSSL': 1}.items():
        connection.parameterValues[key] = value
    connection.hostIdentifier = 'Mysql@127.0.0.1:%s' % config['MYSQL_HOST_PORT']
    management.storedConns.append(connection)
    grt.modules.Workbench.saveConnections()
    grt.modules.Workbench.refreshHomeConnections()

native = MySQLConnection(connection, password=config['MYSQL_PASSWORD'])
native.connect()
try:
    native.execute('USE `expiry_dev`')
    result = native.executeQuery('SELECT DATABASE() db, VERSION() version')
    if not result.firstRow() or result.stringByName('db') != 'expiry_dev':
        raise RuntimeError('Wrong native SQL schema')
    evidence = {'status': 'PASS', 'timestamp_utc': datetime.now(timezone.utc).isoformat(),
                'connection_name': connection.name, 'connection_saved': True,
                'password_saved': False, 'db': result.stringByName('db'),
                'version': result.stringByName('version'), 'gui_button_clicked': False,
                'model_open_command': '--model docs/erd/expiry_mysql.mwb',
                'open_model_tables': [t.name for m in grt.root.wb.doc.physicalModels for s in m.catalog.schemata for t in s.tables] if grt.root.wb.doc else [],
                'model_load_at_script_time': 'loaded' if grt.root.wb.doc else 'pending startup model load'}
    (root / 'docs/erd/workbench_open_evidence.json').write_text(json.dumps(evidence, indent=2)+'\n')
    print(json.dumps(evidence))
finally:
    native.disconnect()
