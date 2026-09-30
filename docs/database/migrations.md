# Migrations

Alembic, async-aware `env.py`, 11 revisions as of this writing:

```
4fd2db9b42b4  initial_schema
b2c3d4e5f6a7  add_reports_table
a1b2c3d4e5f6  client_portal_files_reports_meetings
c3d4e5f6a7b8  add_crm_leads_proposals_contracts
d1e2f3a4b5c6  add_generated_by_to_reports
e2f3a4b5c6d7  add_missing_fk_indexes
4a2dbc43345c  payment_idempotency
7130a92059c9  partner_portal
370721f881ed  coralswift_auth_migration
6ba70af745ad  mfa_and_oauth
```

Run via `backend/scripts/migrate.sh {local|staging|both} [downgrade -1]` —
see `backend/README.md` for why this uses Alembic's own `ENV_FILE`
mechanism rather than bash-sourcing the `.env` file.

## Two real bugs found by actually running these against a live Postgres

1. **`postgresql.ENUM(..., create_type=False)` required, not bare `sa.Enum(...)`.**
   When a new table's column references a Postgres enum type that another
   migration already created (e.g. `partner_type`, `lead_source`,
   `lead_status`), Alembic's own `sa.Enum(..., create_type=False)` doesn't
   reliably suppress the implicit `CREATE TYPE` DDL it emits for a
   table-creation statement — it re-attempted creation and failed with
   `DuplicateObjectError`/`type "X" already exists`. Fixed by importing
   `postgresql.ENUM` from `sqlalchemy.dialects.postgresql` directly instead
   (see `7130a92059c9_partner_portal.py`, `c3d4e5f6a7b8_add_crm_leads_proposals_contracts.py`).
2. **`ALTER TYPE ... ADD VALUE` cannot share a transaction with anything
   using the new value.** Adding a new value to an existing enum (e.g. the
   `partner` role added to `user_role`) must run inside its own
   `op.get_context().autocommit_block()` — attempted inline, it failed
   because Postgres won't let a new enum value be used in the same
   transaction that added it.

## The auth migration's data-backfill consideration

`370721f881ed_coralswift_auth_migration.py` adds `users.password_hash` as
`NOT NULL` to a table with existing rows — handled as
add-nullable → backfill → constrain-not-null. Existing (pre-migration)
users are backfilled with a random, unusable Argon2id-*shaped* hash via
`gen_random_uuid()` (core Postgres 13+, no extension needed — `pgcrypto`'s
`gen_random_bytes()` was tried first and found not installed on this
project's local Postgres). This is a genuine, unavoidable migration
consequence — see
[decisions/ADR-001](../decisions/ADR-001-self-owned-authentication.md) for
why (this app never had those users' plaintext passwords to carry
forward), and `docs/BACKEND_GAPS_AND_ISSUES.md` for the required one-time
`forgot-password` action per pre-existing account.
