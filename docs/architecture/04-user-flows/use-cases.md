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

Primary actor: inventory owner; UC-00 also supports unauthenticated draft-holder. Supporting actors: identity adapter for protected access; no approved admin/household role. Goal: Continue with identity.

- Requirement: FR-10; UI: WF-00/02/04.
- Trigger: Chạm private inventory hoặc lưu draft.
- Preconditions: Có draft/demo chưa persist.
- Main success flow: Giữ draft; xác thực qua auth adapter; resume task.
- Alternate/error flow: Cancel auth → giữ draft, không save; auth fail → retry.
- Success guarantee: Identity principal hợp lệ, chưa tự tạo food.
- Failure guarantee: không partial mutation; draft giữ ở UI; rollback trước commit. Với read không phát sinh write.
- Rules: Không password/token trong food DTO.

Related routes: Auth adapter contract pending ADR-003. Related entities: verified identity + UI draft only. Related scenarios and flows: inverse references in graph/coverage; triggers/preconditions/postconditions retained above. Rules are defined only in canonical rule document.

### UC-01 — Record food entry

Primary actor: inventory owner; UC-00 also supports unauthenticated draft-holder. Supporting actors: identity adapter for protected access; no approved admin/household role. Goal: Record food entry.

- Requirement: FR-01; UI: WF-02.
- Trigger: User chọn Add rồi Save.
- Preconditions: Draft có name/quantity/unit.
- Main success flow: Validate DTO; resolve owner; create entry+initial movement+request result một transaction; trả entry.
- Alternate/error flow: Date unknown hợp lệ; past date hợp lệ; 422 giữ draft; timeout retry key cũ.
- Success guarantee: Entry và initial movement hoặc không có cả hai.
- Failure guarantee: không partial mutation; draft giữ ở UI; rollback trước commit. Với read không phát sinh write.
- Rules: RULE-01…04/09…11/18/19/21.

Related routes: API-01. Related entities: ENT-01/02; movement actions/history also ENT-03; writes also ENT-04. Related scenarios and flows: inverse references in graph/coverage; triggers/preconditions/postconditions retained above. Rules are defined only in canonical rule document.

### UC-02 — Review own inventory

Primary actor: inventory owner; UC-00 also supports unauthenticated draft-holder. Supporting actors: identity adapter for protected access; no approved admin/household role. Goal: Review own inventory.

- Requirement: FR-02; UI: WF-01.
- Trigger: Mở inventory/search/filter.
- Preconditions: Principal valid.
- Main success flow: Validate filters/page; read owner-scoped rows; project DTO; return items+pagination.
- Alternate/error flow: Empty→empty state/Add CTA; network error→retry; foreign scope không được nhận.
- Success guarantee: Không mutate data.
- Failure guarantee: không partial mutation; draft giữ ở UI; rollback trước commit. Với read không phát sinh write.
- Rules: RULE-01/20/24.

Related routes: API-02. Related entities: ENT-01/02; movement actions/history also ENT-03; writes also ENT-04. Related scenarios and flows: inverse references in graph/coverage; triggers/preconditions/postconditions retained above. Rules are defined only in canonical rule document.

### UC-03 — Identify and understand attention

Primary actor: inventory owner; UC-00 also supports unauthenticated draft-holder. Supporting actors: identity adapter for protected access; no approved admin/household role. Goal: Identify and understand attention.

- Requirement: FR-03; UI: WF-01/03.
- Trigger: Mở attention hoặc detail.
- Preconditions: Clock/timezone/lead có giá trị.
- Main success flow: Read active owned entries; derive date state/reason; stable sort; show date/source/location/amount.
- Alternate/error flow: Unknown→nhóm riêng; depleted/deleted excluded; estimated→explain uncertainty.
- Success guarantee: User có thông tin chọn action; chưa mutate food.
- Failure guarantee: không partial mutation; draft giữ ở UI; rollback trước commit. Với read không phát sinh write.
- Rules: RULE-09…14/20.

Related routes: API-02, API-03. Related entities: ENT-01/02; movement actions/history also ENT-03; writes also ENT-04. Related scenarios and flows: inverse references in graph/coverage; triggers/preconditions/postconditions retained above. Rules are defined only in canonical rule document.

