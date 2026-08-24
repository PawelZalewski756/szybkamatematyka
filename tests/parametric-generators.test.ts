import { describe, expect, it } from "vitest";
import { generateTaskDraft } from "@/lib/trening/seed/generators";
import { listAllTaskSlots } from "@/lib/trening/seed/tasks-cache-utils";
import { checkAnswerMatch } from "@/lib/math/answer-equiv";

describe("parametric generators quality gate", () => {
  it("każdy temat generuje poprawne strukturalnie warianty", () => {
    for (const slot of listAllTaskSlots()) {
      for (let variant = 0; variant < 10; variant += 1) {
        const task = generateTaskDraft(
          { ...slot, weight: 3 },
          variant,
        );

        expect(task.content.trim(), `${slot.topic}/${variant}`).not.toBe("");
        expect(
          task.correct_answer.trim(),
          `${slot.topic}/${variant}`,
        ).not.toBe("");
        expect(task.difficulty).toBeGreaterThanOrEqual(1);
        expect(task.difficulty).toBeLessThanOrEqual(3);
        expect(task.xp_reward).toBeGreaterThan(0);

        const normalizedOptions = task.options.map((option) =>
          option.trim().toLowerCase(),
        );
        expect(new Set(normalizedOptions).size).toBe(task.options.length);
        if (task.options.length > 0) {
          expect(
            task.options.some((option) =>
              checkAnswerMatch(option, task.correct_answer),
            ),
            `${slot.exam_type}/${slot.category}/${slot.topic}/${variant}`,
          ).toBe(true);
        }
      }
    }
  });

  it("ten sam slot i wariant są deterministyczne", () => {
    const slot = listAllTaskSlots()[0]!;
    expect(generateTaskDraft({ ...slot, weight: 3 }, 7)).toEqual(
      generateTaskDraft({ ...slot, weight: 3 }, 7),
    );
  });
});

