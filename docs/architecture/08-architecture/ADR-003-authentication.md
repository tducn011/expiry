# DOC-ADR-003 — Credential and session authority

- Document ID: `DOC-ADR-003`
- Status: **Review**
- Updated: 2026-10-13

## Purpose

Record the current credential/session authority and separate implemented candidate behavior from production security approval.

## Evidence sources

- [Auth routes](../../../apps/api/src/modules/auth/auth.routes.mjs)
- [Auth repository and cryptography](../../../apps/api/src/modules/auth/auth.repository.mjs)
- [Migration 002](../../../database/mysql/migrations/002_local_auth.sql)
- [Auth contract](../../../contracts/openapi.json)
- [Auth architecture review](../07-api/authentication.md)

## Definitions and assumptions

**[A]** The current implementation is Node-managed email/password with MySQL-backed credentials and opaque server-side sessions. Status remains Review: this ADR does not approve production deployment or substitute for security review.

## Analysis

| Aspect | Current source and decision boundary |
|---|---|
| Problem | Private owner data requires a verified principal, logout/revocation, and same-owner task recovery |
| Current authority | Node auth boundary validates local credential and session; private handlers receive principal from verified session |
| Credential storage | Normalized email plus encoded scrypt verifier in `local_credentials`; plaintext password is not stored |
| Session storage | Only token hash is persisted in `user_sessions`; owner, created/last-seen/expiry/revocation support lifecycle checks |
| Browser transport | HttpOnly, SameSite=Lax cookie; Secure and `__Host-` name when secure-cookie configuration is active |
| Request protection | Exact configured Origin for unsafe requests and session-bound CSRF token on writes |
| UI recovery | Add is gated before form opening; same-owner reauthentication can return to an already-open form and expose immutable retry |
| Evidence limit | Local contract/schema/auth checks and one bounded synthetic-401 browser path do not establish production security, deployment cookie/proxy behavior, or all-flow browser acceptance |

## Decisions and rationale

**[A]** The current source implements local credentials and server sessions; the former “evaluate a session/provider” option is no longer an accurate description of current state. **[D]** Retain Review status until production origins/cookie/proxy settings, rate limits/abuse controls, account recovery/retention, and independent security review have explicit evidence. Do not infer approval from checked-in code or migration application.

## Dependencies

- [Current auth design](../07-api/authentication.md)
- [Current local-auth schema](../06-data-model/erd.md)
- [Deployment configuration](deployment.md)
- [Auth verification catalog](../10-testing/test-catalog.md)

## Open questions

Production origin and reverse-proxy trust configuration; rate limiting and abuse response; account recovery/change policy; credential/session retention and account deletion; independent security review; and broad browser acceptance.

## Related documents

- [Decision ledger](../00-context/decisions-and-questions.md)
- [Schema input/output](../06-data-model/schema-input-output.md)
- [Schema reconciliation report](../10-testing/schema-reconciliation-2026-10-13.md)

## Verification criteria

The session/credential description must match current auth source, contract, and migration. Keep status Review and list remaining deployment/security questions until those are separately resolved; this document alone is not an approval.
