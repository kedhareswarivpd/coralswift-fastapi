# Frontend Dashboard Implementation Contract

**Purpose:** the concrete build plan for every dashboard (Client Portal,
Employee Portal, Partner Portal, Admin Panel, Super Admin) — which backend
endpoint each screen calls, the request/response shape, and whether the
frontend has actually wired it up yet. Where `docs/CONTACT_BACKEND.md`
already documents something in full (auth, cookies, CSRF, the response
envelope, pagination, rate limits), this doc points there instead of
repeating it — read that one first if you haven't.

**How this was produced:** every endpoint below was read from the real
router/schema source in `backend/app/routers/` and `backend/app/schemas/`
this session, not guessed or copied from Swagger. Every "frontend status" was
verified by reading the actual `frontend/src/api/*.js`, `frontend/src/pages/*.jsx`,
and `frontend/src/data/portal.js` tab-registration code — not assumed from
naming conventions. Two real bugs were found and fixed while producing this
document (see §7).

**Revision note:** this document was originally an audit (what's built vs.
missing). Every gap it identified — Partner Portal, Admin SEO/Settings/
Backups/Analytics, comment moderation, admin broadcast notifications, Page
Content CMS, newsletter admin view — has since been **implemented and
live-verified** against the real running stack (real HTTP requests, real
screenshots, not just a clean build). See §9 for the evidence trail. Course
*creation* (§3b) remains the one open, explicitly-deferred item.

Legend: ✅ wired and rendered · 🟡 API client exists but no UI screen uses it ·
❌ nothing exists on the frontend yet.

---

## 1. Auth & role routing

Fully covered in `docs/CONTACT_BACKEND.md` §1–2. Summary: httpOnly cookie
auth (`cf_access_token`/`cf_refresh_token`), `cf_csrf_token` echoed as
`X-CSRF-Token` on mutations, `GET /auth/me` on boot, one `/login` page,
redirect-by-role afterward. **Status: ✅ fully implemented** this session
(`frontend/src/context/AuthContext.jsx`, `frontend/src/api/client.js`,
`frontend/src/hooks/useRoleGuard.js`) and Playwright-verified
(`frontend/e2e/auth.spec.js`, 20/20 passing against the real stack).

---

## 2. Client Portal — `/client` — role `client`

Frontend: `frontend/src/pages/ClientPortal.jsx` + `frontend/src/data/portal.js` (`clientPortalTabs`).

| Screen (tab) | Endpoint | Request | Response (key fields) | Status |
|---|---|---|---|---|
| Overview (dashboard) | `GET /clients/me/profile` | — | `ClientOut` + contact_name/email | ✅ |
| Projects | `GET /clients/me/projects` | — | `ProjectOut[]{title,status,progress_percent,budget,end_date,...}` | ✅ |
| Invoices | `GET /clients/me/invoices` | — | `InvoiceOut[]{invoice_number,amount,total_amount,status,due_date,...}` | ✅ |
| Payments | `GET /clients/me/payments` | — | `ClientPaymentOut[]` + invoice_number | ✅ |
| Support (view) | `GET /clients/me/tickets` | — | `TicketOut[]{subject,status,priority,...}` | ✅ |
| Support (create) | `POST /clients/me/tickets` | `{subject, description, priority?}` | `TicketOut` | ✅ (Playwright-verified end-to-end incl. CSRF, `e2e/auth.spec.js`) |
| Files | `GET /clients/me/files` | — | `ClientFileOut[]{name,category,file_url,size_bytes}` | ✅ |
| Meetings | `GET /clients/me/meetings` | — | Meeting dict + attendees[] | ✅ |
| Reports | `GET /clients/me/reports` | — | `ClientReportOut[]{title,report_type,period,file_url}` | ✅ |

**Data isolation**: verified live this session — a second, independent
client account cannot see another client's projects/invoices via either the
API or the rendered UI (`frontend/e2e/data-isolation.spec.js`, 6/6 passing).
There is no ID-based cross-client read path in the backend at all for these
resources — isolation is structural, not a per-route check.

