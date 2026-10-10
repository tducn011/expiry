# DOC-P01 — P1 — Phạm Hoàng An

- Document ID: `DOC-P01`
- Status: **Review**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

Khôi phục persona gốc; phân biệt nội dung card và inference.

## Evidence sources

- [00-context/source-register.md](../00-context/source-register.md)
- [00-context/sources/canva-personas.txt](../00-context/sources/canva-personas.txt)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

Profile: Student, 20, Ho Chi Minh City, Single, iPhone/Laptop.
Personality: extrovert, hi-tech, Organized, Occasionally forgetful, Practical.
Behavior: Plan well → Buy intentionally → Store → Delay preparation → Lose attention → Forget occasionally.
Habits: Uses smartphone regularly; buys food for 2–3 days; doesn't prepare food after shopping.
Goals: Remember food is available; use food before expiry; know which should be used first; avoid unnecessary waste.
Motivation: Already planned/bought/paid; wants to actually use it.
Frustrations: Too much manual input; repetitive inventory updates.
Quote nguồn: “lâu lâu đi mua đồ ở bhx để ở tủ lạnh rồi quên mất tới khi lấy ra nó hết hạn r”.
Pains: Stored food easy to forget; delay preparation; notices only close to expiry; planned purchases still waste.
Challenges: Remember out-of-sight food; know attention priority; track without constant refrigerator checks; avoid another daily admin task.
Opportunities: Improve visibility, bring forgotten items to attention, prioritise soon-use items, timely low-effort reminders.


### Completeness and missing evidence

| Aspect | Evidence status |
|---|---|
| Profile, devices, habits, goals, quote | Present in live Canva rich text; quote remains card quote |
| Income/spend budget, precise time constraints | Not present; do not infer from age/occupation |
| Trigger and failure situation | Card-level mechanisms; incident sequence needs interview |
| Workarounds | Memory/checking/planning as card statements; tools/frequency not measured |
| Environment and household | Profile context only; not evidence for multi-user feature |
| Validation/provenance | Raw participant transcript/recruitment not supplied |
| Interface implications | Hypotheses linked to needs/features, not validated interactions |

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [02-challenges/needs-opportunities.md](../02-challenges/needs-opportunities.md)
- [01-personas/persona-evidence-gaps.md](persona-evidence-gaps.md)

## Open questions

Kể incident gần nhất: lúc mua/cất, trigger nhớ lại, bước hiện tại, điều cản trở và recovery; không hỏi dẫn về OCR.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](../11-traceability/README.md)
- [02-challenges/needs-opportunities.md](../02-challenges/needs-opportunities.md)
- [01-personas/persona-evidence-gaps.md](persona-evidence-gaps.md)

## Verification criteria

Đối chiếu rich text Canva; không kết luận occupation/age gây behavior hoặc quote là transcript interview.
