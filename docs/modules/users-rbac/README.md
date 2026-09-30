# Module: Users & RBAC

**Purpose**: staff/admin account management, and the role-based access
control every other module depends on.

**Users**: `admin`/`hr` for the router; `admin` specifically (narrower)
for deletion.

## The actual RBAC mechanism

See [security/authorization.md](../../security/authorization.md) for the
full explanation, including a real, code-confirmed gap: the `Role`/
`Permission` tables (below) are manageable via API but **not consulted**
by the actual authorization check, which is a flat `users.role` string
comparison.

## Endpoints

```
GET    /users                          (filters: role, is_active)
GET    /users/{id}
POST   /users                          (escalation-guarded — see below)
PUT    /users/{id}                     (same escalation guard)
PATCH  /users/{id}/deactivate          (revokes all sessions immediately)
DELETE /users/{id}                     (role: admin only, narrower than the router's admin/hr)

GET/POST/PUT/DELETE /access-control/roles         (admin — see the gap above)
GET/POST/PUT/DELETE /access-control/permissions   (admin — see the gap above)
```

## Business rules

- **Privilege-escalation guard**: creating/updating a user with
  `role in ("admin", "super_admin")` requires the caller themselves to be
  `super_admin` — an `hr` user (who can otherwise create users) cannot
  create or promote anyone to `admin`/`super_admin`.
- **Auto-Employee creation**: creating a user with any staff role
  auto-creates a matching `Employee` row with a generated
  `employee_code = EMP-{uuid[:8].upper()}`.
- **Deactivation kills live sessions immediately**: `PATCH /users/{id}/deactivate`
  calls `revoke_all_sessions()`, not just flipping `is_active` — since
  `get_current_user` checks `is_active` on every request, this takes effect
  on the deactivated user's very next request, not just their next login.
- `POST /users` sets `is_email_verified=True` unconditionally — an
  admin-provisioned account is treated as pre-verified.

## Events

None — no welcome or deactivation email sent from this router (contrast
with the CRM module's contract-signing flow, which does email a
newly-provisioned client).

## Dependencies

Every other module depends on this one's `users.role` for authorization.

## Known gaps

- The `Role`/`Permission` fine-grained model is unused dead weight from an
  enforcement perspective — see
  [security/authorization.md](../../security/authorization.md).
- No email notification on account creation or deactivation.
- **RESOLVED — a real gap found via an authorization audit**: the
  privilege-escalation guard only fired when *granting* admin/super_admin —
  it never checked whether the *target* already held one of those roles,
  so an HR caller (barred from creating/promoting admins) could still
  modify an existing admin's fields via `PUT`, or deactivate one outright
  via `PATCH .../deactivate`. Both endpoints now load the target first and
  block any modification to an existing admin/super_admin account unless
  the caller is `super_admin`. Live-drill-verified against the real admin
  account. See [security/authorization.md](../../security/authorization.md).
