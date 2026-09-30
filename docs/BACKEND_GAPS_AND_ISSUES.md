# CoralSwift Backend — Gap & Issue Analysis

**Date:** 2026-08-22
**Scope:** Cross-check of the implemented backend (`backend/app/`) against
`docs/CoralSwift_Dashboard_Module_Workflows_Block_Format.pdf` (the workflow
diagrams — Client Portal, Employee Portal, Admin Panel, Lead→Client flow) and
`docs/WEBSITE MASTER CONTENT.pdf` (the content/feature inventory — Security,
Database, APIs, Deployment sections).

**How this was produced:** every claim below was checked against the actual
route table (`app.routes`), actual model/schema files, or a real request
against the running Docker stack — not inferred from file names or assumed
from a prior session's notes. Where something was previously flagged and has
since been fixed in this engagement, it is marked fixed here rather than
re-listed as open, so this file reflects current, verified state.

---

## 1. Client Portal — COMPLETE

Every module in the workflow PDF's Client Portal section
(Dashboard, Projects, Invoices, Payments, Support, Files, Meetings, Reports)
has a real, working endpoint, verified with a live regression pass against
the running stack this session (real cookie-authenticated requests, not
assumed from the route list):

| Module | Endpoint | Verified |
|---|---|---|
| Dashboard | `GET /clients/me/profile` | 200, real data |
| Projects | `GET /clients/me/projects` | 200 |
| Invoices | `GET /clients/me/invoices` | 200 |
| Payments | `GET /clients/me/payments` | 200 |
| Support | `GET/POST /clients/me/tickets` | 200/201; CSRF-protected write confirmed (403 without token, 201 with) |
| Files | `GET /clients/me/files` | 200 |
| Meetings | `GET /clients/me/meetings` | 200 |
| Reports | `GET /clients/me/reports` | 200 |

No gaps found in this module.

## 2. Partner Portal — BUILT THIS SESSION (was previously a documentation-only gap)

Neither PDF actually defines what a Partner Portal contains — the workflow
PDF only diagrams Client/Employee/Admin; the master-content PDF names
"Partner Portal" in its table of contents but never elaborates it in 15 pages
of body content. Per explicit instruction, this was built mirroring Client
Portal's *shape* (self-service `/me/*` + admin management), scoped
conservatively to what's structurally analogous without inventing unspecified
business logic (no commission/payout calculation, no referral-tracking
formulas — nothing in either source document hints at what those should be):

- `PartnerAccount` model (`partner_accounts` table) — company profile, linked
  1:1 to a `User` with the new `partner` role.
- `PartnerFile` model (`partner_files` table) — shared documents/resources.
- `Ticket.partner_account_id` — partners use the same support-ticket system
  as clients.
- Routes: `GET/PUT /partner-accounts/me/profile`, `GET /partner-accounts/me/files`,
  `GET/POST /partner-accounts/me/tickets`, plus admin
  `GET/POST /partner-accounts` — all verified with real cookie-authenticated
  requests against the live stack (profile read/update, ticket creation,
  file listing, admin list/create).

**If partners need commission tracking, deal registration, co-marketing
material approval workflows, or anything beyond "profile + shared files +
support," that requires an actual spec** — flagging this explicitly rather
than guessing at business rules neither source document states.

## 3. Employee Portal & Admin Panel — COMPLETE (verified in Session 10's audit, unchanged since)

All modules from both PDFs' Employee Portal and Admin Panel sections have
working endpoints — this was fully audited in an earlier pass this
engagement (see `status.md` section 27) and nothing since has removed or
broken that coverage; this session's changes (cookie auth, Partner Portal)
were additive to `core/dependencies.py`/`main.py`/new routers, not
subtractive to existing ones (confirmed: full regression suite and RBAC
matrix both still 100% green after every change in this session).

## 4. Authentication — REBUILT THIS SESSION: fully CoralSwift-owned, Supabase Auth removed entirely

Per explicit instruction, **Supabase Auth was removed as the identity
provider and replaced end-to-end with CoralSwift-owned authentication.**
Supabase/Postgres, where used at all, is now purely an optional hosted
database layer (see `backend/README.md` §3) — it is never consulted for
login, sessions, or credentials in any environment. This closes out the
"httpOnly cookie" migration from the prior session (which had swapped the
*transport* to cookies but still delegated identity to Supabase) with a full
identity-layer replacement:

- **Sessions**: opaque, random, database-backed tokens in a new
  `user_sessions` table (`app/services/auth_service.py`) — not JWTs, not
  Supabase-issued. `POST /auth/login` sets `cf_access_token` +
  `cf_refresh_token` (httpOnly) + `cf_csrf_token` (JS-readable) cookies;
  tokens never appear in the response body.
