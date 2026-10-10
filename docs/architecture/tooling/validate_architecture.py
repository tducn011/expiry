#!/usr/bin/env python3
"""Validate the architecture documentation graph without claiming app correctness."""
from pathlib import Path
from collections import Counter
from urllib.parse import unquote
import json,re,sys

def validate(root):
 root=Path(root).resolve();registry=json.loads((root/'traceability/registry.json').read_text());errors=[];counts={}
 docs=registry['documents'];nodes=registry['nodes'];edges=registry['edges']
 all_ids=[x['id'] for x in docs+nodes]
 duplicates=[id for id,n in Counter(all_ids).items() if n>1]
 if duplicates: errors.append('Duplicate IDs: '+', '.join(duplicates))
 byid={n['id']:n for n in nodes}
 required=['Purpose','Evidence sources','Definitions and assumptions','Analysis','Decisions and rationale','Dependencies','Open questions','Related documents','Verification criteria']
 for d in docs:
  p=root/d['path']
  if not p.is_file(): errors.append('Missing document: '+d['path']);continue
  text=p.read_text()
  if f'Document ID: `{d["id"]}`' not in text: errors.append('Document ID not defined: '+d['path'])
  for h in required:
   if '\n## '+h+'\n' not in text: errors.append('Missing section '+h+': '+d['path'])
  if d['status'] not in {'Draft','Review','Approved','Blocked'} or f'Status: **{d["status"]}**' not in text: errors.append('Invalid status: '+d['path'])
  # Ignore fenced code when checking links, but preserve actual prose/image links.
  plain=re.sub(r'^(`{3,})[^\n]*\n.*?^\1\s*$', '',text,flags=re.M|re.S)
  for target in re.findall(r'!?\[[^\]\n]*\]\(([^)\n]+)\)',plain):
   target=target.strip().strip('<>')
   if re.match(r'^[a-zA-Z][a-zA-Z0-9+.-]*:',target): continue
   local=unquote(target.split('#',1)[0])
   if not local: continue
   if Path(local).is_absolute(): errors.append('Absolute local hyperlink: '+d['path']+' -> '+target)
   if not (p.parent/local).exists(): errors.append('Broken link: '+d['path']+' -> '+target)
 for n in nodes:
  if not (root/n['path']).is_file(): errors.append('Node definition path missing: '+n['id'])
  if n['kind'] in {'functional-requirement','nonfunctional-requirement'}:
   if not n.get('tests'): errors.append('Unmapped requirement: '+n['id'])
  if n['kind']=='feature':
   if not n.get('requirements') or not n.get('needs'): errors.append('Unjustified feature: '+n['id'])
  if n['kind']=='user-flow' and not n.get('use_cases'): errors.append('Flow lacks use case: '+n['id'])
  if n['kind']=='persistent-field' and (not n.get('owner') or n.get('entity') not in byid): errors.append('Field ownership missing: '+n['id'])
  if n['kind']=='entity' and (not n.get('purpose') or not n.get('owner')): errors.append('Entity purpose/owner missing: '+n['id'])
  if n['kind']=='api' and not n.get('tests'): errors.append('Endpoint lacks tests: '+n['id'])
  for attr in ['tests','requirements','needs','use_cases','apis','flows']:
   for ref in n.get(attr,[]):
    if ref not in byid: errors.append('Invalid '+attr+' reference: '+n['id']+' -> '+ref)
 for e in edges:
  if e['from'] not in byid or e['to'] not in byid: errors.append('Dangling graph edge: '+str(e))
 # Machine OpenAPI operation IDs must agree with canonical API artifact IDs.
 contract=json.loads((root/registry['openapi']).read_text());operation_ids=[]
 for path,methods in contract['paths'].items():
  for method,op in methods.items():
   if method not in {'get','post','patch','put','delete','head','options'}: continue
   operation_ids.append(op.get('operationId'))
 if set(operation_ids)!={n['id'] for n in nodes if n['kind']=='api'}: errors.append('OpenAPI / API registry names disagree')
 if len(operation_ids)!=len(set(operation_ids)): errors.append('Duplicate OpenAPI operation IDs')
 def refs(value):
  if isinstance(value,dict):
   for k,v in value.items():
    if k=='$ref' and isinstance(v,str) and v.startswith('#/'):
     current=contract
     try:
      for part in v[2:].split('/'): current=current[part.replace('~1','/').replace('~0','~')]
     except (KeyError,TypeError): errors.append('OpenAPI unresolved ref: '+v)
    refs(v)
  elif isinstance(value,list):
   for v in value: refs(v)
 refs(contract)
 # Every owned source directory in the docs workspace has an index.
 for directory in [root]+[p for p in root.rglob('*') if p.is_dir()]:
  if directory.name=='__pycache__': continue
  if not (directory/'README.md').is_file(): errors.append('Directory lacks README: '+str(directory.relative_to(root)))
 counts={'documents':len(docs),'artifacts':len(nodes),'edges':len(edges),'apis':len(operation_ids),'requirements':sum(n['kind'] in {'functional-requirement','nonfunctional-requirement'} for n in nodes),'persistent_fields':sum(n['kind']=='persistent-field' for n in nodes),'tests_planned':sum(n['kind']=='test' for n in nodes)}
 return errors,counts
if __name__=='__main__':
 root=Path(sys.argv[1]) if len(sys.argv)>1 else Path(__file__).resolve().parents[1]
 errors,counts=validate(root)
 print(json.dumps({'structural_validation':'FAIL' if errors else 'PASS','counts':counts,'errors':errors,'limits':'Not app/runtime/diagram rendering/usability validation; linked tests are planned, not executed.'},ensure_ascii=False,indent=2))
 sys.exit(bool(errors))
