import type { TaskCategory } from "@/lib/baza-zadan/types";
import type { ExamSheetKind } from "@/lib/baza-zadan/types";

/** Grupy działów na liście zadań - logiczna segregacja. */
export type TaskCategoryGroupId =
  | "podstawy"
  | "algebra-rownania"
  | "procenty-ciagi"
  | "liceum"
  | "egzamin-8"
  | "matura";

export type TaskCategoryGroup = {
  id: TaskCategoryGroupId;
  label: string;
  description: string;
  emoji: string;
  categories: readonly TaskCategory[];
};

export const TASK_CATEGORY_GROUPS: readonly TaskCategoryGroup[] = [
  {
    id: "podstawy",
    label: "Podstawy szkolne",
    description: "Arytmetyka, ułamki i geometria - fundament pod egzamin.",
    emoji: "📐",
    categories: ["arytmetyka", "ulamki", "geometria"],
  },
  {
    id: "algebra-rownania",
    label: "Algebra i równania",
    description: "Potęgi, pierwiastki, równania i algebra.",
    emoji: "𝑥",
    categories: ["algebra", "rownania", "potegi", "pierwiastki"],
  },
  {
    id: "procenty-ciagi",
    label: "Procenty i ciągi",
    description: "Procenty w zadaniach tekstowych i ciągi liczbowe.",
    emoji: "📊",
    categories: ["procenty", "ciagi"],
  },
  {
    id: "liceum",
    label: "Liceum i technikum",
    description: "Funkcje, logarytmy i trygonometria.",
    emoji: "📈",
    categories: ["funkcje", "logarytmy", "trygonometria"],
  },
  {
    id: "egzamin-8",
    label: "Egzamin 8-klasisty",
    description: "Zadania w stylu egzaminu - mieszane działy.",
    emoji: "📝",
    categories: ["egzamin-8"],
  },
  {
    id: "matura",
    label: "Matura",
    description: "Przygotowanie do matury podstawowej - tu dodamy arkusze CKE.",
    emoji: "🎓",
    categories: ["matura"],
  },
] as const;

export const CATEGORY_TO_GROUP: Record<TaskCategory, TaskCategoryGroupId> =
  Object.fromEntries(
    TASK_CATEGORY_GROUPS.flatMap((g) =>
      g.categories.map((c) => [c, g.id] as const),
    ),
  ) as Record<TaskCategory, TaskCategoryGroupId>;

export function getGroupForCategory(
  category: TaskCategory,
): TaskCategoryGroupId {
  return CATEGORY_TO_GROUP[category];
}

export const EXAM_SHEET_KIND_LABELS: Record<ExamSheetKind, string> = {
  trening: "Trening i podstawówka",
  "egzamin-8": "Egzamin 8-klasisty",
  matura: "Matura",
};

export const EXAM_SHEET_KIND_ORDER: readonly ExamSheetKind[] = [
  "trening",
  "egzamin-8",
  "matura",
];
