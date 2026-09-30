# ADR-004: Flat role-string authorization (not the Role/Permission tables)

## Context

The database has `Role` and `Permission` models with a many-to-many
association (`role_permissions`), manageable through
`/access-control/roles` and `/access-control/permissions`. Investigating
`app/core/dependencies.py::require_roles()` while writing
`docs/security/authorization.md` found that **the actual authorization
mechanism never queries either table.**

## Decision (as found, not as newly made)

This documents the *actual* state, since no ADR previously existed for it
and a reader could reasonably assume the `Role`/`Permission` CRUD surface
is load-bearing. It is not. Authorization is a flat comparison:

```python
if current_user.role == "super_admin":
    return current_user
if current_user.role not in roles:
    raise ApiError.forbidden(...)
```

against `users.role`, a 14-value enum column, with every protected route
declaring its allowed roles directly in code
(`Depends(require_roles("admin", "hr"))`).

## Why this matters

- `Role`/`Permission` rows can be freely created/edited via the API with
  **zero effect** on what any user can actually do. An operator managing
  "roles and permissions" through that surface would reasonably expect it
  to control access — it does not.
- Every actual permission change requires a code change
  (editing which roles a `require_roles(...)` call lists), not a data
  change.

## Alternatives (not chosen, evaluated for future reference)

- **Wire `require_roles()` to query `Role`/`Permission`** — would make the
  existing data model load-bearing, at the cost of a database round-trip
  (or a cached lookup) per authorization check, and a real migration of
  every route's currently-hardcoded role list into `Role`/`Permission`
  data. Not attempted in this pass — it's a genuine feature addition, not
  a doc fix, and needs its own design/testing pass (in particular:
  deciding whether `super_admin`'s universal bypass survives, and how
  `RBAC` test coverage — currently 617 checks against the flat model —
  gets re-verified against the new mechanism).
- **Delete the unused `Role`/`Permission` tables and their router** —
  also not attempted, since it's unclear whether they're dead code or an
  intentionally-staged foundation for a future permission system; that's a
  product decision, not one this documentation pass should make
  unilaterally.

## Consequences

Anyone building a feature that needs finer-grained permissions than the 14
flat roles provide should not assume `Role`/`Permission` already provides
it — it needs to actually be wired up first. Flagged in
`docs/BACKEND_GAPS_AND_ISSUES.md` and `docs/security/authorization.md` as
open, not silently left for someone to discover the hard way.
