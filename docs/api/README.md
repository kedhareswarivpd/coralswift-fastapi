# API Documentation

Per-endpoint request/response detail lives with each module, not
duplicated into a separate parallel tree — see `docs/modules/*/README.md`
for the endpoint list, roles, and business rules of each area, and
[CONTACT_BACKEND.md](../CONTACT_BACKEND.md) for the authentication flow
specifically (cookies, CSRF, MFA/OAuth handoffs) with full request/response
examples, since that's the one area with a real frontend consumer that
needs exact wire-format examples.

## Conventions that apply to every endpoint

- **Base URL**: `/api/v1`.
- **Auth**: httpOnly session cookies, not `Authorization: Bearer` — see
  [security/authentication.md](../security/authentication.md).
- **Response envelope**: `{success, status_code, message, data, errors, meta}`
  on every response, success or failure.
- **Pagination**: any list endpoint accepts
  `?page=&limit=&sort=&search=`; `limit` capped at 100 server-side; response
  `meta` carries `{total, page, limit, total_pages}`.
- **Validation errors**: `422` with `{errors: [{field, message}]}` —
  `field` maps directly to the request body path that failed.
- **Idempotency**: only two endpoints in this API have a real idempotency
  contract today — `POST /finance/invoices/{id}/payments` and
  `POST /contracts` — both documented in
  [database/transactions.md](../database/transactions.md). Every other
  `POST` is a normal create with no dedupe-by-key behavior; don't assume
  retrying one is safe unless it's one of those two.
- **Rate limiting**: see [security/rate-limiting.md](../security/rate-limiting.md)
  for the exact per-endpoint limits.

## Interactive reference

`GET /docs` (Swagger UI) and `/redoc` are live on any non-production
deployment (`ENV != production/prod`) — the exact, always-current request/
response schema for every endpoint, generated from the real Pydantic
models. Use this for the field-level ground truth; the module docs are for
*why*, not a hand-maintained schema copy that can drift from the real one.

## Why endpoints aren't documented in a separate `docs/api/<domain>.md` tree

Per `AGENTS.md`'s documentation-ownership principle: a hand-maintained
endpoint-by-endpoint doc tree, kept separately from the module docs that
already state the same endpoints alongside their business rules, would be
duplication that drifts the moment either side is updated without the
other. The module docs already answer "what's the endpoint, who can call
it, what does it actually do" together — splitting "what's the endpoint"
into its own tree with no business-rule context would make it less useful,
not more organized.
