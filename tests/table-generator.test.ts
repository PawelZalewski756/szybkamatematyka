import { describe, expect, it } from "vitest";
import { generateTableTasks } from "@/lib/baza-zadan/table-generator";
import { answersEquivalent } from "@/lib/math/answer-equiv";

const tasks = generateTableTasks();

function tableLines(prompt: string): string[] {
  return prompt.split("\n").filter((line) => line.trim().startsWith("|"));
}

describe("generateTableTasks", () => {
  it("generuje 80 zadań w ośmiu rodzinach", () => {
    expect(tasks).toHaveLength(80);
    for (const prefix of [
      "gen-offer-",
      "gen-budget-",
      "gen-discount-",
      "gen-average-",
      "gen-recipe-",
      "gen-tickets-",
      "gen-probability-",
      "gen-speed-",
    ]) {
      expect(tasks.filter((task) => task.id.startsWith(prefix))).toHaveLength(
        10,
      );
    }
  });

  it("ma unikalne ID i unikalne treści", () => {
    expect(new Set(tasks.map((task) => task.id)).size).toBe(tasks.length);
    const prompts = tasks.map((task) =>
      task.prompt.replace(/\s+/g, " ").trim().toLowerCase(),
    );
    expect(new Set(prompts).size).toBe(tasks.length);
  });

  it("każde zadanie ma poprawną tabelę, cztery opcje i wyjaśnienie", () => {
    for (const task of tasks) {
      const lines = tableLines(task.prompt);
      expect(lines.length).toBeGreaterThanOrEqual(3);
      expect(new Set(lines.map((line) => (line.match(/\|/g) ?? []).length)).size).toBe(1);

      expect(task.choices).toHaveLength(4);
      expect(new Set(task.choices).size).toBe(4);
      expect(task.correctIndex).toBeGreaterThanOrEqual(0);
      expect(task.correctIndex).toBeLessThan(4);
      expect(task.explanation.length).toBeGreaterThan(30);
      expect(task.choices[task.correctIndex]).toBeTruthy();
      expect(
        task.choices.some((choice) =>
          answersEquivalent(choice, task.choices[task.correctIndex]!),
        ),
      ).toBe(true);
    }
  });

  it("nie zawiera artefaktów typu NaN lub undefined", () => {
    for (const task of tasks) {
      for (const value of [...task.choices, task.prompt, task.explanation]) {
        expect(value).not.toMatch(/\b(?:NaN|undefined|null|Infinity)\b/);
      }
    }
  });
});
