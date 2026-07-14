/**
 * Generowanie zadań treningowych przez Gemini → data/tasks-cache/
 *
 *   npm run seed:tasks-gemini
 *   npm run seed:tasks-gemini -- --per-topic=30
 *   npm run seed:tasks-gemini -- --exam=matura_podstawowa
 *   npm run seed:tasks-gemini -- --only=matura_podstawowa:ciagi:ciag_arytmetyczny
 *   npm run seed:tasks-gemini -- --batch-size=5 --delay=800
 *
 * Wymaga: GEMINI_API_KEY w .env.local
 */

import { randomUUID } from "crypto";
import path from "path";
import dotenv from "dotenv";
import { CKE_EGZAMIN_8 } from "../lib/trening/cke-egzamin-8";
import { CKE_MATURA_PODSTAWOWA } from "../lib/trening/cke-matura-podstawowa";
import { contentFingerprint } from "../lib/gemini/format-tasks";
import {
  dedupeTasks,
  generateTasksBatchWithRetry,
} from "../lib/gemini/generate-tasks";
import { sleep } from "../lib/gemini/generate-solution";
import {
  appendTasksToCache,
  countTaskCacheProgress,
  countTasksInCache,
  listAllTaskSlots,
  listTaskSlotsNeedingMore,
  readTaskCache,
  writeTaskCache,
  type CachedGeminiTask,
  type TaskSlot,
} from "../lib/trening/seed/tasks-cache-utils";
import type { ExamType } from "../types/database";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const EXAM_LABEL: Record<ExamType, string> = {
  matura_podstawowa: CKE_MATURA_PODSTAWOWA.label,
  matura_rozszerzona: "Matura rozszerzona",
  "8_klasa": CKE_EGZAMIN_8.label,
};

type CliOptions = {
  perTopic: number;
  batchSize: number;
  delayMs: number;
  dryRun: boolean;
  exam: ExamType | null;
  only: TaskSlot | null;
  regenerate: boolean;
};

function parseArgs(): CliOptions {
  let perTopic = 30;
  let batchSize = 5;
  let delayMs = 600;
  let dryRun = false;
  let exam: ExamType | null = null;
  let only: TaskSlot | null = null;
  let regenerate = false;

  for (const arg of process.argv.slice(2)) {
    if (arg === "--dry-run") dryRun = true;
    else if (arg === "--regenerate") regenerate = true;
    else if (arg.startsWith("--per-topic=")) {
      perTopic = Math.max(1, Number(arg.split("=")[1]));
    } else if (arg.startsWith("--batch-size=")) {
      batchSize = Math.max(1, Math.min(8, Number(arg.split("=")[1])));
    } else if (arg.startsWith("--delay=")) {
      delayMs = Math.max(0, Number(arg.split("=")[1]));
    } else if (arg.startsWith("--exam=")) {
      exam = arg.split("=")[1] as ExamType;
    } else if (arg.startsWith("--only=")) {
      const parts = arg.split("=")[1]?.split(":");
      if (parts?.length === 3) {
        const slot = listAllTaskSlots().find(
          (s) =>
            s.exam_type === parts[0] &&
            s.category === parts[1] &&
            s.topic === parts[2],
        );
        if (slot) only = slot;
      }
    }
  }

  return { perTopic, batchSize, delayMs, dryRun, exam, only, regenerate };
}

function slotFingerprints(slot: TaskSlot): Set<string> {
  const fps = new Set<string>();
  const bundle = readTaskCache(slot);
  for (const task of bundle?.tasks ?? []) {
    fps.add(contentFingerprint(task.content));
  }
  return fps;
}

