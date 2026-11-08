/**
 * Automatyczny import zadań z katalogu aplikacji → Supabase + rozwiązania Gemini.
 *
 * Uruchom (po migracji SQL i .env.local):
 *   npm run seed:auto
 *   npm run seed:auto -- --limit 10
 *   npm run seed:auto -- --mode sheets
 *   npm run seed:auto -- --delay 3000
 */

import path from "path";
import dotenv from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getAllTasks, getTaskById } from "../lib/baza-zadan/catalog";
import { EXAM_SHEETS } from "../lib/baza-zadan/exam-sheets";
import { CATEGORY_LABELS } from "../lib/baza-zadan/labels";
import type { TypEgzaminu } from "../lib/baza-zadan/dzialy";
import {
  buildRozwiazanieFromCatalog,
  formatTaskTrescForDb,
  getCorrectAnswerMeta,
} from "../lib/baza-zadan/task-cms-format";
import type { Task } from "../lib/baza-zadan/types";
import {
  generateMathSolutionWithRetry,
  sleep,
} from "../lib/gemini/generate-solution";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

type Mode = "catalog" | "sheets" | "all";

type CliOptions = {
  limit: number;
  delayMs: number;
  mode: Mode;
  dryRun: boolean;
  /** Zawsze Gemini (ignoruj gotowe explanation z katalogu). */
  forceGemini: boolean;
  /** Usuń wcześniej zaimportowane zadania (source_id) i wgraj od nowa. */
  replace: boolean;
};

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  let limit = Infinity;
  let delayMs = 2500;
  let mode: Mode = "all";
  let dryRun = false;
  let forceGemini = false;
  let replace = false;

  for (const arg of args) {
    if (arg === "--dry-run") dryRun = true;
    else if (arg === "--force-gemini") forceGemini = true;
    else if (arg === "--replace") replace = true;
    else if (arg.startsWith("--limit=")) {
      limit = Number(arg.split("=")[1]);
    } else if (arg.startsWith("--delay=")) {
      delayMs = Number(arg.split("=")[1]);
    } else if (arg.startsWith("--mode=")) {
      const m = arg.split("=")[1] as Mode;
      if (m === "catalog" || m === "sheets" || m === "all") mode = m;
    }
  }

  return { limit, delayMs, mode, dryRun, forceGemini, replace };
}

function createSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) {
    throw new Error("Brakuje NEXT_PUBLIC_SUPABASE_URL lub ANON_KEY w .env.local");
  }
  if (!process.env.GEMINI_API_KEY?.trim()) {
    throw new Error("Brakuje GEMINI_API_KEY w .env.local");
  }
  return createClient(url, key);
}

function inferTyp(task: Task): TypEgzaminu {
  if (
    task.category === "egzamin-8" ||
    task.examSource?.kind === "egzamin-8" ||
    task.forPaths.some((p) => p === "egzamin-8" || p === "klasa-8")
  ) {
    return "egzamin-8";
  }
  return "matura";
}

function examLabel(typ: TypEgzaminu): string {
  return typ === "egzamin-8" ? "Egzamin 8-klasisty" : "Matura";
}

function sheetKindToTyp(kind: string): TypEgzaminu {
  return kind === "egzamin-8" ? "egzamin-8" : "matura";
}

async function deleteImportedBySourceId(
  supabase: SupabaseClient,
  sourceId: string,
): Promise<void> {
  const { error } = await supabase
    .from("zadania")
    .delete()
    .eq("source_id", sourceId);
  if (error && !/source_id/i.test(error.message)) {
    throw new Error(error.message);
  }
}

async function findBySourceId(
  supabase: SupabaseClient,
  sourceId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("zadania")
    .select("id")
    .eq("source_id", sourceId)
    .maybeSingle();

  if (error) {
    if (/source_id|column/i.test(error.message)) return false;
    throw new Error(error.message);
  }
  return Boolean(data?.id);
}

