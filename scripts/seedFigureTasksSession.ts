/**
 * Sesja Gemini: zadania z obrazkami (SVG), walidacja odpowiedzi, push do Supabase.
 *
 *   # Test ~5 zadań (szybki review)
 *   npm run seed:tasks-figures -- --limit=5
 *
 *   # Sesja ~2h w tle
 *   npm run seed:tasks-figures -- --hours=2 --per-topic=12
 *
 * Log: data/tasks-cache/figures-session.log
 * Manifest testu: data/tasks-cache/figures-review.json
 */

import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { CKE_EGZAMIN_8 } from "../lib/trening/cke-egzamin-8";
import { CKE_MATURA_PODSTAWOWA } from "../lib/trening/cke-matura-podstawowa";
import {
  contentFingerprint,
  taskContentForDb,
  type ParsedGeminiTask,
} from "../lib/gemini/format-tasks";
import {
  auditTaskQuality,
  reconcileTaskAnswer,
} from "../lib/gemini/task-quality";
import {
  dedupeTasks,
  generateTasksBatchWithRetry,
} from "../lib/gemini/generate-tasks";
import { sleep } from "../lib/gemini/generate-solution";
import { fetchAllPages } from "../lib/supabase/fetch-all-pages";
import { buildTopicHref } from "../lib/trening/slugs";
import type { TreningExamKey } from "../lib/trening/curriculum";
import {
  appendTasksToCache,
  countTaskCacheProgress,
  listAllTaskSlots,
  readTaskCache,
  type CachedGeminiTask,
  type TaskSlot,
} from "../lib/trening/seed/tasks-cache-utils";
import type { ExamType } from "../types/database";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const LOG = path.resolve(process.cwd(), "data/tasks-cache/figures-session.log");
const REVIEW = path.resolve(process.cwd(), "data/tasks-cache/figures-review.json");

const FIGURE_TOPIC_RE =
  /geometr|planimetr|stereometr|pitagor|okrag|podobien|analitycz|wykres|funkcj|uklad|wspolrzed|diagram|symetr|bryl|objetosc|pole|obwod|katy|proporcjon/i;

const EXAM_LABEL: Record<ExamType, string> = {
  matura_podstawowa: CKE_MATURA_PODSTAWOWA.label,
  matura_rozszerzona: "Matura rozszerzona",
  "8_klasa": CKE_EGZAMIN_8.label,
};

type CliOptions = {
  limit: number | null;
  hours: number;
  perTopic: number;
  batchSize: number;
  delayMs: number;
  pushEvery: number;
  noPush: boolean;
};

type ReviewItem = {
  id: string;
  exam_type: ExamType;
  category: string;
  topic: string;
  topicName: string;
  contentPreview: string;
  correct_answer: string;
  hasFigure: boolean;
  figure_caption: string | null;
  qualityIssues: string[];
  repaired: boolean;
  href: string;
  cacheFile: string;
};

function parseArgs(): CliOptions {
  let limit: number | null = null;
  let hours = 2;
  let perTopic = 12;
  let batchSize = 5;
  let delayMs = 1200;
  let pushEvery = 5;
  let noPush = false;

  for (const arg of process.argv.slice(2)) {
    if (arg === "--no-push") noPush = true;
    else if (arg.startsWith("--limit=")) limit = Math.max(1, Number(arg.split("=")[1]));
    else if (arg.startsWith("--hours=")) hours = Math.max(0.05, Number(arg.split("=")[1]));
    else if (arg.startsWith("--per-topic=")) perTopic = Math.max(1, Number(arg.split("=")[1]));
    else if (arg.startsWith("--batch-size=")) {
      batchSize = Math.max(1, Math.min(5, Number(arg.split("=")[1])));
    } else if (arg.startsWith("--delay=")) delayMs = Math.max(0, Number(arg.split("=")[1]));
    else if (arg.startsWith("--push-every=")) {
      pushEvery = Math.max(1, Number(arg.split("=")[1]));
    }
  }

  // Tryb testowy: limit bez długiej sesji
  if (limit !== null && !process.argv.some((a) => a.startsWith("--hours="))) {
    hours = 0.25;
  }

  return { limit, hours, perTopic, batchSize, delayMs, pushEvery, noPush };
}

