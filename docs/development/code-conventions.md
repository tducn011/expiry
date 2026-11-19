# Code conventions

This document records the repository's implementation conventions and the
checks that currently enforce them. When source and this document disagree,
update the document or the source in the same change. API and database behavior
must remain aligned with `contracts/` and versioned MySQL migrations.

## Shared rules

- Use UTF-8, LF line endings, a final newline, and spaces for indentation.
- Use two spaces in JavaScript, TypeScript, YAML, JSON, CSS, Markdown, and SQL;
  use four spaces in Python. Makefiles use tabs for recipe indentation.
- Keep names descriptive and consistent with the surrounding module. Keep API
  fields in the established camelCase public DTO style; use snake_case for SQL
  columns and Python identifiers.
- Keep secrets and environment-specific values out of source. Add safe examples
  to `.env.example` when a new setting is needed.
- Keep one owner for each responsibility: web API client for HTTP/DTO mapping,
  API modules for business rules, repositories for persistence, Python scan for
  transient image/OCR work, and migrations for schema changes.

## Web (`apps/web`)

- Use TypeScript and React function components. Keep feature UI under
  `apps/web/src/features`, API calls and DTO mapping under `src/api`, and shared
  domain rules under `src/domain` or the existing shared owner.
- Use double-quoted strings and omit semicolons, following Oxfmt output.
- Run `npm run format` to format web source. Run `npm run test:format` to check
  `apps/web/src`, and `npm run typecheck` for TypeScript diagnostics.
- The CI formatting/type gate currently checks web source only.

## Node API (`apps/api`)

- Use native ES modules (`.mjs`) and single-quoted strings with semicolons,
  matching the current API source.
- Keep route registration in each module's `*.routes.mjs`; keep request/response
  handling in controllers, business rules and orchestration in services, and
  SQL in repositories or the existing service owner when no repository exists.
- Validate input at the API boundary, scope reads and writes by authenticated
  owner, and return public DTOs rather than database rows.
- Add or update API tests with `node:test` in `apps/api/tests/*.test.mjs`.
- Run `npm run test:api`. API formatting and static linting do not currently
  have a dedicated CI gate; do not claim they passed unless a check is added and
  run.

## Python scan service (`services/python-scan`)

- Follow PEP 8 style: four spaces, snake_case functions/variables, and
  PascalCase classes. Use FastAPI routers for HTTP endpoints and Pydantic models
  for request/response contracts.
- Keep scan processing stateless and do not add database access to this service.
- Add tests under `services/python-scan/tests` using `unittest`.
- Run `python -m unittest discover -s services/python-scan/tests` with Python
  3.12, matching CI. No Python formatter or linter is currently configured.

## MySQL (`database/mysql`)

- Make schema changes in a new, monotonically numbered migration under
  `database/mysql/migrations`; do not edit an already applied migration.
- Use uppercase SQL keywords, two-space indentation, snake_case identifiers,
  InnoDB, explicit constraints/index names, and owner foreign keys where the
  data is user-owned, following the existing migrations.
- Keep migration checksums and ledger behavior intact. Preserve compatibility
  across deployment by using expand/migrate/contract steps for destructive
  changes.
- Run `npm run test:dbops` for migration/schema operation checks. The full-stack
  CI job additionally starts MySQL 8.4 and verifies the migration ledger and
  behavior contract.

## Contracts and verification

- Update `contracts/public-api.yaml` for public API changes and
  `contracts/scan-api.yaml` for Python scan changes in the same change as the
  implementation. Preserve stable operation IDs and document status/error
  responses and authentication requirements.
- Update API client DTOs and behavior checks when public payloads change.
- For a web change, run `npm run test:format`, `npm run typecheck`,
  `npm run test:ui`, and `npm run build:web` before publication. For API changes,
  also run `npm run test:api`. Database changes require `npm run test:dbops` and
  the full-stack gate where available.
- `npm run test:all` currently runs API tests, Python tests, UI tests, DBOps,
  web build, and behavior-contract verification. It does not invoke
  `test:format` or `typecheck`; run those separately.

## Current enforcement gaps

- Oxfmt and TypeScript checks are enforced in CI for web code.
- API behavior is tested, but API-specific formatting and linting are not
  configured.
- Python `unittest` is enforced in CI; Python formatting and linting are not
  configured.
- SQL structure and migration behavior are checked by DBOps/full-stack scripts;
  no SQL formatter is configured.

This is a record of the current convention baseline, not a claim that every
language has automated formatting enforcement.
