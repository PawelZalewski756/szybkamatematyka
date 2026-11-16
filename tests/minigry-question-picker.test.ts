import { pickUnseenQuestion } from "@/lib/minigry/question-picker";
import { describe, expect, it } from "vitest";

describe("pickUnseenQuestion", () => {
  it("nie powtarza pytania, dopóki pula ma niewidziane", () => {
    const seen = new Set<string>();
    let counter = 0;
    const generate = () => ({ id: `q-${counter++ % 10}` });

    const ids: string[] = [];
    for (let index = 0; index < 10; index += 1) {
      ids.push(pickUnseenQuestion(generate, seen).id);
    }

    expect(new Set(ids).size).toBe(10);
  });

  it("po wyczerpaniu puli zaczyna nowy cykl", () => {
    const seen = new Set<string>();
    let counter = 0;
    const generate = () => ({ id: `q-${counter++ % 2}` });

    const first = pickUnseenQuestion(generate, seen);
    const second = pickUnseenQuestion(generate, seen);
    const third = pickUnseenQuestion(generate, seen);

    expect(first.id).not.toBe(second.id);
    expect(seen.has(third.id)).toBe(true);
  });
});
