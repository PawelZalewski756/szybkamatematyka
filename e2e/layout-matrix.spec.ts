import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * Macierz layoutu zadań: 390 / 710 / 1280 px.
 *
 * Każdy renderer zadania (trening, baza zadań, arkusz CKE, diagnoza) jest
 * sprawdzany pod kątem:
 * - poziomego przepełnienia strony,
 * - elementów interaktywnych wychodzących za krawędź ekranu,
 * - nachodzenia na siebie opcji odpowiedzi (regresja z diagnozy).
 */

const WIDTHS = [390, 710, 1280] as const;
const HEIGHT = 900;

async function expectNoHorizontalOverflow(page: Page) {
  const { scrollWidth, innerWidth, offenders } = await page.evaluate(() => {
    const viewportWidth = window.innerWidth;
    const overflowing = Array.from(
      document.querySelectorAll<HTMLElement>("body *"),
    )
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return (
          rect.width > 0 &&
          (rect.right > viewportWidth + 1 || rect.left < -1)
        );
      })
      .slice(0, 8)
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return `${element.tagName.toLowerCase()}${element.dataset.testid ? `[data-testid="${element.dataset.testid}"]` : ""} left=${Math.round(rect.left)} right=${Math.round(rect.right)} class="${element.className.toString().slice(0, 80)}"`;
      });
    return {
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: viewportWidth,
      offenders: overflowing,
    };
  });
  expect(
    scrollWidth,
    `Strona ma poziomy overflow: ${scrollWidth}px przy viewport ${innerWidth}px\n${offenders.join("\n")}`,
  ).toBeLessThanOrEqual(innerWidth + 1);
}

async function expectWithinViewport(page: Page, locator: Locator) {
  const viewportWidth = await page.evaluate(() => window.innerWidth);
  const boxes = await locator.evaluateAll((elements) =>
    elements.map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        left: rect.left,
        right: rect.right,
        text: (element.textContent ?? "").trim().slice(0, 40),
      };
    }),
  );
  expect(boxes.length, "Brak elementów do sprawdzenia").toBeGreaterThan(0);
  for (const box of boxes) {
    expect(
      box.left,
      `Element wychodzi za lewą krawędź: "${box.text}"`,
    ).toBeGreaterThanOrEqual(-1);
    expect(
      box.right,
      `Element wychodzi za prawą krawędź: "${box.text}"`,
    ).toBeLessThanOrEqual(viewportWidth + 1);
  }
}

async function expectNoOverlaps(locator: Locator, label: string) {
  const boxes = await locator.evaluateAll((elements) =>
    elements.map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        text: (element.textContent ?? "").trim().slice(0, 40),
      };
    }),
  );
  expect(boxes.length, `Brak elementów ${label}`).toBeGreaterThan(0);

  for (let i = 0; i < boxes.length; i += 1) {
    for (let j = i + 1; j < boxes.length; j += 1) {
      const a = boxes[i];
      const b = boxes[j];
      const overlapX = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const overlapY = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      expect(
        overlapX > 1 && overlapY > 1,
        `${label} nachodzą na siebie: "${a.text}" i "${b.text}"`,
      ).toBe(false);
    }
  }
}

test.describe("Macierz layoutu zadań", () => {
  for (const width of WIDTHS) {
    test.describe(`${width} px`, () => {
      test.use({ viewport: { width, height: HEIGHT } });

      test("trening: opcje odpowiedzi mieszczą się i nie nachodzą", async ({
        page,
      }) => {
        await page.goto(
          "/trening/egzamin-osmoklasisty/liczby/kolejnosc_dzialan",
        );
        await page.getByRole("tab", { name: "Zadania" }).click();

        const options = page.getByTestId("training-answer-option");
        await expect(options.first()).toBeVisible();

        await expectNoHorizontalOverflow(page);
        await expectWithinViewport(page, options);
        await expectNoOverlaps(options, "Opcje w treningu");
      });

      test("baza zadań: karta zadania i wynik mieszczą się", async ({ page }) => {
        await page.goto("/baza-zadan/st-001");

        const choices = page.getByTestId("solver-choice");
        await expect(choices.first()).toBeVisible();
        await expectNoHorizontalOverflow(page);
        await expectWithinViewport(page, choices);
        await expectNoOverlaps(choices, "Opcje w bazie zadań");

        await choices.first().click();

        const result = page.getByTestId("solver-result");
        const next = page.getByTestId("next-task");
        await expect(result).toBeVisible();
        await expect(next).toBeVisible();
        await expectWithinViewport(page, next);
        await expectNoHorizontalOverflow(page);

        const resultBox = await result.boundingBox();
        const nextBox = await next.boundingBox();
        expect(resultBox).not.toBeNull();
        expect(nextBox).not.toBeNull();
        expect(
          nextBox!.y,
          "Przycisk następnego zadania nachodzi na wynik",
        ).toBeGreaterThanOrEqual(resultBox!.y + resultBox!.height - 1);
      });

      test("arkusz CKE: opcje odpowiedzi mieszczą się i nie nachodzą", async ({
        page,
      }) => {
        await page.goto("/trening/arkusze/arkusz-m25-maj");

        const choices = page.getByTestId("sheet-task-choice");
        await expect(choices.first()).toBeVisible();
        await expectNoHorizontalOverflow(page);
        await expectWithinViewport(page, choices);
        await expectNoOverlaps(choices, "Opcje w arkuszu CKE");
      });

      test("diagnoza: feedback i następne pytanie nie nachodzą", async ({
        page,
      }) => {
        await page.goto("/diagnostyka");
        await page.getByRole("button", { name: "Rozpocznij diagnozę" }).click();

        const choice = page.getByTestId("diagnostic-choice").first();
        await expect(choice).toBeVisible();
        await expectWithinViewport(page, page.getByTestId("diagnostic-choice"));
        await expectNoOverlaps(
          page.getByTestId("diagnostic-choice"),
          "Opcje w diagnozie",
        );

        await choice.click();

        const feedback = page.getByTestId("diagnostic-feedback");
        const next = page.getByTestId("diagnostic-next");
        await expect(feedback).toBeVisible();
        await expect(next).toBeVisible();
        await expectNoHorizontalOverflow(page);

        const feedbackBox = await feedback.boundingBox();
        const nextBox = await next.boundingBox();
        expect(feedbackBox).not.toBeNull();
        expect(nextBox).not.toBeNull();
        expect(
          nextBox!.y,
          "Przycisk diagnozy nachodzi na feedback",
        ).toBeGreaterThanOrEqual(feedbackBox!.y + feedbackBox!.height - 1);
      });
    });
  }
});
