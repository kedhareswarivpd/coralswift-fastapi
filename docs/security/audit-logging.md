# Audit Logging

`app/core/audit.py::log_audit()`, called from `AuditMiddleware`
(`app/main.py`) — automatic, not something each router opts into
individually.

## What triggers a log entry

Every request that is **not** `GET`/`HEAD`/`OPTIONS`, whose path doesn't
start with `/health`, `/docs`, `/redoc`, `/openapi.json`, or `/uploads`,
and whose response was a `2xx` — i.e. every successful state-changing API
call. Failed requests (4xx/5xx) are **not** audit-logged — a failed login
attempt, a rejected CSRF request, or a validation error leaves no
`audit_logs` row.

## What's recorded

`user_id` (resolved from the session cookie via a dedicated short-lived DB
session, since middleware runs outside the route handler's own
`Depends(get_db)` lifecycle — `null` for an unauthenticated successful
request, e.g. `POST /auth/register`), `action` (`{METHOD}_{path-with-slashes-as-underscores}`),
`entity_type`/`entity_id` (best-effort, parsed from the last two path
segments — works for `/resource/{id}` shaped paths, is `null` for anything
else), `ip_address`, `user_agent`, and `log_metadata` (the path and raw
query string).

## A real, fixed bug worth knowing about if you're relying on historical data

`AuditMiddleware` was, for a period during this project's cookie-auth
migration, still reading the `Authorization: Bearer` header from the
pre-cookie auth scheme instead of the session cookie — meaning **every**
authenticated action's audit entry had `user_id=null` during that window,
even though the action genuinely was performed by an authenticated user.
Fixed in a later session (see `status.md`). If you're querying
`audit_logs` for historical data, be aware `user_id=null` on an
old row doesn't necessarily mean the action was anonymous — check the row's
date against when this was fixed if it matters for an investigation.

## What's read-only

`GET /audit-logs` (`require_roles("admin")`, filters `user_id`, `action`,
`entity_type`) is the only route — there is no update/delete endpoint for
audit entries, which is correct behavior for an audit trail, not a missing
feature.

## What's NOT audit-logged

Read (`GET`) operations — there's no record of who *viewed* a resource,
only who changed one. If a future compliance requirement needs read-access
logging (e.g. "who viewed this client's financial records"), that's new
scope, not something `AuditMiddleware` already does partially.
