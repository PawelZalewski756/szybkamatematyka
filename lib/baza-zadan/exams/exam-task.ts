import type { ExamSource, Task, TaskCategory, TaskDifficulty } from "@/lib/baza-zadan/types";
import type { PathMatcher } from "@/lib/learning-path";

type ExamTaskInput = {
  id: string;
  title: string;
  category: TaskCategory;
  difficulty?: TaskDifficulty;
  forPaths: readonly PathMatcher[];
  prompt: string;
  choices: readonly string[];
  correctIndex: number;
  explanation: string;
  solutionSteps: readonly string[];
  hint?: string;
  examSource: ExamSource;
};

/** Buduje zadanie egzaminacyjne z pełnym wyjaśnieniem krok po kroku. */
export function examTask(input: ExamTaskInput): Task {
  const tags =
    input.examSource.kind === "egzamin-8"
      ? (["egzamin-8-klasisty"] as const)
      : (["matura-podstawowa"] as const);

  return {
    difficulty: input.difficulty ?? "sredni",
    examTags: [...tags],
    ...input,
  };
}