function log(line: string): void {
  const row = `[${new Date().toISOString()}] ${line}\n`;
  fs.mkdirSync(path.dirname(LOG), { recursive: true });
  fs.appendFileSync(LOG, row, "utf8");
  console.log(line);
}

function figureSlots(): TaskSlot[] {
  return listAllTaskSlots().filter((s) =>
    FIGURE_TOPIC_RE.test(
      `${s.category} ${s.topic} ${s.categoryName} ${s.topicName}`,
    ),
  );
}

function slotFingerprints(slot: TaskSlot): Set<string> {
  const fps = new Set<string>();
  for (const task of readTaskCache(slot)?.tasks ?? []) {
    fps.add(contentFingerprint(task.content));
  }
  return fps;
}

function countFiguresInSlot(slot: TaskSlot): number {
  return (readTaskCache(slot)?.tasks ?? []).filter((t) => t.figure_svg).length;
}

/** Odrzuć ozdobne SVG - rysunek musi być potrzebny do rozwiązania. */
function decorativeFigureReason(task: ParsedGeminiTask): string | null {
  const svg = task.figure_svg ?? "";
  if (svg.length < 180 || !svg.includes("</svg>")) {
    return "svg za małe/uszkodzone";
  }
  if (
    !/na (rysunku|wykresie|diagramie|poniższym rysunku|poniższym wykresie)/i.test(
      task.content,
    )
  ) {
    return "brak odwołania do rysunku w treści";
  }

  const numbers = task.content.match(/\d+(?:[.,]\d+)?/g) ?? [];
  const hasExplicitGeom =
    /(promień|średnica|bok|wysokość|kąt|miar[aę]|wynosi|r\s*=)/i.test(task.content) &&
    numbers.length >= 2;
  const asksCompute = /oblicz|wyznacz|podaj długość|podaj pole|podaj objętość/i.test(
    task.content,
  );
  const needsRead =
    /odczyt|z (rysunku|wykresu)|na podstawie (rysunku|wykresu)|przedstawion(y|e|ą) na/i.test(
      task.content,
    );

  if (hasExplicitGeom && asksCompute && !needsRead) {
    return "dane kompletne w tekście - rysunek zbędny";
  }
  return null;
}

function qualityGate(task: ParsedGeminiTask): {
  task: ParsedGeminiTask;
  repaired: boolean;
  issues: string[];
  reject: boolean;
} {
  const reconciled = reconcileTaskAnswer(task);
  if (reconciled.shouldRemove) {
    return {
      task,
      repaired: false,
      issues: [reconciled.repairReason ?? "shouldRemove"],
      reject: true,
    };
  }

  const next: ParsedGeminiTask = {
    content: reconciled.content,
    correct_answer: reconciled.correct_answer,
    options: reconciled.options,
    answer_type: reconciled.answer_type,
    difficulty: reconciled.difficulty,
    xp_reward: reconciled.xp_reward,
    explanation: reconciled.explanation,
    figure_svg: reconciled.figure_svg,
    figure_caption: reconciled.figure_caption,
  };

  const issues = auditTaskQuality(next);
  if (!next.figure_svg) {
    return { task: next, repaired: Boolean(reconciled.repaired), issues: [...issues, "brak SVG"], reject: true };
  }
  const decorative = decorativeFigureReason(next);
  if (decorative) {
    return {
      task: next,
      repaired: Boolean(reconciled.repaired),
      issues: [...issues, decorative],
      reject: true,
    };
  }
  if (
    issues.some(
      (i) =>
        i.includes("not in options") ||
        i.includes("mismatch") ||
        i.includes("broken explanation"),
    )
  ) {
    return { task: next, repaired: Boolean(reconciled.repaired), issues, reject: true };
  }
  return { task: next, repaired: Boolean(reconciled.repaired), issues, reject: false };
}

