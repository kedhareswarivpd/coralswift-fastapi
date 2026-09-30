# Module: CRM Sales Pipeline (Leads → Proposals → Contracts)

**Purpose**: the full sales pipeline from an inbound lead through a signed
contract, including automatic client-account provisioning on signature.

**Users**: `sales`, `marketing`, `admin`, `project_manager` (varies by
endpoint — see below); a `sales` user only sees/can only act on leads they
own.

## Data model & state machines

- `Lead`: `status` (`LeadStatus`: `new → contacted → requirement_gathering →
  proposal_sent → proposal_approved → converted`, or `disqualified` at any
  point), `source` (`LeadSource`), `owner_id`→users, `converted_client_id`→
  clients (set only on conversion).
- `Proposal`: `lead_id`, `version`, `price`, `status` (`ProposalStatus`:
  `draft → sent → {viewed →} accepted|rejected`).
- `Contract`: `proposal_id` (unique — one contract per proposal), `status`
  (`ContractStatus`: `pending → signed`, or `void`),
  `signed_by_client_at`/`signed_by_company_at`.

## Endpoints

```
GET/POST/PATCH/DELETE /leads              (sales/marketing/admin/project_manager per action)
GET/POST /proposals
POST /proposals/{id}/send
POST /proposals/{id}/accept
POST /proposals/{id}/reject
GET/POST /contracts
POST /contracts/{id}/sign
```

## Business rules — status guards

- `send_proposal`: only from `draft`, else `400`. Also pushes the parent
  lead → `proposal_sent`. If `price > 50,000` (`DISCOUNT_APPROVAL_THRESHOLD`),
  notifies `finance`+`admin` roles.
- `accept_proposal`/`reject_proposal`: only from `sent` or `viewed`, else
  `400`. Accept also pushes the lead → `proposal_approved`.
- `create_contract`: requires the source proposal to be `accepted`, else
  `400`. Idempotent — a second `POST` for the same `proposal_id` returns
  the existing contract (`200`, not a duplicate).
- `sign_contract`: no-op if already `signed`. Sets whichever of
  `signed_by_client_at`/`signed_by_company_at` the payload specifies —
  **only transitions to `signed` once both are set**, a partial signature
  stays `pending`.

## The account-provisioning-on-sign flow (the module's centerpiece)

Fires only once **both** signatures are present, and only if the lead
isn't already `converted` (guards against double-provisioning on a repeat
sign call):

1. Find-or-create a `User` by the lead's email — `role="client"`,
   pre-verified, a random unusable password (never a plaintext one this
   app chose).
2. If newly created: issue a real password-reset token (same mechanism as
   `POST /auth/forgot-password`) and email it via
   `send_password_reset_email`, then separately `send_welcome_email`.
   Both wrapped in try/except that only logs — provisioning must not
   un-sign an already-signed contract.
3. Find-or-create the matching `Client` record, resolving
   `account_manager_id` from the lead's `owner_id` (a `User`) to the
   matching `Employee.id`.
4. Update the lead: `status → converted`, `converted_client_id` set.
5. Notify `project_manager`+`admin` roles: "New client ready for project
   kickoff" — this is a manual trigger for someone to actually create the
   onboarding project; there's no automatic proposal→project creation.

See [database/transactions.md](../../database/transactions.md) for why
provisioning failures don't roll back the signature itself, and
[decisions/](../../decisions/) for related reasoning.

## Events

`notify_user` (lead assignment/reassignment), `notify_roles` (proposal
threshold alert, contract kickoff alert), `send_password_reset_email` +
`send_welcome_email` (new client on contract sign).

## Dependencies

[Employees](../employees/README.md) (account-manager resolution),
[Clients](../clients-partners/README.md) (the provisioned account),
[Authentication](../auth/README.md) (the provisioned user's credentials).

## Known gaps

- **RESOLVED — real IDOR found via an authorization audit**: `GET /leads/{id}`
  already blocked a `sales` user from reading a lead they don't own, but
  `PATCH /leads/{id}` had no matching check at all — any `sales` user could
  modify (including reassigning `owner_id` to themselves) a lead owned by a
  different salesperson. Fixed with the identical ownership check `GET`
  already used. Live-drill-verified against the real database. See
  [security/authorization.md](../../security/authorization.md).
- Otherwise, no explicit TODO in the code — this module is unusually
  well-commented about its own past bugs (the `200`-vs-`201`
  manual-status-override pattern, documented directly in
  `database/transactions.md`) rather than carrying open ones.
