# Authorization Matrix

Generated from the actual `require_roles(...)` declarations and
object-level scoping checks in the codebase as of this audit — not
invented. "Scope" means what subset of rows within a role's allowed
actions they can actually reach; "CRUD" without a scope note means
role-gated only (any caller with that role can act on any row of that
type — see `docs/security/authorization-audit.md` §H for which of these
are confirmed-intentional vs. flagged-open).

| Resource | `super_admin` | `admin` | `hr` | `project_manager` | `sales` | `finance` | `marketing` | `client` | `partner` | `employee`/`developer`/`qa`/`support` |
|---|---|---|---|---|---|---|---|---|---|---|
| **Users** | CRUD, incl. admin/super_admin accounts | CRUD, **except** existing admin/super_admin accounts (fixed) | CRU (no delete), **except** existing admin/super_admin accounts (fixed) | own profile only | own profile only | own profile only | own profile only | own profile only | own profile only | own profile only |
| **Employees** | CRUD | CRUD | CRUD | R (list), U **own team only** (leave/timesheet approval, fixed) | — | — | — | — | — | own `/me/*` only |
| **Leaves / Timesheets** | CRUD | CRUD | CRUD | RU **own team only** (fixed) | — | — | — | — | — | own `/me/*` only (create/read) |
| **Departments** | CRUD | R | R | R | — | — | — | — | — | R |
| **Clients** | CRUD | CRUD (org-wide, role-gated) | — | R | R (org-wide) | R (org-wide) | — | own `/me/*` only | — | — |
| **Client Files / Reports** | CRUD | CU **own assigned clients only** (fixed) | — | CU **own assigned clients only** (fixed, PM for files) | — | CU **own assigned clients only** (fixed, finance for reports) | — | R own only | — | — |
| **Partner Accounts** | CRUD | CRUD (org-wide, role-gated) | — | — | CRUD (org-wide, role-gated) | — | — | — | own `/me/*` only | — |
| **Partner Files** | CRUD | CU **own assigned partners only** (fixed) | — | — | CU **own assigned partners only** (fixed) | — | — | — | R own only | — |
| **Projects** | CRUD | CRUD (org-wide) | — | CRU **own projects only** (fixed); C org-wide | — | — | R (published) | R own (via client link) | — | — |
| **Project Team Assignment** | ✅ any project | ✅ any project | — | ✅ **own projects only** (fixed) | — | — | — | — | — | — |
| **Tasks** | CRUD | CRUD | — | CRUD | — | — | — | — | — | U status: own-assigned-or-privileged only |
| **Invoices / Payments** | CRUD | CRUD (org-wide, role-gated business function) | — | — | — | CRUD (org-wide, role-gated business function) | — | R own only | — | — |
| **Leads** | CRUD | CRU (org-wide); D admin-only | — | R (org-wide) | CRU **own leads only** (fixed) | — | CR (org-wide) | — | — | — |
| **Proposals / Contracts** | CRUD | CRUD (org-wide, no per-owner scope — shared CRM pipeline design, see audit §H) | — | CRUD (org-wide) | CRUD (org-wide) | — | CRUD (org-wide) | — | — | — |
| **Blog / CMS content** | CRUD | CRUD | — | — | — | — | CRUD | R published only | R published only | R published only |
| **Comments** | CRUD (moderate) | CRUD (moderate) | — | — | — | — | CRUD (moderate) | C (public, always `pending`) | C (public) | C (public) |
| **Careers / Applications** | CRUD | CRUD | CRUD | — | — | — | — | C (apply, public) | C (apply, public) | C (apply, public) |
| **Tickets** | CRUD (all) | CRUD (all — intentional shared queue, confirmed by code comment) | — | — | — | — | — | own `/me/*` create + read only | own `/me/*` create + read only | R/U (all, `support` role) |
| **Meetings** | CRUD (all) | CRUD (all) | — | CRUD (all — **not** scoped per-project; flagged open, see audit §H) | CRUD (all — same flag) | — | — | — | — | — |
| **Media** | CRUD (all) | CRUD (all) | CRUD (all — shared across 3 roles, flagged open) | — | — | — | CRUD (all) | — | — | — |
| **Notifications** | own + broadcast | own + broadcast (admin/hr/marketing) | own + broadcast | own | own | own | own + broadcast | own | own | own |
| **Audit Logs** | R (all) | R (all) | — | — | — | — | — | — | — | — |
| **Settings** | CRUD | CRUD | — | — | — | — | — | — | — | — |
| **Backups** | CRUD | — | — | — | — | — | — | — | — | — |
| **Roles / Permissions (data)** | CRUD (no effect on real access — see audit §G) | CRUD (same caveat) | — | — | — | — | — | — | — | — |
| **GDPR export/anonymize (any user)** | ✅ | — | — | — | — | — | — | own data only (self-export not currently exposed as an endpoint — only super_admin-initiated) | same | same |
| **`GET /stats`** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (public — no auth at all, flagged open in audit §H) |

## Reading this matrix

- **"(fixed)"** rows are the object-level scoping added during this and
  the immediately preceding audit — before that, the cell would have read
  "org-wide" (any caller with the role, any row).
- **"(flagged open)"** rows are real findings this audit surfaced but
  deliberately did not change, because the existing code shape suggests
  the current behavior may be intentional and changing it would be a
  product decision, not a bug fix — see
  `docs/security/authorization-audit.md` §H for the specific reasoning
  per row.
- **No row in this table has "Organization"/"tenant" as a scope
  dimension** because no such concept exists in this schema — see the
  audit document §F.
- `super_admin` bypasses every `require_roles(...)` check unconditionally,
  by design (`app/core/dependencies.py::require_roles`) — this is why its
  column is uniformly "CRUD" / "✅" throughout.
