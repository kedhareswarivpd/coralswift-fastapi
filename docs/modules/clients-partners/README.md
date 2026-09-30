# Module: Client Portal & Partner Portal

**Purpose**: self-service portals for clients and partners — profile,
projects, invoices, payments, support tickets, files, reports, meetings.
Built as two structurally-parallel modules (Partner Portal mirrors Client
Portal's shape) rather than one generic "external account" abstraction,
since the two have genuinely different downstream relationships (a client
has projects/invoices; a partner doesn't).

**Users**: `client`/`partner` roles for self-service;
`admin`/`sales`/`project_manager`/`finance` for staff-side management,
varying by endpoint.

## Permissions

| Action | Role |
|---|---|
| Own profile/projects/invoices/tickets/payments/meetings/files/reports (Client) | `client` |
| Own profile/files/tickets (Partner) | `partner` |
| Upload a file/report for a specific client | `admin`, `project_manager` (files) / `admin`, `finance` (reports) |
| Upload a file for a specific partner | `admin`, `sales` |
| List/create clients | `admin`, `sales`, `project_manager`, `finance` (list) / `admin`, `sales` (create) |
| List/create partner accounts | `admin`, `sales` |

## Data model

`Client` (user_id unique, company_name, industry, account_manager_id→
employees), `ClientFile`, `ClientReport`, `PartnerAccount` (user_id unique,
partnership_type, account_manager_id→employees), `PartnerFile`.

## Endpoints

```
GET  /clients/me/profile
GET  /clients/me/projects
GET  /clients/me/invoices
GET  /clients/me/payments
GET  /clients/me/tickets        POST /clients/me/tickets
GET  /clients/me/meetings
GET  /clients/me/files          POST /clients/me/files        (admin, project_manager)
GET  /clients/me/reports        POST /clients/me/reports      (admin, finance)
GET  /clients                   (admin, sales, project_manager, finance)
POST /clients                   (admin, sales)

GET  /partner-accounts/me/profile      PUT /partner-accounts/me/profile
GET  /partner-accounts/me/files        POST /partner-accounts/me/files  (admin, sales)
GET  /partner-accounts/me/tickets      POST /partner-accounts/me/tickets
GET  /partner-accounts                 (admin, sales)
POST /partner-accounts                 (admin, sales)
```

## Business rules

- **Auto-provisioning**: identical pattern to Employees — any authenticated
  user gets a `Client`/`PartnerAccount` record auto-created on first
  `/me/*` call, seeded with `company_name = user.name`.
- **Partner self-edit guard**: `PUT /partner-accounts/me/profile`
  explicitly excludes `account_manager_id` from the editable payload — a
  partner can never reassign their own account manager.
- **Ticket numbers**: both portals generate `ticket_number` as
  `TCK-{unix_timestamp}` on creation.

## Events

None. No email/notification fires on ticket creation, file upload, report
creation, or profile update in either portal.

## Dependencies

[Employees](../employees/README.md) (`account_manager_id`), [Finance](../finance/README.md)
(invoices/payments), [Support](../support/README.md) (tickets — created
here, managed there), [Projects](../projects/README.md).

## Known gaps

- **RESOLVED**: staff-side file/report uploads are now ownership-checked
  (`admin`/`super_admin` bypass; everyone else must be the resource's
  assigned account manager) — see
  [security/authorization.md](../../security/authorization.md).
- No admin-side update/delete endpoint for `Client`/`PartnerAccount` beyond
  the partner's own profile edit.
- `ClientFile.uploaded_by`/`PartnerFile.uploaded_by` are free-text strings,
  not foreign keys to `users`.
