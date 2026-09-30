# Production-Readiness Premortem & Client-Handover Report

**Date:** August 2026 · **Branch audited:** `coder` (= `origin/main` content merged) · **Commit:** `c41cdd1`

**Premortem framing:** *It is six months after handover. The client's platform has failed them — an outage, a security incident, a broken business flow, or an unusable admin experience. This document reconstructs, module by module, exactly how that happened, using evidence from the codebase as it exists today.*

**Method:** Fresh verification run for this report — backend `pytest` (**1,300 passed**, ~51s), frontend `npm run build` (**success**), `npm run lint` (**0 errors**, 22 warnings), Vitest (**102/103 passed**, 2 suites affected), CI pipeline review (`backend.yml`, `frontend.yml`), Docker/compose review, secrets/hygiene scan of tracked files — combined with the full end-to-end feature audit in `docs/WORKFLOW_REVIEW.md`.

**Exclusion per instruction:** Dummy/seed data quality is **not scored** as a defect (`app/seeders/seed.py` deliberately reads demo accounts from env, no hardcoded passwords — CF-AUD-007). It appears in the checklist only as a "disable before go-live" step.

---

## 1. Verdict

> ### ⚠️ CONDITIONAL GO — *not* handover-ready today; ready after a bounded P0 punch list (est. 2–4 weeks).

| Dimension | Grade | Evidence |
|---|---|---|
| Backend engineering quality | **A** | 1,300 passing tests, IDOR-negative suite, real-Postgres CI verification, 23 migrations, Argon2id + lockout + CSRF + rate limits |
| Frontend engineering quality | **B+** | Builds clean, lint clean, code-split; 1 failing test + 1 broken test suite at handover |
| Security posture | **A−** | Strong by design; one repo-hygiene leak (committed session tokens) must be cleaned before transfer |
| Feature completeness vs spec | **B−** | Core loops work; tracker/delivery/review UIs unbuilt; invoice PDF missing |
| Operational readiness (run/monitor/recover) | **C+** | CI/CD + backups exist; no scheduler, no error monitoring, no verified restore drill |
| Handover package | **C** | Good docs, but junk files and credential artifacts in repo; no ops runbook |

The single biggest premortem risk is **not** technology — it's the gap between what the sales conversation promises (the 27-section workflow) and what the product can actually do through its UI on day one.

---

## 2. The Failure Narrative (Premortem Scenario)

> *"Six months in, the client's operations team refuses to use the portal. Leads arrive without service/budget data because the contact form was never finished, so sales re-enters everything by hand. Project managers run daily updates in WhatsApp because the tracker screens were never built — clients see 'progress bars' with no substance and start calling instead of logging in. A client disputes an invoice; there is no invoice document to send, only a database row, and the client's accountant rejects it. A support agent replies to a ticket; the reply vanishes into the database where no one can read it. An overdue-invoice sweep that someone must remember to click doesn't get clicked during a holiday week. At 2 a.m. the API throws a 500; nobody finds out until the client emails a screenshot, because no error monitoring was configured. The departing developer's knowledge lives in their head and in a repo containing a stray `Desktop - Shortcut.lnk` and Playwright token dumps."*

Every sentence above maps to a specific, evidenced finding below.

---

## 3. Module-by-Module Risk Register

### M1 — Authentication & Session Security
**Status: production-grade ✅ (minor hygiene action required)**

What works: Argon2id hashing with rehash-on-login; timing-equalized comparisons; account lockout; rate limiting (10/min login); opaque session tokens stored DB-side as hashes (unique constraints); httpOnly cookies + CSRF; refresh/logout-all/session listing; optional TOTP MFA (globally OFF until configured — correct fail-safe default).

Why it could still fail:
- 🟡 **MFA routes 404 while disabled** — if the client expects MFA per contract, it silently doesn't exist until `settings.mfa_enabled=true`. Ratify explicitly.
- 🔴 **Hygiene:** `frontend/e2e/.tmp/*.json` are **tracked in git and contain real session-token cookie values**. Tokens are localhost-scoped and likely expired, but shipping credential artifacts to a client in repo history is unacceptable practice. Remove files + purge from history (or accept history rewrite cost) before transfer.
- 🟡 Password-reset tokens expire in 1h; there is no admin "resend invite" wrapper — first-login friction lands on whoever operates the system (the client).

### M2 — Authorization / RBAC
**Status: solid role gates ✅; granular permissions are dead code 🟡**

