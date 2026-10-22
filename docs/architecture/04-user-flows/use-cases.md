# DOC-UC — Actor-goal use case catalog

- Document ID: `DOC-UC`
- Status: **Review**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

12 use cases; không xem screen/endpoint là use case.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

### UC-00 — Continue with identity

Primary actor: authenticated inventory owner. UC-00 covers the unauthenticated visitor or session-expired owner who must authenticate before a protected action can continue. Supporting actor: local authentication boundary; no separate admin/household role is represented. Goal: Continue with identity.

- Requirement: FR-10; UI: WF-00/02/04.
- Trigger: Add tapped while no session, a private request returns 401, or an owner chooses login/register.
- Preconditions: No valid session; an Add intent or already-entered/immutable command may be pending. The normal Add gate runs before the form is opened.
- Main success flow: Present Auth first; authenticate; for a pending Add intent, open the Add form; for an existing submitted command, restore same-owner access and expose the retained command retry.
- Alternate/error flow: Cancel before Add opens clears pending Add intent; failed auth remains in Auth. A changed owner clears private selection/pending command state.
- Success guarantee: A valid principal exists; authentication alone does not create an entry.
- Failure guarantee: No protected write before valid authentication; submitted commands retain their immutable owner/payload/key only for same-owner recovery.
- Rules: Không password/token trong food DTO.

Related routes: current local auth contract in [authentication](../07-api/authentication.md). Related entities: verified identity + UI draft only. Related scenarios and flows: inverse references in graph/coverage; triggers/preconditions/postconditions retained above. Rules are defined only in canonical rule document.

### UC-01 — Record food entry

Primary actor: authenticated inventory owner. UC-00 covers the unauthenticated visitor or session-expired owner who must authenticate before a protected action can continue. Supporting actor: local authentication boundary; no separate admin/household role is represented. Goal: Record food entry.

- Requirement: FR-01; UI: WF-02.
- Trigger: User chọn Add rồi Save.
- Preconditions: Draft có name/quantity/unit.
- Main success flow: From the Add modal submit; validate DTO and resolve owner from session; commit entry, initial movement, and idempotency response atomically; return Entry. The modal closes, the current list stays visible, and a success toast appears.
- Alternate/error flow: Unknown or past date is allowed within date rules; 422 keeps form values; uncertain result retries with the same key/payload.
- Success guarantee: Entry and initial movement commit together or neither does; success does not automatically navigate to Detail.
- Failure guarantee: Mutations are all-or-nothing; failed reads do not write. Keep editable values where the relevant form owns them; do not imply a stale write committed.
- Rules: RULE-01…04/09…11/18/19/21.

Related routes: API-01. Related entities: ENT-01/02; movement actions/history also ENT-03; writes also ENT-04. Related scenarios and flows: inverse references in graph/coverage; triggers/preconditions/postconditions retained above. Rules are defined only in canonical rule document.

### UC-02 — Review own inventory

Primary actor: authenticated inventory owner. UC-00 covers the unauthenticated visitor or session-expired owner who must authenticate before a protected action can continue. Supporting actor: local authentication boundary; no separate admin/household role is represented. Goal: Review own inventory.

- Requirement: FR-02; UI: WF-01.
- Trigger: Mở inventory/search/filter.
- Preconditions: Principal valid.
- Main success flow: Validate filters/page; read owner-scoped rows; project DTO; return items+pagination.
- Alternate/error flow: Empty→empty state/Add CTA; network error→retry; foreign scope không được nhận.
- Success guarantee: Không mutate data.
- Failure guarantee: Mutations are all-or-nothing; failed reads do not write. Keep editable values where the relevant form owns them; do not imply a stale write committed.
- Rules: RULE-01/20/24.

Related routes: API-02. Related entities: ENT-01/02; movement actions/history also ENT-03; writes also ENT-04. Related scenarios and flows: inverse references in graph/coverage; triggers/preconditions/postconditions retained above. Rules are defined only in canonical rule document.

### UC-03 — Identify and understand attention

