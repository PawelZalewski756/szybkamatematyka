/**
 * Generuje lib/baza-zadan/exams/cke-archive.generated.ts z cache JSON.
 *
 *   npm run seed:exam-archive
 */

import fs from "fs";
import path from "path";
import { inferDzialMatura } from "../lib/baza-zadan/cke/parse-matura-page";
import { parseSolutionSteps } from "../lib/baza-zadan/parse-solution-steps";
import { isSolutionPlaceholder } from "../lib/baza-zadan/solution-content";
import { bazaCategoryForCmsDzial } from "../lib/trening/taxonomy-bridge";
import type { Task, TaskDifficulty } from "../lib/baza-zadan/types";

const CACHE_DIR = path.resolve(process.cwd(), "data/cke-matura-cache");
const OUT_FILE = path.resolve(
  process.cwd(),
  "lib/baza-zadan/exams/cke-archive.generated.ts",
);

type CachedTask = {
  numer: number;
  dzial?: string;
  tresc: string;
  rozwiazanie: string;
};

type CachedSheet = {
  sessionId: string;
  nazwa: string;
  rok: number;
  miesiac: number;
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

function parseAbcd(tresc: string): {
  prompt: string;
  choices: string[];
  hasChoices: boolean;
} {
  const anchor = tresc.search(/\sA\)\s/);
  if (anchor < 0) {
    return {
      prompt: tresc.trim(),
      choices: ["Zadanie otwarte — patrz rozwiązanie"],
      hasChoices: false,
    };
  }

  const prompt = tresc.slice(0, anchor).trim();
  const optsText = tresc.slice(anchor).trim();
  const parts = optsText.split(/\s(?=[A-D]\)\s)/).filter(Boolean);
  const choices = parts
    .map((p) => p.replace(/^[A-D]\)\s*/, "").trim())
    .filter(Boolean);

  if (choices.length < 2) {
    return {
      prompt: tresc.trim(),
      choices: ["Zadanie otwarte — patrz rozwiązanie"],
      hasChoices: false,
    };
  }

  // Heurystyka dla zadań P/F: czasem CKE powoduje, że parser wycina
  // identyczne krótkie etykiety typu "prawda" / "fałsz" jako osobne opcje.
  // Żeby nie tworzyć niejednoznacznych odpowiedzi (i żeby audyt pytań nie
  // flagował duplikatów), rozróżniamy takie etykiety numerem wystąpienia.
  const picked = choices.slice(0, 4);
  const counts = new Map<string, number>();
  const disambiguated = picked.map((c) => {
    const trimmed = c.trim();
    const key = trimmed.toLowerCase();
    if (key !== "prawda" && key !== "fałsz") return c;
    const next = (counts.get(key) ?? 0) + 1;
    counts.set(key, next);
    return `${trimmed} (${next})`;
  });

  return { prompt, choices: disambiguated, hasChoices: true };
}

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

  const { prompt, choices, hasChoices } = parseAbcd(task.tresc);
  const dzial = task.dzial ?? inferDzialMatura(task.tresc, task.numer);
  const category = bazaCategoryForCmsDzial(dzial);
  const id = `cke-${sheet.sessionId}-z${String(task.numer).padStart(2, "0")}`;
  const parsed = parseSolutionSteps(task.rozwiazanie);
  const explanation =
    parsed.answer ??
    parsed.steps[parsed.steps.length - 1] ??
    task.rozwiazanie.slice(0, 280);

  return {
    id,
    title: `${sheet.nazwa} — zad. ${task.numer}`,
    category,
    difficulty: inferDifficulty(task.numer, hasChoices),
    forPaths: ["liceum", "technikum", "zawodowa"],
    prompt,
    choices: choices.length >= 2 ? choices : [choices[0] ?? "—"],
    correctIndex: 0,
    explanation,
    solutionSteps: parsed.steps.length > 0 ? parsed.steps : [task.rozwiazanie],
    examSource: {
      kind: "matura",
      year: sheet.rok,
      taskNumber: String(task.numer),
      sessionLabel: `matura ${monthLabel(sheet.miesiac)} ${sheet.rok}`,
    },
  };
}

function loadSheets(): CachedSheet[] {
  if (!fs.existsSync(CACHE_DIR)) {
    console.warn(`Brak katalogu ${CACHE_DIR}`);
    return [];
  }

  const files = fs
    .readdirSync(CACHE_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();

  const sheets: CachedSheet[] = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(CACHE_DIR, file), "utf8");
    const data = JSON.parse(raw) as CachedSheet;
    if (data.tasks?.length > 0) sheets.push(data);
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

  const header = `/** AUTO-GENERATED — npm run seed:exam-archive. Nie edytuj ręcznie. */\nimport type { Task } from "@/lib/baza-zadan/types";\nimport type { ExamArchiveSheetMeta } from "@/lib/baza-zadan/exams/archive-types";\n\n`;

  const body = `${header}export const EXAM_ARCHIVE_TASKS: Task[] = ${serializeTasks(tasks)} as Task[];\n\nexport const EXAM_ARCHIVE_SHEETS: ExamArchiveSheetMeta[] = ${serializeSheets(sheetMeta)} as ExamArchiveSheetMeta[];\n`;

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, body, "utf8");

  console.log(
    `✓ Wygenerowano ${tasks.length} zadań z ${sheetMeta.length} arkuszy → ${path.relative(process.cwd(), OUT_FILE)}`,
  );
}

main();
