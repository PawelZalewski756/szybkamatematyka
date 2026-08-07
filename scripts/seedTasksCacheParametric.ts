/**
 * Wypełnia / odświeża data/tasks-cache parametrycznymi zadaniami (bez Gemini / SVG).
 *
 *   npm run seed:tasks-parametric
 *   npm run seed:tasks-parametric -- --per-topic=20
 *   npm run seed:tasks-parametric -- --refresh-parametric   # wymień parametric-v1, zostaw Gemini
 *   npm run seed:tasks-parametric -- --only=matura_podstawowa:ciagi:ciag_arytmetyczny
 */

import { randomUUID } from "crypto";
import { generateTaskDraft } from "../lib/trening/seed/generators";
import {
  countTaskCacheProgress,
  listAllTaskSlots,
  readTaskCache,
  writeTaskCache,
  type CachedGeminiTask,
  type TaskSlot,
} from "../lib/trening/seed/tasks-cache-utils";

type CliOptions = {
  perTopic: number;
  only: TaskSlot | null;
  dryRun: boolean;
  refreshParametric: boolean;
};

function parseArgs(): CliOptions {
  let perTopic = 20;
  let only: TaskSlot | null = null;
  let dryRun = false;
  let refreshParametric = false;

  for (const arg of process.argv.slice(2)) {
    if (arg === "--dry-run") dryRun = true;
    else if (arg === "--refresh-parametric") refreshParametric = true;
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

  return { perTopic, only, dryRun, refreshParametric };
}

function draftToCached(
  draft: ReturnType<typeof generateTaskDraft>,
  model: string,
): CachedGeminiTask {
  return {
    content: draft.content,
    correct_answer: draft.correct_answer,
    options: draft.options,
    answer_type: draft.options.length > 0 ? "choice" : "open",
    difficulty: draft.difficulty,
    xp_reward: draft.xp_reward,
    explanation: `Krok 1. Przelicz wyrażenie / równanie z treści.\nKrok 2. Porównaj wynik z opcjami.\n**Odpowiedź:** ${draft.correct_answer}`,
    figure_svg: null,
    figure_caption: null,
    id: randomUUID(),
    generatedAt: new Date().toISOString(),
    model,
  };
}

function main(): void {
  const { perTopic, only, dryRun, refreshParametric } = parseArgs();
  const slots = only ? [only] : listAllTaskSlots();
  const modelTag = "parametric-v2";

  console.log(`\n=== Seed tasks-cache (parametric) ===`);
  console.log(
    `Slotów: ${slots.length} · cel: ${perTopic}/temat · refresh: ${refreshParametric} · dry-run: ${dryRun}\n`,
  );

  let added = 0;
  let replaced = 0;
  let skippedFull = 0;

  for (const slot of slots) {
    const existing = readTaskCache(slot);
    const kept =
      existing?.tasks.filter((t) => {
        if (!refreshParametric) return true;
        return !String(t.model || "").startsWith("parametric");
      }) ?? [];
    const have = kept.length;
    const need = Math.max(0, perTopic - have);
    if (need === 0 && (!refreshParametric || (existing?.tasks.length ?? 0) === have)) {
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
      batch.push(draftToCached(generateTaskDraft(seedSlot, have + i), modelTag));
    }

    const removed =
      refreshParametric && existing
        ? existing.tasks.length - kept.length
        : 0;
    replaced += removed;
    added += batch.length;

    console.log(
      `  ${slot.exam_type}/${slot.category}/${slot.topic}: keep ${have}, +${batch.length}` +
        (removed ? `, −${removed} starych parametric` : ""),
    );

    if (!dryRun) {
      writeTaskCache({
        exam_type: slot.exam_type,
        category: slot.category,
        topic: slot.topic,
        categoryName: slot.categoryName,
        topicName: slot.topicName,
        tasks: [...kept, ...batch],
        updatedAt: new Date().toISOString(),
      });
    }
  }

  const progress = countTaskCacheProgress();
  console.log(`\nDodano: ${added} · wymieniono starych parametric: ${replaced} · już pełne: ${skippedFull}`);
  console.log(
    `Cache: ${progress.totalTasks} zadań w ${progress.slotsWithTasks}/${progress.totalSlots} slotach (cel ${perTopic}/temat)\n`,
  );
}

main();
