import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const ROUTES = ["/", "/login", "/baza-zadan", "/polityka-prywatnosci"] as const;

test.describe("WCAG smoke", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("szybka-matma-school-class", "klasa-8");
      localStorage.setItem("szybka-matma-learning-path", "sp");
    });
  });

  for (const route of ROUTES) {
    test(`${route} nie ma automatycznie wykrywalnych naruszeń WCAG A/AA`, async ({
      page,
    }) => {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      expect(results.violations).toEqual([]);
    });
  }
});

