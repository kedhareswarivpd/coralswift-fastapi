# Caching

There is currently **no query/response caching layer** in this backend —
Redis exists, but its only consumer is the rate limiter
(`app/core/limiter.py`, via `slowapi`). This is a deliberate, current-state
fact, not an oversight to silently paper over: every read endpoint hits
Postgres directly.

## What Redis is used for today

- **Rate limiting** — `slowapi.Limiter`, keyed by client IP
  (`core/dependencies.py::get_client_ip`, which only trusts
  `X-Forwarded-For` when `TRUST_PROXY_HEADERS=true`, to prevent spoofing
  bypassing the limit). `storage_uri` points at Redis specifically because
  this app runs multiple gunicorn workers — an in-memory counter would be
  per-process, silently multiplying the effective limit by the worker count.
- **Resilience**: `swallow_errors=True` + `in_memory_fallback_enabled=True` —
  rate limiting is defense-in-depth, not the primary authorization boundary
  (every endpoint still enforces auth/RBAC independently regardless of rate
  limit state), so a Redis outage degrades to a fast in-memory fallback
  rather than either blocking every request for seconds (the pre-fix
  behavior, found via a live outage drill — see `status.md`) or taking the
  whole API down.

## Environment differences

- **Local dev** — a local Redis container (`docker-compose.override.yml`).
- **Staging** — Upstash (managed, TLS-required Redis) via
  `REDIS_URL_OVERRIDE` in `backend/.env.staging`. See
  `docs/decisions/` for why Redis specifically moved to a managed provider
  in staging while storage moved to a different provider (Supabase Storage)
  and email to a third (Brevo) — each was a matrixed, independent choice,
  not a single "move everything to one vendor" decision.

## If a real cache layer is added later

Per `AGENTS.md`'s "Cache Correctness" principle: don't cache for caching's
sake. Any future addition needs a stated TTL and invalidation rule up
front, and must never let sensitive per-user data leak through a
shared/keyed-by-the-wrong-thing cache entry — there is no existing pattern
in this codebase to follow yet, so that design work is still ahead of
whoever adds it, not something this doc can retroactively describe.
