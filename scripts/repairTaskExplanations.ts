/**
 * Naprawa rozwiązań i sklejonych znaków w zadaniach z data/tasks-cache/.
 *
 *   npx tsx scripts/repairTaskExplanations.ts
 *   npx tsx scripts/repairTaskExplanations.ts --dry-run --verbose
 *
 * Skrypt nie zmienia id, correct_answer, difficulty ani xp_reward.
 * Opcje zmieniają się wyłącznie przez naprawę sekwencji znaków w $...$.
 */
import fs from "fs";
import path from "path";
import {
  explainTaskDetailed,
  findBrokenSignSequences,
  needsExplanationRepair,
  repairMathSigns,
} from "@/lib/trening/seed/explain-task";
import {
  TASKS_CACHE_DIR,
  type CachedTaskBundle,
} from "@/lib/trening/seed/tasks-cache-utils";

const dryRun = process.argv.includes("--dry-run");
const verbose = process.argv.includes("--verbose");

type Inconsistency = {
  file: string;
  id: string;
  topic: string;
  content: string;
  answer: string;
  computed: string | null;
};

function repairString(value: unknown): { text: string; fixed: number } {
  if (typeof value !== "string") {
    return { text: typeof value === "string" ? value : String(value ?? ""), fixed: 0 };
  }
  const fixed = findBrokenSignSequences(value).length;
  return { text: repairMathSigns(value), fixed };
}

function main(): void {
  if (!fs.existsSync(TASKS_CACHE_DIR)) {
    console.error(`Brak katalogu ${TASKS_CACHE_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(TASKS_CACHE_DIR)
    .filter((file) => file.endsWith(".json"))
    .sort();

  let tasksTotal = 0;
  let filesChanged = 0;
  let tasksChanged = 0;
  let explanationsChanged = 0;
  let signSequencesFixed = 0;
  let signTasksChanged = 0;
  const inconsistencies: Inconsistency[] = [];

  for (const file of files) {
    const fullPath = path.join(TASKS_CACHE_DIR, file);
    const originalText = fs.readFileSync(fullPath, "utf8");

    let bundle: CachedTaskBundle;
    try {
      bundle = JSON.parse(originalText) as CachedTaskBundle;
    } catch {
      console.warn(`⚠ pominięto niepoprawny JSON: ${file}`);
      continue;
    }

    if (!Array.isArray(bundle.tasks)) {
      console.warn(`⚠ brak listy zadań: ${file}`);
      continue;
    }

    let fileExplanations = 0;
    let fileSigns = 0;
    let fileSignTasks = 0;

    for (const task of bundle.tasks) {
      tasksTotal += 1;
      let taskChanged = false;
      let taskSigns = 0;

      const content = repairString(task.content);
      if (content.text !== task.content) {
        task.content = content.text;
        taskChanged = true;
      }
      taskSigns += content.fixed;

      if (Array.isArray(task.options)) {
        const repairedOptions = task.options.map((option) => {
          const repaired = repairString(option);
          taskSigns += repaired.fixed;
          return repaired.text;
        });
        if (repairedOptions.some((option, index) => option !== task.options[index])) {
          task.options = repairedOptions;
          taskChanged = true;
        }
      }

      const explanationBefore = typeof task.explanation === "string" ? task.explanation : "";
      const regenerate = needsExplanationRepair(explanationBefore);

      if (regenerate) {
        const result = explainTaskDetailed(
          task.content,
          typeof task.correct_answer === "string" ? task.correct_answer : "",
          typeof bundle.topic === "string" ? bundle.topic : "",
        );
        task.explanation = result.explanation;
        fileExplanations += 1;
        if (!result.consistent) {
          inconsistencies.push({
            file,
            id: task.id,
            topic: bundle.topic,
            content: task.content,
            answer: task.correct_answer,
            computed: result.computed,
          });
        }
        taskChanged = true;
      } else {
        const explanation = repairString(explanationBefore);
        if (explanation.text !== explanationBefore) {
          task.explanation = explanation.text;
          taskSigns += explanation.fixed;
          taskChanged = true;
        }
      }

      if (taskSigns > 0) {
        fileSigns += taskSigns;
        fileSignTasks += 1;
        signTasksChanged += 1;
      }
      if (taskChanged) tasksChanged += 1;
    }

    const nextText = JSON.stringify(bundle, null, 2);
    if (nextText !== originalText) {
      filesChanged += 1;
      if (!dryRun) {
        fs.writeFileSync(fullPath, nextText, "utf8");
      }
    }

    if (fileExplanations > 0 || fileSigns > 0) {
      explanationsChanged += fileExplanations;
      signSequencesFixed += fileSigns;
      if (verbose) {
        console.log(
          `${file}: explanation ${fileExplanations}, znaki ${fileSigns} (zadania ${fileSignTasks})`,
        );
      }
    }
  }

  console.log("\n=== Naprawa tasks-cache ===");
  console.log(`Pliki: ${files.length} (zmienione: ${filesChanged})`);
  console.log(`Zadania: ${tasksTotal} (zmienione: ${tasksChanged})`);
  console.log(`Naprawione explanation: ${explanationsChanged}`);
  console.log(
    `Naprawione sekwencje znaków: ${signSequencesFixed} (w ${signTasksChanged} zadaniach)`,
  );
  console.log(`Niespójne z correct_answer: ${inconsistencies.length}`);
  if (dryRun) console.log("Tryb --dry-run: nic nie zapisano.");

  if (inconsistencies.length > 0) {
    console.log("\nZadania, w których wyliczenia nie zgadzają się z kluczem:");
    for (const item of inconsistencies) {
      console.log(
        `  ✗ ${item.id} [${item.topic}] ${item.content}`,
      );
      console.log(
        `      correct_answer=${item.answer} | wyliczono=${item.computed ?? "—"}`,
      );
    }
  }
}

try {
  main();
} catch (error) {
  console.error(error);
  process.exit(1);
}
