import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MathText } from "@/components/trening/MathText";

function render(content: string): string {
  return renderToStaticMarkup(createElement(MathText, { content }));
}

describe("MathText", () => {
  it("nie pokazuje nadmiarowego $ ani surowego LaTeX-a (zrzut ekranu 1)", () => {
    const html = render(
      "Oblicz wartość wyrażenia $50 - (24 \\div 6 + 2 \\times 5)$$",
    );
    expect(html).not.toContain("$");
    expect(html).not.toContain("katex-error");
    expect(html).toContain("<mo>÷</mo>");
    expect(html).toContain("<mo>×</mo>");
    expect(html).toContain("Oblicz wartość wyrażenia");
  });

  it("renderuje \\times zamiast zjedzonego `imes` (zrzut ekranu 2)", () => {
    const html = render(
      "Oblicz wartość wyrażenia $15 + (5\u0009imes3)^2 - 10$.",
    );
    expect(html).not.toContain("\u0009");
    expect(html).not.toContain("katex-error");
    expect(html).toContain("<mo>×</mo>");
    expect(html).toContain("\\times");
  });

  it("nie zostawia czerwonego błędu KaTeX dla niezrozumiałej formuły", () => {
    const html = render("Wartość $\\frac{1}{2$ wynosi 0,5");
    expect(html).not.toContain("katex-error");
    expect(html).not.toContain("\\frac");
  });

  it("renderuje poprawne zadanie bez zmian", () => {
    const html = render("Oblicz $2 + 2 \\cdot 2$.");
    expect(html).toContain("katex");
    expect(html).toContain("Oblicz");
  });

  it("renderuje **pogrubienie** z wyjaśnienia zamiast gwiazdek", () => {
    const html = render("Wynik to 6.\n**Odpowiedź:** $6$");
    expect(html).toContain("<strong");
    expect(html).not.toContain("**");
    expect(html).toContain("Odpowiedź:");
  });

  it("renderuje układ równań z uszkodzonym \\begin", () => {
    const html = render(
      "Rozwiąż $$ egin{cases} x + y = 5 \\\\ x - y = 1 \\end{cases}$$",
    );
    expect(html).not.toContain("katex-error");
    expect(html).not.toContain(" egin{");
    expect(html).toContain("mtable");
  });
});
