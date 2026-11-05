# Expiry – Security Model

_Threat model for `tducn011/expiry`, written by Devin from the code and infrastructure in this repo (`compose.yaml`, `vercel.json`, `apps/web/vercel.json`, `apps/api/Dockerfile`, `services/python-scan/Dockerfile`). Security scans use it to rank their findings. Items marked **(assumed)** are inferred from the code and not yet confirmed by the owner. Edit this file to correct them._

## 1. System overview & trust boundaries

Expiry is a private food-inventory tracker: users register, log in, and keep a per-user inventory of food entries with expiry dates, stock movements, recounts and a trash bin. Photos of packaging can be sent to an OCR service to extract expiry dates.

Deployment **(assumed from config)**:

```
Browser ──HTTPS──> Vercel (static SPA: apps/web/dist)
                     │ rewrites /api/*, /scan*, /health
                     ▼
            Tailscale Funnel  https://homeserver.tailc535bb.ts.net
                     ▼
   Home server (docker compose, compose.yaml)
     api        0.0.0.0:3001   Node/Express  (apps/api)
     python-scan 127.0.0.1:8000 FastAPI OCR  (services/python-scan)
     mysql      0.0.0.0:3307   MySQL 8.4
     adminer    0.0.0.0:8085   Adminer DB UI
                     ▼ (outbound)
   Gemini API (GEMINI_API_KEY)  /  Ollama at OLLAMA_HOST
```

Trust boundaries:
1. **Internet → Vercel → Funnel → API**: everything under `/api/v1`, `/health`, `/health/db` is reachable by anyone on the internet.
2. **API → python-scan**: internal HTTP (`SCAN_SERVICE_URL`), no auth; python-scan bound to loopback/compose network only.
3. **API → MySQL**: app user `expiry_app`; the API is the only writer of business data (python-scan has no DB access, per README).
4. **python-scan → third-party LLM**: uploaded images leave the system to Gemini (or a local Ollama).
5. **Home LAN / tailnet → host ports**: MySQL 3307, Adminer 8085 and API 3001 bind `0.0.0.0` on the home server.
6. **CI (GitHub Actions)**: `.github/workflows/ci.yml`, `contents: read`, `checks: write`, uses `GITHUB_TOKEN` in `scripts/sync-legacy-checks.mjs`.

## 2. Components

| Component | Code | Notes |
|---|---|---|
| **Web** | `apps/web/**` | React 19 SPA, Vite; `src/api/client.ts` talks to `/api/v1`; demo mode in `src/demo`, `src/mockApi.ts` |
| **Auth** | `apps/api/src/modules/auth/**` | register/login/session/logout, scrypt verifiers, session cookie, CSRF, in-memory rate limiter |
| **API** | `apps/api/src/app.mjs`, `apps/api/src/shared/**`, `apps/api/src/modules/inventory/**`, `apps/api/src/modules/expiry/**`, `apps/api/src/server.mjs` | inventory CRUD, movements, recounts, trash, preferences, idempotency ledger, health endpoints |
| **Scan Gateway** | `apps/api/src/modules/scan/**` | unauthenticated `/api/v1/scan`, `/api/v1/scans`, `/api/v1/scan/health`; validates images, proxies to python-scan |
| **OCR Service** | `services/python-scan/**` | FastAPI `/scan`, `/health`; Pillow preprocessing, Tesseract, optional DateReg (TF/YOLO models), Gemini/Ollama vision fallback |
| **Database** | `database/mysql/**`, `contracts/schema_reference_mysql.sql` | migrations, seed, management scripts (`scripts/manage.mjs`, `auth-migration.mjs`) |
| **Infrastructure** | `compose.yaml`, `database/mysql/compose.yaml`, `vercel.json`, `apps/web/vercel.json`, `**/Dockerfile`, `.github/workflows/**`, `scripts/**` | deployment, CI, tunnel/ops scripts |

Out of the runtime: `docs/**`, `Leader/**`, `output/**`, root `*.html`, `*figma*.mjs`, `expiry-styles.css` (design/report artefacts).

## 3. Entry points & who can reach them

