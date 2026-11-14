import { describe, expect, it } from "vitest";
import {
  containsMathDelimiters,
  repairEscapedLatex,
  splitMathText,
  unwrapPlainNumberMath,
} from "@/lib/math/render-math-text";

describe("splitMathText", () => {
  it("parses inline math", () => {
    expect(splitMathText("$(0, 3)$")).toEqual([
      { kind: "inline", latex: "(0, 3)" },
    ]);
  });

  it("parses mixed text and inline math", () => {
    expect(splitMathText("Wykres $y = -x + 3$ przecina oś OY")).toEqual([
      { kind: "text", text: "Wykres " },
      { kind: "inline", latex: "y = -x + 3" },
      { kind: "text", text: " przecina oś OY" },
    ]);
  });

  it("parses display math", () => {
    expect(splitMathText("Oblicz $$\\frac{1}{2}$$")).toEqual([
      { kind: "text", text: "Oblicz " },
      { kind: "display", latex: "\\frac{1}{2}" },
    ]);
  });
});

describe("containsMathDelimiters", () => {
  it("detects dollar math", () => {
    expect(containsMathDelimiters("$(0,3)$")).toBe(true);
    expect(containsMathDelimiters("tekst zwykły")).toBe(false);
  });
});

describe("repairEscapedLatex", () => {
  it("odtwarza komendy sklejone przez znaki kontrolne", () => {
    // \t w źródle danych zamieniało \times na TAB + "imes".
    expect(repairEscapedLatex("$ 15 + (5 \times 3)^2 - 10 $")).toBe(
      "$ 15 + (5 \\times 3)^2 - 10 $",
    );
    expect(repairEscapedLatex("$\\left( \frac{1}{2} \right)$")).toBe(
      "$\\left( \\frac{1}{2} \\right)$",
    );
    expect(
      repairEscapedLatex("$$\begin{cases} x \\\\ y \\end{cases}$$"),
    ).toBe("$$\\begin{cases} x \\\\ y \\end{cases}$$");
    expect(repairEscapedLatex("$a \neq b$")).toBe("$a \\neq b$");
  });

  it("nie rusza poprawnego LaTeX-a ani nowych linii poza matematyką", () => {
    expect(repairEscapedLatex("$a \\times b$")).toBe("$a \\times b$");
    expect(repairEscapedLatex("pierwsza linia\nDruga linia")).toBe(
      "pierwsza linia\nDruga linia",
    );
  });
});

describe("unwrapPlainNumberMath", () => {
  it("zamienia same liczby na zwykły tekst", () => {
    expect(unwrapPlainNumberMath("Ania ma $169$ zł. Kupiła $3$ bilety.")).toBe(
      "Ania ma 169 zł. Kupiła 3 bilety.",
    );
    expect(unwrapPlainNumberMath("Cena $1 000$ zł i $3,14$ zł")).toBe(
      "Cena 1 000 zł i 3,14 zł",
    );
  });

  it("nie rusza wzorów ani trybu display", () => {
    expect(unwrapPlainNumberMath("$$169$$")).toBe("$$169$$");
    expect(unwrapPlainNumberMath("$x^2$ i $25\\%$")).toBe("$x^2$ i $25\\%$");
    expect(unwrapPlainNumberMath("$1{,}5$")).toBe("$1{,}5$");
  });
});
