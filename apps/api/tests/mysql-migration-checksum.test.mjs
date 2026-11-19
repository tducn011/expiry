import assert from 'node:assert/strict';
import test from 'node:test';
import { migrationChecksumMatches } from '../../../database/mysql/src/connection.mjs';

test('migration 003 accepts the verified homeserver checksum without rewriting its ledger', () => {
  const current = '4db6ee3d7fe81921901c2390a477ec7b54536ad69aebf89aead40cee84453791';
  const homeserver = '520988026ec2e8a1aedb9502c7d1d90922b0c79abf28933f64e7ce8d0edb27bf';
  assert.equal(migrationChecksumMatches(3, current, current), true);
  assert.equal(migrationChecksumMatches(3, homeserver, current), true);
  assert.equal(migrationChecksumMatches(4, homeserver, current), false);
  assert.equal(migrationChecksumMatches(3, 'f'.repeat(64), current), false);
});
