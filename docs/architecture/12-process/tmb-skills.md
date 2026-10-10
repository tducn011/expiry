# DOC-TMB — Verified TrustMeBro skills and project-layout conventions

- Document ID: `DOC-TMB`
- Status: **Review**
- Updated: 2026-10-09T18:37:36+07:00

## Purpose

Replace earlier missing TMB source assumption with inspected local canonical package.

## Evidence sources

- [00-context/source-register.md](source-register.md)

## Definitions and assumptions

[C] Các proposal dưới đây cần review trước implementation; không có nhãn Approved trong lần authoring này.

## Analysis

| Skill | Canonical local source | Installed discovery path | Evidence | SHA-256 |
|---|---|---|---|---|
| dedup-merge | /home/pro/Downloads/hackathon/src/skills/dedup-merge/SKILL.md | /home/pro/.codex/skills/dedup-merge/SKILL.md | [snapshot](sources/tmb-dedup-merge.txt) | 3470f1f6da4d04691af46b4361c783d8692a6cdbb7536680d87a5510ea245d61 |
| layout-init | /home/pro/Downloads/hackathon/src/skills/layout-init/SKILL.md | /home/pro/.codex/skills/layout-init/SKILL.md | [snapshot](sources/tmb-layout-init.txt) | b27edce88166c60a0de39a078c132a270c3ea15ff3a5c35c016c673267e90733 |
| orchestrator | /home/pro/Downloads/hackathon/src/skills/orchestrator/SKILL.md | /home/pro/.codex/skills/orchestrator/SKILL.md | [snapshot](sources/tmb-orchestrator.txt) | 2080ab9bceb37df9c2113341e7fb6a32beb654b24e0d3d5cd20a7366f788dfc6 |
| roadmap-planner | /home/pro/Downloads/hackathon/src/skills/roadmap-planner/SKILL.md | /home/pro/.codex/skills/roadmap-planner/SKILL.md | [snapshot](sources/tmb-roadmap-planner.txt) | 25d63c6ea1516c0eeaddd4f2103f2ed30ad1269144d7aa663c7d04332358b25f |
| roadmap-sync | /home/pro/Downloads/hackathon/src/skills/roadmap-sync/SKILL.md | /home/pro/.codex/skills/roadmap-sync/SKILL.md | [snapshot](sources/tmb-roadmap-sync.txt) | 67426697ab1afd00e484b10c2ef483d55f907af66f6be7a4006ff0bb904e7fd9 |

Installed all five skills in `/home/pro/.codex/skill-packages/trustmebro-local/src/skills/`, with symlinks from Codex skills; included shared templates/rules/progress script and byte-hash checks for11 files. Existing source dirty work preserved. Hooks are not activated by this installation. Skills should be discoverable next turn.

Layout-init convention: concise root LAYOUT.md with actual paths, components/flows, database reality and logic symbol locations; one line per responsibility, no pasted code. TMB hackathon root LAYOUT maps its own plugin/static repo and must not be mistaken for Expiry architecture. Root Expiry LAYOUT and this workspace UI LAYOUT have different purposes.

Planner/sync/orchestrator contain their own approval boundaries for future uses; this install does not run them, approve a PLAN or refactor duplicates. Current user has already requested architecture documentation; no production implementation/deployment is enabled by installing skills.

### Host-specific skill inventory

Also inventoried front matter in `.bob/skills` (6 entries) and `.gemini/skills` (9 entries). These include mirrors plus extensions; not all are canonical Codex plugin skills.

| Area | Skill names | Import status |
|---|---|---|
| `src/skills` | dedup-merge, layout-init, orchestrator, roadmap-planner, roadmap-sync | Installed five canonical skills |
| `.bob/skills` | dev-workflow, layout-init, project-roadmap, roadmap-navigator, roadmap-planner, roadmap-sync | Metadata inventory only; host copies/extensions preserved, not imported |
| `.gemini/skills` | dev-workflow, layout-init, roadmap-audit, roadmap-benchmark, roadmap-navigator, roadmap-planner, roadmap-scaffold, roadmap-sync, roadmap-validate | Metadata inventory only; host copies/extensions preserved, not imported |

The installed plugin core follows the verified `.codex-plugin/plugin.json` skills path (`src/skills`). No untracked `.gemini` extensions or Bob-specific variants replace this source.

## Decisions and rationale

[D] Giữ phạm vi food inventory cá nhân, manual capture và attention trong app theo source context. Approval kỹ thuật là riêng với việc kiểm tra cấu trúc tài liệu.

## Dependencies

- [09-advanced-web/LAYOUT.md](../09-advanced-web/LAYOUT.md)
- [12-process/workstreams.md](../12-process/workstreams.md)

## Open questions

TMB source is resolved; exact Figma source remains OQ-06.

## Related documents

- [README.md](../README.md)
- [11-traceability/README.md](../11-traceability/README.md)
- [09-advanced-web/LAYOUT.md](../09-advanced-web/LAYOUT.md)
- [12-process/workstreams.md](../12-process/workstreams.md)

## Verification criteria

Installed SKILL front matter, dependency resolution and progress smoke verified; auto-discovery UI invocation waits next turn.