### UC-04 — Record consumption

Primary actor: inventory owner; UC-00 also supports unauthenticated draft-holder. Supporting actors: identity adapter for protected access; no approved admin/household role. Goal: Record consumption.

- Requirement: FR-04; UI: WF-04.
- Trigger: User confirm Use amount.
- Preconditions: Owned nondeleted entry với quantity>0; key/version.
- Main success flow: Idempotency lookup; lock owned entry; verify version/unit/amount; update quantity+version; insert consume movement; store response; commit.
- Alternate/error flow: Stale version/over amount→409; invalid amount→422; replay→saved response; all used→depleted.
- Success guarantee: Remaining đúng, 1 history event cho 1 command.
- Failure guarantee: không partial mutation; draft giữ ở UI; rollback trước commit. Với read không phát sinh write.
- Rules: RULE-03/05/17…19.

Related routes: API-05. Related entities: ENT-01/02; movement actions/history also ENT-03; writes also ENT-04. Related scenarios and flows: inverse references in graph/coverage; triggers/preconditions/postconditions retained above. Rules are defined only in canonical rule document.

### UC-05 — Record discard

Primary actor: inventory owner; UC-00 also supports unauthenticated draft-holder. Supporting actors: identity adapter for protected access; no approved admin/household role. Goal: Record discard.

- Requirement: FR-04; UI: WF-04.
- Trigger: User confirm Discard amount.
- Preconditions: Như UC-04.
- Main success flow: Như UC-04 nhưng movement kind=discard; optional reason.
- Alternate/error flow: Partial waste vẫn active; hết lượng depleted; deleted→404.
- Success guarantee: History waste riêng, không soft-delete record.
- Failure guarantee: không partial mutation; draft giữ ở UI; rollback trước commit. Với read không phát sinh write.
- Rules: RULE-05/15/16/18/19.

Related routes: API-05. Related entities: ENT-01/02; movement actions/history also ENT-03; writes also ENT-04. Related scenarios and flows: inverse references in graph/coverage; triggers/preconditions/postconditions retained above. Rules are defined only in canonical rule document.

### UC-06 — Correct entry metadata

Primary actor: inventory owner; UC-00 also supports unauthenticated draft-holder. Supporting actors: identity adapter for protected access; no approved admin/household role. Goal: Correct entry metadata.

- Requirement: FR-05; UI: WF-02.
- Trigger: Save edit name/location/date context.
- Preconditions: Owned nondeleted entry; version/key; patch không quantity/unit.
- Main success flow: Replay check; lock; validate patch + full merged object; update metadata/version; response attention mới.
- Alternate/error flow: Null reset date phải đổi certainty/source đồng bộ; empty patch→422; conflict→409; depleted metadata vẫn được sửa.
- Success guarantee: Quantity/ledger không đổi; attention updated.
- Failure guarantee: không partial mutation; draft giữ ở UI; rollback trước commit. Với read không phát sinh write.
- Rules: RULE-07…14/17…19.

Related routes: API-04. Related entities: ENT-01/02; movement actions/history also ENT-03; writes also ENT-04. Related scenarios and flows: inverse references in graph/coverage; triggers/preconditions/postconditions retained above. Rules are defined only in canonical rule document.

### UC-07 — Reconcile actual quantity

Primary actor: inventory owner; UC-00 also supports unauthenticated draft-holder. Supporting actors: identity adapter for protected access; no approved admin/household role. Goal: Reconcile actual quantity.

- Requirement: FR-06; UI: WF-04.
- Trigger: Confirm Recount actual_quantity+reason.
- Preconditions: Owned nondeleted entry; version/key; quantity>=0.
- Main success flow: Replay; lock+version; compare actual vs remaining; delta adjustment; update+ledger+result transaction.
- Alternate/error flow: Same amount→200 no-op; actual>0 từ depleted→active; 0→depleted; invalid/missing reason→422.
- Success guarantee: Digital amount đúng reported reality; correction traceable.
- Failure guarantee: không partial mutation; draft giữ ở UI; rollback trước commit. Với read không phát sinh write.
- Rules: RULE-03/06/16…19/23.