| Entry point | Reachable by | Auth |
|---|---|---|
| `GET /health` | internet | none (reports DB status) |
| `GET /health/db` | internet | **none** – returns DB name, MySQL version, user count, entry count, and `err.message` on failure (`apps/api/src/app.mjs`) |
| `POST /api/v1/auth/register`, `/login` | internet | trusted Origin check + rate limit |
| `GET /api/v1/auth/session`, `POST /logout` | internet | session cookie (+ CSRF on logout) |
| `POST /api/v1/scan`, `/scans`, `GET /api/v1/scan/health` | internet | **none** (intentional per commit 93c0a58 **(assumed)**) – 10 MB JSON / 5 MB image, forwards to OCR and possibly Gemini |
| `/api/v1/food-entries/**`, `/trash/**`, `/me/preferences` | internet | session cookie + Origin + `X-CSRF-Token` + `Idempotency-Key`; rows scoped by `user_id` |
| python-scan `:8000/scan` | compose network / host loopback | none |
| MySQL `:3307`, Adminer `:8085`, API `:3001` | anything that can reach the home server's interfaces (LAN, tailnet) | DB credentials (compose default passwords unless overridden) |

## 4. Assets & sensitivity

- **User credentials & sessions**: emails, scrypt password verifiers (`local_credentials`), session token hashes (`user_sessions`). High.
- **Per-user inventory data**: `food_entries`, `stock_movements`, preferences, idempotency ledger `api_requests` (stores response bodies). Medium (personal, low intrinsic value) – privacy between users matters.
- **Home server / host**: MySQL root, Adminer, Docker host on a home network. High – compromise reaches the owner's LAN.
- **Secrets**: `GEMINI_API_KEY` (billing), MySQL passwords, `GITHUB_TOKEN` in CI. High.
- **Uploaded images**: transient, may be sent to Google Gemini. Low–medium.
- **Availability**: single home server; scrypt and OCR/LLM are CPU/cost heavy.

## 5. Attacker profiles

1. **Anonymous internet user** hitting the Vercel/Funnel URL – can call health, auth and scan endpoints directly (bypassing the SPA, with any Origin header they like from non-browser clients).
2. **Malicious registered user** – self-registration is open; can try IDOR/cross-tenant access to other users' entries, idempotency key collisions, or abuse of large payloads.
3. **Malicious website** in a victim's browser – CSRF / CORS abuse against a logged-in user.
4. **Device on the home LAN / tailnet** – can reach 0.0.0.0-bound MySQL, Adminer and API ports.
5. **Supply-chain / CI** – compromised dependency or workflow.

## 6. Existing controls

- Session: 256-bit random token in `HttpOnly`, `SameSite=Lax` cookie (`__Host-` + `Secure` in production); only SHA-256 hash stored; 30 min idle / 8 h absolute timeout; session rotation revokes the previous token on login/register.
- CSRF: exact-origin allowlist (`requireTrustedOrigin`) plus HMAC-style `X-CSRF-Token` bound to the session on all mutations (`auth.crypto.mjs` `matchesCsrf`).
- CORS: credentials only for configured origins (`APP_ORIGIN`).
- Passwords: scrypt N=2^17, 15–128 chars, constant-time compare, dummy verifier for unknown emails, bounded derivation queue.
- Rate limiting: in-memory per-IP and per-email buckets on register/login; `trust proxy 1` (IP from first proxy hop – Vercel/Funnel chain **(assumed)**).
- Authorization: every inventory query filters on `user_id = req.userId` from the verified session (`shared/repository.mjs`); caller identity headers are ignored.
- Idempotency ledger per `(user_id, idempotency_key)` with request hash comparison.
- Parameterized SQL (`mysql2` `execute` with placeholders).
- Image validation: size caps, magic-byte sniffing, strict base64 in the API; body caps and media allowlist in python-scan; scan responses re-validated by `publicScanResult` before returning.
- Error handler hides internal/SQL errors (except `/health/db`).
- python-scan bound to `127.0.0.1` on the host.

## 7. Out of scope / accepted risk

_Not yet confirmed by the owner._ Pending answers to: whether the unauthenticated OCR endpoint is intended, whether MySQL/Adminer are reachable only from the LAN/tailnet, whether compose default passwords are overridden in production, and whether docs/design/demo code is out of scope.

## 8. Open questions

1. Which attackers matter most (internet, other users, LAN/tailnet)?
2. Which assets matter most (accounts, inventory data, home server, Gemini key)?
3. Is the unauthenticated `/api/v1/scan` intended to be public, and is Gemini cost abuse an accepted risk?
4. Are ports 3001/3307/8085 firewalled from anything but localhost/tailnet? Is the Funnel limited to port 3001?
5. Are production MySQL passwords set via `.env`, overriding the compose defaults?
6. Is the demo/mock UI shipped to production (`apps/web/src/demo`)?
