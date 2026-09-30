# CoralSwift API Report

**Generated:** 2026-08-15 · **Base URL:** `/api/v1` · **Total endpoints:** 198
**API style:** FastAPI + SQLAlchemy + Supabase Auth · All responses use a shared envelope.

---

## 0. Conventions Used by Every Endpoint

### Response envelope (`app/utils/responses.py`)
Every endpoint returns this shape (HTTP 200 unless noted):
```json
{
  "success": true,
  "status_code": 200,
  "message": "Human readable message",
  "data": { ... } | [ ... ] | null,
  "meta": { "total": 0, "page": 1, "limit": 20, "total_pages": 0 } | null
}
```
- `meta` is present **only on list endpoints**.
- `data` is `null` on actions with no payload (e.g. deletes, logout).

### Authentication
- `public` — no auth. `optional` — works with or without a Bearer token.
- `auth` — requires header `Authorization: Bearer <access_token>` (Supabase JWT). Returns `401 Unauthorized` if missing/invalid.
- `roles` — requires an authenticated user whose role is in the allowed set (e.g. `admin`); `super_admin` bypasses all role checks. Returns `403 Forbidden` if the role is not allowed.

### Common query params on list endpoints (`page`, `limit`, `sort`, `search`)
| Param | Type | Default | Notes |
|---|---|---|---|
| `page` | int | 1 | 1-based, `ge=1` |
| `limit` | int | 20 | `ge=1`, `le=100` |
| `sort` | string | `-created_at` | comma-separated fields, `-` prefix = descending, e.g. `-created_at,title` |
| `search` | string | - | ILIKE match across the resource's searchable fields |

### Error responses
FastAPI-standard `{"detail": "..."}` with codes: `400` bad request · `401` unauthenticated · `403` forbidden · `404` not found · `409` conflict · `422` validation · `500` internal.

### Paginated `meta` example
```json
"meta": { "total": 37, "page": 2, "limit": 20, "total_pages": 2 }
```

---

## 1. Auth — `app/routers/auth.py`

### POST `/auth/register` · public · 201
Public self-serve signup. **Client-only** — never accepts a `role` field.
**Request:**
| Field | Type | Req | Notes |
|---|---|---|---|
| `name` | string | yes | 1–150 chars |
| `email` | string (email) | yes | |
| `password` | string | yes | min 8 chars |
| `phone` | string | no | |

**Response:** `data` = User profile
```json
{
  "id": "uuid", "name": "Jane", "email": "jane@acme.com", "phone": null,
  "avatar": null, "role": "client", "is_active": true,
  "is_email_verified": true, "created_at": "ISO", "updated_at": "ISO"
}
```
Fails with `409` if email already exists; `400` if Supabase account creation fails.

### POST `/auth/login` · public
**Request:** `{ "email": string, "password": string }`
**Response:** `data` = `{ "access_token": "jwt", "refresh_token": "jwt", "expires_in": int, "user": {UserRead} }`
`401` on invalid credentials or deactivated account.

### POST `/auth/logout` · public
**Request:** `{ "access_token": string }` · Best-effort Supabase sign-out.
**Response:** `data = null`, message `"Logged out successfully"`.

### GET `/auth/me` · auth
**Response:** `data` = current user profile (same shape as register response).

---

## 2. Users & GDPR — `app/routers/users.py`, `gdpr.py`

Router-level auth: `roles(admin, hr)`.

### GET `/users` · roles(admin, hr)
**Query filters:** `role`, `is_active` (`true/false`) · searchable: `name`, `email`
**Response:** `data` = array of `UserOut`, with `meta`.

### GET `/users/{user_id}` · roles(admin, hr)
**Response:** `data` = `UserOut`. `404` if not found.

### POST `/users` · roles(admin, hr) · 201
**Request (UserCreate):**
| Field | Type | Req | Notes |
|---|---|---|---|
| `name` | string | yes | |
| `email` | email | yes | |
| `password` | string | yes | |
| `role` | enum | no | default `guest`; **only `super_admin` may set `admin`/`super_admin`** |
| `phone` | string | no | |

Creates the Supabase auth account + local profile; auto-creates an `Employee` row (`EMP-XXXX` code) for employee roles. **Response:** `data` = `UserOut`.

### PUT `/users/{user_id}` · roles(admin, hr)
**Request (UserUpdate — partial):** `name`, `phone`, `avatar`, `role`, `is_active` (all optional). Same super-admin guard on role escalation.
**Response:** `data` = `UserOut`.

### PATCH `/users/{user_id}/deactivate` · roles(admin, hr)
No body. Sets `is_active=false` locally and bans the Supabase auth account (~100y ban).
**Response:** `data` = `UserOut`, message `"User deactivated"`.

### DELETE `/users/{user_id}` · roles(admin) (stricter — delete endpoint only allows `admin`, not `hr`)
No body. Removes Supabase auth account (best-effort) + local row.
**Response:** `data = null`, message `"User deleted successfully"`.

### GET `/users/{user_id}/export` · roles(super_admin)
GDPR data-export. **Response:** `data` = combined dossier:
```json
{
  "profile": {UserRead}, "employee_profile": {...} | null, "client_profile": {...} | null,
  "projects": [{id,title,status,start_date,end_date}] | null,
  "invoices": [{id,invoice_number,amount,total_amount,currency,status,issue_date,due_date}] | null,
  "tickets": [{id,ticket_number,subject,priority,status}] | null,
  "testimonials": [{id,content}] | null,
  "notifications": [{id,title,message,type,is_read,created_at}] | null,
  "audit_logs": [{id,action,entity_type,entity_id,created_at}] | null
}
```

