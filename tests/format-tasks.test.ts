import { describe, expect, it } from "vitest";
import {
  normalizeGeminiTask,
  parseGeminiTasksJson,
  taskContentForDb,
} from "@/lib/gemini/format-tasks";

describe("parseGeminiTasksJson", () => {
  it("parses fenced JSON array", () => {
    const raw = '```json\n[{"content":"x","options":["1","2","3","4"],"correct_answer":"1","difficulty":1,"xp_reward":10,"explanation":"ok","figure_svg":null,"figure_caption":null}]\n```';
    expect(parseGeminiTasksJson(raw)).toHaveLength(1);
  });

  it("nie zamienia \\times (pojedynczy ukośnik od modelu) na tabulator", () => {
    // Model oddaje LaTeX z jednym ukośnikiem: dla JSON-a to poprawny escape `\t`.
    const raw =
      '[{"content":"Oblicz $15 + (5\\times3)^2 - 10$.","options":["35","40","25","45"],"correct_answer":"35","difficulty":2,"xp_reward":16,"explanation":"$15 + 25 - 10 = 30$","figure_svg":null,"figure_caption":null}]';
    const parsed = parseGeminiTasksJson(raw) as Array<{ content: string }>;
    expect(parsed[0]!.content).toBe("Oblicz $15 + (5\\times3)^2 - 10$.");
    expect(parsed[0]!.content).not.toContain("\t");
  });

  it("zostawia prawdziwe nowe linie w explanation", () => {
    const raw =
      '[{"content":"Oblicz $2+2$.","options":["3","4","5","6"],"correct_answer":"4","difficulty":1,"xp_reward":10,"explanation":"Krok 1.\\nDodaj liczby.","figure_svg":null,"figure_caption":null}]';
    const parsed = parseGeminiTasksJson(raw) as Array<{ explanation: string }>;
    expect(parsed[0]!.explanation).toBe("Krok 1.\nDodaj liczby.");
  });
});

describe("normalizeGeminiTask", () => {
  it("accepts valid MC task", () => {
    const task = normalizeGeminiTask({
      content: "Oblicz $2+2$.",
      options: ["3", "4", "5", "6"],
      correct_answer: "4",
      difficulty: 1,
      xp_reward: 12,
      explanation: "Dwa plus dwa to cztery.",
      figure_svg: null,
      figure_caption: null,
    });
    expect(task?.correct_answer).toBe("4");
    expect(task?.options).toHaveLength(4);
  });

  it("accepts open task with empty options", () => {
    const task = normalizeGeminiTask({
      answer_type: "open",
      content: "Oblicz $3+4$.",
      options: [],
      correct_answer: "7",
      difficulty: 2,
      xp_reward: 16,
      explanation: "3+4=7",
      figure_svg: null,
      figure_caption: null,
    });
    expect(task?.options).toHaveLength(0);
    expect(task?.answer_type).toBe("open");
  });

  it("rejects when correct_answer not in options", () => {
    const task = normalizeGeminiTask({
      content: "Pytanie?",
      options: ["1", "2", "3", "4"],
      correct_answer: "9",
      difficulty: 1,
      xp_reward: 10,
      explanation: "",
      figure_svg: null,
      figure_caption: null,
    });
    expect(task).toBeNull();
  });

  it("naprawia treść uszkodzoną przez parser JSON", () => {
    const task = normalizeGeminiTask({
      content: "Oblicz $15 + (5\u0009imes3)^2 - 10$.",
      options: ["35", "40", "25", "45"],
      correct_answer: "35",
      difficulty: 2,
      xp_reward: 16,
      explanation: "Policz najpierw nawias.",
      figure_svg: null,
      figure_caption: null,
    });
    expect(task?.content).toBe("Oblicz $15 + (5\\times3)^2 - 10$.");
  });
});

describe("taskContentForDb", () => {
  it("embeds SVG as data URI markdown image", () => {
    const content = taskContentForDb({
      content: "Jaki jest kąt?",
      figure_svg: '<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg"><line x1="0" y1="0" x2="10" y2="10" stroke="white"/></svg>',
      figure_caption: "Trójkąt",
    });
    expect(content).toContain("data:image/svg+xml,");
    expect(content).toContain("Jaki jest kąt?");
  });
});
