# SCH-03 MySQL schema and native Workbench evidence

OWNS: `database/mysql/**`, `docs/architecture/06-data-model/erd-workbench/**`

Scope: verify the existing development schema, preserve the prior model, generate a native Workbench projection from live SQL, and align only the owned model evidence/tests/docs. No DDL or migration was added or rewritten.

- [x] G1: Isolated DB transaction regression covers the current seven-table schema
  CHECK: `node database/mysql/tests/run.mjs`
  EVIDENCE: 2026-10-13; `EXPIRY_DB_TESTS_VERIFIED`; 35 PASS, 0 FAIL, 0 BLOCKED, 5 NOT TESTED; latest test DB `expiry_test_20261013084941122_b4bfbe`, separate restore DB retained.

- [x] G2: Canonical native-model static guards match full schema and retained backup
  CHECK: `node database/mysql/tests/static.mjs`
  EXPECT: `EXPIRY_STATIC_VERIFIED`
  EVIDENCE: 2026-10-13; `EXPIRY_STATIC_VERIFIED`; canonical artifacts/hashes and diagram position guards, 7-table live/model parity, test counts and exact pre-SCH-03 backup hashes matched.

- [x] G3: Existing `expiry_dev` verified without reset; migrations001+002 checksums match and seed replay preserves its row fingerprint
  CHECK: `node database/mysql/scripts/manage.mjs verify-dev`
  EXPECT: `EXPIRY_DEV_VERIFIED`
  EVIDENCE: 2026-10-13; MySQL8.4.11; seven tables; healthy loopback127.0.0.1:3307; applied checksums 001=`32f2806e6bc4a2b271e3b93a8978352df6910334d3217501647b0729567b32cc`, 002=`96bbfdc4b3e1ee6aa454f41eb520fee6b3d12fe71e2c02ae442b887db8833adc`; seed fingerprint unchanged.

- [x] G4: Prior `.mwb` preserved before its authorized replacement
  EVIDENCE: `database/mysql/evidence/pre-sch03/backup-manifest.json` records exact original model (9,661 bytes, SHA-256 `9b24b335105ba2a3a7c701a83065e1eb23f0692d3bfdc96366db4881e0b498da`), previous PNG, and pre-task native evidence.

- [x] G5: Native Workbench GRT reads live SQL and exports the seven-table model/PNG
  EVIDENCE: `workbench_native_evidence.json` PASS; 7 tables/53 columns/8 PK columns/5 FKs, 30 live CHECK constraints inventoried; 7 figures/5 connections; parser errors0. Full `food_entries` fields are visible; auth/API row and migration ledger are placed below without overlap. `workbench_open_evidence.json` confirms `expiry_app` connection with no saved password. Graphical model-open/diagram-activation verification is tracked separately in G6.

- [x] G6: Saved model opened and EER diagram activated in a graphical Workbench session
  EVIDENCE: `workbench_view_evidence.json` PASS from embedded GRT after `Workbench.openModel` and `activateDiagram`; the loaded document contains all 7 expected tables, 7 figures, and 5 connections in `Expiry live MySQL schema`. The Workbench process remains open. No GUI button/wizard click is claimed.

Native extraction/export and graphical open/activation gates passed. The Workbench table model does not represent CHECK expressions; immutable migration SQL, the live dump and MySQL checks remain authoritative. HTTP/backend integration, production DB/deployment, device/UI acceptance and stakeholder approval remain outside these gates.
