# DOC-UNSUPPORTED — Unsupported or deferred feature proposals

- Document ID: `DOC-UNSUPPORTED`
- Status: **Review**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

Không hợp thức hóa capability mới bằng persona demographic.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

| Proposal | Need hypothesis | Classification | Gate |
|---|---|---|---|
| OCR | Reduce manual entry | Research Required / Later | POC field accuracy + human correction time |
| Push/widgets | Attention without opening app | Later | OS delivery/permissions/control study |
| Recipes/food tips/AI | P2 next-step gap | Research Required | Trusted content + usefulness task research |
| Bulk actions | P3 maintenance | Research Required | Observe workload, undo/retry/partial failure |
| Shared household | P2 shared physical context | Later | Scope change, membership/ownership/conflict model |
| Device sensors | Unknown meaning of sensors bắt lỗi | Research Required | OQ-08 clarify before any permission/device API |
| Automatically extend expiry after freezing/opening | Context-sensitive dates | Rejected for current MVP | Authoritative policy and domain validation required |

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [04-technology-research/ocr-research.md](../04-technology-research/ocr-research.md)
- [22-feature-extension/extension-process.md](../22-feature-extension/extension-process.md)

## Open questions

Chốt các quyết định liên quan trong decision ledger trước khi đổi contract hoặc triển khai.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](../11-traceability/README.md)
- [04-technology-research/ocr-research.md](../04-technology-research/ocr-research.md)
- [22-feature-extension/extension-process.md](../22-feature-extension/extension-process.md)

## Verification criteria

Đối chiếu nguồn, ID và downstream links; acceptance runtime chỉ được ghi pass sau khi thực chạy.
