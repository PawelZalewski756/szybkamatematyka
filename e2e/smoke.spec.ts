import { expect, test } from "@playwright/test";

test.describe("Smoke", () => {
  test("strona główna ładuje się", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Przygotuj się do",
    );
    await expect(
      page.getByText("Ścieżka: Szkoła podstawowa", { exact: true }),
    ).toHaveCount(0);
  });

  test("gość może wejść na stronę bez wymuszonego wyboru klasy", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.removeItem("szybka-matma-school-class");
      localStorage.removeItem("szybka-matma-learning-path");
    });
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Przygotuj się do",
    );
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.getByRole("link", { name: "Zacznij trening" }).click();
    await expect(page).toHaveURL(/\/trening$/);
  });

  test("nie zbiera własnych statystyk i usuwa dawny identyfikator", async ({
    page,
  }) => {
    let analyticsRequests = 0;
    page.on("request", (request) => {
      if (new URL(request.url()).pathname.startsWith("/api/analytics/")) {
        analyticsRequests += 1;
      }
    });
    await page.addInitScript(() => {
      localStorage.setItem("sm-analytics-consent", "accepted");
      localStorage.setItem(
        "sm-analytics-visitor-id",
        "123e4567-e89b-42d3-a456-426614174000",
      );
    });
    await page.goto("/");

    await expect(
      page.locator('[aria-label="Zgoda na anonimową analitykę"]'),
    ).toHaveCount(0);
    await expect
      .poll(() =>
        page.evaluate(() => localStorage.getItem("sm-analytics-visitor-id")),
      )
      .toBeNull();
    expect(analyticsRequests).toBe(0);
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

  test("/api/runtime-config zwraca bezpieczny status konfiguracji", async ({
    request,
  }) => {
    const response = await request.get("/api/runtime-config");
    if (process.env.CI || process.env.E2E_PORT) {
      expect(response.status()).toBe(200);
    } else {
      expect([200, 503]).toContain(response.status());
    }
    expect(response.headers()["cache-control"]).toBe("no-store");

    const body = (await response.json()) as {
      configured?: boolean;
      supabaseUrl?: string;
      supabaseAnonKey?: string;
    };
    expect(typeof body.configured).toBe("boolean");
    if (body.configured) {
      expect(body.supabaseUrl).toMatch(/^https?:\/\//);
      expect(body.supabaseAnonKey).toBeTruthy();
    }
  });

  test("logowanie pokazuje walidację bez wysyłania pustych danych", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.locator('input[name="email"]').fill("niepoprawny-adres");
    await page.locator('input[name="password"]').fill("123");
    await page.getByRole("button", { name: "Zaloguj się" }).click();

    await expect(page.locator('p[role="alert"]')).toContainText(
      "Podaj poprawny adres e-mail",
    );
  });

  test("logowanie mapuje błąd Supabase na komunikat dla użytkownika", async ({
    page,
  }) => {
    await page.route("**/auth/v1/token*", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          error: "invalid_grant",
          error_description: "Invalid login credentials",
          msg: "Invalid login credentials",
        }),
      });
    });

    await page.goto("/login");
    await page.locator('input[name="email"]').fill("uczen@example.com");
    await page.locator('input[name="password"]').fill("poprawnehaslo");
    await page.getByRole("button", { name: "Zaloguj się" }).click();

    await expect(page.locator('p[role="alert"]')).toContainText(
      "Zły e-mail lub hasło",
    );
  });

  test("rejestracja nie blokuje się po chwilowej awarii sprawdzania nicku", async ({
    page,
  }) => {
    await page.route("**/rest/v1/profiles*", (route) => route.abort("failed"));
    await page.route("**/auth/v1/signup*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: {
            id: "00000000-0000-4000-8000-000000000001",
            aud: "authenticated",
            role: "authenticated",
            email: "nowy@example.com",
            app_metadata: { provider: "email", providers: ["email"] },
            user_metadata: { nick: "NowyUczen", nickname: "NowyUczen" },
          },
          session: null,
        }),
      });
    });

    await page.goto("/login");
    await page.getByRole("button", { name: "Załóż konto" }).click();
    const schoolLevelPicker = page.getByLabel(
      "Poziom nauki (opcjonalnie)",
    );
    await expect(schoolLevelPicker).toBeVisible();
    await expect(schoolLevelPicker.locator("option")).toHaveText([
      "Wybiorę później",
      "Szkoła podstawowa",
      "Szkoła średnia",
    ]);
    await page.locator('input[name="nick"]').fill("NowyUczen");
    await page.locator('input[name="email"]').fill("nowy@example.com");
    await page.locator('input[name="password"]').fill("poprawnehaslo");
    await page.locator('input[name="passwordConfirm"]').fill("poprawnehaslo");
    await page.getByRole("button", { name: "Utwórz konto" }).click();

    await expect(page).toHaveURL(/\/login\/sukces\?confirm=1/);
    await expect(
      page.getByRole("heading", { name: "Konto utworzone" }),
    ).toBeVisible();
    await expect(page.getByText(/Sprawdź skrzynkę e-mail/i)).toBeVisible();
  });

  test("reset hasła mapuje błąd limitu Supabase", async ({ page }) => {
    await page.route("**/auth/v1/recover*", async (route) => {
      await route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({
          error: "over_email_send_rate_limit",
          message: "For security purposes, you can only request this after 60 seconds.",
        }),
      });
    });

    await page.goto("/login/zapomniane-haslo");
    await page.locator('input[name="email"]').fill("uczen@example.com");
    await page.getByRole("button", { name: "Wyślij link resetujący" }).click();

    await expect(page.locator('p[role="alert"]')).toContainText(
      "Poczekaj chwilę przed kolejną próbą",
    );
  });

  test("strona nowego hasła odrzuca wejście bez ważnego linku", async ({
    page,
  }) => {
    await page.goto("/login/nowe-haslo");
    await expect(page.locator('p[role="alert"]')).toContainText(
      "Link wygasł lub jest nieprawidłowy",
    );
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
    const moreButton = page
      .getByRole("navigation", { name: "Nawigacja mobilna" })
      .getByRole("button", { name: "Więcej" });
    await moreButton.click();
    const moreMenu = page.getByRole("dialog", { name: "Więcej" });
    await expect(moreMenu).toBeVisible();
    await expect(moreButton).toHaveAttribute("aria-controls", /.+/);
    await expect(moreMenu.getByLabel("Poziom nauki")).toHaveValue("");
    await moreMenu.getByRole("link", { name: "Kontakt" }).click();
    await expect(page).toHaveURL(/\/kontakt$/);
  });

  test("strona główna ma panel startowy", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Przygotuj się do",
    );
  });

  test("/minigry pokazuje jeden polecany start i krótki wybór trybu", async ({
    page,
  }) => {
    await page.goto("/minigry");

    await expect(
      page.getByRole("heading", { level: 1, name: /Minigry/ }),
    ).toBeVisible();
    const recommendedStart = page.getByTestId("minigame-recommended-start");
    await expect(recommendedStart).toBeVisible();
    await expect(recommendedStart).toHaveAttribute(
      "href",
      "/minigry/prawda-falsz?mode=time_attack",
    );
    await expect(page.getByText("Dla Ciebie")).toHaveCount(0);

    await expect(
      page.getByRole("heading", { name: "Wybierz tryb" }),
    ).toBeVisible();
    await expect(page.getByTestId("minigame-mode-time_attack")).toHaveAttribute(
      "href",
      "/minigry/modes/time-attack",
    );
    await expect(
      page.getByTestId("minigame-mode-time_attack"),
    ).toContainText("Polecany start");
  });

  test("/minigry odkrywa karty dopiero po otwarciu obszaru", async ({
    page,
  }) => {
    await page.goto("/minigry");

    const matchedLibrary = page.getByTestId("minigame-matched-library");
    const arithmeticGroup = matchedLibrary.getByTestId(
      "minigame-group-rachunki",
    );
    const multiplicationLink = arithmeticGroup.getByRole("link", {
      name: /Szybkie Mnożenie/,
    });

    await expect(arithmeticGroup).toBeVisible();
    await expect(multiplicationLink).toBeHidden();
    await arithmeticGroup.locator("summary").click();
    await expect(multiplicationLink).toBeVisible();
    await expect(multiplicationLink).toHaveAttribute(
      "href",
      "/minigry/mnozenie?mode=time_attack",
    );

    const fullLibrary = page.getByTestId("minigame-other-library");
    await expect(fullLibrary).toBeVisible();
    await expect(
      fullLibrary.getByRole("link", { name: /f\(x\) Express/ }),
    ).toBeHidden();
  });

  test("/minigry zachowuje tryb po przejściu do katalogu trybu", async ({
    page,
  }) => {
    await page.goto("/minigry");
    await page.getByTestId("minigame-mode-survival").click();

    await expect(page).toHaveURL(/\/minigry\/modes\/survival$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Przetrwanie" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Prawda czy Fałsz/ }).first(),
    ).toHaveAttribute("href", "/minigry/prawda-falsz?mode=survival");
  });

  test("/minigry nie wychodzi poza ekran telefonu", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/minigry");

    await expect(page.getByTestId("minigame-recommended-start")).toBeVisible();
    await expect(page.getByTestId("minigame-mode-selection")).toBeVisible();
    const widths = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
    }));
    expect(widths.document).toBeLessThanOrEqual(widths.viewport);
  });

  test("panel następnego tematu prowadzi do treningu", async ({ page }) => {
    await page.goto("/");
    const topicLink = page.getByRole("link", {
      name: "Otwórz temat Równania",
    });

    await expect(topicLink).toHaveAttribute(
      "href",
      "/trening/egzamin-osmoklasisty/algebra/rownania",
    );
    await topicLink.click();
    await expect(page).toHaveURL(
      /\/trening\/egzamin-osmoklasisty\/algebra\/rownania$/,
    );
  });

  test("panel pokazuje ostatnio otwarty temat", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "szybka-matma-last-training-topic:guest",
        JSON.stringify({
          examKey: "8_klasa",
          category: "algebra",
          topic: "rownania",
          visitedAt: Date.now(),
        }),
      );
    });
    await page.goto("/");

    const topicLink = page.getByRole("link", {
      name: "Wróć do tematu Równania",
    });
    await expect(topicLink).toHaveAttribute(
      "href",
      "/trening/egzamin-osmoklasisty/algebra/rownania",
    );
    await expect(page.getByText("OSTATNI TEMAT")).toBeVisible();
    await expect(page.getByText("Przykładowa sesja")).toHaveCount(0);
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
    await page.route("**/rest/v1/tasks*", (route) => route.abort());
    await page.goto(
      "/trening/matura/liczby_rzeczywiste/kolejnosc_dzialan",
    );
    await page.getByRole("button", { name: /Odrzu/ }).click();
    await page.getByRole("tab", { name: "Zadania" }).click();
    await expect(page.getByText(/Zadanie \d+ z \d+/)).toBeVisible();
    await expect(page.getByText("Nie udało się załadować zadań.")).toHaveCount(0);
    const response = await page.request.get(
      "/api/trening/tasks?examType=matura_podstawowa&category=liczby_rzeczywiste&topic=kolejnosc_dzialan",
    );
    expect(response.ok()).toBeTruthy();
    const payload = (await response.json()) as {
      tasks: Array<{ options: string[]; correct_answer: string }>;
    };
    const firstTask = payload.tasks[0];
    expect(firstTask).toBeDefined();
    const correctIndex = firstTask.options.indexOf(firstTask.correct_answer);
    const wrongIndex = firstTask.options.findIndex(
      (_, index) => index !== correctIndex,
    );
    const answerButtons = page.getByTestId("training-answer-option");
    await expect(answerButtons).toHaveCount(firstTask.options.length);
    await answerButtons.nth(wrongIndex).click();
    await expect(page.getByText("Spróbuj jeszcze raz!")).toBeVisible();
    await answerButtons.nth(correctIndex).click();
    await expect(page.getByText("Dobra odpowiedź!")).toBeVisible();
  });

  test("lista treningu pokazuje tematy z lokalnego cache", async ({ page }) => {
    await page.goto("/trening");
    await expect(page.getByRole("heading", { name: "Trening" })).toBeVisible();
    await expect(
      page.getByTestId("training-department-navigation"),
    ).toBeVisible();
    await expect(
      page.getByTestId("training-next-step"),
    ).toHaveAttribute(
      "href",
      "/trening/matura/liczby_rzeczywiste/kolejnosc_dzialan",
    );
    await expect(page.getByTestId("training-topic-list")).toHaveCount(0);
    await expect(page.getByText("30 tematów").first()).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Pokaż tematy/ }).first(),
    ).toBeVisible();
  });

  test("lista treningu otwiera tematy dopiero po wyborze działu", async ({
    page,
  }) => {
    await page.goto("/trening");
    const departmentButton = page.getByRole("button", {
      name: /Liczby rzeczywiste/,
    });
    const departmentPanel = page.getByTestId("training-department-panel");
    const topicLinks = page.getByTestId("training-topic-list").locator(
      'a[href^="/trening/matura/liczby_rzeczywiste/"]',
    );
    await expect(departmentButton).toBeVisible();
    await expect(departmentPanel).toBeVisible();
    await expect(page.getByTestId("training-topic-list")).toHaveCount(0);

    const expandButton = departmentPanel.getByRole("button", {
      name: /Pokaż tematy/,
    });
    await expect(expandButton).toBeVisible();
    await expandButton.click();

    await expect(page.getByTestId("training-topic-list")).toBeVisible();
    await expect(topicLinks).toHaveCount(7);
  });

  test("trening zachowuje hierarchię i szerokość na telefonie", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/trening");

    await expect(page.getByTestId("training-next-step")).toBeVisible();
    await expect(
      page.getByTestId("training-department-navigation"),
    ).toBeVisible();
    await expect(page.getByTestId("training-topic-list")).toHaveCount(0);

    const widths = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
    }));
    expect(widths.document).toBeLessThanOrEqual(widths.viewport);
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
