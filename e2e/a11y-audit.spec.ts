import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Automatyczny audyt dostępności (axe-core) kluczowych stron publicznych.
 *
 * Zakres: 12 tras × 2 motywy (jasny/ciemny) × 2 szerokości (390/1280).
 * Test ma być bramką: każda nowa reguła naruszona na tych stronach czerwieni
 * CI, zanim trafi do użytkownika.
 *
 * Dwie świadome decyzje:
 * 1. Skip link „Przejdź do treści" jest wykluczony z reguły `region` - stoi
 *    poza landmarkami celowo, jako pierwszy element fokusowalny w DOM
 *    (ten sam wzorzec co GOV.UK); axe zgłasza go jako treść poza regionem.
 * 2. Przed skanem czekamy 1,2 s. Framer Motion animuje `opacity` mimo
 *    `prefers-reduced-motion`, a axe mierzy kolor w pikselach - skan
 *    w trakcie animacji dawał fałszywy kontrast (np. 4,17 zamiast 5,2).
 */

const ROUTES = [
  "/",
  "/baza-zadan",
  "/cennik",
  "/login",
  "/trening",
  "/diagnostyka",
  "/plan-klasy",
  "/matura-rozszerzona",
  "/sprawdziany",
  "/dla-szkol",
  "/minigry",
  "/powtorki",
] as const;

const THEMES = ["light", "dark"] as const;
const WIDTHS = [390, 1280] as const;

for (const theme of THEMES) {
  test.describe(`Audyt axe: motyw ${theme}`, () => {
    for (const width of WIDTHS) {
      test(`${width} px`, async ({ page }) => {
        test.setTimeout(180_000);
        await page.addInitScript(
          (value) => window.localStorage.setItem("sm-theme", value),
          theme,
        );
        await page.setViewportSize({ width, height: 900 });

        const failures: string[] = [];

        for (const route of ROUTES) {
          await page.goto(route);
          await page.waitForTimeout(1_200);

          const results = await new AxeBuilder({ page })
            .exclude('a[href="#main-content"]')
            .analyze();

          for (const violation of results.violations) {
            failures.push(
              `${theme} ${width}px ${route}: ${violation.id} (${violation.impact}) ×${violation.nodes.length} - ${violation.help}`,
            );
          }
        }

        expect(
          failures,
          `Naruszenia dostępności:\n${failures.join("\n")}`,
        ).toEqual([]);
      });
    }
  });
}
