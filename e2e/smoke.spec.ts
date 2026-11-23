import { expect, test } from "@playwright/test";

test.describe("Smoke", () => {
  test("strona główna ładuje się", async ({ page }) => {
    const attempts: Array<{ sessionId: string; isCorrect: boolean }> = [];
    await page.route("**/api/quick-trial/attempt", async (route) => {
      attempts.push(
        route.request().postDataJSON() as {
          sessionId: string;
          isCorrect: boolean;
        },
      );
      await route.fulfill({ json: { ok: true } });
    });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Przygotuj się do",
    );
    await expect(
      page.getByText("Ścieżka: Szkoła podstawowa", { exact: true }),
    ).toHaveCount(0);
    const quickTask = page.getByRole("group", {
      name: "Odpowiedzi do zadania",
    });
    await expect(quickTask).toBeVisible();
    await quickTask.getByRole("button", { name: "Odpowiedź A 3" }).click();
    await expect(
      page.getByText("To nie ta odpowiedź - spróbuj jeszcze raz."),
    ).toBeVisible();
    await quickTask.getByRole("button", { name: "Odpowiedź B 4" }).click();
    await expect(page.getByText("Dobrze! 3 · 4 + 2 = 14.")).toBeVisible();
    await page.getByRole("button", { name: "Następne zadanie" }).click();
    await quickTask.getByRole("button", { name: "Odpowiedź B 20" }).click();
    await expect(page.getByText("Gotowe! Błędnych odpowiedzi: 1.")).toBeVisible();
    await expect.poll(() => attempts.length).toBe(3);
    // Po szybkiej próbie gość dostaje propozycję konta (zapisz wynik),
    // a nie tylko link do treningu bez konta.
    await expect(
      page.getByRole("link", { name: /Zapisz wynik/ }),
    ).toBeVisible();
    expect(attempts.map(({ isCorrect }) => isCorrect)).toEqual([
      false,
      true,
      true,
    ]);
    expect(attempts[0]?.sessionId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(attempts[1]?.sessionId).toBe(attempts[0]?.sessionId);
    await page.getByRole("button", { name: "Jeszcze raz" }).click();
    await expect(
      page.getByText("Wybierz odpowiedź, aby sprawdzić."),
    ).toBeVisible();
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

  test("licznik wejść pyta o zgodę i liczy dopiero po akceptacji", async ({
    page,
  }) => {
    const bodies: string[] = [];
    await page.route("**/api/analytics/pageview", async (route) => {
      bodies.push(route.request().postData() ?? "");
      await route.fulfill({ json: { ok: true } });
    });
    await page.goto("/");

    const prompt = page.locator('[aria-label="Zgoda na pliki cookies"]');
    await expect(prompt).toBeVisible();
    expect(bodies).toHaveLength(0);

    await prompt
      .getByRole("button", { name: "Akceptuję wszystkie", exact: true })
      .click();
    await expect(prompt).toHaveCount(0);
    await expect.poll(() => bodies.length).toBe(1);
    expect(bodies[0]).toContain('"path":"/"');

    await page.reload();
    await expect(prompt).toHaveCount(0);
  });

  test("tag Google Ads ładuje się od razu, ale startuje bez zgód", async ({
    page,
  }) => {
    const requests: string[] = [];
    await page.route("https://www.googletagmanager.com/**", async (route) => {
      requests.push(route.request().url());
      await route.fulfill({
        status: 200,
        contentType: "application/javascript",
        body: "",
      });
    });

    await page.goto("/");

    // Tag musi być widoczny dla weryfikatora Google jeszcze przed zgodą - inaczej
    // Ads pokazuje „Nie zainstalowano" i nie udostępnia etykiety konwersji.
    await expect
      .poll(() => requests.length, { timeout: 5_000 })
      .toBeGreaterThan(0);

    const readConsent = async (command: "default" | "update") =>
      page.evaluate((cmd) => {
        const win = window as unknown as { dataLayer?: unknown[][] };
        const entries = (win.dataLayer ?? []).filter(
          (entry) => entry[0] === "consent" && entry[1] === cmd,
        );
        const last = entries[entries.length - 1] as
          | [string, string, Record<string, string>]
          | undefined;
        return last?.[2]?.ad_storage ?? null;
      }, command);

    // Sam tag nie wystarcza - bez zgody nie może zapisywać cookies reklamowych.
    await expect
      .poll(() => readConsent("default"), { timeout: 5_000 })
      .toBe("denied");

    await page
      .locator('[aria-label="Zgoda na pliki cookies"]')
      .getByRole("button", { name: "Akceptuję wszystkie" })
      .click();

    await expect
      .poll(() => readConsent("update"), { timeout: 5_000 })
      .toBe("granted");
  });

  test("same niezbędne cookies nie wysyłają pageview", async ({ page }) => {
    const bodies: string[] = [];
    await page.route("**/api/analytics/pageview", async (route) => {
      bodies.push(route.request().postData() ?? "");
      await route.fulfill({ json: { ok: true } });
    });
    await page.goto("/");

    const prompt = page.locator('[aria-label="Zgoda na pliki cookies"]');
    await prompt.getByRole("button", { name: "Tylko niezbędne" }).click();
    await expect(prompt).toHaveCount(0);
    await page.waitForTimeout(400);
    expect(bodies).toHaveLength(0);
  });

  test("wracający odwiedzający nie widzi komunikatu, a wejście i tak się liczy", async ({
    page,
  }) => {
    const bodies: string[] = [];
    await page.route("**/api/analytics/pageview", async (route) => {
      bodies.push(route.request().postData() ?? "");
      await route.fulfill({ json: { ok: true } });
    });
    await page.addInitScript(() => {
      localStorage.setItem("sm-analytics-consent", "accepted");
    });
    await page.goto("/");

    await expect(
      page.locator('[aria-label="Zgoda na pliki cookies"]'),
    ).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Prywatność" })).toHaveCount(0);
    await expect.poll(() => bodies.length).toBe(1);
  });

  test("/login ma formularz logowania", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /Zaloguj się do/i })).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "Zaloguj się" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Zapomniałeś hasła?" })).toBeVisible();
  });

  test("/login?mode=signup otwiera od razu rejestrację", async ({ page }) => {
    await page.goto("/login?mode=signup");
    await expect(
      page.getByRole("heading", { name: /Dołącz do/i }),
    ).toBeVisible();
    await expect(page.locator('input[name="nick"]')).toBeVisible();
  });

  test("gość widzi w nagłówku Załóż konto obok Zaloguj", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("link", { name: "Załóż konto" }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Zaloguj" }).first(),
    ).toBeVisible();
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
    await page.locator('input[name="email"]').fill("niepoprawny@adres");
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

  test("diagnoza: feedback i następne pytanie nie nachodzą na siebie", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 710, height: 855 });
    await page.goto("/diagnostyka");
    await page.getByRole("button", { name: "Rozpocznij diagnozę" }).click();
    await page.getByTestId("diagnostic-choice").first().click();

    const feedback = page.getByTestId("diagnostic-feedback");
    const next = page.getByTestId("diagnostic-next");
    await expect(feedback).toBeVisible();
    await expect(next).toBeVisible();

    const feedbackBox = await feedback.boundingBox();
    const nextBox = await next.boundingBox();
    expect(feedbackBox).not.toBeNull();
    expect(nextBox).not.toBeNull();
    expect(nextBox!.y).toBeGreaterThanOrEqual(
      feedbackBox!.y + feedbackBox!.height - 1,
    );
  });

  test("rejestracja nie blokuje się po chwilowej awarii sprawdzania nicku", async ({
    page,
  }) => {
    await page.route("**/rest/v1/profiles*", (route) => route.abort("failed"));
    const user = {
      id: "00000000-0000-4000-8000-000000000001",
      aud: "authenticated",
      role: "authenticated",
      email: "nowy@example.com",
      app_metadata: { provider: "email", providers: ["email"] },
      user_metadata: { nick: "NowyUczen", nickname: "NowyUczen" },
    };
    await page.route("**/api/signup", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, userId: user.id }),
      });
    });
    await page.route("**/auth/v1/token*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          access_token: "test-access-token",
          token_type: "bearer",
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          refresh_token: "test-refresh-token",
          user,
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
    await page.locator('input[name="termsAccepted"]').check();
    await page.locator('input[name="ageConfirmed"]').check();
    await page.getByRole("button", { name: "Utwórz konto" }).click();

    await expect(page).toHaveURL(/\/login\/sukces$/);
    await expect(
      page.getByRole("heading", { name: "Konto utworzone" }),
    ).toBeVisible();
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
      page.getByRole("navigation", { name: "Nawigacja mobilna" }).getByRole("button", { name: "Graj" }),
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

  test("/powtorki pokazuje bramkę rejestracji dla gościa", async ({ page }) => {
    await page.goto("/powtorki");
    await expect(
      page.getByRole("heading", {
        name: "Powtórki zapisują się na koncie",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Załóż darmowe konto" }),
    ).toBeVisible();
  });

  test("/api/powtorki/tasks nie wysyła rozwiązań krok po kroku", async ({
    request,
  }) => {
    const response = await request.post("/api/powtorki/tasks", {
      data: { ids: ["st-001", "cke-m15-maj-z01"] },
    });
    expect(response.ok()).toBeTruthy();
    const body = (await response.json()) as {
      tasks: Array<{ id: string; hasSolution: boolean; solutionSteps?: unknown }>;
    };
    expect(body.tasks.map((task) => task.id)).toEqual([
      "st-001",
      "cke-m15-maj-z01",
    ]);
    expect(body.tasks[0]?.hasSolution).toBe(false);
    expect(body.tasks[1]?.hasSolution).toBe(true);
    for (const task of body.tasks) {
      expect("solutionSteps" in task).toBe(false);
    }
  });

  test("/minigry pokazuje jeden polecany start i krótki wybór trybu", async ({
    page,
  }) => {
    await page.goto("/minigry");

    await expect(
      page.getByRole("heading", { level: 1, name: /Minigry/ }),
    ).toBeVisible();
    await expect(page.getByText("Mentalny sprint")).toHaveCount(0);
    await expect(page.getByText("Szybki sprint")).toHaveCount(0);
    await expect(page.getByText("Długi dystans")).toHaveCount(0);
    const recommendedStart = page.getByTestId("minigame-recommended-start");
    await expect(recommendedStart).toBeVisible();
    await expect(recommendedStart).toHaveAttribute(
      "href",
      "/minigry/prawda-falsz?mode=time_attack",
    );
    await expect(page.getByText("Dla Ciebie")).toHaveCount(0);

    await expect(
      page.getByRole("heading", { name: "Tryb gry" }),
    ).toBeVisible();
    await expect(page.getByTestId("minigame-mode-time_attack")).toHaveAttribute(
      "href",
      "/minigry/modes/time-attack",
    );
    await expect(
      page.getByTestId("minigame-mode-time_attack"),
    ).toContainText("Na czas");
  });

  test("/minigry odkrywa karty dopiero po otwarciu obszaru", async ({
    page,
  }) => {
    await page.goto("/minigry");

    const arithmeticGroup = page.getByTestId("minigame-group-rachunki");
    const multiplicationLink = arithmeticGroup.getByRole("link", {
      name: /Mnożenie/,
    });

    await expect(arithmeticGroup).toBeVisible();
    await expect(multiplicationLink).toBeHidden();
    await arithmeticGroup.locator("summary").click();
    await expect(multiplicationLink).toBeVisible();
    await expect(multiplicationLink).toHaveAttribute(
      "href",
      "/minigry/mnozenie?mode=time_attack",
    );

    // Biblioteka jest jedną listą obszarów - bez drugiego, zagnieżdżonego
    // poziomu „dopasowane / pełna biblioteka”.
    await expect(page.getByTestId("minigame-group-funkcje")).toHaveCount(1);
    await expect(
      page.getByTestId("minigame-group-funkcje").getByRole("link", {
        name: /Funkcje/,
      }),
    ).toBeHidden();
  });

  test("/minigry zachowuje tryb po przejściu do katalogu trybu", async ({
    page,
  }) => {
    await page.goto("/minigry");
    await page.getByTestId("minigame-mode-survival").click();

    await expect(page).toHaveURL(/\/minigry\/modes\/survival$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Bez limitu czasu" }),
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

  test("matura w szybkiej próbie ma własne zadania", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Matura", exact: true }).click();

    await expect(page.getByText("Ile wynosi log₂ 8?")).toBeVisible();
  });

  test("gość nie widzi ostatniego tematu zapisanego lokalnie", async ({
    page,
  }) => {
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

    await expect(page.getByText("OSTATNI TEMAT")).toHaveCount(0);
    await expect(page.getByText("Przykładowa sesja")).toHaveCount(0);
    await expect(page.getByText("SZYBKA PRÓBA")).toBeVisible();
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
    // Po błędzie arena pokazuje podpowiedź o połowie XP za ponowne podejście.
    await expect(
      page.getByText(
        "Spróbuj jeszcze raz - po poprawnej odpowiedzi dostaniesz połowę XP.",
      ),
    ).toBeVisible();
    await answerButtons.nth(correctIndex).click();
    await expect(page.getByText("Dobra odpowiedź!")).toBeVisible();
  });

  test("lista treningu pokazuje tematy z lokalnego cache", async ({ page }) => {
    await page.goto("/trening");
    await expect(page.getByRole("heading", { name: "Trening" })).toBeVisible();
    await expect(
      page.getByTestId("training-department-navigation"),
    ).toBeVisible();

    const nextStep = page.getByTestId("training-next-step");
    await expect(nextStep).toBeVisible();
    await expect(
      nextStep.getByRole("link", { name: /Otwórz temat/ }),
    ).toHaveAttribute(
      "href",
      /^\/trening\/egzamin-osmoklasisty\/liczby\//,
    );

    // Na desktopie tematy wybranego działu są widoczne od razu - bez
    // dodatkowego przycisku „Pokaż tematy”.
    await expect(page.getByTestId("training-topic-list")).toBeVisible();
    await expect(page.getByText("58 tematów")).toBeVisible();
  });

  test("panel działu pokazuje tematy bez dodatkowego kliknięcia", async ({
    page,
  }) => {
    await page.goto("/trening");
    const departmentButton = page.getByRole("button", {
      name: /Liczby i działania/,
    });
    const departmentPanel = page.getByTestId("training-department-panel");
    const topicLinks = page.getByTestId("training-topic-list").locator(
      'a[href^="/trening/egzamin-osmoklasisty/liczby/"]',
    );
    await expect(departmentButton).toBeVisible();
    await expect(departmentPanel).toBeVisible();
    await expect(page.getByTestId("training-topic-list")).toBeVisible();
    await expect(topicLinks).toHaveCount(14);
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

  test("arkusze CKE prowadzą do lokalnych zadań", async ({ page }) => {
    await page.goto("/trening/arkusze");
    await expect(
      page.getByRole("heading", { level: 1, name: /Arkusze/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Pełne archiwum arkuszy CKE" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "Arkusze z 2026 roku" }),
    ).toHaveCount(0);
    await expect(page.locator('a[href*="egzaminy.gov.pl"]')).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: /Matura podstawowa/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Matura - maj 2025/ }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Matura - maj 2025/ }).first(),
    ).toHaveAttribute("href", "/trening/arkusze/arkusz-m25-maj");
    await expect(page.getByText("Brak arkuszy")).toHaveCount(0);
    await expect(page.getByText("TypeError")).toHaveCount(0);
    await page.getByRole("link", { name: /Matura - maj 2025/ }).first().click();
    await expect(
      page.getByRole("heading", { name: /Matura - maj 2025/ }).first(),
    ).toBeVisible();
  });
});

test.describe("Mobile", () => {
  test("trening nie wystaje poza ekran, a etykiety tabbara się mieszczą", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 844 });
    await page.goto("/trening");
    await page
      .getByRole("button", { name: "Tylko niezbędne" })
      .click({ timeout: 1_000 })
      .catch(() => {});
    await page.waitForTimeout(300);

    const state = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
      labels: [...document.querySelectorAll('nav[aria-label="Nawigacja mobilna"] span')].map(
        (span) => ({
          text: span.textContent,
          clipped: span.scrollWidth > span.clientWidth + 1,
        }),
      ),
    }));

    expect(state.scrollWidth).toBeLessThanOrEqual(state.viewport);
    expect(state.labels.filter((label) => label.clipped)).toEqual([]);
  });
});

