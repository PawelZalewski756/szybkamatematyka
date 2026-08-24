import { describe, expect, it } from "vitest";
import {
  applyAttempt,
  averageMasteryScore,
  masteryBand,
  masteryScore,
  type TopicMasteryRecord,
} from "@/lib/learning/mastery";

const NOW = 1_700_000_000_000;

function record(
  patch: Partial<TopicMasteryRecord> = {},
): TopicMasteryRecord {
  return {
    examType: "8_klasa",
    category: "liczby",
    topic: "ulamki",
    attempts: 8,
    correct: 7,
    lastDifficulty: 2,
    lastResult: "correct",
    lastActivityAt: NOW,
    streakCorrect: 3,
    trendDelta: 0.05,
    ...patch,
  };
}

describe("masteryScore", () => {
  it("nie używa XP i trzyma wynik w 0–100", () => {
    expect(masteryScore(record(), NOW)).toBeGreaterThan(70);
    expect(masteryScore(record({ attempts: 0 }), NOW)).toBe(0);
    expect(masteryScore(record({ attempts: 10, correct: 0 }), NOW)).toBeLessThan(
      50,
    );
  });

  it("obniża wynik po niedawnej błędnej odpowiedzi", () => {
    const ok = masteryScore(record({ lastResult: "correct" }), NOW);
    const bad = masteryScore(record({ lastResult: "wrong" }), NOW);
    expect(bad).toBeLessThan(ok);
  });
});

describe("masteryBand", () => {
  it("słaby temat wymaga kilku prób i niskiego wyniku", () => {
    expect(masteryBand(40, 2)).toBe("building");
    expect(masteryBand(40, 5)).toBe("weak");
    expect(masteryBand(80, 5)).toBe("strong");
  });
});

describe("applyAttempt", () => {
  it("aktualizuje skuteczność i serię", () => {
    const first = applyAttempt(undefined, {
      examType: "8_klasa",
      category: "liczby",
      topic: "ulamki",
      correct: true,
      now: NOW,
    });
    expect(first.attempts).toBe(1);
    expect(first.correct).toBe(1);
    const second = applyAttempt(first, {
      examType: "8_klasa",
      category: "liczby",
      topic: "ulamki",
      correct: false,
      now: NOW + 1,
    });
    expect(second.attempts).toBe(2);
    expect(second.correct).toBe(1);
    expect(second.streakCorrect).toBe(0);
    expect(second.trendDelta).toBeLessThan(0);
  });
});

describe("averageMasteryScore", () => {
  it("pomija tematy bez prób", () => {
    expect(
      averageMasteryScore(
        [record({ attempts: 0 }), record({ attempts: 8, correct: 8 })],
        NOW,
      ),
    ).toBe(masteryScore(record({ attempts: 8, correct: 8 }), NOW));
  });
});