~80 enforcement points via `require_roles`; ownership scoping everywhere (sales→own leads, PM→own projects/team, client/partner→own data); negative-IDOR tests pass in CI against real Postgres.

Why it could fail:
- 🟡 `/access-control/*` permission tables are admin-manageable but **never consulted by any enforcement path**. The client's admin will configure permissions, believe they took effect, and be wrong. **This is a trust-breaking trap — either enforce or hide/remove the UI before handover.**
- 🟡 Page-level guards rely on each page remembering `useRoleGuard`; future pages added by the client's team can silently skip gating (backend still protects data, but UX confusion results).

### M3 — Public Website, CMS, SEO
**Status: ready ✅ (SEO gaps cosmetic-to-moderate)**

Publish/unpublish lifecycle enforced server-side (`is_published` force-filtered for anonymous callers; draft GETs 404); blogs/categories/services/industries all CMS-driven; SEO fields managed via admin and rendered per-path.

Why it could fail:
- 🟡 SPA-only rendering: crawlers without JS see static fallback meta. For an IT-services company whose website exists to generate leads, weak SEO indexing directly hits the top of the funnel. Structured data (`schema_markup`) is stored but never rendered; blog-level meta fields unused; slug renames orphan SEO rows.
- 🟡 Services page partially hardcoded (masks CMS outages as stale content).

### M4 — Contact Form → Lead Generation
**Status: backend complete ✅ / frontend incomplete 🔴**

Backend captures every spec field (service FK, industry FK, budget, requirements) and auto-creates leads with correct mapping, rate-limited, email-confirmed.

Why it will fail:
- 🔴 **The live form does not render service selector, industry selector, budget, or requirements.** Every lead generated from the public site arrives with those fields null — the client pays for lead management software that captures half a lead. **Highest-priority functional blocker.**

### M5 — Lead Evaluation & Conversion
**Status: backend complete ✅ / evaluation UX missing 🟡**

Idempotent convert endpoint gated to admin/PM; disqualified-lead guard; provisioning creates User+Client atomically-ish with account-manager resolution.

Why it could fail:
- ❌ Six evaluation fields (meeting notes, requirements confirmed, timeline, result, rejection reason) have zero UI — the client's sales team cannot perform the documented process inside the product.
- ❌ Meetings cannot link to leads (no `lead_id`) — evaluation meetings are free-text notes.
- 🟡 No `convertLead` API consumer found in the staff UI; verify the button exists before demoing this to the client.

### M6 — Client Onboarding (Credentials & Welcome Email)
**Status: works ✅ / deviates from spec 🟡**

Secure reset-link design (no password ever emailed — arguably better than spec), two disjoint emails with generic framing.

Why it could fail:
- 🟡 Client's first impression of the portal is an email titled "Password Reset Request" with no thank-you/portal branding. Cosmetic, but this is the moment the client's customer judges the platform.
- 🟡 Expired-token dead-end with no resend tooling → support load on the client's admin.

### M7 — Client Portal
**Status: strong isolation ✅ / several promised modules thin 🟡**

Data isolation is the best-engineered area in the repo (central `_get_client_for_user`, 404-not-403 ownership checks, assigned-account-manager gating, IDOR-tested). Dashboard, proposals (accept/reject), meetings, invoices, payments, tickets lists all present.

Why it could fail:
- 🔴 Files/Reports download buttons point at raw private-storage references → **broken links in front of the client's customers**. Secured endpoints exist; the wiring was never done.
- ❌ No notifications UI; no project-detail view; ticket priority hardcoded to medium; profile read-only (no update endpoint exists).
- 🔴 Everything under Phases 8–9 below.

### M8 — Project Tracker & Daily Updates
**Status: backend complete ✅ / no UI ❌**

The `client_visible` approval gate (employee posts → PM approves → client sees sanitized updates), milestones, deliverables, hours logging — all implemented, tested, ownership-scoped.

Why it will fail:
- 🔴 **Zero frontend consumers.** The daily-update loop the client was sold cannot happen in the product. PMs and employees fall back to chat/email within weeks; the client-visible "Project Tracker" tab becomes an empty shell. This alone can sink perceived value of the entire portal.

### M9 — Completion & Delivery Approval
**Status: backend complete ✅ / no UI ❌**

submit-for-review → deliverable reviews → approve-delivery / request-changes with version bump and notifications — fully built, unreachable.

Same failure mode as M8, at the revenue-critical moment (approval precedes payment).

### M10 — Proposals
**Status: backend complete ✅ / review gate unreachable 🟡**

