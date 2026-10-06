# CRM Workflow Audit — Issues Report

Manual end-to-end audit of the CRM pipeline:

**Contact Form → Lead → Assign to Sales → Sales pipeline → Client → Project → Manager → Employees → Completion → Client Acceptance → Invoice**

Audit performed by walking the actual routers, services, schemas, and frontend views (no code changes).

---

## Stage-by-stage verdict

| # | Workflow step | Verdict | Notes |
|---|---------------|---------|-------|
| 1 | Contact form submission | ✅ Works | Public submit → `ContactSubmission`, admin list/detail. |
| 2 | Convert contact → Lead | ⚠️ Partial | Button exists, but no duplicate guard (Issue 3) and form fields get dropped (Issue 8). |
| 3 | Assign to Sales | ❌ Missing | No assignment UI anywhere; owner filter hides unowned leads from sales (Issue 1). |
| 4 | Sales pipeline progression | ✅ Solid | One-way state machine, server-enforced (`lead_pipeline.py`). |
| 5 | Proposal draft → review → approval | ✅ Works | draft → submitted_for_review → pm_approved/sent → accepted/rejected. Minor color/UX gaps (Issue 10). |
| 6 | Convert lead → Client | ⚠️ Partial | Backend `convertLead` exists but no UI button (Issue 4); contract sign path can strand state (Issue 5). |
| 7 | Client portal provisioning | ✅ Solid | Idempotent account creation on both staff-initiated and client-sign paths. |
| 8 | Project auto-creation | ✅ Solid | Idempotent provisioning from accepted proposal (`project_provisioning.py`), works in either order. |
| 9 | Project manager + daily updates | ❌ Broken loop | No UI to post project updates; client Updates tab is always empty (Issue 2). |
| 10 | Employees / milestones / deliverables | ⚠️ Partial | Staff-side endpoints exist but have no frontend consumers (Issue 7). |
| 11 | Completion → submit for client review | ⚠️ Partial | Auto-complete at 100% tasks works, but PM cannot resubmit after `changes_requested` (Issue 6). |
| 12 | Client acceptance → Invoice | ⚠️ Partial | approve/request-changes + notifications work; invoice creation has gaps (Issue 9). |

---

## Issues

### 1. 🔴 CRITICAL — "Assign to Sales" step doesn't exist

**Where**

- `SuperAdminPanel.jsx` has no CRM tab.
- `AdminPanel.jsx` tabs (line ~2447) include Contact Submissions but no Leads/assignment view.
- `updateLead` in `frontend/src/api/crm.js:12` is never imported anywhere.
- `backend/app/routers/leads.py:39-42` — `GET /leads` filters `owner_id == current_user.id` for role `sales`.
- `backend/app/routers/leads.py:92` — sales users can only PATCH leads they own.

**Why it matters**

Admin/marketing-created leads have `owner_id = NULL`. Sales users cannot see them at all (list filter) and cannot PATCH them (ownership check). There is no UI for an admin to set `owner_id`. The "Assign to Sales" step of the documented workflow simply does not exist — leads dead-end at creation.

**How to resolve**

- Add a Leads tab (admin/superadmin) with owner assignment, **or** auto-assign on conversion/creation.
- Include unowned leads (`owner_id IS NULL`) in the sales list and allow sales to claim them.
- Add `owner_name` to `LeadOut` so the UI can show who owns a lead.

---

### 2. 🔴 HIGH — Daily project updates are a dead loop

**Where**

- `postProjectUpdate` in `frontend/src/api/projects.js:16` is never imported by any component.
- No UI exposes the `client_visible` / visibility toggle on updates.
- `ClientPortal.jsx` Updates tab renders from updates that employees never create.

**Why it matters**

The documented "daily updates → client visibility" loop has a backend but zero producers. The client-facing Updates tab is permanently empty.

**How to resolve**

- Add an employee/PM "post update" form (project detail view).
- Let the PM toggle `client_visible` when posting or afterwards.

---

### 3. 🔴 HIGH — Duplicate leads from repeated conversions

**Where**

- `AdminPanel.jsx:1673` — Convert button in the Contact Submissions view lacks the `!s.lead_id` guard that the Sales view has.
- No unique constraint on `Lead.contact_submission_id`.
- `create_lead` (`leads.py:56-70`) links to an existing submission but does not check for an existing lead.

**Why it matters**

Clicking Convert twice (or converting from both views) creates two leads for one contact, splitting pipeline history.

**How to resolve**

- Frontend: add the `!s.lead_id` guard.
- Backend: unique constraint on `contact_submission_id` + existence check in `create_lead` (return the existing lead).

---

### 4. 🟠 MEDIUM — "Convert to Client" has no UI

**Where**

- `convertLead` in `frontend/src/api/crm.js:36` is never used.
- `LeadFlowPage.jsx` offers no "Convert to Client" action for `proposal_approved` leads.

**Why it matters**

Leads reach `proposal_approved` and stop. Conversion to a client only happens indirectly via contract signing, leaving no explicit CRM step.

**How to resolve**

- Add a Convert-to-Client button on `proposal_approved` leads in `LeadFlowPage` (and/or the admin Leads view once Issue 1 lands).

---

### 5. 🟠 MEDIUM — Contract sign can mark lead `converted` with no client

**Where**

