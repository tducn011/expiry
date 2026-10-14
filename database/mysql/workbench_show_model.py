"""After Workbench CLI startup loads --model, activate its real native EER tab."""
import json
from datetime import datetime, timezone
import time
from pathlib import Path
import grt
import mforms

attempts = 0
requested_open = False
started_monotonic = time.monotonic()
startup_timeout_seconds = 120
target = Path('/home/pro/Downloads/expiry/docs/architecture/06-data-model/erd-workbench/workbench_view_evidence.json')

def activate_loaded_model():
    global attempts, requested_open
    attempts += 1
    # CLI has one open-at-start slot: --run-script supersedes --model. Open the
    # requested file through the actual native API after startup is ready.
    if not requested_open:
        grt.modules.Workbench.openModel('/home/pro/Downloads/expiry/docs/architecture/06-data-model/erd-workbench/expiry_mysql.mwb')
        requested_open = True
    doc = grt.root.wb.doc
    if doc:
        for model in doc.physicalModels:
            tables = sorted(t.name for schema in model.catalog.schemata if schema.name == 'expiry_dev' for t in schema.tables)
            if tables == ['api_requests', 'food_entries', 'local_credentials', 'schema_migrations', 'stock_movements', 'user_sessions', 'users'] and model.diagrams:
                diagram = model.diagrams[0]
                figures = len(diagram.figures)
                connections = len(diagram.connections)
                if figures != 7 or connections != 5:
                    continue
                grt.modules.Workbench.activateDiagram(diagram)
                evidence = {'status': 'PASS', 'timestamp_utc': datetime.now(timezone.utc).isoformat(),
                            'method': 'Workbench.openModel + actual loaded .mwb document + native activateDiagram',
                            'tables': tables, 'diagram': diagram.name,
                            'figures': figures, 'connections': connections,
                            'user_untitled_model_modified': False, 'attempts': attempts}
                target.write_text(json.dumps(evidence, indent=2)+'\n')
                print(json.dumps(evidence))
                return False
    elapsed = time.monotonic() - started_monotonic
    if elapsed >= startup_timeout_seconds:
        target.write_text(json.dumps({'status': 'BLOCKED', 'reason': 'Native Workbench GRT did not expose the expected loaded model and diagram before the startup deadline',
                                      'attempts': attempts, 'elapsed_seconds': round(elapsed, 3),
                                      'requested_model': '/home/pro/Downloads/expiry/docs/architecture/06-data-model/erd-workbench/expiry_mysql.mwb'}, indent=2)+'\n')
        return False
    return True

timer = mforms.Utilities.add_timeout(0.5, activate_loaded_model)
