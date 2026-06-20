import { describe, it, expect } from "vitest";
import { parseSolutionSteps } from "@/lib/baza-zadan/parse-solution-steps";

describe("parseSolutionSteps", () => {
  it("dzieli kroki i wyciąga odpowiedź", () => {
    const md = "**Krok 1.** Oblicz $x$.\n\n**Krok 2.** Podstaw.\n\n**Odpowiedź:** C, czyli $5$";
    const { steps, answer } = parseSolutionSteps(md);
    expect(steps).toHaveLength(2);
    expect(steps[0]).toContain("Oblicz");
    expect(steps[1]).toContain("Podstaw");
    expect(answer).toBe("C, czyli $5$");
  });

  it("zwraca cały tekst jako jeden krok bez etykiet", () => {
    const { steps, answer } = parseSolutionSteps("Krótkie rozwiązanie bez kroków.");
    expect(steps).toEqual(["Krótkie rozwiązanie bez kroków."]);
    expect(answer).toBeNull();
  });
});
