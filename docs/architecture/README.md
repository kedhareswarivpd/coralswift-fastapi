# Architecture

This backend is a single FastAPI application (`backend/app/`) behind a
layered structure: `router → service/CRUD → model`. There is no separate
microservice split — it's one deployable unit, one Postgres database, one
Redis instance, plus three external services (Brevo for email, an
S3-compatible bucket for files, and Redis itself, which is either a local
container or Upstash depending on environment).

## Layers

```
HTTP request
    │
    ▼
Middleware stack (see application.md — CORS, security headers, CSRF,
audit logging, request-ID/access-log, rate limiting)
    │
    ▼
Router (app/routers/*.py) — HTTP concerns only: path, method, status code,
which Pydantic schema validates the body, which dependency gates access
    │
    ▼
Service (app/services/*.py) or CRUDBase (app/crud/base.py) — the actual
business/data logic. ~15 simple CMS resources (Services, Testimonials,
FAQs, etc.) go straight through CRUDBase via build_crud_router
(app/utils/router_factory.py) and never need their own service; anything
with real logic (auth, contract signing, file uploads, payments) has a
dedicated service function.
    │
    ▼
Model (app/models/*.py) — SQLAlchemy 2.0 async ORM, UUID primary keys,
soft-delete-ready (every model has created_at/updated_at/deleted_at via
core/database.py's Base)
    │
    ▼
PostgreSQL (local container in dev, optionally Supabase-hosted in staging —
see database.md)
```

## Sub-documents

- [application.md](application.md) — the FastAPI app itself: middleware
  stack, request lifecycle, error handling, health checks.
- [database.md](database.md) — Postgres, SQLAlchemy async engine, migrations,
  connection pooling.
- [caching.md](caching.md) — what Redis is (and isn't) used for today.
- [background-jobs.md](background-jobs.md) — current state: none, and why.
- [integrations.md](integrations.md) — Brevo, S3-compatible storage, Upstash;
  points at the ADRs in `docs/decisions/` for the reasoning behind each.

## What this is not

There's no separate "repository layer" distinct from the SQLAlchemy models —
`CRUDBase` (app/crud/base.py) plays that role generically for simple
resources, and a service function plays it directly (via `db.execute(select(...))`)
for anything more specific. Introducing a formal repository-interface layer
on top of an already-thin ORM would be exactly the kind of unnecessary
abstraction `AGENTS.md`'s KISS section warns against — there's no second
data-source implementation this app needs to swap in that would justify it.
