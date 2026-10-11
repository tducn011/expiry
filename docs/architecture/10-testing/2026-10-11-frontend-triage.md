# Frontend triage before HTTP integration — 11 October 2026

Evidence scope: read-only inspection of `apps/web` on `feature/ui` before frontend edits. Existing dirty architecture files were preserved. User subsequently authorized gated integration. Confidence: High for checked imports/ownership, not browser acceptance.

## 0. Executive decision

[A] A Figma Make export with a small application flow, implemented as a visual prototype. [D] Preserve the existing screen/layout primitives; introduce an HTTP boundary and asynchronous state hook. Do not rewrite the generated UI or switch frameworks. The scoped first patch is the data/auth boundary. User authorization covers integration after triage, not a visual redesign.

## 1. Runtime entry

[A] `index.html` → `src/main.tsx` → `src/App.tsx`. Commands: `rg --files apps/web`, numbered source reads, `python3 /home/pro/.codex/skills/figma-make-triage/scripts/triage_figma_export.py --root apps/web`. App imports the mock singleton directly. Vite has explicit Figma development plugins and an existing `/api` proxy.

## 2. Route map

[A] App-state navigation: welcome/start, attention, inventory, detail, history, trash, settings, and form/status/auth modals. `view`, selected ID and modal state own navigation; there is no browser-router library. Query parameters expose prototype states. Preserve back/detail and modal flows.

## 3. Reachable files

[A] Entry/App; layout Grid/PageHeader/Shell; UI Badge/Button/Card/DatePicker/EmptyState/Field/Icon/Modal/ScrollbarAutohide/Segmented/Select; features Detail/EntryForm/FoodCard/History/Inventory/MovementForm/Settings/StatusDialog/Trash/Welcome; lib/format; mockApi. These are the deterministic import graph reported by the triage script, with manual App/main verification.

## 4. Non-runtime/scaffold candidates

[A] `vite-env.d.ts` is a compiler declaration, not executable scaffold. No deletions or quarantine moves are justified. Figma Vite plugins are development/build tooling, outside the requested data integration.

## 5. shadcn/Radix

[A] No installed/imported Radix or shadcn package was found. The script's heuristic `used` result counts imports from local `components/ui`; manual source/package inspection corrects that classification. Preserve these custom primitives.

## 6. Dependencies

[A] React and ReactDOM are runtime dependencies and used by reachable code. Vite/TypeScript/Tailwind/React plugin/formatter are declared tooling. No external state manager, HTTP SDK or auth-provider package is required merely to define state ownership. No dependency cleanup is in scope.

## 7. Largest components

[A] DatePicker691 lines (high, keyboard/date UI), mockApi593 (high, demo domain records), App415 (high, orchestration), EntryForm369/Inventory368/Select354 (medium). Leave DatePicker/Select geometry and accessibility implementation intact. Extract integration concerns rather than deep visual refactoring.

## 8. Mixed responsibilities

[A] App owns navigation, modal context, filters, draft/auth simulation, mock reads/mutations and notices. MockApi owns demo records/ledger/replay and fixed clock. EntryForm owns input draft/date steps; MovementForm owns quantity input. [D] Move real network/session orchestration to a dedicated hook/client; keep generic UI components free of HTTP calls.

## 9. Hardcoded content

[A] Vietnamese product copy belongs to the existing UI and is preserved. Demo identity, seed records, `DEMO_DATE=2026-10-08`, direct `attentionFor` and a demo inventory eyebrow are scenario data, not production policy. Real records must use backend evaluation time/attention; explicit demo mode remains isolated and must never be an HTTP-failure fallback. Icon path strings are assets, not marketing/sample content.

## 10. Test readiness

[A] Existing web scripts are build/dev/preview/format; no frontend tests found at triage. [D] Add focused client mapping/retry/session tests without a new test framework, run typecheck/build, then verify browser auth/persistence/recovery using isolated test data. Builds and unit tests do not prove deployed/device behavior.

## 11. Classification

[A/C] The script classifies visual prototype. Manual topology shows mini-app navigation and forms whose data/auth are simulated. Strategy: preserve the app's core flows and replace its data boundary. Confidence High for ownership, Medium for untested runtime.

## 12. Risks

[A] High: mock schema vocabulary/decimal/IDs differ from public API; synchronous reads/mutations; caller identity simulation; async stale-owner cache/draft handling. Medium: fixed time, simulated recovery buttons. [D] Use explicit DTO mapping, server-owned attention, trusted session, generation/owner checks and same-key retry; browser-check actual recovery.

## 13. Safe order

1. Shared UI types/pure draft normalization, with explicit demo isolation.
2. Cookie-auth HTTP client, canonical DTO mapping and async state.
3. Integrate reads then writes/history/trash, preserving screen contracts.
4. Scan candidates → review/edit → explicit save.
5. Typecheck/build/focused tests and runtime verification.

## 14. Gate before frontend edits

[A] User authorized audit followed by gated integration and chose Node-managed email/password/sessions. Root requested and received approval for concrete additive auth migration002. [D] Mode: scoped implementation. Touch App/data boundary, dependent type imports, real date labels and necessary auth/scan form surfaces. Preserve CSS/layout/primitives/form-detail/back flows, Vietnamese language, core API/schema rules and explicit demo experience. Validate with focused tests, TypeScript, build and browser checks. No branches/commits/deployments are authorized.
