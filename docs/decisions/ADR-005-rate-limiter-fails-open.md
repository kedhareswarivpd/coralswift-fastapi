# ADR-005: Rate limiter fails open on Redis outage, not closed

## Context

`slowapi`'s Redis-backed rate limiter needs to decide what happens when
Redis itself is unreachable: reject all traffic (fail closed, safest
against abuse) or allow all traffic through unlimited (fail open, safest
for availability). A live outage drill (killing Redis mid-traffic)
originally found the *unconfigured* default behavior was neither cleanly
closed nor cleanly open — it was catastrophically slow: slowapi's
synchronous Redis check ran directly in the async request path with no
thread offload, so a hung connection blocked that worker's entire event
loop, serializing every concurrent request onto it (measured up to ~12s
per request during the drill).

## Decision

`swallow_errors=True` + `in_memory_fallback_enabled=True`
(`app/core/limiter.py`) — explicitly fail **open**, fast, via a
per-worker in-memory fallback counter, the moment Redis is detected
unreachable (with periodic backoff re-probing of the real backend).
Combined with a tuned-down DNS resolver timeout
(`docker-compose.yml`'s `dns_opt`) to cut the first-failure detection time
itself.

## Alternatives considered

- **Fail closed** (reject all requests while Redis is down) — rejected:
  rate limiting here is explicitly defense-in-depth, not the primary
  authorization boundary (every endpoint still enforces real auth/RBAC
  independently of rate-limit state). Taking the entire API offline
  because a secondary abuse-prevention layer's backing store is briefly
  unavailable was judged worse than temporarily losing the
  shared-across-workers property of the limit.
- **Do nothing (accept the blocking behavior)** — rejected outright once
  the live drill quantified it: ~12s per request during an outage is a
  full incident on its own, independent of the rate-limiting question.

## Trade-offs

During a Redis outage, rate limiting degrades from "shared limit across
all 4 gunicorn workers" to "independent limit per worker" — effectively up
to 4x the nominal limit for the outage's duration. Accepted as a
reasonable, bounded degradation versus the alternatives.

## Consequences

This same fail-open philosophy is why staging currently has a real, open
gap: with Upstash's connection string not yet correctly configured (see
`docs/BACKEND_GAPS_AND_ISSUES.md` §5c), staging's rate limiter has been
running in permanent per-worker-fallback mode rather than erroring loudly
— which is the intended resilience behavior working exactly as designed,
but it also means the *absence* of shared rate limiting in staging has
been silent rather than alarmed. `docs/security/rate-limiting.md` states
this explicitly so it isn't mistaken for "rate limiting is fine because
nothing crashed."
