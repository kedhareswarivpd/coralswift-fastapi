# Secrets Management

## Where secrets live

- `backend/.env` (local dev) and `backend/.env.staging` — both **gitignored**
  (verified: `git check-ignore` returns true for both). These hold real
  credentials: the database password, the Brevo API key, S3/MinIO/Supabase
  Storage access keys, `MFA_ENCRYPTION_KEY`, OAuth client secrets when
  configured.
- `backend/.env.example` and `backend/.env.staging.example` are the
  committed templates — every real secret field is blank or an obvious
  placeholder (`your-project-ref`, `your-database-password`), never a real
  value copy-pasted from the real files.
- Docker Compose reads `.env`/`.env.staging` via `env_file:` — secrets
  never appear in `docker-compose.yml`/`.override.yml`/`.staging.yml`
  themselves, which **are** committed.

## What's never logged

- Passwords are hashed (Argon2id) before ever being persisted — the
  plaintext only exists for the duration of the request that received it.
- Session/reset/verification tokens are hashed (SHA-256) before storage —
  the plaintext is only ever in the response that issued it and the
  request that redeems it, never written to a log line.
- `app/core/logger.py`'s request-logging middleware logs method/path/status/
  duration/request-id — never request or response bodies, which is what
  keeps credentials and tokens out of application logs by construction
  (there's no body-logging code path that would need a redaction rule).

## MFA encryption key — a genuine operational risk to call out

`MFA_ENCRYPTION_KEY` (a Fernet key, `app/core/mfa.py`) is what makes every
enabled account's TOTP secret decryptable. **Losing or rotating this key
makes every existing user's stored MFA secret permanently undecryptable** —
there is no re-encryption/migration path in the current code. This is
called out explicitly in `.env.staging.example`'s own comment; treat this
key with the same care as a database password, back it up accordingly, and
never regenerate it casually once real accounts have MFA enabled against it.

## Rotation

No secret in this codebase has an automated rotation mechanism — API keys,
the MFA encryption key, and OAuth client secrets are all long-lived,
manually rotated values. This is a real, stated gap, not a design
guarantee that rotation is unnecessary.