Primary actor: authenticated inventory owner. UC-00 covers the unauthenticated visitor or session-expired owner who must authenticate before a protected action can continue. Supporting actor: local authentication boundary; no separate admin/household role is represented. Goal: Identify and understand attention.

- Requirement: FR-03; UI: WF-01/03.
- Trigger: Mở attention hoặc detail.
- Preconditions: Clock/timezone/lead có giá trị.
- Main success flow: Read active owned entries; derive date state/reason; stable sort; show date/source/location/amount.
- Alternate/error flow: Unknown→nhóm riêng; depleted/deleted excluded; estimated→explain uncertainty.
- Success guarantee: User có thông tin chọn action; chưa mutate food.
- Failure guarantee: Mutations are all-or-nothing; failed reads do not write. Keep editable values where the relevant form owns them; do not imply a stale write committed.
- Rules: RULE-09…14/20.

Related routes: API-02, API-03. Related entities: ENT-01/02; movement actions/history also ENT-03; writes also ENT-04. Related scenarios and flows: inverse references in graph/coverage; triggers/preconditions/postconditions retained above. Rules are defined only in canonical rule document.

### UC-04 — Record consumption

Primary actor: authenticated inventory owner. UC-00 covers the unauthenticated visitor or session-expired owner who must authenticate before a protected action can continue. Supporting actor: local authentication boundary; no separate admin/household role is represented. Goal: Record consumption.

- Requirement: FR-04; UI: WF-04.
- Trigger: User confirm Use amount.
- Preconditions: Owned nondeleted entry với quantity>0; key/version.
- Main success flow: Idempotency lookup; lock owned entry; verify version/unit/amount; update quantity+version; insert consume movement; store response; commit.
- Alternate/error flow: Stale version/over amount→409; invalid amount→422; replay→saved response; all used→depleted.
- Success guarantee: Remaining đúng, 1 history event cho 1 command.
- Failure guarantee: Mutations are all-or-nothing; failed reads do not write. Keep editable values where the relevant form owns them; do not imply a stale write committed.
- Rules: RULE-03/05/17…19.

Related routes: API-05. Related entities: ENT-01/02; movement actions/history also ENT-03; writes also ENT-04. Related scenarios and flows: inverse references in graph/coverage; triggers/preconditions/postconditions retained above. Rules are defined only in canonical rule document.

### UC-05 — Record discard

Primary actor: authenticated inventory owner. UC-00 covers the unauthenticated visitor or session-expired owner who must authenticate before a protected action can continue. Supporting actor: local authentication boundary; no separate admin/household role is represented. Goal: Record discard.

- Requirement: FR-04; UI: WF-04.
- Trigger: User confirm Discard amount.
- Preconditions: Như UC-04.
- Main success flow: Như UC-04 nhưng movement kind=discard; optional reason.
- Alternate/error flow: Partial waste vẫn active; hết lượng depleted; deleted→404.
- Success guarantee: History waste riêng, không soft-delete record.
- Failure guarantee: Mutations are all-or-nothing; failed reads do not write. Keep editable values where the relevant form owns them; do not imply a stale write committed.
- Rules: RULE-05/15/16/18/19.

Related routes: API-05. Related entities: ENT-01/02; movement actions/history also ENT-03; writes also ENT-04. Related scenarios and flows: inverse references in graph/coverage; triggers/preconditions/postconditions retained above. Rules are defined only in canonical rule document.

### UC-06 — Correct entry metadata

Primary actor: authenticated inventory owner. UC-00 covers the unauthenticated visitor or session-expired owner who must authenticate before a protected action can continue. Supporting actor: local authentication boundary; no separate admin/household role is represented. Goal: Correct entry metadata.