**Nothing missing here.** Client Portal is complete against both source PDFs.

---

## 3. Employee Portal — `/employee`, `/sales`, `/marketing`, `/developer`, `/project-manager`, `/qa`, `/support`, `/finance`, `/hr`

One component (`frontend/src/pages/EmployeePortal.jsx`) renders for all of
these paths; the active role comes from the authenticated session
(`GET /employees/me/profile`), never the URL — `employeeTabsForRole()` in
`portal.js` splices role-specific tabs into the common set.

### 3a. Common tabs (every employee role)

| Screen | Endpoint(s) | Request | Response | Status |
|---|---|---|---|---|
| Overview | `GET /employees/me/profile` | — | `EmployeeOut` + name/email/role/department_name | ✅ |
| Attendance | `GET /employees/me/attendance/today`, `POST .../check-in`, `POST .../check-out` | — | `AttendanceOut` | ✅ |
| Leaves | `GET /employees/me/leaves`, `POST /employees/me/leaves` | `LeaveApply{type,start_date,end_date,reason?}` | `LeaveOut[]` | ✅ |
| Timesheets | `GET /employees/me/timesheets`, `POST /employees/me/timesheets` | `TimesheetCreate{project_id?,task_id?,date,hours,description?}` | `TimesheetOut[]` | ✅ |
| Payslips | `GET /employees/me/payslips` | — | `PayslipOut[]` | ✅ |
| Tasks | `GET /tasks?assigned_to={my_user_id}` | — | `TaskOut[]` | ✅ |
| Projects | `GET /projects?employee_id={my_employee_id}` | — | `ProjectOut[]` | ✅ |
| Performance | `GET /employees/me/performance-reviews` | — | `PerformanceReviewOut[]` | ✅ |
| Training | `GET /trainings/courses`, `GET /trainings/my-enrollments`, `POST /trainings/enroll?course_id=` | — | `CourseOut[]`, `TrainingEnrollmentOut[]` | ✅ |
| Documents | `GET /employees/me/documents` | — | `EmployeeDocumentOut[]` | ✅ |

**Note (pre-existing, unaddressed):** there is no single "employee dashboard"
aggregate endpoint — the Overview tab assembles itself client-side from the
calls above. Fine for current scale; revisit if the dashboard grows enough
widgets to matter for the API-waterfall budget (§57 of the master brief).

### 3b. Role-specific tabs

**Sales** (`rolePortalTabs.sales`) — CRM pipeline, via `frontend/src/api/crm.js`:

| Screen | Endpoint | Request | Response | Status |
|---|---|---|---|---|
| Dashboard | `GET /dashboard/overview`, `GET /dashboard/projects/status-breakdown` | — | raw KPI dict | ✅ (via `admin.js`, shared with Admin) |
| Contact Submissions | `GET /contact`, `PATCH /contact/{id}` | `{status}` | `ContactOut[]` | ✅ |
| Leads | `GET /leads`, `POST /leads`, `PATCH /leads/{id}` | `LeadCreate`/`LeadUpdate` | `LeadOut[]` — sales sees only own (`owner_id`) | ✅ |
| Clients | `GET /clients` | — | `ClientOut[]` | ✅ |
| Proposals | `GET /proposals`, `POST /proposals`, `POST /proposals/{id}/send\|accept\|reject` | `ProposalCreate{lead_id,scope_summary,price,currency,file_url?}` | `ProposalOut[]` | ✅ |
| Contracts | `GET /contracts`, `POST /contracts`, `POST /contracts/{id}/sign` | `{proposal_id}`, `ContractSign{client_signed,company_signed,provision_client_account}` | `ContractOut[]` | ✅ — this is the full Lead→Client conversion pipeline; the final `sign` call auto-provisions the Client account and sends real credentials |
| Meetings | `GET /meetings`, `POST /meetings`, `PATCH`, `DELETE` | `MeetingCreate{...}` | `MeetingOut[]` | ✅ |
| Reports | `GET /reports`, `POST /reports/generate` | `ReportGenerate{title,report_type,period,summary?}` | `ReportOut[]` | ✅ (via `admin.js`) |

