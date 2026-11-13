import katex from "katex";
import { describe, expect, it } from "vitest";
import {
  containsMathDelimiters,
  splitMathText,
} from "@/lib/math/render-math-text";

/** Każdy fragment matematyczny musi dać się wyrenderować (bez katex-error). */
function assertRenderable(content: string) {
  const parts = splitMathText(content);
  for (const part of parts) {
    if (part.kind === "text") {
      expect(part.text).not.toContain("$");
      expect(part.text).not.toMatch(/\\[a-zA-Z]{2,}/);
      continue;
    }
    const html = katex.renderToString(part.latex, {
      displayMode: part.kind === "display",
      throwOnError: true,
      strict: "ignore",
    });
    expect(html).not.toContain("katex-error");
  }
  return parts;
}

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

  it("naprawia nadmiarowy $ zamiast pokazywać go w tekście", () => {
    const parts = assertRenderable(
      "Oblicz wartość wyrażenia $50 - (24 \\div 6 + 2 \\times 5)$$",
    );
    expect(parts).toEqual([
      { kind: "text", text: "Oblicz wartość wyrażenia " },
      { kind: "inline", latex: "50 - (24 \\div 6 + 2 \\times 5)" },
    ]);
  });

  it("naprawia \\times zamienione na tabulator zanim trafi do KaTeX", () => {
    const parts = assertRenderable(
      "Oblicz wartość wyrażenia $15 + (5\u0009imes3)^2 - 10$.",
    );
    expect(parts[1]).toEqual({
      kind: "inline",
      latex: "15 + (5\\times3)^2 - 10",
    });
  });

  it("domyka brakujący $ w opcji odpowiedzi", () => {
    const parts = assertRenderable("D) $x^2 - 2x + 15");
    expect(parts).toEqual([
      { kind: "text", text: "D) " },
      { kind: "inline", latex: "x^2 - 2x + 15" },
    ]);
  });

  it("renderuje poprawną treść bez zmian", () => {
    const parts = assertRenderable(
      "Kąt $\\alpha$ ma miarę $30^{\\circ}$, a $\\frac{1}{2}$ to połowa.",
    );
    expect(parts).toHaveLength(7);
  });
});

describe("containsMathDelimiters", () => {
  it("detects dollar math", () => {
    expect(containsMathDelimiters("$(0,3)$")).toBe(true);
    expect(containsMathDelimiters("tekst zwykły")).toBe(false);
  });
});
