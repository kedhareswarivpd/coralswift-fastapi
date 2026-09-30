# Security Documentation

- [authentication.md](authentication.md) — session model, password hashing,
  MFA, OAuth, CSRF.
- [authorization.md](authorization.md) — the real RBAC mechanism, a
  genuine gap (the `Role`/`Permission` tables exist but aren't consulted),
  and the ownership/IDOR fixes made across two dedicated audits.
- [authorization-audit.md](authorization-audit.md) — a full request→router→
  dependency→query→database trace, mapping generic authorization concepts
  (organization/tenant, coordinator/agent) onto what this codebase actually
  has, every vulnerability found and fixed, and the explicit answer to "can
  one agent access another agent's records by manipulating IDs, query
  params, or bodies."
- [authorization-matrix.md](authorization-matrix.md) — the resource ×
  role access matrix, generated from the real `require_roles(...)`
  declarations and object-level scoping checks, not invented.
- [rate-limiting.md](rate-limiting.md) — limits, resilience under Redis
  outage.
- [secrets.md](secrets.md) — what's a secret, where it lives, what's
  gitignored.
- [audit-logging.md](audit-logging.md) — what's logged, what isn't.
- [file-upload-security.md](file-upload-security.md) — validation layers
  for uploads.
- [security-testing.md](security-testing.md) — what's actually tested
  today (RBAC matrix, CSRF, upload validation) vs. what's not (no
  SonarQube/OWASP ZAP wired into this repo yet — stated plainly, not
  glossed over).

This is the accurate, current state of a backend that has been through
several real security-focused sessions (see `status.md` for the evidence)
— not a target-state aspiration document. Where something is a known gap,
it's stated as a gap, cross-referenced to `docs/BACKEND_GAPS_AND_ISSUES.md`.