- Requirement: FR-05; UI: WF-02.
- Trigger: Save edit name/location/date context.
- Preconditions: Owned nondeleted entry; version/key; patch không quantity/unit.
- Main success flow: Open Edit from selected Detail; submit allowed metadata only with expected version; validate merged state; update metadata/version; return refreshed Entry. On success the modal closes, selected Detail remains, and a toast appears. Quantity/unit and movement rows are unchanged.
- Alternate/error flow: Null reset date phải đổi certainty/source đồng bộ; empty patch→422; conflict→409; depleted metadata vẫn được sửa.
- Success guarantee: Quantity/ledger không đổi; attention updated.
- Failure guarantee: Mutations are all-or-nothing; failed reads do not write. Keep editable values where the relevant form owns them; do not imply a stale write committed.
- Rules: RULE-07…14/17…19.

Related routes: API-04. Related entities: ENT-01/02; movement actions/history also ENT-03; writes also ENT-04. Related scenarios and flows: inverse references in graph/coverage; triggers/preconditions/postconditions retained above. Rules are defined only in canonical rule document.

### UC-07 — Reconcile actual quantity

Primary actor: authenticated inventory owner. UC-00 covers the unauthenticated visitor or session-expired owner who must authenticate before a protected action can continue. Supporting actor: local authentication boundary; no separate admin/household role is represented. Goal: Reconcile actual quantity.

- Requirement: FR-06; UI: WF-04.
- Trigger: Confirm Recount actual_quantity+reason.
- Preconditions: Owned nondeleted entry; version/key; quantity>=0.
- Main success flow: Replay; lock+version; compare actual vs remaining; delta adjustment; update+ledger+result transaction.
- Alternate/error flow: Same amount→200 no-op; actual>0 từ depleted→active; 0→depleted; invalid/missing reason→422.
- Success guarantee: Digital amount đúng reported reality; correction traceable.
- Failure guarantee: Mutations are all-or-nothing; failed reads do not write. Keep editable values where the relevant form owns them; do not imply a stale write committed.
- Rules: RULE-03/06/16…19/23.

Related routes: API-06. Related entities: ENT-01/02; movement actions/history also ENT-03; writes also ENT-04. Related scenarios and flows: inverse references in graph/coverage; triggers/preconditions/postconditions retained above. Rules are defined only in canonical rule document.

### UC-08 — Review entry movement history

Primary actor: authenticated inventory owner. UC-00 covers the unauthenticated visitor or session-expired owner who must authenticate before a protected action can continue. Supporting actor: local authentication boundary; no separate admin/household role is represented. Goal: Review entry movement history.

- Requirement: FR-07; UI: WF-05.
- Trigger: Chọn History.
- Preconditions: Owned entry kể cả deleted nếu biết ID qua trash.
- Main success flow: Read owner-scoped entry+paginated movements stable by recorded_at,id; show before/after/kind/reason.
- Alternate/error flow: No events không hợp lệ với entry đã create; server invariant alert; foreign ID→404.
- Success guarantee: Read-only, không sửa lịch sử.
- Failure guarantee: Mutations are all-or-nothing; failed reads do not write. Keep editable values where the relevant form owns them; do not imply a stale write committed.
- Rules: RULE-04/23/24.

Related routes: API-07. Related entities: ENT-01/02; movement actions/history also ENT-03; writes also ENT-04. Related scenarios and flows: inverse references in graph/coverage; triggers/preconditions/postconditions retained above. Rules are defined only in canonical rule document.

### UC-09 — Remove erroneous record

Primary actor: authenticated inventory owner. UC-00 covers the unauthenticated visitor or session-expired owner who must authenticate before a protected action can continue. Supporting actor: local authentication boundary; no separate admin/household role is represented. Goal: Remove erroneous record.

- Requirement: FR-08; UI: WF-03/05.
- Trigger: Confirm Remove record.
- Preconditions: Owned entry, version/key.
- Main success flow: Replay; lock+version; set deleted_at/version; store result transaction.
- Alternate/error flow: Đã deleted với command mới→409; retry cùng key replay; cancel không change.
- Success guarantee: Selection clears and the current list is visible with confirmation; quantity/history remain unchanged.
- Failure guarantee: Mutations are all-or-nothing; failed reads do not write. Keep editable values where the relevant form owns them; do not imply a stale write committed.
- Rules: RULE-15/17…19.

