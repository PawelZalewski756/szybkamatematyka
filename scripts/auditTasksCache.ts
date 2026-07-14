/**
 * Audyt jakości zadań w data/tasks-cache/
 *   npm run audit:tasks-cache
 */
import {
  auditTaskQuality,
  inferAnswerFromExplanation,
} from "../lib/gemini/task-quality";
import { listAllCachedTasks } from "../lib/trening/seed/tasks-cache-utils";

async function main() {
  const tasks = listAllCachedTasks();
  const issues: Array<{ id: string; topic: string; detail: string }> = [];

  for (const task of tasks) {
    for (const detail of auditTaskQuality(task)) {
      issues.push({
        id: task.id,
        topic: `${task.category}/${task.topic}`,
        detail,
      });
    }
  }

  console.log("\n=== Audyt tasks-cache ===\n");
  console.log(`Zadań: ${tasks.length}`);
  console.log(`Problemów: ${issues.length}\n`);

  const mismatches = issues.filter((i) => i.detail.includes("mismatch"));
  const broken = issues.filter((i) => i.detail.includes("broken"));
  const mcBad = issues.filter((i) => i.detail.includes("not in options"));

  console.log(`  open mismatch (explanation ≠ correct_answer): ${mismatches.length}`);
  console.log(`  MC correct not in options: ${mcBad.length}`);
  console.log(`  broken explanation: ${broken.length}\n`);

  for (const issue of issues.slice(0, 25)) {
    console.log(`✗ [${issue.topic}] ${issue.detail}`);
  }
  if (issues.length > 25) {
    console.log(`… i ${issues.length - 25} więcej`);
  }

  // przykład naprawy
  const logTask = tasks.find((t) =>
    t.content.includes("2 \\log_3 9 - \\log_2 16"),
  );
  if (logTask) {
    console.log("\nPrzykład logarytmy:");
    console.log(`  correct_answer: ${logTask.correct_answer}`);
    console.log(
      `  z explanation: ${inferAnswerFromExplanation(logTask.explanation)}`,
    );
  }

  process.exit(issues.length > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