async function generateForSlot(
  slot: TaskSlot,
  opts: CliOptions,
): Promise<number> {
  if (opts.regenerate && !opts.dryRun) {
    writeTaskCache({
      exam_type: slot.exam_type,
      category: slot.category,
      topic: slot.topic,
      categoryName: slot.categoryName,
      topicName: slot.topicName,
      tasks: [],
      updatedAt: new Date().toISOString(),
    });
  }

  const target = opts.perTopic;
  let added = 0;
  const fingerprints = slotFingerprints(slot);
  let batchIndex = 0;

  while (countTasksInCache(slot) + added < target) {
    const remaining = target - countTasksInCache(slot) - added;
    const thisBatch = Math.min(opts.batchSize, remaining);

    const existingSamples = [...(readTaskCache(slot)?.tasks ?? [])]
      .slice(-6)
      .map((t) => t.content);

    if (opts.dryRun) {
      console.log(
        `  [dry-run] ${slot.exam_type}/${slot.category}/${slot.topic} +${thisBatch}`,
      );
      added += thisBatch;
      batchIndex += 1;
      continue;
    }

    const { tasks, model } = await generateTasksBatchWithRetry({
      examLabel: EXAM_LABEL[slot.exam_type],
      categoryName: slot.categoryName,
      topicName: slot.topicName,
      categorySlug: slot.category,
      topicSlug: slot.topic,
      batchSize: thisBatch,
      batchIndex,
      existingSamples,
    });

    const unique = dedupeTasks(tasks, fingerprints);
    if (unique.length === 0) {
      console.warn(`  ⚠ Partia bez nowych unikalnych — ponawiam…`);
      batchIndex += 1;
      await sleep(opts.delayMs);
      continue;
    }

    const cached: CachedGeminiTask[] = unique.map((task) => ({
      ...task,
      id: randomUUID(),
      generatedAt: new Date().toISOString(),
      model,
    }));

    appendTasksToCache(slot, cached);
    added += cached.length;
    batchIndex += 1;

    console.log(
      `  ✓ ${slot.category}/${slot.topic} +${cached.length} (razem ${countTasksInCache(slot)}/${target}) [${model}]`,
    );

    if (countTasksInCache(slot) >= target) break;
    await sleep(opts.delayMs);
  }

  return added;
}

async function main() {
  const opts = parseArgs();

  if (!process.env.GEMINI_API_KEY?.trim()) {
    throw new Error("Brak GEMINI_API_KEY w .env.local");
  }

  const slots = opts.only
    ? [opts.only]
    : listTaskSlotsNeedingMore(opts.perTopic, opts.exam ?? undefined);

  console.log("\n=== Gemini → zadania treningowe (cache) ===\n");
  console.log(
    `Cel: ${opts.perTopic}/temat · partia ${opts.batchSize} · delay ${opts.delayMs}ms`,
  );
  console.log(`Tematy do uzupełnienia: ${slots.length}\n`);

  if (slots.length === 0) {
    const p = countTaskCacheProgress();
    console.log(`✓ Cache kompletny: ${p.totalTasks} zadań w ${p.slotsWithTasks} tematach.`);
    return;
  }

  let totalAdded = 0;
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i]!;
    console.log(
      `[${i + 1}/${slots.length}] ${EXAM_LABEL[slot.exam_type]} — ${slot.topicName}`,
    );
    totalAdded += await generateForSlot(slot, opts);
  }

  const progress = countTaskCacheProgress();
  console.log("\n--- Podsumowanie ---");
  console.log(`Dodano w tej sesji: ${totalAdded}`);
  console.log(
    `Cache: ${progress.totalTasks} zadań · ${progress.slotsWithTasks}/${progress.totalSlots} tematów z zadaniami`,
  );
  console.log(
    `Matura: ${progress.byExam.matura_podstawowa.tasks} zadań (${progress.byExam.matura_podstawowa.filled}/${progress.byExam.matura_podstawowa.slots} tematów)`,
  );
  console.log(
    `8 klasa: ${progress.byExam["8_klasa"].tasks} zadań (${progress.byExam["8_klasa"].filled}/${progress.byExam["8_klasa"].slots} tematów)`,
  );
  console.log("\nNastępny krok: npm run seed:tasks-sql → wklej SQL w Supabase\n");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
