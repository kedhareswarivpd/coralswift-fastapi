import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Suite 6 (Client Security) from the master brief: proves Client B cannot
// see Client A's projects/invoices through either the API or the UI. This
// is the concrete test for the whole engagement's most-repeated rule —
// "never client-side filter for security" — by exercising the real,
// already-provisioned data (see the session notes: an admin-created
// project + invoice tied to Client A's real `clients` row) against a
// second, entirely independent client session.
//
// Both sessions come from global-setup.js's storageState fixtures — this
// file is about data isolation, not the login form, so there's no reason to
// spend more of the shared 10/minute login-rate budget re-logging-in here.
//
// This intentionally does NOT probe a direct by-id endpoint (e.g.
// `GET /projects/{id}` with Client A's project id under Client B's
// session) — there isn't one for billing-scoped resources. The backend's
// architecture is self-scoped `/clients/me/*` only (see
// backend/app/routers/clients.py); there is no ID-based cross-client read
// path to even attempt an IDOR against. That absence is itself the
// property this suite verifies: isolation by construction, not by a
// per-request ownership check that could be forgotten on some route.

const AUTH_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '.auth');
const CLIENT_A_STATE = path.join(AUTH_DIR, 'client.json');
const CLIENT_B_STATE = path.join(AUTH_DIR, 'clientB.json');

const ISOLATION_PROJECT_TITLE = 'E2E Isolation Test Project';

test.describe('Suite 6 — Client data isolation', () => {
  test.describe('as Client A', () => {
    test.use({ storageState: CLIENT_A_STATE });

    test('sees their own project via the real API', async ({ page }) => {
      await page.goto('/client');
      await expect(page).toHaveURL(/\/client/);

      const res = await page.request.get('/api/v1/clients/me/projects');
      expect(res.ok()).toBe(true);
      const body = await res.json();
      const titles = (body.data ?? []).map((p) => p.title);
      expect(titles).toContain(ISOLATION_PROJECT_TITLE);
    });

    test('sees their own project in the Portal UI', async ({ page }) => {
      await page.goto('/client');
      await expect(page).toHaveURL(/\/client/);
      await page.getByRole('button', { name: 'Projects' }).click();
      await expect(page.getByText(ISOLATION_PROJECT_TITLE)).toBeVisible();
    });
  });

  test.describe('as Client B', () => {
    test.use({ storageState: CLIENT_B_STATE });

    test("project list never includes Client A's project (API)", async ({ page }) => {
      await page.goto('/client');
      await expect(page).toHaveURL(/\/client/);

      const res = await page.request.get('/api/v1/clients/me/projects');
      expect(res.ok()).toBe(true);
      const body = await res.json();
      const titles = (body.data ?? []).map((p) => p.title);
      expect(titles).not.toContain(ISOLATION_PROJECT_TITLE);
    });

    test("Portal UI never renders Client A's project title", async ({ page }) => {
      await page.goto('/client');
      await expect(page).toHaveURL(/\/client/);
      await page.getByRole('button', { name: 'Projects' }).click();
      // A meaningful negative assertion needs the tab to have actually
      // finished loading Client B's own (empty) project list first —
      // otherwise this would trivially "pass" during the loading state too.
      await expect(page.getByText(/no projects yet/i)).toBeVisible();
      await expect(page.getByText(ISOLATION_PROJECT_TITLE)).not.toBeVisible();
    });

    test("invoice list never includes Client A's invoice (API)", async ({ page }) => {
      await page.goto('/client');
      await expect(page).toHaveURL(/\/client/);

      const res = await page.request.get('/api/v1/clients/me/invoices');
      expect(res.ok()).toBe(true);
      const body = await res.json();
      const notes = (body.data ?? []).map((inv) => inv.notes);
      expect(notes).not.toContain('E2E isolation probe invoice');
    });

    test('cannot list all clients even via the staff-only endpoint (rejected, not just unfiltered)', async ({ page }) => {
      // Every genuinely cross-client read in this backend is staff-only
      // (require_roles("admin", ...)) — confirm a client session is
      // rejected outright rather than merely "not shown" by a UI-level filter.
      await page.goto('/client');
      await expect(page).toHaveURL(/\/client/);

      const res = await page.request.get('/api/v1/clients');
      expect([401, 403]).toContain(res.status());
    });
  });
});
