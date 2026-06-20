/**
 * Masowy seed zadań areny treningowej (tasks) + materiałów teoretycznych (materials).
 *
 *   npm run seed:trening-tasks
 *   npm run seed:trening-tasks -- --count=5000
 *   npm run seed:trening-tasks -- --dry-run
 *   npm run seed:trening-tasks -- --materials-only
 *
 * Wymaga: .env.local (Supabase URL + klucz). Zalecane: migracja
 *   supabase/migrations/add_tasks_materials_insert.sql (INSERT przez anon).
 * Opcjonalnie: SUPABASE_SERVICE_ROLE_KEY (omija RLS).
 */

import { createHash } from "crypto";
import path from "path";
import dotenv from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { generateTaskDraft, type TaskDraft } from "../lib/trening/seed/generators";
import { materialKey, SEED_MATERIALS } from "../lib/trening/seed/materials";
import {
  allocateCounts,
  SEED_TOPIC_SLOTS,
  slotKey,
  type SeedTopicSlot,
} from "../lib/trening/seed/topics";
import type { ExamType } from "../types/database";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const DEFAULT_TARGET = 5000;
const BATCH_SIZE = 250;

type CliOptions = {
  target: number;
  dryRun: boolean;
  materialsOnly: boolean;
  tasksOnly: boolean;
  skipMaterials: boolean;
};

type TaskRow = {
  exam_type: string;
  category: string;
  topic: string;
  content: string;
};

function parseArgs(): CliOptions {
  let target = DEFAULT_TARGET;
  let dryRun = false;
  let materialsOnly = false;
  let tasksOnly = false;
  let skipMaterials = false;

  for (const arg of process.argv.slice(2)) {
    if (arg === "--dry-run") dryRun = true;
    else if (arg === "--materials-only") materialsOnly = true;
    else if (arg === "--tasks-only") tasksOnly = true;
    else if (arg === "--skip-materials") skipMaterials = true;
    else if (arg.startsWith("--count=")) {
      target = Math.max(1, Number(arg.split("=")[1]));
    }
  }

  if (materialsOnly) tasksOnly = false;

  return { target, dryRun, materialsOnly, tasksOnly, skipMaterials };
}

function createSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const key = serviceKey || anonKey;

  if (!url || !key) {
    throw new Error(
      "Brakuje NEXT_PUBLIC_SUPABASE_URL lub klucza Supabase w .env.local",
    );
  }

  if (!serviceKey) {
    console.warn(
      "⚠ Brak SUPABASE_SERVICE_ROLE_KEY — używam anon. Uruchom migrację add_tasks_materials_insert.sql lub dodaj service role.",
    );
  }

  return createClient(url, key);
}

function contentHash(
  examType: ExamType,
  category: string,
  topic: string,
  content: string,
): string {
  const norm = content.trim().replace(/\s+/g, " ");
  return createHash("sha256")
    .update(`${examType}|${category}|${topic}|${norm}`)
    .digest("hex")
    .slice(0, 24);
}

async function loadExistingHashes(
  supabase: SupabaseClient,
): Promise<Set<string>> {
  const hashes = new Set<string>();
  const pageSize = 1000;
  let from = 0;

  console.log("Ładowanie istniejących zadań (deduplikacja)…");

  while (true) {
    const { data, error } = await supabase
      .from("tasks")
      .select("exam_type, category, topic, content")
      .range(from, from + pageSize - 1);

    if (error) throw new Error(error.message);
    const rows = (data as TaskRow[]) ?? [];
    if (rows.length === 0) break;

    for (const row of rows) {
      hashes.add(
        contentHash(
          row.exam_type as ExamType,
          row.category,
          row.topic,
          row.content,
        ),
      );
    }

    from += pageSize;
    if (rows.length < pageSize) break;
    if (from % 5000 === 0) {
      console.log(`  … ${hashes.size} unikalnych hashy`);
    }
  }

  console.log(`  Załadowano ${hashes.size} hashy treści.`);
  return hashes;
}

function buildTaskBatch(
  slots: SeedTopicSlot[],
  counts: Map<string, number>,
  existing: Set<string>,
): { toInsert: TaskDraft[]; skipped: number; generated: number } {
  const toInsert: TaskDraft[] = [];
  let skipped = 0;
  let generated = 0;

  for (const slot of slots) {
    const key = slotKey(slot);
    const need = counts.get(key) ?? 0;
    let added = 0;
    let variant = 0;
    let attempts = 0;
    const maxAttempts = Math.max(need * 3, need + 100);

    while (added < need && attempts < maxAttempts) {
      const draft = generateTaskDraft(slot, variant);
      variant += 1;
      attempts += 1;
      generated += 1;

      const hash = contentHash(
        draft.exam_type,
        draft.category,
        draft.topic,
        draft.content,
      );
      if (existing.has(hash)) {
        skipped += 1;
        continue;
      }
      existing.add(hash);
      toInsert.push(draft);
      added += 1;
    }

    if (added < need) {
      console.warn(
        `  ⚠ ${key}: tylko ${added}/${need} unikalnych (zwiększ warianty generatora)`,
      );
    }
  }

  return { toInsert, skipped, generated };
}

