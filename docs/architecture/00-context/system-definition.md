# DOC-DEFINITION — System definition and boundary

- Document ID: `DOC-DEFINITION`
- Status: **Review**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

Mô tả whole, purpose, objects, state owners và interaction; scope chọn riêng.

## Evidence sources

- [00-context/source-register.md](source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

[C/D] Expiry là hệ thống biểu diễn thực phẩm do người dùng quản lý thành digital records, ghi quantity/date/source/context, đánh giá attention từ record + time/settings và nhận hành động để đối soát số lượng.

User/source → FoodEntry → policy evaluation → Attention → user physical action → consume/discard/recount command → entry + movement + history → reviewed inventory.

Bên trong: record identity, persistence, attention explanation, commands, history và owner authorization. Bên ngoài: điều kiện vật lý/freshness, quyết định ăn/bỏ, thiết bị/clock provider và expert safety authority. Backend owns durable state through services; user owns physical confirmation. UI draft/cache is not durable authority. Supporting auth provider/store injects a verified principal; clock is an injected dependency.

Domain entities: User, FoodEntry, StockMovement, ApiRequest. Attention/lifecycle là projection. Household/catalog/OCR job không tự trở thành entity khi thiếu use case MVP.

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [00-context/scope.md](scope.md)
- [06-data-model/ownership.md](../06-data-model/ownership.md)
- [06-data-model/dictionary.md](../06-data-model/dictionary.md)

## Open questions

FoodEntry grain/date/source review còn mở; extension domains không đổi definition thành universal safety policy.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](../11-traceability/README.md)
- [00-context/scope.md](scope.md)
- [06-data-model/ownership.md](../06-data-model/ownership.md)
- [06-data-model/dictionary.md](../06-data-model/dictionary.md)

## Verification criteria

Đối chiếu nguồn, ID và downstream links; acceptance runtime chỉ được ghi pass sau khi thực chạy.
