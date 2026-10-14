# DOC-SCREEN-STATES — Current surface and recovery-state matrix

- Document ID: `DOC-SCREEN-STATES`
- Status: **Review**
- Updated: 2026-10-13

## Purpose

Describe current UI state owners, observable feedback, and the recovery behavior supported by source and bounded browser evidence.

## Evidence sources

- [App state and modal composition](../../../apps/web/src/App.tsx)
- [Entry form draft and scan mapping](../../../apps/web/src/features/EntryForm.tsx)
- [API/query recovery hook](../../../apps/web/src/hooks/useExpiry.ts)
- [HTTP command/retry adapter](../../../apps/web/src/api/client.ts)
- [Dated browser and source reconciliation](../10-testing/schema-reconciliation-2026-10-13.md)

## Definitions and assumptions

**[A]** `App` owns selected entry, current shell view, active modal, pending Add/create intent, and auth foreground state. Each form component owns editable local draft fields. The `useExpiry` hook retains the immutable submitted command; `ApiClient` supplies its stable idempotency key for retry. **[A]** Browser observations in this document are bounded to the synthetic-401 Edit and lost-response discard scenarios recorded in the reconciliation report, not full-flow acceptance.

## Analysis

### Current states and recovery

| State/event | Current owner and user-visible effect | Current recovery |
|---|---|---|
| Session bootstrap | `useExpiry` checks/restores session before private reads; `App` shows a session-checking screen while pending | Continue to shell when check resolves; explicit demo switch is separate demo data |
| Add while authenticated | `App` opens `EntryForm` modal; local fields live in the form component | Cancel closes Add and clears pending Add/create state |
| Add while unauthenticated | `App` opens Auth modal before creating the Add form, recording pending Add intent | Cancel clears intent; successful auth for same resulting owner opens Add form |
| Create submitted without a session | `App` stores the submitted create payload and opens Auth; the form owns the editable draft | Same-owner authentication resumes the pending payload; a different owner clears pending create, modal, selection, and action context |
| Scan loading/error/review | `ScanForm` owns selected file and transient result; `EntryForm` owns mapped draft values | Review candidates, apply selected values to form, then submit explicit create; ambiguous/error state is not persisted |
| 422 validation | Form keeps field values; field checks run before mutation; server errors display through request feedback | Correct values and submit as a new command if payload changes |
| 401 on existing Edit command | Auth foreground covers the still-mounted Edit form; UI is re-enabled after successful same-owner login | Bounded browser observation: edit draft name/location remained, immutable Retry was reachable, and retry changed metadata while quantity stayed 500 |
| 401 with different identity | `App` sees changed owner and clears selected entry/action/pending create state | Start from the new owner’s current private query; do not replay old-owner command |
| 404 on selected entry | Query/API boundary cannot resolve owned entry; neutral missing state | Return to list and refresh; do not disclose foreign ownership |
| 409 stale version | Command fails without applying stale write; server response is surfaced | Refetch current entry, compare current data with draft, then user explicitly submits a new command if desired |
| Network result uncertain | `useExpiry` retains the immutable command; `ApiClient.execute` retries one uncertain result once automatically using the same key/body, then the UI can offer explicit retry | Retry repeats the frozen command identity; confirmed results advance the hook revision and rehydrate snapshots. One bounded lost-response discard recovery is recorded in the reconciliation report; it does not establish a general latency guarantee |
| Successful create | Create form closes; current inventory/attention view stays visible and success toast appears | Refresh/query invalidation displays the created entry; no automatic detail navigation |
| Successful metadata edit | Edit modal closes; selected detail content remains and success toast appears | Refresh current entry and derived attention; quantity/unit are unchanged |
| Successful movement/recount | Action form closes and result toast/current state is refreshed | Movement appears in history; same-value recount has no new movement |
| Successful delete/restore | Confirmation closes; current list/trash query updates | Tombstone controls visibility; neither operation changes quantity history |
| Read-only History | `History` modal renders movements only | Close returns to selected detail; there are no event edit controls |

### Interaction constraints

- Entry card must expose quantity/unit and attention reason in text, not color alone.
- Keep the copy “Theo ngày bạn đã ghi, không phải đánh giá an toàn.” Date certainty and label kind are context, not a safety guarantee.
- Use/discard commands require a chosen positive amount; they do not silently default to the entire stock. Recount accepts the reported actual quantity and a nonblank correction reason.
- Metadata edit does not expose editable quantity or unit. Those change through create or movement/recount commands.
- Soft delete moves a record to Trash; it does not claim the food was consumed or discarded. Restore is a separate command.
- A command retry repeats its immutable request identity; changing the draft requires a new command/key after resolving any conflict.

## Decisions and rationale

**[A]** The current matrix reflects state owned by `App`, form components, `useExpiry`, and `ApiClient`, plus bounded browser observations for same-owner 401 Edit recovery and lost-response discard retry. These cases do not establish all-flow browser acceptance.

## Dependencies

- [Current navigation map](navigation.md)
- [User-flow analysis](../04-user-flows/user-flows.md)
- [Testing catalog](../10-testing/test-catalog.md)
- [Reconciliation evidence](../10-testing/schema-reconciliation-2026-10-13.md)

## Open questions

Broad browser flows, accessibility/device behavior, and user acceptance remain unverified unless separately recorded. The bounded discard retry observation does not establish a general timeout latency.

## Related documents

- [Wireframe interaction spec](08_Wireframes_and_Interaction_Spec.md)
- [Current sequence models](sequences.md)
- [Auth/session contract](../07-api/authentication.md)

## Verification criteria

For each claimed state, identify a source owner or exact bounded runtime evidence. Keep the observed recovery cases separate from full browser acceptance.