Version-per-lead history, PM approve/reject with notes, $50k finance notification, client accept (auto-provisions project!) and reject-with-reason — all present.

Why it could fail:
- ❌ Employees can't submit drafts for PM review and PMs can't review them in-app (`api/crm.js` lacks both calls) → the documented employee→PM→client gate is bypassed in practice.
- 🟡 `viewed_at` dead; prior versions never marked superseded.

### M11 — Documents
**Status: functional core ✅ / metadata gaps 🟡**

Validated uploads (MIME + magic bytes + size), scoped uploads/downloads, HR/employee doc flows separate.

Why it could fail:
- ❌ Broken download links (see M7) make the module look broken even though the backend is fine.
- 🟡 No version/status/access-permission metadata; `uploaded_by` is a display string — weak audit trail for a client who may need compliance evidence.

### M12 — Meetings
**Status: good ✅ (modeling limits)**

Dual notification (in-app + email) on scheduling — spec-exact; client sees own meetings; soft-cancel.

Why it could fail:
- 🟡 Participants beyond organizer unsupported; clients can't request meetings; recordings/notes lack dedicated UI. Acceptable if the client is told; annoying if they discover it.

### M13 — Finance (Payments & Invoices)
**Status: payment engine excellent ✅ / invoicing incomplete 🔴**

Idempotent payment recording backed by a DB partial-unique index (tested incl. replay), auto paid-status flip, invoice CRUD/history, client-scoped views, overdue sweep endpoint.

Why it will fail:
- 🔴 **No invoice document exists** — no PDF library server-side, jspdf used only for brochures, no download endpoint, no print view. A finance system that cannot produce a sendable invoice fails its primary purpose for most clients.
- 🟡 Overdue status requires manually clicking sweep-overdue — **no scheduler exists anywhere in the stack** (documented). Missed clicks = stale statuses = angry accounting.
- 🟡 No payment-received email/notification to clients.

### M14 — Support Tickets & SLA
**Status: lifecycle complete ✅ / thread unreadable ❌**

Priority enum exact to spec; SLA computed in business hours (High = 1 business day, unit-tested with weekend rollover); anti-backdating timestamps; assignment/resolution/close flow.

