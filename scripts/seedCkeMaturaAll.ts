/**
 * Import wszystkich arkuszy maturalnych CKE (poziom podstawowy) do Supabase.
 *
 *   npm run seed:cke-matura              # wszystkie sesje (z cache)
 *   npm run seed:cke-matura -- --only=m23-maj,m25-maj
 *   npm run seed:cke-matura -- --replace
 *   npm run seed:cke-matura -- --no-gemini   # tylko treść, rozwiązanie placeholder
 *   npm run seed:cke-matura -- --fill-solutions --cache-only  # Gemini → cache (bez DB)
 *   npm run seed:cke-matura -- --fill-solutions --regenerate-solutions  # nadpisz wszystkie
 *   npm run seed:cke-matura -- --refresh-cache
 */

import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  CKE_MATURA_2024_MAJ_ZADANIA,
} from "../lib/baza-zadan/cke/matura-2024-maj-podstawowa";
import {
  CKE_MATURA_CKE_URL,
  CKE_MATURA_IMPORTABLE_SESSIONS,
  type CkeMaturaSession,
} from "../lib/baza-zadan/cke/matura-podstawowa-sessions";
import { localizeMaturaImagesInTresc } from "../lib/baza-zadan/cke/matura-images";
import {
  cleanMaturaTaskText,
  inferDzialMatura,
  parseMaturaTasksFromHtml,
} from "../lib/baza-zadan/cke/parse-matura-page";
import { taskContentHasImages } from "../lib/baza-zadan/cke/matura-task-content";
import {
  generateMathSolutionWithRetry,
  isDailyQuotaError,
  sleep,
} from "../lib/gemini/generate-solution";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const CACHE_DIR = path.resolve(process.cwd(), "data/cke-matura-cache");

type CachedTask = {
  numer: number;
  dzial: string;
  tresc: string;
  rozwiazanie: string;
};

type CachedSheet = {
  sessionId: string;
  nazwa: string;
  rok: number;
  miesiac: number;
  tasks: CachedTask[];
  fetchedAt: string;
};

const PLACEHOLDER_MARK = "Rozwiązanie zostanie uzupełnione";

/** Kończy import bez exit 1 — wyczerpany dzienny limit free tier. */
class DailyQuotaReached extends Error {
  constructor() {
    super("daily_quota");
    this.name = "DailyQuotaReached";
  }
}

type CliOptions = {
  replace: boolean;
  noGemini: boolean;
  /** Tylko uzupełnij rozwiązania Gemini tam, gdzie w cache jest placeholder. */
  fillSolutions: boolean;
  /** Odśwież treść + rysunki w cache (bez Gemini, jeśli nie podano inaczej). */
  fixImages: boolean;
  refreshCache: boolean;
  /** Tylko cache lokalny — bez zapisu do Supabase (gdy DB niedostępna). */
  cacheOnly: boolean;
  /** Nadpisz istniejące rozwiązania (np. nowy, zwięzły prompt). */
  regenerateSolutions: boolean;
  delayMs: number;
  only: Set<string> | null;
  fromYear: number | null;
};

function parseArgs(): CliOptions {
  let replace = false;
  let noGemini = false;
  let fillSolutions = false;
  let fixImages = false;
  let refreshCache = false;
  let cacheOnly = false;
  let regenerateSolutions = false;
  let delayMs = 4500;
  let only: Set<string> | null = null;
  let fromYear: number | null = null;

  for (const arg of process.argv.slice(2)) {
    if (arg === "--replace") replace = true;
    else if (arg === "--no-gemini") noGemini = true;
    else if (arg === "--fill-solutions") fillSolutions = true;
    else if (arg === "--fix-images") fixImages = true;
    else if (arg === "--refresh-cache") refreshCache = true;
    else if (arg === "--cache-only") cacheOnly = true;
    else if (arg === "--regenerate-solutions") regenerateSolutions = true;
    else if (arg.startsWith("--delay=")) delayMs = Number(arg.split("=")[1]);
    else if (arg.startsWith("--only=")) {
      only = new Set(
        arg
          .split("=")[1]
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      );
    } else if (arg.startsWith("--from-year=")) {
      fromYear = Number(arg.split("=")[1]);
    }
  }

  if (fillSolutions) {
    replace = true;
  }

  if (regenerateSolutions) {
    fillSolutions = true;
    replace = true;
  }

  if (fixImages) {
    refreshCache = true;
    // Nie nadpisuj rozwiązań placeholderami — tylko treść/rysunki.
    // noGemini zostaje false, żeby buildSheetCache nie wstawiał PLACEHOLDER.
    replace = true;
  }

  return {
    replace,
    noGemini,
    fillSolutions,
    fixImages,
    refreshCache,
    cacheOnly,
    regenerateSolutions,
    delayMs,
    only,
    fromYear,
  };
}

