#!/usr/bin/env python3
"""Validate architecture documentation traceability without claiming app correctness."""
from collections import Counter
from pathlib import Path
from urllib.parse import unquote
import json
import re
import sys

METHODS = {'get', 'post', 'patch', 'put', 'delete', 'head', 'options'}
REQUIRED_SECTIONS = [
    'Purpose', 'Evidence sources', 'Definitions and assumptions', 'Analysis',
    'Decisions and rationale', 'Dependencies', 'Open questions',
    'Related documents', 'Verification criteria',
]
REF_LISTS = ['tests', 'requirements', 'needs', 'use_cases', 'apis', 'flows']


def strip_code(text):
    return re.sub(r'^(`{3,})[^\n]*\n.*?^\1\s*$', '', text, flags=re.M | re.S)


def local_links(path, text):
    for target in re.findall(r'!?\[[^\]\n]*\]\(([^)\n]+)\)', strip_code(text)):
        target = target.strip().strip('<>')
        if re.match(r'^[a-zA-Z][a-zA-Z0-9+.-]*:', target):
            continue
        local = unquote(target.split('#', 1)[0])
        if local:
            yield target, local


def resolve_ref(contract, ref):
    if not ref.startswith('#/'):
        return False
    current = contract
    try:
        for part in ref[2:].split('/'):
            current = current[part.replace('~1', '/').replace('~0', '~')]
    except (KeyError, TypeError):
        return False
    return True


def validate_graph(root, registry, contract):
    """Pure semantic checks; usable by negative-control tests with copied inputs."""
    errors = []
    docs, nodes, edges = registry.get('documents', []), registry.get('nodes', []), registry.get('edges', [])
    ids = [x.get('id') for x in docs + nodes]
    duplicates = sorted(str(item) for item, count in Counter(ids).items() if count > 1)
    if duplicates:
        errors.append('Duplicate IDs: ' + ', '.join(duplicates))
    byid = {n.get('id'): n for n in nodes}

    for d in docs:
        rel = d.get('path', '<missing path>')
        p = root / rel
        if not p.is_file():
            errors.append('Missing document: ' + rel)
            continue
        text = p.read_text(errors='replace')
        if f'Document ID: `{d.get("id")}`' not in text:
            errors.append('Document ID not defined: ' + rel)
        for heading in REQUIRED_SECTIONS:
            if '\n## ' + heading + '\n' not in text:
                errors.append('Missing section ' + heading + ': ' + rel)
        status = d.get('status')
        if status not in {'Draft', 'Review', 'Approved', 'Blocked'} or f'Status: **{status}**' not in text:
            errors.append('Invalid status: ' + rel)

    for n in nodes:
        nid, kind = n.get('id', '<missing id>'), n.get('kind')
        path = n.get('path')
        if not path or not (root / path).is_file():
            errors.append('Node definition path missing: ' + nid)
        if kind in {'functional-requirement', 'nonfunctional-requirement'} and not n.get('tests'):
            errors.append('Unmapped requirement: ' + nid)
        if kind == 'feature' and (not n.get('requirements') or not n.get('needs')):
            errors.append('Unjustified feature: ' + nid)
        if kind == 'user-flow' and not n.get('use_cases'):
            errors.append('Flow lacks use case: ' + nid)
        if kind == 'persistent-field' and (not n.get('owner') or n.get('entity') not in byid or byid.get(n.get('entity'), {}).get('kind') != 'entity'):
            errors.append('Field ownership missing or invalid: ' + nid)
        if kind == 'entity' and (not n.get('purpose') or not n.get('owner')):
            errors.append('Entity purpose/owner missing: ' + nid)
        if kind in {'api', 'test'} and kind == 'api' and not n.get('tests'):
            errors.append('Endpoint lacks tests: ' + nid)
        for attr in REF_LISTS:
            for ref in n.get(attr, []):
                if ref not in byid:
                    errors.append(f'Invalid {attr} reference: {nid} -> {ref}')
        ref = n.get('entity')
        if ref and ref not in byid:
            errors.append(f'Invalid entity reference: {nid} -> {ref}')
    for edge in edges:
        if edge.get('from') not in byid or edge.get('to') not in byid:
            errors.append('Dangling graph edge: ' + str(edge))

    operation_ids = []
    for path, methods in contract.get('paths', {}).items():
        for method, op in methods.items():
            if method.lower() in METHODS:
                operation_ids.append(op.get('operationId'))
    api_nodes = {n.get('id') for n in nodes if n.get('kind') == 'api'}
    if set(operation_ids) != api_nodes:
        errors.append('OpenAPI / API registry names disagree')
    if len(operation_ids) != len(set(operation_ids)):
        errors.append('Duplicate OpenAPI operation IDs')

    def check_refs(value):
        if isinstance(value, dict):
            ref = value.get('$ref')
            if isinstance(ref, str) and ref.startswith('#/') and not resolve_ref(contract, ref):
                errors.append('OpenAPI unresolved ref: ' + ref)
            for nested in value.values():
                check_refs(nested)
        elif isinstance(value, list):
            for nested in value:
                check_refs(nested)
    check_refs(contract)
    return errors



