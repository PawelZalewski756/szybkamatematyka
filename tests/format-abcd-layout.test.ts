import { describe, expect, it } from "vitest";
import { normalizeAbcdLayout } from "@/lib/baza-zadan/cke/format-abcd-layout";
import { formatCkeMathText } from "@/lib/baza-zadan/cke/format-cke-math";

describe("normalizeAbcdLayout", () => {
  it("rozdziela opcje sklejone w jednej linii", () => {
    const out = normalizeAbcdLayout("Liczba $z$ jest równa A) 4B) 5C) 6D) 7");
    expect(out.split("\n").map((l) => l.trim())).toEqual([
      "Liczba $z$ jest równa",
      "A) 4",
      "B) 5",
      "C) 6",
      "D) 7",
    ]);
  });

  it("domyka urwany LaTeX w opcji", () => {
    const out = normalizeAbcdLayout("...... C) $a$ D) $S = \\frac{1}{2}n");
    expect(out).toContain("D) $S = \\frac{1}{2}n$");
  });

  it("nie rusza P(A) i P(B) w tekście", () => {
    const text = "Wiadomo, że P(A) = 0,3 oraz P(B) = 0,5.";
    expect(normalizeAbcdLayout(text)).toBe(text);
  });
});

describe("formatCkeMathText", () => {
  it("nie zamienia 'a kąt' na indeks dolny", () => {
    const out = formatCkeMathText("Kąt $CDA$ ma miarę 50, a kąt $COB$ ma miarę 30.");
    expect(out).toContain("a kąt");
    expect(out).not.toContain("a_{k}");
  });
});