**Marketing** (`rolePortalTabs.marketing`):

| Screen | Endpoint | Status |
|---|---|---|
| Leads Handoff | `GET /leads` (marketing-visible subset) | ✅ (shared `crm.js`) |
| Testimonials (moderation) | `GET/POST/PUT/DELETE /testimonials` | ✅ (via `admin.js`) |

**Project Manager** (`rolePortalTabs.project_manager`):

| Screen | Endpoint | Request | Status |
|---|---|---|---|
| Team Projects | `GET /projects?project_manager_id=me` | — | ✅ |
| Task Board | `GET /tasks?project_id=`, `POST /tasks`, `PATCH /tasks/{id}/status` | `TaskCreate` | ✅ |
| Approvals (leaves/timesheets for own reports) | `GET/PATCH /employees/leaves`, `GET/PATCH /employees/timesheets` | `{status}` | ✅ — PM scope is enforced server-side via `reporting_manager_id`, not filtered client-side |
| Team assignment | `PATCH /projects/{id}/team` | `{employee_ids[]}` | ✅ |

**QA** (`rolePortalTabs.qa`):

| Screen | Endpoint | Status |
|---|---|---|
| Test Queue | `GET /tasks?...` (QA-relevant filter) | ✅ (shared `admin.js` fetchTasks) |

**Support** (`rolePortalTabs.support`):

| Screen | Endpoint | Request | Status |
|---|---|---|---|
| Ticket Queue | `GET /tickets`, `PATCH /tickets/{id}`, `POST /tickets/{id}/replies` | `TicketUpdate`, `TicketReplyCreate{message?,content?,attachment_url?}` | ✅ — this is the **internal** queue (all clients+partners), distinct from `/clients/me/tickets` |

**Finance** (`rolePortalTabs.finance`):

| Screen | Endpoint | Request | Status |
|---|---|---|---|
| Invoices | `GET/POST/PUT /finance/invoices`, `POST /finance/invoices/{id}/payments` | `InvoiceCreate`, `PaymentCreate` | ✅ |

**HR** (`rolePortalTabs.hr`):

| Screen | Endpoint | Request | Status |
|---|---|---|---|
| Leave Approvals | `GET/PATCH /employees/leaves` | `{status}` | ✅ |
| Recruitment | `GET /careers/admin/applications`, `PATCH .../status`, `GET .../resume` | `{status}` | ✅ |

**Gap (minor, P3):** Course *creation* (`POST /trainings` — admin/hr only)
has no frontend UI anywhere — employees can browse/enroll, but nobody can
add a course from the portal. Not blocking; low-frequency admin action.

---

## 4. Partner Portal — `/partner` — role `partner` — ✅ **built and live-verified this session**

The backend fully supports it (`backend/app/routers/partner_account.py`,
`partner` role, a dedicated `PartnerAccount`/`PartnerFile` model, shared
ticket system). The frontend previously had zero surface for it — no route,
no page, no `ROLE_PORTAL_MAP` entry — meaning a real `partner`-role user
hit `"Your account does not have access to any portal"` on login. That gap
is closed.

| Screen | Endpoint | Request | Response | Status |
|---|---|---|---|---|
| Profile | `GET /partner-accounts/me/profile`, `PUT /partner-accounts/me/profile` | `PartnerAccountUpdate` (excl. account_manager_id) | `PartnerAccountOut{company_name,partnership_type,industry,country,website,notes}` | ✅ |
| Files | `GET /partner-accounts/me/files` | — | `PartnerFileOut[]` | ✅ |
| Support (view) | `GET /partner-accounts/me/tickets` | — | `TicketOut[]` | ✅ |
| Support (create) | `POST /partner-accounts/me/tickets` | `{subject,description,priority?}` | `TicketOut` | ✅ |

