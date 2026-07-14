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
