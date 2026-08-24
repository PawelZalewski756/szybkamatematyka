/**
 * Lekki katalog do Client Components.
 *
 * Celowo nie importuje 1,5 MB statycznego archiwum CKE. Oficjalne zadania CKE
 * są ładowane przez Server Components, natomiast klient dostaje tylko
 * statyczne i proceduralne zadania treningowe.
 */
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

let cachedTasks: Task[] | null = null;

export function getClientTasks(): Task[] {
  if (!cachedTasks) {
    cachedTasks = [
      ...STATIC_TASKS,
      ...STATIC_TASKS_EXTRA,
      ...generateProceduralTasks(),
    ];
  }
  return cachedTasks;
}

export function getClientTaskById(id: string): Task | undefined {
  return getClientTasks().find((task) => task.id === id);
}

export function getClientTasksForPath(
  path: LearningPath,
  filters: TaskFilters = {},
): Task[] {
  const { category = "all", difficulty = "all", search = "" } = filters;
  const query = search.trim().toLowerCase();

  return getClientTasks().filter((task) => {
    if (!matchesLearningPath(path, task.forPaths)) return false;
    if (category !== "all" && task.category !== category) return false;
    if (difficulty !== "all" && task.difficulty !== difficulty) return false;
    if (!query) return true;
    return `${task.title} ${task.prompt} ${task.category}`
      .toLowerCase()
      .includes(query);
  });
}

export function getClientRelatedTasks(
  task: Task,
  path: LearningPath,
  limit = 4,
): Task[] {
  return getClientTasksForPath(path, { category: task.category })
    .filter((candidate) => candidate.id !== task.id)
    .slice(0, limit);
}

export function getClientExamSheetsForPath(path: LearningPath): ExamSheet[] {
  return EXAM_SHEETS.filter((sheet) =>
    matchesLearningPath(path, sheet.forPaths),
  );
}

export function getClientExamSheetById(id: string): ExamSheet | undefined {
  return EXAM_SHEETS.find((sheet) => sheet.id === id);
}

export function getClientTaskStats(path: LearningPath) {
  return {
    totalTasks: getClientTasksForPath(path).length,
    totalSheets: getClientExamSheetsForPath(path).length,
    totalInDatabase: getClientTasks().length,
  };
}

export type ClientTaskGroupSection = {
  id: TaskCategoryGroupId;
  label: string;
  description: string;
  emoji: string;
  tasks: Task[];
};

export function getClientTasksGroupedBySection(
  path: LearningPath,
  filters: TaskFilters = {},
): ClientTaskGroupSection[] {
  const filtered = getClientTasksForPath(path, filters);
  return TASK_CATEGORY_GROUPS.map((group) => ({
    id: group.id,
    label: group.label,
    description: group.description,
    emoji: group.emoji,
    tasks: filtered.filter((task) =>
      (group.categories as readonly TaskCategory[]).includes(task.category),
    ),
  }))
    .filter((section) => section.tasks.length > 0)
    .sort((a, b) => a.label.localeCompare(b.label, "pl"));
}

export type ClientExamSheetGroup = {
  kind: ExamSheetKind;
  label: string;
  sheets: ExamSheet[];
};

function sheetOrder(title: string): number {
  return Number(title.match(/#(\d+)/)?.[1] ?? title.match(/(\d+)\s*$/)?.[1] ?? 0);
}

export function getClientExamSheetsGrouped(
  path: LearningPath,
): ClientExamSheetGroup[] {
  const sheets = getClientExamSheetsForPath(path);
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
      sheets: sheets
        .filter((sheet) => sheet.kind === kind)
        .sort((a, b) => sheetOrder(a.title) - sheetOrder(b.title)),
    }))
    .filter((group) => group.sheets.length > 0);
}

