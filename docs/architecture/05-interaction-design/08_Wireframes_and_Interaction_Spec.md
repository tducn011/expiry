# DOC-WIREFRAMES — Current wireframe and interaction mapping

- Document ID: `DOC-WIREFRAMES`
- Status: **Review**
- Updated: 2026-10-13

The linked six-screen mobile image remains a low-fidelity historical design artifact. This current interaction mapping reconciles its task labels with the current React surface composition; it does not claim the image represents the implemented layout or final design.

## Purpose

Map the existing WF task concepts to current screens/modals and document the actual create, edit, action, auth, and feedback transitions.

## Evidence sources

- [Current navigation/surface map](navigation.md)
- [App composition and transition handlers](../../../apps/web/src/App.tsx)
- [Entry form fields, local draft, and scan assist](../../../apps/web/src/features/EntryForm.tsx)
- [Inventory, detail, movement, History, Trash, Settings components](../../../apps/web/src/features/Inventory.tsx)
- [Current API operation map](../06-data-model/schema-input-output.md)

## Definitions and assumptions

**[A]** WF identifiers below remain goal/design anchors in existing use cases; where one ID groups two actual surfaces, the table calls out the distinction. The app currently uses React state rather than a full route contract. **[D]** Proposed visual improvements remain review proposals and are not implementation evidence.

## Analysis

### Current surface map and primary interaction

| Existing task anchor | Current surface | Content and primary actions | Actual result/transition |
|---|---|---|---|
| WF-00 Welcome / identity | Welcome screen before shell; separate Auth modal | Start, skip, or explicit demo; account login/register when requested or required | Start marks onboarding then requests Add; real Add checks session and opens Auth before Add form; canceling auth returns to shell without opening Add |
| WF-01 Inventory / attention | Two modes of the same list component in shell | Attention summary, search/location/attention filters, lifecycle filter in Inventory mode, item action, Add | Item selection replaces list content with Detail inside shell; Add opens form only after auth gate |
| WF-02 Add / edit form | `EntryForm` modal in create or metadata-edit mode | Two steps: basic fields; date/opened/note fields. Scan assist is collapsed inside create mode only | Create success closes modal, remains on originating list, and displays confirmation toast; edit success closes modal and returns to selected Detail with toast |
| WF-03 Detail | Selected entry content inside shell | Current quantity, recorded date/attention context, location/opened/note, edit/delete/history and movement actions | Edit/date/movement/history/delete actions open their respective modal or confirmation surface |
| WF-04 Quantity action | `MovementForm` modal | Use/discard amount, or actual recount quantity plus correction reason | Success closes modal; quantity/version and movement history refresh; same-value recount records no movement |
| WF-05 History / Trash | Two separate surfaces: read-only History modal and Trash shell view | History shows events; Trash shows tombstoned entries and Restore action | History closes back to Detail. Trash restore confirms and updates list; the two surfaces are not one combined screen |
| WF-06 Settings | Settings shell view | Timezone, lead-days setting, account label, authenticated logout | Successful save stays on Settings with toast; current UI has no export/reset/password-change action |
| Auth recovery | Auth modal in foreground above a retained task form | Login/registration; reauthentication uses login credentials | Same-owner auth resumes access to the existing form; user explicitly retries an immutable pending command when offered |

### Auth-gated Add and create feedback

In real mode, Add is gated **before the create form opens**. If there is no session, the app records a pending Add intent and presents Auth. On successful authentication the Add form opens. Scan is an optional assist nested inside this form; applying a selected candidate updates editable draft values. Saving creates the entry and initial movement via the API. A successful response closes the modal and shows “Đã thêm thực phẩm vào kho” while leaving the current Inventory/Attention screen active; it does not navigate to Detail. In explicit demo mode, Add uses the in-memory adapter and is not evidence of server persistence.

### Edit and recovery feedback

Edit opens the same form component with quantity and unit read-only. A successful metadata PATCH closes the modal and leaves the selected Detail visible with “Đã cập nhật thông tin”. The bounded browser check in the reconciliation report used a synthetic 401: Auth was reachable in the foreground, the same-owner Edit draft name/location remained, immutable Retry was available inside the form, the metadata retry applied, and quantity remained 500. The bounded lost-response discard observation is recorded in the reconciliation report: an intercepted committed 201 led to `REQUEST_TIMEOUT`; immutable retry left one quantity effect and one discard event. This does not establish real-world timeout latency.

### Form mapping and interaction checks

| Surface/step | Editable data | Excluded/system-owned data | Validation or feedback |
|---|---|---|---|
| Add — basic | Name, initial quantity, unit, location; optional scan assist | Owner ID, entry ID, version, timestamps, attention/lifecycle | Name required; quantity positive finite decimal, max 999999999.999, ≤3 decimals; `piece` whole |
| Add — dates/details | Certainty, date, source, label kind, opened date, note | Persisted movement/audit fields | Unknown date is valid and maps to null/unknown/unspecified; blank location maps to unspecified at API boundary |
| Edit — metadata | Name, location, expiry date/certainty/source/label, opened date, note | Quantity, unit, owner, ID, movement history | Requires current expected version; stale version requires refresh/review |
| Movement action | Use/discard amount; recount actual quantity and reason | Entry owner and movement IDs, before/after and timestamps | User confirms the action; no silent “use all”; retry uses same frozen command |
| Scan assist | File selection; reviewed candidate selection and apply | Automatic stock creation, training labels | Scan result remains transient; person must review and submit the regular Add form |

The original mobile wireframe image has six screens, not all responsive/modal states. Use it for historical visual comparison only; current surface behavior is described above.

## Decisions and rationale

**[A]** The previous `Save → WF-03 Detail` and combined History/Trash mapping did not match current source and is replaced here. The current app remains on the list after create and keeps Detail selected after metadata edit. Authentication precedes Add in real mode. This remains a Review document, not Approved product design.

## Dependencies

- [Navigation and shell composition](navigation.md)
- [Screen recovery matrix](screen-state-matrix.md)
- [Form/API field mapping](../06-data-model/schema-input-output.md)
- [Schema reconciliation and browser evidence](../10-testing/schema-reconciliation-2026-10-13.md)

## Open questions

Responsive details and accessibility/device behavior need their own evidence. The bounded lost-response discard observation is recorded in the reconciliation report; broad browser end-to-end flows are not claimed passed.

## Related documents

- [User flows](../04-user-flows/user-flows.md)
- [Sequence models](sequences.md)
- [Source comparison notes](../10-testing/schema-reconciliation-2026-10-13.md)

## Verification criteria

Every current interaction statement should map to source handlers or specifically bounded runtime evidence. Static image comparison is not browser acceptance; no approval is inferred.
