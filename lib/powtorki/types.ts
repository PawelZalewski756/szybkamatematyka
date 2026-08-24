export type ReviewResult = "correct" | "wrong";

export type ReviewTaskSnapshot = {
  id: string;
  title: string;
  category: string;
  difficulty: 1 | 2 | 3;
  prompt: string;
  choices: string[];
  correctIndex: number | null;
  correctAnswer: string;
  explanation: string;
  solutionSteps?: string[];
  hint?: string;
  examLabel?: string;
};

/**
 * Stan harmonogramu pojedynczego zadania w systemie powtórek (SM-2 lite).
 * Czas trzymany jako epoch ms — łatwy do serializacji w localStorage.
 */
export type ReviewItem = {
  taskId: string;
  /** Liczba kolejnych poprawnych powtórek z rzędu. */
  repetitions: number;
  /** Bieżący interwał w dniach (po ostatniej poprawnej powtórce). */
  intervalDays: number;
  /** Współczynnik łatwości (easiness factor) z SM-2, min. 1.3. */
  easiness: number;
  /** Kiedy zadanie powinno wrócić do kolejki (epoch ms). */
  nextReviewAt: number;
  /** Wynik ostatniego podejścia. */
  lastResult: ReviewResult | null;
  /** Kiedy ostatnio powtarzane (epoch ms). */
  lastReviewedAt: number | null;
  /** Kiedy dodane do powtórek (epoch ms). */
  addedAt: number;
  /** Treść zadania spoza statycznego katalogu, np. z Supabase treningu. */
  taskSnapshot?: ReviewTaskSnapshot;
};

export type ReviewSchedule = Record<string, ReviewItem>;

/** Podsumowanie zakończonej sesji powtórek. */
export type ReviewSessionSummary = {
  total: number;
  correct: number;
  wrong: number;
};
