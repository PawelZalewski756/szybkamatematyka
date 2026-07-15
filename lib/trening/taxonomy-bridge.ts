import type { TaskCategory } from "@/lib/baza-zadan/types";
import type { DzialMatematyki } from "@/lib/baza-zadan/dzialy";
import type { ExamType } from "@/types/database";

/** Mapowanie działów CMS (14 kategorii bazy) → slug działu w treningu. */
export const BAZA_CATEGORY_TO_TRAINING_CATEGORY: Partial<
  Record<TaskCategory, string>
> = {
  arytmetyka: "liczby",
  ulamki: "liczby",
  procenty: "liczby",
  potegi: "liczby",
  pierwiastki: "liczby",
  algebra: "algebra",
  rownania: "algebra",
  geometria: "geometria",
  funkcje: "funkcje",
  logarytmy: "funkcje",
  ciagi: "funkcje",
  trygonometria: "funkcje",
  "egzamin-8": "liczby",
  matura: "algebra",
};

/** Mapowanie nazwy działu z arkusza CKE → slug kategorii treningu. */
export const CMS_DZIAL_TO_TRAINING_CATEGORY: Partial<
  Record<DzialMatematyki, string>
> = {
  Arytmetyka: "liczby",
  "Ułamki": "liczby",
  Procenty: "liczby",
  Potęgi: "liczby",
  Pierwiastki: "liczby",
  Algebra: "algebra",
  Równania: "algebra",
  Geometria: "geometria",
  Funkcje: "funkcje",
  Logarytmy: "funkcje",
  Ciągi: "funkcje",
  Trygonometria: "funkcje",
  Kombinatoryka: "algebra",
  Prawdopodobieństwo: "algebra",
  Statystyka: "liczby",
  Inne: "algebra",
};

/** Mapowanie działu CMS → kategoria katalogu zadań (TaskCategory). */
export const CMS_DZIAL_TO_BAZA_CATEGORY: Partial<
  Record<DzialMatematyki, TaskCategory>
> = {
  Arytmetyka: "arytmetyka",
  "Ułamki": "ulamki",
  Procenty: "procenty",
  Potęgi: "potegi",
  Pierwiastki: "pierwiastki",
  Algebra: "algebra",
  Równania: "rownania",
  Geometria: "geometria",
  Funkcje: "funkcje",
  Logarytmy: "logarytmy",
  Ciągi: "ciagi",
  Trygonometria: "trygonometria",
  Kombinatoryka: "algebra",
  Prawdopodobieństwo: "algebra",
  Statystyka: "arytmetyka",
  Inne: "matura",
};

export function trainingCategoryForBazaCategory(
  category: TaskCategory,
  examType: ExamType = "matura_podstawowa",
): string | null {
  if (category === "egzamin-8" || examType === "8_klasa") {
    return BAZA_CATEGORY_TO_TRAINING_CATEGORY[category] ?? "liczby";
  }
  return BAZA_CATEGORY_TO_TRAINING_CATEGORY[category] ?? null;
}

export function bazaCategoryForCmsDzial(dzial: string): TaskCategory {
  const mapped =
    CMS_DZIAL_TO_BAZA_CATEGORY[dzial as DzialMatematyki] ?? "matura";
  return mapped;
}

export function trainingCategoryForCmsDzial(
  dzial: string,
  examType: ExamType,
): string {
  if (examType === "8_klasa") {
    return CMS_DZIAL_TO_TRAINING_CATEGORY[dzial as DzialMatematyki] ?? "liczby";
  }
  return CMS_DZIAL_TO_TRAINING_CATEGORY[dzial as DzialMatematyki] ?? "algebra";
}
