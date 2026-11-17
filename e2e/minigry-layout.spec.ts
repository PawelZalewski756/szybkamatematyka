import { expect, test, type Page } from "@playwright/test";

/**
 * Regresja layoutu minigier: równanie musi być jedną linią (bez łamania po
 * „=”), a strona nie może się rozjeżdżać w poziomie na telefonie.
 */
const WIDTHS = [390, 1280] as const;
const TRUE_FALSE_SLUGS = ["prawda-falsz", "wzory"] as const;
const CHOICE_SLUGS = ["procenty", "nawiasy"] as const;

/**
 * Start bywa klikany przed hydratacją Reacta (SSR pokazuje przycisk, ale nie
 * ma jeszcze handlera), dlatego ponawiamy klik, aż pojawi się pytanie.
 */
async function startGame(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle").catch(() => {});
  await expect(async () => {
    const start = page.getByRole("button", { name: "Start" });
    if (await start.isVisible().catch(() => false)) {
      await start.click({ timeout: 5_000 });
    }
    await expect(page.locator(".katex").first()).toBeVisible({
      timeout: 8_000,
    });
  }).toPass({ timeout: 45_000 });
}

for (const width of WIDTHS) {
  test.describe(`minigry ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    for (const slug of TRUE_FALSE_SLUGS) {
      test(`${slug}: równanie w jednej linii`, async ({ page }) => {
        await page.goto(`/minigry/${slug}`);
        await startGame(page);

        // Łamanie po „=” tworzyło drugi blok KaTeX, którego treść zaczynała
        // się od „=”. Nie ma takiego bloku = równanie jest w jednej linii.
        const startingWithEquals = await page
          .locator(".katex")
          .evaluateAll((elements) =>
            elements.filter((element) =>
              (element.textContent ?? "").trim().startsWith("="),
            ).length,
          );
        expect(startingWithEquals).toBe(0);

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        );
        expect(overflow).toBeLessThanOrEqual(1);
      });
    }

    for (const slug of CHOICE_SLUGS) {
      test(`${slug}: odpowiedzi mieszczą się w ekranie`, async ({ page }) => {
        await page.goto(`/minigry/${slug}`);
        await startGame(page);

        const overflow = await page.evaluate(() => {
          const vw = window.innerWidth;
          const doc = document.documentElement.scrollWidth;
          const buttons = [...document.querySelectorAll("button")].filter(
            (button) => button.textContent?.trim() !== "Start",
          );
          const wide = buttons.filter((button) => {
            const rect = button.getBoundingClientRect();
            return rect.width > 0 && (rect.left < -1 || rect.right > vw + 1);
          });
          return { doc, vw, wide: wide.length };
        });

        expect(overflow.doc - overflow.vw).toBeLessThanOrEqual(1);
        expect(overflow.wide).toBe(0);
      });
    }
  });
}
