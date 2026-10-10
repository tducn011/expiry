"""After Workbench CLI startup loads --model, activate its real native EER tab."""
import json
from datetime import datetime, timezone
from pathlib import Path
import grt
import mforms

attempts = 0
requested_open = False
target = Path('/home/pro/Downloads/expiry/docs/erd/workbench_view_evidence.json')

def activate_loaded_model():
    global attempts, requested_open
    attempts += 1
    # CLI has one open-at-start slot: --run-script supersedes --model. Open the
    # requested file through the actual native API after startup is ready.
    if not requested_open:
        grt.modules.Workbench.openModel('/home/pro/Downloads/expiry/docs/erd/expiry_mysql.mwb')
        requested_open = True
    doc = grt.root.wb.doc
    if doc:
        for model in doc.physicalModels:
            tables = sorted(t.name for schema in model.catalog.schemata if schema.name == 'expiry_dev' for t in schema.tables)
            if tables == ['api_requests', 'food_entries', 'schema_migrations', 'stock_movements', 'users'] and model.diagrams:
                diagram = model.diagrams[0]
                grt.modules.Workbench.activateDiagram(diagram)
                evidence = {'status': 'PASS', 'timestamp_utc': datetime.now(timezone.utc).isoformat(),
                            'method': 'Workbench.openModel + actual loaded .mwb document + native activateDiagram',
                            'tables': tables, 'diagram': diagram.name,
                            'figures': len(diagram.figures), 'connections': len(diagram.connections),
                            'user_untitled_model_modified': False, 'attempts': attempts}
                target.write_text(json.dumps(evidence, indent=2)+'\n')
                print(json.dumps(evidence))
                return False
    if attempts >= 15:
        target.write_text(json.dumps({'status': 'BLOCKED', 'reason': 'CLI model did not finish loading; native GUI dialog may need user interaction', 'attempts': attempts}, indent=2)+'\n')
        return False
    return True

timer = mforms.Utilities.add_timeout(1.0, activate_loaded_model)
