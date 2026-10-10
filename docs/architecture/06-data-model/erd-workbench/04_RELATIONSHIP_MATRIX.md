# Logical relationships and enforcement

Candidate/review model, food namespace, 2026-10-10.

| Parent → child | Cardinality | Physical key | Rules/UC | Enforcement |
|---|---|---|---|---|
| users → food_entries | user 0..N; entry exactly 1 | NOT NULL user_id → users.id; RESTRICT | RULE-01/02, UC-01…11 | FK blocks orphan; principal scoping in repository; HTTP principal establishment pending |
| food_entries → stock_movements | entry 1..N **after create commits**; movement exactly 1 | NOT NULL entry_id → food_entries.id; RESTRICT | RULE-04/05/06/19, UC-01/04/05/07/08 | FK blocks orphan; unique generated initial key limits maximum one initial; transaction creates minimum one |
| users → api_requests | user 0..N; key exactly 1 owner | user_id FK + (user_id,idempotency_key) composite PK | RULE-18/19, every write | DB uniqueness serializes retries; service matches operation/target/hash and stores result before commit |

No direct FK from api_requests to an entry: operations also target preferences or create a new entry. Target identity is part of `operation` and canonical payload fingerprint. A FK alone is not authorization. No N:N relation is required in private inventory; no persona-specific roles.

Identity choice: a food entry is a user-declared quantity group with common unit/date/location/opening context (a practical batch). It is neither a catalog product nor a unique food name. Same name and date can occur repeatedly under the same owner.

DB checks validate single-row shapes. Ledger equality, unit invariance across commands, scoped reads and reservation completion are use-case invariants. Schema privileges prevent application UPDATE/DELETE on historical movements; privileged migration administrator remains able to repair data explicitly.
