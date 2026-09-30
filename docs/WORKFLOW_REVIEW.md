# Workflow vs. Codebase — Full End-to-End Review

**Scope:** The 27-section workflow spec (Public Website → Lead → Client → Project → Payment → Support, plus the parallel Employee and Administration flows) audited against the actual FastAPI backend (`backend/`) and React/Vite frontend (`frontend/`).

**Method:** Six domain audits (public site/CMS, lead→client→portal, projects/proposals/tracker/docs/meetings, finance/tickets, employee/HR, RBAC/admin), each tracing every spec requirement to concrete models, endpoints, tests, and frontend consumers.

**Legend:** ✅ Implemented · 🟡 Partial (exists but incomplete or mismatched) · ❌ Missing

---

## Executive Summary

The **backend is substantially complete** — nearly every workflow stage has a real model, ownership-scoped endpoints, role gates, notifications, and in several cases unit tests. The dominant theme of this review is:

> **The backend is ahead of the frontend.** A large number of fully-built backend workflows have zero frontend consumers, so the business flow described in the spec cannot actually be executed through the UI end-to-end today.

### Headline findings

| # | Finding | Severity |
|---|---------|----------|
| 1 | Project Tracker + delivery flows (§8–9): daily updates, milestones, deliverables, client approve-delivery / request-changes are **fully built on the backend but have no UI at all** | High |
| 2 | Contact form does not capture service/industry/budget/requirements that the backend accepts — leads from the live site arrive with those fields null (§1) | High |
| 3 | Proposal PM-review gate (employee → PM → client) exists on the backend but is unreachable from the UI (§7) | High |
| 4 | Invoice PDF generation/download does not exist anywhere; "invoice after payment" only flips a status flag (§10) | High |
| 5 | Ticket replies can be written but read by no one (schema omits them, no GET endpoint); ticket `category` field absent; SLA computed but invisible in UI and unmonitored (§12) | Med-High |
| 6 | Granular permission tables exist with admin CRUD but are **never enforced** — authorization is purely role-name checks (§22) | Medium |
| 7 | Credential email sends a reset link instead of temp-password-with-instructions; no cohesive welcome email per spec (§4) | Medium |
| 8 | Payslip/document downloads in the frontend link raw private-storage references instead of the secured download endpoints — links likely 404 (§19, §20, §5) | Medium |
| 9 | Notifications: backend event-driven for many events, but neither Client nor Employee portal has any notifications UI (§5, §14) | Medium |
| 10 | Employee Performance tab renders NaN% (expects `goals_set/goals_achieved` fields the API never returns); training completion has no writer endpoint (§18) | Medium |

---

## Scorecard by Workflow Section

| § | Area | Backend | Frontend |
|---|------|---------|----------|
| 1 | Public site + contact form → lead | ✅ | 🟡 (form missing spec fields) |
| 2 | Lead evaluation | ✅ | 🟡 (evaluation fields not exposed) |
| 3 | Lead → client conversion | ✅ | 🟡 (no convert call in staff UI API layer) |
| 4 | Credential email | 🟡 | n/a |
| 5 | Client portal + data isolation | ✅ | 🟡 (tracker/notifications/profile gaps) |
| 6 | PM → employee assignment | ✅ | ✅ |
| 7 | Proposal workflow | ✅ | 🟡 (PM-review stage missing) |
| 8 | Project tracker + daily updates | ✅ | ❌ (no consumers) |
| 9 | Completion & delivery approval | ✅ | ❌ (no consumers) |
| 10 | Payments & invoices | 🟡 | 🟡 |
| 11 | Document management | 🟡 | 🟡 |
| 12 | Support tickets & SLA | 🟡 | 🟡 |
| 13 | Meetings | 🟡 | 🟡 |
| 14 | Employee portal modules | ✅ | 🟡 |
| 15 | Attendance & leave | ✅ | ✅ |
| 16 | Dual project views (employee/client) | ✅ | ❌ (views absent) |
| 17 | Timesheets | ✅ | ✅ |
| 18 | Performance & training | 🟡 | 🟡 (broken contract, missing tabs) |
| 19 | Payslips | ✅ | 🟡 (broken download links) |
| 20 | Employee documents | ✅ | 🟡 (no upload wiring, broken links) |
| 21 | Admin panel modules | ✅ | 🟡 (several modules live elsewhere) |
| 22 | RBAC | 🟡 (role-only; permissions dead code) | ✅ (page guards) |
| 23 | CMS lifecycle | ✅ | ✅ |
| 24 | Services centralization | ✅ | 🟡 |
| 25 | Industries management | ✅ | ✅ (minor normalization gap) |
| 26 | Blog management | ✅ | ✅ |
| 27 | SEO management | ✅ | 🟡 (schema markup unused) |

---

# Phase-by-Phase Detailed Review

## Phase 1 — Public Website → Contact Form → Lead (§1)

