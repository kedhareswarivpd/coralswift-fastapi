import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CLIENT_USER, ADMIN_USER, EMPLOYEE_USER } from './testUsers.js';

const CLIENT_STORAGE_STATE = path.join(path.dirname(fileURLToPath(import.meta.url)), '.auth', 'client.json');

// This suite exercises the real CoralSwift cookie-auth flow described in
// backend/app/core/cookies.py — httpOnly cs_access_token/cs_refresh_token,
// readable cs_csrf_token — against the actual dockerized stack (nginx
// frontend + FastAPI backend + Postgres), not a mocked or dev-proxy origin.
// Login goes through the real form on every test rather than a fixture
// shortcut, per the master brief's "real login tests, not just
// authenticated-state fixtures for the primary auth suite" requirement.

async function login(page, email, password) {
  await page.goto('/login');
  await page.getByPlaceholder('you@coralswifttech.com').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
}

function getCookie(cookies, name) {
  return cookies.find((c) => c.name === name);
}

test.describe('Suite 2 — Login', () => {
  test('shows inline validation for an empty password submit', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('you@coralswifttech.com').fill('someone@coralswifttech.com');
    // Native `required` prevents submission with browser validation, so no
    // navigation happens and we stay on /login.
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('wrong password shows a generic error, not account enumeration detail', async ({ page }) => {
    await login(page, CLIENT_USER.email, 'DefinitelyWrongPassword123!');
    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('correct client credentials log in and land on the Client Portal', async ({ page }) => {
    await login(page, CLIENT_USER.email, CLIENT_USER.password);
    await expect(page).toHaveURL(/\/client/);
    await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
  });

  test('correct admin credentials log in and land on the Admin Panel', async ({ page }) => {
    await login(page, ADMIN_USER.email, ADMIN_USER.password);
    await expect(page).toHaveURL(/\/admin/);
  });

  test('login response sets httpOnly session cookies and never returns tokens in the body', async ({ page, context }) => {
    const responsePromise = page.waitForResponse((res) => res.url().includes('/api/v1/auth/login'));
    await login(page, CLIENT_USER.email, CLIENT_USER.password);
    const response = await responsePromise;
    const body = await response.json();

    expect(body.data.user).toBeTruthy();
    expect(JSON.stringify(body)).not.toMatch(/access_token|refresh_token/);

    const cookies = await context.cookies();
    const access = getCookie(cookies, 'cs_access_token');
    const refresh = getCookie(cookies, 'cs_refresh_token');
    const csrf = getCookie(cookies, 'cs_csrf_token');

    expect(access?.httpOnly).toBe(true);
    expect(refresh?.httpOnly).toBe(true);
    expect(csrf?.httpOnly).toBe(false); // must be JS-readable for the double-submit CSRF header
  });
});

test.describe('Suite 3 — Session restoration', () => {
  // Uses the pre-authenticated fixture rather than a fresh UI login — what's
  // under test here is that reload/state-inspection behavior, not the login
  // form itself, and every browser-context cookie/hydration path is
  // identical either way (see the rate-limit note above Suite 4).
  test.use({ storageState: CLIENT_STORAGE_STATE });

  test('a reloaded browser stays authenticated via GET /auth/me (no client-stored token)', async ({ page }) => {
    await page.goto('/client');
    await expect(page).toHaveURL(/\/client/);

    await page.reload();
    await expect(page).toHaveURL(/\/client/);
    await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
  });

  test('no access/refresh token is ever readable from page JS (localStorage, sessionStorage, or document.cookie)', async ({ page }) => {
    await page.goto('/client');
    await expect(page).toHaveURL(/\/client/);

    const leak = await page.evaluate(() => {
      const haystacks = [
        JSON.stringify(localStorage),
        JSON.stringify(sessionStorage),
        document.cookie, // httpOnly cookies are never exposed here by design
      ].join('\n');
      return /cs_access_token|cs_refresh_token/i.test(haystacks);
    });
    expect(leak).toBe(false);
  });
});

test.describe('Suite 5 — Logout', () => {
  test('logout clears the session and a subsequent protected-page visit redirects to login', async ({ page }) => {
    await login(page, CLIENT_USER.email, CLIENT_USER.password);
    await expect(page).toHaveURL(/\/client/);

    await page.getByRole('button', { name: /sign out/i }).click();
    await expect(page).toHaveURL(/\/login/);

    await page.goto('/client');
    await expect(page).toHaveURL(/\/login/);
  });

  test('logout is rejected by the backend for an already-anonymous request (server enforces it, not just the UI)', async ({ request }) => {
    const res = await request.post('/api/v1/auth/logout');
    expect(res.status()).toBe(401);
  });
});

test.describe('Suite 9 — RBAC / route guarding', () => {
  test('an unauthenticated visitor hitting a portal route is redirected to /login with returnTo', async ({ page }) => {
    await page.goto('/client');
    await expect(page).toHaveURL(/\/login\?returnTo=/);
  });

  test('a logged-in employee cannot reach the Admin Panel', async ({ page }) => {
    await login(page, EMPLOYEE_USER.email, EMPLOYEE_USER.password);
    await expect(page).toHaveURL(/\/(employee|developer|sales|marketing|project-manager|qa|support|finance|hr)/);

    await page.goto('/admin');
    await expect(page).not.toHaveURL(/\/admin$/);
  });

  test.describe('with an authenticated client session', () => {
    test.use({ storageState: CLIENT_STORAGE_STATE });

    test('a logged-in client cannot reach the Admin Panel', async ({ page }) => {
      await page.goto('/client');
      await expect(page).toHaveURL(/\/client/);

      await page.goto('/admin');
      await expect(page).not.toHaveURL(/\/admin$/);
    });

    test('the backend independently rejects a client session on an admin-only endpoint (UI redirect is not the only guard)', async ({ page }) => {
      await page.goto('/client');
      await expect(page).toHaveURL(/\/client/);

      const res = await page.request.get('/api/v1/users');
      expect([401, 403]).toContain(res.status());
    });
  });
});

// Refresh and CSRF below reuse the single pre-authenticated session from
// global-setup.js rather than logging in again per test — the "authenticated-
// state fixture" half of the primary-suite requirement (§72), which also
// keeps this file comfortably under the backend's real 10/minute-per-IP
// login rate limit (Suite 2/3/5/9 above already exercise ~10 real UI logins
// on their own).
test.describe('Suite 4 — Refresh', () => {
  test('POST /auth/refresh rotates the session and the new cookies still authenticate', async ({ page, context }) => {
    // Deliberately its own real login rather than the shared CLIENT_STORAGE_STATE
    // fixture: refresh rotation revokes the *old* refresh token server-side
    // (theft-detection — see backend/app/services/auth_service.py), which
    // would silently invalidate that static file for every other test still
    // relying on it. A test that mutates shared state needs an exclusive session.
    await login(page, CLIENT_USER.email, CLIENT_USER.password);
    await expect(page).toHaveURL(/\/client/);

    const beforeCookies = await context.cookies();
    const accessBefore = getCookie(beforeCookies, 'cs_access_token')?.value;
    const csrf = getCookie(beforeCookies, 'cs_csrf_token')?.value;

    // /auth/refresh is itself a state-changing POST, so it's subject to the
    // same double-submit CSRF check as any other mutation once a session
    // cookie exists — this is exactly what api/client.js's refreshSession()
    // does for real requests; this raw call proves the backend enforces it
    // independent of that client code.
    const refreshRes = await page.request.post('/api/v1/auth/refresh', {
      headers: { 'X-CSRF-Token': csrf },
    });
    expect(refreshRes.ok()).toBe(true);

    const afterCookies = await context.cookies();
    const accessAfter = getCookie(afterCookies, 'cs_access_token')?.value;
    expect(accessAfter).toBeTruthy();
    expect(accessAfter).not.toBe(accessBefore); // rotation, not reuse

    // Prove the rotated cookie actually authenticates, not just that it's non-empty.
    const meRes = await page.request.get('/api/v1/auth/me');
    expect(meRes.ok()).toBe(true);
  });

  test('refresh fails cleanly (401) once there is no session to refresh', async ({ request }) => {
    const res = await request.post('/api/v1/auth/refresh');
    expect(res.status()).toBe(401);
  });
});

test.describe('Suite 6 — CSRF (double-submit)', () => {
  test.use({ storageState: CLIENT_STORAGE_STATE });

  test('a state-changing request without X-CSRF-Token is rejected even with a valid session cookie', async ({ page }) => {
    await page.goto('/client');
    await expect(page).toHaveURL(/\/client/);

    // Deliberately bypass the app's own client that would attach the header,
    // to prove the backend enforces this independent of frontend behavior.
    const res = await page.request.post('/api/v1/clients/me/tickets', {
      data: { subject: 'CSRF probe', description: 'should be rejected', priority: 'medium' },
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status()).toBe(403);
  });

  test('creating a support ticket through the real UI succeeds (proves the X-CSRF-Token wiring end-to-end)', async ({ page }) => {
    await page.goto('/client');
    await expect(page).toHaveURL(/\/client/);

    await page.getByRole('button', { name: 'Support' }).click();
    await page.getByRole('button', { name: /new ticket/i }).click();

    const subject = `E2E CSRF-wiring probe ${Date.now()}`;
    await page.getByPlaceholder('Subject').fill(subject);
    await page.getByPlaceholder('Describe your issue...').fill('Created by the Playwright auth E2E suite.');
    await page.getByRole('button', { name: /^submit$/i }).click();

    await expect(page.getByText(subject)).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('Suite 10 — Forgot / reset password', () => {
  test('forgot-password shows the same generic message for an existing and a nonexistent email (no enumeration)', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.getByPlaceholder('you@coralswifttech.com').fill(CLIENT_USER.email);
    await page.getByRole('button', { name: /send reset link/i }).click();
    const existingMsg = await page.getByText(/if an account exists/i).textContent();

    await page.goto('/forgot-password');
    await page.getByPlaceholder('you@coralswifttech.com').fill('definitely-not-registered-e2e@coralswifttech.com');
    await page.getByRole('button', { name: /send reset link/i }).click();
    const nonexistentMsg = await page.getByText(/if an account exists/i).textContent();

    expect(existingMsg).toBe(nonexistentMsg);
  });

  test('reset-password with a missing token shows an actionable error instead of a broken form', async ({ page }) => {
    await page.goto('/reset-password');
    await expect(page.getByText(/missing or invalid/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /request a new link/i })).toBeVisible();
  });

  test('reset-password with a garbage token is rejected by the backend, not silently accepted', async ({ page }) => {
    await page.goto('/reset-password?token=not-a-real-token');
    await page.getByPlaceholder('Min. 8 chars, 1 upper, 1 lower, 1 number, 1 symbol').fill('BrandNewPass123!');
    await page.getByPlaceholder('Re-enter password').fill('BrandNewPass123!');
    await page.getByRole('button', { name: /reset password/i }).click();
    await expect(page.getByText(/invalid or has expired/i)).toBeVisible();
  });
});