Related routes: API-06. Related entities: ENT-01/02; movement actions/history also ENT-03; writes also ENT-04. Related scenarios and flows: inverse references in graph/coverage; triggers/preconditions/postconditions retained above. Rules are defined only in canonical rule document.

### UC-08 — Review entry movement history

Primary actor: inventory owner; UC-00 also supports unauthenticated draft-holder. Supporting actors: identity adapter for protected access; no approved admin/household role. Goal: Review entry movement history.

- Requirement: FR-07; UI: WF-05.
- Trigger: Chọn History.
- Preconditions: Owned entry kể cả deleted nếu biết ID qua trash.
- Main success flow: Read owner-scoped entry+paginated movements stable by recorded_at,id; show before/after/kind/reason.
- Alternate/error flow: No events không hợp lệ với entry đã create; server invariant alert; foreign ID→404.
- Success guarantee: Read-only, không sửa lịch sử.
- Failure guarantee: không partial mutation; draft giữ ở UI; rollback trước commit. Với read không phát sinh write.
- Rules: RULE-04/23/24.

Related routes: API-07. Related entities: ENT-01/02; movement actions/history also ENT-03; writes also ENT-04. Related scenarios and flows: inverse references in graph/coverage; triggers/preconditions/postconditions retained above. Rules are defined only in canonical rule document.

### UC-09 — Remove erroneous record

Primary actor: inventory owner; UC-00 also supports unauthenticated draft-holder. Supporting actors: identity adapter for protected access; no approved admin/household role. Goal: Remove erroneous record.

- Requirement: FR-08; UI: WF-03/05.
- Trigger: Confirm Remove record.
- Preconditions: Owned entry, version/key.
- Main success flow: Replay; lock+version; set deleted_at/version; store result transaction.
- Alternate/error flow: Đã deleted với command mới→409; retry cùng key replay; cancel không change.
- Success guarantee: Không trong active list; quantity/history giữ nguyên.
- Failure guarantee: không partial mutation; draft giữ ở UI; rollback trước commit. Với read không phát sinh write.
- Rules: RULE-15/17…19.

Related routes: API-08, API-09. Related entities: ENT-01/02; movement actions/history also ENT-03; writes also ENT-04. Related scenarios and flows: inverse references in graph/coverage; triggers/preconditions/postconditions retained above. Rules are defined only in canonical rule document.

### UC-10 — Restore removed record

Primary actor: inventory owner; UC-00 also supports unauthenticated draft-holder. Supporting actors: identity adapter for protected access; no approved admin/household role. Goal: Restore removed record.

- Requirement: FR-08; UI: WF-05/03.
- Trigger: Chọn Restore trong trash.
- Preconditions: Owned deleted entry, version/key.
- Main success flow: Replay; lock+version; clear deleted_at; version++; compute derived attention; commit result.
- Alternate/error flow: Chưa deleted với command mới→409; depleted restore vẫn depleted.
- Success guarantee: Record hiện lại đúng lifecycle; no stock movement.
- Failure guarantee: không partial mutation; draft giữ ở UI; rollback trước commit. Với read không phát sinh write.
- Rules: RULE-15…19.

Related routes: API-09, API-10. Related entities: ENT-01/02; movement actions/history also ENT-03; writes also ENT-04. Related scenarios and flows: inverse references in graph/coverage; triggers/preconditions/postconditions retained above. Rules are defined only in canonical rule document.

### UC-11 — Set attention preferences

Primary actor: inventory owner; UC-00 also supports unauthenticated draft-holder. Supporting actors: identity adapter for protected access; no approved admin/household role. Goal: Set attention preferences.

- Requirement: FR-09; UI: WF-06.
- Trigger: Save settings.
- Preconditions: Principal valid; user version/key.
- Main success flow: Validate timezone IANA/lead integer; lock user/version; update settings/version+result transaction; refresh derived list.
- Alternate/error flow: Timezone invalid/lead out-of-range→422; conflict→409; clock not controlled by body.
- Success guarantee: Không rewrite food rows; next read dùng setting mới.
- Failure guarantee: không partial mutation; draft giữ ở UI; rollback trước commit. Với read không phát sinh write.
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
