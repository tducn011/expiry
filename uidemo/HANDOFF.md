# Expiry prototype handoff

## Scope and open assumptions

- The Google Docs/Sheets sources were not accessed; the prompt is the only product source used.
- Authentication and persistence are intentionally simulated in memory. `src/mockApi.ts` is the API boundary and idempotent command registry; the “continue with demo account” action is an auth integration seam, not real authentication.
- The fixed demo clock is `2026-10-08`, timezone `Asia/Ho_Chi_Minh`, lead time `2`.
- The UI uses Apple’s native system stack (`-apple-system`, `BlinkMacSystemFont`, `SF Pro Text/Display`) so Apple devices render real SF Pro without redistributing the proprietary font. Helvetica Neue/system-ui are the fallback on other platforms. The visual system uses the Apple light-gallery canvas, 28px cards, pill controls, tight display tracking and a single blue primary action.
- Create and metadata edit expose the same valid date certainty/source/label combinations; unknown dates clear date/source/label metadata, while estimated dates fix the source to user estimate.

## Design rules (enforced in `src/index.css` tokens)

1. **Spacing** on a 4px grid only: `--space-1..10` (4/8/12/16/20/24/32/40).
2. **Radius** has 4 levels: field 12, inner panel 18, card/modal 28, pill controls 980.
3. **Type scale** has 6 steps: caption 12 · footnote 14 · body 17 · title 21 · headline 28 · display (clamp). Headlines are semibold with negative tracking.
4. **Targets**: every control is at least 44px (`--control-h`).
5. **One primary action per surface**: blue pill, placed last on the right of the footer. Cancel/Back go on the left.
6. **Forms never scroll**: the modal is a flex column with a fixed header, stepper, `--form-body-h` body (`overflow: hidden`) and footer. Long forms are split into steps (Basics → Date & note); on mobile the sheet goes full-height (`100dvh`).
7. **Validation**: shown next to the field after the first submit attempt (`.field-error`) and replaces the hint; the draft is kept; Continue checks only the current step.
8. **Semantic colour**: red = past/destructive, amber = today/soon/estimated, blue = unknown/link, grey = later. Colour is always paired with text.
9. **Enum values are stored, Vietnamese labels are displayed**: UI maps ERD enums to labels and never persists display strings.

## Layout grid and component structure

