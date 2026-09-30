# Database

PostgreSQL, accessed via SQLAlchemy 2.0's async ORM + `asyncpg`. 67 tables as
of this writing (see `docs/database/schema.md`).

## Connection

`app/core/database.py` builds one `AsyncEngine` at import time from
`Settings.async_database_url` — either `DATABASE_URL` verbatim (if set) or
assembled from `DB_HOST`/`DB_PORT`/`DB_NAME`/`DB_USER`/`DB_PASS`. TLS is
pinned (`ssl: "require"`) for any non-local/non-test environment — asyncpg
doesn't default to requiring SSL, and this is the credential path to
production data.

Two pool configurations, selected by `DB_USE_PGBOUNCER`:
- **Direct** (`DB_USE_PGBOUNCER=false`, the default) — a normal SQLAlchemy
  `QueuePool` (`pool_size`/`max_overflow` from settings), `pool_pre_ping=True`.
- **Via PgBouncer** (`DB_USE_PGBOUNCER=true`, for a transaction-mode pooler
  like Supabase's) — the same pool, but `asyncpg`'s server-side
  prepared-statement caching is explicitly disabled
  (`statement_cache_size=0`, `prepared_statement_cache_size=0`, a unique
  `prepared_statement_name_func` per connection) — required for a pooled
  connection to be safely handed between different backend processes behind
  a transaction-mode pooler. Sizing rationale (why `pool_size`/`max_overflow`
  are set the way they are, and the load-test evidence behind it) lives in
  `backend/performance/pool_matrix_test.py` and is referenced as "CF-BE-009"
  throughout the codebase's comments.

`AsyncSessionLocal` is the shared `async_sessionmaker`, with
**`expire_on_commit=False`** — chosen so an object's attributes remain
readable after `commit()` without an implicit lazy-load. The one sharp edge
this doesn't fully cover: a column with `server_default`/`onupdate` (like
`Base.updated_at`, `server_default=func.now(), onupdate=func.now()`) is
still marked by SQLAlchemy as needing a re-fetch after an UPDATE touches
that row, **regardless** of `expire_on_commit=False` — accessing it
afterward without an explicit `await db.refresh(obj)` triggers an implicit
lazy-load that raises `MissingGreenlet` if it happens outside the request's
async greenlet context. This was a real bug found via a live drill (see
`status.md`) in `auth_service.py`'s login-tracking functions — fixed by
adding the missing `db.refresh()` calls. Every model mutation in this
codebase follows `commit()` → `refresh()` for exactly this reason.

`get_db()` is the FastAPI dependency every route uses
(`db: AsyncSession = Depends(get_db)`) — one session per request, closed in
a `finally` block.

## Base model

Every model (`app/core/database.py`'s `Base`) gets, for free:
- `id: UUID` (primary key, app-generated via `uuid.uuid4`, not a DB sequence
  or Supabase-issued value — this app owns identity generation end to end)
- `created_at`, `updated_at` (both `server_default=func.now()`,
  `updated_at` also `onupdate=func.now()`)
- `deleted_at` (nullable — soft-delete-ready, though most CRUD paths
  currently hard-delete via `CRUDBase.delete()`; `deleted_at` is there for
  models that need to preserve history, e.g. audit trails, rather than a
  blanket soft-delete policy across every table)

## Migrations

Alembic, async-aware `env.py`. 12 revisions as of this writing (see
`docs/database/migrations.md` for the full chain and the two real
migration bugs found while running them for real against a live Postgres:
`postgresql.ENUM(create_type=False)` needed instead of bare `sa.Enum(...)`
when a new table references a pre-existing enum type, and
`ALTER TYPE ... ADD VALUE` needing to run inside its own
`autocommit_block()` since it can't share a transaction with anything using
the new value).

`backend/scripts/migrate.sh {local|staging|both}` runs migrations against
either environment's `.env` file via the `ENV_FILE` mechanism (not bash
`source`-ing — see `backend/README.md` for why).

## Indexes, constraints, concurrency

See `docs/database/indexes.md` and `docs/database/concurrency.md` for the
concrete, code-verified examples (unique constraints backing
`UserSession`'s reuse detection, the `(invoice_id, transaction_ref)` unique
index backing payment idempotency, etc.) rather than restating the general
principle here.
