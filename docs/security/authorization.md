# Authorization (RBAC)

## The actual mechanism

`app/core/dependencies.py::require_roles(*roles)`:

```python
def require_roles(*roles: str):
    async def dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role == "super_admin":
            return current_user
        if current_user.role not in roles:
            raise ApiError.forbidden("You do not have permission to perform this action")
        return current_user
    return dependency
```

This is a **flat string check against `users.role`** — a plain
`Enum(UserRole)` column, 14 literal values
(`super_admin, admin, hr, sales, marketing, project_manager, developer, qa,
support, finance, client, employee, guest, partner`). `super_admin` is a
hardcoded, universal bypass: it always passes `require_roles(...)`
regardless of which roles were listed, everywhere.

Every protected route composes this dependency, either at the router level
(`APIRouter(dependencies=[Depends(require_roles(...))])` — applies to every
route in that router) or per-route (`Depends(require_roles(...))` on one
specific endpoint). `is_staff(user, *roles)` is a `None`-safe helper for
public-facing routes using `get_optional_user`, not a separate
authorization path.

Tested exhaustively: `tests/test_rbac_matrix.py`, 617 checks — every
role-restricted route × every role, both the "should be allowed" and
"should be forbidden" direction. Verified independent of *how* a user gets
authenticated (password login, MFA, OAuth) since `require_roles` runs
against the already-resolved `User` object, not the session mechanism.

## A real, code-confirmed gap: `Role`/`Permission` tables exist but aren't used

`app/models/role.py` (`Role`, many-to-many via `role_permissions` to
`Permission` in `app/models/permission.py`) and their management endpoints
(`/access-control/roles`, `/access-control/permissions`, both
`require_roles("admin")`) exist as manageable data — an admin can create
roles and permissions and assign permissions to roles through the API.

**Nothing in `require_roles()` or anywhere else in this codebase reads from
`Role`/`Permission` to make an authorization decision.** They sit alongside
the actual enforcement mechanism (the flat `users.role` string check) as an
apparently-unused, more granular permission layer. This was found via
direct code review of `core/dependencies.py` and a search for any other
consumer of the `Role`/`Permission` models — none exists.

This is not something to silently assume is "probably wired up somewhere
else." If fine-grained, per-permission authorization (beyond the current
14-role flat model) is a real product requirement, `Role`/`Permission`
already have the data model and CRUD surface — what's missing is
`require_roles()` (or a new dependency) actually querying them. Until that
happens, creating/editing roles and permissions through the API has no
effect on what any user can actually do.

**Deliberately not fixed in the same pass as the other findings in this
document.** Wiring `require_roles()` to actually query `Role`/`Permission`
is a real feature addition, not a bug fix — every one of the ~50 routers'
hardcoded role lists would need migrating into DB rows, the `super_admin`
universal-bypass behavior needs a decision on whether it survives the new
mechanism, and the 621 RBAC-matrix tests currently asserting the flat-role
behavior would need redesigning against the new one, not just re-running.
Doing that alongside four unrelated, independent bug fixes in one pass
would risk a much larger regression surface for a change that needs its
own design/review, not a documentation-driven drive-by. See
[decisions/ADR-004](../decisions/ADR-004-flat-role-authorization.md) for
the alternatives considered.

## RESOLVED: a full OWASP-style authorization audit found and fixed 6 more real issues

A follow-up audit specifically targeting IDOR/BOLA, horizontal/vertical
privilege escalation, mass assignment, and broken function-level
authorization (across every router, via 3 parallel code-reading passes)
found 6 additional real, confirmed issues — all fixed and live-drill-verified:

- **`PATCH /leads/{lead_id}` — IDOR** (the most severe finding). `GET
  /leads/{id}` already blocked a `sales` user from reading a lead they
  don't own; `PATCH` had no matching check at all, letting any `sales`
  user modify — including reassigning `owner_id` to themselves — a lead
  owned by a different salesperson. **Fixed** with the identical ownership
  check `GET` already used. Live-drill-verified: a sales user was
  correctly rejected (`403`) attempting to PATCH a lead reassigned to
  another user in the database.
- **`PUT /users/{id}` and `PATCH /users/{id}/deactivate` — inconsistent
  escalation boundary.** `create_user`/`update_user` already blocked HR
  from *granting* admin/super_admin, but neither endpoint checked whether
  the *target* already held one of those roles — HR could still edit an
  existing admin's fields (including flipping `is_active` via `PUT`) or
  deactivate them outright via the dedicated endpoint, neutralizing an
  account HR isn't allowed to create. **Fixed**: both endpoints now load
  the target first and block any modification to an existing
  admin/super_admin account unless the caller is `super_admin`.
  Live-drill-verified: HR's attempts to deactivate and to `PUT` the real
  admin account both now return `403`, admin account confirmed untouched.
