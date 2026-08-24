import { expect, test } from "@playwright/test";

test.describe("Smoke", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("szybka-matma-school-class", "klasa-8");
      localStorage.setItem("szybka-matma-learning-path", "sp");
    });
  });

  test("strona główna ładuje się", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /Szybka\s*Matematyka/,
    );
  });

  test("/login ma formularz logowania", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /Zaloguj się do/i })).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "Zaloguj się" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Zapomniałeś hasła?" })).toBeVisible();
  });

  test("/login/zapomniane-haslo ma formularz resetu", async ({ page }) => {
    await page.goto("/login/zapomniane-haslo");
    await expect(
      page.getByRole("heading", { name: "Zapomniałeś hasła?" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Wyślij link resetujący" }),
    ).toBeVisible();
  });

  test("/rankingi ładuje ranking", async ({ page }) => {
    await page.goto("/rankingi");
    await expect(
      page.getByRole("heading", { name: "Rankingi" }),
    ).toBeVisible();
  });

  test("/wyzwania ładuje dzienne wyzwanie", async ({ page }) => {
    await page.goto("/wyzwania");
    await expect(
      page.getByRole("heading", { name: "Wyzwanie na dziś" }),
    ).toBeVisible();
  });

  test("nawigacja mobilna ma dolny pasek", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(
      page.getByRole("navigation", { name: "Nawigacja mobilna" }),
    ).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Nawigacja mobilna" }).getByRole("link", {
        name: "Start",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Nawigacja mobilna" }).getByLabel("Graj"),
    ).toBeVisible();
  });

  test("strona główna ma panel startowy", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /Szybka\s*Matematyka/,
    );
  });

  test("nawigacja ma link Trening", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");
    await expect(
      page
        .getByRole("navigation")
        .getByRole("link", { name: "Trening", exact: true }),
    ).toBeVisible();
  });

  test("polityka prywatności i regulamin są publiczne", async ({ page }) => {
    await page.goto("/polityka-prywatnosci");
    await expect(
      page.getByRole("heading", { level: 1, name: "Polityka prywatności" }),
    ).toBeVisible();
    await page.goto("/regulamin");
    await expect(
      page.getByRole("heading", { level: 1, name: "Regulamin serwisu" }),
    ).toBeVisible();
  });

  test("stopka strony głównej ma linki prawne", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");
    await expect(
      page.getByRole("navigation", { name: "Informacje prawne" }).getByRole("link", {
        name: "Polityka prywatności",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Informacje prawne" }).getByRole("link", {
        name: "Regulamin",
      }),
    ).toBeVisible();
  });

  test("/api/health odpowiada bez sekretów", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBeTruthy();
    const body = (await response.json()) as {
      status?: string;
      checks?: Record<string, string>;
    };
    expect(body.status).toMatch(/ok|degraded/);
    expect(JSON.stringify(body).toLowerCase()).not.toContain("eyj");
    expect(body.checks?.supabase).toMatch(/configured|missing/);
  });
});
