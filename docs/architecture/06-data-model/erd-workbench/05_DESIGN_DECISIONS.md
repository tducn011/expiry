# Candidate decisions and review ledger

Evidence labels: [A] checked source/runtime, [B] official documentation, [C] inference, [D] implementation recommendation. Status vocabulary: recorded-confirmed, proposed, open, observed, verified-by-tests.

| ID (local implementation namespace) | Choice | Status / rationale |
|---|---|---|
| MYSQL-01 | MySQL Community 8.4 official image; InnoDB | Task-authorized sandbox target; production choice remains open |
| MYSQL-02 | CHAR(36) ASCII binary identifiers everywhere | proposed; readable UUID DTOs and consistent FK collation; uses more index space than BINARY(16); validate canonical UUID before SQL |
| MYSQL-03 | DECIMAL(12,3), decimal-string DTO, integer milliunits in JS | proposed; exact arithmetic; prevalidate scale before MySQL coercion/rounding |
| MYSQL-04 | DATE for expiry/opening; DATETIME(6) UTC for events | proposed; DATETIME avoids TIMESTAMP range; UTC enforced on connection, explicit timezone conversion for local-day policy |
| MYSQL-05 | VARCHAR + CHECK enumerations | proposed; visible domain values and versioned migrations; no ordinal ENUM coupling |
| MYSQL-06 | generated nullable initial_entry_id + UNIQUE | proposed; at most one initial, other movements NULL; application transaction enforces at least one |
| MYSQL-07 | composite owner/visibility/date indexes | proposed; no PostgreSQL partial syntax; attention CASE sorted before pagination can still require filesort |
| MYSQL-08 | api_requests.operation encodes command + target | proposed; preserves original dictionary without adding polymorphic target FK; hash canonical payload, owner+key PK |
| MYSQL-09 | JSON null for completed 204; SQL NULL for reserved result | proposed; both result fields are null or both SQL-nonnull; incomplete reservation never commits in repository |
| MYSQL-10 | one metadata migration table | proposed infrastructure only; not fifth domain entity; SHA256 prevents silent rewrite; MySQL DDL replay is not transactionally atomic as a whole |
| MYSQL-11 | app DML grants; ledger append-only; separate migration administrator | proposed; dev Workbench app account can inspect and read; no default root GUI connection |
| MYSQL-12 | isolated fresh expiry_test_* per verification run | proposed; no dropping dev or pre-existing databases; preserve run for investigation |

Original DEC-01/02 stay recorded-confirmed. DEC-03…09 and OQ-02/04/07 remain source proposals/open decisions. This task authorizes executing a candidate design in development, not relabeling it approved. Participant research, auth provider, retention/account erasure, backup ownership and production deployment remain open.