- **PM leave/timesheet approval not scoped to team** (see
  `docs/modules/employees/README.md` — already partially documented as a
  gap; now fixed). A `project_manager` could list/approve any employee's
  leave or timesheet company-wide, not just their own reports. **Fixed**
  with a `_pm_team_employee_ids()` helper (team = employees whose
  `reporting_manager_id` is the PM's own `Employee.id`), applied to both
  the list and approve endpoints for leaves and timesheets; `admin`/`hr`
  are unaffected (still see everyone).
- **PM project/team management not scoped to assignment** — any
  `project_manager` could edit any project's details or reassign any
  project's team, not just projects where they're the actual
  `project_manager_id`. **Fixed** with the same ownership-check pattern
  already used for clients/partners.
- **`create_employee`'s re-POST-to-update branch allowed identity-field
  mass assignment** — updating an existing employee via `POST /employees`
  applied every `EmployeeCreate` field including `user_id`/`employee_code`,
  which should never change on an existing row. **Fixed**: those two
  fields are now excluded from the update branch.

All 5 are covered by `tests/test_authz_gap_fixes.py` (17 tests).

**Two related findings from the same audit, deliberately left as
documented product decisions rather than unilaterally changed** (consistent
with the reasoning already established for `/stats` above): `ticket.py`
and `meetings.py` let any staff member with the router's role see/modify
every ticket/meeting regardless of which client/project it belongs to —
`ticket.py`'s own code comments confirm this is intentional
(support/admin need full visibility); `meetings.py` has no such comment, so
this is flagged as needing the same explicit confirmation rather than
assumed either way. `media.py`'s `DELETE /{id}` similarly has no per-uploader
ownership check across the three roles (admin/marketing/hr) that share it —
plausibly an intentional shared department resource, not confirmed either
way. See `status.md`'s corresponding session entry for the full account.

## Ownership checks (IDOR)

A role check alone is not sufficient for `/me/*`-style or ID-scoped
endpoints — several real IDOR-safe patterns exist and should be the
template for new ones:

- **Session revocation** (`DELETE /auth/sessions/{session_id}`) — a
  session that doesn't belong to the caller returns the same `404` as one
  that doesn't exist at all, never revealing whether the ID is valid for
  someone else.
- **Leads** — a `sales` role caller listing/reading leads is
  auto-filtered/403'd against `owner_id`, not just role-gated.

## RESOLVED: staff-side file/report uploads are now ownership-checked

`POST /clients/me/files`, `POST /clients/me/reports`,
`POST /partner-accounts/me/files` take the target `client_id`/
`partner_account_id` as an explicit request field rather than deriving it
from the authenticated user — a role check alone (`admin`/`project_manager`/
`finance`/`sales`, depending on the route) previously let any staff member
with that role attach a file/report to **any** client or partner account,
not just the ones they're actually assigned to manage.

**Fixed**: both routers now call `_require_assigned_account_manager()`
after loading the target client/partner — `admin`/`super_admin` bypass
(matching `require_roles()`'s own bypass convention), everyone else must
have an `Employee` row whose `id` matches the resource's
`account_manager_id`, or the request is rejected with `403`. Live-drill
verified against the real running stack: an admin uploading to an
unassigned client succeeded; a `project_manager` not assigned as that
client's account manager was rejected with
`403 You are not the assigned account manager for this client`. Covered by
`tests/test_gap_fixes.py`.

## A related, code-confirmed observation: `/stats` is fully public

`GET /stats` has no auth dependency at all — it returns aggregate business
counts (employee count, client count, active project count, distinct
client countries) to any unauthenticated caller. This may well be
intentional (a public marketing-page stats widget), but it's worth
explicitly confirming that intent rather than assuming it, since it's a
meaningfully different exposure than every other dashboard/stats endpoint
in this codebase, which are all role-gated.

**Deliberately not changed.** The endpoint's own code shape (every count
wrapped in try/except defaulting to `0`, no PII, only round aggregate
numbers) reads as a purpose-built public marketing widget, not an
oversight — the kind of "X employees, Y clients, Z countries" badge a
public site's homepage commonly shows. Adding an auth requirement would be
a product-facing breaking change to whatever public page currently renders
these numbers, which isn't this documentation/bug-fix pass's call to make
unilaterally. Flagged here so it gets an explicit yes/no from whoever owns
the public site's content, not silently left ambiguous.
