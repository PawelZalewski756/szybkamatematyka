/**
 * Audyt jakości pytań — uruchom: npx tsx scripts/auditQuestionQuality.ts
 */
import { getAllTasks } from "../lib/baza-zadan/catalog";
import { ALL_NUMERIC_CLAIM_BANKS } from "../lib/content/claim-banks";
import {
  findEquivalentChoiceGroups,
  isNumericClaimTrue,
} from "../lib/math/answer-equiv";

type Issue = { source: string; detail: string };

const issues: Issue[] = [];

function auditMcTasks() {
  for (const task of getAllTasks()) {
    if (!task.choices?.length) continue;

    const groups = findEquivalentChoiceGroups([...task.choices]);
    if (groups.length > 0) {
      issues.push({
        source: task.id,
        detail: `Duplikaty równoważne w opcjach: ${groups.map((g) => g.map((i) => task.choices[i]).join(" = ")).join("; ")}`,
      });
    }

    const correct = task.choices[task.correctIndex];
    if (correct === undefined) {
      issues.push({
        source: task.id,
        detail: `correctIndex ${task.correctIndex} poza zakresem (${task.choices.length} opcji)`,
      });
    }
  }
}

/** Banki twierdzeń z lib/content/claim-banks.ts */
function auditTrueFalseBanks() {
  for (const bank of ALL_NUMERIC_CLAIM_BANKS) {
    for (const { correct, wrong } of bank.claims) {
      const correctTruth = isNumericClaimTrue(correct);
      if (correctTruth === false) {
        issues.push({
          source: bank.name,
          detail: `Poprawne twierdzenie jest FAŁSZEM: „${correct}"`,
        });
      }
      const wrongTruth = isNumericClaimTrue(wrong);
      if (wrongTruth === true) {
        issues.push({
          source: bank.name,
          detail: `Pułapka jest matematycznie PRAWDZIWA: „${wrong}"`,
        });
      }
    }
  }
}

auditMcTasks();
auditTrueFalseBanks();

console.log(`\n=== Audyt jakości pytań ===`);
console.log(`Zadań MC w katalogu: ${getAllTasks().filter((t) => t.choices?.length).length}`);
console.log(`Problemów: ${issues.length}\n`);

if (issues.length === 0) {
  console.log("✓ Brak wykrytych problemów.");
} else {
  for (const issue of issues) {
    console.log(`✗ [${issue.source}] ${issue.detail}`);
  }
  process.exit(1);
}