- `backend/app/routers/contracts.py` ~lines 186-197.

**Why it matters**

The sign path advances the lead to `converted` even when `provision_client_account` failed (`client is None`). Project provisioning then skips (NULL `converted_client_id`), and `converted` is terminal — the lead is unrecoverable and no project is ever created.

**How to resolve**

- Only advance to `converted` after client provisioning succeeds; otherwise leave the lead in its prior state and surface the error (retryable).

---

### 6. 🟠 MEDIUM — PM cannot resubmit after client requests changes

**Where**

- `frontend/src/components/employee/ProjectManagerViews.jsx:190` — Submit-for-Client-Review rendered only when `!p.completion_submitted_at`.
- Backend `POST /projects/{id}/submit-for-client-review` allows resubmission after `changes_requested`.

**Why it matters**

One `request-changes` from the client permanently hides the submit button in the PM view — the workflow can never complete, even though the backend supports it.

**How to resolve**

- Render the button based on status (e.g. allow when `changes_requested` or not yet submitted), not merely on `completion_submitted_at`.

---

### 7. 🟠 MEDIUM — Staff-side milestones/deliverables endpoints unused

**Where**

- Staff CRUD endpoints for milestones/deliverables exist on the backend; only the client read/review side is consumed by the frontend.

**Why it matters**

PMs manage milestones/deliverables through no UI at all (or not at all), so the client review surface has nothing to review until work happens outside the app.

**How to resolve**

- Add PM-side milestone/deliverable management (create/edit/complete) to the project detail view.

---

### 8. 🟠 MEDIUM — Contact form drops qualification fields

**Where**

- `frontend/src/api/contact.schema.js:8` submits only a subset vs. backend `ContactSubmit` (`service_id`, `industry_id`, `expected_budget`, `requirements`).
- Convert-to-lead modals (`ConvertToLeadModal` in `AdminPanel.jsx` etc.) don't copy these fields either.

**Why it matters**

Service/industry/budget/intent captured at the top of the funnel never reach the lead, proposal, or project — sales and PM start blind.

**How to resolve**

- Submit all fields from the contact form.
- Prefill the convert modal from the submission and pass them through lead → proposal → project.

---

### 9. 🟠 MEDIUM — Invoice creation gaps

**Where**

- New Invoice form: `OpsRoleViews.jsx:469` — never sends `project_id`.
- Invoice UI tab only renders for the `finance` role (`EmployeePortal.jsx:1289`); admins have no invoice view.
- `invoice_number` generated as `INV-{unix timestamp}` — collides for invoices created in the same second.
- No auto-draft invoice when the client accepts delivery.

**How to resolve**

- Include `project_id` in the create payload; add an admin invoice tab (or role-agnostic access).
- Use a counter/UUID for `invoice_number`.
- Optionally auto-create a draft invoice on client acceptance.

---

### 10. 🟡 LOW — Smaller UX/correctness gaps

- `SalesCrmViews.jsx:790` renders the raw `account_manager_id` UUID instead of a name.
- `PROPOSAL_STATUS_COLOR` (`SalesCrmViews.jsx:24`) is missing entries for `submitted_for_review`, `pm_approved`, `pm_rejected` — those statuses render with no color/badge styling.
- Sales users can press "Mark Approved" on their own proposals (self-approval; no role gate on that transition).

---

## What's solid

- **One-way, idempotent lead state machine** — `backend/app/services/lead_pipeline.py` enforces `PIPELINE_ORDER` (new → contacted → requirement_gathering → proposal_created → proposal_sent → proposal_approved → converted; `disqualified` terminal) server-side.
- **Ownership / IDOR checks** on lead read/update (`leads.py:51/92/198`).
- **Idempotent client + project provisioning** in either order — `client_provisioning.py` and `project_provisioning.py` are safe on both staff- and client-initiated paths.
- **Contract signing flow** — email + public signing link.
- **Auto-completion at 100% tasks** → project ready for review.
- **Client acceptance flow** — approve-delivery / request-changes with notifications (both the API and the ClientPortal UI exist — see note below).
- **Finance loop** — invoice → payment recording → client-visible invoices in the portal.

---

## Priority order for fixes

1. Issue 1 — Assign to Sales missing (CRITICAL, blocks the pipeline outright)
2. Issue 2 — Daily updates dead loop (HIGH, client-visible feature is empty)
3. Issue 3 — Duplicate leads (HIGH, data integrity)
4. Issue 5 — Contract sign strands lead (MEDIUM, unrecoverable state)
5. Issue 6 — PM resubmit blocked (MEDIUM, workflow cannot complete)
6. Issue 4 — Convert-to-Client UI (MEDIUM)
7. Issue 7 — Milestones/deliverables staff UI (MEDIUM)
8. Issue 8 — Contact qualification fields dropped (MEDIUM)
9. Issue 9 — Invoice gaps (MEDIUM)
10. Issue 10 — Cosmetic/UX nits (LOW)

---

## Note on existing docs

`docs/WORKFLOW_REVIEW.md` is **partly stale**: it claims the client approve-delivery UI does not exist. It does — `frontend/src/pages/ClientPortal.jsx` implements approve-delivery / request-changes (~lines 169-214). Treat other claims in that document with the same skepticism; this audit supersedes it where they conflict.
