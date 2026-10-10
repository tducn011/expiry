# DOC-VALIDATOR — Documentation consistency validator

- Document ID: `DOC-VALIDATOR`
- Status: **Review**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

Runnable structural checks requested by architecture prompt.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

Run from repository root:

```bash
python3 docs/architecture/scripts/validate_architecture.py
```

Checks relative local links, required document sections/status/IDs, unique graph IDs, invalid references/edges, requirement test coverage, justified features, flow/use-case links, field ownership/entity purpose, endpoint test coverage, directory indexes and OpenAPI operation/ref parity. Registry stores one definition per ID; textual references may repeat. It checks document structure, not proposal approval, graph semantics, app behavior or full Mermaid/PlantUML grammar.

Negative self-checks will deliberately alter a temporary registry to verify duplicate/dangling/unmapped/owner failures are detected; project source stays intact. JSON Schema fixture checks and actual diagram parser checks are separate verification actions recorded in report.

### Repeat Mermaid parser check without changing app dependencies

[check_diagrams.mjs](check_diagrams.mjs) accepts a dependency directory supplied by the caller. This iteration used a temporary environment; reproduce with pinned versions:

```bash
npm install --prefix /tmp/expiry-mermaid-check --no-audit --no-fund mermaid@11.17.2 jsdom@26.1.0
node docs/architecture/scripts/check_diagrams.mjs /tmp/expiry-mermaid-check/node_modules
```

Add `--include-legacy` to audit linked old `.mmd` sources; known source failures produce exit1 and are recorded separately. This parser does not render diagrams or validate PlantUML.

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [traceability/registry.json](../11-traceability/registry.json)
- [11-traceability/verification-report.md](../11-traceability/verification-report.md)

## Open questions

Chốt các quyết định liên quan trong decision ledger trước khi đổi contract hoặc triển khai.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](../11-traceability/README.md)
- [traceability/registry.json](../11-traceability/registry.json)
- [11-traceability/verification-report.md](../11-traceability/verification-report.md)

## Verification criteria

Đối chiếu nguồn, ID và downstream links; acceptance runtime chỉ được ghi pass sau khi thực chạy.
