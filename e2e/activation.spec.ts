import { expect, test } from "@playwright/test";

/**
 * Aktywacja: nowy użytkownik ma trafić do pierwszego zadania jednym kliknięciem,
 * bez przechodzenia przez drzewo egzamin → dział → temat.
 */
test.describe("aktywacja", () => {
  test("trening daje jedno kliknięcie do pierwszego zadania", async ({
    page,
  }) => {
    await page.goto("/trening");

    const cta = page.getByTestId("first-task-cta");
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/baza-zadan/st-020");

    await cta.click();

    await expect(page).toHaveURL(/\/baza-zadan\/st-020$/);
    await expect(
      page.getByRole("heading", { name: /Kolejność działań/ }),
    ).toBeVisible();
  });
});