async function insertTaskBatches(
  supabase: SupabaseClient,
  drafts: TaskDraft[],
  dryRun: boolean,
): Promise<number> {
  let inserted = 0;

  for (let i = 0; i < drafts.length; i += BATCH_SIZE) {
    const chunk = drafts.slice(i, i + BATCH_SIZE);
    if (dryRun) {
      inserted += chunk.length;
      continue;
    }

    const { error } = await supabase.from("tasks").insert(
      chunk.map((d) => ({
        exam_type: d.exam_type,
        category: d.category,
        topic: d.topic,
        difficulty: d.difficulty,
        content: d.content,
        correct_answer: d.correct_answer,
        options: d.options,
        xp_reward: d.xp_reward,
      })),
    );

    if (error) {
      if (/row-level security/i.test(error.message)) {
        throw new Error(
          `${error.message}\n→ Uruchom w Supabase SQL: migrations/add_tasks_materials_insert.sql\n→ Lub ustaw SUPABASE_SERVICE_ROLE_KEY w .env.local`,
        );
      }
      throw new Error(
        `Insert tasks (${i}–${i + chunk.length}): ${error.message}`,
      );
    }

    inserted += chunk.length;
    console.log(
      `  ✓ zadania ${inserted}/${drafts.length} (${Math.round((inserted / drafts.length) * 100)}%)`,
    );
  }

  return inserted;
}

async function loadExistingMaterialKeys(
  supabase: SupabaseClient,
): Promise<Set<string>> {
  const keys = new Set<string>();
  const { data, error } = await supabase
    .from("materials")
    .select("exam_type, category, topic");

  if (error) throw new Error(error.message);
  for (const row of data ?? []) {
    keys.add(
      `${row.exam_type as string}:${row.category as string}:${row.topic as string}`,
    );
  }
  return keys;
}

async function seedMaterials(
  supabase: SupabaseClient,
  dryRun: boolean,
): Promise<{ inserted: number; skipped: number }> {
  const existing = await loadExistingMaterialKeys(supabase);
  const pending = SEED_MATERIALS.filter((m) => !existing.has(materialKey(m)));
  let inserted = 0;

  console.log(
    `\nMateriały: ${pending.length} nowych / ${SEED_MATERIALS.length} w szablonie (${existing.size} już w bazie)`,
  );

  for (const m of pending) {
    if (dryRun) {
      inserted += 1;
      continue;
    }
    const { error } = await supabase.from("materials").insert({
      exam_type: m.exam_type,
      category: m.category,
      topic: m.topic,
      title: m.title,
      content: m.content,
      video_url: m.video_url,
    });
    if (error) {
      if (/duplicate|unique/i.test(error.message)) {
        continue;
      }
      throw new Error(`Material ${materialKey(m)}: ${error.message}`);
    }
    inserted += 1;
  }

  return {
    inserted,
    skipped: SEED_MATERIALS.length - pending.length,
  };
}

async function tryGeminiEnrich(): Promise<void> {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) return;
  console.log(
    "ℹ GEMINI_API_KEY ustawiony — pomijam generowanie AI (szablony wystarczą; użyj seed:auto dla CKE).",
  );
}

async function main(): Promise<void> {
  const opts = parseArgs();
  const started = Date.now();

  console.log("=== Seed areny treningowej ===");
  console.log(`Cel zadań: ${opts.target} | dry-run: ${opts.dryRun}`);
  console.log(`Tematy w curriculum: ${SEED_TOPIC_SLOTS.length}`);

  const supabase = createSupabase();
  const counts = allocateCounts(SEED_TOPIC_SLOTS, opts.target);

  let tasksInserted = 0;
  let tasksSkipped = 0;
  let tasksGenerated = 0;

  if (!opts.materialsOnly) {
    const existing = await loadExistingHashes(supabase);
    const { toInsert, skipped, generated } = buildTaskBatch(
      SEED_TOPIC_SLOTS,
      counts,
      existing,
    );
    tasksSkipped = skipped;
    tasksGenerated = generated;

    console.log(
      `\nWygenerowano ${generated} wersji, ${skipped} duplikatów pominięto, do wstawienia: ${toInsert.length}`,
    );

    const byTopic = new Map<string, number>();
    for (const d of toInsert) {
      const k = slotKey(d);
      byTopic.set(k, (byTopic.get(k) ?? 0) + 1);
    }
    console.log("Rozkład (próbka — top 8 tematów):");
    [...byTopic.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .forEach(([k, n]) => console.log(`  ${k}: ${n}`));

    await tryGeminiEnrich();

    if (opts.dryRun) {
      tasksInserted = toInsert.length;
      console.log(`[dry-run] Pominę insert ${toInsert.length} zadań.`);
    } else {
      tasksInserted = await insertTaskBatches(supabase, toInsert, false);
    }
  }

  let materialsInserted = 0;
  if (!opts.tasksOnly && !opts.skipMaterials) {
    const mat = await seedMaterials(supabase, opts.dryRun);
    materialsInserted = mat.inserted;
  }

  const elapsed = ((Date.now() - started) / 1000).toFixed(1);
  const topicCount = new Set(
    SEED_TOPIC_SLOTS.map((s) => slotKey(s)),
  ).size;

  console.log("\n=== Podsumowanie ===");
  console.log(`Zadania wstawione: ${tasksInserted}`);
  console.log(`Wygenerowane / pominięte (dupl.): ${tasksGenerated} / ${tasksSkipped}`);
  console.log(`Tematy objęte seedem: ${topicCount}`);
  console.log(`Materiały wstawione: ${materialsInserted}`);
  console.log(`Czas: ${elapsed}s`);
  console.log("\nPonowne uruchomienie: npm run seed:trening-tasks");
  console.log(
    "Jeśli INSERT się nie powiedzie — uruchom add_tasks_materials_insert.sql w Supabase.",
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
