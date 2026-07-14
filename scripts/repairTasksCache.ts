/**
 * Naprawia correct_answer w data/tasks-cache/ (Gemini często myli pole vs explanation).
 *   npm run repair:tasks-cache
 *   npm run repair:tasks-cache -- --dry-run
 *   npm run repair:tasks-cache -- --remove-broken
 */
import {
  reconcileTaskAnswer,
  type TaskRepairResult,
} from "../lib/gemini/task-quality";
import {
  listAllTaskSlots,
  readTaskCache,
  writeTaskCache,
} from "../lib/trening/seed/tasks-cache-utils";
import type { CachedGeminiTask } from "../lib/trening/seed/tasks-cache-utils";

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const removeBroken = process.argv.includes("--remove-broken");

  let repaired = 0;
  let removed = 0;
  let unchanged = 0;

  for (const slot of listAllTaskSlots()) {
    const bundle = readTaskCache(slot);
    if (!bundle?.tasks.length) continue;

    const nextTasks: CachedGeminiTask[] = [];
    let slotChanged = false;

    for (const task of bundle.tasks) {
      const result: TaskRepairResult = reconcileTaskAnswer(task);

      if (result.shouldRemove && removeBroken) {
        removed += 1;
        slotChanged = true;
        console.log(`  ✗ usuwam [${slot.topic}] ${result.repairReason}: ${task.content.slice(0, 60)}…`);
        continue;
      }

      if (result.repaired) {
        repaired += 1;
        slotChanged = true;
        console.log(
          `  ✓ [${slot.category}/${slot.topic}] ${result.repairReason}`,
        );
        nextTasks.push({ ...task, correct_answer: result.correct_answer });
      } else {
        unchanged += 1;
        nextTasks.push(task);
      }
    }

    if (slotChanged && !dryRun) {
      writeTaskCache({ ...bundle, tasks: nextTasks });
    }
  }

  console.log("\n=== Repair tasks-cache ===\n");
  console.log(`Naprawione: ${repaired}`);
  console.log(`Usunięte: ${removed}${removeBroken ? "" : " (użyj --remove-broken)"}`);
  console.log(`Bez zmian: ${unchanged}`);
  if (dryRun) console.log("\n[dry-run] Nic nie zapisano.\n");
  else console.log("\nNastępny krok: npm run sync:tasks-answers\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
