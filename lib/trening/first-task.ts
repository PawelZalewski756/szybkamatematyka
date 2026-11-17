import type { LearningPath } from "@/lib/learning-path";

/**
 * Pierwsze zadanie dla nowego użytkownika.
 *
 * Wybrane ręcznie: łatwe, z sensownym wyjaśnieniem i bez potrzeby przechodzenia
 * przez drzewo tematów. Celem jest jedna akcja „rozwiąż coś” zaraz po
 * zalogowaniu - wcześniej trzeba było wybrać egzamin, dział, temat i dopiero
 * zakładkę „Zadania”.
 *
 * Test `tests/first-task.test.ts` pilnuje, że ID istnieją, są łatwe i mają
 * rozwiązanie.
 */
export const FIRST_TASK_BY_PATH: Record<LearningPath, string> = {
  sp: "st-020",
  srednia: "st-080",
};

export function firstTaskHref(path: LearningPath): string {
  return `/baza-zadan/${FIRST_TASK_BY_PATH[path]}`;
}
