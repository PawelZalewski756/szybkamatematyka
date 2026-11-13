import { describe, expect, it } from "vitest";
import { TABLE_TASKS } from "@/lib/baza-zadan/table-tasks";
import { answersEquivalent } from "@/lib/math/answer-equiv";

function tableLines(prompt: string): string[] {
  return prompt.split("\n").filter((line) => line.trim().startsWith("|"));
}

describe("TABLE_TASKS", () => {
  it("ma unikalne identyfikatory i sensowne odpowiedzi", () => {
    expect(new Set(TABLE_TASKS.map((task) => task.id)).size).toBe(
      TABLE_TASKS.length,
    );

    for (const task of TABLE_TASKS) {
      expect(task.choices).toHaveLength(4);
      expect(task.correctIndex).toBeGreaterThanOrEqual(0);
      expect(task.correctIndex).toBeLessThan(task.choices.length);
      expect(new Set(task.choices).size).toBe(4);
      expect(task.explanation.trim().length).toBeGreaterThan(20);
    }
  });

  it("każde zadanie zawiera poprawnie zbudowaną tabelę markdown", () => {
    for (const task of TABLE_TASKS) {
      const lines = tableLines(task.prompt);
      expect(lines.length).toBeGreaterThanOrEqual(3);

      const pipeCounts = lines.map(
        (line) => (line.match(/\|/g) ?? []).length,
      );
      expect(new Set(pipeCounts).size).toBe(1);
      expect(task.prompt).toContain("---");
    }
  });

  it("nie powtarza tej samej treści w obrębie zestawu", () => {
    const normalized = TABLE_TASKS.map((task) =>
      task.prompt.replace(/\s+/g, " ").trim().toLowerCase(),
    );
    expect(new Set(normalized).size).toBe(TABLE_TASKS.length);
  });

  it("poprawna odpowiedź jest jedną z opcji", () => {
    for (const task of TABLE_TASKS) {
      const correct = task.choices[task.correctIndex]!;
      expect(
        task.choices.some((choice) => answersEquivalent(choice, correct)),
      ).toBe(true);
    }
  });
});