### What exists
- All spec public pages: `Home.jsx`, `About.jsx`, `Services.jsx`/`ServiceDetail.jsx`, `Industries.jsx`, `Blog.jsx`/`BlogDetail.jsx`, `Portfolio.jsx`, `Careers.jsx`, `Faq.jsx`, plus case studies, events, legal pages. Most pull live CMS data.
- `ContactSubmission` model (`models/contact_submission.py`) has **every spec field**: `name, email, phone, company, department, subject, message, status` **plus** `service_id` (FK services), `industry_id` (FK industries), `expected_budget` (Numeric), `requirements` (Text), `lead_id`.
- `POST /contact` (`routers/contact.py`, rate-limited 5/min) validates via Pydantic, sends email, then **automatically creates a Lead** (`source=website`) carrying over `service_id`/`industry_id`, mapping `expected_budget → estimated_value`, `requirements → notes`, back-linking `submission.lead_id`. Auto-creation failure never fails the submission (correct narrow-catch pattern).
- Published services are publicly listable (`utils/router_factory.py:60-61` forces `is_published=true` for anonymous callers), so the form *can* be populated from CMS-managed services.

### Gaps
1. ❌ **Frontend contact form doesn't implement the spec form.** `frontend/src/components/contact/ContactForm.jsx` captures only name/email/phone/company/department/subject/message. No service selector, industry selector, budget input, or requirements textarea — even though the backend accepts all four. Every auto-generated lead currently has null service/industry/budget/requirements. **This is the single highest-value frontend fix in the whole flow.**
2. 🟡 Services list page content largely hardcoded (hero/process sections); detail pages fully CMS-driven. Hardcoded fallback data in `ServicesGrid.jsx` masks API failure.
3. 🟡 Redundant "ready for lead conversion" notification fires even though conversion now happens automatically.

**Verdict:** Backend ✅ complete. Frontend 🟡 — the form must be upgraded to match its own API.

---

## Phase 2 — Lead Evaluation (§2)

### What exists
- `LeadStatus` enum covers the full pipeline: `new → contacted → requirement_gathering → proposal_sent → proposal_approved → converted | disqualified` ("reject/close" = `disqualified`).
- `Lead` model has dedicated evaluation-workflow fields (`models/lead.py:32-37`): `evaluation_date`, `meeting_notes`, `requirements_confirmed`, `delivery_timeline`, `evaluation_result`, `rejection_reason`. All updatable via `LeadUpdate`.
- Router roles: read = sales/marketing/admin/PM; create = sales/marketing/admin; update = sales/admin; delete = admin. Sales users are auto-scoped to their own leads on GET/PATCH (IDOR-safe).
- Frontend: `SalesCrmViews.jsx` implements the status pipeline including disqualification, call-note logging, assignment notifications.

### Gaps
1. ❌ **None of the six evaluation fields appear anywhere in the frontend** (repo-wide grep: zero matches outside the backend). Sales staff cannot record meetings, confirm requirements, set timeline, or capture rejection reasons through the app — the evaluation stage of the spec is effectively manual/off-system.
2. ❌ `Meeting` model has `project_id`/`client_id` but **no `lead_id`** — scheduling an evaluation meeting against a lead isn't modeled; only free-text fields exist on the Lead.

---

## Phase 3 — Lead → Client Conversion (§3)

### What exists
- Explicit endpoint `POST /leads/{id}/convert` (`routers/leads.py:94-134`), gated to `require_roles("admin", "project_manager")` — exactly the spec's authorized roles.
- Idempotent: re-converting returns the existing client; disqualified leads are rejected; provisioning failures return 400 with logged cause. Sets `status=converted` + `converted_client_id`.
- Provisioning service (`services/client_provisioning.py`):
  - Find-or-create `User` by lead email, `role="client"`, active, verified.
  - Find-or-create `Client` profile (1:1 via unique `user_id` FK), `account_manager_id` resolved from the lead owner's Employee record.
- Downstream automation wired: accepting a proposal as client auto-provisions a project (`services/project_provisioning.py`); project creation pins `client_id`.
- Second conversion path exists via contract signing (`contracts.py:69-100`).

### Gaps
1. 🟡 **No frontend consumer found** for `POST /leads/{id}/convert` — no `convertLead` export in any `api/*` file. Conversion appears reachable only via the marketing contact-submission modal or raw API calls. Verify the sales UI surfaces this button.
2. 🟡 Spec says credentials include "Username/Email + Temporary Password"; see Phase 4 — the system deliberately uses a reset-link design instead (more secure, but deviates).

---

## Phase 4 — Client Credential Email (§4)

### What exists
On first provisioning, two best-effort emails fire (`client_provisioning.py:59-80`):
1. Password-reset email → link `{settings.client_url}/reset-password?token=...` (hashed token in DB, 1-hour expiry).
2. Short welcome email ("Your account has been created successfully").

### Gaps vs spec
The spec asks for **one email containing**: thank-you message, confirmation, portal login URL, username, password, instructions. Actual behavior:
1. 🟡 **No temporary password is ever generated** — account gets an unusable random hash; user sets their own password via the reset link. This is *better security* (passwords never transit email) but a deliberate spec deviation worth ratifying explicitly.
2. 🟡 The reset email reads like a user-initiated reset ("Password Reset Request") — no thank-you framing, no explicit portal URL, no "log in with your email X" instructions. The welcome email is two sentences with no URL.
3. 🟡 Two disjoint emails with inconsistent framing rather than one cohesive credentials email.
4. ❌ No admin "resend invite/reset" convenience endpoint for clients — if the 1-hour token expires unused, there's no wrapper to re-trigger (only generic forgot-password).

---

## Phase 5 — Client Portal (§5)

