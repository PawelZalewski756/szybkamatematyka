import { expect, test } from "@playwright/test";

function pathnameOf(href: string | null): string {
  if (!href) return "";
  try {
    return new URL(href).pathname;
  } catch {
    return href;
  }
}

test.describe("SEO metadata", () => {
  test("strona główna ma canonical i og:url na siebie", async ({ page }) => {
    await page.goto("/");

    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute("href");
    expect(pathnameOf(canonical)).toBe("/");

    const ogUrl = await page
      .locator('meta[property="og:url"]')
      .getAttribute("content");
    expect(pathnameOf(ogUrl)).toBe("/");
  });

  test("cennik ma og:url na swój adres", async ({ page }) => {
    await page.goto("/cennik");

    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute("href");
    expect(pathnameOf(canonical)).toBe("/cennik");

    const ogUrl = await page
      .locator('meta[property="og:url"]')
      .getAttribute("content");
    expect(pathnameOf(ogUrl)).toBe("/cennik");
  });

  test("tytuł powtórek nie dubluje marki", async ({ page }) => {
    await page.goto("/powtorki");
    const title = await page.title();
    expect(title.match(/Szybka Matematyka/g)?.length ?? 0).toBe(1);
  });

  test("matura rozszerzona ma og:url na swój adres", async ({ page }) => {
    await page.goto("/matura-rozszerzona");

    const ogUrl = await page
      .locator('meta[property="og:url"]')
      .getAttribute("content");
    expect(pathnameOf(ogUrl)).toBe("/matura-rozszerzona");
  });
});
