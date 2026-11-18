import { expect, test } from "@playwright/test";

test.describe("Trening - pełny zakres tematów", () => {
  test("liceum 3 widzi funkcję kwadratową i wszystkie działy CKE", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem("szybka-matma-school-class", "liceum-3");
      localStorage.setItem("szybka-matma-learning-path", "srednia");
    });

    await page.goto("/trening");
    await expect(page.getByRole("heading", { name: "Trening" })).toBeVisible();

    // Plan klasy nie może filtrować treningu: funkcja kwadratowa jest w
    // programie liceum 2, a nie w planie liceum 3.
    await page.getByText("Znajdź temat lub filtruj").click();
    await page.getByLabel("Szukaj tematu").fill("funkcja kwadratowa");

    await expect(page.getByText("Funkcja kwadratowa", { exact: true })).toBeVisible();
    await expect(page.getByText(/Znaleziono 1 temat/)).toBeVisible();
  });

  test("przełącznik egzaminu nie gubi tematów po zmianie klasy", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.clear();
    });

    await page.goto("/trening");
    await page.getByRole("tab", { name: "Matura podstawowa" }).click();

    const summary = page.getByLabel("Podsumowanie postępu");
    await expect(summary).toContainText("tematów");
    await expect(summary).not.toContainText("11 tematów");
  });
});
