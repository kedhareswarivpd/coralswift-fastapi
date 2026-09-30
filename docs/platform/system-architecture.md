# System Architecture

This "platform" is two applications, not four — see `AGENTS.md`'s opening
note. There is no Next.js app and no Flutter app in this repo.

```
                    ┌─────────────────────────┐
                    │   FastAPI Backend        │
                    │   (backend/app/)         │
                    │                          │
                    │   router → service/CRUD  │
                    │           → model        │
                    └────────┬─────────────────┘
                             │
              ┌──────────────┼──────────────┬───────────────┐
              │              │              │               │
        PostgreSQL        Redis      Brevo (email)    S3-compatible
   (local / Supabase-  (local /      one account,     storage (MinIO
    hosted, staging)    Upstash,      every env         local / Supabase
                        staging)                         Storage staging)
              ▲
              │ HTTP, cookie-based session auth
              │
     ┌────────┴─────────┐
     │  React/Vite SPA   │
     │  (frontend/src/)  │
     └───────────────────┘
```

Deployment: Docker Compose (`docker-compose.yml` base +
`docker-compose.override.yml` for local — adds Postgres and MinIO
containers — or `docker-compose.staging.yml` for staging, which points at
the external Postgres/Redis/storage services instead of local containers).

## What owns what

- **Backend** owns all business logic, all data, all authorization
  decisions. It's the single source of truth for anything business-critical
  — see `AGENTS.md`'s "Single Source of Truth" principle.
- **Frontend** owns UI state and session-derived state only — it never
  makes an authorization decision on its own (role-based UI hiding is a UX
  nicety, not access control) and never talks to Postgres/Redis/Brevo/
  storage directly; everything goes through the backend's API.

## Environments

| | Local dev | Staging |
|---|---|---|
| Backend | Docker container, `docker-compose.override.yml` | Docker container, `docker-compose.staging.yml` |
| Database | local Postgres container | Supabase-hosted Postgres |
| Redis | local container | Upstash (managed) |
| Email | Brevo | Brevo (same account) |
| File storage | MinIO (local container) | Supabase Storage |

See `docs/decisions/` for why each of these was chosen independently
rather than as a single "move everything to one vendor" decision.
