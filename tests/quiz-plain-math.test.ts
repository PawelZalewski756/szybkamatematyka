import { describe, expect, it } from "vitest";
import {
  parseQuizMath,
  quizMathToPlainString,
  stripMathDelimiters,
} from "@/lib/math/quiz-plain-math";

describe("stripMathDelimiters", () => {
  it("zdejmuje $...$", () => {
    expect(stripMathDelimiters("$3 + 4 = 7$")).toBe("3 + 4 = 7");
  });
});

describe("parseQuizMath", () => {
  it("proste równanie bez LaTeX", () => {
    expect(quizMathToPlainString("75% z 40 = 20")).toBe("75% z 40 = 20");
  });

  it("zamienia operatory i potęgi", () => {
    expect(quizMathToPlainString("$2 \\times 3 = 6$")).toBe("2 × 3 = 6");
    expect(quizMathToPlainString("$2^{3} = 8$")).toBe("2³ = 8");
    expect(quizMathToPlainString("$\\sqrt{16} = 4$")).toBe("√16 = 4");
  });

  it("procenty z \\%", () => {
    expect(quizMathToPlainString("$75\\%$ z $40 = 30$")).toContain("75%");
    expect(quizMathToPlainString("$75\\%$ z $40 = 30$")).toContain("40");
  });

  it("ułamki jako części frac (nie vulgar gdy nietypowe)", () => {
    const parts = parseQuizMath("$\\frac{2}{7} + \\frac{1}{7}$");
    expect(parts.some((p) => p.kind === "frac" && p.num === "2" && p.den === "7")).toBe(
      true,
    );
  });

  it("popularne ułamki → unicode", () => {
    expect(quizMathToPlainString("$\\frac{1}{2} + \\frac{1}{2} = 1$")).toContain("½");
  });

  it("mieszana liczba 1\\frac{1}{2}", () => {
    const plain = quizMathToPlainString("$1\\frac{1}{2} = \\frac{3}{2}$");
    expect(plain).toMatch(/1/);
    expect(plain).toMatch(/½|3\/2/);
  });
});
