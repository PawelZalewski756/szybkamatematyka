import { buildNumericOptions } from "@/lib/minigry/questions/math-utils";
import {
  generateCos,
  generateLiczbaPrzeciwna,
  generateLogarytmy,
  generatePoleKola,
  generatePorownaj,
  generateSinCos,
  generateUlamkiDodaj,
  generateUlamkiOdejmij,
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


describe("formatowanie odpowiedzi minigier", () => {
  it("sinus i cosinus mają cztery unikalne odpowiedzi z poprawną", () => {
    for (const generator of [generateSinCos, generateCos]) {
      for (let index = 0; index < 100; index += 1) {
        const question = generator();
        expect(question.options).toHaveLength(4);
        expect(new Set(question.options).size).toBe(4);
        expect(question.options).toContain(question.correct);
        expect(question.correct).toMatch(/^\$/);
      }
    }
  });

  it("pole koła pokazuje jednostkę cm² w każdej odpowiedzi", () => {
    for (let index = 0; index < 100; index += 1) {
      const question = generatePoleKola();
      expect(question.options).toHaveLength(4);
      for (const option of question.options) {
        expect(option).toMatch(/cm²$/);
      }
      expect(question.options).toContain(question.correct);
    }
  });

  it("dodawanie i odejmowanie ułamków dają cztery odpowiedzi z poprawną", () => {
    for (const generator of [generateUlamkiDodaj, generateUlamkiOdejmij]) {
      for (let index = 0; index < 100; index += 1) {
        const question = generator();
        expect(question.options).toHaveLength(4);
        expect(new Set(question.options).size).toBe(4);
        expect(question.options).toContain(question.correct);
      }
    }
  });

  it("logarytmy nadal korzystają z zapisu LaTeX", () => {
    for (let index = 0; index < 100; index += 1) {
      expect(generateLogarytmy().equation).toContain("\\log");
    }
  });
});
