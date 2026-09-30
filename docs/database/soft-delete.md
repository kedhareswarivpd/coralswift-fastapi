# Soft Delete

Every table has a `deleted_at` column (from `Base`), but this is **not** a
uniformly-enforced soft-delete policy across the codebase — it's available
per-model, used inconsistently.

- **`CRUDBase.delete()`** (the generic delete path most simple CMS
  resources use) performs a real `DELETE`, not a `deleted_at` stamp — a
  hard delete.
- **RESOLVED**: `GET /stats` used to filter `Project` by `deleted_at IS NULL`
  even though no route in `projects.py` ever sets `deleted_at`
  (`DELETE /projects/{id}` goes through the generic hard-delete
  `CRUDBase.delete()`) — a real inconsistency where one query implied
  soft-delete was in effect when it never was. **Fixed**: the filter was
  removed rather than implementing a real soft-delete for `Project` (a
  larger, separate feature decision this documentation-driven pass
  shouldn't make unilaterally) — `/stats`'s project count now matches what
  every other query against `Project` already assumes.
- **Backups, audit logs** — never deleted by application code at all
  (audit logs have no delete endpoint; backups are deleted by filename via
  a dedicated admin endpoint, a real file removal, not a `deleted_at`
  pattern).

## If you're adding a new feature

Don't assume `deleted_at IS NULL` is being respected elsewhere just because
the column exists — check the specific query. Don't add a new soft-delete
path without also auditing every existing query against that table for
whether it needs a matching `deleted_at IS NULL` filter, or a genuinely
deleted row will keep showing up somewhere unexpected.