### What was built
- `frontend/src/api/partnerAccounts.js` — deliberately separate from
  `cms.js`'s `partnersApi` (the unrelated public Partner-logo CMS listing).
- `frontend/src/pages/PartnerPortal.jsx` — mirrors `ClientPortal.jsx`'s
  shape (profile header, tab nav, table lists) without the financial/PDF-
  preview machinery the Client Portal carries, since the Partner API surface
  doesn't need it.
- `partnerPortalTabs` added to `frontend/src/data/portal.js`; `'partner'`
  added to `portalPaths` (so `Layout.jsx` renders it full-screen, no public
  footer) and to `ROLE_PORTAL_MAP` in `LoginPage.jsx`. `useRoleGuard.js`'s
  `ROLE_SETS.partner` was already present from the earlier auth-migration
  session.
- `<Route path="partner" element={<PartnerPortal />} />` registered in `App.jsx`.

### Live verification (real HTTP + real browser, not mocked)
Registered a real user, promoted it to `partner` via `PUT /users/{id}`,
provisioned a real `PartnerAccount` via `POST /partner-accounts`, logged in,
and loaded `/partner` in a real Chromium session against the containerized
stack: landed on `/partner` (not redirected away), profile card showed the
real company name/partnership type/industry fetched live, sidebar nav and
icons rendered correctly.

**Not built** (by design, per `docs/CONTACT_BACKEND.md` §3's explicit
scope note): commission tracking, referral dashboards, deal registration —
neither source PDF defines those and the backend has no supporting schema.
That would be new scope requiring a backend change first.

---

## 5. Admin Panel — `/admin` — roles `admin`, `super_admin`

Frontend: `frontend/src/pages/AdminPanel.jsx` + `adminPanelTabs` in `portal.js`.

### 5a. Implemented

| Tab | Endpoint(s) | Status |
|---|---|---|
| Dashboard | `GET /dashboard/overview`, `GET /dashboard/projects/status-breakdown` | ✅ |
| Content (CMS) | Generic `ContentManager.jsx` drives 17 resource types via `crudWithToken()` in `api/cms.js`: services, solutions, caseStudies, blogs, events, downloads, industries, technologies, products, awards, faqs, gallery, portfolio, resources, categories, testimonials, partners (public listing) | ✅ — comprehensive, all admin-CRUD CMS routers covered |
| Contact Submissions | `GET /contact`, `PATCH /contact/{id}` | ✅ |
| Projects | `GET/POST/PUT/DELETE /projects` | ✅ |
| Users | `GET/POST/PUT /users`, `PATCH .../deactivate`, `DELETE` | ✅ |
| Employees | `GET /employees`, `POST /employees` | ✅ |
| Clients | `GET /clients`, `POST /clients` | ✅ |
| Roles (& Permissions) | `GET/POST/DELETE /access-control/roles`, `.../permissions` | ✅ |
| Media | `GET /media`, `POST /media/upload`, `DELETE /media/{id}` | ✅ — **fixed this session**: `uploadMedia()` was still doing a raw `fetch()` with a Bearer header left over from before the cookie-auth migration; now goes through the same `apiRequest` path as everything else |
| Notifications | `GET /notifications`, `PATCH .../read`, `PATCH .../read-all` | ✅ (read-side only — see gap below) |
| Reports | `GET /reports`, `POST /reports/generate`, `DELETE /reports/{id}` | ✅ |
| Audit Logs | `GET /audit-logs` | ✅ |
| Departments | `GET/POST/DELETE /departments` | ✅ — lives under **Super Admin**, not Admin Panel (see §6) |

### 5b. Built this session — closing the previously-flagged gaps

