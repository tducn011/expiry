# DOC-TESTS — Test cases and coverage gates

- Document ID: `DOC-TESTS`
- Status: **Review**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

Acceptance/test design with exact execution status.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

| ID | Setup/action | Expected | Layer | Execution |
|---|---|---|---|---|
| VT-01 | Create known/unknown date | Shape đúng, initial event, unknown visible | Contract+DB | Not run — specification only |
| VT-02 | Create rollback trước movement/request result | Không orphan entry hoặc reserved key commit | Integration | Not run — specification only |
| VT-03 | Consume 250g từ 1000g | 750g; delta -250; version+1 | Domain+DB | Not run — specification only |
| VT-04 | Consume quá lượng/negative/piece fractional | 409 hoặc422; không write | Domain+contract | Not run — specification only |
| VT-05 | Hai requests cùng version | 1 success, 1 conflict; quantity>=0 | Real concurrent DB | Not run — specification only |
| VT-06 | Same key+payload concurrent/retry | 1 mutation/event; original result replay | Real concurrent DB | Not run — specification only |
| VT-07 | Same key different target/body | 409 key reuse | Integration | Not run — specification only |
| VT-08 | Recount to same amount | 200 no-op; no movement/version increment | Domain+DB | Not run — specification only |
| VT-09 | Recount depleted to positive | Active derived, adjustment reason | Domain+DB | Not run — specification only |
| VT-10 | Consume then discard remainder | Depleted; totals distinguish use/waste | Ledger audit | Not run — specification only |
| VT-11 | Soft delete then restore | Amount/history unchanged, visibility restored | Integration+UI | Not run — specification only |
| VT-12 | GET/PATCH/action/history foreign ID | 404, no exposure | Auth regression | Not run — specification only |
| VT-13 | Clock around UTC/local midnight | Correct today/soon/past_date | Injected clock tests | Not run — specification only |
| VT-14 | Metadata patch date→null malformed combination | 422; no partial invalid certainty | Contract+domain | Not run — specification only |
| VT-15 | Timeout/401/409 UI | Draft and stable key; refetch conflict | UI task tests | Not run — specification only |
| VT-16 | Migration fresh + backup restore | Constraints/data recovered | Staging | Not run — specification only |
| VT-17 | Keyboard/labels/no color-only | Task usable | UX/accessibility | Not run — specification only |
| TC-18 | Owner list filters/offset/order applied before pagination; distinct empty states | Stable order + count/filter semantics across pages | API/query integration | Not run — specification only |
| TC-19 | Known/unknown/estimated/past/depleted/deleted attention + detail | Reason/date source and safety caveat; eligible set correct | Domain + FE interaction | Not run — specification only |
| TC-20 | Read/edit preferences + stale version/local date changes | Valid preferences or422/409; attention recomputed | Contract + integration | Not run — specification only |
| TC-21 | Compare demo adapter DTOs to OpenAPI on every operation | Schema parity; explicit enum/decimal/error mapping | Contract regression | Not run — specification only |
| TC-22 | Measure representative dataset/host under controlled load | Record p50/p95/volume/hardware; approve target after baseline | Performance baseline | Not run — specification only |
| TC-23 | Session rotate/logout/revoke/expire and cookie/CSRF requests | Old credential invalid; unauthorized write rejected; draft/cache owner-safe | Auth integration | Not run — specification only |
| TC-24 | Analytics disabled/consent and redacted error telemetry | No forbidden payload; no failed domain command from emitter error | Adapter integration | Not run — specification only |
| TC-25 | Future OCR invalid/ambiguous image/timeout/cancel/cleanup | No automatic persistence; manual fallback; bounded resources | Conditional OCR contract | Not run — specification only |

Unit: pure quantity/date/policy. Service: command orchestration/replay/errors. API: DTO/status/auth object scopes. Real SQL: locking/concurrency/reservation rollback/history invariants. FE: form state/navigation/recovery and generated adapter schema parity. E2E: browser→API→DB capture/read/use/recount/delete/restore. Accessibility: keyboard/labels/focus/errors + target-device review. OCR conditional tests do not enable OCR in MVP.

PR gate [D]: documentation consistency + affected domain/contract tests; DB changes require real integration and migration checks; UI changes require task/browser/accessibility evidence; deploy gate requires clean staging browser→DB and verified restore/rollback plan. Avoid a new test framework solely for this documentation task.

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [traceability/coverage.md](../11-traceability/coverage.md)
- [08-architecture/deployment.md](../08-architecture/deployment.md)
- [03-requirements-features/nonfunctional-requirements.md](../03-requirements-features/nonfunctional-requirements.md)

## Open questions

Chốt các quyết định liên quan trong decision ledger trước khi đổi contract hoặc triển khai.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](../11-traceability/README.md)
- [11-traceability/coverage.md](../11-traceability/coverage.md)
- [08-architecture/deployment.md](../08-architecture/deployment.md)
- [03-requirements-features/nonfunctional-requirements.md](../03-requirements-features/nonfunctional-requirements.md)

## Verification criteria

Đối chiếu nguồn, ID và downstream links; acceptance runtime chỉ được ghi pass sau khi thực chạy.
