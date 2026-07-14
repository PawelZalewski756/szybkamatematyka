/**
 * Aktualizuje correct_answer w Supabase (po repair cache), dopasowanie po fingerprint treści.
 *   npm run sync:tasks-answers
 *   npm run sync:tasks-answers -- --dry-run
 */
import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { contentFingerprint, taskContentForDb } from "../lib/gemini/format-tasks";
import { checkAnswerMatch } from "../lib/math/answer-equiv";
import { fetchAllPages } from "../lib/supabase/fetch-all-pages";
import { listAllCachedTasks } from "../lib/trening/seed/tasks-cache-utils";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceKey) {
    throw new Error("Wymaga NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY");
  }

  const cached = listAllCachedTasks();
  const byFingerprint = new Map<
    string,
    { correct_answer: string; content: string }
  >();
  for (const task of cached) {
    byFingerprint.set(contentFingerprint(taskContentForDb(task)), {
      correct_answer: task.correct_answer,
      content: task.content.slice(0, 80),
    });
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { rows, error } = await fetchAllPages<{
    id: string;
    content: string;
    correct_answer: string;
  }>((from, to) =>
    supabase
      .from("tasks")
      .select("id,content,correct_answer")
      .range(from, to),
  );

  if (error) throw error;

  let toUpdate = 0;
  let updated = 0;
  let failed = 0;

  console.log("\n=== Sync correct_answer → Supabase ===\n");
  console.log(`W bazie: ${rows.length} · w cache: ${cached.length}\n`);

  for (const row of rows) {
    const fp = contentFingerprint(row.content);
    const fix = byFingerprint.get(fp);
    if (!fix) continue;
    if (checkAnswerMatch(row.correct_answer, fix.correct_answer)) continue;

    toUpdate += 1;
    console.log(
      `  ~ ${fix.content}…\n    ${row.correct_answer} → ${fix.correct_answer}`,
    );

    if (dryRun) continue;

    const { error: updErr } = await supabase
      .from("tasks")
      .update({ correct_answer: fix.correct_answer })
      .eq("id", row.id);

    if (updErr) {
      failed += 1;
      console.warn(`    ✗ ${updErr.message}`);
    } else {
      updated += 1;
    }
  }

  console.log(`\nDo aktualizacji: ${toUpdate}`);
  if (!dryRun) {
    console.log(`OK: ${updated}, błędy: ${failed}\n`);
  } else {
    console.log("[dry-run]\n");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