### Data isolation — ✅ excellent
- Central `_get_client_for_user()` guard (`clients.py:58-74`) rejects non-client roles with 403.
- Every `/clients/me/*` query filters by the caller's own `client.id`; ownership checks use the repo's IDOR-safe 404 pattern; file download checks owner OR assigned PM OR admin (`clients.py:451-464`). Staff-side uploads/reports additionally require being the client's assigned account manager. Staff routers (`finance`, `ticket`, `meetings`) are role-gated away from clients entirely. Negative-IDOR tests exist (`tests/test_idor_negative_security.py`).
- Nothing material was found missing here — this is the strongest area of the codebase.

### Portal module inventory (frontend `ClientPortal.jsx`)

| Spec module | Status |
|---|---|
| Dashboard | ✅ Overview (active projects, open invoices/tickets, spend) |
| Projects | 🟡 table only — **no project detail view** |
| Proposals | ✅ accept/reject with reason flow |
| Your Work / Progress / Tracker | ❌ **UI absent** (backend complete — see Phases 8–9) |
| Documents | 🟡 list only; no upload/download wiring; links likely broken (raw storage refs) |
| Meetings | ✅ read-only list with join/recording links |
| Invoices | ✅ list |
| Payments | ✅ list (invoice numbers joined server-side) |
| Support/Tickets | 🟡 create + list; priority hardcoded `'medium'`; no detail/replies/close |
| Reports | ✅ bonus (same broken-download issue) |
| Notifications | ❌ backend serves `/notifications` to clients; **no bell/tab/UI** |
| Profile | 🟡 read-only display inside Overview; **no update endpoint exists at all** (contrast: partners have a profile PUT) |

---

## Phase 6 — PM → Employee Assignment (§6)

### What exists — ✅ complete
- `Project.project_manager_id` (FK users), `Project.client_id`; employee assignment is a proper M2M (`project_members` association, `models/associations.py`).
- `PATCH /projects/{id}/team` (`projects.py:207`), role-gated admin/PM, accepts multiple employees (by `Employee.id` or `user_id`); PMs restricted to projects they run via `_require_own_project_or_admin`.
- `GET /projects?employee_id=` filters by team membership/PM-ship.
- Frontend match: `assignProjectTeam` (`api/admin.js:50`) + chip-picker in `ProjectManagerViews.jsx`.

### Gaps
1. 🟡 Team assignment is full-replace semantics — no incremental add/remove.
2. 🟡 No notification when an employee is assigned/unassigned to a project.
3. 🟡 Controlled client↔team communication is implicit (via PM/account-manager gating on files/meetings) rather than an explicit messaging channel — acceptable per spec wording.

---

## Phase 7 — Proposal Workflow (§7)

### What exists — ✅ backend complete
- `Proposal` model (`models/proposal.py`): `version` (auto max+1 per lead), `status`, `sent_at`, `viewed_at`, `created_by`, `client_comment`, `rejection_reason`, `review_notes`, `reviewed_by`. History is version-per-row keyed off `lead_id` — covers every spec history field except an explicit superseded marker.
- Status enum: `draft → submitted_for_review → pm_approved | pm_rejected → sent → viewed → accepted | rejected` — exactly the employee → PM → client gate.
- Staff endpoints (`proposals.py`, gated sales/admin/pm/marketing): submit-for-review (+ notify admin/PM), PM review approve/reject with notes, send (notifies finance/admin above $50k threshold), staff accept/reject mirrors.
- Client endpoints (`clients.py`): scoped list, accept (updates lead, notifies, **auto-provisions project**), reject (captures reason, notifies admin/PM with it).
- ClientPortal consumes accept/reject correctly.

### Gaps
1. ❌ **The PM-review stage is unreachable from the UI.** `api/crm.js` exposes only fetch/create/send/accept/reject — no functions for `submit-for-review` or `/review`; grep finds no reference across the entire frontend. Employees can't submit drafts for review and PMs can't approve/reject them in-app.
2. 🟡 `viewed_at` never written by any endpoint (dead state).
3. 🟡 Staff-side reject takes no reason payload (client-side reject does).
4. 🟡 Prior versions never marked `superseded` automatically.

---

## Phase 8 — Project Tracker & Daily Updates (§8)

### What exists — ✅ backend complete

| Spec item | Backing |
|---|---|
| Name/client | `Project.title`, `Project.client_id` |
| Assigned PM | `project_manager_id` (+ resolved name in `ClientProjectOut`) |
| Assigned employees | `Project.team` M2M |
| Start/end dates | `start_date`, `end_date` (duration derivable, not stored) |
| Status | `ProjectStatus` enum |
| Overall completion % | `progress_percent` (manual) |
| Daily updates | `ProjectUpdate` model incl. `hours_logged` |
| Tasks | `Task` model |
| Milestones | `ProjectMilestone` (incl. `client_visible` flag, ordering) |
| Deliverables | `ProjectDeliverable` (file, milestone link, status, submitted/approved timestamps, client comment) |

**Daily-update flow implemented with the spec's approval gate:**
- Employee posts: `POST /projects/{id}/updates` (restricted to team members; PM/admin on-behalf).
- PM sees all internal updates: `GET /projects/{id}/updates`.
- PM approves for client visibility: `PATCH .../updates/{id}/visibility`.
- Client sees only approved subset: `GET /clients/me/projects/{id}/updates`, filtered on `client_visible=True`, stripped of internal IDs (`ClientProjectUpdateOut`).

