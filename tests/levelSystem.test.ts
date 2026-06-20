import { describe, it, expect } from "vitest";
import { calculateLevel, calculateXpProgress } from "@/lib/levelSystem";

describe("calculateLevel", () => {
  it("zwraca poziom 1 dla 0 XP", () => {
    expect(calculateLevel(0)).toBe(1);
  });

  it("traktuje ujemne XP jak 0 (poziom 1)", () => {
    expect(calculateLevel(-1)).toBe(1);
    expect(calculateLevel(-9999)).toBe(1);
  });

  it("przeskakuje poziom dokładnie na progu 500 XP", () => {
    expect(calculateLevel(499)).toBe(1);
    expect(calculateLevel(500)).toBe(2);
    expect(calculateLevel(999)).toBe(2);
    expect(calculateLevel(1000)).toBe(3);
  });

  it("jest monotoniczny (nigdy nie maleje wraz ze wzrostem XP)", () => {
    let prev = calculateLevel(0);
    for (let xp = 0; xp <= 5000; xp += 37) {
      const lvl = calculateLevel(xp);
      expect(lvl).toBeGreaterThanOrEqual(prev);
      prev = lvl;
    }
  });
});

describe("calculateXpProgress", () => {
  it("zwraca XP w obrębie poziomu jako resztę z 500", () => {
    expect(calculateXpProgress(0)).toEqual({
      currentLevelXp: 0,
      xpForNextLevel: 500,
    });
    expect(calculateXpProgress(750)).toEqual({
      currentLevelXp: 250,
      xpForNextLevel: 500,
    });
    expect(calculateXpProgress(500)).toEqual({
      currentLevelXp: 0,
      xpForNextLevel: 500,
    });
  });

  it("nie produkuje ujemnego postępu dla ujemnego XP", () => {
    expect(calculateXpProgress(-100)).toEqual({
      currentLevelXp: 0,
      xpForNextLevel: 500,
    });
  });

  it("currentLevelXp zawsze mieści się w [0, 500)", () => {
    for (let xp = 0; xp <= 3000; xp += 13) {
      const { currentLevelXp } = calculateXpProgress(xp);
      expect(currentLevelXp).toBeGreaterThanOrEqual(0);
      expect(currentLevelXp).toBeLessThan(500);
    }
  });
});
