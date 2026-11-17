import { describe, expect, it } from "vitest";
import { getTaskById } from "@/lib/baza-zadan/catalog";
import { matchesLearningPath } from "@/lib/learning-path";
import {
  FIRST_TASK_BY_PATH,
  firstTaskHref,
} from "@/lib/trening/first-task";

describe("pierwsze zadanie dla nowego użytkownika", () => {
  for (const path of ["sp", "srednia"] as const) {
    it(`${path}: istnieje, jest łatwe i ma rozwiązanie`, () => {
      const id = FIRST_TASK_BY_PATH[path];
      const task = getTaskById(id);

      expect(task, `brak zadania ${id}`).toBeDefined();
      expect(task!.difficulty).toBe("latwy");
      expect(task!.explanation.trim().length).toBeGreaterThan(10);
      expect(matchesLearningPath(path, task!.forPaths)).toBe(true);
      expect(task!.choices.length).toBeGreaterThan(1);
    });
  }

  it("buduje link do zadania w bazie", () => {
    expect(firstTaskHref("sp")).toBe("/baza-zadan/st-020");
    expect(firstTaskHref("srednia")).toBe("/baza-zadan/st-080");
  });
});
