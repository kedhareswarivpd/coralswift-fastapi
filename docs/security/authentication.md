# Authentication

Fully CoralSwift-owned — see
[decisions/ADR-001](../decisions/ADR-001-self-owned-authentication.md) for
why. No external identity provider is consulted for login, sessions, or
credentials in any environment.

## Sessions

Opaque, random tokens (`secrets.token_urlsafe(32)`), hashed with SHA-256
before storage (`app/core/tokens.py`) — a database leak alone never yields
a usable credential, since these are high-entropy random values, not
human-choosable secrets (the reason SHA-256, not Argon2id, is correct
here — see `app/core/tokens.py`'s module docstring).

- **Access token**: 15-minute TTL, httpOnly cookie `cs_access_token`.
- **Refresh token**: 30-day TTL, httpOnly cookie `cs_refresh_token`, rotates
  on every use. **Reuse detection**: presenting an already-rotated-away
  refresh token (matches `previous_refresh_token_hash`, not the current
  hash) immediately revokes the entire session — a theft signal, not a
  late-arriving legitimate request.
- **CSRF token**: non-httpOnly cookie `cs_csrf_token`, must be echoed as
  the `X-CSRF-Token` header on every state-changing request while a
  session cookie is present (double-submit pattern, `core/csrf.py`).
  Login/register are exempt — no session to CSRF-protect yet.

## Passwords

Argon2id (`app/core/password.py`), `argon2-cffi`'s documented
"reasonably secure default for 2024+ hardware" profile
(`time_cost=2, memory_cost=19456 KiB, parallelism=1`). `needs_rehash()` is
checked on every successful login to transparently re-hash if the
parameters are ever tightened later.

**Timing-attack resistance**: login always runs Argon2id verification, even
for a nonexistent email, against a fixed dummy hash — "no such user" and
"wrong password" take equally long, closing a response-time side channel
for email enumeration.

## Account lockout

5 failed login attempts locks the account for 15 minutes, auto-expiring
(`is_account_locked()` checks whether `locked_until` has passed — no manual
admin unlock needed). MFA-code verification failures also count toward this
same lockout counter, not a separate one.

## MFA / 2FA (TOTP)

Off by default (`MFA_ENABLED=false`, a global kill switch — every
`/auth/mfa/*` route 404s when off, regardless of any account's own state).
TOTP secret encrypted at rest (Fernet, `app/core/mfa.py`) — encryption, not
hashing, because a code check needs the secret back in full, unlike a
password or session token. 10 single-use backup codes issued on enable,
hashed the same way as session tokens.

**Login flow when MFA is on**: `POST /auth/login` returns
`{mfa_required: true, mfa_token}` instead of session cookies; the frontend
collects a code and calls `POST /auth/mfa/verify-login`. A wrong code does
**not** burn the challenge (a real bug found and fixed — see `status.md` —
the challenge is only consumed after a successful code check, so a typo
doesn't force the user back to a fresh login).

## OAuth / social login (Google, GitHub)

Off by default (`OAUTH_ENABLED=false`, same global-kill-switch pattern),
each provider additionally gated on its own client credentials being set.
Standard authorization-code flow with CSRF-protected `state` (httpOnly
cookie, compared via `secrets.compare_digest`). Linking a new provider
identity to a pre-existing local account by email only happens when the
provider's own email-verified claim is true — an unverified email is never
sufficient to claim someone else's account.

## Full endpoint list, request/response shapes, and frontend integration contract

See [../CONTACT_BACKEND.md](../CONTACT_BACKEND.md) — it's the canonical,
example-driven reference for every `/auth/*` endpoint; not duplicated here.
