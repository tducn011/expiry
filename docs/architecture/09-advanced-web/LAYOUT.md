# DOC-UI-LAYOUT — Canonical observed UI layout and design tokens

- Document ID: `DOC-UI-LAYOUT`
- Status: **Review**
- Updated: 2026-10-10

## Purpose

UI-specific layout specification grounded in CSS; project map stays root LAYOUT.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)
- [00-context/tmb-skills.md](../00-context/tmb-skills.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

[A] Runtime declaration: React 19 range, TypeScript 5.7 range, Vite 8 range, Tailwind v4 range from package.json; installed resolution not validated. Root map follows verified TMB layout-init conventions; no Figma-source parity claimed.

| CSS variable | Observed value |
|---|---|
| --ink | #1a1a1e |
| --ink-2 | #2c2c30 |
| --muted | #6b6b73 |
| --canvas | #f2f2f7 |
| --surface | #ffffff |
| --fill | #e5e5ea |
| --fill-2 | #d1d1d6 |
| --line | #c6c6cb |
| --line-2 | #e0e0e5 |
| --danger | #d92d20 |
| --danger-bg | #fff0f0 |
| --danger-sub | rgba(217,45,32,0.10) |
| --warn | #b54708 |
| --warn-bg | #fffbf0 |
| --warn-sub | rgba(181,71,8,0.10) |
| --ok | #087443 |
| --ok-bg | #f0faf5 |
| --neutral | #3054b4 |
| --neutral-bg | #f0f4ff |
| --accent | #0a6dd6 |
| --accent-hover | #0860be |
| --link | #0a6dd6 |
| --sp-1 | 4px |
| --sp-2 | 8px |
| --sp-3 | 12px |
| --sp-4 | 16px |
| --sp-5 | 20px |
| --sp-6 | 24px |
| --sp-7 | 28px |
| --sp-8 | 32px |
| --sp-10 | 40px |
| --sp-12 | 48px |
| --r-sm | 8px |
| --r-md | 12px |
| --r-lg | 16px |
| --r-xl | 20px |
| --r-card | 16px |
| --r-pill | 999px |
| --t-xs | 11px |
| --t-sm | 13px |
| --t-base | 15px |
| --t-md | 17px |
| --t-lg | 22px |
| --t-xl | clamp(24px, 3vw, 34px) |
| --control-h | 44px |
| --sidebar-w | 220px |
| --content-max | 1100px |
| --form-body-h | 340px |
| --grid-cols | 4 |
| --gutter | 16px |
| --margin | 16px |
| --grid-cols | 8 |
| --gutter | 20px |
| --margin | 28px |
| --grid-cols | 12 |
| --gutter | 24px |
| --margin | 40px |

Breakpoints: CSS 768px→8 columns/20px gutters; 1024px→12 columns/24px gutters; default4 columns/16px. Shell source owns desktop sidebar and mobile dock, with explicit Add action. CSS is current style authority; the current handoff agrees with r-card16/content-max1100. On narrow screens the urgency controls use a 2-column grid; the inventory later control (“Chưa đến ngày theo dõi”) spans both columns. Form bodies use min-height:0 and overflow-y:auto, retaining the header/footer while long content scrolls; desktop wide form bodies keep the 340px limit. The [persona alignment evidence](../03-requirements-features/final-check-persona-alignment.md) records the tested viewport bounds and date-form limitation.

Component inventory:

- `uidemo/src/components/layout/Grid.tsx`
- `uidemo/src/components/layout/PageHeader.tsx`
- `uidemo/src/components/layout/Shell.tsx`
- `uidemo/src/components/ui/Badge.tsx`
- `uidemo/src/components/ui/Button.tsx`
- `uidemo/src/components/ui/Card.tsx`
- `uidemo/src/components/ui/EmptyState.tsx`
- `uidemo/src/components/ui/Field.tsx`
- `uidemo/src/components/ui/Icon.tsx`
- `uidemo/src/components/ui/Modal.tsx`
- `uidemo/src/components/ui/Segmented.tsx`
- `uidemo/src/features/Detail.tsx`
- `uidemo/src/features/EntryForm.tsx`
- `uidemo/src/features/FoodCard.tsx`
- `uidemo/src/features/History.tsx`
- `uidemo/src/features/Inventory.tsx`
- `uidemo/src/features/MovementForm.tsx`
- `uidemo/src/features/Settings.tsx`
- `uidemo/src/features/StatusDialog.tsx`
- `uidemo/src/features/Trash.tsx`
- `uidemo/src/features/Welcome.tsx`

Reusable presentation: Button, Field, Badge, Modal, Card, Segmented, EmptyState, Icon, Grid, PageHeader. Feature-owned forms/pages: EntryForm, MovementForm, Inventory, Detail, History, Trash, Settings, Welcome and recovery dialogs. Similar markup does not alone justify abstraction. Icons use existing component assets; use labels/semantics consistently.

[ D ] Consistency acceptance: tokens used through shared CSS; urgency has text plus color; focus/trap/keyboard/accessible labels/error relationships tested; amount/date/source scan order agrees with UX tasks. Touch target observed control height44px is code evidence, not proven accessibility conformance. New Figma decisions must be compared to code before changing tokens.

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [06-navigation/navigation.md](../06-navigation/navigation.md)
- [09-advanced-web/state-and-integration.md](state-and-integration.md)
- [10-testing/research-validation.md](../10-testing/research-validation.md)

## Open questions

Exact Figma node/source absent; verify all overflow/mobile/keyboard behavior during UI runtime test rather than assuming CSS suffices.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](../11-traceability/README.md)
- [06-navigation/navigation.md](../06-navigation/navigation.md)
- [09-advanced-web/state-and-integration.md](state-and-integration.md)
- [10-testing/research-validation.md](../10-testing/research-validation.md)

## Verification criteria

Đối chiếu nguồn, ID và downstream links; acceptance runtime chỉ được ghi pass sau khi thực chạy.
