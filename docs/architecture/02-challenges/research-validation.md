# DOC-USER-VALIDATION — Usability and evidence validation plan

- Document ID: `DOC-USER-VALIDATION`
- Status: **Review**
- Updated: 2026-10-10

## Purpose

Validation metrics separate from system definition/scope.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

Task study: capture known/unknown date, review attention, use partial amount, discard/recount, edit metadata, remove/restore and session interruption. Recruit by mechanisms in live personas, report participants/sample/denominators and consent.

| Cơ chế persona cần xác nhận | Tác vụ validation đề xuất | Chỉ số ghi nhận | Nhu cầu / thiết kế food liên quan |
|---|---|---|---|
| P1: thực phẩm mất khỏi sự chú ý sau khi cất | Ghi nhận thực phẩm với dữ liệu tối thiểu; sau đó tìm lại món đang có và món cần chú ý | Hoàn thành; món bị bỏ sót; thời gian; số thao tác; trợ giúp | NEED-01; FR-01, FR-02, FR-03 |
| P2: kế hoạch bữa ăn thay đổi | Khi bữa ăn thay đổi, xem món đang có, giải thích lý do ưu tiên và chọn kiểm tra hoặc hành động phù hợp | Quyết định có lý do; hiểu dữ liệu chưa biết; việc chưa hoàn thành và nguyên nhân; thời gian/thao tác | NEED-02; FR-02, FR-03, FR-04, FR-05 |
| P3: công cập nhật làm hồ sơ lệch thực tế | Ghi dùng một phần hoặc loại bỏ, kiểm tra kết quả; đếm lại và sửa số lượng khi phát hiện chênh lệch | Lỗi số lượng; công sửa; thời gian/thao tác; đối chiếu thực tế; phân biệt correction/use/discard | NEED-03; FR-04, FR-06, FR-07, FR-08 |

Các tác vụ trên là tình huống thử nghiệm đề xuất, chưa là quan sát đã diễn ra. Ghi rõ cách tuyển người theo cơ chế hành vi, mức phù hợp với tác vụ, dữ liệu ban đầu, điều kiện thử và mẫu số cho mỗi kết quả. Không yêu cầu người dùng chọn một persona trong ứng dụng. Ngưỡng nghiệm thu cần thống nhất trước khi thu thập dữ liệu; không tự thêm mục tiêu số chạm hoặc thời gian từ bản demo.

These tasks align with current FINAL CHECK::SC-01…03 and section 13.4; see the [namespaced crosswalk](../03-requirements-features/final-check-persona-alignment.md). A technical runtime check records whether a command/UI path behaved as specified; a user task study records whether the person understood and completed the intended decision. Waste/cost and long-term maintenance outcomes need separate real-world measurement.

Measure completion/error/correction, median and distribution of task time, tap count, stale-record audit against physical food, decision explanation and relevant next action. Capture and state accuracy precede notification/action/outcome conclusions. No claimed waste reduction/savings from prototype/demo data.

Baseline manual path first; measure OCR correction cost only after food-image spike. P2 priority/detail may help decision but does not prove recipe/meal-plan need or resolve all changed-plan obstacles. Report failed and incomplete tasks. Thresholds and study plan must be agreed before collection; old 40%/80% goals remain unvalidated decision proposals.

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [01-personas/persona-evidence-gaps.md](../01-personas/persona-evidence-gaps.md)
- [10-testing/test-catalog.md](test-catalog.md)
- [03-requirements-features/nonfunctional-requirements.md](../03-requirements-features/nonfunctional-requirements.md)

## Open questions

Chốt các quyết định liên quan trong decision ledger trước khi đổi contract hoặc triển khai.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](../11-traceability/README.md)
- [01-personas/persona-evidence-gaps.md](../01-personas/persona-evidence-gaps.md)
- [10-testing/test-catalog.md](test-catalog.md)
- [03-requirements-features/nonfunctional-requirements.md](../03-requirements-features/nonfunctional-requirements.md)

## Verification criteria

Đối chiếu nguồn, ID và downstream links; acceptance runtime chỉ được ghi pass sau khi thực chạy.
