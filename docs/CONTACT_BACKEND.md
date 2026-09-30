# Backend Integration Handover — For the Frontend Team

**Purpose:** everything a frontend agent/developer needs to build against
this backend correctly on the first pass — the auth flow (cookie-based, not
Bearer-token), the endpoint map per portal, hard constraints, and concrete
happy-path/sad-path examples. Written after the backend side of this
integration was built and verified end-to-end against a real running stack
(not from documentation alone) — every code sample below reflects an actual
verified request/response, not a guess at the shape.

Base URL in local dev (via the committed `docker-compose.yml`): `http://localhost:8000`
(or whatever `BACKEND_PORT` maps to on your machine). All endpoints below are
under `/api/v1` unless noted.

---

## 1. Authentication — httpOnly cookies, NOT `Authorization: Bearer`

**This is the single most important constraint for the frontend to get
right.** There is no token to store, read, or attach to requests manually.

### The three cookies

| Cookie | httpOnly | Set by | Purpose |
|---|---|---|---|
| `cf_access_token` | Yes (frontend JS cannot read it) | `/auth/login`, `/auth/refresh` | Sent automatically by the browser on every request; this backend reads it to authenticate. |
| `cf_refresh_token` | Yes | `/auth/login`, `/auth/refresh` | Used only by `/auth/refresh`; never read by frontend JS. |
| `cf_csrf_token` | **No** — frontend JS must read this | `/auth/login`, `/auth/refresh` | Must be echoed back as the `X-CSRF-Token` header on every state-changing request. |

### Constraint: every `fetch`/`axios` call must send credentials

```js
fetch("/api/v1/clients/me/profile", { credentials: "include" });
// axios: axios.defaults.withCredentials = true;
```
Without `credentials: "include"` (or the axios equivalent), the browser will
not send the cookies at all, and every request will look unauthenticated.

### Constraint: every POST/PUT/PATCH/DELETE must include the CSRF header

Read the CSRF cookie value and echo it back:
```js
function getCookie(name) {
  return document.cookie.split("; ").find(r => r.startsWith(name + "="))?.split("=")[1];
}

fetch("/api/v1/clients/me/tickets", {
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    "X-CSRF-Token": getCookie("cf_csrf_token"),
  },
  body: JSON.stringify({ subject: "...", description: "..." }),
});
```
**Sad path — omit this header (or send a stale/wrong value) and every
state-changing request gets a `403` before it even reaches route logic:**
```json
{"success": false, "status_code": 403, "message": "CSRF token missing or invalid", "errors": []}
```
This only applies once a session exists (i.e., after login) — `login` and
`register` themselves are exempt (nothing to protect yet).

### Login — happy path

```
POST /api/v1/auth/login
{ "email": "user@example.com", "password": "..." }

→ 200
Set-Cookie: cf_access_token=...; HttpOnly; SameSite=Lax; Path=/
Set-Cookie: cf_refresh_token=...; HttpOnly; SameSite=Lax; Path=/
Set-Cookie: cf_csrf_token=...; SameSite=Lax; Path=/
{"success": true, "status_code": 200, "message": "Logged in successfully",
 "data": {"user": {"id": "...", "name": "...", "email": "...", "role": "client", ...}}}
```
**No token appears anywhere in the body.** Do not look for `access_token` in
the response — it isn't there by design (an httpOnly cookie the frontend
could still read out of the response body would defeat the point).

### Login — sad path

```
POST /api/v1/auth/login  { "email": "user@example.com", "password": "wrong" }
→ 401 {"success": false, "status_code": 401, "message": "Invalid email or password", "errors": []}
```
No cookies are set on failure.

### Session expiry & refresh

