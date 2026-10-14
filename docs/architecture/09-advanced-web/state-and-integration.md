# DOC-FE-STATE — Frontend state, route and API integration

- Document ID: `DOC-FE-STATE`
- Status: **Review**
- Updated: 2026-10-13

## Purpose

Describe the current React state owners and the boundary between the UI, the HTTP client, API responses, and explicit in-memory demo mode. This records implementation behavior; it does not approve a future router, cache library, adapter layer, or production architecture.

## Evidence sources

- [Current App composition and state transitions](../../../apps/web/src/App.tsx)
- [Current API hook and owner-scoped hydration](../../../apps/web/src/hooks/useExpiry.ts)
- [API client, immutable commands, timeout and decoding](../../../apps/web/src/api/client.ts)
- [Modal behavior](../../../apps/web/src/components/ui/Modal.tsx)
- [Current navigation and surface map](../05-interaction-design/navigation.md)
- [Dated source and runtime reconciliation](../10-testing/schema-reconciliation-2026-10-13.md)

## Definitions and assumptions

**[A]** Normal mode uses `useExpiry` and `ApiClient` against `/api/v1`; in-memory `mockApi` is selected only when explicit demo mode is active (`demoMode` or `?demo`). **[A]** Query parameters are read once at `App` initialization to seed `view`, `id`, and `modal`; they are not a router or ongoing URL synchronization contract. **[D]** A route adapter/coordinator is a possible future design, not a current subsystem.

## Analysis

### State ownership

| Owner | Current state | Behavior and boundary |
|---|---|---|
| `App` | Shell view, filters, selected/action entry IDs and snapshot, modal kind, notice, pending Add/Create intent, Add owner ID, auth modal/mode, last known email, retry UI lock | Owns UI composition and workflow transitions. It keeps entry-form component state mounted behind foreground reauthentication so the form draft can remain available; its close/cancel handlers clear the related pending intent. |
| `EntryForm` / `MovementForm` / `AuthForm` / `Settings` | Field drafts, validation errors, step or form-local values | Component-local state. Form submits a payload or callback; it does not write SQL or own server persistence. Quantity/unit are excluded from metadata edit. |
| `useExpiry` | Session, checking/loading/busy/error, owner epoch, list/all-entry/trash/preferences/as-of/selected/history snapshots, pending immutable command and retry eligibility | Owns live HTTP-backed session and server-response snapshots. It hydrates list, all-entry summary, preferences, and (only while Trash is the current view) Trash data. Entry detail and movement history hydrate when an ID is selected. Epoch checks discard responses belonging to an earlier owner. |
| `ApiClient` | CSRF token in memory, request transport, timeout, DTO decoding and immutable `Command` encoding | Performs HTTP requests with cookies included and cache disabled. Unsafe requests carry CSRF when a session token is present. A command contains owner, method, path, serialized body, and one idempotency key reused by retry. |
| API / MySQL | Principal, persisted entries, preferences and movements | Server is authoritative for live inventory state and attention projections. The UI does not derive live attention from local dates; the demo path uses `attentionFor` locally. |
| `mockApi` | Demo-only in-memory entries, trash, preferences and movements | Used only under explicit demo mode. Its synchronous behavior is not evidence of persistence, auth, or network behavior. |

### Current interaction and data flow

In normal mode, UI callbacks in `App` call methods from `useExpiry`; the hook calls `ApiClient`; the API response hydrates hook-owned snapshots and `App` renders them. `App` filters list snapshots for presentation. Detail and history requests are keyed by selected entry ID. There is no separate feature-query adapter or mutation coordinator in the current source.

Add is gated before the create form opens. If session restoration is pending, `App` waits; if no session exists, it records `pendingAdd` and opens Auth. Successful same-owner authentication then opens the create form. The form keeps its own editable draft. In normal mode a successful create closes the form, leaves the current list view active, and shows a confirmation notice; the explicit demo path has different behavior and may select the created item.

List actions store an action entry ID and snapshot, then open the relevant existing modal. Metadata edit preserves quantity and unit as read-only; movement forms own the proposed consume/discard/recount values until confirmation. The server response causes `useExpiry` to advance its revision and rehydrate current snapshots. Replayed mutation results are followed by refresh rather than treated as proof that every cached view is current.

### Owner changes and recovery

`useExpiry` clears response snapshots when session identity changes and uses an epoch to ignore stale in-flight reads. On a confirmed new owner, it also clears pending command/retry state and selected ID. Logout clears session, pending command, selected ID, data snapshots, and CSRF state; `App` clears modal and Add continuation state. Settings mount with the currently hydrated preference snapshot; the dated parent runtime report records save as Tokyo/0, reload persistence, then logout/new-owner default VN/2. That is bounded runtime evidence, not proof of every storage or browser behavior.

A 401/403 clears the live session and snapshots. `App` presents Auth in the foreground. The bounded synthetic-401 Edit browser observation recorded in the reconciliation report showed the same-owner name/location draft preserved and the immutable retry reachable in the form; the metadata retry applied without changing the observed quantity (500). The separate lost-response discard case has also been observed in the dated report: the response was held after a real 201 commit, the UI entered `REQUEST_TIMEOUT`, and retry with the frozen command left one discard effect (400 → 350) and one corresponding history event. This evidence is bounded to those scenarios; it does not set a real-world timing SLA.

`ApiClient` uses a 15-second request timeout by default; `execute` retries an uncertain command once automatically with the same key/body, and the UI can offer a further explicit retry of that same frozen command. These are client behavior bounds, not a service-level objective. The scan service has its own separately configured Node-to-Python deadline.

Trash is requested when `view === "trash"`; leaving that view does not issue a background Trash request. Settings edits submit preference values to the API and the response/revision causes the data hook to rehydrate. There is no current CSV export, reset-all, or password-change action.

### Routing and proposed architecture

There is no installed router contract in `App`: `window.location.search` seeds selected UI state once. Back/forward route restoration, deep-link authorization, and route-driven dialog return state remain future work **[D]**. Any proposed query adapter, cross-feature cache, or mutation coordinator must preserve current owner clearing, Add-before-form gating, frozen-command retry, server-derived attention, and distinct demo behavior.

## Decisions and rationale

**[A]** This document replaces the old direct-mock-current-flow and hypothetical query-adapter/coordinator table with the actual `App` → `useExpiry` → `ApiClient` → API flow. **[D]** Keep future route/cache/coordinator work separate until a specific requirement authorizes it. Status remains Review.

## Dependencies

- [Current navigation](../05-interaction-design/navigation.md)
- [Current screen states](../05-interaction-design/screen-state-matrix.md)
- [Current API operation mapping](../06-data-model/schema-input-output.md)
- [Current auth behavior](../07-api/authentication.md)
- [Dated source and runtime evidence](../10-testing/schema-reconciliation-2026-10-13.md)

## Open questions

Whether a router, durable client cache, or cross-feature command coordinator is needed remains open and is not represented as an implemented feature. Accessibility, device/browser matrix, and broader user acceptance remain separate checks.

## Related documents

- [Architecture README](../README.md)
- [Current interaction navigation](../05-interaction-design/navigation.md)
- [Current screen state matrix](../05-interaction-design/screen-state-matrix.md)

## Verification criteria

Current ownership claims should match the named source files; runtime observations remain scoped to scenarios and evidence recorded in the dated reconciliation report. Documentation status does not grant product or production approval.
