# DOC-OBSERVABILITY — Product analytics and error monitoring

- Document ID: `DOC-OBSERVABILITY`
- Status: **Review**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

Justified events and operational signals; sensitive content excluded.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

OQ-08: “sensors bắt lỗi” could mean application error tracking or device sensors. Until clarified, this page proposes application error tracking only; no device-sensor permissions/features are added. Google Analytics is user prompt intent, not an installed or approved collection configuration.

| Event candidate | Trigger | Product question | Allowed params [D] | Verification |
|---|---|---|---|---|
| capture_completed | Confirmed successful create | Does manual capture finish? | flow_id, entry_mode=manual, outcome; no name/date/entryID | One successful command emit; suppress replay duplicates |
| action_recorded | Confirmed consume/discard/recount | Are records maintained after use? | action_kind, outcome; no quantity/reason/inventory contents | Commit confirmation; no event on rejected command |
| flow_recovered | Recovery completion | Where do interruptions occur? | flow_id, recovery_kind, coarse code | Consent enabled; no duplicate uncertain retries |

Privacy/consent deployment decisions remain open: minimize parameters, no personal names/emails/free-form notes/photos/product names/exact dates or inventory identifiers; disable analytics safely when unavailable or not permitted. Provider policy/consent must be verified for target users/jurisdiction before collection; no legal compliance assertion here. Analytics failure must not fail a domain command.

Operational monitoring: frontend uncaught error boundary; API unexpected failure, request correlation ID, structured safe status/code/duration; DB transaction rollback/conflict/replay counts; future OCR timeout/schema/cleanup failure. Redact request bodies/cookies/tokens and sensitive record fields. Separate product events, diagnostic logs and alerts. Stage synthetic failing request and ensure redacted trace joins client/API without disclosing data.

Alert candidates: elevated unexpected5xx, migration/backup failures and dependency health; thresholds/runbook owner chosen after baseline. Owner404 must be neutral; domain409 is expected business signal rather than every conflict paging an operator. Monitoring backend selection remains ADR-005 review.

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [04-technology-research/official-references.md](../04-technology-research/official-references.md)
- [adr/ADR-005-observability.md](../adr/ADR-005-observability.md)
- [10-testing/test-catalog.md](../10-testing/test-catalog.md)
- [08-architecture/deployment.md](../08-architecture/deployment.md)

## Open questions

Chốt các quyết định liên quan trong decision ledger trước khi đổi contract hoặc triển khai.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](../11-traceability/README.md)
- [04-technology-research/official-references.md](../04-technology-research/official-references.md)
- [adr/ADR-005-observability.md](../adr/ADR-005-observability.md)
- [10-testing/test-catalog.md](../10-testing/test-catalog.md)
- [08-architecture/deployment.md](../08-architecture/deployment.md)

## Verification criteria

Đối chiếu nguồn, ID và downstream links; acceptance runtime chỉ được ghi pass sau khi thực chạy.
