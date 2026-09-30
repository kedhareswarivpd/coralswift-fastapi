# Application — FastAPI app, middleware, request lifecycle

`backend/app/main.py` constructs the single `FastAPI()` instance. Swagger
(`/docs`), Redoc (`/redoc`), and the raw OpenAPI schema (`/openapi.json`) are
all disabled in production (`ENV=production`/`prod`) — they leak the full
route/schema surface, which is fine for local/staging debugging but not for
a public production API.

## Middleware stack

Starlette applies middleware in **reverse registration order** — the last
one registered ends up outermost, running first on every request. In
`main.py`'s actual registration order, that means the real per-request order
is:

```
CORSMiddleware              (outermost — must see preflight OPTIONS first)
RequestContextMiddleware    (assigns/forwards X-Request-Id, structured access log)
AuditMiddleware             (logs state-changing requests to audit_log table)
CSRFMiddleware              (double-submit CSRF check — see security/authentication.md)
SecurityHeadersMiddleware   (X-Frame-Options, X-Content-Type-Options, etc.)
SlowAPIMiddleware           (rate limiting — innermost, registered first)
    │
    ▼
  route handler
```

- **CORS** — allowed origins are `CLIENT_URL` + `SITE_URL` + any
  `EXTRA_CORS_ORIGINS` (comma-separated), plus `localhost:5173`/`4173` in
  dev/test. Credentialed (`allow_credentials=True`, required for the
  cookie-based auth to work cross-origin between the frontend's dev server
  and the backend).
- **RequestContextMiddleware** — generates (or forwards a caller-supplied)
  `X-Request-Id`, logs one structured line per request
  (`method`, `path`, `status`, `duration_ms`, `request_id`). Also defensively
  initializes `request.state.view_rate_limit = None` before the handler
  runs — a real bug this fixed: slowapi's decorator only sets that attribute
  *after* a successful limit check, so if the check itself raised (e.g.
  Redis unreachable) and `swallow_errors=True` swallowed that, the decorator
  still unconditionally read the attribute afterward and crashed every
  request for as long as Redis stayed down.
- **AuditMiddleware** — for every non-GET/HEAD/OPTIONS request that
  succeeds (`2xx`), writes one row to `audit_log` (see
  `security/audit-logging.md`). Skips `/health`, `/docs`, `/redoc`,
  `/openapi.json`, `/uploads`.
- **CSRFMiddleware** — see `security/authentication.md`'s CSRF section.
- **SecurityHeadersMiddleware** — `X-Frame-Options: SAMEORIGIN`,
  `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
  a locked-down `Permissions-Policy` (camera/microphone/geolocation all
  denied).
- **SlowAPIMiddleware** — see `caching.md`/`security/rate-limiting.md`.

## Error handling

Three exception handlers, each returning the same response envelope shape
(`{success, status_code, message, data, errors}`):

- `ApiError` (`app/core/errors.py`) — the app's own typed HTTP error
  (`.bad_request()`, `.unauthorized()`, `.forbidden()`, `.not_found()`,
  `.conflict()`, `.internal()`, `.service_unavailable()` factory methods).
  This is what route/service code should raise for any expected failure.
- `RequestValidationError` — FastAPI/Pydantic's own validation failure,
  reshaped into `422` with `{errors: [{field, message}]}`.
- Bare `Exception` — anything unexpected. Logged with a full traceback
  (`exc_info=True`) and returned as a generic `500` with no internal detail
  leaked to the caller.

## Health checks

- `GET /health` (and `/`) — liveness only, no database touch. An
  orchestrator should use this to decide whether to *restart* the process.
- `GET /ready` — readiness: actually runs `SELECT 1` against Postgres and
  pings Redis. Only the database check controls the `503` — a Redis outage
  degrades (rate limiting fails open, see `caching.md`) rather than making
  an otherwise-healthy backend unroutable, so Redis's status is reported but
  doesn't flip this to `503` on its own. An orchestrator should use this to
  decide whether to *route traffic* to the process.

## Static file serving

`/uploads` is a `StaticFiles` mount serving the local `uploads/` directory —
only relevant when `STORAGE_BACKEND=local` (see `integrations.md`); under
`STORAGE_BACKEND=s3` uploaded files are served directly from the bucket's
own public URL and this mount serves nothing new.
