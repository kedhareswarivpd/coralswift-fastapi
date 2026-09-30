# Engineering Rules — CoralSwift Technologies

This repo is two applications: a FastAPI backend (`backend/`) and a React/Vite
frontend (`frontend/`). There is no Next.js app and no Flutter app in this
repo — if a rule below only makes sense for one of those, it isn't included
here to avoid documenting behavior that doesn't exist.

This file states the standing engineering rules for the whole repo. It does
not restate what's already covered elsewhere — see `backend/README.md` for
backend setup/architecture, `docs/BACKEND_GAPS_AND_ISSUES.md` for current
known gaps, `docs/CONTACT_BACKEND.md` for the frontend-integration contract,
and `status.md` for the evidence ledger of what's been verified and how.

## Core principles

- **DRY** — no duplicated business logic. Shared logic goes in
  `backend/app/services/`, `backend/app/utils/`, or `backend/app/crud/base.py`
  (the generic CRUD layer 15+ simple CMS routers already share via
  `build_crud_router`). Shared constants/config live in
  `backend/app/core/config.py`, never hardcoded per-module.
- **KISS** — prefer the simple, readable implementation. Don't add an
  abstraction for a single caller. Don't build a feature flag or
  configuration surface for something that isn't actually going to vary.
- **SOLID**, applied practically:
  - **S**: a router handles HTTP concerns; a service (`app/services/`) or the
    CRUD layer holds the business/data logic. `app/routers/auth.py` is the
    one deliberate exception (it's cohesive session/account-security logic
    that doesn't benefit from further splitting — see its own module
    docstring).
  - **O/L/I/D**: `CRUDBase` (`app/crud/base.py`) is the concrete example —
    every simple CMS router extends it without modifying it; `require_roles(...)`
    is a dependency any router can compose without touching auth internals.
- **Separation of concerns** — backend: `router → service/crud → model`.
  Frontend: `page → hooks/context → api/`. Don't put a fetch call directly in
  a page component's render body; don't put business rules in a router
  function that a service function should own.
- **Single source of truth** — the backend is authoritative for all
  business-critical state (users, sessions, RBAC, financial records). The
  frontend holds only UI/session-derived state — see
  `docs/CONTACT_BACKEND.md`'s auth section for the exact cookie/session
  contract the frontend must not duplicate or reimplement.
- **Fail fast** — validate at the boundary. Pydantic schemas
  (`app/schemas/`) are the validation layer for every request body; a route
  handler should never receive data it still needs to sanity-check.
  Configuration (`app/core/config.py`) is validated at import time via
  pydantic-settings — a missing/malformed required setting should fail
  before the app starts serving traffic, not on first use in a request.
- **Defensive programming** — never trust client input. File uploads are
  MIME + magic-byte + extension + size validated (`app/utils/uploads.py`)
  before ever touching storage. Every ID path parameter that scopes a
  resource to "the current user's own" must actually check ownership
  server-side (see the IDOR-safe 404 pattern in `routers/auth.py`'s session
  endpoints) — a resource existing is never sufficient, it must also belong
  to the caller.
- **Secure by default** — auth and RBAC (`core/dependencies.py`'s
  `require_roles`) are enforced server-side only; the frontend's role-based
  UI (hiding a button) is a UX nicety, never the actual access control.
  Secrets live in `.env`/`.env.staging` (gitignored) or the deployment
  platform's secret store — never hardcoded, never logged. New
  security-relevant features (MFA, OAuth — see
  `docs/BACKEND_GAPS_AND_ISSUES.md` §4) default OFF until explicitly
  configured.
- **Explicit over implicit** — a route's required role is declared in its
  own decorator/dependency, not inferred from its path. A feature that's
  conditionally available (MFA, OAuth, S3 storage) checks its own settings
  flag explicitly at the top of the function, not via some ambient global
  state.
- **Strong typing** — Python: type hints + Pydantic schemas throughout;
  avoid untyped `dict`/`Any` for anything that has a known shape. Frontend:
  this is a JavaScript (not TypeScript) React app currently — if that
  changes, strict TypeScript is expected from that point forward, not
  retrofitted wholesale in one pass.
