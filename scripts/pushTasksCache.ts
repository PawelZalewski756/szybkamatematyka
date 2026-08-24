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
import {
  contentFingerprint,
  taskContentForDb,
} from "../lib/gemini/format-tasks";
import { fetchAllPages } from "../lib/supabase/fetch-all-pages";
import { listAllCachedTasks } from "../lib/trening/seed/tasks-cache-utils";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const BATCH = 100;

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url) {
    throw new Error("Brak NEXT_PUBLIC_SUPABASE_URL w .env.local");
  }
  if (!serviceKey) {
    throw new Error(
      "Brak SUPABASE_SERVICE_ROLE_KEY w .env.local.\n" +
        "Supabase → Project Settings → API → service_role (secret, NIE anon public).\n" +
        "Dodaj linię: SUPABASE_SERVICE_ROLE_KEY=eyJ...\n" +
        "Zapisz plik i uruchom ponownie npm run seed:tasks-cache",
    );
  }

  const tasks = listAllCachedTasks();
  if (tasks.length === 0) {
    throw new Error("Brak zadań w data/tasks-cache");
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { rows: existingRows, error: fetchError } = await fetchAllPages<{ content: string }>(
    (from, to) =>
      supabase.from("tasks").select("content").range(from, to),
  );
  if (fetchError) {
    throw new Error(`Nie udało się pobrać istniejących zadań: ${fetchError.message}`);
  }

  const existingFingerprints = new Set(
    existingRows.map((row) => contentFingerprint(row.content)),
  );

  const toInsert = tasks.filter(
    (task) =>
      !existingFingerprints.has(contentFingerprint(taskContentForDb(task))),
  );

  console.log(`\n=== Push tasks cache → Supabase ===\n`);
  console.log(`Cache: ${tasks.length} · w bazie: ${existingRows.length} · do wgrania: ${toInsert.length}\n`);
  console.log("Klucz: service_role ✓\n");

  if (toInsert.length === 0) {
    console.log("✓ Wszystkie zadania z cache są już w bazie.\n");
    return;
  }

  if (dryRun) {
    console.log(`[dry-run] ${toInsert.length} nowych zadań`);
    return;
  }

  let inserted = 0;
  let failed = 0;

  for (let i = 0; i < toInsert.length; i += BATCH) {
    const chunk = toInsert.slice(i, i + BATCH).map((task) => ({
      exam_type: task.exam_type,
      category: task.category,
      topic: task.topic,
      difficulty: task.difficulty,
      content: taskContentForDb(task),
      correct_answer: task.correct_answer,
      options: task.options,
      xp_reward: task.xp_reward,
      source_id:
        task.id ?? contentFingerprint(taskContentForDb(task)),
      explanation: task.explanation,
      solution_steps: task.explanation
        .split(/\n(?=(?:\*\*)?Krok\s+\d+)/i)
        .map((step) => step.trim())
        .filter(Boolean),
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
