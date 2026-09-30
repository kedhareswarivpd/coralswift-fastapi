# Module: Employees / HR

**Purpose**: employee profiles, attendance, leave, timesheets, payslips,
documents, performance reviews, and training/course enrollment.

**Users**: every authenticated staff role (auto-provisioned an `Employee`
profile on first `/employees/me/*` call — see Business Rules) for
self-service; `admin`/`hr` for management; `admin`/`hr`/`project_manager`
for approvals.

## Permissions

| Action | Role |
|---|---|
| Own profile/attendance/leave/timesheet/payslip/documents/reviews | any authenticated user with an employee profile |
| List/create employees, approve leave/timesheets | `admin`, `hr` (list/approve also open to `project_manager`) |
| Department writes | `super_admin` only (reads need auth, no extra role) |
| Create/manage training courses | `admin`, `hr` |
| Enroll in a course | any authenticated user |

## Data model

`Employee` (user_id unique, employee_code unique, department_id,
designation, employment_type, status, reporting_manager_id self-FK,
salary), `Department`, `Attendance` (unique per employee+date),
`Leave` (type, status default `pending`, approved_by), `Timesheet`
(project_id, task_id, hours, status default `draft`), `Payslip` (unique
per employee+month+year), `EmployeeDocument`, `PerformanceReview`,
`Course`/`TrainingEnrollment`.

## Endpoints

```
GET    /employees/me/profile
GET    /employees/me/attendance/today
POST   /employees/me/attendance/check-in
POST   /employees/me/attendance/check-out
GET    /employees/me/leaves            POST /employees/me/leaves
GET    /employees/me/timesheets        POST /employees/me/timesheets
GET    /employees/me/payslips
GET    /employees/me/documents
GET    /employees/me/performance-reviews

GET    /employees                       (admin, hr, project_manager)
POST   /employees                       (admin, hr — upserts by user_id)
GET    /employees/leaves                PATCH /employees/leaves/{id}/approve
GET    /employees/timesheets            PATCH /employees/timesheets/{id}/approve

GET/POST/PUT/DELETE /departments        (writes: super_admin only)

GET    /trainings/courses               POST /trainings, /trainings/courses  (admin, hr)
POST   /trainings/enroll?course_id=     GET /trainings/my-enrollments
GET    /trainings/enrollments           (admin, hr)
```

## Business rules

- **Auto-provisioning**: any authenticated user without an `Employee` row
  gets one auto-created on first `/employees/me/*` call, if their
  `user.role` is one of the staff roles; otherwise `404`.
- **Salary redaction**: `GET /employees` strips `salary` from the response
  unless the caller is `admin`/`super_admin`/`hr`.
- **`POST /employees` upserts by `user_id`** rather than erroring on a
  duplicate — a second call updates the existing profile (still returns
  `201` with "Employee profile updated successfully").
- **Leave type aliasing**: loose input strings ("annual", "personal",
  "sick") are mapped onto the real `LeaveType` enum before validation;
  unrecognized values default to `casual`.
- **Check-out requires a same-day check-in** — no floating check-out
  without a matching check-in record.

## Events

None. No email or in-app notification fires on leave approval, timesheet
approval, course enrollment, or new-employee creation — a real, stated gap.

## Dependencies

None upward. `PerformanceReview.reviewer_id` and `Timesheet.project_id`/
`task_id` reference [projects](../projects/README.md).

## Failure scenarios

- Calling `/employees/me/*` as a `client`/`guest`-role user →
  `404 Employee profile not found` (correct: they were never meant to have
  one).
- Approving a leave/timesheet that doesn't exist → standard `404` from
  `CRUDBase.get()`.

## Known gaps

- No dedicated `PerformanceReview` create/update endpoint — the schema
  exists, but reviews are currently only readable via
  `GET /employees/me/performance-reviews`, never writable through this API.
- `Department.head_employee_id` is a plain UUID column, not an actual
  foreign key.
- **RESOLVED**: training-enrollment concurrency race — see
  [database/concurrency.md](../../database/concurrency.md).
- **RESOLVED — real horizontal-privilege-escalation finding from an
  authorization audit**: `GET /employees/leaves`/`timesheets` and
  `PATCH .../approve` previously had zero team scoping for the
  `project_manager` role — any PM could view/approve any employee's leave
  or timesheet company-wide, despite this file's own comment stating "PM
  reviews their team's." Fixed with `_pm_team_employee_ids()` (team =
  employees whose `reporting_manager_id` is the PM's own `Employee.id`);
  `admin`/`hr` are unaffected. See
  [security/authorization.md](../../security/authorization.md).
- **RESOLVED — mass-assignment finding**: `POST /employees`'s
  update-in-place branch (re-POSTing an existing `user_id`) applied every
  `EmployeeCreate` field including the identity fields `user_id`/
  `employee_code`, which should never change on an existing row — now
  excluded from that branch.