### POST `/users/{user_id}/anonymize` · roles(super_admin)
No body. Overwrites PII (`name="Deleted User"`, synthetic email, phone/avatar null, `is_active=false`).
**Response:** `data = null`, message `"User data has been anonymized"`.

---

## 3. Stats — `app/routers/stats.py`

### GET `/stats` · public
**Response:** `data` (counts)
```json
{
  "total_services": 0, "total_projects": 0, "active_projects": 0,
  "total_employees": 0, "total_clients": 0, "countries": 0,
  "total_employee_users": 0, "total_client_users": 0
}
```

---

## 4. Employees — `app/routers/employees.py`

Router-level auth: `get_current_user` (any authenticated user for self-service; role-gated routes add their own guard).

### Self-service (any authenticated employee role)

**GET `/employees/me/profile`** · auth
**Response:** `data` = `EmployeeOut` fields **plus** `name`, `email`, `role`, `department_name`.
Auto-creates an employee profile if the user has an employee role but no profile.

**GET `/employees/me/attendance/today`** · auth
**Response:** `data` = attendance record or `null` if none today:
`{ id, employee_id, date, status, check_in: "09:15 AM" | null, check_out: "06:00 PM" | null, ... }`
(times serialized as `%I:%M %p`).

**POST `/employees/me/attendance/check-in`** · auth
No body. Creates today's `Attendance(status="present", check_in=now)` or returns existing.
**Response:** `data` = `AttendanceOut`, message `"Checked in"`.

**POST `/employees/me/attendance/check-out`** · auth
No body. `400` if not checked in today. Sets `check_out`.
**Response:** `data` = `AttendanceOut`, message `"Checked out"`.

**GET `/employees/me/leaves`** · auth
**Response:** `data` = array of `LeaveOut`: `{ id, employee_id, type, start_date, end_date, reason, status, ... }`.

**POST `/employees/me/leaves`** · auth · 201
**Request (LeaveApply):** `type` (enum, aliases `annual→earned`, `personal/casual→casual`, `sick`, `unpaid`, `maternity`, `paternity`), `start_date` (date), `end_date` (date), `reason` (string?).
**Response:** `data` = `LeaveOut` with `status="pending"`, message `"Leave request submitted"`.

**GET `/employees/me/timesheets`** · auth
**Response:** `data` = array of `TimesheetOut`: `{ id, employee_id, project_id, task_id, date, hours, description, status, ... }`.

**POST `/employees/me/timesheets`** · auth · 201
**Request (TimesheetCreate):** `project_id?`, `task_id?`, `date` (date), `hours` (float), `description?`.
**Response:** `data` = `TimesheetOut`, message `"Timesheet entry logged"`.

**GET `/employees/me/payslips`** · auth
**Response:** `data` = array of `PayslipOut`: `{ id, employee_id, month, year, basic, allowances, deductions, net_pay, file_url, status, ... }`.

**GET `/employees/me/documents`** · auth
**Response:** `data` = array of `EmployeeDocumentOut`: `{ id, employee_id, title, type, file_url, ... }`.

**GET `/employees/me/performance-reviews`** · auth
**Response:** `data` = array of `PerformanceReviewOut`: `{ id, employee_id, reviewer_id, review_period, review_date, rating(1-10), strengths, areas_for_improvement, goals, comments, status, ... }`.

### Leave & timesheet approvals · roles(admin, hr, project_manager)

**GET `/employees/leaves`** · roles(admin, hr, project_manager)
**Query filters:** `status` (enum), `employee_id`. **Response:** `data` = array of `LeaveOut` + `employee_code`, `designation`, with `meta`.

**PATCH `/employees/leaves/{leave_id}/approve`** · roles(admin, hr, project_manager)
**Request:** `{ "status": "approved" | "rejected" | ... }` (LeaveStatus).
**Response:** `data` = `LeaveOut`, message `"Leave request updated"`.

**GET `/employees/timesheets`** · roles(admin, hr, project_manager)
**Query filters:** `employee_id`, `project_id`, `status`. **Response:** `data` = array of `TimesheetOut` + `employee_code`, `designation`, `employee_name`, with `meta`.

**PATCH `/employees/timesheets/{timesheet_id}/approve`** · roles(admin, hr, project_manager)
**Request:** `{ "status": TimesheetStatus }`. **Response:** `data` = `TimesheetOut`.

### HR / admin management

**GET `/employees`** · roles(admin, hr, project_manager)
**Query filters:** `department_id`, `status`, `employment_type`. **Response:** `data` = array of `EmployeeOut` + `department_name`, `name`, `email`, with `meta`.

**POST `/employees`** · roles(admin, hr) · 201
**Request (EmployeeCreate):**
| Field | Type | Req | Notes |
|---|---|---|---|
| `user_id` | uuid | yes | links to User |
| `employee_code` | string | yes | |
| `department_id` | uuid | no | |
| `designation` | string | no | |
| `date_of_joining` / `date_of_birth` | date | no | |
| `employment_type` | enum | no | default `full_time` |
| `status` | enum | no | default `active` |
| `office_location` | string | no | |
| `reporting_manager_id` | uuid | no | |
| `salary` | float | no | |
| `address` | string | no | |

