import { describe, expect, it } from "vitest";
import { generateParametricTask } from "@/lib/trening/seed/parametric";
import type { SeedTopicSlot } from "@/lib/trening/seed/topics";

const slot: SeedTopicSlot = {
  exam_type: "matura_podstawowa",
  category: "liczby",
  topic: "zbiory_i_przedzialy",
  weight: 1,
};

describe("parametric interval intersection tasks", () => {
  it("uses the actual overlap of both closed intervals", () => {
    for (let variant = 0; variant < 40; variant += 1) {
      const task = generateParametricTask(slot, variant);
      const match = task.content.match(
        /\$\[(-?\d+),(-?\d+)\]\$ i \$\[(-?\d+),(-?\d+)\]\$/,
      );

      expect(match, task.content).not.toBeNull();
      const [, leftA, rightA, leftB, rightB] = match!;
      const expected = `[${Math.max(Number(leftA), Number(leftB))}, ${Math.min(Number(rightA), Number(rightB))}]`;
      expect(task.correct_answer).toBe(expected);
    }
  });
});