### Gaps
1. ❌ **Zero frontend consumers.** No file in `frontend/src` references `/updates`, `/milestones`, `/deliverables`, or `client_visible`. Employees/PMs cannot post updates, toggle visibility, or manage milestones/deliverables; clients cannot see approved progress. The spec's core execution loop works only via raw API.
2. 🟡 `progress_percent` manual-only — no rollup from milestones/tasks.
3. 🟡 Duration not stored/derived automatically.

---

## Phase 9 — Completion & Delivery Approval (§9)

### What exists — ✅ backend complete
- Delivery-review fields on `Project`: `completion_submitted_at`, `client_review_status`, `client_approved_at`, `client_feedback`, `final_delivery_version`.
- Full flow: `POST /projects/{id}/submit-for-client-review` (requires completed; notifies client) → deliverable submit → per-deliverable client review with comments → final sign-off `approve-delivery` (bumps version, notifies admin/PM) or alternate branch `request-changes` (stores feedback, notifies).

### Gaps
1. ❌ None of these endpoints appear anywhere in the frontend. The client cannot perform final sign-off from the portal; the notification deep-link target (`/client?tab=projects`) has no corresponding UI action.

---

## Phase 10 — Payments & Invoices (§10)

### What exists
- `Invoice` model: auto-numbered (`INV-{ts}`, unique), client/project FKs, amount/tax/computed total, currency, issue/due dates, status enum (`draft/sent/paid/overdue/cancelled`), notes.
- `Payment` model: invoice FK (CASCADE), amount, method enum, `transaction_ref`, `paid_at`, status enum — with a **DB-level partial unique index** `(invoice_id, transaction_ref)` making payment recording genuinely idempotent (tested in `tests/test_payment_idempotency.py`: replay returns existing payment with 200/no-insert, invoice auto-flips to `paid`).
- Endpoints (`finance.py`, router-gated admin/finance): invoice CRUD + filtered/searchable history, record-payment (idempotent), manual overdue sweep.
- Client scoping: `GET /clients/me/invoices` and `/payments` (payments enriched with invoice numbers) — ownership-scoped, IDOR-tested.
- Frontend: finance-role Invoices view (create, due dates, record payment) in Employee Portal; client Invoices/Payments tabs in Client Portal.

### Gaps
1. ❌ **No invoice document exists at all.** No PDF library anywhere (`reportlab`/`weasyprint`/etc.), no download endpoint, no print action. An "invoice" is only a database row. Spec's "invoice generation/download… available inside the Client Portal" is unimplemented.
2. 🟡 **"Invoice generated after payment" is inverted** — payment merely marks an existing invoice `paid`; nothing generates anything.
3. 🟡 Overdue status requires a **manual** sweep endpoint — no scheduler exists (documented known gap).
4. 🟡 No payment-received/invoice-created notification or email to the client.
5. 🟡 Payments are staff-recorded only (no gateway) — documented and UAT-passed as intentional.

---

## Phase 11 — Document Management (§11)

### What exists
- `ClientFile` model: name, category, size, uploaded_by; upload validation via `utils/uploads.py` (MIME + magic bytes + extension allowlist + size limits, SVG excluded).
- Endpoints: client self-upload (`POST /clients/me/files`), company→client upload restricted to the **assigned account manager** (admin bypass), secure download with owner/PM/admin check and 404-on-mismatch.
- Employee documents separate: `EmployeeDocument` (typed enum: resume/id_proof/contract/certificate/other), self-upload, HR upload, secured download.

### Gaps vs spec field list (name/type/uploaded by/date/version/status/access permissions/download)
1. ❌ **No versioning** on documents.
2. ❌ No document status field.
3. ❌ No typed access-permission metadata (access control is implicit via uploader direction + role gates).
4. 🟡 `uploaded_by` is a plain string name, not a user FK — breaks auditability.
5. 🟡 Client Files tab is list-only: no upload button, and download uses `<a href={row.file_url}>` where `file_url` is a **private storage reference** (e.g., `client-files/<uuid>.pdf`) — the working endpoint `GET /clients/files/{id}/download` is never called. Links are broken in practice.

---

## Phase 12 — Support Tickets & SLA (§12)

### What exists
- `Ticket` model covers most spec fields: unique `ticket_number` (`TCK-{ts}`), subject, description, priority enum (`low/medium/high/critical` — exact spec tiers), created date, `assigned_to`, status enum (`open/in_progress/resolved/closed`), resolution, `resolved_at`/`closed_at` (auto-stamped server-side, anti-backdating), plus `sla_due_at`.
- **SLA logic exists** (`utils/sla.py`, unit-tested in `tests/test_sla.py`): business-hours calculator (Mon–Fri 09:00–17:00, weekend rollover handled). Targets: Critical = 4h, **High = 8 business hours ≈ spec's "1 business day"**, Medium = 24h, Low = 40h. Stamped at creation in both client and partner ticket paths.
- Lifecycle: staff queue (`ticket.py`, gated admin/support) with filters, PATCH for assign/resolve/close, replies; client create/list scoped to own tickets.

### Gaps
1. ❌ **No `category` field** anywhere on Ticket/TicketCreate/TicketOut — explicit spec field, absent.
2. 🟡 Only one deadline (`sla_due_at`, resolution-oriented) — no separate response-SLA or first-response timestamp.
3. 🟡 **SLA is inert beyond storage**: no breach monitoring, escalation, alerting, or breach filter; frozen at creation even if priority later changes (deliberate, commented — but note vs spec).
4. ❌ **Replies are write-only for everyone.** `GET /tickets/{id}` eager-loads replies but `TicketOut` never serializes them and no GET-replies endpoint exists. Nobody — support, admin, or client — can ever read a reply. Clients also have no reply or close path, and no ticket detail view.
5. 🟡 Client create form hardcodes `priority='medium'` despite the API accepting the field.
6. 🟡 `sla_due_at` rendered nowhere in the UI — agents can't see deadlines.
7. 🟡 No notification to the support team when a ticket is raised.

