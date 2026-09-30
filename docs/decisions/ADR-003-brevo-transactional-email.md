# ADR-003: Brevo's HTTP API for transactional email (not SMTP)

## Context

Email (contact-form notifications, password reset, email verification,
welcome, MFA notifications) originally went through `aiosmtplib` against a
Gmail SMTP relay. The requirement was to move to Brevo, for both local dev
and staging (unlike storage/Redis, which are matrixed differently per
environment).

## Decision

`backend/app/services/email_service.py` was rewritten to call Brevo's
transactional email HTTP API (`POST https://api.brevo.com/v3/smtp/email`,
`api-key` header) via `httpx` (already a dependency), rather than an SMTP
relay. One Brevo account/API key serves both environments. `aiosmtplib` was
removed from `requirements.txt` entirely — there is no SMTP code path left
to fall back to.

## Alternatives considered

- **Brevo's SMTP relay instead of its HTTP API.** Not used: SMTP relay
  needs a separate "SMTP key" credential distinct from the general API key
  that was actually provided, and the HTTP API is Brevo's own recommended
  integration path (better delivery tracking, no SMTP port/firewall
  concerns in containerized environments).

## Trade-offs

- Brevo requires the sender address to be a verified sender/domain in that
  Brevo account — an unverified `BREVO_SENDER_EMAIL` makes every send fail
  with a 4xx from Brevo's API. This is a one-time dashboard setup cost, not
  an ongoing one, and it fails loudly (logged) rather than silently.

## Consequences (a real bug this decision surfaced)

The mocked pytest suite originally needed to prevent real network calls to
Brevo during tests. The first attempt patched
`app.services.email_service.httpx.AsyncClient` — but since `email_service.py`
does `import httpx` (not `from httpx import AsyncClient`), that name **is**
the shared `httpx` module object; patching an attribute on it patched
`httpx.AsyncClient` globally for the entire test process, breaking 618
unrelated RBAC-matrix tests that also use `httpx.AsyncClient` for their own
test HTTP client. Fixed by forcing `settings.brevo_api_key = ""` for the
mocked test session instead — `send_email()`'s own existing guard
(`if not settings.brevo_api_key: return`) already no-ops safely without
touching `httpx` at all. Documented here because it's a reusable lesson: **never
patch an attribute on a module that another module imports directly** (`import httpx`
followed by `httpx.AsyncClient`) — patch the narrowest name that's actually
private to the code under test, or patch behavior (a settings flag,
a wrapper function) instead of a shared library's own namespace.

See `docs/BACKEND_GAPS_AND_ISSUES.md` §5a and `status.md`'s corresponding
session entry for the full account.
