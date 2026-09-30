# Concurrency Safety

This app runs 4 gunicorn workers (`docker/Dockerfile`) — never assume a
single in-process check is enough to prevent a race between two concurrent
requests. The real guarantees in this codebase are database constraints,
not application-level locks:

- **Payment double-recording** — prevented by a unique database index
  (`payments(invoice_id, transaction_ref)`), not just the
  check-then-insert logic in `finance.py`. See
  [transactions.md](transactions.md).
- **Duplicate contract per proposal** — prevented by `contracts.proposal_id`
  being a unique FK, not just `create_contract`'s existence check.
- **Session/token collisions** — every hashed token column
  (`user_sessions`, `password_reset_tokens`, `email_verification_tokens`,
  `mfa_backup_codes`, `mfa_challenges`) is database-unique.
- **Rate limiting across workers** — `slowapi`'s counter lives in Redis
  specifically because an in-memory counter would be per-worker-process;
  see [architecture/caching.md](../architecture/caching.md).

## RESOLVED: training enrollment race

`POST /trainings/enroll`'s duplicate-enrollment prevention was an
application-level query-then-insert check only, with no matching database
constraint — two concurrent enroll requests for the same employee/course
could both pass the check before either committed. **Fixed**: added
`UniqueConstraint("employee_id", "course_id")` to `training_enrollments`
(migration `664442caaa34`, which also removes any pre-existing duplicate
rows before adding the constraint), and the router now catches the
resulting `IntegrityError` and translates it into the same friendly `409`
the pre-check gives, rather than a raw `500` on a genuine race. Covered by
`tests/test_gap_fixes.py`.

## Where concurrency safety is still NOT explicitly handled (a real gap)

- **Employee upsert-by-`user_id`** (`POST /employees`) — relies on
  `employees.user_id` being unique at the database level to make a
  concurrent double-create fail loudly rather than silently duplicate, but
  the router's own "look up, then create-or-update" logic isn't
  transaction-isolated against a concurrent identical request — a genuine
  race would surface as a database `IntegrityError` (ugly, uncaught 500)
  rather than the friendly "profile updated" response. Not yet
  reproduced/fixed; noted for whoever picks this up.
