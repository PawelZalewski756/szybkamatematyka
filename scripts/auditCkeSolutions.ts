/**
 * Raport placeholderów rozwiązań CKE (cache lokalny + opcjonalnie Supabase).
 *   npx tsx scripts/auditCkeSolutions.ts
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
  tasks: { numer: number; rozwiazanie: string }[];
};

function auditCache() {
  if (!fs.existsSync(CACHE_DIR)) {
    console.log("Brak katalogu cache:", CACHE_DIR);
    return { total: 0, placeholders: 0, bySession: [] as { id: string; ph: number; total: number }[] };
  }

  const files = fs.readdirSync(CACHE_DIR).filter((f) => f.endsWith(".json"));
  let total = 0;
  let placeholders = 0;
  const bySession: { id: string; nazwa: string; ph: number; total: number }[] = [];

  for (const file of files.sort()) {
    const sheet = JSON.parse(
      fs.readFileSync(path.join(CACHE_DIR, file), "utf8"),
    ) as CacheSheet;
    const ph = sheet.tasks.filter((t) => isSolutionPlaceholder(t.rozwiazanie)).length;
    total += sheet.tasks.length;
    placeholders += ph;
    bySession.push({
      id: sheet.sessionId,
      nazwa: sheet.nazwa,
      ph,
      total: sheet.tasks.length,
    });
  }

  return { total, placeholders, bySession };
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
  return { total: rows.length, placeholders: ph.length };
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

  const db = await auditSupabase();
  if (db) {
    console.log("\nSUPABASE (zadania, limit 5000):");
    console.log(
      `  ${db.total - db.placeholders}/${db.total} gotowych, ${db.placeholders} placeholderów`,
    );
  } else {
    console.log("\nSUPABASE: pominięto (brak .env.local)");
  }

  if (cache.placeholders > 0) {
    console.log(
      "\n→ Uzupełnij: npm run seed:cke-matura -- --fill-solutions --replace",
    );
    console.log("  (jedna sesja: --only=m25-maj)");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