**Response:** `data` = `EmployeeOut`, message `"Employee created successfully"`.

---

## 5. Clients — `app/routers/clients.py`

Router-level auth: `get_current_user`.

### Client self-service

**GET `/clients/me/profile`** · auth
**Response:** `data` = `ClientOut` fields **plus** `contact_name`, `email`.
`404` if the user has no client profile.

**GET `/clients/me/projects`** · auth
**Response:** `data` = array of `ProjectOut` (client's projects, newest first).

**GET `/clients/me/invoices`** · auth
**Response:** `data` = array of `InvoiceOut`: `{ id, invoice_number, client_id, project_id, amount, tax, total_amount, currency, issue_date, due_date, status, notes, ... }`.

**GET `/clients/me/tickets`** · auth
**Response:** `data` = array of `TicketOut`: `{ id, ticket_number, client_id, subject, description, priority, status, assigned_to, ... }`.

**POST `/clients/me/tickets`** · auth · 201
**Request (TicketCreate):** `subject` (string, req), `description` (string, req), `priority` (string, default `"medium"`).
Auto-generates `ticket_number` (`TCK-<ts>`). **Response:** `data` = `TicketOut`.

**GET `/clients/me/payments`** · auth
**Response:** `data` = array of `ClientPaymentOut` = `PaymentOut` + `invoice_number`.

**GET `/clients/me/meetings`** · auth
**Response:** `data` = array of `MeetingOut` + `attendees` (array of organizer names):
`{ id, project_id, client_id, title, agenda, scheduled_at, duration_minutes, meeting_link, organizer_id, status, notes, attendees: [...], ... }`.

**GET `/clients/me/files`** · auth
**Response:** `data` = array of `ClientFileOut`: `{ id, client_id, name, category, file_url, size_bytes, uploaded_by, ... }`.

**POST `/clients/me/files`** · roles(admin, project_manager) · 201
Path-var `client_id` (uuid) of the target client. **Request (ClientFileCreate):** `name`, `category`, `file_url`, `size_bytes?`, `uploaded_by?`.
**Response:** `data` = `ClientFileOut`, message `"File uploaded"`.

**GET `/clients/me/reports`** · auth
**Response:** `data` = array of `ClientReportOut`: `{ id, client_id, title, report_type, period, file_url, size_bytes, ... }`.

**POST `/clients/me/reports`** · roles(admin, finance) · 201
Path-var `client_id`. **Request (ClientReportCreate):** `title`, `report_type`, `period`, `file_url?`, `size_bytes?`.
**Response:** `data` = `ClientReportOut`.

### Admin / sales management

**GET `/clients`** · roles(admin, sales, project_manager, finance)
**Query filters:** `industry`. **Response:** `data` = array of `ClientOut`, with `meta`.

**POST `/clients`** · roles(admin, sales) · 201
**Request (ClientCreate):**
| Field | Type | Req | Notes |
|---|---|---|---|
| `user_id` | uuid | yes | |
| `company_name` | string | no | |
| `industry` / `country` / `website` / `billing_address` | string | no | |
| `account_manager_id` | uuid | no | |

**Response:** `data` = `ClientOut`.

---

## 6. Projects — `app/routers/projects.py`

### GET `/projects` · optional
Public callers only ever see `is_published=true`.
**Query filters:** `status`, `client_id`, `industry`, `project_manager_id`, `is_featured` (`true/false`), `is_published` (auth only), plus `employee_id` (restricts to projects where the employee is a team member).
**Response:** `data` = array of `ProjectOut`, with `meta`.

### GET `/projects/{identifier}` · optional
`identifier` may be a UUID **or** a slug (auto-detected).
**Response:** `data` = `ProjectOut`. `404` if not found or unpublished for anonymous callers.

### POST `/projects` · roles(admin, project_manager) · 201
**Request (ProjectCreate):** `title` (req), `slug?`, `client_id?`, `overview?`, `challenge?`, `solution?`, `technology_stack` (list, default `[]`), `architecture_notes?`, `industry?`, `start_date?`, `end_date?`, `budget?`, `status` (default `planning`), `project_manager_id?`, `cover_image?`, `video_url?`, `is_featured` (default false), `is_published` (default false).
Slug auto-generated from title if omitted. **Response:** `data` = `ProjectOut`.

### PUT `/projects/{project_id}` · roles(admin, project_manager)
**Request (ProjectUpdate — partial):** `title`, `client_id`, `overview`, `challenge`, `solution`, `technology_stack`, `status`, `progress_percent`, `budget`, `start_date`, `end_date`, `project_manager_id`, `cover_image`, `video_url`, `is_featured`, `is_published`.
**Response:** `data` = `ProjectOut`.

### PATCH `/projects/{project_id}/team` · roles(admin, project_manager)
**Request (AssignTeamRequest):** `{ "employee_ids": ["uuid", ...] }`
Replaces the project's team with the given employees. **Response:** `data = null`, message `"Project team updated"`.

### DELETE `/projects/{project_id}` · roles(admin)
**Response:** `data = null`, message `"Project deleted successfully"`.

---

## 7. Tasks — `app/routers/task.py`

Router-level auth: `get_current_user`.

### GET `/tasks` · auth
**Query filters:** `project_id`, `assigned_to`, `status`, `priority` · searchable: `title`.
**Response:** `data` = array of `TaskOut`, with `meta`.

### POST `/tasks` · roles(admin, project_manager) · 201
**Request (TaskCreate):**
| Field | Type | Req | Notes |
|---|---|---|---|
| `project_id` | uuid | yes | |
| `title` | string | yes | |
| `description` | string | no | |
| `assigned_to` | uuid | no | |
| `priority` | enum | no | default `medium` |
| `status` | enum | no | default `todo` |
| `due_date` | date | no | |
| `estimated_hours` | float | no | |

**Response:** `data` = `TaskOut`.

### PATCH `/tasks/{task_id}/status` · auth
**Request (TaskStatusUpdate):** `{ "status": "todo" | "in_progress" | "in_review" | "done" | ... }`
**Response:** `data` = `TaskOut`, message `"Task status updated"`.

---

## 8. Finance — `app/routers/finance.py`

Router-level auth: `roles(admin, finance)`.

### GET `/finance/invoices` · roles(admin, finance)
**Query filters:** `client_id`, `project_id`, `status` · searchable: `invoice_number`.
**Response:** `data` = array of `InvoiceOut`, with `meta`.

### GET `/finance/invoices/{invoice_id}` · roles(admin, finance)
**Response:** `data` = `InvoiceOut`. `404` if missing.

### POST `/finance/invoices` · roles(admin, finance) · 201
**Request (InvoiceCreate):**
| Field | Type | Req | Notes |
|---|---|---|---|
| `invoice_number` | string | no | auto `INV-<ts>` if omitted |
| `client_id` | uuid | yes | |
| `project_id` | uuid | no | |
| `amount` | float | yes | |
| `tax` | float | no | default 0 |
| `currency` | string | no | default `INR` |
| `issue_date` / `due_date` | date | yes | |
| `notes` | string | no | |

`total_amount = amount + tax`. **Response:** `data` = `InvoiceOut`.

### PUT `/finance/invoices/{invoice_id}` · roles(admin, finance)
**Request (InvoiceUpdate):** `status`, `notes`, `due_date` (all optional).
**Response:** `data` = `InvoiceOut`.

### POST `/finance/invoices/{invoice_id}/payments` · roles(admin, finance) · 201
**Request (PaymentCreate):** `amount` (float, req), `method` (enum), `transaction_ref?`, `paid_at` (datetime, req), `status` (default `completed`).
After recording, if `sum(completed payments) >= total_amount` the invoice status flips to `paid`.
**Response:** `data` = `PaymentOut`.

---

## 9. Careers — `app/routers/career.py`

### GET `/careers` · public
Shows only `status="open"`. **Query filters:** `department`, `location`, `employment_type`.
**Response:** `data` = array of `CareerOut`: `{ id, title, slug, department, location, employment_type, experience_required, description, responsibilities[], requirements[], status, posted_at, ... }`, with `meta`.

### POST `/careers/{career_id}/apply` · public · 201
**Multipart/form-data:**
| Field | Type | Req | Notes |
|---|---|---|---|
| `full_name` | form | yes | |
| `email` | form (email) | yes | |
| `phone` | form | no | |
| `cover_letter` | form | no | |
| `linkedin_url` | form | no | |
| `resume` | file | yes | saved to uploads |

`400` if the position is not open. **Response:** `data` = `ApplicationOut`: `{ id, career_id, full_name, email, phone, resume_url, cover_letter, linkedin_url, status, ... }`.

### POST `/careers` · roles(admin, hr) · 201
**Request (CareerCreate):** `title` (req), `slug?`, `department?`, `location?`, `employment_type` (default `full_time`), `experience_required?`, `description?`, `responsibilities[]`, `requirements[]`, `status` (default `open`).
**Response:** `data` = `CareerOut`.

### GET `/careers/admin/applications` · roles(admin, hr)
**Query filters:** `career_id`, `status`. **Response:** `data` = array of `ApplicationOut`, with `meta`.

### PATCH `/careers/admin/applications/{application_id}/status` · roles(admin, hr)
**Request:** `{ "status": "applied" | "reviewing" | "shortlisted" | "rejected" | "hired" | ... }`
**Response:** `data` = `ApplicationOut`.

---

## 10. Contact — `app/routers/contact.py`

### POST `/contact` · public · 201
**Request (ContactSubmit):** `name` (req), `email` (req), `phone?`, `company?`, `department?`, `subject?`, `message` (req).
Stores submission and sends an email notification.
**Response:** `data = null`, message `"Thank you for reaching out — our team will get back to you shortly."`.

### GET `/contact` · roles(admin, sales, support)
**Query filters:** `department`, `status`. **Response:** `data` = array of `ContactOut`: `{ id, name, email, phone, company, department, subject, message, status, ... }`, with `meta`.

---

## 11. Blog — `app/routers/blog.py`

### GET `/blogs` · optional
Anonymous callers only see `status="published"`.
**Query filters:** `category_id`, `author_id`, `status` (auth only). **Response:** `data` = array of `BlogOut`: `{ id, title, slug, excerpt, content, cover_image, author_id, category_id, tags[], status, views, published_at, ... }`, with `meta`.

### POST `/blogs` · roles(admin, marketing) · 201
**Request (BlogCreate):** `title` (req), `slug?`, `excerpt?`, `content` (req), `cover_image?`, `category_id?`, `tags[]`, `status` (default `draft`), `meta_title?`, `meta_description?`.
Sets `author_id` from the token; sets `published_at` when status is `published`.
**Response:** `data` = `BlogOut`.

### PUT `/blogs/{blog_id}` · roles(admin, marketing)
**Request (BlogUpdate):** `title`, `excerpt`, `content`, `cover_image`, `category_id`, `tags`, `status` (all optional).
**Response:** `data` = `BlogOut`.

### DELETE `/blogs/{blog_id}` · roles(admin, marketing)
**Response:** `data = null`, message `"Blog deleted successfully"`.

---

## 12. Generic CMS Resources — built by `app/utils/router_factory.py`

The following 16 modules all expose the **same 5 endpoints**:

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/{prefix}` | public | Paginated list. `?page&limit&sort&search` + resource filters |
| GET | `/{prefix}/{item_id}` | public | Fetch one item. `404` if missing |
| POST | `/{prefix}` | roles | Create (201). Body = Create schema |
| PUT | `/{prefix}/{item_id}` | roles | Update (partial body). Body = Update schema |
| DELETE | `/{prefix}/{item_id}` | roles | Delete. No body |

**List response:** `{ success, status_code, message, data: [Out...], meta }` ·
**Get/create/update response:** `{ ..., data: Out }` · **Delete response:** `data = null`.

| Module (prefix) | Write roles | Filters | Searchable | Create fields (all Create = Out minus id/timestamps; * = required) |
|---|---|---|---|---|
| **Services** `/services` | admin, marketing | `is_published` | name, overview | name*, slug, icon, overview, business_problems, solutions, features[], benefits[], process[{...}], technology_stack[], deliverables[], related_industries[], cover_image, is_published, order |
| **Case Studies** `/case-studies` | admin, marketing, project_manager | `project_id`, `is_published` | title, client_name, industry | title*, slug, project_id, client_name, industry, problem, solution, implementation, result, roi, customer_feedback, download_url, cover_image, is_published |
| **Testimonials** `/testimonials` | admin, marketing, sales | `client_id`, `is_published` | author_name, company_name | client_id, author_name*, author_title, company_name, avatar, rating, content*, is_published |
| **Downloads** `/downloads` | admin, marketing | `category`, `is_published` | title, category | title*, description, file_url*, file_type, category, requires_lead, is_published |
| **Events** `/events` | admin, marketing | `is_virtual`, `is_published` | title, location | title*, slug, description, cover_image, location, start_date* (datetime), end_date, is_virtual, registration_url, is_published |
| **Industries** `/industries` | admin, marketing | `is_published` | name | name*, slug, icon, description, cover_image, is_published |
| **Technologies** `/technologies` | admin, marketing | `category` | name | name*, category (default `other`), logo, description |
| **Awards** `/awards` | admin, marketing | `year`, `is_published` | title, issued_by | title*, issued_by, year, image, description, is_published |
| **FAQs** `/faqs` | admin, marketing, support | `category`, `is_published` | question | question*, answer*, category (default `general`), order, is_published |
| **Gallery** `/gallery` | admin, marketing | `project_id`, `type`, `is_published` | title, album_name | title, image_url*, type (default `image`), project_id, album_name, is_published |
| **Portfolio** `/portfolio` | admin, marketing | `category`, `is_featured` | title, category | title*, slug, category, thumbnail, description, live_url, project_id, is_featured, order |
| **Partners** `/partners` | admin, marketing | `type`, `is_published` | name | name*, logo, website, type (default `technology_partner`), is_published |
| **Categories** `/categories` | admin, marketing | `type` | name | name*, slug, type (default `blog`) |
| **Products** `/products` | admin, marketing | `is_published` | name, tagline | name*, slug, tagline, description, features[], benefits[], pricing_tiers[{...}], technology_stack[], use_cases[], cover_image, icon, is_published, order |
| **Resources** `/resources` | admin, marketing | `resource_type`, `is_published` | title, description | title*, slug, resource_type (default `guide`), description, file_url, cover_image, is_published |
| **Solutions** `/solutions` | admin, marketing | `is_published` | name, overview | name*, slug, icon, overview, problem_statement, approach[], outcomes[], related_industries[], related_services[], cover_image, is_published, order |

**Out shape note:** every `Out` adds `id`, `created_at`, `updated_at`. Slugs are auto-generated from the name/title when omitted (`slugify`). Resources/Downloads expose a server-maintained `download_count`. Products/Solutions/Resources expose `order`.

---

## 13. Tickets (internal support) — `app/routers/ticket.py`

Router-level auth: `roles(admin, support)`.

### GET `/tickets` · roles(admin, support)
**Query filters:** `status`, `priority`, `assigned_to`, `client_id` · searchable: `subject`, `ticket_number`.
**Response:** `data` = array of `TicketOut`, with `meta`.

### GET `/tickets/{ticket_id}` · roles(admin, support)
**Response:** `data` = `TicketOut` (with `replies` loaded — see `TicketReplyOut`).

### PATCH `/tickets/{ticket_id}` · roles(admin, support)
**Request (TicketUpdate):** `status`, `priority`, `assigned_to` (all optional).
**Response:** `data` = `TicketOut`.

### POST `/tickets/{ticket_id}/replies` · roles(admin, support) · 201
**Request (TicketReplyCreate):** `message` (req), `attachment_url?`.
**Response:** `data` = `TicketReplyOut`: `{ id, ticket_id, user_id, message, attachment_url, ... }`.

---

## 14. Notifications — `app/routers/notification.py`

Router-level auth: `get_current_user`.

### GET `/notifications` · auth
Latest 50 notifications for the current user.
**Response:** `data` = array of `NotificationOut`: `{ id, title, message, type, link, is_read, ... }`.

### PATCH `/notifications/{notification_id}/read` · auth
Marks the notification read (ownership-scoped).
**Response:** `data = null`, message `"Marked as read"`.

### PATCH `/notifications/read-all` · auth
Marks all of the user's unread notifications as read.
**Response:** `data = null`, message `"All notifications marked as read"`.

### POST `/notifications` · roles(admin, hr, marketing) · 201
**Request (NotificationCreate):** `title` (req), `message?`, `type` (default `info`), `link?`, `user_id?` **or** `roles[]?` (at least one required — `400` otherwise).
Sends to the given user and/or all users with the given roles.
**Response:** `data = null`, message `"Notification sent"`.

---

## 15. Media — `app/routers/media.py`

Router-level auth: `roles(admin, marketing, hr)`.

### GET `/media` · roles(admin, marketing, hr)
**Query filters:** `folder`, `mime_type`. **Response:** `data` = array of `MediaOut`: `{ id, file_name, url, mime_type, size_bytes, uploaded_by, folder, ... }`, with `meta`.

### POST `/media/upload` · roles(admin, marketing, hr) · 201
**Multipart/form-data:** `files` (list of files, req), `folder` (form, default `"misc"`).
Uploads one or more files and creates Media records.
**Response:** `data` = array of `MediaOut`, message `"Files uploaded successfully"`.

### DELETE `/media/{media_id}` · roles(admin, marketing, hr)
**Response:** `data = null`, message `"Media deleted"`.

---

## 16. Audit Logs — `app/routers/audit_log.py`

Router-level auth: `roles(admin)`.

### GET `/audit-logs` · roles(admin)
**Query filters:** `user_id`, `action`, `entity_type`.
**Response:** `data` = array of `AuditLogOut`: `{ id, user_id, action, entity_type, entity_id, ip_address, user_agent, log_metadata, ... }`, with `meta`.

---

## 17. Dashboard — `app/routers/dashboard.py`

Router-level auth: `roles(admin, project_manager, finance, sales)`.

### GET `/dashboard/overview`
**Response:** `data` (all counts):
```json
{
  "total_employees": 0, "total_clients": 0, "total_projects": 0, "active_projects": 0,
  "open_tasks": 0, "total_revenue": 0.0, "open_tickets": 0,
  "new_applications": 0, "unresolved_contacts": 0, "published_blogs": 0
}
```

### GET `/dashboard/projects/status-breakdown`
**Response:** `data` = `[{ "status": "in_progress", "count": 5 }, ...]` grouped by project status.

---

## 18. Access Control (Roles & Permissions) — `app/routers/role.py`

Router-level auth: `roles(admin)`.

### Roles · `/access-control/roles`
Factory CRUD (public_read=false ⇒ all endpoints admin-only).
| Method | Path | Request body | Response data |
|---|---|---|---|
| GET | `/access-control/roles` | — | array of `RoleOut` + meta |
| GET | `/access-control/roles/{item_id}` | — | `RoleOut` |
| POST | `/access-control/roles` · 201 | `{ name*, slug*, description? }` | `RoleOut` |
| PUT | `/access-control/roles/{item_id}` | `{ name?, description? }` | `RoleOut` |
| DELETE | `/access-control/roles/{item_id}` | — | null |

`RoleOut`: `{ id, name, slug, description, is_system, ... }` (searchable: name).

### Permissions · `/access-control/permissions`
Same CRUD shape.
| Method | Path | Request body | Response data |
|---|---|---|---|
| GET | `/access-control/permissions` | — | array of `PermissionOut` + meta (filter: `module`) |
| GET | `/access-control/permissions/{item_id}` | — | `PermissionOut` |
| POST | `/access-control/permissions` · 201 | `{ name*, module*, action*, description? }` | `PermissionOut` |
| PUT | `/access-control/permissions/{item_id}` | `{ module?, action?, description? }` | `PermissionOut` |
| DELETE | `/access-control/permissions/{item_id}` | — | null |

`PermissionOut`: `{ id, name, module, action, description, ... }`.

---

## 19. Training — `app/routers/training.py`

### GET `/trainings/courses` · public
Shows only `is_published=true`.
**Response:** `data` = array of `CourseOut`: `{ id, title, slug, description, category, duration_hours, cover_image, is_published, ... }`, with `meta`.

### GET `/trainings/courses/{course_id}` · public
**Response:** `data` = `CourseOut`. *(Not currently consumed by the frontend.)*

### POST `/trainings/enroll` · auth · 201
**Query/body:** `course_id` (uuid) passed as a **query parameter** (`?course_id=...`).
Enrolls the current user's employee profile. `404` if no employee profile; `409` if already enrolled.
**Response:** `data` = `TrainingEnrollmentOut`: `{ id, employee_id, course_id, status, enrolled_at, completed_at, ... }`, message `"Enrolled successfully"`.

### GET `/trainings/my-enrollments` · auth
**Response:** `data` = array of `TrainingEnrollmentOut` (with `course` eagerly loaded).

---

## 20. Analytics — `app/routers/analytics.py`

### GET `/analytics/summary` · roles(admin, marketing)
**Response:** `data`:
```json
{
  "total_views": 0,
  "unique_paths": 0,
  "top_pages": [{ "path": "/", "count": 0 }, ...]   // top 20
}
```
`500` if the analytics table is unavailable.

---

## 21. Reports — `app/routers/reports.py`

Router-level auth: `roles(admin, finance)`.

### GET `/reports` · roles(admin, finance)
**Query filters:** `report_type`. **Response:** `data` = array of `ReportOut`: `{ id, title, report_type, period, generated_by, file_url, size_bytes, summary, ... }`, with `meta`.

### POST `/reports/generate` · roles(admin, finance) · 201
**Request (ReportGenerate):** `title` (req, non-empty), `report_type` (req, non-empty), `period` (req, non-empty), `summary?`.
`400` if any required field is empty. Records `generated_by` from token.
**Response:** `data` = `ReportOut`, message `"Report generated"`.

### DELETE `/reports/{report_id}` · roles(admin, finance)
**Response:** `data = null`, message `"Report deleted"`.

---

## 22. Sales CRM — `app/routers/leads.py`, `proposals.py`, `contracts.py`

### Leads · `/leads`
Router-level auth: `roles(sales, marketing, admin, project_manager)`.

| Method | Path | Auth | Request | Response |
|---|---|---|---|---|
| GET | `/leads` | roles | filters `status`, `source`, `owner_id` (non-sales only) | array of `LeadOut` + meta. **Sales users are auto-scoped to their own leads.** |
| GET | `/leads/{lead_id}` | roles | — | `LeadOut` |
| POST | `/leads` | roles(sales, marketing, admin) · 201 | `LeadCreate` | `LeadOut`. Sends a notification to the assigned owner if different from creator |
| PATCH | `/leads/{lead_id}` | roles(sales, admin) | `LeadUpdate` | `LeadOut`. Notifies new owner on reassignment |
| DELETE | `/leads/{lead_id}` | roles(admin) | — | null, message `"Lead removed"` |

**LeadCreate fields:** `company?`, `contact_name*`, `email*`, `phone?`, `source` (default `other`), `estimated_value?`, `notes?`, `contact_submission_id?`, `owner_id?` (defaults to creator for sales).
**LeadOut:** `{ id, contact_submission_id, company, contact_name, email, phone, source, status, estimated_value, notes, owner_id, converted_client_id, ... }`.

### Proposals · `/proposals`
Router-level auth: `roles(sales, admin)`.

| Method | Path | Request | Response / side effects |
|---|---|---|---|
| GET | `/proposals` | filters `status`, `lead_id` | array of `ProposalOut` + meta |
| POST | `/proposals` · 201 | `ProposalCreate`: `lead_id*`, `scope_summary*`, `price*`, `currency` (default `USD`), `file_url?` | `ProposalOut`, status `draft`, `created_by` from token |
| POST | `/proposals/{proposal_id}/send` | — | Sets status `sent`, sets `sent_at`, lead → `proposal_sent`. `400` unless draft. If `price > 50,000`, notifies finance+admin |
| POST | `/proposals/{proposal_id}/accept` | — | status `accepted`, lead → `proposal_approved`. `400` unless sent/viewed |
| POST | `/proposals/{proposal_id}/reject` | — | status `rejected`. `400` unless sent/viewed |

**ProposalOut:** `{ id, lead_id, version, scope_summary, price, currency, status, file_url, sent_at, viewed_at, created_by, ... }`.

### Contracts · `/contracts`
Router-level auth: `roles(sales, admin)`.

| Method | Path | Request | Response / side effects |
|---|---|---|---|
| GET | `/contracts` | filters `status`, `proposal_id` | array of `ContractOut` + meta |
| POST | `/contracts` · 201 | `ContractCreate`: `proposal_id*`, `document_url?` | `ContractOut`. `404` if proposal missing; `400` if proposal not `accepted` |
| POST | `/contracts/{contract_id}/sign` | `ContractSign`: `client_signed` (true), `company_signed` (true), `provision_client_account` (true) | `ContractOut`. Records signature timestamps; when both sides signed → status `signed`, lead → `converted`, provisions a client account (+ welcome email), notifies PM/admin |

**ContractOut:** `{ id, proposal_id, document_url, status, signed_by_client_at, signed_by_company_at, ... }`.

---

## 23. Departments — `app/routers/department.py`

Factory CRUD with `public_read=false` — **every endpoint admin-only (super_admin for writes)**.

| Method | Path | Auth | Request | Response |
|---|---|---|---|---|
| GET | `/departments` | auth | filters none | array of `DepartmentOut` + meta |
| GET | `/departments/{item_id}` | auth | — | `DepartmentOut` |
| POST | `/departments` · 201 | roles(super_admin) | `{ name*, description?, head_employee_id? }` | `DepartmentOut` |
| PUT | `/departments/{item_id}` | roles(super_admin) | same fields optional | `DepartmentOut` |
| DELETE | `/departments/{item_id}` | roles(super_admin) | — | null |

`DepartmentOut`: `{ id, name, description, head_employee_id, ... }` (searchable: name).

---

## 24. Endpoint Matrix (summary of all 198)

| # | Method | Path | Auth |
|---|---|---|---|
| 1 | POST | `/auth/register` | public |
| 2 | POST | `/auth/login` | public |
| 3 | POST | `/auth/logout` | public |
| 4 | GET | `/auth/me` | auth |
| 5–10 | GET/POST/PUT/PATCH/DELETE | `/users` (+ `/{user_id}`, `/deactivate`) | roles(admin, hr) |
| 11–12 | GET/POST | `/users/{user_id}/export`, `/anonymize` | roles(super_admin) |
| 13 | GET | `/stats` | public |
| 14–30 | GET/POST/PATCH | `/employees/me/*` (profile, attendance×3, leaves×2, timesheets×2, payslips, documents, performance-reviews) | auth |
| 31–34 | GET/PATCH | `/employees/leaves`, `/leaves/{id}/approve`, `/timesheets`, `/timesheets/{id}/approve` | roles(admin, hr, pm) |
| 35–36 | GET/POST | `/employees` | roles(admin, hr, pm) / (admin, hr) |
| 37–49 | GET/POST | `/clients/me/*` (profile, projects, invoices, tickets×2, payments, meetings, files×2, reports×2) | auth + role-gated posts |
| 50–51 | GET/POST | `/clients` | roles(admin, sales, pm, finance) / (admin, sales) |
| 52–57 | GET/POST/PUT/PATCH/DELETE | `/projects` (+ `/{identifier}`, `/{project_id}/team`) | optional / roles |
| 58–60 | GET/POST/PATCH | `/tasks`, `/{task_id}/status` | auth / roles |
| 61–65 | GET/POST/PUT/POST | `/finance/invoices`, `/{invoice_id}`, `/{invoice_id}/payments` | roles(admin, finance) |
| 66–70 | GET/POST/POST/GET/PATCH | `/careers`, `/{career_id}/apply`, `/admin/applications`, `/admin/applications/{id}/status` | public / roles(admin, hr) |
| 71–72 | POST/GET | `/contact` | public / roles(admin, sales, support) |
| 73–76 | GET/POST/PUT/DELETE | `/blogs` (+ `/{blog_id}`) | optional / roles(admin, marketing) |
| 77–156 | ×5 each | `/services`, `/case-studies`, `/testimonials`, `/downloads`, `/events`, `/industries`, `/technologies`, `/awards`, `/faqs`, `/gallery`, `/portfolio`, `/partners`, `/categories`, `/products`, `/resources`, `/solutions` | public read / roles write |
| 157–160 | GET/GET/PATCH/POST | `/tickets`, `/{id}`, `/{id}/replies` | roles(admin, support) |
| 161–164 | GET/PATCH/PATCH/POST | `/notifications`, `/{id}/read`, `/read-all` | auth / roles(admin, hr, marketing) |
| 165–167 | GET/POST/DELETE | `/media`, `/media/upload`, `/media/{id}` | roles(admin, marketing, hr) |
| 168 | GET | `/audit-logs` | roles(admin) |
| 169–170 | GET | `/dashboard/overview`, `/dashboard/projects/status-breakdown` | roles(admin, pm, finance, sales) |
| 171–180 | ×5 each | `/access-control/roles`, `/access-control/permissions` | roles(admin) |
| 181–184 | GET/GET/POST/GET | `/trainings/courses`, `/courses/{id}`, `/enroll`, `/my-enrollments` | public / public / auth / auth |
| 185 | GET | `/analytics/summary` | roles(admin, marketing) |
| 186–188 | GET/POST/DELETE | `/reports`, `/reports/generate`, `/reports/{id}` | roles(admin, finance) |
| 189–193 | GET/GET/POST/PATCH/DELETE | `/leads` (+ `/{id}`) | roles(sales, marketing, admin, pm) |
| 194–198 | GET/POST/POST/POST/POST | `/proposals`, `/{id}/send`, `/{id}/accept`, `/{id}/reject` | roles(sales, admin) |
| 199–201 | GET/POST/POST | `/contracts`, `/{id}/sign` | roles(sales, admin) |
| 202–206 | ×5 | `/departments` | auth read / roles(super_admin) write |

*(Counts by row in this matrix sum to 198 endpoints.)*

---

## 25. Notes & Caveats

- **Auth header everywhere** except the endpoints marked `public`: `Authorization: Bearer <supabase_jwt>`.
- **`/trainings/courses/{course_id}`** is implemented but not yet consumed by the frontend — keep for contract stability.
- **Static routes before dynamic ones:** `/employees/leaves` and `/employees/timesheets` are registered before `/{employee_id}` so FastAPI does not mis-route them.
- **Role escalation guard:** only a `super_admin` can create/update users with `admin`/`super_admin` roles (`routers/users.py`).
- **Payment status flip:** invoice auto-marks `paid` when completed payments reach `total_amount`.
- **Discount threshold:** proposals priced above `50,000` trigger a finance/admin notification on send.
- **Contract signing** can auto-provision a client Supabase account and send a welcome/reset email.
- The **OpenAPI schema** is also served live by the app at `/docs` (Swagger UI) and `/openapi.json`.
