/**
 * Generowanie lekcji teoretycznych przez Gemini → cache + Supabase.
 *
 *   npm run seed:theory-gemini
 *   npm run seed:theory-gemini -- --limit=5
 *   npm run seed:theory-gemini -- --delay=4000
 *   npm run seed:theory-gemini -- --cache-only
 *   npm run seed:theory-gemini -- --regenerate
 *   npm run seed:theory-gemini -- --only=matura_podstawowa:algebra:rownania_liniowe
 *   npm run seed:theory-gemini -- --exam=8_klasa
 *
 * Wymaga: GEMINI_API_KEY, Supabase w .env.local
 * Zapis do DB na produkcji: SUPABASE_SERVICE_ROLE_KEY (RLS admin-only)
 */

import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { sleep } from "../lib/gemini/generate-solution";
import { generateTheoryLessonWithRetry } from "../lib/gemini/generate-theory";
import { listCkeTopicsForExam } from "../lib/trening/cke-curriculum";
import { CKE_EGZAMIN_8 } from "../lib/trening/cke-egzamin-8";
import { CKE_MATURA_PODSTAWOWA } from "../lib/trening/cke-matura-podstawowa";
import {
  countTheoryCacheProgressByExam,
  isCompleteTheoryCache,
  isExamTheoryComplete,
  listTheorySlotsForExam,
  readTheoryCache,
  theoryCachePath,
} from "../lib/trening/seed/theory-cache-utils";
import type { ExamType } from "../types/database";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const CACHE_DIR = path.resolve(process.cwd(), "data/theory-cache");
const EXAMS: ExamType[] = ["matura_podstawowa", "8_klasa"];

const EXAM_LABEL: Record<ExamType, string> = {
  matura_podstawowa: CKE_MATURA_PODSTAWOWA.label,
  matura_rozszerzona: "Matura rozszerzona",
  "8_klasa": CKE_EGZAMIN_8.label,
};

type CachedTheory = {
  exam_type: ExamType;
  category: string;
  topic: string;
  title: string;
  content: string;
  generatedAt: string;
  model: string;
  source: "gemini";
};

type TheorySlot = {
  exam_type: ExamType;
  category: string;
  topic: string;
  categoryName: string;
  topicName: string;
};

function slotKey(slot: TheorySlot): string {
  return `${slot.exam_type}:${slot.category}:${slot.topic}`;
}

type CliOptions = {
  limit: number;
  delayMs: number;
  dryRun: boolean;
  cacheOnly: boolean;
  regenerate: boolean;
  pushDb: boolean;
  exam: ExamType | null;
  only: TheorySlot | null;
};

function parseArgs(): CliOptions {
  let limit = Infinity;
  let delayMs = 4500;
  let dryRun = false;
  let cacheOnly = false;
  let regenerate = false;
  let pushDb = true;
  let exam: ExamType | null = null;
  let only: TheorySlot | null = null;

  for (const arg of process.argv.slice(2)) {
    if (arg === "--dry-run") dryRun = true;
    else if (arg === "--cache-only") {
      cacheOnly = true;
      pushDb = false;
    } else if (arg === "--no-db") pushDb = false;
    else if (arg === "--regenerate") regenerate = true;
    else if (arg.startsWith("--limit=")) limit = Math.max(1, Number(arg.split("=")[1]));
    else if (arg.startsWith("--delay=")) delayMs = Number(arg.split("=")[1]);
    else if (arg.startsWith("--exam=")) {
      const value = arg.split("=")[1] as ExamType;
      if (EXAMS.includes(value)) exam = value;
    } else if (arg.startsWith("--only=")) {
      const parts = arg.split("=")[1].split(":");
      if (parts.length === 3) {
        const [examType, category, topic] = parts as [ExamType, string, string];
        const label = listCkeTopicsForExam(examType).find(
          (t) => t.category === category && t.topic === topic,
        );
        if (label) {
          only = {
            exam_type: examType,
            category,
            topic,
            categoryName: label.categoryName,
            topicName: label.topicName,
          };
        }
      }
    }
  }

  return { limit, delayMs, dryRun, cacheOnly, regenerate, pushDb, exam, only };
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
  if (!process.env.GEMINI_API_KEY?.trim()) {
    throw new Error("Brakuje GEMINI_API_KEY w .env.local");
  }
  if (pushDbNeedsWarning(serviceKey)) {
    console.warn(
      "⚠ Brak SUPABASE_SERVICE_ROLE_KEY — zapis do DB może być zablokowany przez RLS.",
    );
  }
  return createClient(url, key);
}

function pushDbNeedsWarning(serviceKey: string | undefined): boolean {
  return !serviceKey;
}

function cachePath(slot: TheorySlot): string {
  return theoryCachePath(slot);
}

function readCache(slot: TheorySlot): CachedTheory | null {
  return readTheoryCache(slot) as CachedTheory | null;
}

function writeCache(entry: CachedTheory, slot: TheorySlot): void {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(cachePath(slot), JSON.stringify(entry, null, 2), "utf8");
}

function listSlots(opts: CliOptions): TheorySlot[] {
  if (opts.only) return [opts.only];

  if (opts.exam) {
    return listTheorySlotsForExam(opts.exam).map((t) => ({
      exam_type: t.exam_type,
      category: t.category,
      topic: t.topic,
      categoryName: t.categoryName,
      topicName: t.topicName,
    }));
  }

  // Faza 1: pełna matura (28/28), dopiero potem egzamin 8-klasisty
  if (!isExamTheoryComplete("matura_podstawowa")) {
    return listTheorySlotsForExam("matura_podstawowa");
  }

  return [
    ...listTheorySlotsForExam("matura_podstawowa"),
    ...listTheorySlotsForExam("8_klasa"),
  ];
}

