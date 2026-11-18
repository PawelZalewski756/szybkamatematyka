/**
 * Audyt przypisania zadań do działów/tematów oraz kompletności cache.
 *
 *   npx tsx scripts/auditTaskPlacement.ts
 *
 * Sprawdza:
 * - czy każdy plik cache wskazuje istniejący dział i temat w drzewie CKE,
 * - czy każdy temat z drzewa ma plik z co najmniej 10 zadaniami,
 * - czy opcje są 4, unikalne, a correct_answer jest wśród nich,
 * - czy w treści/opcjach/rozwiązaniu nie ma śmieci i zepsutych znaków,
 * - czy to samo zadanie nie jest przypisane do dwóch różnych tematów.
 */
import fs from "node:fs";
import path from "node:path";
import { CKE_EGZAMIN_8 } from "@/lib/trening/cke-egzamin-8";
import { CKE_MATURA_PODSTAWOWA } from "@/lib/trening/cke-matura-podstawowa";

type Task = {
  id?: string;
  content?: string;
  correct_answer?: string;
  options?: string[];
  explanation?: string;
  answer_type?: string;
  difficulty?: number;
};

type Bundle = {
  exam_type: string;
  category: string;
  topic: string;
  tasks?: Task[];
};

const TREES = [CKE_EGZAMIN_8, CKE_MATURA_PODSTAWOWA];
const ALLOWED = new Set<string>();
const LABELS = new Map<string, string>();

for (const tree of TREES) {
  for (const category of tree.categories) {
    for (const topic of category.topics) {
      const key = `${tree.examType}|${category.slug}|${topic.slug}`;
      ALLOWED.add(key);
      LABELS.set(key, `${category.name} / ${topic.name}`);
    }
  }
}


/** Pary tematów, w których to samo zadanie może legalnie wystąpić w obu. */
const ALLOWED_OVERLAPS = new Set([
  "geometria|wielokaty <-> geometria|wielokaty_foremne",
  "geometria_przestrzenna|bryly <-> geometria_przestrzenna|siatki_bryl",
  "obliczenia_praktyczne|czas_droga_predkosc <-> zadania_tekstowe|zadania_tekstowe",
]);

function overlapKey(a: string, b: string): string {
  const left = a.split("|").slice(1).join("|");
  const right = b.split("|").slice(1).join("|");
  const pair = [left, right].sort();
  return `${pair[0]} <-> ${pair[1]}`;
}

const issues: string[] = [];
const seenContent = new Map<string, string>();
const seenFiles = new Set<string>();
let totalTasks = 0;

function malformedMath(text: string): boolean {
  const math = text.match(/\$[^$]*\$/g) ?? [];
  return math.some((part) => /--|\+-|-\+|\+\+/.test(part));
}

function placeholder(text: string): boolean {
  return /\bundefined\b|\bNaN\b|\[object Object\]|^Odpowiedź \d+$/m.test(text);
}

for (const file of fs.readdirSync("data/tasks-cache")) {
  if (!file.endsWith(".json")) continue;
  const full = path.join("data/tasks-cache", file);
  let bundle: Bundle;
  try {
    bundle = JSON.parse(fs.readFileSync(full, "utf8")) as Bundle;
  } catch (error) {
    issues.push(`${file}: nieprawidłowy JSON (${String(error)})`);
    continue;
  }

  const key = `${bundle.exam_type}|${bundle.category}|${bundle.topic}`;
  seenFiles.add(key);

  if (!ALLOWED.has(key)) {
    issues.push(`${file}: dział/temat nie istnieje w drzewie CKE (${key})`);
  }

  if (bundle.category === undefined || bundle.topic === undefined) {
    issues.push(`${file}: brak category/topic`);
  }

  const tasks = bundle.tasks ?? [];
  if (tasks.length < 10) {
    issues.push(`${file}: tylko ${tasks.length} zadań (wymagane min. 10)`);
  }

  const inFile = new Set<string>();
  for (const task of tasks) {
    totalTasks += 1;
    const where = `${file} / ${task.id ?? "(bez id)"}`;
    const content = String(task.content ?? "");
    const explanation = String(task.explanation ?? "");
    const options = (task.options ?? []).map(String);
    const answer = String(task.correct_answer ?? "");

    if (!content.trim()) issues.push(`${where}: pusta treść`);
    if (!explanation.trim()) issues.push(`${where}: brak rozwiązania`);
    if (explanation.length < 40) {
      issues.push(`${where}: rozwiązanie za krótkie (${explanation.length} znaków)`);
    }
    if (/Podstaw dane z treści do właściwego wzoru/i.test(explanation)) {
      issues.push(`${where}: szablonowe rozwiązanie`);
    }
    if (placeholder(content) || placeholder(options.join(" ")) || placeholder(explanation)) {
      issues.push(`${where}: placeholder/NaN/undefined`);
    }
    if (malformedMath([content, answer, ...options, explanation].join("\n"))) {
      issues.push(`${where}: zepsute znaki w matematyce (--, +-, -+, ++)`);
    }
    if (task.answer_type === "choice") {
      if (options.length !== 4) {
        issues.push(`${where}: ${options.length} opcji (wymagane 4)`);
      }
      if (new Set(options).size !== options.length) {
        issues.push(`${where}: zduplikowane opcje`);
      }
      if (!options.includes(answer)) {
        issues.push(`${where}: correct_answer nie ma w opcjach`);
      }
    }

    const fingerprint = content
      .replace(/\s+/g, " ")
      .trim()
      .toLocaleLowerCase("pl-PL");
    const topicKey = `${bundle.exam_type}|${bundle.category}|${bundle.topic}`;
    if (fingerprint) {
      const previous = seenContent.get(fingerprint);
      // Ta sama treść w innym egzaminie (SP vs matura) jest OK - to ten sam
      // typ zadania na dwóch poziomach. Flagujemy dopiero duplikat w obrębie
      // jednego egzaminu, ale w różnych tematach.
      if (
        previous &&
        previous !== topicKey &&
        previous.split("|")[0] === bundle.exam_type &&
        !ALLOWED_OVERLAPS.has(overlapKey(previous, topicKey))
      ) {
        issues.push(
          `${where}: ta sama treść jest też w ${previous} (możliwe złe przypisanie)`,
        );
      } else if (!previous) {
        seenContent.set(fingerprint, topicKey);
      }
      if (inFile.has(fingerprint)) {
        issues.push(`${where}: duplikat treści w tym samym temacie`);
      }
      inFile.add(fingerprint);
    }
  }
}

for (const key of ALLOWED) {
  if (!seenFiles.has(key)) {
    issues.push(`Brak pliku cache dla ${key} (${LABELS.get(key) ?? ""})`);
  }
}

console.log("\n=== Audyt przypisania zadań ===\n");
console.log(`Tematy w drzewie CKE: ${ALLOWED.size}`);
console.log(`Tematy z plikiem cache: ${seenFiles.size}`);
console.log(`Zadania w cache: ${totalTasks}`);
console.log(`Problemy: ${issues.length}\n`);

for (const issue of issues.slice(0, 80)) {
  console.log(`✗ ${issue}`);
}
if (issues.length > 80) {
  console.log(`… i ${issues.length - 80} więcej`);
}

process.exit(issues.length > 0 ? 1 : 0);