Why it will fail:
- ❌ **Replies are write-only**: serialized nowhere, no GET endpoint, no client reply path. A support system where answers disappear is worse than email.
- ❌ No `category` field (spec'd).
- 🟡 SLA deadlines invisible in the queue and unmonitored — breaches happen silently; SLA becomes a marketing claim, not an operational control.

### M15 — Notifications & Email Delivery
**Status: event-driven core ✅ / coverage uneven 🟡**

`notify_user`/`notify_roles` wired into meetings, leads, proposals, contracts, onboarding, leave decisions, review submission.

Why it could fail:
- ❌ Neither Client nor Employee portal renders notifications at all — half the notification investment is invisible.
- 🟡 Ticket/payment/team-assignment events don't notify; delivery is synchronous inline (no retry); polling-only with no unread count.

### M16 — Employee Portal & HR
**Status: strongest portal overall ✅ (specific bugs)**

Attendance check-in/out + HR visibility; full leave loop with PM team-scoping and notifications; mature UAT-verified timesheets; payslips with secured downloads; performance reviews/goals/feedback models; training catalog with race-safe enrollment.

Why it could fail:
- 🔴 Performance tab computes NaN% (expects `goals_set/goals_achieved` fields the API never returns) — visibly broken screen shown to every employee.
- 🟡 Payslip/document links bypass secured endpoints (broken); training completion has no writer (nothing can ever complete); no leave balances/overlap validation; "Hours This Week" KPI sums all-time data.
- ❌ Daily project updates missing at both ends here too (orphan model, no router registered).

### M17 — Admin Panel / Super Admin
**Status: broad ✅ / fragmented 🟡**

Dashboard KPIs, users/clients/employees/projects, CMS manager, media, careers, analytics, audit logs, settings, GDPR tools, backups, impersonation.

Why it could fail:
- 🟡 Leads/Tickets/Invoices/Meetings/Documents have no admin-panel tabs — they live in role portals. The client's "admin" cannot administer what they can't see; expect immediate change requests.
- 🟡 Reports generate metadata rows, not reports; settings are write-only key/value (nothing reads them at runtime — configuring them changes nothing).

### M18 — Data Layer & Migrations
**Status: disciplined ✅**

23 Alembic migrations applied in CI against real Postgres (regression guard for a past enum-duplication bug); FK constraints with deliberate CASCADE choices; DB-level uniqueness for idempotency/tokens/attendance/enrollment; soft-delete-ready Base.

Residual risks: SQLite-vs-Postgres dialect drift is mitigated by the real-DB verification script; migration discipline depends on the process being followed post-handover (see runbook gap, M21).

### M19 — Testing & QA Gates
**Status: strong backend ✅ / red frontend 🔴**

Backend: **1,300 tests green locally**; CI adds real-DB IDOR/tenant-isolation/N+1 verification; e2e Playwright scaffolding exists.

Why it could fail:
- 🔴 **Frontend suite ships red**: `AuthContext.test.jsx` 1 failure ("Failed to parse URL from /api/v1/analytics/track") and `ContentManager.test.jsx` suite fails to load. The repo's own AGENTS rule says don't merge red. Handing over a red suite destroys the client's ability to trust any future CI signal.
- 🟡 Backend CI (`backend.yml`) runs pytest only — **ruff lint gate absent**, despite repo rules requiring it.

### M20 — CI/CD & Deployment
**Status: genuinely good ✅**

Frontend CI: lint → vitest → build. Backend CI: real Postgres service → migrations → pytest → real-DB verification → Docker build/push (main only) → SSH deploy with `alembic upgrade head`. Compose files for prod/staging/dev; Procfile for Heroku-style; vercel.json for frontend.

Why it could fail:
- 🟡 Single-server SSH deploy, no rollback strategy documented (image tags exist per-sha — rollback possible but unwritten).
- 🟡 No staging deployment automation visible (`docker-compose.staging.yml` exists; pipeline deploys main straight to prod host).
- 🟡 Deploy secret surface (DOCKERHUB_TOKEN, DEPLOY_SSH_KEY) — confirm these live in GitHub Environments with restricted access before transferring the GitHub repo.

### M21 — Observability, Recovery & Support Model
**Status: thinnest area of the handover 🔴**

Present: structured request logging + X-Request-Id, audit middleware, health endpoint, backups router (super_admin-triggered).

Why it will fail:
- ❌ **No external error monitoring** (no Sentry/equivalent found) — first knowledge of production errors will be client complaints.
- ❌ **No scheduler/cron anywhere** — anything time-based (invoice overdue sweeps, SLA breach flags, session cleanup) requires manual clicks forever.
- 🟡 Backups exist as a feature, but no evidence of scheduled execution or a **restore drill** — an unverified backup is a hope, not a control.
- ❌ No ops runbook: deploy/rollback steps, env var inventory per environment, incident escalation, seed-disable procedure. For handover this is as important as code.

### M22 — Legal, Compliance & Repo Hygiene
**Status: mixed 🟡**

GDPR export/delete endpoints exist (super_admin-gated); privacy/terms/cookies pages CMS-driven; secrets correctly gitignored (.env untracked, examples only).

Why it could fail:
- 🔴 Committed e2e token JSONs + `Desktop - Shortcut.lnk` + `.probe*.tmp.mjs` junk in git — clean before the client sees the repo; first impressions of repo quality matter in handovers.
- 🟡 Audit log covers successful writes only; retention policy undefined (GDPR-relevant).
- 🟡 No LICENSE/ownership statement for the transfer itself (business item, not code).

---

## 4. Module Scorecard

| # | Module | Prod-ready? | Blocker severity |
|---|---|---|---|
| M1 | Auth & sessions | ✅ Yes | P2 (token-artifact cleanup is P0 hygiene) |
| M2 | RBAC | 🟡 Yes w/ caveat | P1 (dead permission UI) |
| M3 | Public site / CMS / SEO | ✅ Yes | — |
| M4 | Contact → Lead | 🔴 No (frontend) | **P0** |
| M5 | Lead evaluation/conversion | 🟡 Partially | P1 |
| M6 | Onboarding email | 🟡 Yes w/ deviation | P1 (resend tool) |
| M7 | Client portal | 🟡 Mostly | **P0** (downloads) |
| M8 | Project tracker/daily updates | ❌ No (UI) | **P0** |
| M9 | Delivery approval | ❌ No (UI) | **P0** |
| M10 | Proposals | 🟡 Mostly | **P0** (review gate) |
| M11 | Documents | 🟡 Mostly | P0 shares download fix |
| M12 | Meetings | ✅ Yes w/ limits | P2 |
| M13 | Finance/invoices | 🔴 No (invoice doc) | **P0** |
| M14 | Tickets/SLA | 🔴 No (replies unreadable) | **P0** |
| M15 | Notifications | 🟡 Backend only | P1 (portal UIs) |
| M16 | Employee portal/HR | 🟡 Yes w/ bugs | P0 (NaN screen) |
| M17 | Admin panel | 🟡 Fragmented | P1/P2 |
| M18 | Data/migrations | ✅ Yes | — |
| M19 | Testing/QA | 🔴 Frontend red | **P0** (green the suite) |
| M20 | CI/CD/deploy | ✅ Yes | P1 (rollback/runbook) |
| M21 | Observability/recovery | ❌ Thin | **P0** (monitoring) |
| M22 | Hygiene/legal/compliance | 🟡 | **P0** (repo cleanup) |

---

## 5. Go/No-Go Criteria

### Must be true before handover (P0 — blockers)

1. **Green frontend test suite** — fix `AuthContext` analytics-URL failure and the `ContentManager` suite load error; re-enable CI trust.
2. **Complete the contact form** — service selector (from published services), industry, budget, requirements. Backend already accepts all of it.
3. **Fix every file-download link** to call secured endpoints (`/clients/files/{id}/download`, `/employees/me/payslips/{id}/download`, `/employees/documents/{id}/download`, reports) and wire upload buttons for client files. One shared helper fixes all.
4. **Build the project-tracker UI trio**: employee daily-update posting + PM visibility toggle (Employee Portal); approved updates/milestones/deliverables + approve-delivery/request-changes (Client Portal). All endpoints exist today.
5. **Expose the proposal PM-review gate** in the UI (submit-for-review + review actions).
6. **Make ticket replies readable** (serialize replies or GET endpoint) + expose a client reply path; render `sla_due_at` in the support queue.
7. **Invoice PDF generation + download** (server-side lib preferred; endpoint + staff/client buttons).
8. **Error monitoring** (Sentry or equivalent, both sides) configured with alerts routed to whoever will actually respond post-handover.
9. **Repo hygiene/security pass**: remove tracked `e2e/.tmp/*.json` token dumps, `.lnk`, probe files; scrub from history; disable demo seeding in prod env; rotate any credential ever committed.
10. **Ops runbook delivered with the code**: deploy + rollback steps, full env-var inventory per environment, backup schedule + one performed restore drill, incident escalation path, seed-disable procedure.

### Strongly recommended before/at handover (P1)

11. Notifications UI (bell/tab) for Client + Employee portals; add unread-count endpoint; notify on tickets/payments/team assignment.
12. Lead evaluation panel (the six fields) + `lead_id` on meetings; confirm lead-convert button exists in sales UI.
13. Cohesive welcome/credentials email + admin resend-invite endpoint.
14. Fix Performance tab contract (NaN%); training completion endpoint; payslip/document upload wiring.
15. Enforce-or-remove the granular permissions system.
16. Scheduler/cron (even a simple host-level cron hitting existing sweep endpoints: invoices-overdue, SLA breach flagging).
17. Add ruff gate to backend CI.

### Acceptable post-handover backlog (P2) — document, don't block

18. Admin-panel tabs for leads/tickets/invoices/meetings/documents; real report computation/export; settings validation + consumers; meeting participants & client-initiated requests; document versioning/status metadata; `Client.industry` FK; JSON-LD rendering; SSR/prerendering for SEO; leave balances & overlap checks; attendance HR corrections; task edit/delete + scoping; incremental team assignment; response-SLA tracking; audit-log retention policy.

---

## 6. Spec Deviations to Ratify With the Client (Not Defects)

1. **Reset-link onboarding instead of emailed temporary passwords** — more secure; get written sign-off that this satisfies "credentials by email."
2. **Staff-recorded payments, no gateway** — documented and UAT-passed; confirm the client's billing process matches.
3. **Role-based (not granular-permission) authorization in effect** — despite the permissions screens.
4. **Single deadline SLA** (resolution only, no response-SLA), frozen at creation.
5. **Polling notifications**, no push/websocket.

---

## 7. Bottom Line

The platform's engineering foundations — security, data integrity, tests, CI/CD, documentation discipline — are genuinely above average for a handover, and the backend implements nearly the entire sold workflow. What stands between this codebase and a safe client handover is narrow and well-defined: **five unbuilt/broken frontend surfaces** (contact form, tracker/delivery UIs, proposal review gate, downloads wiring, ticket replies), **one missing artifact** (invoice PDF), **two operational gaps** (error monitoring, scheduler), **one red test suite**, and **a repo-hygiene pass**. All are bounded work measured in weeks, not months — but none of them are optional, because each one sits directly on a workflow the client was shown and will try on day one.

