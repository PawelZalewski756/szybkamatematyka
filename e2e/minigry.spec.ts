import { expect, test } from "@playwright/test";

test.describe("Minigry", () => {
  test("startuje po odliczaniu i pokazuje wynik odpowiedzi", async ({
    page,
  }) => {
    await page.goto("/minigry/mnozenie");

    await page.getByRole("button", { name: "Start", exact: true }).click();

    await expect(page.getByText("Przygotuj się")).toBeVisible();
    await expect(page.getByText("Przygotuj się")).toBeHidden({
      timeout: 6_000,
    });

    const answers = page.locator("main button").filter({ hasText: /^\d+$/ });
    await expect(answers.first()).toBeVisible({ timeout: 5_000 });
    await answers.first().click();

    await expect(page.getByText(/Dobrze!|Poprawna odpowiedź/)).toBeVisible({
      timeout: 3_000,
    });
  });
});