---

## Phase 13 — Meetings (§13)

### What exists
- `Meeting` model: title, agenda, tz-aware `scheduled_at`, duration, meeting_link, organizer, status enum (scheduled/completed/cancelled), notes, `recording_url`, optional project/client links.
- On create with a client: **in-app notification + email both fire** (`_notify_client_of_meeting`), best-effort with logged warnings — exactly the spec's dual-notification requirement.
- Staff scheduling gated admin/sales/PM; client reads own meetings (`GET /clients/me/meetings`, N+1 fixed). Cancel is soft-cancel.
- Frontend: staff CRUD in Sales CRM; client read-only list with join/recording links.

### Gaps
1. ❌ **No participants modeling** — only organizer + owning client; the client-facing endpoint fabricates `attendees=[organizer.name]`. Multi-participant meetings unsupported.
2. 🟡 Clients cannot request/propose meetings — staff-initiated only.
3. 🟡 No UI surface for notes/recording entry beyond the generic update call; no per-meeting detail view.
4. 🟡 No `lead_id` link (blocks evaluation-phase meetings — see Phase 2).

---

## Phase 14 — Employee Portal (§14)

Tab inventory (`EmployeePortal.jsx` + role-specific views in `components/employee/`):

| Spec module | Verdict |
|---|---|
| Dashboard | 🟡 KPIs computed client-side; "Hours This Week" sums **all** loaded timesheets, not the current week; no employee-scoped dashboard endpoint |
| Attendance | ✅ |
| Leave Management | ✅ |
| Projects | ✅ |
| Tasks | ✅ |
| Project Updates | ❌ missing at both ends (model orphaned — `models/project_update.py` exists but no router registers it; no tab) |
| Timesheets | ✅ |
| Performance | 🟡 (see Phase 18) |
| Training | 🟡 (see Phase 18) |
| Payslips | 🟡 broken download links |
| Documents | 🟡 no upload wiring |
| Notifications | ❌ backend fully available; **no tab/UI in employee portal** |
| Profile | 🟡 read-only card; **no self-edit endpoint** (`EmployeeUpdate` schema exists with no PUT route wired) |

---

## Phase 15 — Attendance & Leave (§15)

### Attendance — ✅ core complete
- Model: employee+date (DB-unique constraint), check_in/check_out times, status enum (present/absent/half_day/holiday/weekend), notes.
- Self-service check-in/check-out, paginated personal history, today endpoint; **HR/admin visibility confirmed** (`GET /employees/attendance` with filters, eager-loaded).

Gaps: check-in hardcodes `status="present"`; repeat check-out overwrites without idempotency guard; mixed local/UTC time handling; no HR correction/create endpoint.