async function getOrCreateArkusz(
  supabase: SupabaseClient,
  cache: Map<string, string>,
  key: string,
  nazwa: string,
  typ: TypEgzaminu,
  rok: number,
  miesiac: number,
  dryRun: boolean,
): Promise<string> {
  const cached = cache.get(key);
  if (cached) return cached;

  if (dryRun) {
    const fakeId = `dry-run-${key}`;
    cache.set(key, fakeId);
    return fakeId;
  }

  const { data: existing } = await supabase
    .from("arkusze")
    .select("id")
    .eq("nazwa", nazwa)
    .eq("typ", typ)
    .eq("rok", rok)
    .maybeSingle();

  if (existing?.id) {
    cache.set(key, existing.id);
    return existing.id;
  }

  const { data: created, error } = await supabase
    .from("arkusze")
    .insert({ nazwa, typ, rok, miesiac })
    .select("id")
    .single();

  if (error) throw new Error(`Arkusz „${nazwa}”: ${error.message}`);
  cache.set(key, created.id);
  console.log(`📁 Utworzono arkusz: ${nazwa} (${typ}, ${rok})`);
  return created.id;
}

async function nextNumerZadania(
  supabase: SupabaseClient,
  arkuszId: string,
): Promise<number> {
  const { data } = await supabase
    .from("zadania")
    .select("numer_zadania")
    .eq("arkusz_id", arkuszId)
    .order("numer_zadania", { ascending: false })
    .limit(1);

  const max = data?.[0]?.numer_zadania ?? 0;
  return max + 1;
}

async function importTask(
  supabase: SupabaseClient,
  opts: CliOptions,
  stats: { ok: number; skip: number; err: number },
  task: Task,
  arkuszId: string,
  dzial: string,
  kontekst: string,
): Promise<void> {
  if (stats.ok + stats.skip + stats.err >= opts.limit) return;

  const sourceId = task.id;

  try {
    if (!opts.dryRun) {
      const exists = await findBySourceId(supabase, sourceId);
      if (exists) {
        if (opts.replace) {
          await deleteImportedBySourceId(supabase, sourceId);
          console.log(`  ↻ ${sourceId} - podmieniam`);
        } else {
          console.log(`  ⊘ ${sourceId} - już w bazie (użyj --replace)`);
          stats.skip += 1;
          return;
        }
      }
    }

    const trescDb = formatTaskTrescForDb(task);
    const answerMeta = getCorrectAnswerMeta(task);

    let rozwiazanie: string;
    const fromCatalog =
      !opts.forceGemini && buildRozwiazanieFromCatalog(task);

    if (opts.dryRun) {
      rozwiazanie = "[dry-run]";
    } else if (fromCatalog) {
      console.log(`  📘 ${sourceId} - rozwiązanie z katalogu`);
      rozwiazanie = fromCatalog;
    } else {
      console.log(`  🧠 ${sourceId} - generuję rozwiązanie (Gemini)…`);
      rozwiazanie = await generateMathSolutionWithRetry({
        trescZadania: trescDb,
        kontekstEgzaminu: kontekst,
        tytul: task.title,
        poprawnaOdpowiedz: answerMeta.poprawnaOdpowiedz,
        literaOpcji: answerMeta.literaOpcji,
      });
    }

    const numer = opts.dryRun
      ? stats.ok + stats.skip + 1
      : await nextNumerZadania(supabase, arkuszId);

    if (!opts.dryRun) {
      const row: Record<string, unknown> = {
        arkusz_id: arkuszId,
        numer_zadania: numer,
        dzial,
        tresc: trescDb,
        rozwiazanie,
        source_id: sourceId,
      };

      const { error } = await supabase.from("zadania").insert(row);
      if (error) throw new Error(error.message);
    }

    console.log(`  ✓ ${sourceId} → zadanie nr ${numer}`);
    stats.ok += 1;

    if (opts.delayMs > 0 && !opts.dryRun) {
      await sleep(opts.delayMs);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`  ✗ ${sourceId}: ${msg}`);
    stats.err += 1;
  }
}

