# ADR-002: S3-compatible storage abstraction (MinIO local, Supabase Storage staging)

## Context

File uploads (media, career resumes, client files) originally wrote directly
to local disk (`backend/app/utils/uploads.py`). The requirement was for
local dev to use MinIO and staging to use Supabase Storage's S3-compatible
API — two different providers, per environment.

## Decision

Rather than writing a MinIO-specific client and a separate Supabase-specific
client, `backend/app/services/storage_service.py` implements one S3-compatible
client (via `boto3`) used identically by both environments — MinIO and
Supabase Storage both speak the S3 protocol, so only
`S3_ENDPOINT_URL`/`S3_ACCESS_KEY_ID`/`S3_SECRET_ACCESS_KEY`/`S3_BUCKET` differ
between them (`.env` vs `.env.staging`). `settings.storage_backend` selects
"local" (unchanged disk behavior, still the default) or "s3".

Public and private uploads use separate key prefixes (`public/` and
`private/`) within one bucket, mirroring the local-disk backend's separate
root directories — a private upload (e.g. a career resume) is never directly
fetchable regardless of backend; it's only readable through this app's own
authenticated download endpoint.

## Alternatives considered

- **Separate storage clients per provider.** Rejected as needless
  duplication (violates DRY) — the S3 API surface both providers expose is
  identical for this app's needs (put/get/head/create-bucket/bucket-policy).
- **Presigned URLs for private files.** Not used — the existing pattern
  (authenticated backend endpoint proxies the file) was kept for both
  backends, since it was already the local-disk backend's contract and
  changing it would be a wider frontend-facing change than this task called for.

## Trade-offs

- A freshly auto-created bucket (MinIO's case) defaults to fully private —
  discovered via a live upload-then-fetch drill that returned 403 despite
  the upload succeeding. Fixed by applying a public-read bucket policy
  scoped strictly to the `public/*` prefix whenever
  `S3_AUTO_CREATE_BUCKET=true`. A managed provider that manages its own
  bucket visibility via its own dashboard (Supabase Storage) sets that flag
  to `false` and is never touched by this policy logic.
- `boto3` is synchronous; every call runs via `asyncio.to_thread` so it
  never blocks the event loop — the same reasoning that justifies this
  app's async ORM/driver choices elsewhere.

## Consequences

- Local dev needs a `minio` container (`docker-compose.override.yml`) when
  `STORAGE_BACKEND=s3`; `STORAGE_BACKEND=local` remains available with zero
  extra setup for anyone who doesn't need to test the S3 path.
- Adding a third S3-compatible provider later (AWS S3 directly, Cloudflare
  R2, etc.) requires only new env values, no new code.

See `docs/BACKEND_GAPS_AND_ISSUES.md` §5b and `status.md`'s corresponding
session entry for the live-drill evidence (real MinIO upload/fetch cycle,
real Supabase Storage bucket put/get/delete) and the one real bug found and
fixed along the way.
