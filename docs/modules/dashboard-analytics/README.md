# Module: Dashboard, Stats & Analytics

**Purpose**: aggregate business metrics (internal dashboard) and public
site analytics (page views).

## Endpoints

```
GET  /dashboard/overview                    (admin, project_manager, finance, sales)
GET  /dashboard/projects/status-breakdown   (same roles)
GET  /stats                                 (PUBLIC — no auth dependency at all)
POST /analytics/track                       (public, rate-limited 60/minute)
GET  /analytics/summary                     (admin, marketing)
```

## What each returns

- `/dashboard/overview`: active employees, total/active clients, total/
  active projects, open tasks, `total_revenue` (sum of `completed`
  payments), open tickets, new applications, unresolved contact
  submissions, published blog count.
- `/dashboard/projects/status-breakdown`: project count grouped by
  `Project.status`.
- `/stats`: totals for services, projects (excluding soft-deleted —
  `deleted_at IS NULL`), active projects, active employees, clients,
  distinct client countries, employee/client user counts. Every count is
  wrapped in try/except defaulting to `0` on failure — designed as a
  defensive public marketing-page widget, not an internal report.
- `POST /analytics/track`: records one `PageView` (path, IP via the
  proxy-trust-aware `get_client_ip`, user agent, referrer, country).
- `/analytics/summary`: total views, unique paths, top 20 pages by views.

## A real, code-confirmed observation worth explicit sign-off

**`/stats` has no authentication or authorization check at all** — every
other dashboard/stats endpoint in this codebase is role-gated; this one
alone exposes aggregate internal business counts (employee count, client
count, project counts) to any unauthenticated caller. This is very likely
intentional (a public-site stats widget), but given it's the one exception
to an otherwise-consistent pattern, it's worth an explicit "yes, this is
meant to be public" confirmation rather than assuming it.

## Dependencies

Reads across nearly every other module (employees, clients, projects,
tasks, payments, tickets, applications, contact submissions, blogs) —
this module has no data of its own beyond `PageView`.

## Known gaps

`/stats`'s public exposure (see above) is the only item worth flagging;
otherwise no code-level TODOs found in these three routers.
