# Database Documentation

PostgreSQL, 67 tables, accessed via SQLAlchemy 2.0 async ORM. See
[architecture/database.md](../architecture/database.md) for the connection/
pooling/engine setup — this section covers schema, migrations, and the
integrity/concurrency guarantees actually enforced in code.

- [schema.md](schema.md) — table groups and what each owns.
- [migrations.md](migrations.md) — the real migration chain, including two
  genuine bugs found by actually running migrations against a live Postgres.
- [indexes.md](indexes.md) — the unique constraints/indexes that back real
  security or correctness guarantees, not just performance.
- [transactions.md](transactions.md) — where explicit transaction handling
  matters (payment idempotency, contract signing).
- [concurrency.md](concurrency.md) — how concurrent-write safety is
  actually achieved (database constraints, not application-level locking).
- [soft-delete.md](soft-delete.md) — `deleted_at`'s actual, limited usage.
