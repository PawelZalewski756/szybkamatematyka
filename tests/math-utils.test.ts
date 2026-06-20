import { describe, it, expect } from "vitest";
import {
  gcd,
  lcm,
  buildNumericOptions,
  shuffle,
} from "@/lib/minigry/questions/math-utils";

describe("gcd", () => {
  it("liczy największy wspólny dzielnik", () => {
    expect(gcd(12, 8)).toBe(4);
    expect(gcd(7, 13)).toBe(1);
    expect(gcd(100, 25)).toBe(25);
  });

  it("działa na liczbach ujemnych (wartość bezwzględna)", () => {
    expect(gcd(-12, 8)).toBe(4);
    expect(gcd(12, -8)).toBe(4);
  });

  it("zwraca 1 zamiast 0 dla gcd(0, 0)", () => {
    expect(gcd(0, 0)).toBe(1);
    expect(gcd(0, 5)).toBe(5);
  });
});

describe("lcm", () => {
  it("liczy najmniejszą wspólną wielokrotność", () => {
    expect(lcm(4, 6)).toBe(12);
    expect(lcm(3, 5)).toBe(15);
  });

  it("działa na liczbach ujemnych (wartość bezwzględna)", () => {
    expect(lcm(-4, 6)).toBe(12);
  });
});

describe("buildNumericOptions", () => {
  it("zwraca zadaną liczbę unikalnych, nieujemnych opcji z poprawną", () => {
    for (let i = 0; i < 50; i++) {
      const correct = 20 + i;
      const options = buildNumericOptions(correct, 4, 12);
      expect(options).toHaveLength(4);
      expect(new Set(options).size).toBe(4);
      expect(options).toContain(correct);
      for (const o of options) {
        expect(o).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

describe("shuffle", () => {
  it("zachowuje wszystkie elementy (permutacja)", () => {
    const input = [1, 2, 3, 4, 5];
    const out = shuffle(input);
    expect(out).toHaveLength(input.length);
    expect([...out].sort((a, b) => a - b)).toEqual(input);
  });

  it("nie mutuje wejściowej tablicy", () => {
    const input = [1, 2, 3];
    const copy = [...input];
    shuffle(input);
    expect(input).toEqual(copy);
  });
});
