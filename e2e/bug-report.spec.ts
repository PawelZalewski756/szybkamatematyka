import { expect, test, type Page } from "@playwright/test";

/** Zamyka dolny pasek zgody na licznik wejść, który zasłania stopkę. */
async function acceptVisitorNotice(page: Page) {
  const ok = page.getByRole("button", { name: "OK", exact: true });
  await ok.click({ timeout: 3_000 }).catch(() => {});
}

test.describe("Zgłaszanie błędu", () => {
  test("stopka prowadzi do strony zgłoszenia", async ({ page }) => {
    await page.goto("/baza-zadan");
    await acceptVisitorNotice(page);

    await page.getByRole("link", { name: "Zgłoś błąd" }).click();

    await expect(page).toHaveURL(/\/zglos-blad$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Zgłoś błąd" }),
    ).toBeVisible();
    await expect(page.getByLabel("Twój e-mail")).toBeVisible();
  });

  test("gość wysyła zgłoszenie bez logowania", async ({ page }) => {
    await page.route("**/api/bug-report", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.goto("/zglos-blad");
    await acceptVisitorNotice(page);

    await page.getByLabel("Twój e-mail").fill("ala@example.com");
    await page.getByLabel("Tytuł").fill("Błąd w zadaniu 12");
    await page
      .getByLabel("Opis")
      .fill("Po wybraniu odpowiedzi B aplikacja pokazuje błąd zamiast wyniku.");

    await page.getByRole("button", { name: "Wyślij zgłoszenie" }).click();

    await expect(
      page.getByRole("heading", { name: "Dziękujemy za zgłoszenie" }),
    ).toBeVisible();
  });

  test("pusty formularz pokazuje błąd walidacji", async ({ page }) => {
    await page.goto("/zglos-blad");
    await acceptVisitorNotice(page);

    await page.getByRole("button", { name: "Wyślij zgłoszenie" }).click();

    await expect(page.getByText("Podaj poprawny adres e-mail.")).toBeVisible();
  });
});
