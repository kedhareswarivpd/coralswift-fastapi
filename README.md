# CoralSwift Technologies — Full-Stack Platform

Combined monorepo: the **React/Tailwind frontend** and the **FastAPI +
Supabase backend**, wired together and deployable as one stack.

```
coralswift-platform/
├── frontend/            # Vite + React + Tailwind (see frontend/README.md)
│   └── docker/            # production Dockerfile + nginx.conf (static build + API proxy)
├── backend/              # FastAPI + SQLAlchemy + Supabase Auth (see backend/README.md)
│   └── docker/             # production Dockerfile (this alone is also usable standalone)
├── docker-compose.yml    # runs frontend + backend + redis together
└── .github/workflows/    # separate, path-scoped CI for each app
```

Each app also has its own detailed README — start there for anything specific
to that half of the stack. This file covers **running them together**.

---

## 1. One-time setup: Supabase

The backend uses **Supabase** for both its Postgres database and its auth
system (signup/login/sessions/password-reset — this backend never stores a
password). You need a Supabase project before anything else will work:

```bash
cp backend/.env.example backend/.env
```

Then follow **`backend/README.md` → "3. Supabase Integration"** to create a
project and fill in `backend/.env`:
- `DB_HOST` / `DB_PORT` / `DB_PASS` (Project Settings → Database)
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API)
- `SUPABASE_JWT_SECRET` (Project Settings → API → JWT Settings)

This is the only required manual setup step — everything else below is
`docker compose up` or `npm`/`uvicorn` commands.

---

## 2. Running everything together (Docker)

```bash
docker compose up -d --build
docker compose exec backend alembic upgrade head
docker compose exec backend python -m app.seeders.seed
```

- Frontend: **http://localhost** (nginx, port 80) — serves the built React
  app and proxies `/api/*` and `/uploads/*` straight to the backend
  container over the internal Docker network.
- Backend directly: **http://localhost:8000** (Swagger docs at `/docs`) —
  exposed separately too, so you can hit the API or check `/docs` without
  going through the frontend proxy.

This is the same "one origin, proxy `/api`" pattern used in local dev (see
below) — just running in containers instead of Vite's dev proxy.

To stop: `docker compose down` (add `-v` to also drop the redis volume).

---

## 3. Running everything locally without Docker

Two terminals:

```bash
# terminal 1 — backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload          # http://localhost:8000

# terminal 2 — frontend
cd frontend
cp .env.example .env
npm install
npm run dev                             # http://localhost:5173
```

Vite's dev server (`frontend/vite.config.js`) proxies `/api/*` to
`http://localhost:8000`, so the two talk to each other with **no CORS setup
needed** — same as the Docker topology, just without containers.

---

## 4. What's actually connected

| Frontend | Backend endpoint | Behavior |
|---|---|---|
| Services page | `GET /api/v1/services` | Falls back to local demo data if the API is unreachable or empty |
| Portfolio page | `GET /api/v1/projects?industry=...` | Server-side industry filtering; same fallback behavior |
| Contact page (`/contact`) | `POST /api/v1/contact` | Real submission with field-level validation errors surfaced in the form |
| "Client Portal" button | `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, `POST /api/v1/auth/logout` | Real Supabase-backed login; session persists across reloads |

A freshly seeded backend only has a super admin, departments, and a few
settings — Services/Portfolio will show demo data with a small "showing
sample data" notice until you add real records via the API.

---

## 5. CI/CD

Each app has its own path-scoped GitHub Actions workflow
(`.github/workflows/backend.yml`, `.github/workflows/frontend.yml`) — pushing
changes under `backend/` only triggers the backend pipeline, and vice versa.
Both build and push a Docker image, then deploy over SSH by running
`docker compose` against this same root `docker-compose.yml` on the target
server.

## 6. Deploying standalone

Both `frontend/` and `backend/` are still fully self-contained and each has
its own `docker/Dockerfile` — you can build, run, or deploy either one
independently of this combined setup if you ever split them into separate
services. `backend/docker/docker-compose.yml` (backend + redis + its own
nginx) is kept for exactly that scenario.
