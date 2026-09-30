# Documentation Map

Start at the repo root's [`AGENTS.md`](../AGENTS.md) for engineering rules,
and [`backend/README.md`](../backend/README.md) for backend setup. This
folder holds everything else.

## Current and actively maintained

- **[BACKEND_GAPS_AND_ISSUES.md](BACKEND_GAPS_AND_ISSUES.md)** — the
  current state of known gaps/findings, updated as work closes them. Check
  this for "is X actually done."
- **[CONTACT_BACKEND.md](CONTACT_BACKEND.md)** — the frontend-integration
  contract: auth flow, endpoint map, conventions, verified against the
  real running backend.
- **[architecture/](architecture/)** — the FastAPI app, database, caching,
  background jobs (or lack of), external integrations.
- **[database/](database/)** — schema groups, migrations, indexes/
  constraints, transactions, concurrency, soft-delete.
- **[security/](security/)** — authentication, authorization (including a
  real gap: the `Role`/`Permission` tables aren't actually consulted),
  rate limiting, secrets, audit logging, file-upload validation, and the
  honest current state of security testing (no SonarQube/OWASP ZAP wired
  in yet).
- **[api/](api/)** — API-wide conventions; per-endpoint detail lives in
  `modules/` instead, deliberately not duplicated into a second tree.
- **[modules/](modules/)** — one README per business module (employees,
  clients-partners, finance, crm-sales, projects, cms, careers, support,
  admin-ops, users-rbac, dashboard-analytics, auth): purpose, permissions,
  data model, business rules, events, dependencies, and known
  code-confirmed gaps for each.
- **[flows/](flows/)** — the real multi-step flows worth a diagram (lead→
  client conversion, login/session-refresh/MFA handoff, file upload).
- **[platform/](platform/)** — the two-application system architecture
  (backend + frontend — no Next.js/Flutter exist in this repo).
- **[decisions/](decisions/)** — ADRs for load-bearing architectural
  decisions, each with context, alternatives, trade-offs, consequences.

## Historical record

- **[`../status.md`](../status.md)** — an append-only, chronological
  evidence ledger: what was verified, how, and what real bugs were found,
  session by session. Use this for "why was this built this way" or "what
  was actually tested"; use `BACKEND_GAPS_AND_ISSUES.md` for "what's the
  current state," since a historical ledger doesn't get retroactively
  corrected when something it described later changes.

## Superseded / pre-existing, not verified against the current codebase

`docs/Developmet_scrap/` holds files that predate the sessions behind the
docs above and haven't been cross-checked against the running app
(`API_REPORT.md`, `BRAIN.md`, `FLOWCHART.md`, `MODULE_TEST_REPORT.md`,
`PROJECT_ROUTES.md`, `ROLE_WORKFLOW.md`, `TEST_COVERAGE_REPORT.md`,
`TEST_REPORT.md`, `UIUX_REPORT.md`, `WORKFLOW.md`/`WORKFLOWS.md`,
`audit.md`, `prd.txt`, `sonar-issues-report.md`/`.pdf`, and a
superseded `README.md`) — treat their content as a historical planning/
audit snapshot, not a live source of truth. `docs/requirments/` holds the
two original content-planning PDFs for the same reason.

**Note**: `CONTACT_BACKEND.md` and `BACKEND_GAPS_AND_ISSUES.md` were found
swept into `Developmet_scrap/` alongside the genuinely-stale files during
this pass — moved back to `docs/` root, since both are actively maintained
and current (verified against the real running stack as recently as this
session), not historical scrap.

## Why this structure

Per `AGENTS.md`'s own rules: document behavior and ownership at the right
level, don't duplicate the same fact across five files, and don't let
documentation describe behavior that doesn't exist. Endpoint-level detail
lives with the module that owns it (`modules/`), not in a second
hand-maintained `api/` tree that would drift the moment one side updates
without the other — see `api/README.md` for that reasoning stated in full.
