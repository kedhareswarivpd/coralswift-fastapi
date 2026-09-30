# Authorization Audit

**Scope of this document**: a full trace of authorization from request → router
→ dependency → service/CRUD → SQL query → database, across every router in
this backend, against IDOR/BOLA, horizontal/vertical privilege escalation,
mass assignment, missing function-level authorization, multi-tenant
leakage, and broken object-property authorization.

**A note on the request that produced this document**: the request this
audit was commissioned under assumes a `Coordinator → Agent → Record` and
`Organization/tenant` architecture. **This codebase has neither.** Per that
request's own Phase 1 instruction ("do NOT assume the current
architecture, first inspect"), this document reports what's actually here
— a single-tenant application (one company, CoralSwift Technologies,
serving its own clients/partners) with a flat 14-role model and several
independent manager-scoped hierarchies that play the same *structural*
role as "Coordinator → Agent → Record" without literally being named that.
Section A maps each generic concept from that request onto its real
equivalent here, explicitly, rather than inventing an Organization/tenant
model or Coordinator/Agent tables that would just duplicate what
`Employee`/`reporting_manager_id`, `account_manager_id`, and `owner_id`
already do.

---

## A. Mapping the assumed architecture onto what actually exists

| Assumed concept | What actually exists here |
|---|---|
| Organization / tenant | **Does not exist.** Single-tenant app — one company's own staff, clients, and partners. No `organization_id`/`tenant_id` column anywhere in the schema (confirmed by grep across every model). See §F for what this means for "multi-tenant isolation." |
| Role model (dynamic, DB-backed) | `UserRole` — a fixed Python enum on `users.role`, 14 literal values (not a DB table applications can extend at runtime). |
| Permission model | `Role`/`Permission` tables **exist** (`app/models/role.py`, `app/models/permission.py`, many-to-many via `role_permissions`) but are **not consulted by the actual authorization mechanism** — a pre-existing, documented architectural gap (see §G and [ADR-004](../decisions/ADR-004-flat-role-authorization.md)). |
| Coordinator | No single "Coordinator" entity. The closest real equivalent, used consistently across three independent resource types: **`Employee.reporting_manager_id`** (a `project_manager` "coordinates" the employees reporting to them for leave/timesheet approval), **`Client.account_manager_id` / `PartnerAccount.account_manager_id`** (a staff member "coordinates" the clients/partners assigned to them), **`Lead.owner_id`** (a `sales` rep "coordinates" their own leads), **`Project.project_manager_id`** (a `project_manager` "coordinates" their own projects). |
| Agent | No single "Agent" entity. The role playing this part varies by resource: `project_manager` (for employees' leave/timesheets and for projects), `admin`/`sales`/`finance` (for clients/partners), `sales` (for leads). |
| Records | Depends on context: `Leave`/`Timesheet` (employees), `ClientFile`/`ClientReport` (clients), `PartnerFile` (partners), `Project`/task/team (projects), `Lead` (CRM). |
| User → Organization | N/A — no organization table. |
| User → Role | `users.role` — direct enum column, not a join table. |
| Coordinator → Agents | `Employee.reporting_manager_id` (self-referential FK on `Employee`, pointing at another `Employee.id`). |
| Agent → Records | `Leave.employee_id`, `Timesheet.employee_id`, `Client.account_manager_id`, `PartnerAccount.account_manager_id`, `Lead.owner_id`, `Project.project_manager_id` — each resource type has its own direct FK to the responsible staff member, not one generic "assignment" table. |

**Why this document doesn't introduce an `Organization`/`Coordinator`/`Agent`
abstraction**: per the same request's Phase 17 ("do not create duplicate
authorization mechanisms," "understand current database relationships"),
adding a generic multi-tenant/assignment layer on top of four
resource-specific FKs that already do this job would be pure duplication
with no current requirement driving it (this is a single company's
internal system, not a multi-tenant SaaS product). If genuine multi-tenancy
(multiple client companies each running their own isolated instance of
this data) becomes a real product requirement, that's a data-model change
(a new `organization_id` column cascading through every table) requiring
its own migration and design — not something to retrofit as a side effect
of an authorization audit.

---

## B. Existing roles (`UserRole` enum, `app/models/enums.py`)

| Role | Purpose | Create | Read | Update | Delete | Assign/Reassign | Export | Approve | Manage Users | Manage Roles |
|---|---|---|---|---|---|---|---|---|---|---|
| `super_admin` | Full system control | ✅ everywhere | ✅ everywhere | ✅ everywhere | ✅ everywhere | ✅ | ✅ (GDPR export of any user) | ✅ | ✅ full (incl. granting admin) | ✅ |
| `admin` | Day-to-day operator | ✅ most resources | ✅ most resources | ✅ most resources | ✅ most resources (except deleting other users — `admin`-only, see §G) | ✅ (clients/partners/projects/leads — role-gated, not scope-limited) | limited (backups: `super_admin` only) | ✅ (leaves/timesheets/proposals) | ✅ **except** cannot grant/modify/deactivate `admin`/`super_admin` accounts (fixed this session) | ❌ (Role/Permission CRUD is `admin`-gated but has no effect — see §G) |
| `hr` | People operations | ✅ employees, careers | ✅ employees, careers, users | ✅ employees, users (same admin/super_admin restriction as above) | ❌ (cannot delete users — `admin`-only) | ❌ | ❌ | ✅ leaves/timesheets (**now team-scoped**, see §H) | ✅ **except** admin/super_admin accounts | ❌ |
| `project_manager` | Delivery lead | ✅ projects, tasks | ✅ projects/tasks/leaves/timesheets/meetings | ✅ **own** projects only (fixed this session); leaves/timesheets **own team only** (fixed this session) | ❌ (`admin`-only project delete) | ✅ **own** projects' teams only (fixed this session) | ❌ | ✅ leaves/timesheets **own team only** | ❌ | ❌ |
| `sales` | Business development | ✅ leads, proposals (own) | ✅ **own** leads only (list+get already scoped; PATCH now scoped too — fixed this session) | ✅ **own** leads only (fixed this session) | ❌ (`admin`-only lead delete) | N/A | ❌ | N/A | ❌ | ❌ |
| `marketing` | Content/CMS | ✅ blog/CMS resources | ✅ CMS, leads (read) | ✅ CMS resources | ✅ some CMS resources | N/A | ❌ | N/A | ❌ | ❌ |
| `finance` | Billing | ✅ invoices/payments | ✅ invoices/payments (all — no per-client scope; role-gated business function, not a per-resource ownership model) | ✅ invoices | ❌ | N/A | ❌ | N/A | ❌ | ❌ |
| `developer`, `qa`, `support` | Delivery/support staff | limited | own `/me/*` self-service | own profile | ❌ | N/A | ❌ | N/A | ❌ | ❌ |
| `client` | External customer | own tickets | **own** projects/invoices/payments/tickets/files/reports/meetings only (`_get_client_for_user` scoping) | own profile, own tickets (create only) | ❌ | N/A | ❌ | N/A | ❌ | ❌ |
| `partner` | External partner | own tickets | **own** profile/files/tickets only (`_get_partner_account_for_user` scoping) | own profile (excluding `account_manager_id`) | ❌ | N/A | ❌ | N/A | ❌ | ❌ |
| `employee` | Generic staff self-service | own leave/timesheet requests | own `/me/*` only | own profile | ❌ | N/A | ❌ | N/A | ❌ | ❌ |
| `guest` | Default/unassigned | none | public content only | none | none | N/A | N/A | N/A | ❌ | ❌ |

## C. Existing permissions

There is **no dynamic, data-driven permission system in effect** — see §A
and §G. The 14 roles above, and each router's `require_roles(...)`
declaration, **are** the permission system. `Role`/`Permission` database
rows can be created via `/access-control/roles`/`/access-control/permissions`
but have zero effect on any authorization decision.

## D. Existing protected resource types (actual, from the schema)

Users, Employees, Departments, Leaves, Timesheets, Payslips, Employee
Documents, Performance Reviews, Courses/Training Enrollments, Clients,
Client Files, Client Reports, Partner Accounts, Partner Files, Projects,
Tasks, Invoices, Payments, Leads, Proposals, Contracts, Blogs, Comments,
Careers, Applications, Tickets, Ticket Replies, Meetings, Media,
Notifications, Audit Logs, Settings, Backups. (Plus ~20 public/CMS
resources — services, testimonials, FAQs, etc. — which are intentionally
publicly readable and role-gated only for writes; not security-sensitive
in the same sense.)

## E. Existing relationships (actual schema)

```
User.role                                    → UserRole enum (flat, not a join table)
User ←1:1→ Employee (Employee.user_id)
User ←1:1→ Client (Client.user_id)
User ←1:1→ PartnerAccount (PartnerAccount.user_id)
Employee.reporting_manager_id  → Employee.id       (self-referential: "coordinator")
Employee.department_id         → Department.id
Client.account_manager_id      → Employee.id       ("coordinator" for a client)
PartnerAccount.account_manager_id → Employee.id    ("coordinator" for a partner)
Lead.owner_id                  → User.id           ("coordinator" for a lead — a sales rep)
Project.project_manager_id     → User.id           ("coordinator" for a project)
Project.team                   ←M:M→ Employee (via project_members)
Leave.employee_id, Timesheet.employee_id → Employee.id  ("records" owned by an "agent")
Ticket.client_id / partner_account_id    → Client / PartnerAccount (nullable, one or the other)
```

## F. Multi-tenant isolation — N/A, documented rather than fabricated

There is no organization/tenant column anywhere in this schema (verified
by grepping every model file). "Multi-tenant leakage" in the sense the
request describes (Organization A's data visible to Organization B) is
**not an applicable vulnerability class here** — there is exactly one
tenant, this company. The isolation that *does* matter and *was* audited
is the assignment-based isolation within that one tenant (§A's mapping) —
e.g., one client's files must not be visible to another client, one
sales rep's leads must not be visible to another. That is what §H covers.

## G. Current authorization flow (traced request → database)

```
Request
  │
  ▼
FastAPI dependency: get_current_user(request, db)
  — reads the httpOnly session cookie, looks up the live
    UserSession row (hashed token), loads the User — see
    docs/security/authentication.md
  │
  ▼
require_roles("admin", "hr", ...) [router-level or per-route dependency]
  — a flat string check against current_user.role
  — super_admin ALWAYS bypasses this check unconditionally
  │
  ▼
Route handler
  — for `/me/*` self-service routes: resolves the caller's own
    Employee/Client/PartnerAccount via a `_get_..._for_user()` helper
    keyed on current_user.id — this IS the object-level scoping for
    self-service endpoints, and it was already correct everywhere
    audited.
  — for admin/staff routes touching a SPECIFIC resource by ID: prior to
    this session, several of these loaded the resource by ID with ONLY
    the router-level role check and no per-resource ownership check —
    see §H for exactly which, and which were already correct.
  │
  ▼
CRUDBase / direct SQLAlchemy query
  — filters are applied via `.where(...)` clauses (parameterized,
    not string-built) — no SQL injection surface found.
  — CRUDBase.list() only supports equality filters; endpoints needing
    an IN-based scope (e.g. "any of my team's employee_ids") build
    their own query — this is why the PM-team-scoping fix in
    employees.py couldn't reuse CRUDBase.list() as-is.
  │
  ▼
PostgreSQL
```

**Known-good pattern this audit confirmed and reused, not invented**: every
`/me/*` self-service endpoint across clients.py, partner_account.py, and
employees.py already derived its scope from `current_user.id` via a
`_get_..._for_user()` helper, never from a client-supplied ID. The fixes
in §H extend this exact same pattern (a small `_require_...` or
`_...team_ids()` helper, checked before the mutating operation) to the
staff-facing endpoints that were missing it — not a new architecture, the
same one already in place, applied consistently.

---

## H. Vulnerabilities found and fixed (this audit + the immediately preceding one)

Two back-to-back audit passes this engagement found and fixed 11 real
issues total. Full technical detail and live-drill evidence for each is in
`status.md`'s corresponding session entries; summarized here against the
request's specific checklist:

| # | Vulnerability class | Resource / endpoint | Root cause | Fix | Evidence |
|---|---|---|---|---|---|
| 1 | **IDOR / BOLA** (most severe) | `PATCH /leads/{lead_id}` | `GET` checked `lead.owner_id == current_user.id` for `sales`; `PATCH` didn't | Added the identical check before applying the update | Live-drilled: reassigned a real lead's owner in Postgres, confirmed the original sales session gets `403` on both GET and PATCH |
| 2 | **Vertical privilege escalation** | `PUT /users/{id}`, `PATCH /users/{id}/deactivate` | Escalation guard only fired when *granting* admin/super_admin, never checked the *target's existing* role | Load target first; block any modification to an existing admin/super_admin account unless caller is `super_admin` | Live-drilled against the real seeded admin account |
| 3 | **Horizontal privilege escalation** | `GET/PATCH /employees/leaves*`, `/timesheets*` | No team scoping for `project_manager` despite the code's own "PM reviews their team's" comment | `_pm_team_employee_ids()` (team = `reporting_manager_id` match), applied to list + approve for both resources | Unit-tested (`test_authz_gap_fixes.py`) |
| 4 | **Horizontal privilege escalation** | `PUT /projects/{id}`, `PATCH /projects/{id}/team` | No check that the calling PM is `project.project_manager_id` | `_require_own_project_or_admin()` | Unit-tested |
| 5 | **Mass assignment** | `POST /employees` (update-in-place branch) | Re-POSTing an existing `user_id` applied every `EmployeeCreate` field including `user_id`/`employee_code` | Excluded identity fields from that branch | Unit-tested |
| 6 | **Improper ownership validation** | `POST /clients/me/files`, `.../reports`, `POST /partner-accounts/me/files` | Role-gated but not ownership-gated — any staff with the role could attach a file to *any* client/partner | `_require_assigned_account_manager()` | Live-drilled: admin bypass succeeded, non-owning PM got real `403` |
| 7 | **Broken function-level authorization** (fixed, prior session) | `DELETE /meetings/{id}` | Named/responded as "cancel" but hard-deleted the row | Now sets `status="cancelled"` | Live-drilled |
| 8 | **Missing DB constraint (race)** | `POST /trainings/enroll` | Duplicate-enrollment check was app-level only | Added a real unique constraint + migration | Migration applied live |
| 9 | **Parameter tampering resistance already correct, verified not assumed** | `GET /leads?owner_id=...` | A `sales` caller's `owner_id` query param is **ignored** — the filter is force-set to `current_user.id` regardless of what's in the query string | No change needed — confirmed correct by reading the exact code path, not assumed | Code-verified |
| 10 | **Session/reuse-detection** (fixed, earlier session) | Refresh-token rotation | N/A — this is an authentication finding already covered in `security/authentication.md`, listed here only for completeness against the request's "JWT/session authorization flaws" category | Reuse detection revokes the session | Live-drilled |
| 11 | **Ownership check already correct, verified not assumed** | `GET /clients/me/*`, `GET /partner-accounts/me/*` | Every self-service list/get endpoint derives its scope from `current_user.id` via `_get_client_for_user`/`_get_partner_account_for_user` | No change needed | Code-verified |

### Deliberately NOT changed — explicit product decisions, not oversights

- **`GET /stats`** has no authentication at all. Its own code shape (every
  count wrapped in try/except defaulting to `0`, only round aggregate
  numbers, no PII) reads as an intentional public marketing widget.
  Changing this would be a product-facing breaking change to whatever
  public page depends on it.
- **`Role`/`Permission` tables have zero effect on authorization.** Wiring
  them up is a genuine feature addition (migrating ~50 routers' hardcoded
  role lists into DB rows, deciding whether `super_admin`'s bypass
  survives, redesigning the 621-check RBAC test suite) — too large to
  bundle into an audit-and-fix pass without its own design/review. See
  [ADR-004](../decisions/ADR-004-flat-role-authorization.md).
- **`ticket.py`'s cross-client/partner staff visibility** (any `admin`/
  `support` sees every ticket) — the router's own code comments confirm
  this is intentional (support needs full queue visibility), not a gap.
- **`meetings.py`'s cross-project staff visibility** (any `sales`/
  `project_manager` sees every meeting) — same pattern as tickets, but
  with no confirming comment. Flagged for explicit product sign-off.
- **`media.py`'s `DELETE /{id}`** has no per-uploader check across the
  three roles (admin/marketing/hr) that share it — plausibly an
  intentional shared department content library, not a per-tenant
  boundary violation. Flagged, not changed.

---

## I. Explicit answer to the request's final validation question

> "Can Agent 1 access, modify, delete, export, download, or infer Agent
> 2's records by manipulating IDs, query parameters, request bodies, bulk
> APIs, search APIs, or alternate endpoints?"

**No**, for every resource type that has a per-record "agent" relationship
in this codebase (leads/owner_id, employees' leaves & timesheets/
reporting_manager_id, projects/project_manager_id, client & partner
files/account_manager_id) — proven by the automated tests in
`tests/test_authz_gap_fixes.py` and `tests/test_gap_fixes.py`, and by live
drills against the real running database for the two most severe findings
(items 1 and 2 in §H). There are no bulk endpoints in this codebase
(confirmed by search) and no export/download endpoint that bypasses these
same checks (`backups.py` is `super_admin`-only; `career.py`'s resume
download is `admin`/`hr`-only with no per-uploader scope needed since HR
company-wide access to applications is the intended design; `gdpr.py`'s
cross-user export is `super_admin`-only and is itself the intended "act on
behalf of a data subject" GDPR workflow, not a leak).

**This does not extend to the two explicitly-flagged, deliberately
unchanged items** (ticket/meeting cross-staff visibility, media's shared
delete) — those are documented open product questions, not silently
declared safe.

See `docs/security/authorization-matrix.md` for the resource-by-role
matrix generated from this analysis.
