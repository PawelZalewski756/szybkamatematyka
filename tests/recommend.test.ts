import { describe, expect, it } from "vitest";
import { topicProgressKey } from "@/lib/supabase/solved-tasks";
import { recommendNextAction } from "@/lib/learning/recommend";
import type { TopicMasteryRecord } from "@/lib/learning/mastery";
import { mergeExamProgress } from "@/lib/trening/progress";

const NOW = 1_700_000_000_000;

function examWithUlamki(solved = 2, total = 10) {
  const key = topicProgressKey("8_klasa", "liczby", "ulamki");
  return mergeExamProgress(
    "8_klasa",
    new Map([[key, total]]),
    new Map([[key, solved]]),
  );
}

function ulamkiMastery(
  patch: Partial<TopicMasteryRecord> = {},
): TopicMasteryRecord {
  return {
    examType: "8_klasa",
    category: "liczby",
    topic: "ulamki",
    attempts: 6,
    correct: 1,
    lastDifficulty: 2,
    lastResult: "wrong",
    lastActivityAt: NOW,
    streakCorrect: 0,
    trendDelta: -0.2,
    ...patch,
  };
}

describe("recommendNextAction", () => {
  it("najpierw kieruje do zaległych powtórek", () => {
    const action = recommendNextAction({
      examKey: "8_klasa",
      exam: examWithUlamki(),
      mastery: [ulamkiMastery()],
      dueCount: 4,
      schoolClass: "klasa-8",
      now: NOW,
    });
    expect(action.kind).toBe("review");
    expect(action.href).toBe("/powtorki");
  });

  it("potem wraca do słabego wymaganego tematu", () => {
    const action = recommendNextAction({
      examKey: "8_klasa",
      exam: examWithUlamki(),
      mastery: [ulamkiMastery()],
      dueCount: 0,
      schoolClass: "klasa-8",
      now: NOW,
    });
    expect(action.kind).toBe("weak_topic");
    expect(action.href).toContain("/trening/");
    expect(action.href).toContain("ulamki");
  });

  it("gdy brak słabych, bierze kolejny niedomknięty temat ścieżki", () => {
    const action = recommendNextAction({
      examKey: "8_klasa",
      exam: examWithUlamki(2, 10),
      mastery: [
        ulamkiMastery({ attempts: 8, correct: 8, lastResult: "correct" }),
      ],
      dueCount: 0,
      schoolClass: "klasa-8",
      now: NOW,
    });
    expect(action.kind).toBe("next_topic");
  });

  it("po domknięciu tematów proponuje arkusz kontrolny", () => {
    const action = recommendNextAction({
      examKey: "8_klasa",
      exam: examWithUlamki(10, 10),
      mastery: [
        ulamkiMastery({ attempts: 10, correct: 10, lastResult: "correct" }),
      ],
      dueCount: 0,
      schoolClass: "klasa-8",
      now: NOW,
    });
    expect(action.kind).toBe("control_sheet");
    expect(action.href.length).toBeGreaterThan(1);
  });
});
