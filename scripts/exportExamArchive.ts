/**
 * Generuje lib/baza-zadan/exams/cke-archive.generated.ts z cache JSON.
 *
 *   npm run seed:exam-archive
 */

import fs from "fs";
import path from "path";
import { inferDzialMatura } from "../lib/baza-zadan/cke/parse-matura-page";
import { parseAbcd } from "../lib/baza-zadan/cke/parse-abcd";
import { formatCkeMathText } from "../lib/baza-zadan/cke/format-cke-math";
import { inferCorrectChoiceIndex } from "../lib/baza-zadan/cke/answer-key";
import { parseSolutionSteps } from "../lib/baza-zadan/parse-solution-steps";
import { isSolutionPlaceholder } from "../lib/baza-zadan/solution-content";
import { bazaCategoryForCmsDzial } from "../lib/trening/taxonomy-bridge";
import type { Task, TaskDifficulty } from "../lib/baza-zadan/types";

const CACHE_DIRS = [
  path.resolve(process.cwd(), "data/cke-matura-cache"),
  path.resolve(process.cwd(), "data/cke-e8-cache"),
];
const OUT_FILE = path.resolve(
  process.cwd(),
  "lib/baza-zadan/exams/cke-archive.generated.ts",
);

type CachedTask = {
  numer: number;
  dzial?: string;
  tresc: string;
  tekst?: string;
  rozwiazanie: string;
};

type CachedSheet = {
  sessionId: string;
  nazwa: string;
  rok: number;
  miesiac: number;
  typ?: "matura" | "egzamin-8";
  tasks: CachedTask[];
};

export type ExamArchiveSheetMeta = {
  id: string;
  sessionId: string;
  title: string;
  year: number;
  month: number;
  taskIds: string[];
};

function inferDifficulty(numer: number, hasChoices: boolean): TaskDifficulty {
  if (!hasChoices || numer >= 25) return "trudny";
  if (numer >= 15) return "sredni";
  return "latwy";
}

function monthLabel(month: number): string {
  const names: Record<number, string> = {
    5: "maj",
    6: "czerwiec",
    12: "grudzień",
    3: "marzec",
  };
  return names[month] ?? `miesiąc ${month}`;
}

function buildTask(sheet: CachedSheet, task: CachedTask): Task | null {
  if (isSolutionPlaceholder(task.rozwiazanie)) return null;

  const source = task.tekst ?? task.tresc;
  const { prompt, choices, hasChoices } = parseAbcd(source);
  const formattedPrompt = formatCkeMathText(prompt);
  const formattedChoices = choices.map((c) => formatCkeMathText(c));
  const dzial = task.dzial ?? inferDzialMatura(source, task.numer);
  const category = bazaCategoryForCmsDzial(dzial);
  const id = `cke-${sheet.sessionId}-z${String(task.numer).padStart(2, "0")}`;
  const parsed = parseSolutionSteps(task.rozwiazanie);
  const rawExplanation =
    parsed.answer ??
    parsed.steps[parsed.steps.length - 1] ??
    task.rozwiazanie.slice(0, 280);
  const explanation = formatCkeMathText(rawExplanation);
  const rawSteps =
    parsed.steps.length > 0 ? parsed.steps : [task.rozwiazanie];
  const solutionSteps = rawSteps.map((step) => formatCkeMathText(step));
  const correctIndex = hasChoices
    ? inferCorrectChoiceIndex(parsed.answer, formattedChoices)
    : null;
  const isOpen = !hasChoices || correctIndex === null;

  return {
    id,
    title: `${sheet.nazwa} - zad. ${task.numer}`,
    category,
    difficulty: inferDifficulty(task.numer, !isOpen),
    forPaths: ["liceum", "technikum", "zawodowa"],
    prompt: isOpen && hasChoices
      ? `${formattedPrompt}\n\nRozwiąż zadanie.`
      : formattedPrompt,
    choices: isOpen
      ? ["Zadanie otwarte - patrz rozwiązanie"]
      : formattedChoices,
    correctIndex: isOpen ? 0 : correctIndex,
    explanation,
    solutionSteps,
    examSource: {
      kind: sheet.typ ?? "matura",
      year: sheet.rok,
      taskNumber: String(task.numer),
      sessionLabel: `${sheet.typ === "egzamin-8" ? "egzamin ósmoklasisty" : /rozszerzon/i.test(sheet.nazwa) ? "matura rozszerzona" : "matura"} ${monthLabel(sheet.miesiac)} ${sheet.rok}`,
    },
  };
}

function loadSheets(): CachedSheet[] {
  const sheets: CachedSheet[] = [];
  for (const dir of CACHE_DIRS) {
    if (!fs.existsSync(dir)) continue;
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".json"))
      .sort();
    for (const file of files) {
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const data = JSON.parse(raw) as CachedSheet;
      if (data.tasks?.length > 0) sheets.push(data);
    }
  }
  return sheets;
}
function serializeTasks(tasks: Task[]): string {
  return JSON.stringify(tasks, null, 2);
}

function serializeSheets(sheets: ExamArchiveSheetMeta[]): string {
  return JSON.stringify(sheets, null, 2);
}

function main(): void {
  const sheets = loadSheets();
  const tasks: Task[] = [];
  const sheetMeta: ExamArchiveSheetMeta[] = [];

  for (const sheet of sheets) {
    const taskIds: string[] = [];
    for (const t of sheet.tasks) {
      const built = buildTask(sheet, t);
      if (!built) continue;
      tasks.push(built);
      taskIds.push(built.id);
    }
    if (taskIds.length > 0) {
      sheetMeta.push({
        id: `arkusz-${sheet.sessionId}`,
        sessionId: sheet.sessionId,
        title: sheet.nazwa,
        year: sheet.rok,
        month: sheet.miesiac,
        taskIds,
      });
    }
  }

  const header = `/** AUTO-GENERATED - npm run seed:exam-archive. Nie edytuj ręcznie. */\nimport type { Task } from "@/lib/baza-zadan/types";\nimport type { ExamArchiveSheetMeta } from "@/lib/baza-zadan/exams/archive-types";\n\n`;

  const body = `${header}export const EXAM_ARCHIVE_TASKS: Task[] = ${serializeTasks(tasks)} as Task[];\n\nexport const EXAM_ARCHIVE_SHEETS: ExamArchiveSheetMeta[] = ${serializeSheets(sheetMeta)} as ExamArchiveSheetMeta[];\n`;

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, body, "utf8");

  console.log(
    `✓ Wygenerowano ${tasks.length} zadań z ${sheetMeta.length} arkuszy → ${path.relative(process.cwd(), OUT_FILE)}`,
  );
}

main();
