import { EXAM_ARCHIVE_TASKS } from "@/lib/baza-zadan/exams";
import { EXAM_SHEETS } from "@/lib/baza-zadan/exam-sheets";
import { generateProceduralTasks } from "@/lib/baza-zadan/procedural-tasks";
import {
  TASK_CATEGORY_GROUPS,
  type TaskCategoryGroupId,
} from "@/lib/baza-zadan/sections";
import { STATIC_TASKS } from "@/lib/baza-zadan/static-tasks";
import { STATIC_TASKS_EXTRA } from "@/lib/baza-zadan/static-tasks-extra";
import type {
  ExamSheet,
  ExamSheetKind,
  Task,
  TaskCategory,
  TaskFilters,
} from "@/lib/baza-zadan/types";
import {
  matchesLearningPath,
  type LearningPath,
} from "@/lib/learning-path";

let cachedAllTasks: Task[] | null = null;

export function getAllTasks(): Task[] {
  if (!cachedAllTasks) {
    cachedAllTasks = [
      ...STATIC_TASKS,
      ...STATIC_TASKS_EXTRA,
      ...EXAM_ARCHIVE_TASKS,
      ...generateProceduralTasks(),
    ];
  }
  return cachedAllTasks;
}

export function getTaskById(id: string): Task | undefined {
  return getAllTasks().find((t) => t.id === id);
}

/**
 * ID-y zadań prerenderowanych statycznie w trakcie buildu (rdzeń bazy: zadania
 * statyczne `st-*` oraz egzaminacyjne). Zadania proceduralne (`proc-*`) są
 * renderowane on-demand przy pierwszym wejściu - to mocno ogranicza liczbę
 * stron generowanych w buildzie bez psucia żadnego URL-a.
 */
export function getPrerenderTaskIds(): string[] {
  return [
    ...STATIC_TASKS,
    ...STATIC_TASKS_EXTRA,
    ...EXAM_ARCHIVE_TASKS,
  ].map((task) => task.id);
}

export function getTasksForPath(
  path: LearningPath,
  filters: TaskFilters = {},
): Task[] {
  const { category = "all", difficulty = "all", search = "" } = filters;
  const q = search.trim().toLowerCase();

  return getAllTasks().filter((task) => {
    if (!matchesLearningPath(path, task.forPaths)) return false;
    if (category !== "all" && task.category !== category) return false;
    if (difficulty !== "all" && task.difficulty !== difficulty) return false;
    if (!q) return true;
    const haystack =
      `${task.title} ${task.prompt} ${task.category}`.toLowerCase();
    return haystack.includes(q);
  });
}

export function getExamSheetsForPath(path: LearningPath): ExamSheet[] {
  return EXAM_SHEETS.filter((sheet) =>
    matchesLearningPath(path, sheet.forPaths),
  );
}

export function getExamSheetById(id: string): ExamSheet | undefined {
  return EXAM_SHEETS.find((s) => s.id === id);
}

export function getTaskStats(path: LearningPath) {
  const tasks = getTasksForPath(path);
  const sheets = getExamSheetsForPath(path);
  return {
    totalTasks: tasks.length,
    totalSheets: sheets.length,
    totalInDatabase: getAllTasks().length,
  };
}

export function getRelatedTasks(task: Task, path: LearningPath, limit = 4) {
  return getTasksForPath(path, { category: task.category })
    .filter((t) => t.id !== task.id)
    .slice(0, limit);
}

export type TaskGroupSection = {
  id: TaskCategoryGroupId;
  label: string;
  description: string;
  emoji: string;
  tasks: Task[];
};

/** Zadania pogrupowane po działach - do segregowanej listy. */
export function getTasksGroupedBySection(
  path: LearningPath,
  filters: TaskFilters = {},
): TaskGroupSection[] {
  const filtered = getTasksForPath(path, filters);

  return TASK_CATEGORY_GROUPS.map((group) => ({
    id: group.id,
    label: group.label,
    description: group.description,
    emoji: group.emoji,
    tasks: filtered.filter((t) =>
      (group.categories as readonly TaskCategory[]).includes(t.category),
    ),
  })).filter((s) => s.tasks.length > 0)
    .sort((a, b) => a.label.localeCompare(b.label, "pl"));
}

export function getCategoryCountsForPath(path: LearningPath) {
  const tasks = getTasksForPath(path);
  const counts = {} as Record<TaskCategory, number>;
  for (const task of tasks) {
    counts[task.category] = (counts[task.category] ?? 0) + 1;
  }
  return counts;
}

export type ExamSheetGroup = {
  kind: ExamSheetKind;
  label: string;
  sheets: ExamSheet[];
};

/** Numer arkusza z tytułu (np. „#2”) - nie sortuj alfabetycznie po nazwie. */
function examSheetOrderKey(title: string): number {
  const hash = title.match(/#(\d+)/);
  if (hash) return Number(hash[1]);
  const trailing = title.match(/(\d+)\s*$/);
  if (trailing) return Number(trailing[1]);
  return 0;
}

function sortExamSheetsByNumber(sheets: ExamSheet[]): ExamSheet[] {
  return [...sheets].sort((a, b) => {
    const na = examSheetOrderKey(a.title);
    const nb = examSheetOrderKey(b.title);
    if (na !== nb) return na - nb;
    return a.title.localeCompare(b.title, "pl");
  });
}

export function getExamSheetsGrouped(path: LearningPath): ExamSheetGroup[] {
  const sheets = getExamSheetsForPath(path);
  const kinds: ExamSheetKind[] = ["trening", "egzamin-8", "matura"];
  const labels: Record<ExamSheetKind, string> = {
    trening: "Trening i podstawówka",
    "egzamin-8": "Egzamin 8-klasisty",
    matura: "Arkusze maturalne (trening)",
  };

  return kinds
    .map((kind) => ({
      kind,
      label: labels[kind],
      sheets: sortExamSheetsByNumber(sheets.filter((s) => s.kind === kind)),
    }))
    .filter((g) => g.sheets.length > 0);
}
