import { getAllTasks } from "@/lib/baza-zadan/catalog";
import { generateProceduralTasks } from "@/lib/baza-zadan/procedural-tasks";
import { finalizeProceduralTasks } from "@/lib/baza-zadan/task-generators";
import type { Task } from "@/lib/baza-zadan/types";
import { describe, expect, it } from "vitest";

function baseTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "proc-test-1",
    title: "Procent #1",
    category: "procenty",
    difficulty: "latwy",
    forPaths: ["sp"],
    prompt: "Ile to 10% z 50?",
    choices: ["1", "5", "10", "50"],
    correctIndex: 1,
    explanation: "10% z 50 = 5.",
    ...overrides,
  };
}

describe("finalizeProceduralTasks", () => {
  it("ustawia tytuł zadania na jego treść zamiast numeru wariantu", () => {
    const [task] = finalizeProceduralTasks([
      baseTask({ id: "proc-pct-1", title: "Procent #1" }),
    ]);

    expect(task!.title).toBe("Ile to 10% z 50?");
    expect(task!.title).not.toMatch(/#\d+/);
  });

  it("usuwa powtórzone treści w ramach jednego działu", () => {
    const tasks = [
      baseTask({ id: "proc-a", prompt: "Ile to 10% z 50?" }),
      baseTask({ id: "proc-b", prompt: "Ile to 10% z 50?" }),
      baseTask({ id: "proc-c", prompt: "Ile to 20% z 50?" }),
    ];

    const result = finalizeProceduralTasks(tasks);
    expect(result.map((task) => task.id)).toEqual(["proc-a", "proc-c"]);
  });

  it("nie skleja identycznych treści z różnych działów", () => {
    const result = finalizeProceduralTasks([
      baseTask({ id: "proc-proc", category: "procenty" }),
      baseTask({ id: "proc-mat", category: "matura" }),
    ]);

    expect(result).toHaveLength(2);
  });
});

describe("wygenerowana baza zadań", () => {
  const procedural = generateProceduralTasks();

  it("nie zawiera ponumerowanych tytułów typu „#17”", () => {
    const numbered = procedural.filter((task) => /#\d+/.test(task.title));
    expect(numbered).toEqual([]);
  });

  it("każde zadanie ma tytuł równy treści", () => {
    for (const task of procedural) {
      expect(task.title).toBe(task.prompt);
    }
  });

  it("nie powtarza tej samej treści w dziale", () => {
    const seen = new Set<string>();
    const duplicates: string[] = [];

    for (const task of getAllTasks()) {
      const key = `${task.category}:${task.prompt}`;
      if (seen.has(key)) duplicates.push(task.id);
      seen.add(key);
    }

    expect(duplicates).toEqual([]);
  });

  it("każde zadanie ma unikalne ID", () => {
    const ids = getAllTasks().map((task) => task.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
