import { expect, test } from "@playwright/test";

test.describe("Baza zadań", () => {
  test("domyślnie pokazuje katalog zamiast ściany kart", async ({ page }) => {
    await page.goto("/baza-zadan");

    await expect(
      page.getByRole("heading", { level: 1, name: "Wybierz punkt startu" }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("tablist", { name: "Sposób pracy w bazie zadań" })
        .getByRole("tab", { name: /Ćwicz zadania/ }),
    ).toHaveAttribute("aria-selected", "true");
    await expect(
      page.getByLabel("Szukaj po tytule lub treści"),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Od czego chcesz zacząć?",
      }),
    ).toBeVisible();
    await expect(page.getByRole("list", { name: "Wyniki zadań" })).toHaveCount(
      0,
    );
  });

  test("pokazuje wyniki dopiero po wyborze działu", async ({ page }) => {
    await page.goto("/baza-zadan");

    await page
      .getByRole("button", { name: /Algebra i równania/ })
      .click();

    await expect(
      page.getByRole("heading", { name: "Zadania: Algebra i równania" }),
    ).toBeVisible();
    await expect(
      page.getByRole("list", { name: "Wyniki zadań" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Wróć do katalogu" }),
    ).toBeVisible();
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
    const search = page.getByLabel("Szukaj po tytule lub treści");

    await search.fill("fraza-której-nie-ma-w-bazie-987654");
    await expect(page.getByText("Brak zadań")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Wyczyść wybór" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Wyczyść wybór" }).click();
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
              nazwa: "Matura - maj 2025",
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
      page.getByRole("heading", { name: "Matura - maj 2025" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Otwórz katalog arkuszy CKE" }),
    ).toHaveAttribute("href", "/trening/arkusze");
  });

  test("gość przełącza poziom nauki bez logowania", async ({ page }) => {
    await page.goto("/baza-zadan");

    const toggle = page.getByRole("group", { name: "Poziom nauki" });
    const podstawowa = toggle.getByRole("button", {
      name: "Szkoła podstawowa",
    });
    const srednia = toggle.getByRole("button", { name: "Szkoła średnia" });

    await expect(podstawowa).toHaveAttribute("aria-pressed", "true");

    await srednia.click();
    await expect(srednia).toHaveAttribute("aria-pressed", "true");
    await expect(podstawowa).toHaveAttribute("aria-pressed", "false");

    await page.reload();
    await expect(
      page
        .getByRole("group", { name: "Poziom nauki" })
        .getByRole("button", { name: "Szkoła średnia" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  test("na telefonie wyszukiwanie pozostaje dostępne przed filtrami", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/baza-zadan");

    await expect(
      page.getByLabel("Szukaj po tytule lub treści"),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Doprecyzuj filtry", exact: true }),
    ).toBeVisible();
  });

  test("powrót z zadania zachowuje wybrany dział", async ({ page }) => {
    await page.goto("/baza-zadan");

    await page.getByRole("button", { name: /Algebra i równania/ }).click();
    await expect(
      page.getByRole("heading", { name: "Zadania: Algebra i równania" }),
    ).toBeVisible();

    const firstTask = page
      .getByRole("list", { name: "Wyniki zadań" })
      .getByRole("link")
      .first();
    const href = await firstTask.getAttribute("href");
    await firstTask.click();
    // Najpierw czekamy na commit nawigacji, inaczej goBack() potrafi wykonać
    // się przed dodaniem zadania do historii.
    await expect(page).toHaveURL(
      new RegExp(`${href!.replace(/[/.*+?^${}()|[\]\\]/g, "\\$&")}$`),
    );

    await page.goBack();

    await expect(
      page.getByRole("heading", { name: "Zadania: Algebra i równania" }),
    ).toBeVisible();
    await expect(
      page.getByRole("list", { name: "Wyniki zadań" }),
    ).toBeVisible();
  });

  test("wstecz wraca do poprzedniej zakładki, a nie poza bazę zadań", async ({
    page,
  }) => {
    await page.goto("/baza-zadan");

    await page.getByRole("tab", { name: /Arkusze CKE/ }).click();
    await expect(page).toHaveURL(/tab=arkusze/);

    await page.goBack();

    await expect(page).toHaveURL(/\/baza-zadan$/);
    await expect(
      page.getByRole("tab", { name: /Ćwicz zadania/ }),
    ).toHaveAttribute("aria-selected", "true");
  });

  test("zakładki mieszczą się w ekranie telefonu bez ukrywania", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/baza-zadan");

    for (const name of [/Ćwicz zadania/, /Arkusze CKE/, /Symulacje/]) {
      await expect(page.getByRole("tab", { name })).toBeVisible();
    }
  });

  test("powrót z zadania zachowuje pozycję listy", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/baza-zadan");

    await page.getByRole("button", { name: /Podstawy szkolne/ }).click();
    const list = page.getByRole("list", { name: "Wyniki zadań" });
    await expect(list).toBeVisible();

    const target = list.getByRole("link").nth(6);
    await target.scrollIntoViewIfNeeded();
    const before = await page.evaluate(() => window.scrollY);
    expect(before).toBeGreaterThan(100);

    await target.click();
    await page.waitForURL(/\/baza-zadan\//);
    await page.goBack();

    await expect(
      page.getByRole("heading", { name: /Zadania: Podstawy szkolne/ }),
    ).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(100);
  });
});
