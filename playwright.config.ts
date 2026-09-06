import { defineConfig, devices } from "@playwright/test";

const e2ePort = Number(process.env.E2E_PORT ?? 3000);
const e2eBaseUrl = `http://localhost:${e2ePort}`;

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
    baseURL: e2eBaseUrl,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // Build bez publicznych envów sprawdza ścieżkę runtime-config, a start
    // dostaje te same wartości dopiero przy uruchomieniu serwera.
    command: `node scripts/buildE2e.mjs && npm run start -- --port ${e2ePort}`,
    url: e2eBaseUrl,
    reuseExistingServer: !process.env.CI && !process.env.E2E_PORT,
    timeout: 180_000,
    env: {
      ...process.env,
      // Smoke działa bez prawdziwego Supabase — wystarczy, że klient się tworzy.
      NEXT_PUBLIC_SUPABASE_URL:
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
        "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY:
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24ifQ.demo",
      NEXT_PUBLIC_SITE_URL:
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    },
  },
});
