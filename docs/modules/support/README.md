# Module: Support Tickets & Meetings

**Purpose**: support-ticket handling for clients/partners, and internal
meeting scheduling.

**Users**: `admin`/`support` for the entire ticket router;
`admin`/`sales`/`project_manager` for meetings.

## Tickets

`Ticket` (ticket_number unique, client_id/partner_account_id nullable
FKs — one or the other, priority, status, assigned_to), `TicketReply`
(ticket_id CASCADE, user_id, message).

**Tickets are created from two other modules, not from `ticket.py`
itself** — `POST /clients/me/tickets` and
`POST /partner-accounts/me/tickets` (see
[clients-partners](../clients-partners/README.md)). `ticket.py` only
manages tickets after creation:

```
GET   /tickets                       (filters: status, priority, assigned_to, client_id, partner_account_id)
GET   /tickets/{id}                  (eager-loads replies)
PATCH /tickets/{id}
POST  /tickets/{id}/replies          (also requires authentication — creates reply as current_user)
```

`TicketStatus`: `open, in_progress, resolved, closed`.
`TicketPriority`: `low, medium, high, critical`.

**Business rules**: none enforced beyond the router-level role gate — no
status-transition guard exists (a `closed` ticket can be patched back to
`open`, a reply can be added to a closed ticket, nothing prevents either).

**Events**: none — no notification to the client/partner or the assignee
on reply or reassignment.

## Meetings

`Meeting` (project_id/client_id nullable, scheduled_at, organizer_id,
status). `MeetingStatus`: `scheduled, completed, cancelled`.

```
GET/POST/PATCH/DELETE /meetings      (admin, sales, project_manager)
```

**RESOLVED — a real naming/behavior mismatch**: `DELETE /meetings/{id}` was
named/responded as "cancel" but actually called the generic
`CRUDBase.delete()` — a hard row delete, not a status change. **Fixed**: it
now sets `status = "cancelled"` via `crud.update()`, preserving the row.
Live-drill verified: a cancelled meeting is still retrievable via
`GET /meetings/{id}` afterward, with `status: "cancelled"`.

**Events**: none — no calendar invite, no reminder, no cancellation
notification.

## Dependencies

[Clients/Partners](../clients-partners/README.md) (ticket creation),
[Projects](../projects/README.md) (meetings).

## Known gaps (code-confirmed)

- No ticket status-transition validation.
- **Checked via an authorization audit, deliberately not changed**: any
  `admin`/`support` staff can view/reply to *any* ticket regardless of
  which client/partner it belongs to — but this router's own code shape
  (staff-only, no client/partner role can reach it at all) reads as
  intentional shared-staff-visibility design (support needs to see the
  whole queue), not a bug. `meetings.py` has the identical pattern (any
  `sales`/`project_manager` can see/modify any meeting regardless of
  client/project) but with no code comment confirming intent one way or
  the other — flagged for explicit product confirmation rather than
  assumed safe by analogy to tickets.
