"""Negative controls for architecture graph and current-link validation."""
from copy import deepcopy
from pathlib import Path
import json
import tempfile
import unittest

from validate_architecture import validate_graph, validate_links, REQUIRED_SECTIONS


class ValidatorControls(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.document = self.root / 'current.md'
        body = '\n'.join('## ' + heading + '\nText.' for heading in REQUIRED_SECTIONS)
        self.document.write_text('Document ID: `DOC-1`\nStatus: **Review**\n' + body + '\n')
        self.registry = {
            'documents': [{'id': 'DOC-1', 'path': 'current.md', 'status': 'Review'}],
            'nodes': [
                {'id': 'API-1', 'kind': 'api', 'path': 'current.md', 'tests': ['TEST-1']},
                {'id': 'TEST-1', 'kind': 'test', 'path': 'current.md'},
                {'id': 'ENT-1', 'kind': 'entity', 'path': 'current.md', 'purpose': 'x', 'owner': 'service'},
                {'id': 'FIELD-1', 'kind': 'persistent-field', 'path': 'current.md', 'entity': 'ENT-1', 'owner': 'user'},
            ],
            'edges': [{'from': 'API-1', 'to': 'TEST-1', 'relation': 'verified-by'}],
        }
        self.contract = {'paths': {'/x': {'get': {'operationId': 'API-1'}}}, 'components': {'schemas': {'Ok': {'type': 'object'}}}}

    def tearDown(self):
        self.temp.cleanup()

    def errors(self, registry=None, contract=None):
        return validate_graph(self.root, registry or self.registry, contract or self.contract)

    def test_valid_baseline_passes(self):
        self.assertEqual(self.errors(), [])
        self.assertEqual(validate_links(self.root, [self.document]), [])

    def test_duplicate_registry_id_fails(self):
        registry = deepcopy(self.registry)
        registry['nodes'].append({'id': 'API-1', 'kind': 'test', 'path': 'current.md'})
        self.assertTrue(any('Duplicate IDs' in e for e in self.errors(registry=registry)))

    def test_dangling_registry_reference_fails(self):
        registry = deepcopy(self.registry)
        registry['edges'].append({'from': 'API-1', 'to': 'MISSING', 'relation': 'x'})
        self.assertTrue(any('Dangling graph edge' in e for e in self.errors(registry=registry)))

    def test_operation_registry_mismatch_fails(self):
        contract = deepcopy(self.contract)
        contract['paths']['/x']['get']['operationId'] = 'API-WRONG'
        self.assertIn('OpenAPI / API registry names disagree', self.errors(contract=contract))

    def test_unresolved_openapi_ref_fails(self):
        contract = deepcopy(self.contract)
        contract['components']['schemas']['Broken'] = {'$ref': '#/components/schemas/Absent'}
        self.assertTrue(any('OpenAPI unresolved ref' in e for e in self.errors(contract=contract)))

    def test_broken_current_link_fails(self):
        self.document.write_text(self.document.read_text() + '\n[missing](not-here.md)\n')
        self.assertTrue(any('Broken link' in e for e in validate_links(self.root, [self.document])))


if __name__ == '__main__':
    unittest.main()
