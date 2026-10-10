# DOC-SCHEMA — Entity purpose, physical reference and migration plan

- Document ID: `DOC-SCHEMA`
- Status: **Review**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

Grain/use cases/owners justify every persistent table.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

| Entity | Một row đại diện | Identity | Vì sao cần từ flow |
|---|---|---|---|
| users | Một owner đã xác thực cùng settings | UUID, identity_subject unique | Mọi private UC + UC-11 |
| food_entries | Một nhóm lượng thực phẩm cùng điều kiện theo dõi | UUID; tên/date không unique | UC-01/02/03; không auto merge chỉ vì cùng tên |
| stock_movements | Một thay đổi quantity được commit | UUID | UC-04/05/07/08; create luôn initial event |
| api_requests | Một command write có key trong scope owner | Composite (user_id,idempotency_key) | Retry SC-08, toàn writes |

Không có products/catalog ở MVP: chưa có use case catalog, hai món tên giống không chắc cùng product. Không có household/membership theo DEC-01. Không có notifications/jobs/outbox theo DEC-02. Movement bắt buộc khi quantity thay đổi, không “optional history” gây hai đường ghi mâu thuẫn.

| Entity ID | Table | Meaning / why | Creation | Owner | Use cases |
|---|---|---|---|---|---|
| ENT-01 | users | Authenticated owner identity/settings | Verified identity bootstrap and UC-11 | Accounts service/auth adapter | UC-00, UC-11 |
| ENT-02 | food_entries | Quantity with common unit/date/location/opening context | UC-01 | Inventory service | UC-01…07, UC-09/10 |
| ENT-03 | stock_movements | One committed quantity change | Initial create or UC-04/05/07 | Inventory services, append-only public interface | UC-01, UC-04/05/07/08 |
| ENT-04 | api_requests | One write command replay scope per owner/key | All domain writes | Mutation executor in same transaction | All mutating UCs |

### Physical SQL reference

[Proposed PostgreSQL DDL](../../../Expiry_System_Design_2026-10-08/contracts/schema_reference_postgresql.sql); not a deployed migration. PK/FK/check/index clauses are the readable source. ORM decision ADR-002 remains open; no ORM models claimed installed.

### Migration plan [D]

1. Pin DB/ORM/runtime after transaction spike; introduce versioned migrations for users, entries, movements and command results.
2. Test fresh install and transaction invariants in disposable DB, not mock arrays.
3. Establish lock/version/key ordering in repositories; transaction connection passed explicitly to every participating write.
4. Verify FK restrictive delete, one-initial unique index, quantity/date consistency checks and owner query indexes. Owner auth and parent-has-initial invariants belong to service tests.
5. Backfill before tightening a constraint; forbid silent coercion of unknown dates or fractional piece.
6. Use expand/contract changes for compatibility; restore backup in staging before destructive migration. Down migration may lose data, so rollback can be forward fix or validated restore.
7. Deploy schema compatible with current and next app revisions, then application; record migration lock/version and before/after row invariants.

### ORM mapping acceptance

UUID/string IDs; DATE is calendar string; exact decimal domain/DTO strings; TIMESTAMPTZ ISO instant; enum mappings follow dictionary, not mock synonyms. Explicit relation scopes and transaction handles; no generic all-table CRUD. SQL CHECK may round numeric scale, so pre-insert validation remains necessary. Test ORM lock capability/generated SQL and replay concurrency before selection.

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [11-data-dictionary/dictionary.md](../06-data-model/dictionary.md)
- [06-data-model/erd.md](../06-data-model/erd.md)
- [adr/ADR-002-storage-orm.md](../adr/ADR-002-storage-orm.md)
- [10-testing/test-catalog.md](../10-testing/test-catalog.md)

## Open questions

Chốt các quyết định liên quan trong decision ledger trước khi đổi contract hoặc triển khai.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](../11-traceability/README.md)
- [06-data-model/dictionary.md](../06-data-model/dictionary.md)
- [06-data-model/erd.md](../06-data-model/erd.md)
- [adr/ADR-002-storage-orm.md](../adr/ADR-002-storage-orm.md)
- [10-testing/test-catalog.md](../10-testing/test-catalog.md)

## Verification criteria

Đối chiếu nguồn, ID và downstream links; acceptance runtime chỉ được ghi pass sau khi thực chạy.
