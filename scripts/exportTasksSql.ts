/**
 * Eksport zadań z data/tasks-cache → SQL INSERT (Supabase SQL Editor).
 *
 *   npm run seed:tasks-sql
 *   → supabase/tasks-gemini-insert.sql
 */

import fs from "fs";
import path from "path";
import { taskContentForDb } from "../lib/gemini/format-tasks";
import { listAllCachedTasks } from "../lib/trening/seed/tasks-cache-utils";

const OUT = path.resolve(process.cwd(), "supabase/tasks-gemini-insert.sql");

function sqlString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function sqlJson(value: string[]): string {
  return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
}

function main() {
  const tasks = listAllCachedTasks();
  if (tasks.length === 0) {
    console.error("\nBrak zadań w data/tasks-cache - najpierw npm run seed:tasks-gemini\n");
    process.exit(1);
  }

  const lines: string[] = [
    "-- Wygenerowano: npm run seed:tasks-sql",
    "-- Uruchom w Supabase SQL Editor.",
    `-- INSERT ${tasks.length} zadań z cache Gemini.`,
    "",
  ];

  for (const task of tasks) {
    const content = taskContentForDb(task);
    lines.push(
      "INSERT INTO public.tasks (exam_type, category, topic, difficulty, content, correct_answer, options, xp_reward)",
      "VALUES (",
      `  ${sqlString(task.exam_type)},`,
      `  ${sqlString(task.category)},`,
      `  ${sqlString(task.topic)},`,
      `  ${task.difficulty},`,
      `  ${sqlString(content)},`,
      `  ${sqlString(task.correct_answer)},`,
      `  ${sqlJson(task.options)},`,
      `  ${task.xp_reward}`,
      ");",
      "",
    );
  }

  fs.writeFileSync(OUT, lines.join("\n"), "utf8");
  console.log(`\n✓ Zapisano ${tasks.length} INSERT → ${OUT}`);
  console.log("  Wklej plik w Supabase SQL Editor i uruchom.\n");
}

main();
