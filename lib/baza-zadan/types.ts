import type { PathMatcher } from "@/lib/learning-path";

export type TaskCategory =
  | "arytmetyka"
  | "ulamki"
  | "procenty"
  | "algebra"
  | "geometria"
  | "potegi"
  | "pierwiastki"
  | "rownania"
  | "funkcje"
  | "logarytmy"
  | "ciagi"
  | "trygonometria"
  | "egzamin-8"
  | "matura";

export type TaskDifficulty = "latwy" | "sredni" | "trudny";

/** Typ arkusza - segregacja w UI (matura = miejsce na przyszłe arkusze CKE). */
export type ExamSheetKind = "trening" | "egzamin-8" | "matura";

/** Źródło zadania egzaminacyjnego - do filtrowania i etykiet w UI. */
export type ExamSource = {
  kind: "egzamin-8" | "matura";
  /** Rok arkusza (np. 2024). */
  year: number;
  /** Np. „Zadanie 12” lub „12.1”. */
  taskNumber?: string;
  /** Opis sesji, np. „matura maj 2024”. */
  sessionLabel?: string;
};

export type Task = {
  id: string;
  title: string;
  category: TaskCategory;
  difficulty: TaskDifficulty;
  forPaths: readonly PathMatcher[];
  prompt: string;
  choices: readonly string[];
  correctIndex: number;
  /** Krótkie podsumowanie po odpowiedzi. */
  explanation: string;
  /** Rozwiązanie krok po kroku - dla arkuszy E8 / matury. */
  solutionSteps?: readonly string[];
  hint?: string;
  examTags?: readonly string[];
  examSource?: ExamSource;
};

export type ExamSheet = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  kind: ExamSheetKind;
  forPaths: readonly PathMatcher[];
  taskIds: readonly string[];
  timeMinutes: number;
  gradient: string;
};

export type TaskFilters = {
  category?: TaskCategory | "all";
  difficulty?: TaskDifficulty | "all";
  search?: string;
};
