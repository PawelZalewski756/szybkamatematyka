import { describe, expect, it } from "vitest";
import {
  balanceMathDelimiters,
  findMathTextIssues,
  latexToPlainText,
  normalizeMathText,
  repairDamagedMathCommands,
  repairLatexControlChars,
  scanMathSegments,
} from "@/lib/math/normalize-math-text";

describe("repairLatexControlChars", () => {
  it("odtwarza \\times zjedzone przez sekwencję \\t", () => {
    // Dokładnie to, co widzi użytkownik: `5imes3` w treści zadania.
    expect(repairLatexControlChars("$15 + (5\u0009imes3)^2 - 10$")).toBe(
      "$15 + (5\\times3)^2 - 10$",
    );
  });

  it("odtwarza inne komendy uszkodzone przez \\t, \\f, \\b, \\r", () => {
    expect(repairLatexControlChars("$\\frac{1}{2}$".replace("\\f", "\u000C"))).toBe(
      "$\\frac{1}{2}$",
    );
    expect(repairLatexControlChars("\u000Crac{1}{2}")).toBe("\\frac{1}{2}");
    expect(repairLatexControlChars("\u0008eta")).toBe("\\beta");
    expect(repairLatexControlChars("\u000Dightarrow")).toBe("\\rightarrow");
    expect(repairLatexControlChars("\u0009heta")).toBe("\\theta");
  });

  it("nie rusza prawdziwych nowych linii i tabulatorów", () => {
    const text =
      "Krok 1.\nElement pierwszy\nnie wiem\nnotatka\ni tworzenie informacji\n\ne) punkt\n\td) punkt";
    expect(repairLatexControlChars(text)).toBe(text);
  });

  it("nie zamienia polskiego \\ni w symbol ∋", () => {
    expect(repairLatexControlChars("Wykorzystanie\ni tworzenie")).toBe(
      "Wykorzystanie\ni tworzenie",
    );
  });

  it("naprawia \\neq zapisane w JSON jako \\n", () => {
    expect(repairLatexControlChars("gdzie $b \u000Aeq 0$")).toBe(
      "gdzie $b \\neq 0$",
    );
  });
});

describe("balanceMathDelimiters", () => {
  it("usuwa nadmiarowy $ po zamknięciu formuły", () => {
    expect(balanceMathDelimiters("$50 - (24 \\div 6)$$")).toBe(
      "$50 - (24 \\div 6)$",
    );
  });

  it("usuwa nadmiarowy $ po zamknięciu $$", () => {
    expect(balanceMathDelimiters("$$\\frac{1}{2}$$$")).toBe("$$\\frac{1}{2}$$");
  });

  it("domyka niedomknięty $ na końcu linii", () => {
    expect(balanceMathDelimiters("D) $x^2 - 2x + 15")).toBe("D) $x^2 - 2x + 15$");
    expect(balanceMathDelimiters("linia\n$S = n^2\nnastępna")).toBe(
      "linia\n$S = n^2$\nnastępna",
    );
    expect(balanceMathDelimiters("a$b")).toBe("a$b$");
  });

  it("domyka niedomknięty $$", () => {
    expect(balanceMathDelimiters("$$S = n^2")).toBe("$$S = n^2$$");
  });

  it("zostawia pojedynczy $ w cenie bez zmian", () => {
    expect(balanceMathDelimiters("Koszt to $5")).toBe("Koszt to $5");
    expect(balanceMathDelimiters("Cena 5$")).toBe("Cena 5$");
  });
});

describe("scanMathSegments", () => {
  it("dzieli poprawną treść", () => {
    expect(scanMathSegments("Wykres $y = -x + 3$ przecina oś OY")).toEqual([
      { kind: "text", text: "Wykres " },
      { kind: "inline", latex: "y = -x + 3" },
      { kind: "text", text: " przecina oś OY" },
    ]);
  });

  it("zachowuje spacje wewnątrz $$...$$", () => {
    expect(scanMathSegments("$$ \\frac{a}{b} $$")).toEqual([
      { kind: "display", latex: " \\frac{a}{b} " },
    ]);
  });
});

describe("repairDamagedMathCommands", () => {
  it("odtwarza \\begin zjedzone przez \\b", () => {
    expect(
      repairDamagedMathCommands(" egin{cases} x + y = 5 \\\\ x - y = 1 \\end{cases}"),
    ).toBe(" \\begin{cases} x + y = 5 \\\\ x - y = 1 \\end{cases}");
  });

  it("odtwarza \\right zjedzone przez \\r", () => {
    expect(repairDamagedMathCommands("\\left( 3^{-1} + 2^{-1} ight)^{-1}")).toBe(
      "\\left( 3^{-1} + 2^{-1} \\right)^{-1}",
    );
  });

  it("nie rusza poprawnych formuł", () => {
    const latex = "\\begin{cases} x = 1 \\end{cases}";
    expect(repairDamagedMathCommands(latex)).toBe(latex);
  });
});

