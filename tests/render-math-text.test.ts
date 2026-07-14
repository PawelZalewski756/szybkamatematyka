import { describe, expect, it } from "vitest";
import { containsMathDelimiters, splitMathText } from "@/lib/math/render-math-text";

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
