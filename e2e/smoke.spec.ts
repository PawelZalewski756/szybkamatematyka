import { expect, test } from "@playwright/test";

test.describe("Smoke", () => {
  test("strona główna ładuje się", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Zhakuj Matematykę",
    );
  });

  test("/login ma formularz logowania", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /Wejdź do/i })).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "Zaloguj się" })).toBeVisible();
  });

  test("/rankingi ładuje tablicę wyników", async ({ page }) => {
    await page.goto("/rankingi");
    await expect(
      page.getByRole("heading", { name: "Tablica wyników" }),
    ).toBeVisible();
  });

  test("/wyzwania ładuje dzienne wyzwanie", async ({ page }) => {
    await page.goto("/wyzwania");
    await expect(
      page.getByRole("heading", { name: "Wyzwanie na dziś" }),
    ).toBeVisible();
  });

  test("nawigacja ma link Wyzwania", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("navigation").getByRole("link", { name: "Wyzwania" }),
    ).toBeVisible();
  });
});
