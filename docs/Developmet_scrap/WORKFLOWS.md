# How This Project's CI/CD Works

This is a beginner-friendly walkthrough of what happens when you work with this repo — from making a change to seeing it live on the server.

---

## 1. The Two Pipelines

This project has **two independent pipelines** — one for the **backend** (Python) and one for the **frontend** (React/Next.js). Each only runs when files it cares about change.

| If you change | The pipeline that runs | Where the config lives |
|---------------|----------------------|----------------------|
| Files in `backend/` | Backend CI/CD | `.github/workflows/backend.yml` |
| Files in `frontend/` | Frontend CI/CD | `.github/workflows/frontend.yml` |
| Workflow files | Both pipelines | `.github/workflows/*.yml` |

> **Why two pipelines?** So your React build breaking doesn't block backend tests (and vice versa). They share no dependencies.

---

## 2. When You Push or Open a Pull Request

### On every push or PR:
1. You push to `main` or `develop`, **or** you open a PR to `main`.
2. GitHub checks if any changed files match the pipeline's path filter (`backend/**` or `frontend/**`).
3. If yes → the pipeline **starts running**.

### What runs on every push/PR:

#### Backend pipeline does:
- Spins up a **temporary PostgreSQL database** (Postgres 16, pre-seeded with a fake `auth.users` table so tests don't need the real Supabase).
- Installs Python + dependencies.
- Runs `pytest -v` — **all tests must pass**.

#### Frontend pipeline does:
- Installs Node.js + npm packages.
- Runs `npm run lint` (code style checks).
- Runs `npm run build` (creates the production build).

> If tests or lint or build **fail**, the pipeline stops. Your PR shows a ❌ and the team knows not to merge it.

---

## 3. When Code Merges to `main` — Deploy Happens Automatically

If your PR is approved and merged **into `main`**, the pipeline does one more thing: it **deploys to the live server**.

### What deploy does:

#### Both backend and frontend:
1. **Builds a Docker image** from your code and **pushes it to Docker Hub** (tagged `latest` + with the commit hash).
2. **SSHes into the production server** at `/opt/coralswift-platform`.
3. Runs `docker compose pull` to grab the new image, then `docker compose up -d` to restart the service.

#### Backend additionally:
4. Runs database migrations: `docker compose exec -T backend alembic upgrade head`
   - This means **schema changes you make to the database get applied automatically** on deploy.

#### Frontend:
- No extra steps — just the image update and restart.

---

## 4. The `develop` Branch

If you push to **or open a PR to `develop`**, the pipeline runs **tests/build only** — it does **not** deploy. You can use this branch to validate your code before sending a PR to `main`.

---

## 5. What Secrets Are Needed (For Maintainers)

The pipelines need access to these secrets (set in GitHub > Settings > Secrets):

| Secret | Why it's needed |
|--------|----------------|
| `DOCKERHUB_USERNAME` + `DOCKERHUB_TOKEN` | To log into Docker Hub and push images |
| `DEPLOY_HOST` | The IP/hostname of the production server |
| `DEPLOY_USER` | The SSH username for that server (`ubuntu` or `root`) |
| `DEPLOY_SSH_KEY` | A private SSH key that can connect to the server |

Without these, the **build-and-push** and **deploy** jobs will fail.

---

## 6. Visualizing the Flow

### For a typical PR to `main`:

```
1. You push to backend/
       │
       ▼
2. Backend pipeline triggers
       │
       ├── PostgreSQL spins up
       ├── Python + deps installed
       ├── Tests run (pytest)
       │       │
       │       ├── ✅ Pass → pipeline continues
       │       └── ❌ Fail → PR shows red X
       │
3. If merged to main →
       │
       ├── Docker image built + pushed to Docker Hub
       ├── SSH into production server
       ├── docker compose pull backend
       ├── docker compose up -d backend
       └── alembic upgrade head  (applies DB migrations)
```

---

## Quick Troubleshooting

| Problem | Check |
|---------|-------|
| Pipeline didn't run after push | Did the changed file match `backend/**` or `frontend/**`? Did you push to `main` or `develop`? |
| Tests pass locally but fail in CI | CI uses a stripped-down Postgres. Check the "Create minimal auth.users shim" step — some tests might need real Supabase auth. |
| Deploy step fails | Check `DEPLOY_SSH_KEY`, `DEPLOY_HOST`, `DEPLOY_USER` secrets. Verify SSH access to the server. |
| Docker push fails | Check `DOCKERHUB_USERNAME` / `DOCKERHUB_TOKEN` — token may have expired. |