function examOrder(slot: TheorySlot): number {
  return EXAMS.indexOf(slot.exam_type);
}

async function pushToDb(
  supabase: SupabaseClient,
  slot: TheorySlot,
  title: string,
  content: string,
  dryRun: boolean,
): Promise<boolean> {
  if (dryRun) return true;

  const { data, error } = await supabase
    .from("materials")
    .update({ title, content, video_url: null })
    .eq("exam_type", slot.exam_type)
    .eq("category", slot.category)
    .eq("topic", slot.topic)
    .select("id");

  if (error) {
    console.warn(`    ⚠ DB update: ${error.message}`);
    return false;
  }

  if (data?.length) return true;

  const { data: inserted, error: insertError } = await supabase
    .from("materials")
    .insert({
      exam_type: slot.exam_type,
      category: slot.category,
      topic: slot.topic,
      title,
      content,
      video_url: null,
    })
    .select("id");

  if (insertError) {
    console.warn(`    ⚠ DB insert: ${insertError.message}`);
    return false;
  }
  return (inserted?.length ?? 0) > 0;
}

async function main() {
  const opts = parseArgs();
  const slots = listSlots(opts).sort((a, b) => {
    const aDone = isCompleteTheoryCache(readCache(a)) ? 1 : 0;
    const bDone = isCompleteTheoryCache(readCache(b)) ? 1 : 0;
    if (aDone !== bDone) return aDone - bDone;
    return examOrder(a) - examOrder(b);
  });

  if (slots.length === 0) {
    throw new Error("Brak tematów do przetworzenia (sprawdź --exam / --only).");
  }

  const maturaProgress = countTheoryCacheProgressByExam("matura_podstawowa");
  const eightProgress = countTheoryCacheProgressByExam("8_klasa");

  console.log("\n=== Gemini: lekcje teoretyczne ===\n");
  console.log(`Matura: ${maturaProgress.complete}/${maturaProgress.total}`);
  console.log(`8 klasa: ${eightProgress.complete}/${eightProgress.total}`);
  if (!opts.exam && !isExamTheoryComplete("matura_podstawowa")) {
    console.log("Faza: matura (8-klasa po 28/28)\n");
  } else if (!opts.exam && isExamTheoryComplete("matura_podstawowa")) {
    console.log("Faza: 8-klasa (matura kompletna ✓)\n");
  } else {
    console.log("");
  }
  console.log(`Tematy w kolejce: ${slots.length}`);
  console.log(`Limit: ${Number.isFinite(opts.limit) ? opts.limit : "brak"}`);
  console.log(`Opóźnienie: ${opts.delayMs} ms`);
  console.log(`Cache: ${CACHE_DIR}`);
  console.log(`Push DB: ${opts.pushDb && !opts.dryRun ? "tak" : "nie"}`);
  console.log(`Regenerate: ${opts.regenerate ? "tak" : "nie"}\n`);

  const supabase = opts.pushDb && !opts.dryRun ? createSupabase() : null;

  let generated = 0;
  let skipped = 0;
  let dbUpdated = 0;
  let errors = 0;

  for (const slot of slots) {
    if (generated >= opts.limit) break;

    const key = slotKey(slot);
    const cached = readCache(slot);

    if (cached && !opts.regenerate && isCompleteTheoryCache(cached)) {
      console.log(`  ○ pominięto (cache OK): ${key}`);
      skipped += 1;
      if (opts.pushDb && supabase && !opts.dryRun) {
        const ok = await pushToDb(
          supabase,
          slot,
          cached.title,
          cached.content,
          false,
        );
        if (ok) dbUpdated += 1;
      }
      continue;
    }

    console.log(`  → generuję: ${key} (${slot.topicName})`);

    try {
      const lesson = await generateTheoryLessonWithRetry({
        examLabel: EXAM_LABEL[slot.exam_type],
        categoryName: slot.categoryName,
        topicName: slot.topicName,
        categorySlug: slot.category,
        topicSlug: slot.topic,
      });

      const entry: CachedTheory = {
        exam_type: slot.exam_type,
        category: slot.category,
        topic: slot.topic,
        title: lesson.title,
        content: lesson.content,
        generatedAt: new Date().toISOString(),
        model: lesson.model,
        source: "gemini",
      };

      if (!opts.dryRun) {
        writeCache(entry, slot);
      }

      console.log(`    ✓ ${lesson.title} (${lesson.content.length} znaków)`);

      if (opts.pushDb && supabase) {
        const ok = await pushToDb(
          supabase,
          slot,
          lesson.title,
          lesson.content,
          opts.dryRun,
        );
        if (ok) {
          dbUpdated += 1;
          console.log("    ✓ zapisano w Supabase");
        } else {
          console.warn(
            "    ⚠ cache OK, DB pominięty (RLS — dodaj SUPABASE_SERVICE_ROLE_KEY)",
          );
        }
      }

      generated += 1;

      if (generated < opts.limit && opts.delayMs > 0) {
        await sleep(opts.delayMs);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`    ✗ ${message}`);
      errors += 1;
    }
  }

  console.log("\n=== Podsumowanie ===");
  console.log(`Wygenerowano: ${generated}`);
  console.log(`Pominięto (cache): ${skipped}`);
  console.log(`Zapis DB: ${dbUpdated}`);
  console.log(`Błędy: ${errors}`);
  console.log(
    "\nWznów: npm run seed:theory-gemini -- --limit=10 (pomija gotowy cache)",
  );
  console.log("Od nowa: npm run seed:theory-gemini -- --regenerate\n");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