### Leave — ✅ full loop implemented
Apply (forced `pending`) → review list (admin/hr/**PM team-scoped** via reporting-manager tree) → approve/reject (records `approved_by`) → **best-effort in-app notification to the employee with deep-link** (deduped against repeat clicks). Exactly the spec loop.

Gaps: no leave-balance/quota tracking; no employee cancel-withdraw (`cancelled` enum unreachable); overlapping leaves not validated; `approved_by` not exposed to the employee.

---

## Phase 16 — Dual Project Views (Employee detailed / Client approved)

Backend: ✅ **implemented exactly per spec** — same underlying project data, permission-filtered presentation. Employees get full internal updates (`GET /projects/{id}/updates`); clients get the `client_visible` subset stripped of internals (`ClientProjectUpdateOut`). Milestones carry `client_visible` flags.

Frontend: ❌ **neither view is built** (see Phase 8). This spec section is currently backend-only capability.

---

## Phase 17 — Timesheets (§17)

✅ **Fully implemented and mature** (UAT-verified):
- Model has exactly the spec fields: date, project, task, hours (`Numeric(4,2)`), description, status (draft/submitted/approved/rejected).
- Employees create entries (403 unless in `project_members`) landing directly in `submitted`; **no edit/delete of submitted entries** = the spec's "read-only finalized" rule.
- Authorized reviewers (admin/hr/pm, PM team-scoped) list and approve/reject.
- Docs coverage + fixed authorization-audit gap + tests confirm maturity.

Minor: employees cannot correct mistakes post-submission; reviewers can set any valid enum transition.

---

## Phase 18 — Performance & Training (§18)

### Performance
- Backend ✅: `PerformanceReview` (reviewer, period, rating, strengths/improvements, goals text, status, acknowledge flow), `PerformanceGoal` (target dates, progress %, employees can update own status/progress only), `PerformanceFeedback` (staff give, employee reads). History ordered by review date.
- Frontend 🟡: **the Performance tab is broken** — it expects `goals_set`/`goals_achieved` numeric counters that don't exist on `PerformanceReview`, so it divides undefined values → NaN/0% displayed. Goals and Feedback have **no frontend surface** despite full backend support.

### Training
- Backend 🟡: Course catalog (published flag, category, duration, cover image) + enrollment with race-safe DB-unique constraint (double-enroll → 409), public catalog, staff course creation (admin/hr), enrollment listing.
- Gaps: ❌ **no completion endpoint** — `completed_at` has no writer route, so nothing can ever complete; ❌ no training-material file attachments; 🟡 frontend renders a score column that can never populate.

---

## Phase 19 — Payslips (§19)

### What exists — ✅ backend
- `Payslip` model: month/year pay period (DB-unique per employee/month/year), basic, allowances, deductions, computed net_pay, uploaded document, status (generated/paid).
- Self-access only: `GET /employees/me/payslips` ownership-scoped; `GET /employees/me/payslips/{id}/download` with ownership check (404 on mismatch), served from private storage via `load_private_file`.
- Creation by admin/hr/finance with multipart upload.

### Gaps
- 🟡 **Frontend download links bypass the secured endpoint** — Payslips tab links directly to `p.file_url` as an `<a href>` (`EmployeePortal.jsx:522-527`); since files are stored privately, these direct links likely 404.
- ❌ No frontend UI for finance/admin payslip creation.

---

## Phase 20 — Employee Documents (§20)

### What exists — ✅ backend
- `EmployeeDocument` model: title, typed enum (resume/id_proof/contract/certificate/other), private-storage file.
- Employee self-upload (certificates etc.), HR/admin upload for any employee (policies/contracts), list endpoint, secured download (admin/hr/super_admin any; others own-only, 404 on mismatch).

### Gaps
- 🟡 Frontend Documents tab is view/download only; the upload POST endpoints are unused by the portal.
- 🟡 Downloads again use raw `file_url` hrefs rather than the secured download endpoint (broken in practice).

---

## Phase 21 — Admin Panel (§21)

### What exists
Tabs in `AdminPanel.jsx` (defined in `data/portal.js:90-110`): Overview/Dashboard, Users, Clients, Employees, Projects, Notifications (send + list), Reports (generate/list/delete), Audit Logs, System Settings — plus extras beyond spec: Content (CMS manager), Contact Submissions (+ convert-to-lead modal), Roles, Permissions, Media, Training, Careers, Comments moderation, Newsletter, Analytics.

`SuperAdminPanel.jsx`: Overview, Departments, Roles & Permissions, GDPR export, Audit Logs, Backups, Billing, Impersonation. Guarded via `useRoleGuard('super_admin', '/admin')`.

### Missing from the unified Admin Panel UI
Leads, Proposals, Tasks, Meetings, Documents, Payments/Invoices, Support Tickets, consolidated HR, SEO — **pattern:** most of these exist and function inside role-specific portals (Sales CRM tabs, PM views, support queue tab, HR tabs, finance tab) rather than the Admin Panel itself. Backend routers exist for all of them. Whether this matters is a UX decision: today an "admin" cannot see tickets/invoices/meetings without logging into a role portal they may not have.

### Module-quality notes
- **Reports**: metadata-only rows (title/type/period) — no actual computation or CSV/PDF export behind "generate".
- **Audit logs**: automatic capture of every successful non-GET request via `AuditMiddleware` (`main.py:77-129`) with IP/UA/metadata; admin-readable API. Gaps: failed requests not audited, mechanical action names, no before/after diffs, no retention policy.
- **System settings**: free-form key/value store with full CRUD (admin-gated). Gaps: no predefined/validated keys, and **no backend code reads Setting rows at runtime** — settings are effectively write-only today.
- **Analytics**: page-view tracking + summary (admin/marketing); no event/conversion analytics.
- **Dashboard KPIs**: `/dashboard/overview` (10 company-wide KPIs) + project status breakdown, gated admin/pm/finance/sales.

---

## Phase 22 — Role-Based Access Control (§22)

### What exists
- All 8 spec roles exist in the `UserRole` enum (`models/enums.py`): super_admin, admin, hr, sales, marketing, project_manager, developer, qa, support, finance, client, employee, guest, partner (14 total).
- Enforcement: `require_roles(*roles)` dependency (`core/dependencies.py:55-69`), ~80 enforcement points across routers, router-level and per-endpoint; `super_admin` bypasses all checks. Ownership scoping layered on top where relevant (sales→own leads, PM→own projects/team, clients/partners→own data).
- Frontend: server-authoritative session (`AuthContext` hydrating from `/auth/me`), page-level `useRoleGuard` hooks per portal, role sets documented as UX-only with the backend re-checking everything — correct architecture.

### Gaps
1. 🟡 **Granular permissions are dead code.** `Role`/`Permission`/`role_permissions` M2M tables exist with full admin CRUD at `/access-control/*`, but grep finds zero enforcement usage anywhere — access decisions are purely role-name membership. Either enforce them or remove them (they currently imply a capability the system doesn't have).
2. 🟡 Guards are page-level hooks, not structural route wrappers — a new portal page must remember to call `useRoleGuard`.
3. 🟡 No per-tab gating inside panels beyond what the backend rejects (e.g., admin-only user-minting handled ad hoc in `AddUserForm`).

---

## Phase 23 — CMS (§23)

### What exists — ✅ complete lifecycle
- Routers for page_content, blog, service, industry, faq, case_study, announcement, category — nearly all built on `build_crud_router` with create/edit/delete and `is_published` as the draft/published mechanism (publish = PUT flag; ContentManager.jsx exposes exactly that toggle).
- **Published content automatically appears publicly**: anonymous list calls force `is_published=true`; anonymous item GETs of drafts return 404 (`router_factory.py:60-76` — this closed a real leak, documented as D10). Frontend public fetches also pass the filter explicitly.
- Blog uses a status enum instead (draft/published/archived) with equivalent public filtering (`blog.py:40-41`).

### Gaps
- 🟡 Blog `PUT /blogs/{id}` does not stamp `published_at` when transitioning draft→published (only create-path does) — publication date will be null for anything first published via edit.
- 🟡 Category has no publish flag (acceptable — taxonomy, not content).

---

## Phase 24 — Services Centralization (§24)

✅ Strongest data-model section: `Service` is a full CMS entity (slug, features/benefits arrays, process/faqs JSONB, tech stack, gallery, cover_image, order, is_published), and FK references flow through the entire pipeline exactly as spec'd: `contact_submission.service_id → lead.service_id → proposal.service_id → project.service_id`. The chain "Service Created → CMS → Published → Contact Form Selection → Lead → Proposal → Project" is fully modeled end-to-end.

Gaps: 🟡 contact form doesn't render the selector (Phase 1); that's the only break in an otherwise complete chain.

---

## Phase 25 — Industries Management (§25)

✅ `Industry` model/router with publish lifecycle; public page fetches live data; FK-linked to `lead.industry_id`, `project.industry_id`, `contact_submission.industry_id`.

Gaps:
- 🟡 `Client.industry` is free-text `String(100)`, not an FK to industries — clients aren't normalized-linked (spec: industries associated "with leads, clients, and projects").
- 🟡 `Service.related_industries` is `ARRAY(String)` — soft reference, no relational integrity.

---

## Phase 26 — Blog Management (§26)

✅ Model covers the spec field list: title, unique slug, excerpt, content, cover image (featured image), category FK, author FK, tags array, status enum (draft/published/archived), view count, `published_at`, plus its own meta title/description. Author auto-set from creator; public list forced to published for non-staff; filters by category/author/status.

Gaps:
- 🟡 `published_at` not stamped on publish-via-edit (see Phase 23 gap).
- 🟡 No `featured` flag; tags not supported as a list filter.
- 🟡 Blog's stored `meta_title`/`meta_description` are never consumed by the frontend SEO hook.

---

## Phase 27 — SEO Management (§27)

### What exists
- `SeoMetadata` model: page_path (unique route key), title, meta description, keywords, og_title/og_description/og_image/og_type, canonical_url, `schema_markup` (JSONB structured data), `no_index` robots control — length-constrained schemas.
- Router: generic CRUD, public read (so the site can render tags), writes gated admin/marketing, path-filterable.
- Frontend: `useSeoMeta.js` wired globally in `Layout.jsx` per pathname — applies title/description/keywords/OG/canonical/noindex. Full admin CRUD in api layer.

### Gaps
1. ❌ **`schema_markup` is stored but never rendered** — no JSON-LD injected anywhere.
2. 🟡 SPA limitation (documented): client-rendered `<head>` only; crawlers without JS see static fallbacks — no SSR/prerendering.
3. 🟡 Path-keyed design means renaming a slug silently orphans its SEO row, and blog posts' own meta fields are unused (two competing mechanisms).

---

# Flow Traceability (End-to-End)

## Main flow: Public Website → Payment → Support

| Spec step | Backend | Frontend | Executable end-to-end today? |
|---|---|---|---|
| Browse website / CMS content | ✅ | ✅ | ✅ |
| Contact form with service/budget/requirements | ✅ | ❌ fields missing | ⚠️ lead created but with null spec fields |
| Lead generated automatically | ✅ auto on submit | ✅ | ✅ |
| Lead evaluation (meeting notes, timeline, reject reason) | ✅ | ❌ fields not surfaced | ❌ manual/off-system |
| Convert lead → client (admin/PM) | ✅ idempotent, role-gated | 🟡 no API consumer found | ⚠️ verify UI button exists |
| Credentials generated + email | ✅ reset-link design | n/a | ✅ (deviates from temp-password spec) |
| Client login → dashboard | ✅ hardened auth/sessions | ✅ | ✅ |
| Proposal: employee → PM review → client | ✅ full gate + versions | ❌ PM-review stage missing in UI | ❌ staff bypasses review gate in practice |
| Client accept/reject proposal | ✅ (+auto project) | ✅ | ✅ |
| PM assigns employees | ✅ M2M | ✅ | ✅ |
| Daily updates → PM approval → client visibility | ✅ `client_visible` gate | ❌ no consumers | ❌ |
| Milestones / deliverables / tracker | ✅ | ❌ no consumers | ❌ |
| Final delivery approval / request changes | ✅ | ❌ no consumers | ❌ |
| Documents shared both directions | ✅ scoped endpoints | 🟡 broken download links, no upload wiring | ⚠️ partially |
| Meetings + notifications + email | ✅ dual notification | ✅ (client read-only) | ✅ |
| Client approves work → payment recorded | ✅ idempotent payments | ✅ finance view + record payment | ✅ (manual gateway-free by design) |
| Invoice generated after payment | 🟡 status flip only | — | ⚠️ no document produced |
| Invoice downloadable in portal | ❌ no PDF anywhere | ❌ | ❌ |
| Ticket create → assign → resolve → close | ✅ lifecycle complete | 🟡 queue works; client side thin | ✅ (staff) / ⚠️ (client) |
| Priority-based SLA deadlines | 🟡 computed+stored | ❌ never displayed; unmonitored | ⚠️ |

## Parallel Employee flow

Attendance ✅ · Leave apply→HR/PM decision→notify ✅ · Assigned projects ✅ · **Daily project updates ❌ (no router registered, no tab)** · Timesheets ✅ · Performance 🟡 (broken tab, missing goals/feedback UI) · Training 🟡 (no completion writer) · Payslips 🟡 (broken links) · Employee documents 🟡 (no upload wiring) · Notifications ❌ (no UI) · Profile edit ❌.

## Administration flow

RBAC role gates ✅ everywhere (granular permissions dead code 🟡) · Admin dashboard ✅ · Users/Clients/Employees/Leads*/Projects/Payments*/Invoices*/Tickets*/Documents* (*live in role portals, not Admin Panel) · CMS ✅ · Services/Industries/Blogs ✅ · SEO admin CRUD ✅ · Reports 🟡 metadata-only · Audit logs ✅ (successes only) · System settings 🟡 write-only.

---

# Cross-Cutting Findings

1. **The private-storage/download mismatch is systemic.** Files are stored as private storage references (`client-files/<uuid>.pdf`), and secured download endpoints exist for clients, employees, payslips, resumes, reports — but the frontend consistently renders `<a href={file_url}>`. Every file link in Client Portal (Files, Reports), Employee Portal (Payslips, Documents) is likely broken. One shared frontend helper ("download via endpoint X") fixes all of them.
2. **Notification coverage is uneven.** Wired: meetings, leads, proposals, contracts, onboarding, leave decisions, project review submission, provisioning, contact. Not wired: ticket creation/status changes, payment recording, project team assignment. And neither the Client nor Employee portal surfaces notifications at all.
3. **"Backend-first" build pattern** is visible throughout: models + routers + tests exist for tracker/delivery/proposal-review/performance-goals/training-completion, but the corresponding UI was never built. A focused "wire the frontend" pass would close most High-severity gaps without backend work.
4. **Security posture is genuinely good**: IDOR-safe 404 patterns, DB-level uniqueness for idempotency/tokens, Argon2id, lockout, rate limits, CSRF cookies, ownership-scoped `/me/*`, negative-IDOR test suite, upload magic-byte validation. No security regressions found in this audit.
5. **Two deliberate, documented spec deviations** worth ratifying with stakeholders:
   - Reset-link credential flow instead of emailed temp passwords (more secure).
   - Staff-recorded payments instead of a payment gateway (documented, UAT-passed).

---

# Prioritized Remediation Roadmap

### P0 — Broken or blocking the core business loop
1. Upgrade `ContactForm.jsx` to send service/industry/budget/requirements (backend ready).
2. Build the Project Tracker UIs: employee update posting + PM visibility toggle (Employee Portal); approved updates/milestones/deliverables + approve-delivery/request-changes (Client Portal). All endpoints already exist.
3. Surface the proposal PM-review stage (`submit-for-review`, `review`) in Sales CRM / PM views.
4. Fix all file-download links to use secured download endpoints (Client Files/Reports, Payslips, Employee Documents); wire upload buttons.
5. Make ticket replies readable (add `replies` to `TicketOut` or a GET-replies endpoint + a client reply path).

### P1 — Spec-required but missing
6. Invoice PDF generation + download endpoint + portal/staff action (pick a lib per dependency discipline).
7. Add Ticket `category` field (+ migration, schema, form input).
8. Notifications UI for Client and Employee portals (+ unread count endpoint); wire notifications for tickets/payments/team assignment.
9. Lead evaluation panel in Sales CRM (evaluation_date, meeting_notes, requirements_confirmed, delivery_timeline, evaluation_result, rejection_reason) + `lead_id` on Meeting.
10. Cohesive client welcome/credentials email (portal URL + username framing) + admin resend-invite endpoint.
11. Client profile update endpoint + UI; employee profile self-edit endpoint.

### P2 — Quality/completeness
12. Enforce or delete the granular permission system (currently dead code implying capabilities that don't exist).
13. Fix Performance tab data contract (drop `goals_set/goals_achieved`, render reviews properly); add Goals/Feedback tabs; add training completion endpoint.
14. Render `sla_due_at` in support queue; add breach flag/filter; consider response-SLA timestamp.
15. SLA/notification for overdue invoices via scheduler; payment-received email.
16. Meeting participants table + client meeting requests.
17. Document versioning/status/access metadata; FK `uploaded_by`; `Client.industry` → FK.
18. Real report computation/export (CSV at minimum); blog `published_at` stamping on publish-via-edit; JSON-LD rendering of `schema_markup`.
19. Consolidate-or-accept the Admin Panel vs role-portal split (Leads/Tickets/Invoices/Meetings visibility for admins).
20. Leave balances/quota + overlap validation; attendance HR correction path; task module edit/delete + list scoping; incremental team assignment.

---

## Bottom Line

Roughly 80% of this workflow's *capability* already exists in the backend, built to a high standard (ownership scoping, idempotency, RBAC, validation, tests, documentation). The gap between the written workflow and the working product is concentrated in five places: **the contact form's missing fields, the unbuilt project-tracker/delivery UIs, the unreachable proposal review gate, the nonexistent invoice document, and the unreadable ticket thread.** Closing P0 above would make the entire end-to-end flow executable through the product for the first time.

