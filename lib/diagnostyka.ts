import { CATEGORY_LABELS } from "@/lib/baza-zadan/labels";
import type { Task, TaskCategory } from "@/lib/baza-zadan/types";
import type { LearningPath } from "@/lib/learning-path";

/** Jedno pytanie diagnozy - bez rozwiązania i bez pełnej treści odpowiedzi. */
export type DiagnosticTask = {
  id: string;
  category: TaskCategory;
  categoryLabel: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
};

export type DiagnosticCategoryScore = {
  category: TaskCategory;
  label: string;
  correct: number;
  total: number;
};

export type DiagnosticResult = {
  path: LearningPath;
  completedAt: string;
  total: number;
  correct: number;
  categories: DiagnosticCategoryScore[];
};

export const DIAGNOSTIC_STORAGE_KEY = "szybka-matma-diagnostic-result";

const CATEGORY_ORDER: TaskCategory[] = [
  "arytmetyka",
  "ulamki",
  "procenty",
  "potegi",
  "pierwiastki",
  "algebra",
  "rownania",
  "funkcje",
  "geometria",
  "ciagi",
  "trygonometria",
  "logarytmy",
];

const DIFFICULTY_RANK: Record<Task["difficulty"], number> = {
  latwy: 0,
  sredni: 1,
  trudny: 2,
};

function hasImage(value: string): boolean {
  return value.includes("![");
}

/**
 * Wybiera po jednym zadaniu z każdego działu (max 8). Celowo pomija zadania
 * trudne, obrazkowe i kategorie ogólne `matura`/`egzamin-8`, żeby diagnoza
 * była krótka i mierzalna.
 */
export function selectDiagnosticTasks(
  tasks: readonly Task[],
  limit = 8,
): DiagnosticTask[] {
  const byCategory = new Map<TaskCategory, Task[]>();

  for (const task of tasks) {
    if (task.choices.length < 2) continue;
    if (task.correctIndex < 0 || task.correctIndex >= task.choices.length) continue;
    if (task.difficulty === "trudny") continue;
    if (task.category === "matura" || task.category === "egzamin-8") continue;
    if (hasImage(task.prompt) || task.choices.some(hasImage)) continue;

    const list = byCategory.get(task.category) ?? [];
    list.push(task);
    byCategory.set(task.category, list);
  }

  const selected: DiagnosticTask[] = [];
  for (const category of CATEGORY_ORDER) {
    if (selected.length >= limit) break;
    const candidates = byCategory.get(category);
    if (!candidates || candidates.length === 0) continue;

    const task = [...candidates].sort(
      (a, b) =>
        DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty] ||
        a.title.localeCompare(b.title, "pl"),
    )[0]!;

    selected.push({
      id: task.id,
      category: task.category,
      categoryLabel: CATEGORY_LABELS[task.category],
      prompt: task.prompt,
      choices: [...task.choices],
      correctIndex: task.correctIndex,
    });
  }

  return selected;
}

export function buildDiagnosticResult(
  path: LearningPath,
  tasks: readonly DiagnosticTask[],
  answers: Readonly<Record<string, boolean>>,
  completedAt: Date = new Date(),
): DiagnosticResult {
  const categories = new Map<
    TaskCategory,
    { label: string; correct: number; total: number }
  >();
  let correct = 0;

  for (const task of tasks) {
    const isCorrect = answers[task.id] === true;
    if (isCorrect) correct += 1;
    const entry = categories.get(task.category) ?? {
      label: task.categoryLabel,
      correct: 0,
      total: 0,
    };
    entry.total += 1;
    if (isCorrect) entry.correct += 1;
    categories.set(task.category, entry);
  }

  return {
    path,
    completedAt: completedAt.toISOString(),
    total: tasks.length,
    correct,
    categories: [...categories.entries()].map(([category, value]) => ({
      category,
      ...value,
    })),
  };
}

export function saveDiagnosticResult(result: DiagnosticResult): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DIAGNOSTIC_STORAGE_KEY, JSON.stringify(result));
  } catch {
    /* ignore */
  }
}

export function loadDiagnosticResult(): DiagnosticResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DIAGNOSTIC_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DiagnosticResult;
    if (
      typeof parsed?.total !== "number" ||
      typeof parsed?.correct !== "number" ||
      !Array.isArray(parsed?.categories)
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
