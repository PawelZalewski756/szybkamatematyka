/**
 * Wgrywa lekcje z data/theory-cache do Supabase (update/insert).
 *
 *   npm run seed:theory-cache
 *   npm run seed:theory-cache -- --dry-run
 *
 * Wymaga SUPABASE_SERVICE_ROLE_KEY na produkcji (RLS admin-only).
 */

import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import type { ExamType } from "../types/database";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const CACHE_DIR = path.resolve(process.cwd(), "data/theory-cache");

type CachedTheory = {
  exam_type: ExamType;
  category: string;
  topic: string;
  title: string;
  content: string;
};

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !key) {
    throw new Error("Brak Supabase URL / klucza w .env.local");
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    console.warn("⚠ Brak SUPABASE_SERVICE_ROLE_KEY — zapis może się nie udać.");
  }

  if (!fs.existsSync(CACHE_DIR)) {
    throw new Error(`Brak katalogu ${CACHE_DIR} — najpierw npm run seed:theory-gemini`);
  }

  const files = fs.readdirSync(CACHE_DIR).filter((f) => f.endsWith(".json"));
  const supabase = createClient(url, key);
  let updated = 0;
  let failed = 0;

  console.log(`\n=== Push cache → Supabase (${files.length} plików) ===\n`);

  for (const file of files.sort()) {
    const entry = JSON.parse(
      fs.readFileSync(path.join(CACHE_DIR, file), "utf8"),
    ) as CachedTheory;
    const keyStr = `${entry.exam_type}:${entry.category}:${entry.topic}`;

    if (dryRun) {
      console.log(`  [dry-run] ${keyStr} — ${entry.title}`);
      updated += 1;
      continue;
    }

    const { data, error } = await supabase
      .from("materials")
      .update({
        title: entry.title,
        content: entry.content,
        video_url: null,
      })
      .eq("exam_type", entry.exam_type)
      .eq("category", entry.category)
      .eq("topic", entry.topic)
      .select("id");

    if (error) {
      console.warn(`  ✗ ${keyStr}: ${error.message}`);
      failed += 1;
      continue;
    }

    if (data?.length) {
      console.log(`  ✓ update ${keyStr}`);
      updated += 1;
      continue;
    }

    const { error: insertError } = await supabase.from("materials").insert({
      exam_type: entry.exam_type,
      category: entry.category,
      topic: entry.topic,
      title: entry.title,
      content: entry.content,
      video_url: null,
    });

    if (insertError) {
      console.warn(`  ✗ insert ${keyStr}: ${insertError.message}`);
      failed += 1;
    } else {
      console.log(`  ✓ insert ${keyStr}`);
      updated += 1;
    }
  }

  console.log(`\nOK: ${updated}, błędy: ${failed}\n`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
