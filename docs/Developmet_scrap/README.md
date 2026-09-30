# Documentation Map

Start at the repo root's [`AGENTS.md`](../AGENTS.md) for engineering rules,
and [`backend/README.md`](../backend/README.md) for backend setup and
architecture. This folder holds cross-cutting docs that don't belong to one
specific app.

## Current and actively maintained

- **[BACKEND_GAPS_AND_ISSUES.md](BACKEND_GAPS_AND_ISSUES.md)** — the current
  state of known gaps/findings, updated as work closes them. This is the
  document to check for "is X actually done."
- **[CONTACT_BACKEND.md](CONTACT_BACKEND.md)** — the frontend-integration
  contract: auth flow, endpoint map, conventions a frontend build must
  follow. Written from and verified against the real running backend.
- **[decisions/](decisions/)** — ADRs for load-bearing architectural
  decisions (why auth/storage/email are built the way they are), each with
  context, alternatives considered, trade-offs, and consequences.

## Historical record

- **[`../status.md`](../status.md)** — an append-only, chronological
  evidence ledger: what was verified, how, and what real bugs were found
  along the way, session by session. Useful for "why was this built this
  way" or "what was actually tested," not for "what's the current state" —
  use `BACKEND_GAPS_AND_ISSUES.md` for that instead, since a historical
  ledger doesn't get retroactively corrected when something it described
  later changes.

## Pre-existing files not covered by the sessions behind the docs above

`API_REPORT.md`, `BRAIN.md`, `FLOWCHART.md`, `MODULE_TEST_REPORT.md`,
`PROJECT_ROUTES.md`, `ROLE_WORKFLOW.md`, `TEST_COVERAGE_REPORT.md`,
`TEST_REPORT.md`, `UIUX_REPORT.md`, `WORKFLOW.md`/`WORKFLOWS.md`,
`audit.md`, `prd.txt`, `sonar-issues-report.md`/`.pdf`, and the two PDFs
predate the sessions that produced the docs above and haven't been
cross-checked against the current codebase by this effort — treat their
content as a historical planning/audit snapshot, not a live source of truth,
until someone verifies them against the running app the way
`BACKEND_GAPS_AND_ISSUES.md` was.

## Why this structure

Per this repo's own engineering rules (`AGENTS.md`): document behavior and
ownership at the right level, don't duplicate the same fact across five
files, and don't let documentation describe behavior that doesn't exist. A
per-router-module doc tree was deliberately not built for this backend's
~50 routers — see `AGENTS.md`'s documentation-map section for why, and what
to do instead when a specific module's behavior genuinely needs its own
write-up.
