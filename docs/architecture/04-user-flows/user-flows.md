# DOC-UF — Goals, tasks and user flows

- Document ID: `DOC-UF`
- Status: **Review**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

11 complete task flows; dependency order means goals before screens.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

**[A] Current UI map:** `App` owns the selected shell view and modal state. Real-mode Add is gated by session before the Add form opens; Auth is a modal. The Add form has local draft state and optional scan assist. Detail is selected content inside the shell. Edit, movement action, History, authentication, and confirmations are overlays. Inventory and Attention share one list component; Trash and Settings are separate shell views. See [current navigation](../05-interaction-design/navigation.md).

| Flow | Persona / UC | Current entry and steps | Current success result | Failure / recovery boundary |
|---|---|---|---|---|
| UF-01 Record a new item | P1/P3 · UC-01 | Attention or Inventory → Add; if unauthenticated, Auth first → Add form → submit | Entry plus initial movement commit together. Add closes, success toast appears, and the same list remains visible; no automatic Detail navigation | Invalid form/API response retains form values; uncertain command may use immutable same-key retry; changed identity clears pending private state |
| UF-02 Keep an entry with unknown date | P1/P2 · UC-01 | Authenticated Add form → choose unknown date in date/details step → submit | `expiry_date=null`, certainty/source unknown, label unspecified; list stays active and no date is invented | Missing required name/quantity blocks submit; date is optional |
| UF-03 Understand recorded attention | P1 · UC-02/03 | Attention list/filter → select entry → selected Detail content | Shows amount, date context, and reason; no quantity mutation | Read failure has request feedback/retry; foreign or missing resource does not disclose another owner |
| UF-04 Choose a task from the inventory | P2 · UC-03/04 | Inventory/Attention filters → selected Detail or an action opened from a card | User chooses a distinct movement action; current data updates after server confirmation | Stale/invalid writes surface conflict/validation feedback; no optimistic claim of persisted change |
| UF-05 Record consumption | All · UC-04 | Detail or card action → Use form → enter amount → confirm | Quantity/version update with one consume movement; action closes and current Detail/attention is refreshed | Stale version/invalid amount is rejected; uncertain command retries with original identity |
| UF-06 Record discard | All · UC-05 | Detail or card action → Discard form → enter amount/reason → confirm | Quantity/version update with discard movement; discard remains distinct from soft delete | Same validation/version/retry boundaries as consumption |
| UF-07 Reconcile a count | P3/P2 · UC-07 | Detail or card action → Recount form → enter actual amount and required reason → confirm | Changed value appends adjustment and updates quantity; equal value returns no-op without movement | Stale version or invalid value keeps user in recovery path; a changed draft is a new command after resolving conflict |
| UF-08 Correct entry metadata | P3/P2 · UC-06 | Selected Detail → Edit modal → update allowed metadata → save | PATCH updates metadata/version only, closes modal, remains on selected Detail, and shows toast; quantity/unit/history stay unchanged | Synthetic-401 browser observation: Auth foreground is reachable, same-owner name/location draft remains, immutable retry is available and applies metadata only; quantity observed unchanged at 500. One separate bounded lost-response discard retry was observed; broad browser acceptance remains unclaimed |
| UF-09 Remove or restore a mistaken record | P3 · UC-09/10 | Detail → delete confirmation → list; Trash shell view → restore confirmation → Inventory | Delete clears selection and returns to current list with toast; restore returns to Inventory with toast. Neither changes quantity or movement history | Cancel confirmation has no mutation; stale/error response remains recoverable through command feedback |
| UF-10 Adjust attention settings | All · UC-11 | Settings shell view → edit timezone/lead days → save | Successful preferences update stays on Settings with confirmation; new reads use current preferences/as-of date | Invalid lead days (outside 0–30) block save; version conflict requires current settings review |
| UF-11 Continue after session expiry | All · UC-00 | Pending create or submitted Edit/action receives 401 → Auth foreground → authenticate same owner → resume task | Add intent opens Add only after auth; an already-submitted command remains frozen and is retried explicitly; same-owner Edit draft remains available in bounded browser check | Cancel pending Add clears the intent. Changed owner clears selected/private pending state. One bounded lost-response discard retry was observed; broad recovery and timing claims remain out of scope |

The use-case layer names goals and rules; these flow paths describe current UI composition and response. `WF-05` is a legacy design anchor for two distinct surfaces, not one combined History/Trash page. All unexecuted or still-running checks remain outside the verified behavior claims.

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [06-navigation/navigation.md](../05-interaction-design/navigation.md)
- [05-use-cases-uml/use-cases.md](use-cases.md)
- [06-data-model/data-flows.md](../06-data-model/data-flows.md)

## Open questions

Chốt các quyết định liên quan trong decision ledger trước khi đổi contract hoặc triển khai.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](../11-traceability/README.md)
- [06-navigation/navigation.md](../05-interaction-design/navigation.md)
- [05-use-cases-uml/use-cases.md](use-cases.md)
- [06-data-model/data-flows.md](../06-data-model/data-flows.md)

## Verification criteria

Đối chiếu nguồn, ID và downstream links; acceptance runtime chỉ được ghi pass sau khi thực chạy.

## Current source alignment — 2026-10-13 [A]

Add/auth continuation and OCR review are described in the current [schema input/output guide](../06-data-model/schema-input-output.md) and [source reconciliation](../10-testing/schema-reconciliation-2026-10-13.md). Scan returns transient candidate data; a separate reviewed create command persists it. Same-owner recovery is required before resuming an interrupted command.
