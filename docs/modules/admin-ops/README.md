# Module: Admin Ops (Backups, Settings, SEO, Media, Notifications, Audit)

**Purpose**: operational/administrative surfaces that don't belong to any
one business module.

## Backups

`super_admin` only, all routes:

```
GET    /backups                        (lists coralswift-*.dump files, newest first)
POST   /backups/trigger                (real pg_dump, 300s timeout)
GET    /backups/{filename}/download
DELETE /backups/{filename}
```

Real, working, live-verified (`pg_dump` file created/listed/downloaded/
deleted against the live stack) — but manual-trigger only, see
[architecture/background-jobs.md](../../architecture/background-jobs.md).
Filenames are validated against a strict regex
(`^coralswift-[a-z]+-\d{8}T\d{6}Z\.dump$`) before ever touching the
filesystem for download/delete, closing a path-traversal vector on a
user-supplied filename.

## Settings

`admin`/`super_admin`. Key-value store, upserted by string `key` (not a
UUID): `GET /settings` (optional `?group=`), `GET/PUT/DELETE /settings/{key}`.

## SEO

Generic CRUD (`build_crud_router`), `public_read=True`, writes
`admin`/`marketing`. Filter: `page_path`.

## Media

`admin`/`marketing`/`hr`. `GET /media` (filters `folder`, `mime_type`),
`POST /media/upload` (multipart, multiple files, records `uploaded_by`),
`DELETE /media/{id}`. Goes through the same `save_upload()` validation as
every other upload in this app.

## Notifications

Any authenticated user for their own notifications
(`GET /notifications`, `PATCH /notifications/{id}/read`,
`PATCH /notifications/read-all`); `admin`/`hr`/`marketing` can create one
targeting a specific user or role set (`POST /notifications`). Backed by
`app/services/notification_service.py`'s `notify_user`/`notify_roles` — the
same functions the CRM module calls for proposal/contract alerts.

## Audit Log

`admin` only, read-only: `GET /audit-logs` (filters `user_id`, `action`,
`entity_type`). No write/delete endpoint — correct for an audit trail, not
a missing feature. Full mechanism in
[security/audit-logging.md](../../security/audit-logging.md).

## Dependencies

[Authentication](../auth/README.md) (backups/settings/audit-log all
depend on RBAC), every other module (audit log and notifications are
consumed by all of them).

## Known gaps

- `/backups` has no scheduled trigger — see
  [architecture/background-jobs.md](../../architecture/background-jobs.md).
- No off-host backup storage — dumps live in `backend/backups/`, which a
  container restart without a persistent volume could lose.
- **Checked via an authorization audit, deliberately not changed**:
  `DELETE /media/{id}` has no per-uploader ownership check — any
  `admin`/`marketing`/`hr` user can delete media uploaded by any of the
  other two roles. Plausibly an intentional shared department content
  library rather than a bug (unlike the client/partner file case, there's
  no per-tenant boundary here, just different departments managing shared
  site content) — flagged for explicit product confirmation rather than
  changed unilaterally.
