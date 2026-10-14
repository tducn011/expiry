# MySQL 8.4 Physical Implementation Notes

Physical mapping observed in the live development schema after checksum-recorded migrations001+002. Logical and authentication-policy assumptions remain review items; this file does not approve a production choice.

| Reference | Implementation | Enforcement/trade-off |
|---|---|---|
| uuid | CHAR(36), ascii_bin on all IDs/FKs | readable; larger than BINARY(16); canonical UUID validated before SQL; DB enforces identity/FK rather than all UUID lexical syntax |
| numeric(12,3) | DECIMAL(12,3) | exact storage; input validation in integer milliunits before driver write because DB coercion may round extra scale |
| timestamptz | DATETIME(6), connection/server +00:00 | stored UTC convention, not automatic zone metadata; expiry/opening stay DATE; user day computed with IANA zone in JS |
| jsonb | JSON | reserved SQL NULL vs completed JSON null for 204 |
| partial UNIQUE initial | generated nullable initial_entry_id + UNIQUE | NULL for other kinds; no partial-index syntax; at least one child still transaction invariant |
| partial active/trash indexes | composite user_id/deleted_at/date/quantity/id | no persisted attention; CASE ordering before pagination may filesort; EXPLAIN measured, no SLA claim |
| regex ~ | REGEXP_LIKE and ascii_bin key/hash | case-sensitive ASCII key/fingerprint; allowed format also validated before SQL |
| CHECK/enum | named CHECK + VARCHAR, NOT NULL | CHECK accepts UNKNOWN, so nullable combinations explicitly guarded; introspection and invalid-write tests required |
| BEGIN around DDL | checksum-versioned runner, fresh schema replay | DDL has implicit commits; partial DDL error preserves DB for explicit forward recovery; business DML rollback tested separately |

`schema_migrations` is operational infrastructure, not a domain entity. Applied migrations001/002 must not be edited. New changes need a new version, forward fix and backup/restore strategy. Fresh test databases use new names and preserve old runs. No `DROP DATABASE expiry_dev`, volume deletion or automated down-v operation is provided.

The current live schema contains seven tables, 53 columns, five foreign keys and 30 enforced CHECK constraints. Six tables are declared by migrations001+002; `schema_migrations` is created by the runner. Native Workbench can represent the columns, primary keys and foreign-key endpoints used in the EER, but its table model does not preserve MySQL CHECK expressions. The immutable migrations, current live schema dump and isolated MySQL checks remain authoritative for those constraints.

Official sources inspected for version-specific behavior [B]: [CHECK](https://dev.mysql.com/doc/refman/8.4/en/create-table-check-constraints.html), [generated columns](https://dev.mysql.com/doc/refman/8.4/en/create-table-generated-columns.html), [locking reads](https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html), [time zone](https://dev.mysql.com/doc/refman/8.4/en/time-zone-support.html), [DECIMAL](https://dev.mysql.com/doc/refman/8.4/en/fixed-point-types.html), [implicit commits](https://dev.mysql.com/doc/refman/8.4/en/implicit-commit.html), [Compose](https://docs.docker.com/reference/compose-file/services/), [Workbench reverse engineering](https://dev.mysql.com/doc/workbench/en/wb-reverse-engineer-live.html), [Compose user installation](https://docs.docker.com/compose/install/linux/), [mysql2 driver](https://sidorares.github.io/node-mysql2/docs).

Boundary: database constraints/privileges cannot establish an authenticated HTTP principal. This isolated database suite does not measure HTTP authentication/database integration or web recovery/refetch integration; those have separate integration evidence. Decimal/date/source/restore mappings still need an adapter review before FE integration.
