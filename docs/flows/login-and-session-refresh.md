# Flow: Login, Session Refresh, MFA Handoff

```
POST /auth/login { email, password }
    │
    ├─▶ Argon2id verify (always runs, even for unknown email — timing-safe)
    │
    ├─▶ wrong password / unknown email → 401 (identical response either way)
    ├─▶ account locked → 403
    ├─▶ account deactivated → 403
    │
    ├─▶ IF MFA_ENABLED and user.mfa_enabled:
    │       → 200 { mfa_required: true, mfa_token }   (NO session cookies yet)
    │       │
    │       ▼
    │   POST /auth/mfa/verify-login { mfa_token, code }
    │       ├─▶ wrong code → 401 (challenge NOT consumed — retry allowed)
    │       └─▶ correct code (TOTP or single-use backup code) ↓
    │
    └─▶ ELSE (or after successful MFA) →
            session created, cookies set:
            cf_access_token (15min), cf_refresh_token (30 days), cf_csrf_token
            → 200 { user }
```

## Refresh (called by the frontend on any 401 from an authenticated endpoint)

```
POST /auth/refresh   (reads cf_refresh_token cookie, X-CSRF-Token required)
    │
    ├─▶ token matches a live session's CURRENT refresh hash
    │       → rotate: new access+refresh tokens, new cookies, 200
    │
    └─▶ token matches a session's PREVIOUS (already-rotated-away) hash
            → THEFT SIGNAL: revoke the entire session immediately, 401
              (the legitimately-rotated new token stops working too)
```

**Frontend must never fire two `/auth/refresh` calls concurrently for the
same session** — a race between them looks exactly like a theft replay and
kills the session for both callers. See
[CONTACT_BACKEND.md](../CONTACT_BACKEND.md) for the exact recommended
single-flight interceptor pattern.

## Related docs

[security/authentication.md](../security/authentication.md) for the
mechanism, [CONTACT_BACKEND.md](../CONTACT_BACKEND.md) for frontend
integration examples, [decisions/ADR-001](../decisions/ADR-001-self-owned-authentication.md)
for why sessions work this way.
