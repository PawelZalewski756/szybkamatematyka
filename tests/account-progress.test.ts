import { describe, it, expect } from "vitest";
import { gameScoreToXp } from "@/lib/minigry/account-progress";

describe("gameScoreToXp", () => {
  it("zero lub mniej → 0 XP (brak nagrody)", () => {
    expect(gameScoreToXp(0)).toBe(0);
    expect(gameScoreToXp(-50)).toBe(0);
  });

  it("nie zwraca nigdy wartości ujemnej", () => {
    for (let s = -100; s <= 100; s += 7) {
      expect(gameScoreToXp(s)).toBeGreaterThanOrEqual(0);
    }
  });

  it("stosuje krzywą sqrt * 10 dla typowych wyników", () => {
    expect(gameScoreToXp(100)).toBe(100); // floor(sqrt(100)*10)
    expect(gameScoreToXp(400)).toBe(200); // floor(sqrt(400)*10)
  });

  it("nowe minimum = 5 XP dla skrajnie niskich dodatnich wyników", () => {
    // sqrt(0.1)*10 ≈ 3.16 → floor 3 → podniesione do 5
    expect(gameScoreToXp(0.1)).toBe(5);
  });

  it("nakłada czapkę 320 XP na bardzo wysokie wyniki", () => {
    expect(gameScoreToXp(1_000_000)).toBe(320);
    expect(gameScoreToXp(10_000)).toBe(320);
  });

  it("jest monotonicznie niemalejący względem wyniku", () => {
    let prev = 0;
    for (let s = 1; s <= 5000; s += 1) {
      const xp = gameScoreToXp(s);
      expect(xp).toBeGreaterThanOrEqual(prev);
      prev = xp;
    }
  });
});
