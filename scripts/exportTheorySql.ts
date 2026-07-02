/**
 * Eksport lekcji z SEED_MATERIALS → plik SQL (UPDATE po slugach CKE).
 * Uruchom w Supabase SQL Editor (omija RLS po stronie klienta).
 *
 *   npm run seed:theory-sql
 *   → supabase/theory-lessons-update.sql
 */

import fs from "fs";
import path from "path";
import { SEED_MATERIALS } from "../lib/trening/seed/materials";

const OUT = path.resolve(process.cwd(), "supabase/theory-lessons-update.sql");

function sqlString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function main() {
  const lines: string[] = [
    "-- Wygenerowano: npm run seed:theory-sql",
    "-- Uruchom w Supabase SQL Editor (Dashboard → SQL).",
    "-- Aktualizuje title + content dla 25 tematów CKE.",
    "",
  ];

  for (const m of SEED_MATERIALS) {
    lines.push(
      `UPDATE public.materials SET`,
      `  title = ${sqlString(m.title)},`,
      `  content = ${sqlString(m.content)}`,
      `WHERE exam_type = ${sqlString(m.exam_type)}`,
      `  AND category = ${sqlString(m.category)}`,
      `  AND topic = ${sqlString(m.topic)};`,
      "",
    );
  }

  fs.writeFileSync(OUT, lines.join("\n"), "utf8");
  console.log(`\n✓ Zapisano ${SEED_MATERIALS.length} UPDATE → ${OUT}`);
  console.log("  Wklej plik w Supabase SQL Editor i uruchom.\n");
}

main();
