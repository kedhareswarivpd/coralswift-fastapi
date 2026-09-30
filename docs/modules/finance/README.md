# Module: Finance / Invoicing

**Purpose**: invoice creation and payment recording.

**Users**: `admin`, `finance` — the entire router is gated to these two
roles, no self-service (a client's own read-only invoice view lives in
[clients-partners](../clients-partners/README.md), not here).

## Data model

`Invoice` (invoice_number unique, client_id, project_id nullable, amount,
tax, total_amount, status, currency default INR), `Payment` (invoice_id
CASCADE, amount, method, transaction_ref nullable, status default
`completed`).

- `InvoiceStatus`: `draft, sent, paid, overdue, cancelled`
- `PaymentMethod`: `bank_transfer, card, upi, paypal, cheque, other`
- `PaymentStatus`: `pending, completed, failed, refunded`

## Endpoints

```
GET  /finance/invoices                          (filters: client_id, project_id, status)
GET  /finance/invoices/{invoice_id}
POST /finance/invoices
PUT  /finance/invoices/{invoice_id}
POST /finance/invoices/sweep-overdue            (manual trigger — see Known Gaps)
POST /finance/invoices/{invoice_id}/payments
```

## Business rules

- `invoice_number` auto-generates as `INV-{unix_timestamp}` if not
  supplied; `total_amount = amount + tax` computed server-side.
- **Payment idempotency** (the load-bearing business rule of this module):
  a payment with a `transaction_ref` that's already been recorded for that
  invoice returns the existing payment (`200`, not a duplicate `201`)
  rather than creating a second row. Full mechanism, including the real
  database constraint backing it and the bug this replaced, documented in
  [database/transactions.md](../../database/transactions.md).
- **Auto-transition to `paid`**: after any payment is recorded, all
  `completed` payments for the invoice are summed; once that total meets
  or exceeds `total_amount`, the invoice's status flips to `paid`
  automatically — no manual "mark as paid" action needed.

## Events

None found — no payment-received or invoice-created email/notification.

## Dependencies

[Clients](../clients-partners/README.md) (`client_id`), [Projects](../projects/README.md)
(`project_id`, nullable).

## Known gaps

- **RESOLVED (partially)**: `InvoiceStatus.overdue` previously had no code
  path that ever set it. **Fixed**: `POST /finance/invoices/sweep-overdue`
  (admin/finance) flips any `sent` invoice past its `due_date` to
  `overdue`, following the same manual-trigger pattern as
  `POST /backups/trigger` — someone (or an external cron) must still call
  it, since there's no background-job runner in this app at all (see
  [architecture/background-jobs.md](../../architecture/background-jobs.md)).
  Live-drill verified: a `sent` invoice past due flipped to `overdue` after
  one call; calling it again is a no-op for that invoice.
- No payment-gateway webhook integration — every `Payment` row is entered
  manually via this API, not created automatically by Stripe/Razorpay/etc.