test.describe("Sprawdziany do druku", () => {
  test("jedna strona druku zawiera obie grupy i klucz", async ({ page }) => {
    await page.goto(
      "/sprawdziany/druk?dzial=potegi-i-pierwiastki&grupa=AB&seed=1&klucz=1",
    );

    await expect(page.getByText(/grupa A/).first()).toBeVisible();
    await expect(page.getByText(/grupa B/).first()).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Klucz odpowiedzi/ }).first(),
    ).toBeVisible();

    await page.emulateMedia({ media: "print" });
    await expect(page.getByText(/Sprawdzian:/).first()).toBeVisible();
    await expect(page.locator("header.sticky")).toBeHidden();
    await expect(
      page.locator('[aria-label="Zgoda na pliki cookies"]'),
    ).toBeHidden();
  });
});

test.describe("Stopka", () => {
  test("nie nachodzi na treść na telefonie", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    for (const route of ["/trening", "/baza-zadan"]) {
      await page.goto(route);
      await page.waitForTimeout(500);

      const footerAfterContent = await page.evaluate(() => {
        const main = document.querySelector("main");
        const footer = document.querySelector("footer");
        if (!main || !footer) return true;
        const mainBottom = main.getBoundingClientRect().bottom + window.scrollY;
        const footerTop = footer.getBoundingClientRect().top + window.scrollY;
        return footerTop >= mainBottom - 1;
      });

      expect(footerAfterContent).toBe(true);
    }
  });
});

test.describe("Dla szkół", () => {
  test("strona dla nauczycieli prowadzi do generatora", async ({ page }) => {
    await page.goto("/dla-szkol");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /Sprawdziany, które robią się w minutę/,
      }),
    ).toBeVisible();

    await page.getByRole("link", { name: "Wypróbuj generator" }).click();
    await expect(page).toHaveURL(/\/sprawdziany$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Sprawdziany" }),
    ).toBeVisible();
  });
});
