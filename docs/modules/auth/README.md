# Module: Authentication

**Purpose**: identity, sessions, and account security for every other
module — every other module's endpoints depend on this one resolving
"who is making this request."

**Users**: everyone — public self-registration, every authenticated role.

**This module's docs live in three places, deliberately not duplicated
here**:
- [security/authentication.md](../../security/authentication.md) — the
  mechanism (sessions, passwords, MFA, OAuth, CSRF).
- [decisions/ADR-001](../../decisions/ADR-001-self-owned-authentication.md) —
  why it's built this way.
- [CONTACT_BACKEND.md](../../CONTACT_BACKEND.md) — the full endpoint
  list with request/response examples, written for frontend integration.

**Data model**: `users`, `user_sessions`, `password_reset_tokens`,
`email_verification_tokens`, `mfa_backup_codes`, `mfa_challenges`,
`oauth_accounts`.

**Dependencies**: none (this is the foundation every other module depends
on, not the reverse).

**Events**: password-reset, email-verification, welcome, and MFA
enabled/disabled notifications, all via Brevo (`architecture/integrations.md`).
