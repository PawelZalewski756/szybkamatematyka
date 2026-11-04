import { describe, expect, it } from "vitest";
import { explainParametricTask } from "@/lib/trening/seed/parametric-explanations";
import { generateParametricTask } from "@/lib/trening/seed/parametric";
import type { SeedTopicSlot } from "@/lib/trening/seed/topics";

const slot: SeedTopicSlot = {
  exam_type: "matura_podstawowa",
  category: "liczby",
  topic: "potegi",
  weight: 1,
};

describe("parametric task explanations", () => {
  it("explains same-base multiplication using the task's actual values", () => {
    const explanation = explainParametricTask(
      "potegi",
      "Oblicz: $5^{3} \\cdot 5^{4}$",
      "78125",
    );

    expect(explanation).toContain("dodajemy wykładniki");
    expect(explanation).toContain("5^{3+4}=78125");
  });

  it("provides an equation method and the actual rearrangement", () => {
    const explanation = explainParametricTask(
      "rownania_liniowe",
      "Rozwiąż równanie: $2x+10=16$",
      "3",
    );

    expect(explanation).toContain("zmieniając jego znak");
    expect(explanation).toContain("$2x+10=16");
    expect(explanation).toContain("x=3");
  });

  it("attaches an explanation to generated parametric tasks", () => {
    const task = generateParametricTask(slot, 3);
    expect(task.explanation).toBeTruthy();
    expect(task.explanation).not.toContain("Podstaw dane z treści");
  });

  it("does not invent an explanation for an unrecognized task shape", () => {
    expect(
      explainParametricTask("logarytmy", "Zadanie opisowe bez wzoru", "2"),
    ).toBeNull();
  });

  it("calculates multiplication before subtraction in the displayed steps", () => {
    const explanation = explainParametricTask(
      "kolejnosc_dzialan",
      "Oblicz: $7\\cdot 3-4$",
      "17",
    );

    expect(explanation).toContain("$7\\cdot3-4=21-4=17$");
  });
});
