/**
 * Audyt jakości zadań w data/tasks-cache/
 *   npm run audit:tasks-cache
 */
import {
  auditTaskQuality,
  inferAnswerFromExplanation,
} from "../lib/gemini/task-quality";
import {
  answersEquivalent,
  checkAnswerMatch,
  findEquivalentChoiceGroups,
  normalizeAnswer,
} from "../lib/math/answer-equiv";
import { fmtNum } from "../lib/trening/seed/rng";
import {
  findBrokenSignSequences,
  GENERIC_EXPLANATION_PREFIX,
  MIN_EXPLANATION_LENGTH,
} from "../lib/trening/seed/explain-task";
import { listAllCachedTasks } from "../lib/trening/seed/tasks-cache-utils";

async function main() {
  const tasks = listAllCachedTasks();
  const issues: Array<{ id: string; topic: string; detail: string }> = [];
  const fingerprints = new Map<string, string>();

  for (const task of tasks) {
    for (const detail of auditTaskQuality(task)) {
      issues.push({
        id: task.id,
        topic: `${task.category}/${task.topic}`,
        detail,
      });
    }

    const topic = `${task.exam_type}/${task.category}/${task.topic}`;

    // explanation nie może być szablonowa ani zbyt krótka
    const explanation = (task.explanation ?? "").trim();
    if (explanation.startsWith(GENERIC_EXPLANATION_PREFIX)) {
      issues.push({ id: task.id, topic, detail: "explanation: generic template" });
    }
    if (explanation.length < MIN_EXPLANATION_LENGTH) {
      issues.push({
        id: task.id,
        topic,
        detail: `explanation too short: ${explanation.length} chars`,
      });
    }

    // sklejone znaki wewnątrz $...$ w content/options/explanation
    const fields: Array<[string, string]> = [
      ["content", task.content],
      ...task.options.map(
        (option, index) => [`options[${index}]`, option] as [string, string],
      ),
      ["explanation", explanation],
    ];
    for (const [field, value] of fields) {
      const broken = findBrokenSignSequences(value);
      if (broken.length > 0) {
        issues.push({
          id: task.id,
          topic,
          detail: `broken signs in ${field}: ${[...new Set(broken)].join(" ")}`,
        });
      }
    }

    // opcje zadań zamkniętych: dokładnie 4 unikalne odpowiedzi
    if (task.answer_type === "choice") {
      if (task.options.length !== 4) {
        issues.push({
          id: task.id,
          topic,
          detail: `mc: expected 4 options, got ${task.options.length}`,
        });
      }
      const unique = new Set(task.options.map((option) => normalizeAnswer(option)));
      if (unique.size !== task.options.length) {
        issues.push({
          id: task.id,
          topic,
          detail: `mc: duplicate options (${unique.size} unique of ${task.options.length})`,
        });
      }
      if (!task.options.some((option) => checkAnswerMatch(option, task.correct_answer))) {
        issues.push({
          id: task.id,
          topic,
          detail: "mc: correct_answer missing from options",
        });
      }
    }

    const fingerprint = task.content
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .normalize("NFKC")
      .replace(/\s+/g, " ")
      .trim()
      .toLocaleLowerCase("pl-PL");
    const fingerprintKey = `${task.exam_type}:${task.category}:${task.topic}:${fingerprint}`;
    const previous = fingerprints.get(fingerprintKey);
    if (previous) {
      issues.push({
        id: task.id,
        topic,
        detail: `duplicate content: same as ${previous}`,
      });
    } else {
      fingerprints.set(fingerprintKey, task.id);
    }

    if (/[\u200B-\u200D\uFEFF]/u.test(task.content)) {
      issues.push({ id: task.id, topic, detail: "hidden Unicode marker in content" });
    }

    const equivalentGroups = findEquivalentChoiceGroups(task.options);
    if (equivalentGroups.length > 0) {
      issues.push({
        id: task.id,
        topic,
        detail: `mc: equivalent options (${equivalentGroups
          .map((group) => group.map((index) => index + 1).join("="))
          .join(", ")})`,
      });
    }

    auditSemanticAnswer(task.content, task.correct_answer, task.id, topic, issues);
  }

  console.log("\n=== Audyt tasks-cache ===\n");
  console.log(`Zadań: ${tasks.length}`);
  console.log(`Problemów: ${issues.length}\n`);

  const mismatches = issues.filter((i) => i.detail.includes("mismatch"));
  const broken = issues.filter((i) => i.detail.includes("broken explanation"));
  const mcBad = issues.filter((i) => i.detail.includes("not in options"));
  const duplicates = issues.filter((i) => i.detail.includes("duplicate content"));
  const equivalent = issues.filter((i) => i.detail.includes("equivalent options"));
  const generic = issues.filter((i) => i.detail.includes("generic template"));
  const tooShort = issues.filter((i) => i.detail.includes("explanation too short"));
  const brokenSigns = issues.filter((i) => i.detail.includes("broken signs"));
  const badOptions = issues.filter(
    (i) =>
      i.detail.includes("expected 4 options") ||
      i.detail.includes("duplicate options") ||
      i.detail.includes("correct_answer missing"),
  );

  console.log(`  open mismatch (explanation ≠ correct_answer): ${mismatches.length}`);
  console.log(`  MC correct not in options: ${mcBad.length}`);
  console.log(`  broken explanation: ${broken.length}`);
  console.log(`  duplicate content: ${duplicates.length}`);
  console.log(`  equivalent MC options: ${equivalent.length}`);
  console.log(`  generic explanation template: ${generic.length}`);
  console.log(`  explanation shorter than ${MIN_EXPLANATION_LENGTH} chars: ${tooShort.length}`);
  console.log(`  broken sign sequences in $...$: ${brokenSigns.length}`);
  console.log(`  MC options shape/correctness: ${badOptions.length}\n`);

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

function auditSemanticAnswer(
  content: string,
  answer: string,
  id: string,
  topic: string,
  issues: Array<{ id: string; topic: string; detail: string }>,
): void {
  const add = (detail: string) => issues.push({ id, topic, detail });

  const priceIncrease = content.match(
    /Cena\s+(\d+(?:[.,]\d+)?)\s*zł podwyższona o\s+(\d+(?:[.,]\d+)?)%/i,
  );
  if (priceIncrease) {
    const price = Number(priceIncrease[1]!.replace(",", "."));
    const percent = Number(priceIncrease[2]!.replace(",", "."));
    const expected = price * (1 + percent / 100);
    if (!answersEquivalent(answer, fmtNum(expected))) {
      add(`semantic mismatch: price increase should be ${fmtNum(expected)}`);
    }
  }

  const sphere = content.match(
    /Objętość kuli o promieniu\s+(\d+).*3[,.]14/i,
  );
  if (sphere) {
    const radius = Number(sphere[1]);
    const expected = Math.round((4 / 3) * 3.14 * radius ** 3);
    if (!answersEquivalent(answer, String(expected))) {
      add(`semantic mismatch: sphere volume should be ${expected}`);
    }
  }

  const circle = content.match(
    /(Pole|Obwód) koła.*?r[=]\s*(\d+).*3[,.]14/i,
  );
  if (circle) {
    const radius = Number(circle[2]);
    const expected =
      circle[1]!.toLowerCase() === "pole"
        ? Math.round(3.14 * radius ** 2)
        : Math.round(2 * 3.14 * radius);
    if (!answersEquivalent(answer, String(expected))) {
      add(`semantic mismatch: circle result should be ${expected}`);
    }
  }

  const percentage = content.match(
    /(\d+(?:[.,]\d+)?)%\s+z\s+(\d+(?:[.,]\d+)?)(?:\s+uczniów)?/i,
  );
  if (percentage) {
    const percent = Number(percentage[1]!.replace(",", "."));
    const total = Number(percentage[2]!.replace(",", "."));
    const expected = (percent * total) / 100;
    if (!answersEquivalent(answer, fmtNum(expected))) {
      add(`semantic mismatch: percentage result should be ${fmtNum(expected)}`);
    }
  }
}
