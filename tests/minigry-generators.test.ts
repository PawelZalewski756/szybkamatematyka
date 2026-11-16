import { buildNumericOptions } from "@/lib/minigry/questions/math-utils";
import {
  generateLiczbaPrzeciwna,
  generatePorownaj,
} from "@/lib/minigry/questions/generators";
import { describe, expect, it } from "vitest";

describe("buildNumericOptions", () => {
  it("nie zapętla się przy wyniku ujemnym", () => {
    const options = buildNumericOptions(-15, 4, 10);
    expect(options).toHaveLength(4);
    expect(new Set(options).size).toBe(4);
    expect(options).toContain(-15);
  });

  it("dla wyniku dodatniego trzyma opcje nieujemne", () => {
    const options = buildNumericOptions(7, 4, 6);
    expect(options).toHaveLength(4);
    expect(new Set(options).size).toBe(4);
    expect(options).toContain(7);
    for (const option of options) expect(option).toBeGreaterThanOrEqual(0);
  });
});

describe("generatory minigier", () => {
  it("liczba przeciwna generuje się dla całego zakresu bez zawieszenia", () => {
    for (let index = 0; index < 300; index += 1) {
      const question = generateLiczbaPrzeciwna();
      expect(question.options).toHaveLength(4);
      expect(question.options).toContain(question.correct);
    }
  });

  it("porównanie potrafi dać wynik równy", () => {
    let equalSeen = false;
    for (let index = 0; index < 300 && !equalSeen; index += 1) {
      if (generatePorownaj("sp").correct === "equal") equalSeen = true;
    }
    expect(equalSeen).toBe(true);
  });
});
