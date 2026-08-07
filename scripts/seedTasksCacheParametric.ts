/**
 * Wypełnia data/tasks-cache parametrycznymi zadaniami (bez Gemini / SVG).
 *
 *   npm run seed:tasks-parametric
 *   npm run seed:tasks-parametric -- --per-topic=20
 *   npm run seed:tasks-parametric -- --only=matura_podstawowa:ciagi:ciag_arytmetyczny
 *
 * Nie nadpisuje istniejących zadań Gemini — dokłada tylko do limitu.
 */

import { randomUUID } from "crypto";
import { generateTaskDraft } from "../lib/trening/seed/generators";
import {
  appendTasksToCache,
  countTaskCacheProgress,
  listAllTaskSlots,
  readTaskCache,
  type CachedGeminiTask,
  type TaskSlot,
} from "../lib/trening/seed/tasks-cache-utils";

type CliOptions = {
  perTopic: number;
  only: TaskSlot | null;
  dryRun: boolean;
};

function parseArgs(): CliOptions {
  let perTopic = 20;
  let only: TaskSlot | null = null;
  let dryRun = false;

  for (const arg of process.argv.slice(2)) {
    if (arg === "--dry-run") dryRun = true;
    else if (arg.startsWith("--per-topic=")) {
      perTopic = Math.max(1, Number(arg.split("=")[1]));
    } else if (arg.startsWith("--only=")) {
      const parts = arg.split("=")[1]?.split(":");
      if (parts?.length === 3) {
        only =
          listAllTaskSlots().find(
            (s) =>
              s.exam_type === parts[0] &&
              s.category === parts[1] &&
              s.topic === parts[2],
          ) ?? null;
      }
    }
  }

  return { perTopic, only, dryRun };
}

function main(): void {
  const { perTopic, only, dryRun } = parseArgs();
  const slots = only ? [only] : listAllTaskSlots();

  console.log(`\n=== Seed tasks-cache (parametric) ===`);
  console.log(`Slotów: ${slots.length} · cel: ${perTopic}/temat · dry-run: ${dryRun}\n`);

  let added = 0;
  let skippedFull = 0;

  for (const slot of slots) {
    const existing = readTaskCache(slot);
    const have = existing?.tasks.length ?? 0;
    const need = Math.max(0, perTopic - have);
    if (need === 0) {
      skippedFull += 1;
      continue;
    }

    const seedSlot = {
      exam_type: slot.exam_type,
      category: slot.category,
      topic: slot.topic,
      weight: 3,
    };

    const batch: CachedGeminiTask[] = [];
    for (let i = 0; i < need; i++) {
      const draft = generateTaskDraft(seedSlot, have + i);
      batch.push({
        content: draft.content,
        correct_answer: draft.correct_answer,
        options: draft.options,
        answer_type: draft.options.length > 0 ? "choice" : "open",
        difficulty: draft.difficulty,
        xp_reward: draft.xp_reward,
        explanation: `Odpowiedź: ${draft.correct_answer}`,
        figure_svg: null,
        figure_caption: null,
        id: randomUUID(),
        generatedAt: new Date().toISOString(),
        model: "parametric-v1",
      });
    }

    console.log(
      `  + ${slot.exam_type}/${slot.category}/${slot.topic}: +${batch.length} (było ${have})`,
    );
    if (!dryRun) appendTasksToCache(slot, batch);
    added += batch.length;
  }

  const progress = countTaskCacheProgress();
  console.log(`\nDodano: ${added} · już pełne: ${skippedFull}`);
  console.log(
    `Cache: ${progress.totalTasks} zadań w ${progress.slotsWithTasks}/${progress.totalSlots} slotach (cel ${perTopic}/temat)\n`,
  );
}

main();