def validate_links(root, paths, exceptions=None):
    """Check Markdown local links, permitting only enumerated archive pairs."""
    exceptions = exceptions or {}
    errors = []
    for p in paths:
        rel = p.relative_to(root).as_posix()
        for target, local in local_links(p, p.read_text(errors='replace')):
            if (rel, target) in exceptions and rel.startswith('consolidated/') and exceptions[(rel, target)]:
                continue
            if Path(local).is_absolute():
                errors.append(f'Absolute local hyperlink: {rel} -> {target}')
            elif not (p.parent / local).exists():
                errors.append(f'Broken link: {rel} -> {target}')
    return errors


def validate(root):
    root = Path(root).resolve()
    registry_path = root / '11-traceability/registry.json'
    if not registry_path.is_file():
        return ['Missing canonical registry: ' + str(registry_path)], {}, []
    registry = json.loads(registry_path.read_text())
    openapi_path = (root / registry.get('openapi', '')).resolve()
    errors = []
    warnings = []
    if not openapi_path.is_file():
        errors.append('Missing current OpenAPI contract: ' + str(openapi_path))
        contract = {}
    else:
        contract = json.loads(openapi_path.read_text())
    errors.extend(validate_graph(root, registry, contract))

    # Archive exceptions are exact source-file/target pairs with a reason. They
    # preserve immutable consolidated snapshots while keeping current docs strict.
    exceptions = {(x.get('source'), x.get('target')): x.get('reason', '') for x in registry.get('archival_link_exceptions', [])}
    archival_counts = Counter()
    markdown = sorted(root.rglob('*.md'))
    checked_links = sum(1 for p in markdown for _ in local_links(p, p.read_text(errors='replace')))
    errors.extend(validate_links(root, markdown, exceptions))
    for p in markdown:
        rel = p.relative_to(root).as_posix()
        if rel.startswith('consolidated/'):
            archival_counts[rel] += sum(1 for target, _ in local_links(p, p.read_text(errors='replace')) if (rel, target) in exceptions)
    if len(exceptions) != len(set(exceptions)):
        errors.append('Duplicate archival link exception')
    for pair, reason in exceptions.items():
        if not pair[0].startswith('consolidated/') or not reason:
            errors.append(f'Invalid archival exception: {pair}')

    for directory in [root] + [p for p in root.rglob('*') if p.is_dir() and p.name != '__pycache__']:
        if not (directory / 'README.md').is_file():
            errors.append('Directory lacks README: ' + str(directory.relative_to(root)))

    nodes, edges = registry.get('nodes', []), registry.get('edges', [])
    operations = [n for n in nodes if n.get('kind') == 'api']
    counts = {
        'documents': len(registry.get('documents', [])), 'artifacts': len(nodes),
        'edges': len(edges), 'apis': len(operations),
        'requirements': sum(n.get('kind') in {'functional-requirement', 'nonfunctional-requirement'} for n in nodes),
        'persistent_fields': sum(n.get('kind') == 'persistent-field' for n in nodes),
        'tests_planned': sum(n.get('kind') == 'test' for n in nodes),
        'markdown_documents': len(markdown), 'checked_local_links': checked_links,
        'archival_link_exceptions_used': sum(archival_counts.values()),
        'archival_exception_pairs': len(exceptions),
        'broken_links': sum(e.startswith('Broken link:') for e in errors),
    }
    return errors, counts, warnings


if __name__ == '__main__':
    root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parents[1]
    errors, counts, warnings = validate(root)
    print(json.dumps({'structural_validation': 'FAIL' if errors else 'PASS', 'counts': counts,
                      'errors': errors, 'warnings': warnings,
                      'limits': 'Traceability and link integrity only; linked tests are not executed and this is not app/runtime/product acceptance.'},
                     ensure_ascii=False, indent=2))
    sys.exit(bool(errors))
