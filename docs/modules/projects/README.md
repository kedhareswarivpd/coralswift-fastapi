# Module: Projects & Tasks

**Purpose**: project portfolio (also serves as public-facing case-study
content when published) and task tracking within a project.

**Users**: public (published projects only), any authenticated user
(tasks — see permission below), `admin`/`project_manager` for writes.

## Data model

`Project` (slug unique, client_id, status, progress_percent,
project_manager_id→users, is_published, `team` many-to-many to `Employee`
via `project_members`), `Task` (project_id CASCADE, assigned_to→users,
priority, status).

- `ProjectStatus`: `planning, in_progress, on_hold, completed, cancelled`
- `TaskStatus`: `todo, in_progress, in_review, done, blocked`
- `TaskPriority`: `low, medium, high, urgent`

## Endpoints

```
GET    /projects                    (public sees only is_published=True; filter employee_id)
GET    /projects/{id_or_slug}       (unpublished visible only to admin/super_admin/project_manager/marketing)
POST   /projects                    (admin, project_manager)
PUT    /projects/{id}               (admin, project_manager)
PATCH  /projects/{id}/team          (admin, project_manager — replaces team wholesale)
DELETE /projects/{id}               (admin)

GET    /tasks                       (any authenticated user; filters: project_id, assigned_to, status, priority)
POST   /tasks                       (admin, project_manager)
PATCH  /tasks/{id}/status           (admin/super_admin/project_manager, OR the task's own assignee)
```

## Business rules

- `PATCH /tasks/{id}/status` has an ownership-or-role check, not a pure
  role gate: a non-privileged caller can only update a task assigned to
  *themselves* — anyone else's task returns `403`.
- `PATCH /projects/{id}/team` fully replaces team membership (no
  additive/diff logic); resolves employee IDs by matching either
  `Employee.id` or `Employee.user_id`, accepting either form.
- Team is eager-loaded (`selectinload`) specifically to avoid an async
  lazy-load crash — see `database.md`'s `MissingGreenlet` explanation for
  the general pattern this follows.

## Events

None — no notification on task assignment, status change, or project
publish.

## Dependencies

[CRM Sales](../crm-sales/README.md) (a contract signature notifies staff
to manually create the onboarding project — no automatic link exists),
[Employees](../employees/README.md) (`team`), [Finance](../finance/README.md)
(`Invoice.project_id`), [Clients](../clients-partners/README.md).

## Known gaps

- No automatic project creation from a signed contract — the CRM module's
  kickoff notification is the entire hand-off; creating the actual
  `Project` row is a fully manual step today.
- **RESOLVED — real horizontal-privilege-escalation finding from an
  authorization audit**: `PUT /projects/{id}` and
  `PATCH /projects/{id}/team` previously let any `project_manager` edit or
  reassign the team of *any* project, not just ones where they're actually
  `project.project_manager_id`. Fixed with the same ownership-check pattern
  already used for clients/partners (`admin`/`super_admin` bypass,
  everyone else must be the project's assigned manager). See
  [security/authorization.md](../../security/authorization.md).
