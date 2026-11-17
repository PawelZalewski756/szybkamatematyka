/**
 * Audyt jakości rozwiązań CKE: placeholdery i artefakty rozumowania LLM.
 *
 *   npm run audit:cke
 *
 * Sprawdza cache maturalny (data/cke-matura-cache) oraz - jeśli jest
 * .env.local - tabelę `zadania`. Nie weryfikuje poprawności matematycznej
 * (to robi recenzja człowieka), ale wyłapuje wyjścia modelu, które nie mogą
 * trafić do ucznia: „Przepraszam, popełniłem błąd”, rozwiązania z setkami
 * kroków i sprzeczne odpowiedzi.
 */
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { isSolutionPlaceholder } from "../lib/gemini/format-solution";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const CACHE_DIR = path.resolve(process.cwd(), "data/cke-matura-cache");

type CacheSheet = {
  sessionId: string;
  nazwa: string;
  tasks: { numer: number; rozwiazanie: string; kroki?: string[] }[];
};

/** Zdania, które zdradzają, że model poprawiał sam siebie w treści. */
const SELF_CORRECTION = [
  /przepraszam/i,
  /poprawiam/i,
  /popełniłem błąd/i,
  /pomyliłem się/i,
  /błąd w kroku/i,
  /\(ponownie\)/i,
  /nie jestem pewien/i,
  /żadna z (podanych )?opcji nie/i,
];

const MAX_STEPS = 12;

type Issue = { where: string; task: string; detail: string };

function looksLikeArtifact(solution: string, steps: string[]): string | null {
  const text = [solution, ...steps].join("\n");
  for (const pattern of SELF_CORRECTION) {
    if (pattern.test(text)) return `artefakt: ${pattern.source}`;
  }
  if (steps.length > MAX_STEPS) return `za dużo kroków: ${steps.length}`;
  return null;
}

function auditCache() {
  if (!fs.existsSync(CACHE_DIR)) {
    console.log("Brak katalogu cache:", CACHE_DIR);
    return {
      total: 0,
      placeholders: 0,
      issues: [] as Issue[],
      bySession: [] as { id: string; ph: number; total: number }[],
    };
  }

  const files = fs.readdirSync(CACHE_DIR).filter((f) => f.endsWith(".json"));
  let total = 0;
  let placeholders = 0;
  const issues: Issue[] = [];
  const bySession: { id: string; nazwa: string; ph: number; total: number }[] = [];

  for (const file of files.sort()) {
    const sheet = JSON.parse(
      fs.readFileSync(path.join(CACHE_DIR, file), "utf8"),
    ) as CacheSheet;
    let ph = 0;
    for (const task of sheet.tasks) {
      if (isSolutionPlaceholder(task.rozwiazanie)) ph += 1;
      const artifact = looksLikeArtifact(
        task.rozwiazanie ?? "",
        task.kroki ?? [],
      );
      if (artifact) {
        issues.push({
          where: sheet.sessionId,
          task: String(task.numer),
          detail: artifact,
        });
      }
    }
    total += sheet.tasks.length;
    placeholders += ph;
    bySession.push({
      id: sheet.sessionId,
      nazwa: sheet.nazwa,
      ph,
      total: sheet.tasks.length,
    });
  }

  return { total, placeholders, issues, bySession };
}

async function auditSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return null;

  const sb = createClient(url, key);
  const { data, error } = await sb
    .from("zadania")
    .select("id,rozwiazanie,arkusze!inner(typ)")
    .limit(5000);

  if (error) {
    console.warn("Supabase:", error.message);
    return null;
  }

  const rows = data ?? [];
  const ph = rows.filter((z) => isSolutionPlaceholder(String(z.rozwiazanie ?? "")));
  const issues: string[] = [];
  for (const row of rows) {
    if (looksLikeArtifact(String(row.rozwiazanie ?? ""), [])) {
      issues.push(String(row.id));
    }
  }
  return { total: rows.length, placeholders: ph.length, issues };
}

async function main() {
  const cache = auditCache();

  console.log("\n=== Audyt rozwiązań CKE ===\n");
  console.log("CACHE (data/cke-matura-cache):");
  for (const s of cache.bySession) {
    const status = s.ph === 0 ? "✓" : s.ph === s.total ? "✗" : "~";
    console.log(
      `  ${status} ${s.id}: ${s.total - s.ph}/${s.total} gotowych (${s.ph} placeholderów)`,
    );
  }
  console.log(
    `\n  RAZEM cache: ${cache.total - cache.placeholders}/${cache.total} gotowych, ${cache.placeholders} do uzupełnienia`,
  );

  if (cache.issues.length > 0) {
    console.log(`\n  Artefakty LLM / zbyt długie rozwiązania: ${cache.issues.length}`);
    for (const issue of cache.issues.slice(0, 15)) {
      console.log(`   - ${issue.where} / zad. ${issue.task}: ${issue.detail}`);
    }
  }

  const db = await auditSupabase();
  if (db) {
    console.log("\nSUPABASE (zadania, limit 5000):");
    console.log(
      `  ${db.total - db.placeholders}/${db.total} gotowych, ${db.placeholders} placeholderów`,
    );
    if (db.issues.length > 0) {
      console.log(`  Artefakty LLM: ${db.issues.length} (np. ${db.issues[0]})`);
    }
  } else {
    console.log("\nSUPABASE: pominięto (brak .env.local)");
  }

  if (cache.placeholders > 0) {
    console.log(
      "\n→ Uzupełnij: npm run seed:cke-matura -- --fill-solutions --replace",
    );
    console.log("  (jedna sesja: --only=m25-maj)");
  }

  // Artefakty to błąd jakości, nie tylko raport: uczeń nie może zobaczyć
  // „Przepraszam, popełniłem błąd” w rozwiązaniu. Do czasu recenzji
  // merytorycznej raportujemy je jako ostrzeżenie; `--strict` (docelowo w CI
  // po przeglądzie) traktuje je jako błąd.
  if (cache.issues.length > 0) {
    const message = `${cache.issues.length} rozwiązań z artefaktami LLM - do poprawy lub usunięcia (patrz docs/do-recenzji.md).`;
    if (process.argv.includes("--strict")) {
      console.error(`\n✗ ${message}`);
      process.exit(1);
    }
    console.warn(`\n! ${message}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
