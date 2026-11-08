import type { TaskCategory, TaskDifficulty } from "@/lib/baza-zadan/types";

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  arytmetyka: "Arytmetyka",
  ulamki: "Ułamki",
  procenty: "Procenty",
  algebra: "Algebra",
  geometria: "Geometria",
  potegi: "Potęgi",
  pierwiastki: "Pierwiastki",
  rownania: "Równania",
  funkcje: "Funkcje",
  logarytmy: "Logarytmy",
  ciagi: "Ciągi",
  trygonometria: "Trygonometria",
  "egzamin-8": "Egzamin 8-klasisty",
  matura: "Matura",
};

export const DIFFICULTY_LABELS: Record<TaskDifficulty, string> = {
  latwy: "Łatwy",
  sredni: "Średni",
  trudny: "Trudny",
};

export const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as TaskCategory[];

/** Kategorie w jednej grupie (bez egzamin/matura) - do szybkich filtrów. */
export const CORE_CATEGORIES = ALL_CATEGORIES.filter(
  (c) => c !== "egzamin-8" && c !== "matura",
) as TaskCategory[];
