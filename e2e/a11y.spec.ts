import { expect, test, type Page } from "@playwright/test";

/**
 * Testy klawiatury dla dialogów mobilnych.
 *
 * Dialogi miały `aria-modal="true"` i zamykanie Escape, ale Tab wychodził
 * do treści pod spodem. Hook `useFocusTrap` więzi fokus i oddaje go
 * przyciskowi, który dialog otworzył.
 */

async function focusIsInside(page: Page, dialog: ReturnType<Page["locator"]>) {
  return dialog.evaluate((element) => element.contains(document.activeElement));
}

async function focusableCount(dialog: ReturnType<Page["locator"]>) {
  return dialog.evaluate(
    (element) =>
      element.querySelectorAll(
        "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])",
      ).length,
  );
}

test.describe("A11y: dialogi mobilne", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("menu Więcej więzi fokus i oddaje go przyciskowi", async ({ page }) => {
    await page.goto("/");

    const trigger = page
      .getByRole("navigation", { name: "Nawigacja mobilna" })
      .getByRole("button", { name: "Więcej" });
    await trigger.click();

    const dialog = page.getByRole("dialog", { name: "Więcej" });
    await expect(dialog).toBeVisible();

    const count = await focusableCount(dialog);
    expect(count).toBeGreaterThan(1);
    // Przechodzimy przez wszystkie elementy i jeszcze dwa razy dalej:
    // bez pułapki fokus po ostatnim elemencie wyszedłby do treści pod spodem.
    for (let i = 0; i < count + 2; i += 1) {
      await page.keyboard.press("Tab");
      expect(
        await focusIsInside(page, dialog),
        `Fokus wyszedł z dialogu po Tab #${i + 1} (elementów: ${count})`,
      ).toBe(true);
    }

    await page.keyboard.press("Shift+Tab");
    expect(await focusIsInside(page, dialog)).toBe(true);

    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test("sheet Graj więzi fokus i zamyka się Escape", async ({ page }) => {
    await page.goto("/");

    const trigger = page
      .getByRole("navigation", { name: "Nawigacja mobilna" })
      .getByRole("button", { name: "Graj" });
    await trigger.click();

    const dialog = page.getByRole("dialog", { name: "Graj" });
    await expect(dialog).toBeVisible();

    const count = await focusableCount(dialog);
    expect(count).toBeGreaterThan(1);
    for (let i = 0; i < count + 2; i += 1) {
      await page.keyboard.press("Tab");
      expect(
        await focusIsInside(page, dialog),
        `Fokus wyszedł z dialogu po Tab #${i + 1} (elementów: ${count})`,
      ).toBe(true);
    }

    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
});