function needsGeminiSolution(rozwiazanie: string, regenerate: boolean): boolean {
  if (regenerate) return true;
  return (
    !rozwiazanie.trim() ||
    rozwiazanie.includes(PLACEHOLDER_MARK) ||
    rozwiazanie.includes("samodzielnie według treści")
  );
}

function createSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) {
    throw new Error("Brakuje NEXT_PUBLIC_SUPABASE_URL lub ANON_KEY w .env.local");
  }
  return createClient(url, key);
}

function cachePath(sessionId: string): string {
  return path.join(CACHE_DIR, `${sessionId}.json`);
}

function readCache(sessionId: string): CachedSheet | null {
  const p = cachePath(sessionId);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8")) as CachedSheet;
  } catch {
    return null;
  }
}

function writeCache(sheet: CachedSheet): void {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(cachePath(sheet.sessionId), JSON.stringify(sheet, null, 2), "utf8");
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "SzybkaMatematyka-CKE-Import/1.0 (edukacja; kontakt: admin)",
      Accept: "text/html",
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} dla ${url}`);
  }
  return res.text();
}

function bundledSheet(session: CkeMaturaSession): CachedSheet {
  return {
    sessionId: session.id,
    nazwa: session.nazwa,
    rok: session.rok,
    miesiac: session.miesiac,
    fetchedAt: new Date().toISOString(),
    tasks: CKE_MATURA_2024_MAJ_ZADANIA.map((z) => ({
      numer: z.numer,
      dzial: z.dzial,
      tresc: z.tresc,
      rozwiazanie: z.rozwiazanie,
    })),
  };
}

async function enrichSheetWithFigures(
  session: CkeMaturaSession,
  sheet: CachedSheet,
): Promise<CachedSheet> {
  console.log(`  ↓ Pobieram rysunki do arkusza…`);
  const html = await fetchHtml(session.importUrl);
  const parsed = parseMaturaTasksFromHtml(html);
  let withImages = 0;

  const tasks = await Promise.all(
    sheet.tasks.map(async (t) => {
      const fromWeb = parsed.find((p) => p.numer === t.numer);
      let tresc = fromWeb?.tresc ?? t.tresc;
      if (taskContentHasImages(tresc)) withImages += 1;
      tresc = await localizeMaturaImagesInTresc(tresc, session.id, t.numer);
      return { ...t, tresc: cleanMaturaTaskText(tresc) };
    }),
  );

  console.log(`  ✓ Rysunki w ${withImages} zadaniach`);
  return { ...sheet, tasks, fetchedAt: new Date().toISOString() };
}

async function finalizeTresc(
  session: CkeMaturaSession,
  numer: number,
  tresc: string,
): Promise<string> {
  let text = cleanMaturaTaskText(tresc);
  text = await localizeMaturaImagesInTresc(text, session.id, numer);
  return text;
}

async function buildSheetCache(
  supabase: SupabaseClient,
  session: CkeMaturaSession,
  opts: CliOptions,
): Promise<CachedSheet> {
  const existing = readCache(session.id);

  if (session.bundled) {
    let sheet = bundledSheet(session);
    if (opts.refreshCache || !taskContentHasImages(sheet.tasks.map((t) => t.tresc).join("\n"))) {
      sheet = await enrichSheetWithFigures(session, sheet);
    }
    writeCache(sheet);
    return sheet;
  }

  if (opts.fillSolutions && existing && existing.tasks.length > 0) {
    return fillGeminiSolutions(supabase, session, existing, opts);
  }

  // Odśwież rysunki/treść, ale zachowaj istniejące rozwiązania z cache
  if (opts.fixImages && existing && existing.tasks.length > 0) {
    console.log(`  ↓ Odświeżam treść+rysunki (zachowuję rozwiązania): ${session.nazwa}`);
    const html = await fetchHtml(session.importUrl);
    const parsed = parseMaturaTasksFromHtml(html);
    if (parsed.length < 5) {
      throw new Error(
        `Za mało zadań (${parsed.length}) — zmieniony format strony lub błąd parsowania.`,
      );
    }
    const byNumer = new Map(existing.tasks.map((t) => [t.numer, t]));
    const tasks: CachedTask[] = [];
    for (const p of parsed) {
      const prev = byNumer.get(p.numer);
      const tresc = await finalizeTresc(session, p.numer, p.tresc);
      const rozwiazanie =
        prev && !needsGeminiSolution(prev.rozwiazanie, false)
          ? prev.rozwiazanie
          : prev?.rozwiazanie?.trim()
            ? prev.rozwiazanie
            : `${PLACEHOLDER_MARK} wkrótce. Tymczasowo rozwiąż zadanie samodzielnie według treści z arkusza CKE.`;
      tasks.push({
        numer: p.numer,
        dzial: inferDzialMatura(p.tresc, p.numer),
        tresc,
        rozwiazanie,
      });
    }
    const sheet: CachedSheet = {
      sessionId: session.id,
      nazwa: session.nazwa,
      rok: session.rok,
      miesiac: session.miesiac,
      tasks,
      fetchedAt: new Date().toISOString(),
    };
    writeCache(sheet);
    return sheet;
  }

  if (!opts.refreshCache && !opts.fixImages && existing && existing.tasks.length > 0) {
    if (!existing.tasks.some((t) => taskContentHasImages(t.tresc))) {
      const enriched = await enrichSheetWithFigures(session, existing);
      writeCache(enriched);
      return enriched;
    }
    return existing;
  }

  console.log(`  ↓ Pobieram treść: ${session.nazwa}`);
  const html = await fetchHtml(session.importUrl);
  const parsed = parseMaturaTasksFromHtml(html);

  if (parsed.length < 5) {
    throw new Error(
      `Za mało zadań (${parsed.length}) — zmieniony format strony lub błąd parsowania.`,
    );
  }

  console.log(`  ✓ Sparsowano ${parsed.length} zadań`);

  const tasks: CachedTask[] = [];

  for (const p of parsed) {
    const dzial = inferDzialMatura(p.tresc, p.numer);
    let rozwiazanie = "";

    if (opts.noGemini) {
      rozwiazanie = `${PLACEHOLDER_MARK} wkrótce. Tymczasowo rozwiąż zadanie samodzielnie według treści z arkusza CKE.`;
    } else {
      if (!process.env.GEMINI_API_KEY?.trim()) {
        throw new Error("Brakuje GEMINI_API_KEY — użyj --no-gemini lub uzupełnij .env.local");
      }
      process.stdout.write(`    Gemini zad. ${p.numer}… `);
      rozwiazanie = await generateMathSolutionWithRetry({
        trescZadania: p.tresc,
        kontekstEgzaminu: "Matura — poziom podstawowy (CKE)",
        tytul: `${session.nazwa}, zadanie ${p.numer}`,
      });
      console.log("ok");
      await sleep(opts.delayMs);
    }

    const tresc = await finalizeTresc(session, p.numer, p.tresc);

    tasks.push({
      numer: p.numer,
      dzial,
      tresc,
      rozwiazanie,
    });
  }

  const sheet: CachedSheet = {
    sessionId: session.id,
    nazwa: session.nazwa,
    rok: session.rok,
    miesiac: session.miesiac,
    tasks,
    fetchedAt: new Date().toISOString(),
  };
  writeCache(sheet);
  return sheet;
}

async function syncSheetToSupabase(
  supabase: SupabaseClient,
  session: CkeMaturaSession,
  sheet: CachedSheet,
  replace: boolean,
  cacheOnly: boolean,
): Promise<{ inserted: number; skipped: number } | null> {
  if (cacheOnly) return null;
  try {
    return await importSheetToSupabase(supabase, session, sheet, replace);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`  ⚠ Supabase pominięte: ${msg}`);
    return null;
  }
}

async function fillGeminiSolutions(
  supabase: SupabaseClient,
  session: CkeMaturaSession,
  sheet: CachedSheet,
  opts: CliOptions,
): Promise<CachedSheet> {
  if (!process.env.GEMINI_API_KEY?.trim()) {
    throw new Error("Brakuje GEMINI_API_KEY w .env.local");
  }

  let filled = 0;
  for (const z of sheet.tasks) {
    if (!needsGeminiSolution(z.rozwiazanie, opts.regenerateSolutions)) continue;
    process.stdout.write(`    Gemini zad. ${z.numer}… `);
    try {
      z.rozwiazanie = await generateMathSolutionWithRetry({
        trescZadania: z.tresc,
        kontekstEgzaminu: "Matura — poziom podstawowy (CKE)",
        tytul: `${session.nazwa}, zadanie ${z.numer}`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log("FAIL");
      writeCache(sheet);
      if (filled > 0) {
        await syncSheetToSupabase(supabase, session, sheet, true, opts.cacheOnly);
      }
      if (isDailyQuotaError(msg)) {
        throw new DailyQuotaReached();
      }
      console.warn(`  ⚠ Pominięto zad. ${z.numer} (${msg.slice(0, 100)})`);
      continue;
    }
    console.log("ok");
    filled += 1;
    writeCache(sheet);
    await sleep(opts.delayMs);

    if (filled > 0 && filled % 5 === 0) {
      const synced = await syncSheetToSupabase(
        supabase,
        session,
        sheet,
        true,
        opts.cacheOnly,
      );
      if (synced) {
        console.log(`  → zapisano postęp do Supabase (${filled} zadań)`);
      }
    }
  }

  if (filled > 0) {
    await syncSheetToSupabase(supabase, session, sheet, true, opts.cacheOnly);
  }

  console.log(
    `  ✓ Uzupełniono ${filled} rozwiązań (cache${opts.cacheOnly ? "" : " + Supabase"})`,
  );
  return sheet;
}

function sourceId(sessionId: string, numer: number): string {
  /** Zgodność z pierwszym importem m24 (seed:cke-matura-one). */
  const slug = sessionId === "m24-maj" ? "m24-maj-p" : sessionId;
  return `cke-${slug}-z${String(numer).padStart(2, "0")}`;
}

async function getOrCreateArkusz(
  supabase: SupabaseClient,
  session: CkeMaturaSession,
): Promise<string> {
  // 1) Dokładna nazwa (preferowana)
  const { data: byName, error } = await supabase
    .from("arkusze")
    .select("id")
    .eq("nazwa", session.nazwa)
    .eq("typ", "matura")
    .eq("rok", session.rok)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (byName?.id) return byName.id;

  // 2) Ten sam rok+miesiąc+typ — unikaj drugiego arkusza przy innej nazwie
  const { data: bySession, error: err2 } = await supabase
    .from("arkusze")
    .select("id,nazwa")
    .eq("typ", "matura")
    .eq("rok", session.rok)
    .eq("miesiac", session.miesiac)
    .order("created_at", { ascending: true });

  if (err2) throw new Error(err2.message);
  if (bySession && bySession.length > 0) {
    // Preferuj wpis z „poziom podstawowy” / dłuższą nazwą CKE
    const preferred =
      bySession.find((a) => /poziom podstawowy/i.test(a.nazwa)) ??
      bySession.find((a) => a.nazwa === session.nazwa) ??
      bySession[0]!;
    console.log(
      `  ℹ Używam istniejącego arkusza „${preferred.nazwa}” zamiast tworzyć „${session.nazwa}”`,
    );
    return preferred.id;
  }

  const { data: created, error: insErr } = await supabase
    .from("arkusze")
    .insert({
      nazwa: session.nazwa,
      typ: "matura",
      rok: session.rok,
      miesiac: session.miesiac,
    })
    .select("id")
    .single();

  if (insErr) throw new Error(insErr.message);
  return created.id;
}

async function deleteBySourceId(
  supabase: SupabaseClient,
  sid: string,
): Promise<void> {
  const { error } = await supabase.from("zadania").delete().eq("source_id", sid);
  if (error && !/source_id|column/i.test(error.message)) {
    throw new Error(error.message);
  }
}

async function existsBySourceId(
  supabase: SupabaseClient,
  sid: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("zadania")
    .select("id")
    .eq("source_id", sid)
    .maybeSingle();
  if (error) {
    if (/source_id|column/i.test(error.message)) return false;
    throw new Error(error.message);
  }
  return Boolean(data?.id);
}

async function importSheetToSupabase(
  supabase: SupabaseClient,
  session: CkeMaturaSession,
  sheet: CachedSheet,
  replace: boolean,
): Promise<{ inserted: number; skipped: number }> {
  const arkuszId = await getOrCreateArkusz(supabase, session);
  let inserted = 0;
  let skipped = 0;

  for (const z of sheet.tasks) {
    const sid = sourceId(session.id, z.numer);

    if (replace) {
      await deleteBySourceId(supabase, sid);
    } else if (await existsBySourceId(supabase, sid)) {
      skipped += 1;
      continue;
    }

    const row: Record<string, unknown> = {
      arkusz_id: arkuszId,
      numer_zadania: z.numer,
      dzial: z.dzial,
      tresc: cleanMaturaTaskText(z.tresc),
      rozwiazanie: z.rozwiazanie.trim(),
      source_id: sid,
    };

    const { error } = await supabase.from("zadania").insert(row);
    if (error) {
      if (/source_id/i.test(error.message)) {
        const { error: e2 } = await supabase.from("zadania").insert({
          arkusz_id: arkuszId,
          numer_zadania: z.numer,
          dzial: z.dzial,
          tresc: cleanMaturaTaskText(z.tresc),
          rozwiazanie: z.rozwiazanie.trim(),
        });
        if (e2) throw new Error(`Zad. ${z.numer}: ${e2.message}`);
      } else {
        throw new Error(`Zad. ${z.numer}: ${error.message}`);
      }
    }
    inserted += 1;
  }

  return { inserted, skipped };
}

function filterSessions(opts: CliOptions): CkeMaturaSession[] {
  return CKE_MATURA_IMPORTABLE_SESSIONS.filter((s) => {
    if (opts.only && !opts.only.has(s.id)) return false;
    if (opts.fromYear != null && s.rok < opts.fromYear) return false;
    return true;
  });
}

async function main() {
  const opts = parseArgs();
  const sessions = filterSessions(opts);

  const mode = opts.regenerateSolutions
    ? "regeneracja wszystkich rozwiązań (Gemini, zwięzły format)"
    : opts.fillSolutions
      ? "uzupełnianie rozwiązań (Gemini)"
      : opts.noGemini
        ? "tylko treść (bez Gemini)"
        : "pełny import + Gemini";

  console.log(
    `Import CKE — poziom podstawowy: ${sessions.length} arkuszy\n` +
      `  Tryb: ${mode} | cache: ${CACHE_DIR}\n`,
  );

  const supabase = createSupabase();
  let totalInserted = 0;
  let totalSkipped = 0;

  for (const session of sessions) {
    if (opts.fillSolutions && !opts.regenerateSolutions && session.bundled) {
      console.log(`\n▶ ${session.nazwa} [${session.id}] — pomijam (gotowe rozwiązania)`);
      continue;
    }

    console.log(`\n▶ ${session.nazwa} [${session.id}]`);

    try {
      const sheet = await buildSheetCache(supabase, session, opts);
      const synced = await syncSheetToSupabase(
        supabase,
        session,
        sheet,
        opts.replace,
        opts.cacheOnly,
      );

      if (synced) {
        console.log(
          `  → Supabase: +${synced.inserted} zadań, pominięto ${synced.skipped} (już były)`,
        );
        totalInserted += synced.inserted;
        totalSkipped += synced.skipped;
      } else if (!opts.cacheOnly) {
        console.log(`  → Supabase: pominięto (błąd połączenia)`);
      }
    } catch (err) {
      if (err instanceof DailyQuotaReached) {
        console.log(
          `\n⏸ Wyczerpany dzienny limit free tier Gemini (~20 żądań/dzień na model).`,
        );
        console.log(
          `   Postęp zapisany w cache i Supabase. Wznów jutro:\n   npm run seed:cke-solutions`,
        );
        break;
      }
      throw err;
    }
  }

  console.log(
    `\n✅ Koniec. Arkuszy: ${sessions.length} | dodano łącznie: ${totalInserted} | pominięto: ${totalSkipped}`,
  );
  console.log(`   Oficjalne PDF: ${CKE_MATURA_CKE_URL}`);
}

main().catch((err) => {
  if (err instanceof DailyQuotaReached) {
    process.exit(0);
  }
  console.error("\n✗ Import nie powiódł się:");
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
