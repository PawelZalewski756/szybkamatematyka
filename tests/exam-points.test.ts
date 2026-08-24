import { describe, expect, it } from "vitest";
import {
  examSheetPoints,
  examTaskPoints,
  expectedOpenAnswer,
  formatPkt,
  isOpenExamTask,
} from "@/lib/baza-zadan/cke/exam-points";
import { OPEN_TASK_PLACEHOLDER } from "@/lib/baza-zadan/cke/parse-abcd";
import type { Task } from "@/lib/baza-zadan/types";

function sample(overrides: Partial<Task>): Task {
  return {
    id: "cke-m25-maj-z01",
    title: "Zad. 1",
    category: "algebra",
    difficulty: "latwy",
    forPaths: ["liceum"],
    prompt: "Oblicz.",
    choices: ["1", "2", "3", "4"],
    correctIndex: 0,
    explanation: "2",
    ...overrides,
  };
}

describe("isOpenExamTask", () => {
  it("wykrywa atrapę ABCD dla otwartych CKE", () => {
    expect(
      isOpenExamTask(sample({ choices: [OPEN_TASK_PLACEHOLDER] })),
    ).toBe(true);
    expect(isOpenExamTask(sample({ choices: ["1", "2", "3", "4"] }))).toBe(
      false,
    );
  });
});

describe("examTaskPoints", () => {
  it("zadania zamknięte są za 1 pkt", () => {
    expect(examTaskPoints(sample({}))).toBe(1);
  });

  it("czyta schemat punktacji z rozwiązania", () => {
    expect(
      examTaskPoints(
        sample({
          choices: [OPEN_TASK_PLACEHOLDER],
          solutionSteps: [
            "3 1 pkt – odpowiedź poprawna. 0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.",
          ],
        }),
      ),
    ).toBe(1);
    expect(
      examTaskPoints(
        sample({
          choices: [OPEN_TASK_PLACEHOLDER],
          solutionSteps: [
            "2 pkt – wybranie dwóch poprawnych odpowiedzi. 1 pkt – wybranie jednej.",
          ],
        }),
      ),
    ).toBe(2);
  });

  it("dla otwartych z 2025 bez klucza daje 2 albo 3 pkt", () => {
    expect(
      examTaskPoints(
        sample({
          choices: [OPEN_TASK_PLACEHOLDER],
          examSource: {
            kind: "matura",
            year: 2025,
            taskNumber: "25",
            sessionLabel: "matura maj 2025",
          },
        }),
      ),
    ).toBe(2);
    expect(
      examTaskPoints(
        sample({
          choices: [OPEN_TASK_PLACEHOLDER],
          examSource: {
            kind: "matura",
            year: 2025,
            taskNumber: "31",
            sessionLabel: "matura maj 2025",
          },
        }),
      ),
    ).toBe(3);
  });

  it("sumuje arkusz", () => {
    expect(
      examSheetPoints([
        sample({}),
        sample({
          id: "b",
          choices: [OPEN_TASK_PLACEHOLDER],
          examSource: { kind: "matura", year: 2025, taskNumber: "25" },
        }),
      ]),
    ).toBe(3);
  });
});

describe("expectedOpenAnswer", () => {
  it("bierze explanation, nie atrapę wyboru", () => {
    expect(
      expectedOpenAnswer(
        sample({
          choices: [OPEN_TASK_PLACEHOLDER],
          explanation: "Mediana jest równa 4.",
        }),
      ),
    ).toBe("Mediana jest równa 4.");
  });
});

describe("formatPkt", () => {
  it("używa skrótu CKE", () => {
    expect(formatPkt(1)).toBe("1 pkt");
    expect(formatPkt(3)).toBe("3 pkt");
  });
});
