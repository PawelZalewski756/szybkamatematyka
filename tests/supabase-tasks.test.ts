import { describe, expect, it } from "vitest";
import { mapTask, parseTaskOptions } from "@/lib/supabase/tasks";

describe("parseTaskOptions", () => {
  it("keeps options returned as a JSON array", () => {
    expect(parseTaskOptions(["A", "B"])).toEqual(["A", "B"]);
  });

  it("parses options stored as a JSON-encoded string", () => {
    expect(
      parseTaskOptions(JSON.stringify(["$\\log_2 2$", "$\\log_2 4$"])),
    ).toEqual(["$\\log_2 2$", "$\\log_2 4$"]);
  });

  it("ignores malformed or non-array option values", () => {
    expect(parseTaskOptions("not valid JSON")).toEqual([]);
    expect(parseTaskOptions(JSON.stringify({ A: "1" }))).toEqual([]);
  });
});

describe("mapTask", () => {
  const baseRow = {
    id: "t1",
    exam_type: "8_klasa" as const,
    category: "liczby",
    topic: "kolejnosc_dzialan",
    difficulty: 1,
    content: "Oblicz $2+2\\cdot 2$",
    correct_answer: "6",
    options: ["6", "8", "10", "4"],
    xp_reward: 10,
  };

  it("dopisuje wyjaśnienie parametryczne, gdy brak kolumny explanation", () => {
    const task = mapTask(baseRow);
    expect(task.explanation).toContain("Jak rozwiązać");
    expect(task.explanation).toContain("6");
  });

  it("usuwa niewidoczne znaki z treści", () => {
    const task = mapTask({ ...baseRow, content: "Oblicz $2+2\\cdot 2$\u200B" });
    expect(task.content).toBe("Oblicz $2+2\\cdot 2$");
    expect(task.explanation).toContain("Jak rozwiązać");
  });

  it("zachowuje wyjaśnienie z bazy, jeśli istnieje", () => {
    const task = mapTask({ ...baseRow, explanation: "Własne wyjaśnienie." });
    expect(task.explanation).toBe("Własne wyjaśnienie.");
  });
});