- **Consistent API contracts** — every response follows
  `{success, status_code, message, data, errors, meta}` (`app/utils/responses.py`).
  Every list endpoint supports `?page=&limit=&sort=&search=` via
  `app/utils/pagination.py`. Every validation error is `422` with
  `{errors: [{field, message}]}`. Don't invent a one-off response shape for
  a new endpoint — extend the existing envelope.
- **Backward compatibility** — this API has one active frontend consumer
  today, but do not casually break request/response shapes an already-built
  frontend page depends on; check `docs/CONTACT_BACKEND.md` before renaming
  or removing a field a documented endpoint returns.
- **Idempotency** — payment recording (`routers/finance.py`) is
  idempotent on the transaction reference — see `tests/test_payment_idempotency.py`
  for the contract. Any new webhook/retry-prone endpoint must follow the
  same pattern (dedupe key, not "assume it only fires once").
- **Concurrency safety** — don't assume single-writer. Use database
  constraints (unique indexes, foreign keys) as the real guarantee, not just
  application-level checks — see how `UserSession.session_token_hash`/
  `refresh_token_hash` are DB-unique, not just checked-then-inserted.
- **Database integrity first** — every model has real FK constraints
  (`ondelete="CASCADE"` where the child truly can't outlive the parent — see
  `models/user_session.py`). New tables need an Alembic migration in the
  same PR as the model, never a model change assumed to "just work" against
  an unmigrated database.
- **Error handling** — never a bare `except: pass`. If an operation's
  failure genuinely shouldn't fail the caller's request (e.g. a
  best-effort notification email), catch narrowly, log with
  `logger.warning`/`logger.exception` including enough context to debug it
  later, and say why in a comment — see `app/services/email_service.py`'s
  send functions for the pattern every "don't fail the parent operation"
  catch in this codebase follows.
