# ADR-001: Self-owned authentication (opaque sessions, not JWTs, no external identity provider)

## Context

The backend originally delegated authentication to Supabase Auth: signup,
login, password reset, and session issuance all went through Supabase's API,
with this app only verifying the resulting JWT. This meant the identity/
session/credential source of truth lived outside this application entirely.

## Decision

Authentication was rebuilt to be fully CoralSwift-owned
(`backend/app/services/auth_service.py`):

- Sessions are opaque, random, database-backed tokens (`user_sessions`
  table) — not JWTs.
- Passwords are hashed with Argon2id (`app/core/password.py`).
- High-entropy random tokens (sessions, password-reset, email-verification)
  are hashed with SHA-256 before storage (`app/core/tokens.py`).
- Refresh tokens rotate on every use, with reuse detection: presenting an
  already-rotated-away refresh token revokes the entire session immediately.
- Account lockout after repeated failed attempts, auto-expiring.

## Alternatives considered

- **Keep Supabase Auth, only change the transport to cookies.** This was
  actually the state after an earlier pass — cookies replaced Bearer-header
  JWTs, but Supabase Auth remained the identity provider underneath. It was
  explicitly rejected as insufficient per later instruction: Supabase was
  required to be usable *only* as a database hosting layer, never as the
  auth source of truth.
- **JWTs issued by this app instead of Supabase.** Rejected: a session's
  entire value is revocability, which a stateless JWT doesn't offer without
  its own revocation-list lookup anyway — at which point it's a
  database-backed session with extra serialization overhead, not a
  simplification.

## Trade-offs

- Every authenticated request does a database lookup (session table) rather
  than a stateless signature check. Accepted: this app's actual concurrency
  profile doesn't make that lookup a bottleneck, and it buys real,
  synchronous revocation (logout/logout-all/session-revoke all take effect
  immediately, not "until the JWT expires").
- Pre-existing users (from the Supabase Auth era) had no application-known
  plaintext password to migrate — each such account is backfilled with an
  unusable placeholder hash and must go through `forgot-password` once. This
  is a one-time migration cost, not an ongoing one.

## Consequences

- Supabase/Postgres may still be used as a hosted database in staging (see
  ADR-002 is not needed for this — it's just `DB_HOST` pointing at Supabase's
  Postgres), but this is now completely independent of authentication.
- MFA/2FA and OAuth (Google/GitHub) were later added on top of this
  foundation, both off by default — see the login-flow branch in
  `app/routers/auth.py` for how they hand off to/from the base
  password-login flow without changing its core contract.

See `docs/BACKEND_GAPS_AND_ISSUES.md` §4 and `status.md`'s corresponding
session entry for the full live-drill evidence this was actually verified
against a running stack, not just implemented.
