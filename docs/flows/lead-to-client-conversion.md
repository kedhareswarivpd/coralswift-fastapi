# Flow: Lead → Proposal → Contract → Client Account

The one multi-step, multi-module business flow in this backend with real
orchestration logic, live-drilled end-to-end against the running stack
(see `status.md`).

```
Sales/Marketing creates a Lead (status: new)
    │
    ▼
Lead progresses: contacted → requirement_gathering  (manual PATCH, staff-driven)
    │
    ▼
POST /proposals                       Proposal created (status: draft)
    │
    ▼
POST /proposals/{id}/send             Proposal → sent
                                       Lead → proposal_sent
                                       (if price > 50,000: notify finance+admin)
    │
    ▼
POST /proposals/{id}/accept           Proposal → accepted
   (or /reject → Proposal → rejected, flow ends here)
                                       Lead → proposal_approved
    │
    ▼
POST /contracts { proposal_id }       Contract created (status: pending)
   (idempotent: repeat call returns the existing contract, 200 not 201)
    │
    ▼
POST /contracts/{id}/sign
   { client_signed: true }            → still pending (only one party signed)
    │
POST /contracts/{id}/sign
   { company_signed: true }           → Contract status: signed
                                         (both signatures now present)
    │
    ▼
   IF payload.provision_client_account AND lead not already converted:
    │
    ├─▶ Find-or-create User by lead.email (role=client, random unusable password)
    ├─▶ IF newly created: send password-reset email + welcome email (best-effort)
    ├─▶ Find-or-create Client record (account_manager_id resolved from lead.owner_id)
    ├─▶ Lead → converted, converted_client_id set
    └─▶ notify project_manager + admin: "New client ready for project kickoff"
```

## Where this flow currently stops (manual hand-off points)

- **Proposal never auto-generates from a lead** — drafting the first
  proposal is a manual `POST /proposals` by a sales/marketing user.
- **Project never auto-creates from a signed contract** — the kickoff
  notification is the entire hand-off; a PM must manually
  `POST /projects` to actually start the engagement.
- **Provisioning failure doesn't un-sign the contract** — see
  [database/transactions.md](../database/transactions.md) for why this is
  a deliberate trade-off, not an oversight.

## Related docs

[modules/crm-sales](../modules/crm-sales/README.md) for the full
endpoint/business-rule reference, [database/transactions.md](../database/transactions.md)
for the idempotency mechanics.
