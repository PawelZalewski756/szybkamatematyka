import { expect, test, type Page } from "@playwright/test";

/** Zamyka dolny pasek zgody na licznik wejść, który zasłania stopkę. */
async function acceptVisitorNotice(page: Page) {
  const ok = page.getByRole("button", { name: "OK", exact: true });
  await ok.click({ timeout: 3_000 }).catch(() => {});
}

test.describe("Zgłaszanie błędu", () => {
  test("gość otwiera formularz i wysyła zgłoszenie bez logowania", async ({
    page,
  }) => {
    await page.route("**/api/bug-report", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.goto("/baza-zadan");
    await acceptVisitorNotice(page);
    await page.getByRole("button", { name: "Zgłoś błąd" }).click();

    const form = page.locator("#zglos-blad form");
    await expect(form).toBeVisible();

    await form.getByLabel("Twój e-mail").fill("ala@example.com");
    await form.getByLabel("Tytuł").fill("Błąd w zadaniu 12");
    await form
      .getByLabel("Opis")
      .fill("Po wybraniu odpowiedzi B aplikacja pokazuje błąd zamiast wyniku.");

    await form.getByRole("button", { name: "Wyślij zgłoszenie" }).click();

    await expect(
      page.getByText("Dziękujemy! Zgłoszenie zostało wysłane", {
        exact: false,
      }),
    ).toBeVisible();
    await expect(form.getByLabel("Twój e-mail")).toHaveValue("");
  });

  test("pusty formularz pokazuje błąd walidacji", async ({ page }) => {
    await page.goto("/baza-zadan");
    await acceptVisitorNotice(page);
    await page.getByRole("button", { name: "Zgłoś błąd" }).click();

    await page
      .locator("#zglos-blad form")
      .getByRole("button", { name: "Wyślij zgłoszenie" })
      .click();

    await expect(page.getByText("Podaj poprawny adres e-mail.")).toBeVisible();
  });
});
