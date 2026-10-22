# Local authentication persistence proposal — 11 October 2026

Status: architecture selection and the concrete two-table migration **approved by the user on 11 October 2026** for local `expiry_dev` and isolated test databases. Local migration application and focused real-MySQL authentication checks completed; whole-app/deployment acceptance remains separate.

## Evidence and selected ownership

[A] The user selected **Node-managed email/password and sessions** during this task. That establishes the identity mechanism, but the supplied task requires review of a concrete minimal schema diff before tables or migrations are applied.

[A] `apps/api/src/shared/middleware.mjs` previously accepted a Bearer string or `x-user-id` as the user ID and otherwise selected the demo user. This did not establish a trusted principal. `database/mysql/migrations/001_initial_schema.sql` contains user identity/profile/preferences but no password verifier or durable credential lifecycle. `ADR-003-authentication.md` records the formerly open architecture decision.

[D] Keep `users`, `food_entries`, `stock_movements`, `api_requests`, and the existing migration unchanged. Add exactly two persisted entities required by the selected authentication design:

| Entity grain | Fields | Relationships and lifecycle |
| --- | --- | --- |
| `local_credentials`: one password credential per user | `user_id` PK/FK; unique `email_normalized`; salted `password_verifier`; created/updated times | `users` 1 → 0..1 credential; email changes do not change identity. Registration creates a fresh UUID user with `identity_subject=local:<UUID>` and this credential in one transaction. Existing/demo users are not assigned passwords or transferred ownership. |
| `user_sessions`: one issued browser session | SHA-256 `token_hash` PK; `user_id` FK; created, last seen, absolute expiry, revoked time | `users` 1 → 0..N sessions. The raw 256-bit opaque token exists only in the browser's HttpOnly cookie and transient server request state. Login/register issue a fresh token and revoke a prior presented browser token within the same transaction. Logout revokes the current token. Absolute and idle expiry are checked server side. |

The concrete approved candidate is `database/mysql/migrations/002_local_auth.sql`, SHA-256 `96bbfdc4b3e1ee6aa454f41eb520fee6b3d12fe71e2c02ae442b887db8833adc`. The coordinating task applied it to `expiry_dev` and reported unchanged byte fingerprints for users (2), food entries (4), movements (8), and replay rows (0). This auth task separately applied/replayed it on a freshly created isolated `expiry_test_auth_*` database for the checks below, then removed only that test database. No auth test users were inserted into `expiry_dev`. MySQL DDL implicitly commits; the explicit helper records checksums and rejects partial/unversioned auth tables instead of claiming transactional DDL rollback.

## Credential and session behavior

[B/D] Use Node's asynchronous `crypto.scrypt` with N=131072, r=8, p=1, a random 16-byte salt, and a 64-byte verifier. This is an OWASP-listed scrypt configuration and avoids a new hashing dependency. It uses approximately 128 MiB per derivation; the module permits at most two concurrent derivations. The persisted verifier fixes those parameters, rejects malformed formats, and uses constant-time hash comparison. Passwords accept 15–128 Unicode codepoints without trimming or truncation. Unknown-account and incorrect-password login responses share `INVALID_CREDENTIALS` and both perform scrypt work.

[B/D] Cookie policy is HttpOnly, SameSite=Lax, Path=/, Secure in production, with the `__Host-expiry_session` name in production. Development uses `expiry_session` for local HTTP. Production configuration must provide explicit HTTPS origins; development origins are configured by the app owner. Cookies have no Domain attribute. State-changing requests require an exact trusted Origin, reject `Sec-Fetch-Site: cross-site`, and session-authenticated changes also require an `X-CSRF-Token` derived by HMAC from that session's raw secret. The CSRF token can be obtained through an authenticated `GET /api/v1/auth/session`; it is not the session credential. SameSite is defense in depth, not the sole CSRF control.

[D] Default durations are **8 hours absolute** and **30 minutes idle**. These are candidate product/security tradeoffs, not empirically validated usability outcomes. Activity updates last-seen time without extending absolute expiry; expiry requires fresh email/password login. Login/register replace the current browser session. No separate refresh token or JWT is introduced.

