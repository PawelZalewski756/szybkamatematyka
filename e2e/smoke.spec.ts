import { expect, test } from "@playwright/test";

test.describe("Smoke", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("szybka-matma-school-class", "klasa-8");
    });
  });

  test("strona główna ładuje się", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Przygotuj się do",
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
      "Przygotuj się do",
    );
  });

  test("nawigacja ma link Trening", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");
    await expect(
      page
        .getByRole("navigation", { name: "Główna nawigacja" })
        .getByRole("link", { name: "Trening" }),
    ).toBeVisible();
  });

  test("trening pokazuje zadania z lokalnego cache", async ({ page }) => {
    await page.goto(
      "/trening/matura/liczby_rzeczywiste/kolejnosc_dzialan",
    );
    await page.getByRole("tab", { name: "Zadania" }).click();
    await expect(page.getByText(/Zadanie \d+ z \d+/)).toBeVisible();
    await expect(page.getByText("Nie udało się załadować zadań.")).toHaveCount(0);
    await page.getByRole("button", { name: /B\s+18/ }).click();
    await expect(page.getByText("Spróbuj jeszcze raz!")).toBeVisible();
    await page.getByRole("button", { name: /A\s+30/ }).click();
    await expect(page.getByText("Dobra odpowiedź!")).toBeVisible();
  });

  test("lista treningu pokazuje tematy z lokalnego cache", async ({ page }) => {
    await page.goto("/trening");
    await expect(page.getByRole("heading", { name: "Trening" })).toBeVisible();
    await expect(
      page.getByText("Aktywne", { exact: true }).first(),
    ).toBeVisible();
    await expect(
      page.locator("dd").filter({ hasText: /^28$/ }).first(),
    ).toBeVisible();
  });

  test("arkusze CKE pokazują oficjalne sesje z archiwum", async ({ page }) => {
    await page.goto("/trening/arkusze");
    await expect(
      page.getByRole("heading", { level: 1, name: /Arkusze/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Matura CKE/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Matura — maj 2025/ }),
    ).toBeVisible();
    await expect(page.getByText("Brak arkuszy")).toHaveCount(0);
    await expect(page.getByText("TypeError")).toHaveCount(0);
    await page.getByRole("link", { name: /Matura — maj 2025/ }).click();
    await expect(
      page.getByRole("heading", { name: /Matura — maj 2025/ }),
    ).toBeVisible();
  });
});
