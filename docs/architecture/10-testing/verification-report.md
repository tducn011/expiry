# DOC-VERIFY — Architecture iteration verification

- Document ID: `DOC-VERIFY`
- Status: **Review**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

Separate actually run checks from planned application acceptance.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

### Actually executed

| Check | Command / action | Result |
|---|---|---|
| Structural documentation/graph | `python3 docs/architecture/scripts/validate_architecture.py` | PASS: 86 document contracts, 203 artifact definitions, 335 relationships; relative links/IDs/references/coverage/ownership/README indexes and 12 OpenAPI operation IDs coherent |
| Negative validator checks | Temporary copies: duplicate ID, dangling edge, unmapped FR, missing field owner, API without tests, broken Markdown link | All 6 defects detected; project originals untouched |
| Contract fixtures | Python `jsonschema.Draft202012Validator` + format checker; EntryCreate known/unknown, MovementCommand, RecountCommand, Problem | All 5 fixtures PASS against linked OpenAPI components; this is fixture/schema compatibility, not server behavior |
| New Mermaid source | `node docs/architecture/scripts/check_diagrams.mjs /tmp/expiry-mermaid-check/node_modules` | PASS 13/13 with Mermaid 11.17.2 + jsdom 26; parser acceptance only |
| Historical Mermaid sources | Same command with `--include-legacy` | 8/11 legacy sources PASS; 3 sequence sources FAIL; combined21/24, command exit1 as expected; preserved original sources |
| TMB local skills | Local package copy/symlinks + SHA-256, front matter/dependency checks, progress function smoke | PASS 5 skills and11 byte-identical source files; hooks not activated |
| Local source preservation | SHA-256 compare84 pre-existing files against pre-authoring snapshot | PASS: original docs/code/prior full-data extraction unchanged |

### Historical diagram defects and correction scope

`04_Data_Flow_UML_and_Ownership_3.mmd`, `_4.mmd`, `_5.mmd` contain semicolons inside sequence-message labels; Mermaid parses those as statement delimiters. New architecture sequences replace that punctuation with commas and pass the parser. The historical files remain evidence snapshots, with their syntax defect documented rather than called valid.

### Verification limits

- Mermaid syntax was parsed, diagrams were not visually rendered or checked for every layout/semantic relation.
- PlantUML source files were read/linked, not parsed/rendered: no local Java/PlantUML runtime was available.
- Proposed PostgreSQL DDL was not applied; real locking/rollback/owner/session persistence was not tested.
- Application tests VT-01…17 and TC-18…25 remain **Not run — specification only**. The5 schema fixtures and documentation tests do not clear these cases.
- No browser/device/audio/performance/usability/participant study, deployment or production OCR integration test was performed.
- Package metadata and official technology documentation were read; food-label OCR accuracy/latency/correction benefit not measured.
- Live Canva rich text and readable Google Docs/tracker exports were read; Figma source and independent interview evidence remain missing.

All artifacts remain Draft/Review/Blocked. Structural pass cannot mark an artifact Approved.

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [scripts/README.md](../scripts/README.md)
- [11-traceability/gates.md](gates.md)
- [10-testing/test-catalog.md](../10-testing/test-catalog.md)

## Open questions

Remaining runtime/device/user-study gaps cannot be cleared by documentation tooling.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](README.md)
- [scripts/README.md](../scripts/README.md)
- [11-traceability/gates.md](gates.md)
- [10-testing/test-catalog.md](../10-testing/test-catalog.md)

## Verification criteria

Đối chiếu nguồn, ID và downstream links; acceptance runtime chỉ được ghi pass sau khi thực chạy.