Related routes: API-08, API-09. Related entities: ENT-01/02; movement actions/history also ENT-03; writes also ENT-04. Related scenarios and flows: inverse references in graph/coverage; triggers/preconditions/postconditions retained above. Rules are defined only in canonical rule document.

### UC-10 — Restore removed record

Primary actor: authenticated inventory owner. UC-00 covers the unauthenticated visitor or session-expired owner who must authenticate before a protected action can continue. Supporting actor: local authentication boundary; no separate admin/household role is represented. Goal: Restore removed record.

- Requirement: FR-08; UI: WF-05/03.
- Trigger: Chọn Restore trong trash.
- Preconditions: Owned deleted entry, version/key.
- Main success flow: From Trash, confirm Restore; replay/lock/version check; clear deleted_at, increment version, commit result; clear selection and navigate to Inventory with confirmation.
- Alternate/error flow: Chưa deleted với command mới→409; depleted restore vẫn depleted.
- Success guarantee: Record hiện lại đúng lifecycle; no stock movement.
- Failure guarantee: Mutations are all-or-nothing; failed reads do not write. Keep editable values where the relevant form owns them; do not imply a stale write committed.
- Rules: RULE-15…19.

Related routes: API-09, API-10. Related entities: ENT-01/02; movement actions/history also ENT-03; writes also ENT-04. Related scenarios and flows: inverse references in graph/coverage; triggers/preconditions/postconditions retained above. Rules are defined only in canonical rule document.

### UC-11 — Set attention preferences

Primary actor: authenticated inventory owner. UC-00 covers the unauthenticated visitor or session-expired owner who must authenticate before a protected action can continue. Supporting actor: local authentication boundary; no separate admin/household role is represented. Goal: Set attention preferences.

- Requirement: FR-09; UI: WF-06.
- Trigger: Save settings.
- Preconditions: Principal valid; user version/key.
- Main success flow: From Settings, validate timezone/lead days, lock user/version, update settings/version and result; remain on Settings with confirmation. Subsequent list reads derive using the saved preferences.
- Alternate/error flow: Timezone invalid/lead out-of-range→422; conflict→409; clock not controlled by body.
- Success guarantee: Không rewrite food rows; next read dùng setting mới.
- Failure guarantee: Mutations are all-or-nothing; failed reads do not write. Keep editable values where the relevant form owns them; do not imply a stale write committed.
- Rules: RULE-12/13/17…19.

Related routes: API-11, API-12. Related entities: ENT-01/02; movement actions/history also ENT-03; writes also ENT-04. Related scenarios and flows: inverse references in graph/coverage; triggers/preconditions/postconditions retained above. Rules are defined only in canonical rule document.

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [03-requirements-features/business-rules.md](../03-requirements-features/business-rules.md)
- [04-user-flows/scenarios.md](../04-user-flows/scenarios.md)
- [04-user-flows/user-flows.md](../04-user-flows/user-flows.md)
- [07-api/endpoints.md](../07-api/endpoints.md)

## Open questions

Chốt các quyết định liên quan trong decision ledger trước khi đổi contract hoặc triển khai.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](../11-traceability/README.md)
- [03-requirements-features/business-rules.md](../03-requirements-features/business-rules.md)
- [04-user-flows/scenarios.md](../04-user-flows/scenarios.md)
- [04-user-flows/user-flows.md](../04-user-flows/user-flows.md)
- [07-api/endpoints.md](../07-api/endpoints.md)

## Verification criteria

Đối chiếu nguồn, ID và downstream links; acceptance runtime chỉ được ghi pass sau khi thực chạy.

## Current implementation alignment — 2026-10-13 [A]

UC-01 capture uses the current create contract: Add is gated before the form opens, optional scan is reviewed in the create form, and a successful API create leaves the user on the same list with a toast. Edit is metadata-only and returns to the selected Detail content. Auth recovery and the bounded synthetic-401 browser observation are documented in [current flows](user-flows.md) and the [reconciliation report](../10-testing/schema-reconciliation-2026-10-13.md). The OCR sample table is a review-only proposal outside current use cases. See the [current operation map](../06-data-model/schema-input-output.md).
