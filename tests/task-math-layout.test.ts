import { describe, expect, it } from "vitest";
import { getTaskMathChoices } from "@/lib/math/task-math-layout";

const choices = [
  "a = 5 \\times (12 - 3) \\div 3",
  "b = (5 \\times 12 - 3) \\div 3",
  "c = 5 \\times 12 \\div (3 \\div 3)",
  "d = 5 \\times (12 \\div 3 - 3)",
];

function contentWithChoices(): string {
  return [
    "Która z podanych liczb jest największa?",
    ...choices.map((choice) => `$$${choice}$$`),
  ].join("\n\n");
}

describe("getTaskMathChoices", () => {
  it("rozpoznaje pytanie i cztery wyrażenia w display math", () => {
    const layout = getTaskMathChoices(contentWithChoices());
    expect(layout).not.toBeNull();
    expect(layout?.choices).toEqual(choices);
    expect(
      layout?.before.map((part) => ("text" in part ? part.text : "")).join("").trim(),
    ).toBe("Która z podanych liczb jest największa?");
    expect(layout?.after).toHaveLength(0);
  });

  it("nie rusza zwykłej treści z dwoma wzorami", () => {
    expect(
      getTaskMathChoices("Oblicz $2+2$. Wynik to $$4$$, a potem $$8$$."),
    ).toBeNull();
  });

  it("nie rusza treści, w której między wzorami jest tekst", () => {
    expect(
      getTaskMathChoices(
        "$$a = 1$$\n\nKrok pierwszy\n\n$$b = 2$$\n\n$$c = 3$$\n\n$$d = 4$$",
      ),
    ).toBeNull();
  });

  it("nie rusza treści z obrazkiem", () => {
    expect(
      getTaskMathChoices("![Rysunek](data:image/svg+xml,x)\n\n" + contentWithChoices()),
    ).toBeNull();
  });
});
