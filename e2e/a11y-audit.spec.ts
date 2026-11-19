import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Automatyczny audyt dostępności (axe-core) stron publicznych.
 *
 * Zakres: 29 tras. Rdzeń (strona główna, nauka, płatności, konto) jest
 * sprawdzany w każdym zestawie motyw × szerokość; trasy dodatkowe (arkusze,
 * baza zadań, pojedynki, wyzwania, osiągnięcia, dokumenty) w obu motywach
 * i obu szerokościach łącznie. Dzięki temu bramka trwa ~2 min, a nie ~5.
 *
 * Dwie świadome decyzje:
 * 1. Skip link „Przejdź do treści" jest wykluczony z reguły `region` - stoi
 *    poza landmarkami celowo, jako pierwszy element fokusowalny w DOM
 *    (ten sam wzorzec co GOV.UK); axe zgłasza go jako treść poza regionem.
 * 2. Przed skanem czekamy 1,2 s. Framer Motion animuje `opacity` mimo
 *    `prefers-reduced-motion`, a axe mierzy kolor w pikselach - skan
 *    w trakcie animacji dawał fałszywy kontrast (np. 4,17 zamiast 5,2).
 */

const CORE_ROUTES = [
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

const EXTENDED_ROUTES = [
  "/arkusze",
  "/trening/arkusze",
  "/trening/arkusze/arkusz-m25-maj",
  "/baza-zadan/st-001",
  "/baza-zadan/arkusz/arkusz-e8-1",
  "/polecenia",
  "/minigry/prawda-falsz",
  "/minigry/modes/time-attack",
  "/pojedynki",
  "/wyzwania",
  "/osiagniecia",
  "/rankingi",
  "/kontakt",
  "/regulamin",
  "/polityka-prywatnosci",
  "/zglos-blad",
  "/dla-szkol/panel",
  "/sprawdziany/druk?dzial=potegi-i-pierwiastki&grupa=AB&seed=1&klucz=1",
] as const;

const ALL_ROUTES = [...CORE_ROUTES, ...EXTENDED_ROUTES];

type AuditCase = {
  name: string;
  theme: "light" | "dark";
  width: 390 | 1280;
  routes: readonly string[];
};

const AUDIT_CASES: AuditCase[] = [
  { name: "jasny motyw, telefon", theme: "light", width: 390, routes: ALL_ROUTES },
  { name: "ciemny motyw, desktop", theme: "dark", width: 1280, routes: ALL_ROUTES },
  { name: "jasny motyw, desktop", theme: "light", width: 1280, routes: CORE_ROUTES },
  { name: "ciemny motyw, telefon", theme: "dark", width: 390, routes: CORE_ROUTES },
];

for (const auditCase of AUDIT_CASES) {
  test(`Audyt axe: ${auditCase.name}`, async ({ page }) => {
    test.setTimeout(240_000);
    await page.addInitScript(
      (value) => window.localStorage.setItem("sm-theme", value),
      auditCase.theme,
    );
    await page.setViewportSize({ width: auditCase.width, height: 900 });

    const failures: string[] = [];

    for (const route of auditCase.routes) {
      await page.goto(route);
      await page.waitForTimeout(1_200);

      const results = await new AxeBuilder({ page })
        .exclude('a[href="#main-content"]')
        .analyze();

      for (const violation of results.violations) {
        failures.push(
          `${auditCase.theme} ${auditCase.width}px ${route}: ${violation.id} (${violation.impact}) ×${violation.nodes.length} - ${violation.help}`,
        );
      }
    }

    expect(
      failures,
      `Naruszenia dostępności:\n${failures.join("\n")}`,
    ).toEqual([]);
  });
}
