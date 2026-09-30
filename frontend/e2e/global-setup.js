import { request } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { CLIENT_USER, CLIENT_B_USER } from './testUsers.js';

// The primary auth suite (Suite 2/3/5/9 in auth.spec.js) deliberately drives
// real logins through the UI form on every test, per the master brief's own
// instruction not to bypass the actual login flow for that suite. But the
// backend's login endpoint is correctly rate-limited (10/minute per IP —
// see backend/app/routers/auth.py), and every test file in this suite runs
// against the same IP; a real login per downstream test (Refresh, CSRF) blew
// through that limit. This global setup performs exactly ONE real login via
// the API, saves the resulting session cookies as Playwright storageState,
// and downstream tests that don't need to exercise the login form itself
// reuse that state instead of logging in again — the efficient-fixture half
// of "real login tests AND authenticated-state fixtures."
const AUTH_DIR = path.join(process.cwd(), 'e2e', '.auth');

export default async function globalSetup(config) {
  const baseURL = config.projects[0].use.baseURL;
  fs.mkdirSync(AUTH_DIR, { recursive: true });

  await loginAndSave(baseURL, CLIENT_USER, 'client.json');
  await loginAndSave(baseURL, CLIENT_B_USER, 'clientB.json');
}

async function loginAndSave(baseURL, user, filename) {
  const context = await request.newContext({ baseURL });
  const res = await context.post('/api/v1/auth/login', {
    data: { email: user.email, password: user.password },
  });
  if (!res.ok()) {
    throw new Error(`global-setup: login failed for ${user.email} (${res.status()}) — is the stack running and is the account seeded?`);
  }
  await context.storageState({ path: path.join(AUTH_DIR, filename) });
  await context.dispose();
}
