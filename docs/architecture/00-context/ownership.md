# DOC-OWNERS — Data, state and lifecycle ownership

- Document ID: `DOC-OWNERS`
- Status: **Review**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

Name who validates, mutates, persists and returns each state.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

| State/lifecycle | Owner | Ai mutate | Dependencies |
|---|---|---|---|
| Durable current quantity | Database row thông qua use-case service | Create/RecordMovement/Recount | Transaction + domain rules |
| Movement history | Database immutable qua public API | Services append | Same transaction với current amount |
| Attention state | AttentionPolicy backend | Không persist; compute theo clock/settings | Entry metadata + owner timezone |
| Form/action draft | Form hoặc ActionSheet | User input/form reducer | DTO validation for UX |
| List/detail remote data | Feature query cache (nếu FE dùng cache) | API response + invalidation | Contract, auth identity |
| Search/filter | Page/URL | User/navigation | Serialized query params |
| Identity/session | Auth adapter/provider | Auth flow | Chưa chốt implementation |
| In-flight command/key | Feature mutation coordinator | User start/retry | Giữ key qua retry; command mới key mới |
| Startup wiring | Composition root | Server boot | Inject repo, tx, clock, auth |

Không có component/controller nào “control mọi thứ”. App/root chỉ wiring/navigation. Service sở hữu transaction use case; repo sở hữu query; domain policy sở hữu rule; DB giữ integrity. Cache không là authority nghiệp vụ.

### Lifecycle matrix

| State | Create/update source | Visibility/end | Persistence / retention |
|---|---|---|---|
| FoodEntry | Create + metadata/quantity services | Independent deleted_at vs remaining=0 | Durable owner record; retention decision open |
| StockMovement | Append initial/consume/discard/adjustment in command transaction | No public edit/delete | History retained with entry; access owner-scoped |
| ApiRequest | Reserve key + commit response with domain write | Replay before version check | Private command snapshot; proposed no automatic prune, retention risk review |
| Attention | Read with injected clock/timezone/lead | Recompute after command/settings/time | Derived, not column |
| Form draft | User input, owner-bound auth continuation | Discard/cancel/success per UI contract | UI memory; no server record before confirm |
| OCR candidate | Future processing adapter only if approved | Reject/correct/confirm/cleanup | Transient; no direct domain write |

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [11-data-dictionary/dictionary.md](../06-data-model/dictionary.md)
- [08-architecture/components.md](../08-architecture/components.md)
- [07-api/authentication.md](../07-api/authentication.md)

## Open questions

Chốt các quyết định liên quan trong decision ledger trước khi đổi contract hoặc triển khai.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](../11-traceability/README.md)
- [06-data-model/dictionary.md](../06-data-model/dictionary.md)
- [08-architecture/components.md](../08-architecture/components.md)
- [07-api/authentication.md](../07-api/authentication.md)

## Verification criteria

Đối chiếu nguồn, ID và downstream links; acceptance runtime chỉ được ghi pass sau khi thực chạy.
