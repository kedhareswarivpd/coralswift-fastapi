import { defineConfig, devices } from '@playwright/test';

// E2E suite runs against the real, containerized stack (docker-compose.yml +
// docker-compose.override.yml) rather than `vite dev` — CoralSwift's cookie
// auth (httpOnly cs_access_token/cs_refresh_token + cs_csrf_token) depends on
// the frontend and backend sharing an origin the way the nginx reverse proxy
// provides in production, which `vite dev`'s proxy also approximates but the
// built, served bundle is the more representative target for auth E2E.
// Override with PLAYWRIGHT_BASE_URL to point at a different running stack.
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8081';

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.js',
  fullyParallel: false, // auth tests share seeded accounts/sessions; avoid cross-test interference
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  timeout: 30_000,
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // No `webServer` entry: this suite intentionally targets an already-running
  // stack (`docker compose up`) rather than spawning one, so the same run
  // exercises the actual reverse-proxy/cookie topology used in deployment.
});
