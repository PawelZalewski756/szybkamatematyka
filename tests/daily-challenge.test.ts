import { describe, it, expect } from "vitest";
import type { QuestionTrack } from "@/lib/learning-path";
import {
  generateDailyChallenge,
  challengeXpReward,
  DAILY_CHALLENGE_QUESTION_COUNT,
} from "@/lib/wyzwania/daily-challenge";

const TRACKS: QuestionTrack[] = ["podstawowa", "egzamin-8-klasisty", "matura"];

describe("generateDailyChallenge — determinizm", () => {
  it("ten sam dzień + tor → identyczny zestaw pytań", () => {
    for (const track of TRACKS) {
      const a = generateDailyChallenge(track, "2026-05-29");
      const b = generateDailyChallenge(track, "2026-05-29");
      expect(a).toEqual(b);
    }
  });

  it("różne dni potrafią dać różne zestawy (seed zależny od daty)", () => {
    const day1 = generateDailyChallenge("matura", "2026-05-29");
    const day2 = generateDailyChallenge("matura", "2026-06-15");
    // Co najmniej jedno z: kolejność/wybór/oznaczenie prawdy się różni.
    expect(day1.questions).not.toEqual(day2.questions);
  });
});

describe("generateDailyChallenge — kształt zestawu", () => {
  it("zwraca dokładnie DAILY_CHALLENGE_QUESTION_COUNT pytań", () => {
    for (const track of TRACKS) {
      const challenge = generateDailyChallenge(track, "2026-05-29");
      expect(challenge.questions).toHaveLength(DAILY_CHALLENGE_QUESTION_COUNT);
      expect(challenge.date).toBe("2026-05-29");
      expect(challenge.track).toBe(track);
    }
  });

  it("każde pytanie ma unikalne id i spójną flagę isTrue", () => {
    const challenge = generateDailyChallenge("podstawowa", "2026-05-29");
    const ids = new Set(challenge.questions.map((q) => q.id));
    expect(ids.size).toBe(challenge.questions.length);

    for (const q of challenge.questions) {
      expect(typeof q.claim).toBe("string");
      expect(q.claim.length).toBeGreaterThan(0);
      expect(typeof q.isTrue).toBe("boolean");
    }
  });
});

describe("challengeXpReward", () => {
  it("baza bez poprawnych i bez serii", () => {
    expect(challengeXpReward(0, 0)).toBe(60);
  });

  it("dodaje 12 XP za każdą poprawną odpowiedź", () => {
    expect(challengeXpReward(5, 0)).toBe(60 + 5 * 12);
    expect(challengeXpReward(3, 0)).toBe(60 + 36);
  });

  it("dodaje 5 XP za punkt serii, z czapką na 7", () => {
    expect(challengeXpReward(0, 1)).toBe(60 + 5);
    expect(challengeXpReward(0, 7)).toBe(60 + 35);
    expect(challengeXpReward(0, 100)).toBe(60 + 35); // cap
  });

  it("łączy bonusy poprawnych i serii", () => {
    expect(challengeXpReward(3, 2)).toBe(60 + 36 + 10);
  });

  it("ignoruje ujemne wartości (clamp do 0)", () => {
    expect(challengeXpReward(-5, -3)).toBe(60);
  });
});
