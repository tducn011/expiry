const acceptedHistoricalChecksums = new Map([
  [3, new Set([
    'a2cd2af6d22a4ec3a863600741176f26cfbae104406e06a1bac8ee9c286006e7',
    // Recorded on the homeserver; its sessions_time CHECK matches migration 003.
    '520988026ec2e8a1aedb9502c7d1d90922b0c79abf28933f64e7ce8d0edb27bf'
  ])]
]);

export function migrationChecksumMatches(version, recorded, current) {
  return recorded === current || acceptedHistoricalChecksums.get(version)?.has(recorded) === true;
}
