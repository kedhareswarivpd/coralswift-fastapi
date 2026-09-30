# Security Testing — Current State

## What's actually tested, in this repo, today

- **RBAC**: `tests/test_rbac_matrix.py` — 617 checks, every role-restricted
  route × every role, both directions (allowed roles pass, disallowed
  roles get `403`). Run as part of the standard `pytest` suite, not a
  separate security-only pass.
- **CSRF**: `tests/test_cookie_auth.py::TestCSRFMiddleware` — the
  double-submit check is tested directly (missing header, mismatched
  header, matching header, GET-request exemption, no-session exemption).
- **File upload validation**: `tests/test_uploads.py` — MIME/extension/
  size/magic-byte rejection cases, path-traversal rejection, plus the
  S3-backend equivalents.
- **Auth mechanics**: `tests/test_auth_service.py`, `test_mfa.py`,
  `test_mfa_auth_flow.py`, `test_oauth.py`, `test_password.py`,
  `test_tokens.py` — session creation/rotation/reuse-detection, account
  lockout, TOTP/backup-code verification, OAuth account linking/CSRF-state
  validation, Argon2id hashing, opaque token generation/hashing.
- **Payment/contract idempotency**: `tests/test_payment_idempotency.py`.
- **Live-drill verification** against the real running Docker stack (not
  just mocked unit tests) for every major auth/storage/email flow — see
  `status.md` for the full, dated evidence ledger of what was actually
  exercised against a live backend, not just asserted in a mock.

## What's NOT wired into this repo

- **No SonarQube/SAST integration** — `docs/sonar-issues-report.md`/`.pdf`
  exist in this repo but predate the sessions behind the docs referenced
  throughout this security section and haven't been cross-checked against
  the current codebase (see `docs/README.md`'s "pre-existing files" note).
  There is no CI job running SonarQube today.
- **No OWASP ZAP or other dynamic/DAST scanning** — no automated scan of
  the running API exists in this repo or its CI.
- **No dependency/secret scanning in CI** — `requirements.txt` pins exact
  versions, but nothing automatically flags a newly-disclosed CVE in one of
  them.
- **No CI pipeline runs any of this automatically** — `.github/workflows/`
  exists (see `backend/README.md`'s deployment section) but per
  `docs/BACKEND_GAPS_AND_ISSUES.md`, this repo has no configured remote to
  actually run GitHub Actions against as of this writing.

## If SonarQube/OWASP ZAP are wanted

These are infrastructure/process decisions (which SonarQube instance —
self-hosted or SonarCloud, which ZAP scan target and schedule, who owns
triaging findings) that need to be made explicitly by whoever owns CI/CD
for this project, not silently wired up as a side effect of a
documentation pass. `AGENTS.md`'s Code Quality Gates section names both as
the intended tools for "Entire system" / "Running applications" scans —
this doc is where to record it once they're actually connected, with the
same evidence-based standard the rest of this security section holds to
(a real scan report referenced, not just "SonarQube is configured").