## Public operations and module boundary

`createAuthBoundary({repository, allowedOrigins, secureCookies, now, absoluteTimeoutMs, idleTimeoutMs})` exports `router`, `requireAuth`, `requireCsrf`, `requireTrustedOrigin`, and `cookieName`. `AuthRepository(database, {connect})` owns durable credentials and sessions. The application mounts `/api/v1/auth` before inventory idempotency middleware and uses `requireAuth` followed by `requireCsrf` for protected domain operations.

| Endpoint | Request | Result |
| --- | --- | --- |
| `POST /api/v1/auth/register` | JSON email/password/display_name; optional timezone; trusted Origin | 201 session cookie plus `{user,csrf_token,expires_at}` |
| `POST /api/v1/auth/login` | JSON email/password; trusted Origin | 200 fresh session cookie plus same envelope |
| `GET /api/v1/auth/session` | Session cookie | 200 current principal and CSRF envelope; 401 absent/expired/revoked token |
| `POST /api/v1/auth/logout` | Session cookie, trusted Origin, X-CSRF-Token | 204 after durable revocation; cookie cleared |

`user` contains `id`, `display_name`, `email`, `timezone`, `attention_lead_days`, and `version`. Protected ownership is assigned from this durable authenticated principal's `id`, never an identity header. Missing tables/unavailable persistence produce controlled `AUTH_UNAVAILABLE` 503; missing/expired credentials produce `AUTH_REQUIRED` 401; no mock or demo fallback is available.

## Bounded defenses and limits

[D] Registration/login share bounded per-process attempt windows by IP and normalized-email digest: 20 attempts per IP and 10 per email in 15 minutes; at most 10000 stored bucket keys. Server-side KDF concurrency is additionally bounded. These defenses do not constitute distributed rate limiting; multiple API processes or restarts reset/split attempt state. Deployment ingress controls must be selected and verified for a public deployment.

[D] Expired/revoked rows cannot authenticate. Deletion/retention policy for those operational rows remains an open decision; the expiry index permits later cleanup. No account deletion, email verification, recovery email, password reset/change, MFA, administrator role, or account-ownership migration is implemented or claimed by this scope. Registration checks syntax and uniqueness, not control of the email mailbox. HTTPS/proxy behavior and actual cookie delivery must be verified in the deployment environment.

## Verification boundary

Focused tests use injected repositories/clock and an HTTP server to verify trusted identity establishment, rejection of caller identity headers, incorrect credentials, CSRF/Origin policy, token rotation, expiry, revocation, rate limits, and fail-closed persistence errors. `node --test tests/auth.test.mjs` passed 9/9 on 11 October 2026.

After explicit migration approval, `EXPIRY_AUTH_MYSQL_TEST=1 node --test tests/auth.mysql.test.mjs` passed all **8 real-MySQL lifecycle subtests** (TAP counts 9 including their containing test). Executed checks: approved additive migration replay/checksum; durable account/verifier/token hash; duplicate-registration transaction rollback; distinct principals and identity-header rejection; durable session recovery after recreating the HTTP server and repository; persisted token rotation; CSRF-protected durable logout; server-side idle/absolute expiry. The test database began empty and was removed afterward. The tests use injected time for expiry and do not wait for the candidate production durations.

This evidence covers local HTTP and MySQL authentication behavior. It does not establish MySQL-container restart acceptance, real browser cookie handling, whole-app inventory authorization, deployed TLS/proxy behavior, distributed rate limits, email ownership, or participant usability. Default test runs skip the opt-in real-MySQL test, preventing unexpected schema/database mutation.

## Primary references checked for this design

- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html): scrypt fallback configuration and work-factor considerations.
- [Node.js crypto documentation](https://nodejs.org/docs/latest-v22.x/api/crypto.html): asynchronous scrypt, explicit maxmem, random bytes, HMAC, and timing-safe equality.
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html): opaque identifiers, cookies, revocation, and server-side idle/absolute expiry.
- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html): configured exact origin checks and per-session token defenses.
