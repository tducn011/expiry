# Gates: Expiry MySQL implementation

OWNS: database/mysql/**, docs/erd/**

Scope: Resolve source evidence, build a candidate logical/physical model, execute MySQL 8.4 sandbox migrations and real transaction tests, and record Workbench evidence and remaining gaps.

- [x] G1: Resolved source paths, rules, grain and traceability have been audited
  EVIDENCE: 01_MODEL_AUDIT resolves actual flat docs/contracts; independent source review verified RULE-01…24, food namespace, candidate grain and open assumptions.

- [x] G2: Logical ERD, dictionary, relationship matrix and candidate decisions are coherent
  EVIDENCE: Logical four-table model and 03/04/05 artifacts reviewed; minimum initial child is explicitly a transaction invariant, not an FK claim.

- [x] G3: MySQL differences and all required authored artifacts pass static verification
  CHECK: node database/mysql/tests/static.mjs
  EXPECT: EXPIRY_STATIC_VERIFIED
  EVIDENCE: automatic-evidence=v1; definition-sha256=01f0bd0a2afd9593103b46ebe1d01cbf51f8275b78b74fcabab374ba79d8b65b; exit=0; EXPECT=matched; output-sha256=e7f616e363051e40e41d533df048c9224eef87047dc655f85a2eec0663cec17f; output-bytes=23; shell=/bin/sh; cwd=/home/pro/Downloads/expiry; path=07b5b3625a23/15 entries

- [x] G4: Dedicated loopback-only MySQL 8.4 responds to authenticated SQL and dev migration/seed replay is safe
  CHECK: node database/mysql/scripts/manage.mjs verify-dev
  EXPECT: EXPIRY_DEV_VERIFIED
  EVIDENCE: automatic-evidence=v1; definition-sha256=f08e8770005f442877791e2b4a39e6ba1a5a606734266a191f3f4ce581d34c09; exit=0; EXPECT=matched; output-sha256=593bc9becfae69f7dcabc4cd259662dcddf4cb82b3fd5c8ba4c6d7ee650ac438; output-bytes=909; shell=/bin/sh; cwd=/home/pro/Downloads/expiry; path=07b5b3625a23/15 entries

- [x] G5: Workbench actually connects and reverse engineers live expiry_dev into a native model and EER export
  EVIDENCE: Native Workbench8.0.36/GRT authenticated to8.4.11; checked native parser on unchanged SHOW CREATE with40 charsets;5tables/42columns/3FK match; valid native model ZIP and PNG viewed. GUI button/wizard clicks not performed.

- [x] G6: Fresh isolated MySQL test database passes schema, domain, rollback, concurrency, replay and query tests
  CHECK: node database/mysql/tests/run.mjs
  EXPECT: EXPIRY_DB_TESTS_VERIFIED
  EVIDENCE: automatic-evidence=v1; definition-sha256=5f7f09e8987c8bab15b0159b272fa3cb00c4c6a4b57657b69fee5ef1e21ddf81; exit=0; EXPECT=matched; output-sha256=4638aab9c7c86f0a3b325d2cdabfff19c7ae2067fbbc51ac6596d0bb6fc94dc2; output-bytes=1009; shell=/bin/sh; cwd=/home/pro/Downloads/expiry; path=07b5b3625a23/15 entries

- [x] G7: Repository owner scoping is tested and absent HTTP/auth/FE acceptance is accurately classified
  EVIDENCE: OWNER-SCOPE exercises six foreign operations and principal401; HTTP identity establishment, FE recovery/accessibility, stakeholder approval and production performance remain explicit NOT TESTED per conditional task scope.

- [x] G8: Report matches fresh evidence, source status, test results and all handoffs
  EVIDENCE: 07_DB_VERIFICATION_REPORT refreshed against latest fresh test run (35PASS/0FAIL/5NOTTESTED), source parity audit, native Workbench view/model/PNG and actual INFORMATION_SCHEMA. Candidate approval and all external acceptance boundaries remain explicit. Static credential scan includes decompressed native model XML; git diff --check passed.
