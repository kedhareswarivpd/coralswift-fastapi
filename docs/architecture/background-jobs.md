# Background Jobs

There is currently **no background job runner** in this backend — no
Celery, no APScheduler, no cron-in-process. This is a real, current-state
gap, stated plainly rather than assumed handled.

## What runs synchronously instead, today

- **Database backups** (`app/routers/backups.py`) — `POST /backups/trigger`
  runs a real `pg_dump` synchronously inside the request, verified working
  end-to-end (file created, listed, downloaded, deleted) against the live
  stack. There is no scheduled backup — someone (or some external cron)
  must call this endpoint.
- **Email sending** (Brevo) — awaited inline in the request that triggers
  it (registration, password reset, MFA notifications, etc.), wrapped in
  try/except so a delivery failure never fails the parent operation, but
  also meaning a slow Brevo response adds directly to that request's
  latency. There is no outbox/retry queue.
- **Audit logging** — writes happen inline via `AuditMiddleware`, using a
  dedicated short-lived DB session (not blocking on the main request's own
  session/transaction), but still synchronously within the request/response
  cycle.

## What this means in practice

- `InvoiceStatus.overdue` has no code path that ever sets it — there's no
  scheduled job that walks past-due invoices and flips their status. This
  is a genuine, code-confirmed gap (see `docs/modules/finance/README.md`).
- If Brevo, Supabase Storage, or Upstash have a slow moment, that latency
  is directly visible to the end user making the triggering request —
  there's no async buffer absorbing it.

## If background jobs are added later

The natural candidates, in likely order of value: scheduled backups (cron
calling the existing `/backups/trigger` logic directly, or the underlying
function, not necessarily the HTTP endpoint), an invoice-overdue sweep,
and an email outbox with retry for Brevo failures that currently just log
and move on. None of this exists yet — don't assume it does when reasoning
about reliability guarantees elsewhere in the system.
