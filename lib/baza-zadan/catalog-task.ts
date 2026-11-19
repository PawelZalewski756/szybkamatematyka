import { examTaskPoints } from "@/lib/baza-zadan/cke/exam-points";
import type {
  Task,
  TaskCategory,
  TaskDifficulty,
} from "@/lib/baza-zadan/types";
import type { PathMatcher } from "@/lib/learning-path";

/**
 * Zadanie w wersji do listy katalogu (`/baza-zadan`).
 *
 * Lista nie potrzebuje odpowiedzi ani rozwiązań - te są treścią planu Pro.
 * Wcześniej strona wysyłała wszystkie 2261 zadań z `correctIndex`
 * i `explanation`, więc odpowiedzi dało się wyciągnąć z HTML-a.
 *
 * `points` jest liczone na serwerze, bo `examTaskPoints` potrzebuje treści
 * rozwiązania do odczytania punktacji z klucza CKE.
 */
export type CatalogTask = {
  id: string;
  title: string;
  /** Tytuł widoczny na karcie - dla zadań CKE sama treść zamiast nazwy arkusza. */
  displayTitle: string;
  category: TaskCategory;
  difficulty: TaskDifficulty;
  paths: readonly PathMatcher[];
  prompt: string;
  points: number;
  hasSolution: boolean;
  isExam: boolean;
  /** Np. „matura maj 2016” - żeby uczeń wiedział, skąd zadanie. */
  examLabel: string | null;
};

export function toCatalogTask(task: Task): CatalogTask {
  const examLabel = task.examSource
    ? [
        task.examSource.sessionLabel ?? String(task.examSource.year),
        task.examSource.taskNumber
          ? `zad. ${task.examSource.taskNumber}`
          : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : null;

  return {
    id: task.id,
    title: task.title,
    displayTitle: task.examSource ? task.prompt : task.title,
    category: task.category,
    difficulty: task.difficulty,
    paths: task.forPaths,
    prompt: task.prompt,
    points: examTaskPoints(task),
    hasSolution:
      task.explanation.trim().length > 0 ||
      (task.solutionSteps?.length ?? 0) > 0,
    isExam: Boolean(task.examSource),
    examLabel,
  };
}
