import { describe, expect, it } from "vitest";
import {
  containsMathDelimiters,
  ensureMathDelimiters,
  fixMarkdownTables,
  normalizeMathText,
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

describe("normalizeMathText", () => {
  it("zamienia \\(...\\) i \\[...\\] na dolary", () => {
    expect(
      normalizeMathText(String.raw`Ciąg \(a_n\) ma wzór \[a_n = 2^n\]`),
    ).toBe(String.raw`Ciąg $a_n$ ma wzór $$a_n = 2^n$$`);
  });

  it("naprawia urwane \\begin i \\right", () => {
    expect(
      normalizeMathText(String.raw`$$ egin{cases} x = 1 \end{cases} $$`),
    ).toBe(String.raw`$$\begin{cases} x = 1 \end{cases} $$`);
    expect(normalizeMathText(String.raw`$\left( 2 ight)^2$`)).toBe(
      String.raw`$\left( 2 \right)^2$`,
    );
  });

  it("dokłada brakujący dolar", () => {
    expect(normalizeMathText("$x^2 + 2")).toBe("$x^2 + 2$");
    expect(normalizeMathText(String.raw`$$\langle -1, 7 ]$`)).toBe(
      String.raw`$\langle -1, 7 ]$`,
    );
    expect(normalizeMathText(String.raw`rac{256}{3}\pi`)).toBe(
      String.raw`\frac{256}{3}\pi`,
    );
  });

  it("skleja rozbite dolary z $$", () => {
    expect(normalizeMathText("Oblicz $ $ $ 50 - 2 $ $")).toBe(
      "Oblicz $$ 50 - 2 $$",
    );
    expect(normalizeMathText("Oblicz $ $ 50 - 2 $ $")).toBe(
      "Oblicz $$ 50 - 2 $$",
    );
  });
});

describe("ensureMathDelimiters", () => {
  it("opakowuje wzór bez dolarów", () => {
    expect(
      ensureMathDelimiters(String.raw`x \in \langle 2, 3 \rangle`),
    ).toBe(String.raw`$x \in \langle 2, 3 \rangle$`);
    expect(ensureMathDelimiters(String.raw`5\sqrt{2}`)).toBe(
      String.raw`$5\sqrt{2}$`,
    );
  });

  it("nie opakowuje zdań ani tekstu bez komend", () => {
    expect(ensureMathDelimiters(String.raw`Oblicz x \le -1`)).toBe(
      String.raw`Oblicz x \le -1`,
    );
    expect(ensureMathDelimiters("x = 2")).toBe("x = 2");
  });

  it("owija wzór, zostawiając jednostkę jako tekst", () => {
    expect(ensureMathDelimiters(String.raw`15\sqrt{2} metrów`)).toBe(
      String.raw`$15\sqrt{2}$ metrów`,
    );
    expect(ensureMathDelimiters(String.raw`864\pi cm`)).toBe(
      String.raw`$864\pi$ cm`,
    );
    expect(ensureMathDelimiters(String.raw`96\sqrt{3} + 240 cm`)).toBe(
      String.raw`$96\sqrt{3} + 240$ cm`,
    );
  });
});

describe("fixMarkdownTables", () => {
  it("uzupełnia nagłówek tabeli P/F", () => {
    expect(
      fixMarkdownTables("| |\n|:---|:---:|:---:|\n| a | P | F |"),
    ).toBe("| | P | F |\n|:---|:---:|:---:|\n| a | P | F |");
  });

  it("uzupełnia nagłówek tabeli z jedną komórką", () => {
    expect(fixMarkdownTables("| CENNIK |\n|---|---|\n| A | B |")).toBe(
      "| CENNIK | |\n|---|---|\n| A | B |",
    );
  });

  it("nie rusza poprawnych tabel", () => {
    const input = "| | P | F |\n|---|---|---|\n| a | | |";
    expect(fixMarkdownTables(input)).toBe(input);
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
