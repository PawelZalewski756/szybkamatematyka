import { describe, expect, it } from "vitest";
import { toCatalogTask } from "@/lib/baza-zadan/catalog-task";
import type { Task } from "@/lib/baza-zadan/types";

const task: Task = {
  id: "cke-m15-maj-z01",
  title: "Zadanie 1",
  category: "matura",
  difficulty: "sredni",
  forPaths: ["liceum"],
  prompt: "Oblicz 2+2.",
  choices: ["3", "4", "5", "6"],
  correctIndex: 1,
  explanation: "SEKRETNY-KLUCZ",
  solutionSteps: ["SEKRETNY-KROK"],
  examSource: { kind: "matura", year: 2015, taskNumber: "1" },
};

describe("toCatalogTask", () => {
  it("nie przenosi odpowiedzi, wyjaśnienia ani rozwiązań", () => {
    const item = toCatalogTask(task);

    expect(Object.keys(item).sort()).toEqual([
      "category",
      "difficulty",
      "examLabel",
      "hasSolution",
      "id",
      "isExam",
      "paths",
      "points",
      "prompt",
      "title",
    ]);
    expect(JSON.stringify(item)).not.toContain("SEKRETNY");
    expect(item).not.toHaveProperty("correctIndex");
    expect(item).not.toHaveProperty("explanation");
    expect(item).not.toHaveProperty("choices");
    expect(item).not.toHaveProperty("solutionSteps");
  });

  it("zachowuje dane potrzebne do listy i wyszukiwania", () => {
    const item = toCatalogTask(task);

    expect(item.id).toBe("cke-m15-maj-z01");
    expect(item.prompt).toContain("2+2");
    expect(item.paths).toEqual(["liceum"]);
    expect(item.points).toBe(1);
    expect(item.isExam).toBe(true);
    expect(item.examLabel).toBe("2015 · zad. 1");
    expect(item.hasSolution).toBe(true);
  });

  it("oznacza zadanie bez rozwiązania", () => {
    const item = toCatalogTask({
      ...task,
      explanation: "",
      solutionSteps: [],
      examSource: undefined,
    });

    expect(item.hasSolution).toBe(false);
    expect(item.isExam).toBe(false);
    expect(item.examLabel).toBeNull();
  });
});
