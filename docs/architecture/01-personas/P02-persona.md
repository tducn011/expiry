# DOC-P02 — P2 — Tôn Nữ Như Huyền

- Document ID: `DOC-P02`
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

Profile: Households, 49, Da Nang, Married, Android/Laptop.
Personality: low-tech, Practical, Family-oriented, Flexible, Responsible, Convenience-oriented.
Behavior: Plan → Buy intentionally → Store → Plans change → Delay use → Food remains unused.
Habits: Household shopping; stores ingredients; checks available food before cooking; changes meals by schedule; partly relies on memory.
Goals: Use before expiry; know priority; decide quickly; adapt plans; avoid waste.
Motivation: Food already bought, original plan changed, still wants use; needs easy next decision.
Frustrations: Expiry-only notifications, manual input, complicated tracking, browsing many items, too many steps for simple decisions.
Quote nguồn: “Cứ mỗi lần đi ăn ngoài thì lại cứ theo thói quen đi chợ mà quên mất có đồ ăn vẫn còn ở tủ lạnh xong để đấy nghĩ là bữa sau ăn rồi cũng quên mất”.
Pains: Unexpected plan changes; food unused; ingredients don't fit new schedule; date info not next action.
Challenges: Decide priority; adapt existing food; turn ingredients into useful action without much planning.
Opportunities: Prioritize attention; Use Now/Use Soon/Later; actionable guidance; quick next-use decisions.


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