function toReviewItem(slot: TaskSlot, task: CachedGeminiTask, issues: string[], repaired: boolean): ReviewItem {
  const href = buildTopicHref(
    slot.exam_type as TreningExamKey,
    slot.category,
    slot.topic,
  );
  return {
    id: task.id,
    exam_type: slot.exam_type,
    category: slot.category,
    topic: slot.topic,
    topicName: slot.topicName,
    contentPreview: task.content.replace(/\s+/g, " ").slice(0, 160),
    correct_answer: task.correct_answer,
    hasFigure: Boolean(task.figure_svg),
    figure_caption: task.figure_caption,
    qualityIssues: issues,
    repaired,
    href,
    cacheFile: `data/tasks-cache/${slot.exam_type}__${slot.category}__${slot.topic}.json`,
  };
}

async function pushNewTasksToDb(sinceIds: Set<string>): Promise<number> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) {
    log("⚠ Brak Supabase - pomijam push do DB");
    return 0;
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const slots = figureSlots();
  const candidates: Array<CachedGeminiTask & TaskSlot> = [];
  for (const slot of slots) {
    for (const task of readTaskCache(slot)?.tasks ?? []) {
      if (!sinceIds.has(task.id)) continue;
      if (!task.figure_svg) continue;
      candidates.push({ ...task, ...slot });
    }
  }

  if (candidates.length === 0) return 0;

  const { rows: existingRows, error: fetchError } = await fetchAllPages<{ content: string }>(
    (from, to) => supabase.from("tasks").select("content").range(from, to),
  );
  if (fetchError) {
    log(`⚠ Fetch DB: ${fetchError.message}`);
    return 0;
  }

  const existing = new Set(existingRows.map((r) => contentFingerprint(r.content)));
  const toInsert = candidates.filter(
    (t) => !existing.has(contentFingerprint(taskContentForDb(t))),
  );

  if (toInsert.length === 0) {
    log("DB: wszystkie nowe z obrazkami już są w bazie");
    return 0;
  }

  const chunk = toInsert.map((task) => ({
    exam_type: task.exam_type,
    category: task.category,
    topic: task.topic,
    difficulty: task.difficulty,
    content: taskContentForDb(task),
    correct_answer: task.correct_answer,
    options: task.options,
    xp_reward: task.xp_reward,
  }));

  const { error } = await supabase.from("tasks").insert(chunk);
  if (error) {
    log(`⚠ Insert DB: ${error.message}`);
    return 0;
  }

  log(`✓ DB +${chunk.length} zadań z obrazkami`);
  return chunk.length;
}

async function generateBatch(
  slot: TaskSlot,
  batchSize: number,
  batchIndex: number,
  fingerprints: Set<string>,
): Promise<Array<{ task: CachedGeminiTask; issues: string[]; repaired: boolean }>> {
  const existingSamples = [...(readTaskCache(slot)?.tasks ?? [])]
    .slice(-6)
    .map((t) => t.content);

  const { tasks, model } = await generateTasksBatchWithRetry({
    examLabel: EXAM_LABEL[slot.exam_type],
    categoryName: slot.categoryName,
    topicName: slot.topicName,
    categorySlug: slot.category,
    topicSlug: slot.topic,
    batchSize,
    batchIndex,
    existingSamples,
    taskKind: "choice",
    requireFigures: true,
  });

  const unique = dedupeTasks(tasks, fingerprints);
  const accepted: Array<{ task: CachedGeminiTask; issues: string[]; repaired: boolean }> = [];

  for (const raw of unique) {
    const gated = qualityGate(raw);
    if (gated.reject) {
      log(`  ✗ odrzucone: ${gated.issues.join("; ") || "quality"}`);
      continue;
    }
    const cached: CachedGeminiTask = {
      ...gated.task,
      id: randomUUID(),
      generatedAt: new Date().toISOString(),
      model,
    };
    accepted.push({ task: cached, issues: gated.issues, repaired: gated.repaired });
  }

  return accepted;
}