- **Grid** (`components/layout/Grid.tsx`, `.layout-grid`): 4 cols / 16px gutter < 768px, 8 cols / 20px at 768px, 12 cols / 24px at 1024px+ (max content 1200px). Spans use Tailwind `col-span-*`, mobile-first. Standard splits: list 8 + rail 4 (Inventory, Attention, Trash, Settings); detail 7 + 5.
- **Shell**: sidebar ≥ 1024px (add button, 4 nav items, attention count); below that, a bottom tab bar + floating add.
- `src/components/ui/`: Icon, Button, Field (fixed message line so errors don't shift layout), Segmented, Badge, Card, EmptyState, Modal (+ `ModalActions`; `layout="form"` locks body height).
- `src/components/layout/`: Grid, PageHeader, Shell.
- `src/features/`: Welcome, Inventory (inventory + attention via `mode`), FoodCard, Detail, EntryForm (create + edit), MovementForm (consume/discard/recount via `mode`), History, Trash, Settings, StatusDialog (`Dialog` shared by confirm, auth gate and 8 recovery states).
- `src/lib/format.ts`: ERD enum → Vietnamese label maps and date/quantity formatting.

## Screen and feature coverage

| Feature | Screens / prototype path |
|---|---|
| F-01 Add | Welcome → add draft → auth continuation → UI-03 → detail |
| F-02 Inventory / attention | UI-01 search, location/lifecycle filters; UI-02 grouped priority list |
| F-03 Detail / explanation | UI-04 with date caveat, source/certainty, location and notes |
| F-04 Consume / discard | UI-05/UI-06 sheets, partial/all prefill, preview, distinct history kinds |
| F-05 Edit / recount | UI-07 recount with required reason/no-op; UI-08 metadata and read-only quantity |
| F-06 History | UI-09 read-only timeline with before/after/delta/reason |
| F-07 Trash / restore | UI-10 confirm, UI-11 trash, UI-12 restore |
| F-08 Preferences | UI-13 timezone, lead days and in-app-only explanation |
| F-09 Auth | UI-00 draft-first gate and continuation seam |

UI-00 through UI-13 are represented by the welcome, app views, detail view and modal/sheet variants. The Settings “prototype recovery” panel exposes version-conflict and uncertain-timeout states without pretending these are user settings.

## Navigation, ownership and invalidation

- `mockApi.ts` owns command keys, payload matching and replayed responses. `App` currently owns the in-memory query snapshot; production should replace it with an owner-scoped query cache.
- Forms own drafts. Cards render data and emit selection. Shell owns navigation only.
- List query state owns search/filter and resets pagination in the production adapter.
- A confirmed create/action/recount/edit/delete/restore invalidates detail, inventory, attention, movements and trash as applicable. Preference writes invalidate preferences, inventory and attention.
- Mutation coordinator generates one idempotency key per command; uncertain retries preserve key and payload, then refetch latest state.

## API coverage

| API | UI consumer | Success invalidation |
|---|---|---|
| POST `/food-entries` | EntryForm | inventory, attention, detail, history |
| GET `/food-entries` | Inventory, attention | query-keyed list |
| GET `/food-entries/{id}` | EntryDetail | detail |
| PATCH `/food-entries/{id}` | Edit | detail, lists |
| POST `/food-entries/{id}/movements` | consume/discard sheet | detail, lists, history |
| POST `/food-entries/{id}/recounts` | RecountForm | detail, lists, history |
| GET `/food-entries/{id}/movements` | HistoryList | paged history |
| DELETE `/food-entries/{id}` | ConfirmDialog | lists, detail, trash |
| GET `/trash/food-entries` | TrashList | paged trash |
| POST `/food-entries/{id}/restore` | restore confirm | trash, lists, detail, attention |
| GET `/me/preferences` | PreferencesForm | preferences |
| PATCH `/me/preferences` | PreferencesForm | preferences, inventory, attention |

## ERD field coverage

| Table / fields | UI or internal mapping |
|---|---|
| `users.id` | auth/cache owner scope; never input |
| `identity_subject` | auth adapter internal; never shown |
| `display_name` | account summary when supplied; no edit API |
| `timezone`, `attention_lead_days` | UI-13 PreferencesForm |
| user `version` | preferences conflict recovery; never input |
| user timestamps | system metadata only |
| `food_entries.id`, `user_id` | route/cache identity and auth owner; never editable |
| `name` | add/edit/card/detail/trash/search |
| `storage_location` | add/edit/card/detail/filter |
| `remaining_quantity` | card/detail/action previews; only movement/recount changes it |
| `unit` | create choice, read-only thereafter |
| `expiry_date` (ISO), `expiry_date_certainty` (exact/estimated/unknown), `expiry_date_source` (package_label/user_reentered/user_estimate/null), `expiry_date_label_type` (use_by/best_before/unknown/null) | add/edit/detail/card/attention explanation; valid combinations enforced at API boundary |
| `opened_on`, `note` | add/edit/detail; no inferred expiry |
| entry `version` | expected-version conflict recovery; never input |
| `deleted_at` | trash date; delete/restore mutation only |
| entry timestamps | system metadata if DTO provides them |
| `quantity_movements.id`, `entry_id` | history row identity/link |
| `kind` (initial/consume/discard/recount), `quantity_before`, `quantity_after`, `reason`, `recorded_at` | UI-09; delta derived as after-before |
| `api_requests` (`idempotency_key`, `operation`, `request_hash`, `response_status`, `response_body`) — stored by `mockApi.execute`; attention is derived, never a column | server/mutation coordinator only; represented by pending, replay and uncertain-result behavior, never CRUD UI |

## Validation and state matrix

| State | UX behavior |
|---|---|
| Initial/refetch loading | skeleton vs retained list with refetch indicator (production adapter seam) |
| Empty inventory/filter/trash | distinct copy and clear-filter/add recovery |
| Validation / 422 | preserve draft, field-adjacent errors; long form summary |
| 401/session expired | preserve draft, authenticate, verify owner, refetch before continuation |
| 404 | neutral not-found copy and return to inventory; trash uses trash DTO |
| 409 version conflict | refetch, compare current state with draft, no overwrite |
| 409 insufficient quantity | show latest remainder and require a corrected amount |
| Timeout / uncertain result | same command key and payload, check/replay, refetch |
| 429 | stop automatic retries and show retry guidance |
| Unexpected/read error | inline ErrorState with explicit retry |
| Success | announce only after confirmation, invalidate affected queries |

## Limitations

- No real backend, database, auth provider, network delay, pagination transport or persistence is integrated.
- Loading, read error, 404, 401/session expiry, 409 conflict/insufficient quantity, timeout and 429 states are selectable in Settings → “Thử trạng thái hệ thống”.
- The prototype command registry rejects a changed payload for an existing idempotency key and replays the stored response for an identical command. Network transport and server persistence remain production work.
- This is not usability-validated and should not be described as production-integrated.