The access token expires after 15 minutes (`ACCESS_TOKEN_TTL` in
`app/services/auth_service.py` — this app owns the value directly, not an
external provider's default). The refresh token is valid for 30 days from
issuance/last rotation. When any authenticated request comes back `401`,
call:
```
POST /api/v1/auth/refresh   (credentials: include, X-CSRF-Token header required)
→ 200, new cookies set — retry the original request
→ 401 if the refresh token itself is also expired/invalid — treat as a full
  logout: redirect to login, stop retrying.
```
**Recommended pattern**: a response interceptor that, on a `401` from any
authenticated endpoint, calls `/auth/refresh` once and retries the original
request; if the refresh itself fails, clear local UI state and redirect to
`/login`. Don't loop — one refresh attempt per failed request.

**Hard constraint — never fire two `/auth/refresh` calls concurrently for the
same session.** Each refresh call rotates the refresh token in place; if two
requests race, the second one presents a token that's already been rotated
away, which this backend treats as a stolen-token replay and **revokes the
entire session** (both calls, and the user, get logged out) — this is
deliberate theft-detection behavior, not a bug. If your interceptor could run
from multiple tabs/requests at once, de-duplicate concurrent refresh calls
into a single in-flight promise.

### Logout

```
POST /api/v1/auth/logout   (credentials: include, X-CSRF-Token header required)
→ 200, all three cookies cleared by the server
```
After this, any previously-cached "am I logged in" UI state should be reset
— there is no token to discard client-side because there never was one to
hold.

### `GET /auth/me` — check current session on app load

Call this once when the app boots (e.g., in a root layout/provider) to
determine whether a valid session cookie already exists:
```
GET /api/v1/auth/me  (credentials: include)
→ 200 {"data": {"id": "...", "role": "...", ...}}   — session valid, hydrate user state
→ 401 {"message": "Authentication token missing"}    — not logged in, show login page
```

### Password reset (forgot / reset)

```
POST /api/v1/auth/forgot-password
{ "email": "user@example.com" }
→ 200 (always, regardless of whether the account exists — do not use this
  response to reveal account existence in the UI)
{"success": true, "message": "If an account with that email exists, a password-reset link has been sent."}
```
```
POST /api/v1/auth/reset-password   (no auth cookie needed — the token IS the credential)
{ "token": "<from the emailed link>", "password": "NewPass123!" }
→ 200 {"message": "Password reset successfully — please log in with your new password"}
→ 400 {"message": "This password-reset link is invalid or has expired"}
```
The token is single-use (a second attempt with the same token also returns
`400`) and expires after 1 hour. A successful reset revokes **all** of that
user's existing sessions — every other device gets logged out.

### Email verification

```
POST /api/v1/auth/verify-email
{ "token": "<from the emailed link>" }
→ 200 {"message": "Email verified successfully"}
→ 400 {"message": "This verification link is invalid or has expired"}
```
```
POST /api/v1/auth/resend-verification
{ "email": "user@example.com" }
→ 200 (always, same enumeration-safe generic response pattern as forgot-password)
{"message": "If the account exists and is not yet verified, a new verification email has been sent."}
```
A verification token is issued automatically at registration and expires
after 24 hours.

### Change password (while logged in)

```
POST /api/v1/auth/change-password   (credentials: include, X-CSRF-Token required)
{ "current_password": "...", "new_password": "NewPass123!" }
→ 200 {"message": "Password changed successfully"}
→ 401 if current_password is wrong
```
This revokes every **other** session for the user (not the one making this
request) — a device-management safety measure, so a stolen device you're
still logged in on elsewhere gets kicked out immediately.

### Session management

```
GET /api/v1/auth/sessions   (credentials: include)
→ 200 {"data": [{"id": "...", "ip_address": "...", "user_agent": "...", "created_at": "...", "last_used_at": "...", "is_current": true|false}, ...]}
```
Use this to build a "manage devices" / "active sessions" screen.
```
DELETE /api/v1/auth/sessions/{session_id}   (credentials: include, X-CSRF-Token required)
→ 200 {"message": "Session revoked"}
→ 404 if the id doesn't belong to the logged-in user (never leaks whether the id exists for someone else)
```

### Logout everywhere

```
POST /api/v1/auth/logout-all   (credentials: include, X-CSRF-Token required)
→ 200 {"message": "Logged out of all sessions"}
```
Use for a "log out of all devices" security action, distinct from the
single-session `/auth/logout` above.

### Account lockout

After **5 consecutive failed login attempts**, the account is locked for 15
minutes — this applies automatically server-side, nothing to implement on
the frontend beyond handling the response:
```
POST /api/v1/auth/login   (6th consecutive wrong attempt, or any attempt while locked — even with the correct password)
→ 403 {"message": "Account temporarily locked due to repeated failed login attempts. Try again later."}
```
Show this message as-is; don't imply a permanent ban — it clears itself
after 15 minutes without any admin action.

### Two-factor authentication (TOTP) — build the UI, but check `available` first

**This feature is OFF by default in every environment** (`MFA_ENABLED=false`
server-side) — while off, every `/auth/mfa/*` endpoint below returns a plain
`404`, and `POST /auth/login` never returns an MFA challenge. Always check
`GET /auth/mfa/status`'s `available` field before showing any 2FA UI at all;
don't hardcode an assumption either way, since a deployment can turn this on
via `.env` without a frontend release.

```
GET /api/v1/auth/mfa/status   (credentials: include)
→ 200 {"data": {"available": true|false, "enabled": true|false, "enabled_at": "..."|null}}
```

**Setup (while logged in)** — two steps, nothing is "on" until the second one:
```
POST /api/v1/auth/mfa/setup   (credentials: include, X-CSRF-Token required)
→ 200 {"data": {"secret": "BASE32SECRET...", "otpauth_url": "otpauth://totp/..."}}
```
Render `otpauth_url` as a QR code client-side (any JS QR library — no image
is generated server-side) for the user to scan with an authenticator app
(Google Authenticator, Authy, 1Password, etc.); also show `secret` as a
manual-entry fallback. Then confirm they actually captured it by asking for
one generated code:
```
POST /api/v1/auth/mfa/enable   (credentials: include, X-CSRF-Token required)
{ "code": "123456" }
→ 200 {"data": {"backup_codes": ["ab2c78a5af", "d594932566", ...10 total]}}
→ 401 if the code doesn't match
```
**Show the 10 backup codes exactly once, right here — this response is the
only time they're ever retrievable.** Tell the user to store them somewhere
safe; each is single-use, for when they lose access to their authenticator.

**Login with MFA enabled** — `POST /auth/login` behaves differently once an
account has 2FA on:
```
POST /api/v1/auth/login   { "email": "...", "password": "..." }
→ 200 {"data": {"mfa_required": true, "mfa_token": "c-_aJ4P8Qftr..."}}
```
No session cookies are set yet. Show a "enter your 6-digit code" screen, then:
```
POST /api/v1/auth/mfa/verify-login
{ "mfa_token": "c-_aJ4P8Qftr...", "code": "123456" }
→ 200, session cookies now set, same LoginResponse shape as normal login
→ 401 {"message": "Invalid authentication code"} — safe to let the user retry;
  a wrong code does NOT burn the challenge, only a successful one does
```
`code` accepts either a live 6-digit TOTP code or one of the 10 backup codes
(each usable exactly once). The `mfa_token` expires after 5 minutes — if the
user stalls, send them back to the login form rather than retrying forever.

**Disabling MFA / regenerating backup codes** — both require re-entering the
current password as a confirmation step:
```
POST /api/v1/auth/mfa/disable                    { "password": "..." }
POST /api/v1/auth/mfa/backup-codes/regenerate    { "password": "..." }
```

### Social login (Google, GitHub) — full-page redirects, not fetch calls

**Also OFF by default** (`OAUTH_ENABLED=false`), and each provider is
independently only available once its own credentials are configured
server-side — a "Sign in with Google" button can exist in the UI while
"Sign in with GitHub" doesn't, with zero frontend code difference needed
between them. There's no `available`-style status endpoint for this (unlike
MFA) — the buttons should just point at the URLs below and let a `404` (if
that provider isn't configured) surface as a normal broken-link, or gate
which buttons render based on which providers your deployment's ops team has
told you are configured.

**This is not a `fetch()`/XHR flow.** Point the browser at the login URL
directly (a real `<a href>` or `window.location.href = ...`, not an AJAX
call) — the provider's consent screen and the eventual redirect back both
need a real page navigation to carry cookies and follow redirects correctly:

```
window.location.href = "/api/v1/auth/oauth/google/login"
// or: "/api/v1/auth/oauth/github/login"
```

The backend handles the entire round trip (state/CSRF validation, code
exchange, fetching the provider's profile, creating or linking the local
account, issuing session cookies) and lands the browser back on your
frontend at `CLIENT_URL` (or the deployment's configured
`OAUTH_SUCCESS_REDIRECT_URL`) already logged in — treat that landing exactly
like a page load after a successful `POST /auth/login`, i.e. call
`GET /auth/me` to hydrate user state. On any failure, the browser instead
lands on the failure URL with an `?oauth_error=<reason>` query param
(`invalid_state`, `token_exchange_failed`, `userinfo_failed`,
`account_unavailable`) — show a generic "sign-in failed, please try again"
rather than exposing the raw reason code.

If the resulting account has 2FA enabled, the redirect instead carries
`?mfa_required=1` with no token in the URL (it's delivered via an httpOnly
cookie instead) — call `POST /auth/mfa/verify-login` with just `{ "code":
"..." }` (omit `mfa_token`, the backend reads it from that cookie
automatically) to finish.

---

## 2. Role-based redirect after login

Per the workflow PDF: one login page for everyone, redirect by role after
`/auth/me` (or the login response's `user.role`) resolves:

| `role` | Redirect to |
|---|---|
| `client` | Client Portal |
| `employee`, `developer`, `sales`, `marketing`, `project_manager`, `qa`, `support`, `finance`, `hr` | Employee Portal |
| `admin`, `super_admin` | Admin Panel |
| `partner` | Partner Portal |
| `guest` | Public site (no portal) |

---

## 3. Endpoint map by portal

All paths below assume the `/api/v1` prefix and cookie auth as described
above. `SELF` means "the logged-in user's own record," resolved server-side
from the session — never pass a user/client/partner id yourself for `/me/*`
routes.

### Client Portal (`/clients/me/*`)
| Flow (PDF) | Method + Path |
|---|---|
| Dashboard | `GET /clients/me/profile` |
| Projects | `GET /clients/me/projects` |
| Invoices | `GET /clients/me/invoices` |
| Payments | `GET /clients/me/payments` |
| Support (view) | `GET /clients/me/tickets` |
| Support (create) | `POST /clients/me/tickets` — `{subject, description, priority?}` |
| Files | `GET /clients/me/files` |
| Meetings | `GET /clients/me/meetings` |
| Reports | `GET /clients/me/reports` |

### Employee Portal (`/employees/me/*`)
| Flow (PDF) | Method + Path |
|---|---|
| Attendance | `GET /employees/me/attendance/today`, `POST .../check-in`, `POST .../check-out` |
| Leaves | `GET /employees/me/leaves`, `POST /employees/me/leaves` |
| Projects | `GET /projects?employee_id={my_employee_id}` |
| Tasks | `GET /tasks?assigned_to={my_user_id}` |
| Timesheets | `GET /employees/me/timesheets`, `POST /employees/me/timesheets` |
| Performance | `GET /employees/me/performance-reviews` |
| Training | `GET /trainings/my-enrollments`, `GET /trainings/courses` |
| Payslips | `GET /employees/me/payslips` |
| Documents | `GET /employees/me/documents` |

**Note**: there is no single "employee dashboard" aggregate endpoint —
assemble the dashboard view client-side from the above.

### Partner Portal (`/partner-accounts/me/*`) — new this session
| Flow | Method + Path |
|---|---|
| Profile | `GET /partner-accounts/me/profile`, `PUT /partner-accounts/me/profile` |
| Files | `GET /partner-accounts/me/files` |
| Support | `GET /partner-accounts/me/tickets`, `POST /partner-accounts/me/tickets` |

**Scope note**: this is intentionally minimal (profile + shared files +
support) — neither source PDF defines partner-specific features like
commission tracking or referral dashboards. If the product needs those,
that's new scope, not something already built and waiting to be wired up.

### Admin Panel
Every module listed in the PDF (Employees, Clients, Projects, Services,
Industries, Blogs, Downloads, Gallery, Awards, Careers, Users, Roles,
Permissions, SEO, Settings, Reports, Analytics, Logs, Notifications, Media,
Backups) has a working CRUD-shaped endpoint at its own top-level path (e.g.
`/services`, `/seo`, `/settings`, `/backups`) — list with `GET`, create with
`POST`, update with `PUT`, delete with `DELETE`, all requiring
admin/relevant-role cookies. See `/docs` (Swagger UI, non-production only)
on the running backend for the exact request/response schema of each.

### Lead → Client conversion (Admin/Sales flow)
Not a single button — a real pipeline, verified this session with a live
drill through all four steps:
```
POST /leads                       → create a lead
POST /proposals                   → draft a proposal for that lead
POST /proposals/{id}/send         → mark sent
POST /proposals/{id}/accept       → mark accepted
POST /contracts                   → { proposal_id } — drafts a contract
POST /contracts/{id}/sign         → { client_signed: true, company_signed: true, provision_client_account: true }
```
The final `sign` call, once both signatures are true, automatically:
provisions a local `User`/`Client` row for the lead's email (reusing an
existing account if the email is already registered, with an unusable
placeholder password), sends a real password-set email via this app's own
`POST /auth/reset-password` flow, and marks the lead `converted`. The
frontend doesn't need to call anything else — this one request does the
whole conversion.

---

## 4. General constraints every screen needs to respect

- **Pagination**: any `GET` list endpoint accepts `?page=&limit=&sort=&search=`
  and returns `{"data": [...], "meta": {"total", "page", "limit", "total_pages"}}`.
  `limit` is capped at 100 server-side.
- **Response envelope**: every response is
  `{"success": bool, "status_code": int, "message": str, "data": ..., "errors": [...] | null, "meta": ... | null}`.
  Check `success`, not just HTTP status, for a uniform error-handling path —
  though HTTP status is also always correct (a fixed bug this session:
  earlier, one or two idempotent-return branches had a body that said `200`
  while the real HTTP status stayed `201`; that's now consistent everywhere).
- **Validation errors** are `422` with
  `{"errors": [{"field": "body.title", "message": "..."}]}` — map `field`
  directly to form-field names for inline error display.
- **Rate limiting**: default `300/15min` per IP globally; login is
  `10/minute`, refresh `30/minute`, register `10/hour`. A `429` includes a
  `Retry-After` header when this is hit.
- **File uploads**: this API does not accept `multipart/form-data` file
  bytes directly for most resources — the pattern is: upload the file to
  storage yourself (or via `POST /media/upload`) to get a URL, then pass
  that `file_url` string when creating the resource (e.g. `ClientFileCreate`,
  `PartnerFileCreate`).

## 5. Known gaps the frontend should NOT build against yet

See `docs/BACKEND_GAPS_AND_ISSUES.md` for full detail.
- **OAuth and 2FA/MFA are both built (§1 above) but OFF by default** in
  every environment right now — build the UI against them if you want, but
  confirm with ops whether the deployment you're pointing at actually has
  `MFA_ENABLED`/`OAUTH_ENABLED` (and OAuth provider credentials) turned on
  before shipping those screens live; hitting them against a deployment
  where they're off just means MFA's `available: false` / OAuth's `404`,
  not broken code.
- **No password complexity meter beyond length** — the API only enforces
  `min_length=8` server-side; if the design calls for a strength meter, that
  logic currently only exists client-side wherever you choose to add it.
- Forgot-password, reset-password, and email verification (§1 above) **are
  now implemented** — safe to build against.
