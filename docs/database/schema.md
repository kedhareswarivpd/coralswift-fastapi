# Schema — Table Groups

Grounded in `app/models/__init__.py`'s actual import list (the single place
every model is registered). Grouped by what owns them, not alphabetically.

## Core auth (owned by this app, no external identity provider)
`users`, `user_sessions`, `password_reset_tokens`, `email_verification_tokens`,
`mfa_backup_codes`, `mfa_challenges`, `oauth_accounts`. See
[security/authentication.md](../security/authentication.md) and
[decisions/ADR-001](../decisions/ADR-001-self-owned-authentication.md).

## Access control
`roles`, `permissions` (+ `role_permissions` association). **Note**: these
tables are manageable via `/access-control/roles`/`/access-control/permissions`
but are **not actually consulted** by the real authorization mechanism
(`require_roles()` checks `users.role` directly) — see
[security/authorization.md](../security/authorization.md) for the full
explanation of this gap.

## HR / organization
`departments`, `employees`, `attendances`, `leaves`, `timesheets`, `payslips`,
`employee_documents`, `performance_reviews`, `courses`, `training_enrollments`.
See [modules/employees](../modules/employees/README.md).

## Business / client-facing
`clients`, `client_files`, `client_reports`, `partner_accounts`, `partner_files`,
`projects`, `tasks` (+ `project_members` association to `employees`),
`invoices`, `payments`. See [modules/clients-partners](../modules/clients-partners/README.md),
[modules/projects](../modules/projects/README.md), [modules/finance](../modules/finance/README.md).

## CRM / sales pipeline
`leads`, `proposals`, `contracts`. See [modules/crm-sales](../modules/crm-sales/README.md).

## CMS / content
`blogs`, `categories`, `comments`, `services`, `case_studies`, `testimonials`,
`downloads`, `careers`, `applications`, `events`, `industries`, `technologies`,
`products`, `awards`, `faqs`, `galleries`, `portfolios`, `partners` (public CMS
partner logos — distinct from `partner_accounts`, the Partner Portal's
tenant table), `resources`, `seo_metadata`, `page_contents`, `solutions`.
See [modules/cms](../modules/cms/README.md), [modules/careers](../modules/careers/README.md).

## Ops / support
`tickets`, `ticket_replies`, `meetings`, `notifications`, `audit_logs`,
`settings`, `media`, `contact_submissions`. See
[modules/support](../modules/support/README.md), [modules/admin-ops](../modules/admin-ops/README.md).

## Analytics
`newsletter_subscribers`, `page_views`, `reports`.

## Every table, regardless of group, gets (from `Base`)
`id` (UUID, app-generated), `created_at`, `updated_at` (both server-defaulted),
`deleted_at` (nullable — see [soft-delete.md](soft-delete.md) for how
inconsistently this is actually used across tables).