describe("normalizeMathText", () => {
  it("naprawia zadanie z nadmiarowym $ (zrzut ekranu 1)", () => {
    expect(
      normalizeMathText(
        "Oblicz wartość wyrażenia $50 - (24 \\div 6 + 2 \\times 5)$$",
      ),
    ).toBe("Oblicz wartość wyrażenia $50 - (24 \\div 6 + 2 \\times 5)$");
  });

  it("naprawia zadanie z \\times zamienionym na tabulator (zrzut ekranu 2)", () => {
    const broken = "Oblicz wartość wyrażenia $15 + (5\u0009imes3)^2 - 10$.";
    expect(normalizeMathText(broken)).toBe(
      "Oblicz wartość wyrażenia $15 + (5\\times3)^2 - 10$.",
    );
  });

  it("owija surowy LaTeX, gdy brakuje obu $", () => {
    expect(
      normalizeMathText("Oblicz wartość wyrażenia 50 - (24 \\div 6 + 2 \\times 5)"),
    ).toBe("Oblicz wartość wyrażenia $50 - (24 \\div 6 + 2 \\times 5)$");
  });

  it("zamienia delimitery \\( \\) i \\[ \\] na $", () => {
    expect(normalizeMathText("\\(x\\) oraz \\[y\\]")).toBe("$x$ oraz $$y$$");
  });

  it("nie zmienia poprawnych treści", () => {
    const samples = [
      "$(0, 3)$",
      "Wykres $y = -x + 3$ przecina oś OY",
      "Oblicz $$\\frac{1}{2}$$",
      "Zadanie $\\frac{1}{2}$ i $x$",
      "$$ \\frac{a}{b} = \\frac{c}{d} $$",
      "Koszt to $5",
    ];
    for (const sample of samples) {
      expect(normalizeMathText(sample)).toBe(sample);
    }
  });

  it("jest idempotentny", () => {
    const samples = [
      "Oblicz wartość wyrażenia $50 - (24 \\div 6 + 2 \\times 5)$$",
      "Oblicz wartość wyrażenia $15 + (5\u0009imes3)^2 - 10$.",
      "linia\n$S = n^2\nnastępna",
      "A) $x$ B) $y$",
    ];
    for (const sample of samples) {
      const once = normalizeMathText(sample);
      expect(normalizeMathText(once)).toBe(once);
    }
  });

  it("usuwa niewidoczne znaki (ZWSP/ZWNJ/BOM)", () => {
    expect(normalizeMathText("Oblicz $2^{2}$\u200B\u200C\u200D")).toBe(
      "Oblicz $2^{2}$",
    );
  });

  it("naprawia resztki komend w formule, gdy znak sterujący zamienił się w spację", () => {
    expect(
      normalizeMathText(
        "Rozwiąż $$ egin{cases} x + y = 5 \\\\ x - y = 1 \\end{cases}$$",
      ),
    ).toBe("Rozwiąż $$ \\begin{cases} x + y = 5 \\\\ x - y = 1 \\end{cases}$$");
  });

  it("nie traktuje dosłownego \\n w prozie jako komendy LaTeX", () => {
    const prose = "### Temat:\\n\\nMnożenie tych samych podstaw:\\n$$a^m \\cdot a^n$$";
    expect(normalizeMathText(prose)).toBe(prose);
  });
});

describe("findMathTextIssues", () => {
  it("wykrywa oba typy błędów", () => {
    expect(
      findMathTextIssues("$50 - (24 \\div 6 + 2 \\times 5)$$"),
    ).toContain("niedomknięte lub nadmiarowe $");
    expect(findMathTextIssues("$15 + (5\u0009imes3)^2$")).toContain(
      "uszkodzona sekwencja LaTeX (znak sterujący zamiast ukośnika)",
    );
  });

  it("nie zgłasza problemów dla poprawnych treści", () => {
    expect(findMathTextIssues("Wykres $y = -x + 3$ przecina oś OY")).toEqual([]);
  });
});

describe("latexToPlainText", () => {
  it("daje czytelny tekst zamiast surowego LaTeX-a", () => {
    expect(latexToPlainText("50 - (24 \\div 6 + 2 \\times 5)")).toBe(
      "50 - (24 ÷ 6 + 2 × 5)",
    );
    expect(latexToPlainText("\\frac{\\sqrt{2}}{2}")).toBe("√(2)/2");
    expect(latexToPlainText("\\alpha^2")).toBe("α²");
  });
});
