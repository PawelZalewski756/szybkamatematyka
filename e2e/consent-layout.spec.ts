import { expect, test } from "@playwright/test";

/**
 * Baner cookies jest `fixed` - musi rezerwować miejsce, żeby nie zasłaniać
 * przycisków i treści na dole strony (zgłoszenia uczniów o „zaginionej”
 * nawigacji).
 */
test.describe("baner cookies", () => {
  test("na telefonie rezerwuje miejsce w treści", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/baza-zadan");

    const banner = page.getByLabel("Zgoda na pliki cookies");
    await expect(banner).toBeVisible();

    const space = await page.evaluate(() => {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue("--consent-banner-space")
        .trim();
      const main = document.querySelector("main");
      return {
        space: parseFloat(value || "0"),
        paddingBottom: main ? parseFloat(getComputedStyle(main).paddingBottom) : 0,
      };
    });

    expect(space.space).toBeGreaterThan(40);
    expect(space.paddingBottom).toBeGreaterThanOrEqual(space.space);

    await page.getByRole("button", { name: "Akceptuję wszystkie" }).click();
    await expect(banner).toHaveCount(0);

    await expect
      .poll(() =>
        page.evaluate(() =>
          getComputedStyle(document.documentElement)
            .getPropertyValue("--consent-banner-space")
            .trim(),
        ),
      )
      .toBe("0px");
  });

  test("nie zasłania odpowiedzi w minigrze", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/minigry/procenty");

    await expect(page.getByLabel("Zgoda na pliki cookies")).toHaveCount(0);
  });
});
