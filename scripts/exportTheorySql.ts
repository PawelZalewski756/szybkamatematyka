/**
 * Eksport lekcji z SEED_MATERIALS → plik SQL (UPSERT po slugach CKE).
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
  const n = SEED_MATERIALS.length;
  const lines: string[] = [
    "-- Wygenerowano: npm run seed:theory-sql",
    "-- Uruchom w Supabase SQL Editor (Dashboard → SQL).",
    `-- UPSERT ${n} tematów CKE (INSERT + UPDATE przy istniejącym slugu).`,
    "",
    "CREATE UNIQUE INDEX IF NOT EXISTS materials_exam_category_topic_uidx",
    "  ON public.materials (exam_type, category, topic);",
    "",
  ];

  for (const m of SEED_MATERIALS) {
    lines.push(
      `INSERT INTO public.materials (exam_type, category, topic, title, content, video_url)`,
      `VALUES (`,
      `  ${sqlString(m.exam_type)},`,
      `  ${sqlString(m.category)},`,
      `  ${sqlString(m.topic)},`,
      `  ${sqlString(m.title)},`,
      `  ${sqlString(m.content)},`,
      `  NULL`,
      `)`,
      `ON CONFLICT (exam_type, category, topic) DO UPDATE SET`,
      `  title = EXCLUDED.title,`,
      `  content = EXCLUDED.content,`,
      `  video_url = EXCLUDED.video_url;`,
      "",
    );
  }

  fs.writeFileSync(OUT, lines.join("\n"), "utf8");
  console.log(`\n✓ Zapisano ${n} UPSERT → ${OUT}`);
  console.log("  Wklej plik w Supabase SQL Editor i uruchom.\n");
}

main();