- **Passwords**: Argon2id (`app/core/password.py`), stored in a new
  `users.password_hash` column this app owns directly.
- **`POST /auth/refresh`**: rotates both tokens on the session row.
  **Reuse detection**: presenting an already-rotated-away refresh token
  immediately revokes the whole session (theft signal) rather than issuing
  new tokens — live-drill-verified (see `status.md`).
- **`POST /auth/logout`** / **`POST /auth/logout-all`**: reads the token from
  the cookie, revokes the matching session (or all of a user's sessions) in
  this app's own database — no external call.
- **`GET /auth/sessions`** / **`DELETE /auth/sessions/{id}`** (new): list and
  individually revoke active sessions; IDOR-checked (a foreign or
  nonexistent session id returns `404`, live-drill-verified).
- **Account lockout**: 5 failed attempts locks the account for 15 minutes,
  auto-expiring. Live-drill-verified: 6 wrong-password attempts against a
  fresh account, then the *correct* password was also rejected with a
  distinct `403 Account temporarily locked...` response.
- **Timing-attack resistance**: login always runs Argon2id verification
  (against a dummy hash when the user doesn't exist) so "no such user" and
  "wrong password" take equally long.
- CSRF protection (`core/csrf.py`) — unchanged double-submit cookie pattern
  from the prior session, still enforced identically under the new auth
  backend.

### 4a. RESOLVED: forgot-password / reset-password now implemented

The gap previously flagged here (`ForgotPasswordRequest`/`ResetPasswordRequest`
schemas existed but were unwired) is closed. Both endpoints are now real,
fully local, and live-drill-verified against the running stack:

- **`POST /auth/forgot-password`** — issues a single-use, hashed,
  1-hour-expiring `PasswordResetToken`, emails the reset link. Returns an
  identical generic response (`"If an account with that email exists..."`)
  whether or not the account exists — verified byte-for-byte identical for
  both cases, closing the enumeration vector.
- **`POST /auth/reset-password`** — verified live: an invalid/bogus token is
  rejected (`400`); a valid token successfully changes the password and a
  subsequent login with the new password succeeds; the same token replayed a
  second time is rejected (`400`, single-use enforced); resetting also
  revokes all existing sessions for that account.

### 4b. RESOLVED: email verification now implemented

`POST /auth/verify-email` and `POST /auth/resend-verification` are new,
fully local, and live-drill-verified: registration issues a real
`EmailVerificationToken`; an invalid token is rejected (`400`); a valid token
marks `email_verified_at` and flips `is_email_verified` to `true` on the very
next `/auth/me` call; resend returns the same account-existence-agnostic
generic response as forgot-password.

### 4c. Security features listed in the master-content PDF — updated status

The master-content PDF's Security section lists: `JWT, OAuth, RBAC, 2FA,
CSRF, XSS, SQL Injection Protection, Encryption, Password Policy, Audit
Logs, Rate Limiting`. Checked each, post-migration:

| Item | Status |
|---|---|
| JWT | **No longer applicable by design** — sessions are now opaque, database-backed, revocable tokens, not JWTs (a deliberate architectural choice per this session's instructions, not a gap) |
| RBAC | Implemented, tested (`tests/test_rbac_matrix.py`, 617/617 passing, confirmed unaffected by the auth-mechanism swap since RBAC checks run on the resolved `User`, not on how it was resolved) |
| CSRF | Implemented (unchanged from prior session) |
| XSS | Mitigated (httpOnly cookies close the main token-theft vector; `_esc()` HTML-escapes email templates) |
| SQL Injection Protection | Implemented (SQLAlchemy parameterized queries throughout) |
| Encryption | TLS pinned for non-local DB connections (`core/database.py`); passwords hashed with Argon2id, tokens hashed with SHA-256 before storage — a DB leak alone does not yield usable credentials |
| Audit Logs | Implemented (`audit_log.py`, `core/audit.py`) — **a real pre-existing bug was found and fixed this session**: `AuditMiddleware` was still reading the `Authorization: Bearer` header from before the earlier cookie migration, so every authenticated action's audit entry has had `user_id=None` since that migration; fixed to read the session cookie instead |
| Rate Limiting | Implemented (`core/limiter.py`) |
| Account Lockout | **Newly implemented this session** — 5 failed attempts / 15-minute auto-expiring lock, live-drill-verified |
| **OAuth** | **Implemented, OFF by default** (`OAUTH_ENABLED=false`) — see §4e |
| **2FA / MFA** | **Implemented, OFF by default for every account** (`MFA_ENABLED=false`) — see §4e |
| Password Policy | `min_length=8` enforced at the schema level (`RegisterRequest`, `ResetPasswordRequest`, `ChangePasswordRequest`); no complexity rules (uppercase/number/symbol) — unchanged from before, still a real gap if stricter policy is desired |

### 4e. RESOLVED: 2FA/MFA and OAuth are now built, both gated OFF by default via `.env`

Per explicit instruction, both are fully implemented — production-usable, not
stubs — and enabling either is **purely a `.env` change**, no code change,
no redeploy of anything but config. Both default to off exactly as before;
nothing in either feature activates itself for an existing account or
environment just by upgrading to this code.

**2FA/MFA (TOTP, RFC 6238)** — `app/core/mfa.py`, `app/routers/auth.py`'s
`/auth/mfa/*` routes:
- `MFA_ENABLED` (global kill switch, default `false`) — every `/auth/mfa/*`
  route and the login MFA-challenge branch is **entirely invisible** (404)
  when this is off, regardless of any account's own `mfa_enabled` column.
  Live-drill-verified: with the switch off, `POST /auth/mfa/setup` returns
  404 even called as an authenticated user.
- Per-account opt-in only: `POST /auth/mfa/setup` (generates a TOTP secret,
  Argon2id-adjacent Fernet-encrypted at rest — the secret must be reversible
  to verify codes, so encryption, not hashing, is used here specifically) →
  `POST /auth/mfa/enable` (proves the user captured it in a real
  authenticator app by producing a valid code) → 10 single-use backup codes
  issued, shown exactly once. `POST /auth/mfa/disable` and
  `.../backup-codes/regenerate` both require the current password.
- Login flow: `POST /auth/login` returns `{mfa_required: true, mfa_token}`
  instead of session cookies when the account has MFA on; the frontend
  collects a code and calls `POST /auth/mfa/verify-login`. Accepts either a
  live TOTP code or a backup code.
- **Real bug found and fixed via live drill**: the MFA challenge was
  originally consumed (`used_at` set) the moment it was looked up, before
  the submitted code was even checked — so one mistyped code permanently
  burned the challenge and forced the user back to a fresh password login.
  Fixed to only consume the challenge after a successful code check;
  verified live (wrong code → 401, challenge still usable → retry with the
  correct code on the same token → 200) and covered by a new regression test
  (`test_mfa_auth_flow.py::test_wrong_code_does_not_burn_the_challenge_a_retry_can_still_succeed`).
- Live-drill-verified end-to-end against the real running stack: setup →
  enable (real TOTP code) → login triggers MFA challenge → wrong code
  rejected without burning the challenge → correct code completes login →
  backup-code login (single-use, confirmed rejected on reuse) → disable
  (wrong password rejected, correct password succeeds) → login reverts to
  no-MFA immediately after disable.
- 39 new automated tests (`tests/test_mfa.py`, `tests/test_mfa_auth_flow.py`)
  covering the crypto helpers and every router branch; full suite still
  1079/1079, RBAC matrix still 617/617.

**OAuth / social login (Google, GitHub)** — `app/core/oauth_providers.py`,
`app/routers/oauth.py`'s `/auth/oauth/{provider}/login` + `/callback`:
- `OAUTH_ENABLED` (global kill switch, default `false`) — same
  fully-invisible-when-off behavior, live-drill-verified
  (`/auth/oauth/google/login` → 404 while off).
- Each provider is additionally only active once its own
  `CLIENT_ID`/`CLIENT_SECRET`/`REDIRECT_URI` are all set — configuring Google
  alone (leaving GitHub blank) is safe and requires no code change.
  Live-drill-verified: with `OAUTH_ENABLED=true` and only Google's test
  credentials set, Google's login route redirected correctly (real
  `accounts.google.com` URL, correct `client_id`/`redirect_uri`/`scope`, a
  `cf_oauth_state` httpOnly cookie set) while GitHub's route still 404'd.
- Standard authorization-code flow: `/login` redirects to the provider with a
  random `state` in an httpOnly cookie; `/callback` verifies `state` matches
  (CSRF protection — live-drill-verified: a mismatched `state` redirects to
  the failure URL with `oauth_error=invalid_state` rather than proceeding),
  exchanges the code, fetches the provider's userinfo, and either links to
  an existing `OAuthAccount` or creates one — linking a *new* provider
  identity to a pre-existing local account by email only happens when the
  provider's own verified-email claim is true, never on an unverified email
  (prevents account-takeover via a spoofed/unverified email at signup).
- GitHub specifically: its `/user` endpoint doesn't reliably return a
  verified email, so the callback always separately calls
  `/user/emails` and only trusts the entry marked both `primary` and
  `verified`.
- If the resulting account has MFA enabled, OAuth still routes through the
  same MFA-challenge handoff as password login (delivered via an httpOnly
  cookie rather than a JSON body, since a provider callback is a full-page
  browser redirect with no JavaScript to read a response body).
- Verified via 11 tests mocking the provider's HTTP responses
  (`tests/test_oauth.py`) — new-account creation, linking-by-email,
  already-linked reuse, state-mismatch rejection, token-exchange-failure
  handling, and the MFA handoff — since a full third-party OAuth round trip
  requires a real registered app in Google/GitHub's own developer console
  (client secrets this session was not given and should not fabricate); the
  redirect construction itself (§ above) was still confirmed against the
  real running stack, not just mocked.
- New env vars, present (blank/off) in `.env`/`.env.example`/`.env.staging.example`:
  `OAUTH_ENABLED`, `OAUTH_SUCCESS_REDIRECT_URL`, `OAUTH_FAILURE_REDIRECT_URL`,
  `OAUTH_GOOGLE_CLIENT_ID`/`_CLIENT_SECRET`/`_REDIRECT_URI`,
  `OAUTH_GITHUB_CLIENT_ID`/`_CLIENT_SECRET`/`_REDIRECT_URI`.

### 4f. New migration consideration: pre-existing users' passwords

`alembic/versions/370721f881ed_coralswift_auth_migration.py` backfills
`password_hash` for every user that existed before this migration with a
random, unusable Argon2id-*shaped* hash — this application never had their
plaintext password (Supabase Auth held it), so there is no way to carry a
real password forward. **Every pre-existing account must use
`POST /auth/forgot-password` once to set a real, usable password** after this
migration deploys to an environment with existing users. This is a one-time,
unavoidable consequence of the identity-provider swap, not a bug — flagged
here so it isn't missed at deploy time.

## 5. Third-party integrations: Brevo (email), MinIO/Supabase Storage (files), Upstash (Redis)

Per explicit instruction, three infrastructure dependencies were swapped for
real third-party services — matrixed per environment (local dev vs.
staging), not uniform across both:

| Concern | Local dev | Staging |
|---|---|---|
| Email | Brevo | Brevo (same account) |
| File storage | MinIO (local container) | Supabase Storage (S3-compatible) |
| Redis | local container | Upstash (managed) |

### 5a. Email — Brevo, fully working, live-tested

`app/services/email_service.py` was rewritten from aiosmtplib/SMTP to
Brevo's transactional HTTP API (`POST https://api.brevo.com/v3/smtp/email`,
`api-key` header) — one Brevo account/API key serves both local dev and
staging, there is no separate SMTP-relay code path anymore. `aiosmtplib` was
removed from `requirements.txt` entirely.

**Real bug found and fixed while wiring this up**: the mocked pytest suite's
`conftest.py` originally patched `app.services.email_service.httpx.AsyncClient`
to block real network calls — but since `email_service.py` does `import httpx`
(not `from httpx import AsyncClient`), that name IS the shared `httpx` module
object, so patching an attribute on it patched `httpx.AsyncClient` **globally**
for the whole process, including `test_rbac_matrix.py`'s own unrelated test
client. This broke 618 RBAC tests with `TypeError: object MagicMock can't be
used in 'await' expression` the moment the patch was added, caught
immediately by running the full suite (not assumed passing). **Fixed** by
forcing `settings.brevo_api_key = ""` for the mocked test session instead —
`send_email()`'s own existing guard (`if not settings.brevo_api_key: return`)
already no-ops safely without needing to touch `httpx` at all.

`docker-compose.override.yml`/`.env`/`.env.staging` were NOT changed for
email — Brevo needs no container, only the API key.

### 5b. File storage — MinIO (local) / Supabase Storage (staging), both live-verified

New `app/services/storage_service.py` — an S3-compatible object storage
layer using `boto3` (added to `requirements.txt`), used by both environments
identically since MinIO and Supabase Storage both speak the S3 API; only
`S3_ENDPOINT_URL`/`S3_ACCESS_KEY_ID`/`S3_SECRET_ACCESS_KEY`/`S3_BUCKET`
differ. `app/utils/uploads.py` now branches on `settings.storage_backend`
("local", unchanged disk-based behavior, still the default; or "s3"),
including the private-file path (career resumes) — `resolve_private_path`
was replaced with `load_private_file`, which returns bytes+filename+
content-type for either backend uniformly, and `career.py`'s resume-download
route now streams that instead of `FileResponse`ing a local path directly.

**Local (MinIO)** — `docker-compose.override.yml` now runs a `minio`
container (added to the local stack, healthy, `MINIO_PORT`/`MINIO_CONSOLE_PORT`
configurable for machines where 9000/9001 are taken — this one needed it,
see the root `.env`). Live-drill-verified end-to-end against the real
running stack: a real image uploaded via `POST /media/upload` produced a
real MinIO-backed public URL; that URL was fetched back and confirmed
byte-identical to the original upload; a career-application resume upload
produced a bare private reference (not a URL); the same object's direct
bucket URL correctly 403'd (private, no public policy); the authenticated
`GET /careers/admin/applications/{id}/resume` endpoint correctly returned
the exact original PDF bytes.

**Real bug found and fixed via that same live drill**: a freshly
auto-created MinIO bucket defaults to fully private — the first
upload-then-public-fetch attempt 403'd despite the upload itself succeeding.
**Fixed**: `storage_service._ensure_bucket_sync()` now applies a
public-read bucket policy scoped to the `public/*` key prefix only (never
`private/*`) whenever `S3_AUTO_CREATE_BUCKET=true` (the MinIO case) — a
provider that manages its own bucket visibility via its own dashboard
(Supabase Storage) sets `S3_AUTO_CREATE_BUCKET=false` and is never touched by
this policy logic. Re-verified live after the fix: the same upload-then-fetch
cycle now returns the correct bytes with `200`, not `403`. A regression test
(`test_storage_service.py::test_newly_created_bucket_gets_a_public_read_policy_scoped_to_public_prefix`)
covers this.

**Staging (Supabase Storage)** — real credentials for a real Supabase
Storage bucket (`coralswift`, project `kimfexrhqjinlrmwukik`, endpoint
`https://kimfexrhqjinlrmwukik.storage.supabase.co/storage/v1/s3`) were
provided and live-tested directly (not assumed working from the local MinIO
test alone, since Supabase Storage's S3-compatibility has its own quirks):
`head_bucket`, `put_object`, `get_object`, and `delete_object` all succeeded
against the real bucket. **One real, still-open finding**: the bucket's
public-object REST endpoint (`GET .../storage/v1/object/public/coralswift/...`)
returns `404 Bucket not found` even though the bucket demonstrably exists
(confirmed via `list_buckets()` over the S3 API) and the uploaded object is
retrievable via the **authenticated** object endpoint with the service-role
key. This points to the bucket's "Public bucket" toggle not actually being
saved as enabled on the Supabase dashboard side — **action needed**: open
Storage -> coralswift -> Edit bucket in the Supabase dashboard, confirm
"Public bucket" is checked, and click Save; then re-run the same
`GET .../object/public/coralswift/<key>` check. Until that's done,
`S3_PUBLIC_URL_BASE`-constructed URLs for staging will 404 for real site
visitors even though uploads themselves work fine.

### 5c. Redis — Upstash, NOT YET WIRED (missing the real connection endpoint)

`core/config.py` gained `redis_url_override` (used verbatim when set —
Upstash's own dashboard gives you the exact `rediss://default:<password>@<host>:<port>`
string) and `redis_tls` (forces `rediss://` when building from
host/port/password instead). This is implemented and unit-tested, but
**not live-verified against a real Upstash instance** — what was provided is
shaped like an Upstash REST API token
(`gQAAAAAAAap7AAIgcDEzNWVlNmI1YzEyMzQ0ZmQ3YjQ3MWRiN2IwYmY1YWNjNg`), which is
almost certainly a different credential than the plain Redis-protocol
password `redis-py` needs — Upstash typically issues both from the same
database but as separate values, and this app speaks the Redis protocol
(via `redis-py`/`slowapi`), not Upstash's REST API. **Action needed**: from
the Upstash console, open the target database -> "Connect" tab -> copy the
exact `rediss://default:<password>@<host>:<port>` line shown there (not the
REST URL/token shown elsewhere on that page) into
`backend/.env.staging`'s `REDIS_URL_OVERRIDE`. Until that's a real,
correct value, staging's rate limiter fails to connect and **fails open**
(`core/limiter.py`'s existing `swallow_errors=True` — the same resilience
behavior verified for local Redis outages in an earlier session) — meaning
staging currently has no real rate-limiting in effect, not a silent outage.

## 6. Database

`SELECT count(*) FROM information_schema.tables` against the real running
local Postgres: **67 tables** (up from 61 — the self-auth migration added 3:
`user_sessions`, `password_reset_tokens`, `email_verification_tokens`; this
update's MFA/OAuth work added 3 more: `mfa_backup_codes`, `mfa_challenges`,
`oauth_accounts`). The master-content PDF states "75 Tables" as a
content-strategy planning figure — this is very likely aspirational
front-loaded scope from an early planning document rather than a literal
contract; nothing in either PDF's actual module list points to a specific
missing table category. Not treated as a gap without a concrete missing
feature to point to.

## 7. Items already investigated and explicitly NOT gaps (checked, not assumed)

- **Employee/Client "Dashboard" landing page** returning 403 for a plain
  `employee`/`client` role — by design; the actual portal dashboard is
  meant to be assembled by the frontend from the granular `/me/*`
  endpoints, not one aggregate endpoint (verified in Session 10's audit).
- **`GET /projects?employee_id=`** and **`GET /tasks?assigned_to=`** — both
  already provide the "my projects/tasks" scoping the Employee Portal needs.
- **Service Content Workflow fields** (Overview, Business Problems,
  Solutions, Features, Benefits, Process, Technology Stack, Deliverables) —
  all already columns on the `Service` model.
- **Blog `tags`, `search`** — both already implemented (search was a real
  bug found and fixed earlier this session).

## 8. Carried-forward, still-open items (unchanged by this session's work)

- **CF-BE-009** (full-topology performance gate) — needs real Linux
  hardware; this session's Docker Desktop/Windows environment is
  demonstrably not representative (see CF-BE-014's own root cause — a
  Windows/WSL2-specific DNS resolver behavior — as further evidence of that
  platform gap).
- **CI in real GitHub Actions** — this repository has zero git commits and
  no configured remote (`git status` → "On branch master, No commits yet").
  There's nothing to run CI against until a git history exists — that's a
  git operation (`init`/commit/push) with real, visible consequences that
  needs the user's explicit go-ahead, not an inference from this audit.
- **`employees.py::list_all_timesheets`** hand-rolls a query that
  `CRUDBase.list()` could serve, except it needs a *nested* eager load
  (`Timesheet.employee.user`) `CRUDBase` doesn't currently support past one
  relationship level — flagged, not fixed, to avoid widening `CRUDBase`'s
  scope for a single caller without dedicated testing.
- **Backups are manual-trigger only** (`POST /backups/trigger`), not on a
  schedule. Real and working (verified: a real `pg_dump` file created,
  listed, downloaded, deleted against the live stack), but production
  hardening would want a scheduled job (cron/Celery beat) calling that same
  endpoint or the underlying logic automatically, plus off-host storage
  (S3/equivalent) rather than the local `backend/backups/` directory a
  container restart could lose.
- **RESOLVED this session**: the previously-flagged `auth.py::logout` →
  Supabase admin `sign_out` question is moot — `logout` now revokes the
  session directly in this app's own `user_sessions` table, no external call
  of any kind.
- **No complexity requirements on passwords** beyond `min_length=8` — no
  uppercase/number/symbol policy enforced. Real gap if a stricter policy is
  a requirement; not built without a concrete spec for what "strict" means
  here.
- **Red-team/attack-category test suite, load testing at 10k/100k-record
  scale, CI-in-GitHub-Actions, and full folder-restructuring** — all
  explicitly requested in this session's master remediation prompt but not
  attempted: each is a multi-day-scale effort in its own right, and
  attempting a shallow pass would produce unverified claims rather than real
  evidence. Not started, not partially faked — flagged honestly as open.

## 9. Fixed this session: 5 real findings surfaced by a documentation review

A documentation build-out pass (writing `docs/security/authorization.md`,
`docs/modules/*`, `docs/database/*`) surfaced 7 real, previously-undocumented
findings by actually reading every router/model rather than assuming
behavior. 5 were fixed and live-drill-verified; 2 were deliberately left
as explicit product/architecture decisions rather than unilaterally changed
— see below for which and why.

- **RESOLVED — IDOR-adjacent ownership gap**: `POST /clients/me/files`,
  `/clients/me/reports`, `/partner-accounts/me/files` were role-gated but
  not ownership-gated — any staff member with the right role could attach
  a file/report to *any* client/partner account. Fixed:
  `_require_assigned_account_manager()` now checks the caller is either
  `admin`/`super_admin` or the resource's actual assigned account manager.
  Live-drill-verified (admin bypass succeeded; a non-owning
  `project_manager` was correctly rejected with `403`).
- **RESOLVED — meeting "cancel" was a hard delete**: `DELETE /meetings/{id}`
  destroyed the row instead of setting `MeetingStatus.cancelled`. Fixed to
  use `crud.update()`. Live-drill-verified (a cancelled meeting is still
  retrievable afterward with `status: cancelled`).
- **RESOLVED — training-enrollment race**: no unique database constraint
  backed the duplicate-enrollment check, only an application-level
  query-then-insert. Added `uq_training_enrollment_employee_course`
  (migration `664442caaa34`), and the router now translates the resulting
  `IntegrityError` into the same friendly `409` rather than a raw `500`.
- **RESOLVED (partially) — `InvoiceStatus.overdue` never set**: added
  `POST /finance/invoices/sweep-overdue` (manual-trigger, same pattern as
  backups — this app still has no job scheduler). Live-drill-verified: a
  `sent`, past-due invoice flipped to `overdue` after one call.
- **RESOLVED — misleading soft-delete filter**: `GET /stats` filtered
  `Project.deleted_at IS NULL` despite nothing ever setting `deleted_at`.
  Filter removed to match actual (hard-delete) behavior.
- **Deliberately NOT fixed — `Role`/`Permission` tables unused by
  authorization**: `require_roles()` is a flat `users.role` string check;
  the `Role`/`Permission` data model and CRUD API exist but have zero
  effect on access. Wiring them up is a real feature addition (migrating
  ~50 routers' hardcoded role lists into DB rows, deciding whether
  `super_admin`'s bypass survives, redesigning the 621-check RBAC test
  suite against the new mechanism) — too large a change to bundle into a
  documentation-driven bug-fix pass. See
  [decisions/ADR-004](decisions/ADR-004-flat-role-authorization.md).
- **Deliberately NOT changed — `GET /stats` is fully public**: reads as a
  purpose-built public marketing widget (round aggregate counts only, no
  PII, defensive try/except-default-0 shape), not an oversight. Adding auth
  would be a product-facing breaking change to whatever public page
  depends on it — not this pass's call to make unilaterally. Flagged for
  an explicit yes/no from whoever owns the public site.

All 5 fixes are covered by a new `tests/test_gap_fixes.py` (9 tests) and
verified against the real running Docker stack, not just the mocked test
suite — see `status.md`'s corresponding session entry for the full
live-drill transcript. Full regression: 1108/1108 unit tests, 621/621 RBAC
checks (up from 617 — the new `sweep-overdue` endpoint was auto-discovered
across both its allowed roles).

## 10. Fixed this session: OWASP-style authorization audit (IDOR, privilege escalation, mass assignment)

A dedicated audit against a specific checklist (IDOR/BOLA, horizontal/
vertical privilege escalation, missing function-level authorization, mass
assignment, broken object-property authorization, parameter tampering) —
3 parallel code-reading passes across every router — found 6 real, confirmed
issues. 5 fixed and live-drill-verified; 2 left as explicit product
decisions. Full detail in `docs/security/authorization.md`'s dedicated
section; summarized here:

- **`PATCH /leads/{lead_id}` IDOR** (most severe — `GET` had an ownership
  check, `PATCH` didn't, letting any `sales` user steal/modify another's
  lead including reassigning `owner_id` to themselves) — **FIXED**,
  live-drill-verified against the real database.
- **HR could deactivate/modify existing admin accounts** despite being
  blocked from creating/promoting them (`PUT /users/{id}`,
  `PATCH /users/{id}/deactivate` had no check on the *target's* current
  role) — **FIXED**, live-drill-verified.
- **PM leave/timesheet approval not scoped to their team** — any
  `project_manager` could approve/view any employee's leave or timesheet
  company-wide — **FIXED**.
- **PM project/team management not scoped to their assignment** — any
  `project_manager` could edit/reassign the team of any project, not just
  ones they manage — **FIXED**.
- **`create_employee`'s update-in-place branch allowed identity-field mass
  assignment** (`user_id`/`employee_code` could be re-supplied on an
  existing row) — **FIXED**.
- **`ticket.py`/`meetings.py` cross-tenant staff visibility** and
  **`media.py`'s unscoped delete across admin/marketing/hr** —
  **deliberately NOT changed**, flagged for explicit product confirmation
  (ticket.py's own comments confirm shared staff visibility is intentional
  there; meetings.py and media.py have no such confirming comment).

Covered by a new `tests/test_authz_gap_fixes.py` (17 tests). Full
regression: 1125/1125 unit tests, 621/621 RBAC checks.

---

## Summary

| Category | Count | Status |
|---|---|---|
| Client Portal modules | 8/8 | Complete, regression-verified |
| Partner Portal | Built | Complete for the scope confirmed (profile/files/tickets); commission/referral logic needs a spec if wanted |
| Employee Portal / Admin Panel | Complete | Verified in Session 10, unchanged |
| Auth identity provider | **Fully CoralSwift-owned** | Supabase Auth removed entirely this session; opaque DB-backed sessions, Argon2id passwords, refresh rotation + reuse detection, account lockout — all live-drill-verified against the real Docker stack, 1039/1039 unit tests and 617/617 RBAC checks still passing |
| Forgot/reset password | **RESOLVED this session** | Fully implemented, live-drill-verified (invalid/valid/reused-token cases, enumeration-resistant) |
| Email verification | **RESOLVED this session** | Fully implemented, live-drill-verified |
| Pre-existing users' passwords | **Action required at deploy** | Backfilled with unusable placeholder hashes; each must use forgot-password once |
| 2FA/MFA | **Built, OFF by default** (`MFA_ENABLED=false`) | Full TOTP + backup-codes implementation, live-drill-verified end-to-end including a real bug found and fixed (challenge consumed before code check); enabling is a `.env`-only change, no code change |
| OAuth (Google, GitHub) | **Built, OFF by default** (`OAUTH_ENABLED=false`) | Full authorization-code flow with account linking/creation, live-drill-verified redirect construction + CSRF state check against the real stack, remaining logic covered by 11 tests mocking provider responses (no real third-party app credentials were available to complete a live round trip); enabling is a `.env`-only change per provider |
| Password complexity policy | **Missing** | Only `min_length=8`; no character-class rules |
| Email (Brevo) | **Working, live-verified** | Both environments now send via Brevo's HTTP API; a real global-`httpx`-patch test bug found and fixed along the way |
| File storage (MinIO local / Supabase Storage staging) | **Working, live-verified, one bug fixed** | Real upload/fetch cycles verified against both real MinIO and real Supabase Storage; a real "new bucket defaults private" bug found and fixed for MinIO |
| Redis (Upstash staging) | **Code done, NOT live-verified** | `REDIS_URL_OVERRIDE`/`REDIS_TLS` implemented and unit-tested, but only a REST API token was provided, not the TCP connection string `redis-py` needs — staging Redis is not actually connected yet |
| Supabase Storage bucket "coralswift" public access | **Action required** | Bucket and credentials work (S3 API verified live), but the public object REST endpoint 404s — the bucket's "Public bucket" toggle needs to be confirmed saved-on in the Supabase dashboard |
| Red-team suite / scale load testing / CI-in-Actions / folder restructuring | **Not started** | Explicitly requested in the master remediation prompt but out of scope for what could be honestly completed and verified this session |
| CF-BE-009 | Open | Environmental blocker (needs real Linux hardware), not deferred work |
| Staff file/report upload ownership (IDOR-adjacent) | **RESOLVED this session** | Role-gated → ownership-gated, live-drill-verified |
| Meeting "cancel" hard-deleting | **RESOLVED this session** | Now sets `status=cancelled`, live-drill-verified |
| Training-enrollment concurrency race | **RESOLVED this session** | Real unique DB constraint added, graceful 409 on race |
| `InvoiceStatus.overdue` never set | **RESOLVED (partially) this session** | Manual-trigger sweep endpoint added, live-drill-verified; still not scheduled (no job runner exists) |
| Misleading `deleted_at` filter in `/stats` | **RESOLVED this session** | Removed to match actual hard-delete behavior |
| `Role`/`Permission` tables unused by authorization | **Open, deliberately not fixed** | A real feature addition (redesigning ~50 routers' role gates + 621 RBAC tests), too large for a bug-fix pass — see ADR-004 |
| `GET /stats` fully public | **Open, deliberately not changed** | Reads as an intentional public marketing widget; needs explicit product sign-off, not a unilateral auth addition |
| `PATCH /leads/{id}` IDOR | **RESOLVED this session** | Most severe finding from the OWASP-style audit; live-drill-verified |
| HR could deactivate/modify admin accounts | **RESOLVED this session** | Live-drill-verified |
| PM leave/timesheet approval unscoped | **RESOLVED this session** | Now scoped to `reporting_manager_id` team |
| PM project/team management unscoped | **RESOLVED this session** | Now scoped to `project_manager_id` assignment |
| `create_employee` identity-field mass assignment | **RESOLVED this session** | `user_id`/`employee_code` excluded from the update-in-place branch |
| Ticket/meeting cross-tenant staff visibility, unscoped media delete | **Open, deliberately not changed** | Plausibly intentional shared-staff-visibility design; needs explicit product confirmation |
