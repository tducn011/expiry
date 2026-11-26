# Gates: UI-CORAL-TEAL-20261118

OWNS: apps/web/src/index.css, apps/web/src/features/**, apps/web/src/components/**, apps/web/index.html, apps/web/site.config.ts, apps/web/public/**, .tmb/layouts/web/LAYOUT.md, .tmb/maps/reuse.md, .tmb/tasks/UI-CORAL-TEAL-20261118/**, ROADMAP.md, GATES.md

Scope: Apply the supplied Coral + Teal palette consistently to all active Expiry web app screens and browser/PWA brand surfaces while preserving distinct semantic status meanings and existing accessibility behavior.

- [x] G1: Complete palette and semantic tokens are implemented in the shared theme and active app color overrides use the shared tokens
  EVIDENCE: `origin/develop` merge commit `23b77f6c03a70b66c4783af831aa4bfb6d0ddd1a`; PR #266 includes Coral 50–900, Teal 50–900, Neutral and semantic/alpha tokens in `apps/web/src/index.css`, tokenized active screens/components/charts, Coral favicon and browser theme color. Static audit found 155 root variables, all 27 scale mappings and no hex literals in active `.tsx`/`.ts` UI sources.

- [x] G2: Web app typecheck succeeds
  CHECK: npm --workspace=apps/web run typecheck && node -e "console.log('typecheck verified')"
  EXPECT: typecheck verified
  EVIDENCE: automatic-evidence=v1; definition-sha256=a6346fd818e69a5475cb424ac563eaf29495a503cddfeb9ac7a1530776fdfd0d; exit=0; EXPECT=matched; output-sha256=df8131992cacec6524069e215714567fbf8b1813d55437dfe7496cbb2b9f684a; output-bytes=64; shell=/bin/sh; cwd=/home/pro/Downloads/expiry; path=493abab93344/22 entries

- [x] G3: Web production build succeeds
  CHECK: npm --workspace=apps/web run build && node -e "console.log('production build verified')"
  EXPECT: production build verified
  EVIDENCE: automatic-evidence=v1; definition-sha256=38c0fd11675a1d6686f705c788df0ff86a8744050874b721bc5bb93dafc9eb21; exit=0; EXPECT=matched; output-sha256=ce36cb0c7b47ab4b7d7a5855ee35f69f91cd7718671ca3cd52fb68369c2ef43b; output-bytes=903; shell=/bin/sh; cwd=/home/pro/Downloads/expiry; path=493abab93344/22 entries

- [x] G4: Diff is whitespace-clean
  CHECK: git diff --check && node -e "console.log('diff check passed')"
  EXPECT: diff check passed
  EVIDENCE: automatic-evidence=v1; definition-sha256=5d8f0ee18e5764f72420a5e4b9eb0be52044c8aed498a6ee605a0a11a7d5c288; exit=0; EXPECT=matched; output-sha256=ecff57306c74c51f31295062b763f3a5e5da5bb7125e71b4866b6e7325130521; output-bytes=18; shell=/bin/sh; cwd=/home/pro/Downloads/expiry; path=493abab93344/22 entries

- [x] G5: Contrast, PWA identity, and all active routes are reviewed against the requested palette and current screen behavior
  EVIDENCE: At 390px, checked `/`, storage, attention, add, scan, sample detail, insight/history, trash, notifications, settings/account; no horizontal overflow. Computed styles confirmed Coral `#c73e52`, Teal heading `#134e4a`, light canvas `rgb(255, 252, 253)`, white primary-button text; scanner title remains white on its dark brand surface. Contrast calculations: primary/white 4.95:1, hover/white 6.56:1, heading/white 9.48:1, body/white 14.68:1, secondary/white 7.58:1, tertiary/white 4.76:1, Teal accent/white 5.47:1, soon/status background 4.51:1, success/status background 4.57:1, control border 3.02:1. Decorative strong border is 2.11:1 and is not used for control affordances. Local browser preview used demo fallback because API session endpoint returned ECONNREFUSED; this is not backend/production acceptance.

- [x] G6: The scoped change is present on GitHub develop
  EVIDENCE: PR https://github.com/tducn011/expiry/pull/266 merged 2026-11-18 at `23b77f6c03a70b66c4783af831aa4bfb6d0ddd1a`; this commit is an ancestor of current `develop` at `44069e5726f5d4c1f5254936cb1aa0f025702fb9`. CI build, typecheck/static gate, backend, Python, live behavior and Vercel checks passed. Vitest reports 141/142 passing; one pre-existing date-sensitive assertion expects `Còn 10 ngày` while the fixture is rendered as `Quá hạn 1 ngày` on 2026-11-18. Formatting passed after correction. This unrelated assertion was left unchanged.

