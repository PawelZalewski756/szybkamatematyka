import type { Task, TaskForClient } from "@/lib/baza-zadan/types";

/**
 * Usuwa pełne rozwiązanie z zadania, które trafia do klienta.
 * `solutionSteps` jest treścią planu Pro i nie może być częścią RSC/bundla.
 */
export function toClientTask(task: Task): TaskForClient {
  return {
    id: task.id,
    title: task.title,
    category: task.category,
    difficulty: task.difficulty,
    forPaths: task.forPaths,
    prompt: task.prompt,
    choices: task.choices,
    correctIndex: task.correctIndex,
    explanation: task.explanation,
    hint: task.hint,
    examTags: task.examTags,
    examSource: task.examSource,
  };
}
