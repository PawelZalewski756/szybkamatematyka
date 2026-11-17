import { describe, expect, it } from "vitest";
import { toQuizTask } from "@/lib/baza-zadan/quiz-task";
import type { Task } from "@/lib/baza-zadan/types";

const task: Task = {
  id: "st-test-1",
  title: "Test",
  category: "algebra",
  difficulty: "latwy",
  forPaths: ["sp"],
  prompt: "Rozwiąż x+1=2.",
  choices: ["0", "1", "2", "3"],
  correctIndex: 1,
  explanation: "SEKRETNE-WYJASNIENIE",
  solutionSteps: ["SEKRETNY-KROK"],
};

describe("toQuizTask", () => {
  it("nie przenosi wyjaśnienia ani kroków rozwiązania", () => {
    const quiz = toQuizTask(task);

    expect(Object.keys(quiz).sort()).toEqual([
      "choices",
      "correctIndex",
      "hasSolution",
      "id",
      "prompt",
    ]);
    expect(JSON.stringify(quiz)).not.toContain("SEKRETNY");
    expect(quiz).not.toHaveProperty("explanation");
    expect(quiz).not.toHaveProperty("solutionSteps");
  });

  it("zachowuje indeks odpowiedzi potrzebny do natychmiastowej oceny", () => {
    const quiz = toQuizTask(task);

    expect(quiz.correctIndex).toBe(1);
    expect(quiz.choices).toHaveLength(4);
    expect(quiz.prompt).toContain("x+1=2");
  });

  it("oznacza zadanie bez rozwiązania jako hasSolution=false", () => {
    const quiz = toQuizTask({
      ...task,
      explanation: "",
      solutionSteps: [],
    });

    expect(quiz.hasSolution).toBe(false);
  });

  it("liczy hasSolution także wtedy, gdy są tylko kroki", () => {
    const quiz = toQuizTask({
      ...task,
      explanation: "",
      solutionSteps: ["Krok 1"],
    });

    expect(quiz.hasSolution).toBe(true);
  });
});
