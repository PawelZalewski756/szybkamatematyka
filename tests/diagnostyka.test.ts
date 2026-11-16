import { describe, expect, it } from "vitest";
import {
  buildDiagnosticResult,
  selectDiagnosticTasks,
} from "@/lib/diagnostyka";
import type { Task } from "@/lib/baza-zadan/types";

function task(overrides: Partial<Task> & Pick<Task, "id" | "category">): Task {
  return {
    title: overrides.id,
    difficulty: "latwy",
    forPaths: ["sp"],
    prompt: "2 + 2 = ?",
    choices: ["4", "5"],
    correctIndex: 0,
    explanation: "",
    ...overrides,
  };
}

describe("selectDiagnosticTasks", () => {
  it("bierze po jednym zadaniu z działu i pomija trudne, obrazkowe i ogólne", () => {
    const tasks: Task[] = [
      task({ id: "a1", category: "arytmetyka" }),
      task({ id: "a2", category: "arytmetyka", difficulty: "sredni" }),
      task({ id: "b1", category: "ulamki" }),
      task({ id: "hard", category: "procenty", difficulty: "trudny" }),
      task({ id: "image", category: "geometria", prompt: "![rysunek](/x.png)" }),
      task({ id: "generic", category: "matura" }),
    ];

    const selected = selectDiagnosticTasks(tasks);
    expect(selected.map((item) => item.id)).toEqual(["a1", "b1"]);
  });
});

describe("buildDiagnosticResult", () => {
  it("liczy wynik ogólny i per dział", () => {
    const tasks = selectDiagnosticTasks([
      task({ id: "a1", category: "arytmetyka" }),
      task({ id: "b1", category: "ulamki" }),
    ]);

    const result = buildDiagnosticResult(
      "sp",
      tasks,
      { a1: true, b1: false },
      new Date("2026-11-16T12:00:00.000Z"),
    );

    expect(result.total).toBe(2);
    expect(result.correct).toBe(1);
    expect(result.completedAt).toBe("2026-11-16T12:00:00.000Z");
    expect(result.categories).toEqual([
      { category: "arytmetyka", label: "Arytmetyka", correct: 1, total: 1 },
      { category: "ulamki", label: "Ułamki", correct: 0, total: 1 },
    ]);
  });
});
