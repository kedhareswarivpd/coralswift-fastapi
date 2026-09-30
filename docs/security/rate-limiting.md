# Rate Limiting

`slowapi.Limiter` (`app/core/limiter.py`), keyed by client IP
(`get_client_ip` — only trusts `X-Forwarded-For` when
`TRUST_PROXY_HEADERS=true`, otherwise an attacker could spoof the header
and bypass the limit entirely).

## Limits

- Default: `300/15minute` (`RATE_LIMIT` setting) applied globally via
  `SlowAPIMiddleware`.
- Tighter, endpoint-specific limits via the `@limiter.limit(...)` decorator:
  `POST /auth/register` — `10/hour`; `POST /auth/login` — `10/minute`;
  `POST /auth/mfa/verify-login` — `10/minute`; `POST /auth/refresh` —
  `30/minute`; `POST /auth/forgot-password` — `5/minute`;
  `POST /auth/reset-password` — `10/hour`; `POST /auth/resend-verification` —
  `5/minute`; `POST /auth/mfa/setup` — `5/minute`; `POST /auth/mfa/enable` —
  `10/minute`; `POST /auth/mfa/backup-codes/regenerate` — `5/minute`;
  `GET/POST /auth/oauth/{provider}/login` / `callback` — `20/minute`;
  `POST /careers/{id}/apply` — `5/hour`; `POST /comments` — `5/minute`;
  `POST /contact` — `5/minute`; `POST /newsletter/*` (2 routes) — `5/minute`
  each; `POST /analytics/track` — `60/minute`.

## Resilience under a Redis outage

Rate limiting is defense-in-depth, not the authorization boundary — every
endpoint still enforces auth/RBAC independently regardless of rate-limit
state. `swallow_errors=True` + `in_memory_fallback_enabled=True` means a
Redis outage degrades to a fast in-memory-per-worker fallback rather than
either blocking every request or taking the API down.

This specific configuration exists because of a real, live-drilled
incident (documented in full in `status.md` as "CF-BE-014"): without
`in_memory_fallback_enabled`, slowapi's synchronous Redis check ran
directly in the async request path with no thread offload — a hung Redis
connection blocked that worker's entire event loop, serializing every
concurrent request onto it. A live outage drill measured up to ~12s per
request during the outage before the fix; with the fix (plus a Docker DNS
resolver timeout tuned down in `docker-compose.yml`), the same drill showed
at most one ~1s hit per worker process, then fast in-memory limiting until
Redis recovered.

## Staging currently has a real, unresolved rate-limiting gap

Staging's Redis is Upstash, and as of this writing `REDIS_URL_OVERRIDE` in
`backend/.env.staging` has never had a working connection string — see
`docs/BACKEND_GAPS_AND_ISSUES.md` §5c. Because of the resilience design
above, this fails **open**, not closed: staging currently has no real,
shared rate limiting in effect (each worker would fall back to its own
in-memory counter the moment it first tries and fails to reach Redis).
This is a real, current gap, not a hypothetical — it needs the actual
Upstash TCP connection string (not the REST API token that's been
provided so far) before staging's rate limiting is genuinely active.
