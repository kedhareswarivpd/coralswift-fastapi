# Indexes & Constraints That Back Real Guarantees

Not an exhaustive index list — the ones below are load-bearing for a
security or correctness property, not just a query-speed optimization, so
they're documented with *why*.

- **`user_sessions.session_token_hash` / `refresh_token_hash`** —
  `unique=True, index=True`. The uniqueness is what makes a token collision
  detectable rather than silently overwriting another session; the index
  is what makes every authenticated request's session lookup (one per
  request) fast rather than a table scan.
- **`user_sessions.previous_refresh_token_hash`** — indexed (not unique —
  it's allowed to be null for most rows). This is the column that makes
  refresh-token reuse detection possible: a presented token matching this
  column instead of the current `refresh_token_hash` is a replay of an
  already-rotated-away token, treated as a theft signal (see
  [security/authentication.md](../security/authentication.md)).
- **`mfa_backup_codes.code_hash`, `password_reset_tokens.token_hash`,
  `email_verification_tokens.token_hash`, `mfa_challenges.token_hash`** —
  all `unique=True`. Same reasoning as session tokens: a hash collision
  must be detectable, not silently accepted.
- **`oauth_accounts(provider, provider_account_id)`** — composite unique
  constraint (`uq_oauth_provider_account`). This is what prevents a second
  person from ever hijacking an already-linked social-login identity — two
  different local users can never both claim the same
  `(provider, provider_account_id)` pair.
- **`payments(invoice_id, transaction_ref)`** — unique index added in
  `4a2dbc43345c_payment_idempotency`. This is the actual integrity
  guarantee behind payment idempotency (see
  [transactions.md](transactions.md)) — the application-level
  check-then-insert in `finance.py` is a fast-path/friendly-error layer on
  top of this constraint, not a substitute for it; a genuine race between
  two concurrent requests with the same reference is caught by the
  database, not the application logic.
- **`contracts.proposal_id`** — unique FK. A proposal can have at most one
  contract, enforced at the database level, not just checked in
  `create_contract`'s idempotent-return logic.
- **`employees.user_id`, `clients.user_id`, `partner_accounts.user_id`** —
  each unique. One `Employee`/`Client`/`PartnerAccount` profile per `User`,
  which is what makes the auto-provisioning pattern (see
  `docs/modules/employees/README.md`) safe to call repeatedly without
  risking duplicate profile rows for the same user.

## FK `ondelete` policy

`CASCADE` is used specifically where the child record has no meaning
without its parent (e.g. `user_sessions`, `mfa_backup_codes`, `ticket_replies`,
`applications` on their career/user parent) — deleting the parent should
never leave orphaned rows. Where a child should survive its parent's
deletion for audit/history reasons (e.g. `audit_logs.user_id`), no cascade
is set, and the FK is nullable.