async function main() {
  const opts = parseArgs();

  if (!process.env.GEMINI_API_KEY?.trim()) {
    throw new Error("Brak GEMINI_API_KEY w .env.local");
  }

  const deadline = Date.now() + opts.hours * 60 * 60 * 1000;
  const slots = figureSlots().sort(
    (a, b) => countFiguresInSlot(a) - countFiguresInSlot(b),
  );

  log("═══ Sesja Gemini: zadania z obrazkami ═══");
  log(
    `limit=${opts.limit ?? "∞"} · hours=${opts.hours} · perTopic=${opts.perTopic} · batch=${opts.batchSize} · tematy=${slots.length}`,
  );

  const reviewItems: ReviewItem[] = [];
  const sessionIds = new Set<string>();
  let added = 0;
  let pushed = 0;
  let round = 0;
  let sinceLastPush = 0;

  while (Date.now() < deadline) {
    if (opts.limit !== null && added >= opts.limit) break;

    round += 1;
    let roundAdded = 0;

    for (const slot of slots) {
      if (Date.now() >= deadline) break;
      if (opts.limit !== null && added >= opts.limit) break;

      const have = countFiguresInSlot(slot);
      if (have >= opts.perTopic) continue;

      const remainingTarget = opts.perTopic - have;
      const remainingLimit =
        opts.limit !== null ? opts.limit - added : remainingTarget;
      const thisBatch = Math.min(opts.batchSize, remainingTarget, remainingLimit);
      if (thisBatch <= 0) continue;

      log(
        `[r${round}] ${slot.exam_type}/${slot.category}/${slot.topic} - generuję ${thisBatch} z SVG (już ${have}/${opts.perTopic})`,
      );

      try {
        const fingerprints = slotFingerprints(slot);
        const accepted = await generateBatch(slot, thisBatch, round, fingerprints);
        if (accepted.length === 0) {
          log("  ⚠ partia pusta po filtrach - delay i dalej");
          await sleep(opts.delayMs);
          continue;
        }

        appendTasksToCache(
          slot,
          accepted.map((a) => a.task),
        );

        for (const a of accepted) {
          sessionIds.add(a.task.id);
          reviewItems.push(toReviewItem(slot, a.task, a.issues, a.repaired));
          added += 1;
          roundAdded += 1;
          sinceLastPush += 1;
          log(
            `  ✓ +1 SVG [${a.task.id.slice(0, 8)}] ${a.repaired ? "(naprawione)" : "ok"} - ${slot.topicName}`,
          );
          if (opts.limit !== null && added >= opts.limit) break;
        }

        if (!opts.noPush && sinceLastPush >= opts.pushEvery) {
          pushed += await pushNewTasksToDb(sessionIds);
          sinceLastPush = 0;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        log(`  ✗ błąd: ${msg.slice(0, 240)}`);
        if (/quota|429|exhausted|rate/i.test(msg)) {
          log("  ⏳ Limit API - czekam 90s…");
          await sleep(90_000);
        } else {
          await sleep(opts.delayMs);
        }
      }

      await sleep(opts.delayMs);
    }

    if (roundAdded === 0) {
      const allFull = slots.every((s) => countFiguresInSlot(s) >= opts.perTopic);
      if (allFull) {
        log("✓ Wszystkie tematy figure osiągnęły cel per-topic.");
        break;
      }
      log("Runda bez postępu - czekam 45s…");
      await sleep(45_000);
    }
  }

  if (!opts.noPush && sessionIds.size > 0) {
    pushed += await pushNewTasksToDb(sessionIds);
  }

  fs.mkdirSync(path.dirname(REVIEW), { recursive: true });
  fs.writeFileSync(
    REVIEW,
    JSON.stringify(
      {
        updatedAt: new Date().toISOString(),
        added,
        pushed,
        items: reviewItems,
      },
      null,
      2,
    ),
    "utf8",
  );

  const progress = countTaskCacheProgress();
  log("--- Koniec sesji ---");
  log(`Dodano (z SVG + quality): ${added}`);
  log(`Wgrano do DB w tej sesji: ${pushed}`);
  log(`Cache łącznie: ${progress.totalTasks} zadań / ${progress.slotsWithTasks} tematów`);
  log(`Review: ${REVIEW}`);
  if (reviewItems.length > 0) {
    log("Gdzie oglądać (trening):");
    const seen = new Set<string>();
    for (const item of reviewItems) {
      if (seen.has(item.href)) continue;
      seen.add(item.href);
      log(`  http://localhost:3000${item.href}`);
    }
  }
}

main().catch((err) => {
  log(`✗ ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