async function importSheets(
  supabase: SupabaseClient,
  opts: CliOptions,
  arkuszCache: Map<string, string>,
  stats: { ok: number; skip: number; err: number },
): Promise<void> {
  const rok = new Date().getFullYear();
  const miesiac = new Date().getMonth() + 1;

  console.log(`\n══ Arkusze treningowe (${EXAM_SHEETS.length}) ══`);

  for (const sheet of EXAM_SHEETS) {
    if (stats.ok + stats.skip + stats.err >= opts.limit) break;

    const typ = sheetKindToTyp(sheet.kind);
    const cacheKey = `sheet:${sheet.id}`;
    const arkuszId = await getOrCreateArkusz(
      supabase,
      arkuszCache,
      cacheKey,
      sheet.title,
      typ,
      rok,
      miesiac,
      opts.dryRun,
    );

    console.log(`\n📋 ${sheet.title} (${sheet.taskIds.length} zadań)`);

    for (const taskId of sheet.taskIds) {
      if (stats.ok + stats.skip + stats.err >= opts.limit) break;
      const t = getTaskById(taskId);
      if (!t) {
        console.warn(`  ⚠ Brak zadania ${taskId} w katalogu`);
        continue;
      }
      await importTask(
        supabase,
        opts,
        stats,
        t,
        arkuszId,
        CATEGORY_LABELS[t.category],
        examLabel(typ),
      );
    }
  }
}

async function importCatalogByCategory(
  supabase: SupabaseClient,
  opts: CliOptions,
  arkuszCache: Map<string, string>,
  stats: { ok: number; skip: number; err: number },
  skipIds: Set<string>,
): Promise<void> {
  const rok = new Date().getFullYear();
  const miesiac = new Date().getMonth() + 1;
  const tasks = getAllTasks().filter((t) => !skipIds.has(t.id));

  console.log(`\n══ Katalog po działach (${tasks.length} zadań) ══`);

  const byCategory = new Map<string, Task[]>();
  for (const task of tasks) {
    const list = byCategory.get(task.category) ?? [];
    list.push(task);
    byCategory.set(task.category, list);
  }

  for (const [category, categoryTasks] of byCategory) {
    if (stats.ok + stats.skip + stats.err >= opts.limit) break;

    const typ = categoryTasks.some((t) => inferTyp(t) === "egzamin-8")
      ? "egzamin-8"
      : "matura";
    const dzial = CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] ?? category;
    const nazwa = `Auto - ${dzial}`;
    const cacheKey = `cat:${category}`;
    const arkuszId = await getOrCreateArkusz(
      supabase,
      arkuszCache,
      cacheKey,
      nazwa,
      typ,
      rok,
      miesiac,
      opts.dryRun,
    );

    console.log(`\n📂 ${dzial} (${categoryTasks.length} zadań)`);

    for (const task of categoryTasks) {
      if (stats.ok + stats.skip + stats.err >= opts.limit) break;
      await importTask(
        supabase,
        opts,
        stats,
        task,
        arkuszId,
        dzial,
        examLabel(typ),
      );
    }
  }
}

async function main() {
  const opts = parseArgs();
  const supabase = createSupabase();
  const arkuszCache = new Map<string, string>();
  const stats = { ok: 0, skip: 0, err: 0 };

  const totalTasks = getAllTasks().length;
  console.log("🚀 Auto-import: katalog treningowy → Supabase");
  console.log(`   Zadań w katalogu: ${totalTasks}`);
  console.log(
    "   UWAGA: To NIE są skany oryginalnych arkuszy CKE - zadania treningowe z aplikacji.",
  );
  console.log(
    `   Tryb: ${opts.mode} | limit: ${Number.isFinite(opts.limit) ? opts.limit : "∞"} | opóźnienie: ${opts.delayMs}ms`,
  );
  if (!opts.forceGemini) {
    console.log("   Rozwiązania: najpierw z katalogu, Gemini tylko gdy brak.");
  }
  if (opts.dryRun) console.log("   (dry-run - bez zapisu)");

  const sheetTaskIds = new Set<string>();
  if (opts.mode === "sheets" || opts.mode === "all") {
    for (const s of EXAM_SHEETS) {
      for (const id of s.taskIds) sheetTaskIds.add(id);
    }
    await importSheets(supabase, opts, arkuszCache, stats);
  }

  if (opts.mode === "catalog" || opts.mode === "all") {
    await importCatalogByCategory(
      supabase,
      opts,
      arkuszCache,
      stats,
      opts.mode === "all" ? sheetTaskIds : new Set(),
    );
  }

  console.log("\n══════════════════════════════════");
  console.log(`✓ Zaimportowano: ${stats.ok}`);
  console.log(`⊘ Pominięto:     ${stats.skip}`);
  console.log(`✗ Błędy:         ${stats.err}`);
  console.log("══════════════════════════════════\n");

  if (stats.err > 0) process.exit(1);
}

main().catch((err) => {
  console.error("\n✗ Import przerwany:");
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
