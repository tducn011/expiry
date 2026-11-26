# Branch consolidation review - 2026-11-06

Reviewed baseline: `develop@4bfa8c44cec26fe34468dc0cb2c68695ed192bee`.
Remote: `https://github.com/tducn011/expiry.git`. The local checkout was two
commits behind and was fast-forwarded before review. No PRs were open at inventory.

## Complete inventory and decision

The [per-branch inventory](branch-review-2026-11-06.tsv) records every one of the
11 local and 111 real origin branches, including the exact original tip, related
PR states, evidence and disposition. `origin/HEAD` is a symbolic pointer and is
excluded. Local and remote branches with the same name are separate rows.

| Initial evidence | Ref count | Meaning |
| --- | ---: | --- |
| Exact historical tree | 69 | Whole source snapshot exactly matches a commit already reachable from develop |
| Ancestor | 27 | No commits outside develop |
| Equivalent patches | 13 | Every non-merge patch exists in develop; no unique merge commits |
| Manual content review | 10 | Nine distinct branch names; one has both local and remote refs |
| Keep canonical branches | 3 | Local develop, origin/develop and protected/default origin/main |
| Total | 122 | Complete original inventory |

The intended final state is one local branch (`develop`) and two remote branches
(`develop`, `main`). Secondary branches are eligible for deletion only after the
useful recovery below is integrated. The temporary consolidation branch is also
removed after merge. Existing branch rules remain in force.

## Useful changes recovered

Historical manual-capture commit `0059d0c6ea0a344a5de168b1b4bc21a35fcdf2f9`
introduced field-length checks in the old EntryForm. The newer FoodForm retained
required/numeric/date validation but lost the name/location/note length checks.
Restore those checks in the current owner rather than restoring deleted forms:

- Name: 200 Unicode code points after trimming.
- Storage location: 100 Unicode code points after trimming.
- Note: 1,000 Unicode code points after trimming.

These limits follow current `contracts/public-api.yaml` EntryCreate/EntryPatch and
`apps/api/src/shared/domain.mjs` metadata validation. Trimming follows the existing
App save adapter. Field errors are visible and connected through ARIA; correction
through the select and both add-location modal confirmation paths clears the old
error. No server or persistence schema change is needed.

Historical image optimization commit `42362398d2692f8210621e885062761f4c76e7ef`
also retained useful behavior that was lost during UI replacement: the optimizer
helper survived, but no active runtime caller used it. Wire it into the current
Scanner single-file/native-camera intake, Scanner multi-image intake and FoodForm
HSD photo intake. `prepareScanImage` returns the optimized upload and a preview of
that same file. It reuses the existing <=1920 px, <1,000,000 byte JPEG optimization
policy. Generation checks discard results after replacement, exit or unmount;
image decode/read failures leave an actionable error instead of an unhandled
promise. Existing live camera-frame capture remains unchanged. No API upload
limit is changed. Actual decode memory is not bounded by the compressed size,
and this does not certify OCR accuracy on physical devices.

## Remaining manual-review findings

| Branch | Review result |
| --- | --- |
| fix/issue-203-204-session-cache-isolation | Current App already separates authGenRef from hydrationGenRef. Preserve newer pagination/session behavior. |
| feat/issue-42-manual-capture-form | API aliases, Location header and idempotency are present. Recover only the missing length guards in FoodForm. |
| feature/i1b-app-auth-connect | Remaining unmatched commit changes formatting/blank lines; auth behavior is already integrated. PR 108 is closed. |
| feature/i1c-domain-mutations | Remaining unmatched commit changes formatting/blank lines; mutation/retry behavior is already integrated. PR 109 is closed. |
| feature/ui | Optional DateReg adapter, models and requirements match current develop byte for byte; current route uses the newer candidate contract. |
| fix/issue-81-session-clock-skew | Functional fix has an equivalent patch. Residual change only wraps obsolete History presentation text. |
| fix/issue-84-normalize-mime-types | Superseded by current MIME normalization and file/image multipart support. |
| fix/issue-85-camera-image-optimization | Helper/tests survived but runtime wiring was missing; recover it in single/batch Scanner and FoodForm HSD intake. |
| fix/issue-85-scan-downscale-camera-preview | Camera/preview exist; recover selected-file downscaling through the stronger existing optimizer, with no second helper or old ScanForm. |

Release branches and migrated-responsive-ui are historical snapshots, not missing
functionality. In particular, migrated-responsive-ui has nine differently
identified commits but its whole tree matches develop ancestor `52b02583d926`;
the leader report matches `8eac0037175f`, and main's source matches `f162f453563b`.
An unequal commit SHA alone is not a reason to merge old content again.

## Verification and recovery boundary

- Baseline: TypeScript passed; UI 132/132 passed; API 58 passed and one opt-in
  MySQL test skipped; production build and source format check passed.
- Restored guards: three over-limit regression cases failed before the fix.
  After both recoveries, UI 139/139, TypeScript, build, formatting and diff
  whitespace checks passed. Tests include exact limits, one-over limits,
  Unicode/trimming, optimized-file preview and preview failure/abort.
- Local Chromium production preview: all three over-limit fields displayed the
  specific error and ARIA relationship; Save stayed in the form. Correcting values
  cleared errors. A separate independent review identified the modal correction
  lifecycle; both button and Enter correction paths passed after the fix.
- Browser scan integration used a synthetic 23,257,087 byte PNG: single camera
  input, two-image library intake and FoodForm HSD each uploaded JPEG files of
  961,888 bytes with 1920x1920 previews. OCR responses were stubbed. Leaving during
  pending image preparation caused no upload or stale navigation; malformed PNG
  bytes displayed an error, ended processing and retained retry actions.
- Independent review passed with no security or logic findings after the fix.
  Actual GitHub run/merge/deletion
  receipts and browser details are kept in the local task evidence directory.
- Build retains the existing bundle-size warning. Local real-MySQL, physical
  camera/device and production behavior are outside these verification claims.

A complete Git bundle was verified before deletion at
`.tmb/tasks/GIT-CONSOLIDATE-20261106/branches-before.bundle`. The local task also
holds `inventory.json`, original refs and deletion receipts. The bundle is local
recovery material and is not uploaded. It preserves original histories even when
only their useful source content is retained in develop. Secondary worktree files
and HEADs are preserved by detaching their already-merged branch before deletion.
