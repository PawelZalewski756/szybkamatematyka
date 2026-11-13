import { describe, expect, it } from "vitest";
import { getTasksForPath } from "@/lib/baza-zadan/catalog";
import { EXAM_ARCHIVE_TASKS } from "@/lib/baza-zadan/exams";
import { matchesLearningPath } from "@/lib/learning-path";

const e8Tasks = EXAM_ARCHIVE_TASKS.filter(
  (task) => task.examSource?.kind === "egzamin-8",
);
const maturaTasks = EXAM_ARCHIVE_TASKS.filter(
  (task) => task.examSource?.kind === "matura",
);

describe("ścieżki zadań egzaminacyjnych", () => {
  it("zadania egzaminu ósmoklasisty są tylko w szkole podstawowej", () => {
    expect(e8Tasks.length).toBeGreaterThan(0);
    for (const task of e8Tasks) {
      expect(matchesLearningPath("sp", task.forPaths)).toBe(true);
      expect(matchesLearningPath("srednia", task.forPaths)).toBe(false);
    }
  });

  it("zadania maturalne nie trafiają do szkoły podstawowej", () => {
    expect(maturaTasks.length).toBeGreaterThan(0);
    for (const task of maturaTasks) {
      expect(matchesLearningPath("srednia", task.forPaths)).toBe(true);
      expect(matchesLearningPath("sp", task.forPaths)).toBe(false);
    }
  });

  it("katalog szkoły średniej nie zawiera żadnego zadania E8", () => {
    const leaked = getTasksForPath("srednia").filter(
      (task) =>
        task.examSource?.kind === "egzamin-8" ||
        /^egzamin\s+ósmoklasisty\b/i.test(task.title),
    );
    expect(leaked).toHaveLength(0);
  });
});
