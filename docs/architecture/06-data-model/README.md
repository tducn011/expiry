# Data model documentation

Current reading order:

1. [Runtime Data Flow Specification (DOC-DFD-RUNTIME)](runtime-data-flow.md) — **Tier 1 Authority** on Level 0-2 DFD, live 7-table MySQL store interactions, and dual-axis lifecycle.
2. [Schema input/output guide](schema-input-output.md) — current operation boundary and review-only OCR sample proposal.
3. [Current logical/physical ERD](erd.md) and [current field dictionary](dictionary.md) — migration-aligned seven-table MySQL model (53 columns, five FKs).
4. [Native ERD projection](erd-workbench/02_LOGICAL_ERD.mmd) and [native entity dictionary](erd-workbench/03_ENTITY_DICTIONARY.md) — generated/current database-workstream evidence.
5. [MySQL implementation notes](erd-workbench/06_MYSQL_IMPLEMENTATION_NOTES.md) and [verification report](erd-workbench/07_DB_VERIFICATION_REPORT.md) — local sandbox evidence and its limits.
6. [Historical data-flow source](04_Data_Flow_UML_and_Ownership.md) — preserve original requirements/provenance; consult the dated reconciliation report for current runtime differences.

The current schema is sourced by immutable migrations (001, 002, 003). Workbench is a projection. No OCR training/evaluation sample table is implemented.
