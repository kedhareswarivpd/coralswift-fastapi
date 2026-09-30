# Transactions

Most of this codebase uses SQLAlchemy's implicit per-statement transaction
via `AsyncSession.commit()` — a route/service does its work, calls
`await db.commit()` once, done. Two places have real, deliberate
multi-step transaction handling worth calling out:

## Payment idempotency (`app/routers/finance.py::record_payment`)

```
1. If payload.transaction_ref is set:
   query for an existing Payment with (invoice_id, transaction_ref)
   → if found: return it as-is, override response.status_code to 200
     ("Payment already recorded for this reference")
2. Otherwise: insert a new Payment, commit
3. Sum all completed Payments for the invoice
4. If paid_total >= invoice.total_amount: set invoice.status = "paid", commit
```

The check-then-insert (step 1) is a fast, friendly-error path — the actual
integrity guarantee against a genuine race is the
`(invoice_id, transaction_ref)` unique database index (see
[indexes.md](indexes.md)), not this application-level check. An earlier
version of this code relied on catching a mid-commit `IntegrityError`
instead, which surfaced a real `MissingGreenlet` error under Starlette's
`BaseHTTPMiddleware` — the check-then-insert pattern replaced it.

Returning `200` instead of the route's default `201` on an idempotent
replay requires manually overriding `response.status_code`, since
Starlette applies the decorator's declared `status_code=201` regardless of
what the handler logic decides — a real, non-obvious FastAPI behavior this
codebase hit twice (see contracts.py below) and now documents inline both
places.

## Contract creation/signing (`app/routers/contracts.py`)

- `create_contract` is idempotent the same way: a second `POST /contracts`
  for a `proposal_id` that already has a `Contract` returns the existing
  one with `response.status_code` manually set to `200`, backed by the
  real unique constraint on `contracts.proposal_id`.
- `sign_contract` only flips `status → signed` once **both**
  `signed_by_client_at` and `signed_by_company_at` are set — a partial
  signature (one party only) leaves the contract `pending`.
- **Account provisioning on full signature** runs as a best-effort
  side-process, not inside the same transaction as the signature update:
  the contract's `signed` status commits regardless of whether
  `_provision_client_account()` (creating the `User`/`Client` row, sending
  the welcome/password-set email) succeeds — provisioning failures are
  caught broadly and logged, deliberately not rolled back into "the
  contract isn't signed after all." This is a considered trade-off: a
  signed contract is a legal/business fact that shouldn't be undone by an
  unrelated infrastructure hiccup (email delivery, a transient DB error on
  the `Client` insert) — see
  [decisions/](../decisions/) for the CRM pipeline's fuller reasoning if a
  dedicated ADR is added later.