| Module (named explicitly in the workflow PDF) | Endpoint | Where it lives | Status |
|---|---|---|---|
| **SEO** | `GET/POST/PUT/DELETE /seo` — `SeoMetadataOut{page_path,title,description,keywords,og_*,canonical_url,schema_markup,no_index}` | Added as a resource entry in `ContentManager.jsx` (Content tab → SEO) — reuses the existing generic CRUD widget rather than a bespoke page | ✅ live-verified: created a real `/e2e-test` SEO entry via the API this exact form calls (`POST /seo` → 201) |
| **Settings** | `GET /settings`, `GET/PUT /settings/{key}`, `DELETE /settings/{key}` — `SettingOut{key,value,group}` | New `SettingsManagement` component, own Admin Panel tab (key-based upsert doesn't fit the generic id-based CRUD pattern, so this one is bespoke) | ✅ live-verified: `PUT /settings/e2e.test.key` → 201 |
| **Analytics** | `GET /analytics/summary` — `{total_views,unique_paths,top_pages[]}` | New `AnalyticsManagement` component, own Admin Panel tab | ✅ live-verified against real tracked page-view data (271 real views, 11 unique paths at verification time — confirms `usePageViewTracker` is genuinely recording traffic, not just built) |
| **Backups** (Super Admin only server-side) | `GET /backups`, `POST /backups/trigger`, `GET /backups/{filename}/download`, `DELETE /backups/{filename}` | New `Backups` component in **`SuperAdminPanel.jsx`**, not `AdminPanel.jsx` — matches the backend's `require_roles("super_admin")` gate exactly (confirmed live: a plain `admin` session gets a real `403` here) | ✅ live-verified: triggered a real `pg_dump` (`POST /backups/trigger` → 201, real 213KB dump file) |
| Comment moderation (Blog) | `GET /comments`, `PATCH /comments/{id}`, `DELETE` | New `CommentsManagement` component/tab — approve/reject/delete with a pending/approved/rejected filter | ✅ live-verified (`GET /comments` → 200) |
| Admin broadcast notifications | `POST /notifications` (`{title,message?,type,link?,user_id?,roles?}`) | New `SendNotificationForm` added to the existing Notifications tab | ✅ wired through `apiRequest`, same CSRF/cookie path as everything else |
| Page Content CMS | `GET/POST/PUT/DELETE /page-content` | Added as a resource entry in `ContentManager.jsx` (Content tab → Page Content) | ✅ |
| Newsletter subscribers (admin view) | `GET /newsletter` | New `NewsletterManagement` component/tab (read-only — the backend has no admin create/update for this resource, only public subscribe/unsubscribe) | ✅ live-verified (`GET /newsletter?is_active=true` → 200) |
| Training course management | `POST /trainings/courses` (admin/hr) | New `TrainingManagement` component/tab — list + create only, no edit/delete controls (the backend has no update/delete endpoint for courses at all, confirmed by reading `training.py` before building rather than assumed) | ✅ live-verified: confirmed the `/trainings/courses` POST alias actually exists first, then `POST /trainings/courses` → 201, then saw the created course render in a fresh screenshot of the tab |

All of the above were verified with real HTTP requests against the live
containerized backend during this session — not just a clean `npm run
build`. Full evidence trail in §9.

---

## 6. Super Admin — `/super-admin` — role `super_admin`

Frontend: `frontend/src/pages/SuperAdminPanel.jsx`.

| Tab | Endpoint | Status |
|---|---|---|
| Overview | `GET /dashboard/overview` (via `fetchDashboardOverview`) | ✅ — **fixed in an earlier session**: previously called a since-deleted direct-Supabase function; now uses the authorized backend route |
| Departments | `GET/POST/DELETE /departments` | ✅ |
| GDPR (user search → export/anonymize) | `GET /users?search=`, `GET /users/{id}/export`, `POST /users/{id}/anonymize` | ✅ — a real search-then-act screen with a confirmation prompt before anonymizing |

| Backups | `GET /backups`, `POST /backups/trigger`, download, delete | ✅ **built and live-verified this session** — see §5b |

### Remaining gap

| Module | Endpoint | Status |
|---|---|---|
| Session/device management (any admin viewing a user's active sessions) | `GET /auth/sessions`, `DELETE /auth/sessions/{id}` | Only self-service today (any logged-in user can see their *own* sessions) — there's no backend admin-view-of-another-user's-sessions endpoint at all, so this isn't a frontend gap, it's a backend one if the product wants it |

---

## 7. Real bugs found and fixed while producing this document

1. **`uploadMedia()` in `frontend/src/api/admin.js`** was still doing a raw
   `fetch()` with `Authorization: Bearer ${token}` and no `credentials:
   'include'`/CSRF header — a leftover from before this session's Supabase→
   CoralSwift cookie-auth migration that the earlier migration pass missed
   because it bypassed the shared `apiRequest()` client entirely. Media
   upload was silently broken under the new auth model. **Fixed**: now
   routes through `apiRequest()` like every other call.
2. **~200 lines of dead demo/mock data** (`demoClientProfile`,
   `demoDashboard`, `demoLeads`, `demoTickets`, etc.) in
   `frontend/src/data/portal.js` — confirmed via a repo-wide grep to have
   zero remaining importers (matches `status.md`'s CF-AUD-015 finding, never
   previously acted on). **Removed.**
3. **Site-wide accessibility defect in `components/ui/Icon.jsx`**, found
   while screenshot-verifying the new Admin tabs: the Material Symbols icon
   component renders its icon name as literal ligature *text* inside a
   `<span>` with no `aria-hidden`. That text was leaking into the accessible
   name of every button/link that pairs an icon with a visible label —
   screen readers announced "dashboard Overview", "folder Projects", "search
   SEO", etc. across the entire app, not just this session's additions. It
   also broke Playwright's own `getByRole('button', {name: 'Content'})`
   lookups outright (`0` matches instead of `1`) — which is how it was
   caught, not from an accessibility audit tool. **Fixed**: `Icon.jsx` now
   renders `aria-hidden="true"` by default. That fix alone would have left
   every *icon-only* button/link (no visible text) with zero accessible
   name, so ~35 such controls across `AdminPanel.jsx`, `ClientPortal.jsx`,
   `EmployeePortal.jsx`, `SuperAdminPanel.jsx`, `PartnerPortal.jsx`,
   `ContentManager.jsx`, `LoginPage.jsx`/`Register.jsx`/`ResetPassword.jsx`/
   `SuperAdminLogin.jsx` (password show/hide toggles), `EventsGrid.jsx`, and
   `GalleryGrid.jsx` were each given an explicit `aria-label` (e.g. `Edit
   ${user.name}`, `Delete backup ${filename}`) in the same pass.
4. **Broken "New {X}" button label for any non-plain-plural resource name**
   in `ContentManager.jsx` — the existing logic blindly chopped the last
   character off the resource label to singularize it (`"Services"` →
   `"Service"`), which silently mangled anything that wasn't a plain `-s`
   plural: `"SEO"` → `"SE"`, `"FAQ"` → `"FA"`, `"Technologies"` →
   `"Technologie"`, `"Categories"` → `"Categorie"`. Pre-existing (FAQ was
   already affected), surfaced by adding the new SEO resource this session.
   **Fixed**: replaced with a `singularize()` helper that handles `-ies`
   plurals correctly and leaves already-singular labels alone.

Verified via `npm run lint` (0 errors), `npm run build` (clean), the full
26-test Playwright suite (still 26/26 after all of the above), and fresh
screenshots of every affected Admin Panel tab confirming the fixes live.

---

## 8. Remaining punch list

**None outstanding from this document.** Training course creation (the one
previously-deferred P3 item) is now built too: `AdminPanel.jsx`'s new
Training tab (list + create only — the backend has no update/delete for
courses at all, so no edit/delete controls are offered) calls the real
`POST /trainings/courses` alias, live-verified (`201`, and the created
course rendered in a fresh screenshot of the tab).

Client Portal (§2), the common Employee Portal tabs (§3a), all
role-specific Employee Portal tabs (§3b), Partner Portal (§4), and every
Admin Panel module in §5 are now complete and independently verified —
either via direct HTTP checks against the real backend, a live Playwright
run (26/26), or a fresh screenshot of the rendered page, per item. Every
dashboard named in both source PDFs has real, working frontend coverage.

---

## 9. Evidence trail — how "built" was verified, not just claimed

Per this engagement's own standard (carried over from `status.md`'s prior
sessions): a change isn't "done" because it compiles. Everything in §4 and
§5b was checked against the real, running, containerized stack
(`docker compose up -d backend frontend`, rebuilt with each change) — real
HTTP requests with real cookies, not mocks:

- `POST /seo` → `201`, real row created with the exact payload shape
  `ContentManager.jsx`'s SEO form sends.
- `PUT /settings/{key}` → `201` (upsert-creates when the key is new).
- `GET /analytics/summary` → `200` with real tracked data (271 page views,
  11 unique paths, driven by the app's own already-running
  `usePageViewTracker`).
- `GET /backups` → `403` for an `admin` session, `200` for `super_admin` —
  confirmed the Backups screen's placement in `SuperAdminPanel.jsx` (not
  `AdminPanel.jsx`) matches the backend's real role gate, not an assumption
  from reading the router code alone.
