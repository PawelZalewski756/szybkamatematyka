import { defineConfig, devices } from "@playwright/test";

/**
 * E2E smoke tests — uruchamiane lokalnie: `npm run test:e2e`.
 *
 * Świadomie NIE dodajemy tego kroku do `.github/workflows/ci.yml` na razie
 * (wolne uruchomienie build+start, potencjalna flakiness przy dev-serverze).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