- **Observability** — structured request logging + `X-Request-Id`
  (`main.py`'s `RequestContextMiddleware`) and audit logging for
  state-changing requests (`main.py`'s `AuditMiddleware`, `core/audit.py`)
  already exist — extend them, don't bypass them. A new state-changing
  router doesn't need its own logging; it inherits both automatically by
  being registered normally.
- **Testability** — new business logic needs a real test, not just a
  passing manual check. Follow the existing pattern: mock the DB session
  (`AsyncMock`), assert on what got added/committed, don't spin up a real
  database for a unit test (real-database tests are a separate, explicitly
  named suite — `tests/real_db_verification.py`).
- **Performance by design** — check for N+1 query patterns before adding a
  new list endpoint (`selectinload`/`joinedload` where a relationship is
  always needed by the caller). Don't add caching without a stated
  invalidation rule — see the rate-limiter's own Redis-outage handling
  (`core/limiter.py`) as the standard for "what happens when the cache/infra
  dependency is unavailable."
- **Configuration over hardcoding** — anything that differs between local
  dev and staging (database, Redis, email provider, file storage, feature
  flags) is a `Settings` field in `core/config.py` with a documented env
  var, not a hardcoded value with an `if ENV == "staging"` branch scattered
  through business logic.
- **Dependency discipline** — don't add a library for something a few lines
  of stdlib/existing-dependency code can do. Every dependency added this
  engagement was added for something that genuinely needed it (Argon2id
  hashing needs `argon2-cffi`, TOTP needs `pyotp`, S3-compatible storage
  needs `boto3`) — remove a dependency in the same change that removes its
  last usage (e.g. `aiosmtplib` was removed when email moved to Brevo's HTTP
  API).
- **Boy Scout Rule** — fix what you touch, but a lint/formatting pass is not
  license for an unrelated large refactor. A repo-wide reformat that's pure
  whitespace churn with zero functional change is a decision to make
  explicitly with the team, not a side effect of an unrelated task.

## Code quality gates

- **Backend (Python)**: `ruff check` (linting: bugs, unused imports, import
  order, common bug patterns) + `ruff format` (Black-compatible formatting —
  one tool for both, not Ruff-lint plus a separate Black run, to avoid two
  formatters fighting each other) + `pytest`. Config lives in
  `backend/pyproject.toml`; run from `backend/`:
  ```bash
  ruff check .          # lint
  ruff format .         # format
  pytest                # tests
  ```
  A handful of lint categories are deliberately deferred rather than
  auto-fixed — see the `ignore` list in `backend/pyproject.toml` for exactly
  which ones and why (each has a comment; none are "ignored because
  inconvenient").
- **Frontend (React/Vite)**: `npm run lint` (ESLint, `frontend/eslint.config.js`)
  + `npm test` (Vitest). Run from `frontend/`.
- **Both**: don't merge with the test suite red. Don't silence a lint
  warning with a blanket disable comment when a real fix is available in
  the same amount of effort.

## Where things live (backend)

```
backend/app/
├── core/       # config, database engine, password/token hashing, dependencies, logger, errors, middleware
├── models/     # SQLAlchemy models (UUID PKs, soft-delete-ready via Base)
├── schemas/    # Pydantic request/response models, grouped by domain
├── crud/       # CRUDBase — generic async list/get/create/update/delete
├── routers/    # FastAPI routers, one per resource + aggregator (routers/__init__.py)
├── services/   # business logic reused across routers (auth_service, email_service, storage_service, ...)
├── utils/      # responses, pagination, router_factory, uploads
└── seeders/    # seed.py — creates super admin + reference data
```

See `backend/README.md` for the full architecture writeup — this file
doesn't repeat it.

## Documentation map

- `README.md` (repo root) — project overview.
- `backend/README.md` — backend architecture, setup, auth model, endpoint list.
- `docs/BACKEND_GAPS_AND_ISSUES.md` — current known gaps and their status,
  kept current as work closes them (not a historical log).
- `docs/CONTACT_BACKEND.md` — the frontend-integration contract: auth flow,
  endpoint map, conventions a frontend build must follow.
- `docs/architecture/` — the FastAPI app, database, caching, background
  jobs (or lack of), external integrations.
- `docs/database/` — schema groups, migrations, indexes/constraints,
  transactions, concurrency, soft-delete.
- `docs/security/` — authentication, authorization (including a real,
  documented gap), rate limiting, secrets, audit logging, file-upload
  validation, and the honest current state of security testing.
- `docs/api/` — API-wide conventions only; per-endpoint detail lives in
  `docs/modules/` instead (see why in `docs/api/README.md` — not
  duplicating the same endpoint list into two trees that would drift).
- `docs/modules/` — one README per business module (employees,
  clients-partners, finance, crm-sales, projects, cms, careers, support,
  admin-ops, users-rbac, dashboard-analytics, auth): purpose, permissions,
  data model, business rules, events, dependencies, known gaps. Grouped by
  what actually shares a data model/workflow (~12 groups), not one file
  per router (~50) — a doc per router would drift into staleness faster
  than the grouped version does, and would mostly restate what a router's
  own docstring already says.
- `docs/flows/` — real, multi-step flows worth a step-by-step diagram
  (lead→client conversion, login/session-refresh/MFA handoff, file upload).
- `docs/platform/` — the system architecture (this repo is a FastAPI
  backend + a React/Vite frontend — nothing else — see its own opening
  note for why).
- `docs/decisions/` — ADRs for load-bearing architectural decisions (auth
  design, storage backend, email provider, the authorization-model gap,
  rate-limiter failure mode) — read one before assuming "why is it built
  this way" needs re-litigating.
- `status.md` — the running, append-only evidence ledger: what was verified,
  how, and what real bugs were found along the way. Historical record, not
  a live-status doc — check `docs/BACKEND_GAPS_AND_ISSUES.md` for current state.

When a module's behavior is non-obvious even after reading its
`docs/modules/` entry, the next place to add detail is the router/service's
own docstring (see `app/routers/auth.py`/`app/services/auth_service.py` for
the density this codebase already uses that pattern at), not a third,
separate doc file that risks drifting from both the code and the module doc.