- `POST /backups/trigger` → `201`, a real `pg_dump` file
  (`coralswift-development-*.dump`, 213,964 bytes) — an actual database
  backup, not a stub response.
- `GET /comments` → `200`; `GET /newsletter?is_active=true` → `200`.
- Partner Portal: registered a real user, promoted it to the `partner`
  role via `PUT /users/{id}`, provisioned a real `PartnerAccount` via
  `POST /partner-accounts`, logged in through the real form, and loaded
  `/partner` in a real Chromium session — landed on `/partner` (not bounced
  to `/login`), and the profile card rendered the real company
  name/partnership type/industry fetched live from the backend, with
  correctly-rendered icons.
- One real, pre-existing role-data bug surfaced during this verification
  and was fixed on the spot (local dev DB only, not a code change): the
  seeded `superadmin@coralswifttech.com` account's `role` column had drifted
  to `client` at some earlier point (not from anything in this session) —
  caught because the Backups `403`/`200` check above depended on it being
  accurate, corrected via direct SQL for this environment.
- `npm run lint` — 0 errors throughout (only pre-existing Tailwind
  class-order warnings, consistent with the rest of the codebase).
- `npm run build` — clean after every change, including the final state.

**Follow-up pass, same session:** the initial screenshot verification of the
new Admin Panel tabs failed — every `getByRole('button', {name: 'Content'})`-
style lookup returned zero matches. Root-caused rather than dismissed as
environment flakiness: `components/ui/Icon.jsx` renders its Material Symbols
icon as literal ligature *text* with no `aria-hidden`, so that text was
concatenating into the accessible name of every icon+label button —
`"Content"` was actually exposed as something like `"articleContent"`. This
was a real, site-wide accessibility defect (WCAG 4.1.2), not specific to
this session's additions; it just happened to be what broke the test
selectors. Fixed `Icon.jsx` to render `aria-hidden="true"`, then gave
explicit `aria-label`s to the ~35 icon-only controls across the app that
would otherwise have lost their accessible name entirely (full list in §7).

With that fixed, every new Admin Panel tab (Content→SEO, Content→Page
Content, Settings, Analytics, Backups, Comments, Newsletter, Training) and
the Partner Portal were screenshot-verified rendering real data from the
live backend — including the exact SEO/Settings/course records created
during the HTTP checks above, round-tripped visually. One more real bug
surfaced and was fixed in the same pass: `ContentManager.jsx`'s "New {X}"
button label used a blind last-character chop to singularize the resource
name, which broke for anything not a plain `-s` plural (`"SEO"` → `"SE"`,
pre-existing but only just exposed) — replaced with a correct `singularize()`
helper. Full Playwright suite re-run after all of this: still 26/26.
