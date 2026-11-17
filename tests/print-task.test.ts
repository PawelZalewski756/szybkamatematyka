import { describe, expect, it } from "vitest";
import { toPrintTask } from "@/lib/baza-zadan/print-task";
import type { Task } from "@/lib/baza-zadan/types";

const closedTask: Task = {
  id: "cke-m15-maj-z01",
  title: "Zadanie 1",
  category: "matura",
  difficulty: "sredni",
  forPaths: ["liceum"],
  prompt: "Oblicz 2+2.",
  choices: ["3", "4", "5", "6"],
  correctIndex: 1,
  explanation: "SEKRETNY-KLUCZ: dodajemy 2+2.",
  solutionSteps: ["SEKRETNY-KROK-1", "SEKRETNY-KROK-2"],
  examSource: { kind: "matura", year: 2015, taskNumber: "1" },
};

const openTask: Task = {
  ...closedTask,
  id: "cke-m15-maj-z30",
  prompt: "Wykaż, że liczba jest podzielna przez 3.",
  choices: ["Zadanie otwarte - patrz rozwiązanie"],
  correctIndex: 0,
  explanation: "SEKRETNE-ROZWIAZANIE",
  solutionSteps: ["SEKRETNY-KROK"],
  examSource: { kind: "matura", year: 2015, taskNumber: "30" },
};

describe("toPrintTask", () => {
  it("nie przenosi rozwiązań, wyjaśnień ani indeksu odpowiedzi", () => {
    const print = toPrintTask(closedTask, 0);

    expect(Object.keys(print).sort()).toEqual([
      "choices",
      "id",
      "number",
      "open",
      "points",
      "prompt",
    ]);
    expect(JSON.stringify(print)).not.toContain("SEKRETNY");
    expect(print).not.toHaveProperty("correctIndex");
    expect(print).not.toHaveProperty("explanation");
    expect(print).not.toHaveProperty("solutionSteps");
  });

  it("zachowuje numer z arkusza i punktację", () => {
    const print = toPrintTask(closedTask, 5);

    expect(print.number).toBe("1");
    expect(print.points).toBe(1);
    expect(print.open).toBe(false);
    expect(print.choices).toEqual(["3", "4", "5", "6"]);
  });

  it("rozpoznaje zadanie otwarte i nie przenosi jego rozwiązania", () => {
    const print = toPrintTask(openTask, 29);

    expect(print.open).toBe(true);
    expect(print.number).toBe("30");
    expect(JSON.stringify(print)).not.toContain("SEKRETNE");
  });

  it("bez numeru w źródle używa pozycji w arkuszu", () => {
    const print = toPrintTask({ ...closedTask, examSource: undefined }, 3);

    expect(print.number).toBe("4");
  });
});
