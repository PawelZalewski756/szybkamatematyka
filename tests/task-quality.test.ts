import { describe, expect, it } from "vitest";
import {
  inferAnswerFromExplanation,
  reconcileTaskAnswer,
} from "@/lib/gemini/task-quality";

describe("inferAnswerFromExplanation", () => {
  it("reads final numeric result from Zatem chain", () => {
    const expl =
      "${\\log_3 9 = 2}$. ${\\log_2 16 = 4}$. Zatem ${2 \\cdot 2 - 4 = 4 - 4 = 0}$.";
    expect(inferAnswerFromExplanation(expl)).toBe("0");
  });

  it("reads explicit correction phrase", () => {
    expect(
      inferAnswerFromExplanation("Poprawiam poprawną odpowiedź na 1."),
    ).toBe("1");
  });
});

describe("reconcileTaskAnswer", () => {
  it("fixes open task when explanation says 0 but correct_answer is 2", () => {
    const fixed = reconcileTaskAnswer({
      content: "Oblicz $2\\log_3 9 - \\log_2 16$",
      correct_answer: "2",
      options: [],
      answer_type: "open",
      difficulty: 3,
      xp_reward: 22,
      explanation:
        "${\\log_3 9 = 2}$. ${\\log_2 16 = 4}$. Zatem ${2 \\cdot 2 - 4 = 4 - 4 = 0}$.",
      figure_svg: null,
      figure_caption: null,
    });
    expect(fixed.repaired).toBe(true);
    expect(fixed.correct_answer).toBe("0");
  });

  it("removes a multiple-choice task with a broken explanation", () => {
    const result = reconcileTaskAnswer({
      content: "Oblicz wartość $x$.",
      correct_answer: "3",
      options: ["1", "2", "3", "4"],
      answer_type: "choice",
      difficulty: 1,
      xp_reward: 12,
      explanation: "W treści zadania jest błąd w opcjach.",
      figure_svg: null,
      figure_caption: null,
    });

    expect(result.shouldRemove).toBe(true);
    expect(result.repairReason).toBe("broken explanation");
  });
});
