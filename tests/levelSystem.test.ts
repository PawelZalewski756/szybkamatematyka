import { describe, it, expect } from "vitest";
import {
  calculateLevel,
  calculateXpProgress,
  cumulativeXpForLevel,
  xpToAdvanceFrom,
} from "@/lib/levelSystem";

describe("xpToAdvanceFrom", () => {
  it("poziom 1→2 jest najtańszy (100 XP)", () => {
    expect(xpToAdvanceFrom(1)).toBe(100);
  });

  it("każdy kolejny awans jest droższy", () => {
    for (let level = 1; level < 20; level += 1) {
      expect(xpToAdvanceFrom(level + 1)).toBeGreaterThan(xpToAdvanceFrom(level));
    }
  });
});

describe("calculateLevel", () => {
  it("zwraca poziom 1 dla 0 XP", () => {
    expect(calculateLevel(0)).toBe(1);
  });

  it("traktuje ujemne XP jak 0 (poziom 1)", () => {
    expect(calculateLevel(-1)).toBe(1);
    expect(calculateLevel(-9999)).toBe(1);
  });

  it("poziom 2 wbija się tanio (100 XP)", () => {
    expect(calculateLevel(99)).toBe(1);
    expect(calculateLevel(100)).toBe(2);
  });

  it("320 XP to już co najmniej poziom 2 (realny gracz 42b)", () => {
    expect(calculateLevel(320)).toBeGreaterThanOrEqual(2);
    expect(calculateLevel(320)).toBe(3);
  });

  it("8400 XP ≈ poziom 12 (realny gracz camel — nie 17 ze starej krzywej)", () => {
    expect(calculateLevel(8400)).toBe(12);
  });

  it("jest monotoniczny (nigdy nie maleje wraz ze wzrostem XP)", () => {
    let prev = calculateLevel(0);
    for (let xp = 0; xp <= 20_000; xp += 37) {
      const lvl = calculateLevel(xp);
      expect(lvl).toBeGreaterThanOrEqual(prev);
      prev = lvl;
    }
  });

  it("cumulativeXpForLevel zgadza się z calculateLevel", () => {
    for (let level = 1; level <= 15; level += 1) {
      const floor = cumulativeXpForLevel(level);
      expect(calculateLevel(floor)).toBe(level);
      if (floor > 0) {
        expect(calculateLevel(floor - 1)).toBe(level - 1);
      }
    }
  });
});

describe("calculateXpProgress", () => {
  it("na starcie pokazuje 0 / 100 (do poziomu 2)", () => {
    expect(calculateXpProgress(0)).toEqual({
      currentLevelXp: 0,
      xpForNextLevel: 100,
    });
  });

  it("po wbiciu poziomu 2 pasek startuje od zera z wyższym celem", () => {
    expect(calculateXpProgress(100)).toEqual({
      currentLevelXp: 0,
      xpForNextLevel: xpToAdvanceFrom(2),
    });
  });

  it("nie produkuje ujemnego postępu dla ujemnego XP", () => {
    expect(calculateXpProgress(-100)).toEqual({
      currentLevelXp: 0,
      xpForNextLevel: 100,
    });
  });

  it("currentLevelXp zawsze mieści się w [0, xpForNextLevel)", () => {
    for (let xp = 0; xp <= 8000; xp += 13) {
      const { currentLevelXp, xpForNextLevel } = calculateXpProgress(xp);
      expect(currentLevelXp).toBeGreaterThanOrEqual(0);
      expect(currentLevelXp).toBeLessThan(xpForNextLevel);
      expect(xpForNextLevel).toBeGreaterThan(0);
    }
  });
});
