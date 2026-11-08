import { describe, expect, it } from "vitest";
import {
  countTopics,
  findNextTrainingTopic,
  normalizeSearchText,
  sortTopicsInExam,
} from "@/lib/trening/catalog";
import type { ExamWithProgress } from "@/lib/trening/progress";

function topic(id: string, name: string, solved: number, total: number) {
  return {
    id,
    name,
    solved,
    total,
    percent: total ? Math.round((solved / total) * 100) : 0,
  };
}

function makeExam(
  categories: {
    id: string;
    name: string;
    topics: ReturnType<typeof topic>[];
  }[],
): ExamWithProgress {
  return { categories } as unknown as ExamWithProgress;
}

describe("trening catalog helpers", () => {
  it("normalizes Polish diacritics and case for search", () => {
    expect(normalizeSearchText("  Równania Łączne ")).toBe("rownania laczne");
  });

  it("counts topics across categories", () => {
    const exam = makeExam([
      {
        id: "a",
        name: "A",
        topics: [topic("1", "x", 0, 1), topic("2", "y", 0, 1)],
      },
      { id: "b", name: "B", topics: [topic("3", "z", 0, 1)] },
    ]);
    expect(countTopics(exam)).toBe(3);
  });

  it("picks the first unfinished topic with tasks", () => {
    const exam = makeExam([
      {
        id: "a",
        name: "A",
        topics: [topic("1", "empty", 0, 0), topic("2", "done", 5, 5)],
      },
      { id: "b", name: "B", topics: [topic("3", "next", 1, 4)] },
    ]);
    const next = findNextTrainingTopic(exam, "8_klasa");
    expect(next?.topic.id).toBe("3");
    expect(next?.categoryId).toBe("b");
  });

  it("falls back to the first playable topic when all are done", () => {
    const exam = makeExam([
      { id: "a", name: "A", topics: [topic("1", "done", 2, 2)] },
    ]);
    expect(findNextTrainingTopic(exam, "8_klasa")?.topic.id).toBe("1");
  });

  it("returns null when no topic has tasks", () => {
    const exam = makeExam([
      { id: "a", name: "A", topics: [topic("1", "empty", 0, 0)] },
    ]);
    expect(findNextTrainingTopic(exam, "8_klasa")).toBeNull();
  });

  it("sorts topics alphabetically (Polish) or by progress", () => {
    const exam = makeExam([
      {
        id: "a",
        name: "A",
        topics: [topic("1", "Ćwiczenia", 1, 10), topic("2", "Algebra", 9, 10)],
      },
    ]);
    const az = sortTopicsInExam(exam, "az").categories[0].topics.map(
      (t) => t.id,
    );
    const byProgress = sortTopicsInExam(
      exam,
      "progress",
    ).categories[0].topics.map((t) => t.id);
    expect(az).toEqual(["2", "1"]);
    expect(byProgress).toEqual(["2", "1"]);
  });
});
