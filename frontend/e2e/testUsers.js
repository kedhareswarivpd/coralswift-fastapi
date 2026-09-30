// Real accounts on the local docker-compose stack this suite targets — not
// mocked. The client account is created fresh by global setup (self-serve
// register, exactly the path a real user takes); the admin/employee accounts
// are pre-seeded (app/seeders/seed.py) with their passwords reset to a known
// value for this environment only (see the session notes — never do this
// against a shared/staging/production database).
export const CLIENT_USER = {
  name: 'E2E Test Client',
  email: 'e2e.client.playwright@coralswifttech.com',
  password: 'E2ETestPass123!',
};

// A second, independent client account — used only by data-isolation.spec.js
// to prove Client A's billing/project data is never visible to Client B.
export const CLIENT_B_USER = {
  name: 'E2E Test Client B',
  email: 'e2e.client.b.playwright@coralswifttech.com',
  password: 'E2ETestPassB123!',
};

export const ADMIN_USER = {
  email: 'admin@coralswifttech.com',
  password: 'E2EAdminPass123!',
};

export const EMPLOYEE_USER = {
  email: 'john.doe@coralswifttech.com',
  password: 'E2EAdminPass123!',
};
