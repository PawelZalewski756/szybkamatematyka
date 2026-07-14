/**
 * Wgrywa zadania z data/tasks-cache do Supabase (tasks).
 *
 *   npm run seed:tasks-cache
 *   npm run seed:tasks-cache -- --dry-run
 *
 * Wymaga SUPABASE_SERVICE_ROLE_KEY (RLS INSERT).
 */

import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { taskContentForDb } from "../lib/gemini/format-tasks";
import { listAllCachedTasks } from "../lib/trening/seed/tasks-cache-utils";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const BATCH = 100;

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
    console.warn("⚠ Brak SUPABASE_SERVICE_ROLE_KEY — insert może się nie udać.");
  }

  const tasks = listAllCachedTasks();
  if (tasks.length === 0) {
    throw new Error("Brak zadań w data/tasks-cache");
  }

  console.log(`\n=== Push tasks cache → Supabase (${tasks.length}) ===\n`);

  if (dryRun) {
    console.log(`[dry-run] ${tasks.length} zadań`);
    return;
  }

  const supabase = createClient(url, key);
  let inserted = 0;
  let failed = 0;

  for (let i = 0; i < tasks.length; i += BATCH) {
    const chunk = tasks.slice(i, i + BATCH).map((task) => ({
      exam_type: task.exam_type,
      category: task.category,
      topic: task.topic,
      difficulty: task.difficulty,
      content: taskContentForDb(task),
      correct_answer: task.correct_answer,
      options: task.options,
      xp_reward: task.xp_reward,
    }));

    const { error } = await supabase.from("tasks").insert(chunk);
    if (error) {
      console.warn(`  ✗ batch ${i / BATCH + 1}: ${error.message}`);
      failed += chunk.length;
    } else {
      inserted += chunk.length;
      console.log(`  ✓ batch ${i / BATCH + 1} (+${chunk.length})`);
    }
  }

  console.log(`\nOK: ${inserted}, błędy: ${failed}\n`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
