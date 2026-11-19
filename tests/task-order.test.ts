import {
  orderChoices,
  orderTaskChoices,
  sortTasksForDisplay,
} from "@/lib/baza-zadan/task-order";
import type { Task } from "@/lib/baza-zadan/types";
import { describe, expect, it } from "vitest";

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "st-test",
    title: "Zadanie testowe",
    category: "algebra",
    difficulty: "latwy",
    forPaths: ["sp"],
    prompt: "Ile to 2 + 2?",
    choices: ["3", "4", "5", "6"],
    correctIndex: 1,
    explanation: "2 + 2 = 4.",
    ...overrides,
  };
}

describe("orderChoices", () => {
  it("zachowuje treść poprawnej odpowiedzi", () => {
    for (let index = 0; index < 200; index += 1) {
      const choices = ["a", "b", "c", "d"];
      const correctIndex = index % 4;
      const ordered = orderChoices(`task-${index}`, choices, correctIndex);
      expect(ordered.choices[ordered.correctIndex]).toBe(choices[correctIndex]);
    }
  });

  it("jest deterministyczne dla tego samego ID", () => {
    const first = orderChoices("task-42", ["a", "b", "c", "d"], 2);
    const second = orderChoices("task-42", ["a", "b", "c", "d"], 2);
    expect(first).toEqual(second);
  });

  it("zwraca permutację bez zmiany zestawu odpowiedzi", () => {
    const choices = ["1", "2", "3", "4"];
    const ordered = orderChoices("task-7", choices, 3);
    expect(ordered.choices).toHaveLength(choices.length);
    expect([...ordered.choices].sort()).toEqual([...choices].sort());
  });

  it("nie zostawia poprawnej odpowiedzi zawsze na tej samej pozycji", () => {
    const buckets = [0, 0, 0, 0];
    for (let index = 0; index < 400; index += 1) {
      const ordered = orderChoices(`task-${index}`, ["a", "b", "c", "d"], 1);
      buckets[ordered.correctIndex] += 1;
    }
    for (const count of buckets) expect(count).toBeGreaterThan(60);
  });

  it("zostawia jednoelementowe listy bez zmian", () => {
    expect(orderChoices("task-1", ["tylko"], 0)).toEqual({
      choices: ["tylko"],
      correctIndex: 0,
    });
  });
});

describe("orderTaskChoices", () => {
  it("miesza opcje zadania katalogowego i nie zmienia oryginału", () => {
    const original = makeTask({ id: "st-017", correctIndex: 2 });
    const ordered = orderTaskChoices(original);

    expect(original.choices).toEqual(["3", "4", "5", "6"]);
    expect(ordered.choices[ordered.correctIndex]).toBe("5");
    expect(ordered.choices).not.toBe(original.choices);
  });

  it("zostawia zadania CKE w kolejności z arkusza", () => {
    const archive = makeTask({
      id: "cke-1",
      examSource: { kind: "matura", year: 2024 },
    });
    expect(orderTaskChoices(archive)).toBe(archive);
  });
});

describe("sortTasksForDisplay", () => {
  it("układa zadania od łatwych do trudnych, a w poziomie alfabetycznie", () => {
    const tasks = [
      makeTask({ id: "3", title: "B trudne", difficulty: "trudny" }),
      makeTask({ id: "1", title: "Z łatwe", difficulty: "latwy" }),
      makeTask({ id: "2", title: "A łatwe", difficulty: "latwy" }),
      makeTask({ id: "4", title: "C średnie", difficulty: "sredni" }),
    ];

    expect(sortTasksForDisplay(tasks).map((task) => task.id)).toEqual([
      "2",
      "1",
      "4",
      "3",
    ]);
  });

  it("sortuje numery w tytułach naturalnie (#2 przed #10)", () => {
    const tasks = [
      makeTask({ id: "10", title: "Kwadrat liczby #10" }),
      makeTask({ id: "2", title: "Kwadrat liczby #2" }),
    ];
    expect(sortTasksForDisplay(tasks).map((task) => task.id)).toEqual([
      "2",
      "10",
    ]);
  });

  it("miesza warianty proceduralne, ale stabilnie i po poziomie trudności", () => {
    const tasks = [
      makeTask({ id: "proc-pct-1", title: "Ile to 5% z 40?" }),
      makeTask({ id: "proc-pct-2", title: "Ile to 5% z 60?" }),
      makeTask({ id: "proc-pct-3", title: "Ile to 10% z 40?" }),
      makeTask({ id: "proc-pct-4", title: "Ile to 20% z 80?" }),
      makeTask({
        id: "proc-pct-5",
        title: "Ile to 50% z 8?",
        difficulty: "trudny",
      }),
    ];

    const first = sortTasksForDisplay(tasks).map((task) => task.id);
    const second = sortTasksForDisplay(tasks).map((task) => task.id);

    expect(first).toEqual(second);
    expect(first[first.length - 1]).toBe("proc-pct-5");
    // Alfabetycznie byłoby 1,2,3,4 - mieszanie musi zmienić kolejność.
    expect(first.slice(0, 4)).not.toEqual([
      "proc-pct-1",
      "proc-pct-2",
      "proc-pct-3",
      "proc-pct-4",
    ]);
  });
});
