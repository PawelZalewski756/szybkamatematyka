import { expect, test } from "@playwright/test";

test.describe("Baza zadań", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("szybka-matma-school-class", "klasa-8");
    });
  });

  test("ma jeden punkt startowy i kompaktowe filtry", async ({ page }) => {
    await page.goto("/baza-zadan");

    await expect(
      page.getByRole("heading", { level: 1, name: "Znajdź zadanie" }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("tablist", { name: "Sposób pracy w bazie zadań" })
        .getByRole("tab", { name: /Ćwicz zadania/ }),
    ).toHaveAttribute("aria-selected", "true");
    await expect(page.getByLabel("Szukaj zadań")).toBeVisible();
    await expect(
      page.getByRole("status").filter({ hasText: "Znaleziono" }),
    ).toContainText("zadań");
  });

  test("zachowuje wybór celu w URL i przełącza panel bez przeładowania", async ({
    page,
  }) => {
    await page.goto("/baza-zadan?tab=trening");

    const tablist = page.getByRole("tablist", {
      name: "Sposób pracy w bazie zadań",
    });
    await expect(
      tablist.getByRole("tab", { name: /Symulacje/ }),
    ).toHaveAttribute("aria-selected", "true");
    await expect(
      page.getByText("Kompletne arkusze z wynikiem na końcu", {
        exact: false,
      }),
    ).toBeVisible();

    await tablist.getByRole("tab", { name: /Ćwicz zadania/ }).click();
    await expect(page).toHaveURL(/\/baza-zadan$/);
    await expect(
      tablist.getByRole("tab", { name: /Ćwicz zadania/ }),
    ).toHaveAttribute("aria-selected", "true");
  });

  test("filtr wyszukiwania pokazuje pusty stan i można go wyczyścić", async ({
    page,
  }) => {
    await page.goto("/baza-zadan");
    const search = page.getByLabel("Szukaj zadań");

    await search.fill("fraza-której-nie-ma-w-bazie-987654");
    await expect(page.getByText("Brak zadań")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Wyczyść filtry" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Wyczyść filtry" }).click();
    await expect(page.getByText("Brak zadań")).toHaveCount(0);
    await expect(search).toHaveValue("");
  });

  test("arkusze CKE pokazują katalog po załadowaniu danych", async ({
    page,
  }) => {
    await page.route("**/rest/v1/zadania*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "cke-task-1",
            arkusz_id: "cke-sheet-1",
            numer_zadania: 1,
            dzial: "algebra",
            created_at: "2025-06-01T00:00:00.000Z",
            arkusz: {
              id: "cke-sheet-1",
              nazwa: "Matura — maj 2025",
              typ: "matura",
              rok: 2025,
              miesiac: 5,
            },
          },
        ]),
      });
    });

    await page.goto("/baza-zadan?tab=arkusze");
    await expect(
      page.getByRole("link", { name: /Arkusz — maj 2025/ }),
    ).toBeVisible();
    await expect(page.getByText("Wyświetlono", { exact: false })).toBeVisible();
  });

  test("na telefonie wyszukiwanie pozostaje dostępne przed filtrami", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/baza-zadan");

    await expect(page.getByLabel("Szukaj zadań")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Pokaż", exact: true }),
    ).toBeVisible();
  });
});
