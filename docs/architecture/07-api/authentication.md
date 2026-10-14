# DOC-AUTH — Current local session authentication and owner authorization

- Document ID: `DOC-AUTH`
- Status: **Review**
- Updated: 2026-10-13

## Purpose

Describe the current API authentication boundary, persisted credential/session state, CSRF/origin checks, and the bounded UI continuation behavior.

## Evidence sources

- [Current local auth routes](../../../apps/api/src/modules/auth/auth.routes.mjs)
- [Auth repository and session persistence](../../../apps/api/src/modules/auth/auth.repository.mjs)
- [Scrypt verifier and token hashing](../../../apps/api/src/modules/auth/auth.crypto.mjs)
- [API app middleware order](../../../apps/api/src/app.mjs)
- [Local-auth migration](../../../database/mysql/migrations/002_local_auth.sql)
- [OpenAPI auth operations](../../../contracts/openapi.json)
- [Auth form](../../../apps/web/src/features/AuthForm.tsx) and [Add/Edit recovery coordination](../../../apps/web/src/App.tsx)
- [Bounded browser recovery result](../10-testing/schema-reconciliation-2026-10-13.md)

## Definitions and assumptions

**[A]** The current candidate uses Node-managed email/password credentials and durable server-side sessions in MySQL. The raw bearer secret is delivered as a cookie; only its digest is stored. **[A]** The design document remains Review and does not establish threat-model sign-off, production origin/cookie configuration, penetration-test completion, or user approval beyond prior implementation selection.

## Analysis

### Current API and persistence

| Operation | Authentication/transport | Persistent effect / response |
|---|---|---|
| `POST /auth/register` | Exact trusted `Origin`; no pre-existing CSRF token | Creates user, local credential, and session; returns `AuthSession`; sets session cookie |
| `POST /auth/login` | Exact trusted `Origin`; no pre-existing CSRF token | Verifies credentials, rotates/replaces current session as implemented, returns `AuthSession`; sets cookie |
| `GET /auth/session` | Valid session cookie required | Returns current `AuthSession`; missing/invalid/expired session is `401 Problem` |
| `POST /auth/logout` | Valid session cookie, trusted Origin, per-session `X-CSRF-Token` | Revokes session, clears cookie, returns `204` |
| Other private `/api/v1` operations | Valid session cookie; unsafe requests additionally require exact trusted Origin and matching CSRF token | Principal comes only from the verified server session; every object access is owner-scoped |

`local_credentials` stores normalized email and an encoded scrypt verifier (not plaintext). `user_sessions` stores token hash, owner, created/last-seen/expiry/revocation timestamps. Passwords, verifiers, raw session tokens, and authority-bearing `user_id` are never food DTO fields. Current scrypt format is pinned by source and schema at `N=131072`, `r=8`, `p=1`; review its resource/rate-limit behavior separately for deployment.

In production configuration, auth routes choose an `__Host-` cookie name and set `HttpOnly`, `Secure`, `SameSite=Lax`, and `Path=/`; nonproduction uses a different cookie name with `Secure` disabled. Session lifetime is configured with an eight-hour absolute limit and thirty-minute idle limit by default. These are current source defaults, not a production-host deployment verification.

### Current UI continuation

In real mode, Add checks session before opening the Add form. An unauthenticated Add records a pending intent and shows Auth first; successful login/register continues to Add. Cancel clears the pending Add intent. If an already-open form’s submitted command receives 401, same-owner authentication can restore the retained form and expose the immutable command retry. Changing identity clears private selection/pending state.

**[A] Bounded browser observation:** for a synthetic 401 during Edit, Auth/login was reachable in the foreground; same-owner Edit draft name/location remained; the in-modal immutable Retry was reachable and applied metadata only; the observed quantity remained 500. This does not prove all browser flows. A bounded lost-response discard observation is recorded in the reconciliation report: the committed response was intercepted, the UI showed `REQUEST_TIMEOUT`, and immutable retry left one discard effect. This does not establish exact real-world timeout latency.

### Security and deployment boundary

The current source applies a validated principal before private inventory operations, exact trusted-Origin checks to unsafe requests, CSRF comparison on session-bound writes, and cookie flags described above. The source and local checks do not establish deployed TLS/proxy behavior, production secret/configuration, rate-limit adequacy, account-recovery policy, penetration resistance, or accessibility/usability. Keep those as separate review gates rather than inferring approval from implementation presence.

## Decisions and rationale

**[A]** Current source has local credentials and server sessions; the former unresolved alternatives page is no longer the current architecture. **[D]** Keep the status Review until deployment settings, abuse controls, recovery policy, and independent security review are explicitly evaluated. Do not add JWT, external identity provider, password-reset/change success claims, or a second auth authority without a new decision.

## Dependencies

- [Authentication ADR](../08-architecture/ADR-003-authentication.md)
- [Current auth/session fields](../06-data-model/dictionary.md)
- [Current API input/output](../06-data-model/schema-input-output.md)
- [Current Add/Edit navigation](../05-interaction-design/navigation.md)
- [Test catalog](../10-testing/test-catalog.md)

## Open questions

Production frontend/API origin, cookie and proxy configuration; rate-limiting/abuse controls; account recovery and credential-change policy; retention/deletion of credentials and sessions; and independent security review remain open. Current auth routes do not expose successful forgot/reset/change-password operations.

## Related documents

- [Current auth ADR](../08-architecture/ADR-003-authentication.md)
- [Schema reconciliation report](../10-testing/schema-reconciliation-2026-10-13.md)
- [Traceability index](../11-traceability/README.md)

## Verification criteria

Current routes and schema must agree on credential/session fields and status codes. UI recovery claims remain scoped to the synthetic-401 observation; no browser-wide, deployment, threat-model, or production security pass is implied.
