import { getClientTaskById } from "@/lib/baza-zadan/client-catalog";
import type { Task } from "@/lib/baza-zadan/types";
import type {
  ReviewItem,
  ReviewTaskSnapshot,
} from "@/lib/powtorki/types";

export function snapshotFromCatalogTask(task: Task): ReviewTaskSnapshot | null {
  if (task.correctIndex === null) return null;
  return {
    id: task.id,
    title: task.title,
    category: task.category,
    difficulty:
      task.difficulty === "latwy"
        ? 1
        : task.difficulty === "sredni"
          ? 2
          : 3,
    prompt: task.prompt,
    choices: [...task.choices],
    correctIndex: task.correctIndex,
    correctAnswer: task.choices[task.correctIndex] ?? "",
    explanation: task.explanation,
    solutionSteps: task.solutionSteps ? [...task.solutionSteps] : undefined,
  };
}

export function resolveReviewTask(
  item: Pick<ReviewItem, "taskId" | "taskSnapshot">,
): ReviewTaskSnapshot | null {
  if (item.taskSnapshot) return item.taskSnapshot;
  const catalogTask = getClientTaskById(item.taskId);
  return catalogTask ? snapshotFromCatalogTask(catalogTask) : null;
}

