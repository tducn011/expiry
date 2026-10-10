# DOC-FE-STATE — Frontend state, route and API integration

- Document ID: `DOC-FE-STATE`
- Status: **Review**
- Updated: 2026-10-10

## Purpose

Preserve owners and stop prototype assumptions leaking into real transport.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

| Owner | State | Mutation/data path | Boundary |
|---|---|---|---|
| App current | view/filters/selectedId/actionEntryId/modal/authenticated/revision/pendingCreate | Direct synchronous mock calls; useMemo refresh on revision; filters select the visible entries | Prototype query/auth/navigation and list-action context only |
| Form/action sheet | Draft + field errors + user-confirmed intent | Emit validated command to coordinator | No direct SQL/global durable state |
| Feature query adapter [D] | Owner-scoped list/detail/history/preferences | API responses + targeted invalidation | Cache keys include identity/query filters |
| Mutation coordinator [D] | Command payload/key/result uncertainty | One key per logical command; immutable timeout retry | Domain errors mapped from contract codes |
| Navigation adapter [D] | URL filters/page/entry/sheet return state | Back/forward/deep links preserve context | Current query-param-once demo is not router proof |

Confirmed create/action/recount invalidates lists, selected detail and relevant history; metadata edits invalidate attention/reasons; delete/restore also trash; preference change invalidates preferences and attention/local-date projections. Replayed result may be older than current state, so refetch. Logout/identity change clears previous owner cache and prevents resuming someone else’s draft.

Current list-action flow: Inventory/FoodCard emits an entry and action → App stores actionEntryId and opens the existing form → the form validates/confirms → App commit calls mockApi → revision refreshes snapshots and successful commit clears the modal entry. Opening or canceling a form does not create a movement. Date shortcuts select the date step; generic edit selects the basic metadata step. The list and its App-owned filters stay underneath the dialog. These are the current prototype owners, not new transport/auth guarantees.

Route inventory from navigation document is proposed. Public demo must not request real private data. Error/loading/empty/cancel behavior uses screen-state matrix; current Settings has account/preferences, while query-string demo states may initialize recovery dialogs. These presentation paths do not prove network recovery behavior. Generated API types and fixtures use shared OpenAPI DTOs; adapter cannot silently preserve mock enum names. Current bounded browser evidence and limitations are recorded in the [FINAL CHECK persona alignment](../03-requirements-features/final-check-persona-alignment.md) and [prototype handoff](../../../uidemo/HANDOFF.md).

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [06-navigation/navigation.md](../06-navigation/navigation.md)
- [06-navigation/screen-state-matrix.md](../06-navigation/screen-state-matrix.md)
- [07-api/protocol-and-compatibility.md](../07-api/protocol-and-compatibility.md)
- [07-api/authentication.md](../07-api/authentication.md)

## Open questions

Chốt các quyết định liên quan trong decision ledger trước khi đổi contract hoặc triển khai.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](../11-traceability/README.md)
- [06-navigation/navigation.md](../06-navigation/navigation.md)
- [06-navigation/screen-state-matrix.md](../06-navigation/screen-state-matrix.md)
- [07-api/protocol-and-compatibility.md](../07-api/protocol-and-compatibility.md)
- [07-api/authentication.md](../07-api/authentication.md)

## Verification criteria

Đối chiếu nguồn, ID và downstream links; acceptance runtime chỉ được ghi pass sau khi thực chạy.
