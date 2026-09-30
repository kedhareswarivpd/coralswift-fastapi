# External Integrations

Three external services, each chosen and wired independently — see
`docs/decisions/` for the full reasoning behind each:

| Concern | Local dev | Staging | Decision record |
|---|---|---|---|
| Email | Brevo (HTTP API) | Brevo (same account) | [ADR-003](../decisions/ADR-003-brevo-transactional-email.md) |
| File storage | MinIO (local container, S3-compatible) | Supabase Storage (S3-compatible) | [ADR-002](../decisions/ADR-002-s3-compatible-file-storage.md) |
| Redis | local container | Upstash (managed) | see `caching.md` |

## Email — Brevo

`app/services/email_service.py`. One function, `send_email(to, subject, html_body)`,
called by every notification (`send_welcome_email`, `send_password_reset_email`,
`send_verification_email`, `send_password_changed_notification`,
`send_mfa_enabled_notification`, `send_mfa_disabled_notification`,
`send_contact_notification`). All are best-effort — wrapped in try/except at
the call site so an email failure never fails the operation that triggered
it, always logged via `logger.warning` when it does fail.

## File storage — S3-compatible (MinIO / Supabase Storage)

`app/services/storage_service.py` + `app/utils/uploads.py`. Selected via
`STORAGE_BACKEND` (`local` default, or `s3`). Every upload is validated
(MIME allowlist, extension allowlist, magic-byte check, size cap) before
ever reaching storage — see `security/file-upload-security.md`.

Public files (media, gallery, etc.) get a bucket key under `public/`;
private files (career resumes) get a key under `private/` and are only ever
retrieved through this app's own authenticated download endpoints, never a
direct bucket URL — same contract regardless of `local` vs `s3` backend.

## Redis — local container / Upstash

See `caching.md` — rate limiting is the only consumer today.

## Third-party accounts this app does NOT integrate with (yet)

No payment gateway (Stripe/Razorpay/etc.) — `Payment` rows are recorded
manually via `POST /finance/invoices/{id}/payments`, not created by a
webhook from a payment processor. No calendar/video integration for
`Meeting.meeting_link` — it's a plain string field, not a Zoom/Google Meet
API call. No SMS/push notification channel — `Notification` rows
(`app/models/notification.py`) are in-app only, read via
`GET /notifications`, not pushed to a device or delivered by any other
channel.
