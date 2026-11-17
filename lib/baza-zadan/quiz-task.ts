import type { Task } from "@/lib/baza-zadan/types";

/**
 * Zadanie arkusza treningowego w wersji dla gracza po stronie klienta.
 *
 * `correctIndex` zostaje celowo: bez niego nie da się sprawdzić odpowiedzi
 * natychmiast po kliknięciu (a to jest cały sens arkusza treningowego).
 * Wartością planu Pro jest natomiast **rozwiązanie krok po kroku**, więc
 * `explanation` i `solutionSteps` są usuwane i pobierane przez API dopiero
 * po potwierdzeniu subskrypcji.
 */
export type QuizTask = {
  id: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  hasSolution: boolean;
};

export function toQuizTask(task: Task): QuizTask {
  return {
    id: task.id,
    prompt: task.prompt,
    choices: [...task.choices],
    correctIndex: task.correctIndex,
    hasSolution:
      task.explanation.trim().length > 0 ||
      (task.solutionSteps?.length ?? 0) > 0,
  };
}
