const STORAGE_PREFIX = "szybka-matma-solved-tasks";

export const SOLVED_TASKS_UPDATED_EVENT = "szybka-matma-solved-tasks-updated";

export type SolvedTasksUpdatedDetail = {
  solvedIds: readonly string[];
};

function storageKey(userId: string | null): string {
  return userId ? `${STORAGE_PREFIX}:${userId}` : `${STORAGE_PREFIX}:guest`;
}

export function loadSolvedTaskIds(userId: string | null = null): Set<string> {
  if (typeof window === "undefined") return new Set();

  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

function persistSolved(ids: Set<string>, userId: string | null): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(userId), JSON.stringify([...ids]));
}

export function markTaskSolved(
  taskId: string,
  userId: string | null = null,
): Set<string> {
  const ids = loadSolvedTaskIds(userId);
  if (!ids.has(taskId)) {
    ids.add(taskId);
    persistSolved(ids, userId);
    notifySolvedTasksUpdated(ids);
  }
  return ids;
}

export function notifySolvedTasksUpdated(ids: Set<string>): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<SolvedTasksUpdatedDetail>(SOLVED_TASKS_UPDATED_EVENT, {
      detail: { solvedIds: [...ids] },
    }),
  );
}

export function isTaskSolved(
  taskId: string,
  solvedIds: ReadonlySet<string>,
): boolean {
  return solvedIds.has(taskId);
}

/* -------------------------------------------------------------------------- */
/*  Powtórki (spaced repetition) — additywna „skrzynka” zadań do powtórki.    */
/*  Niezależne od API rozwiązanych zadań powyżej — nic nie nadpisuje.         */
/*  Tu trafiają zadania oznaczone jako błędne / do powtórki (np. z solvera).  */
/*  Provider powtórek (components/powtorki) zaciąga te ID do harmonogramu.    */
/* -------------------------------------------------------------------------- */

const REVIEW_FLAG_PREFIX = "szybka-matma-review-flags";

export const REVIEW_FLAGS_UPDATED_EVENT = "szybka-matma-review-flags-updated";

export type ReviewFlagsUpdatedDetail = {
  flaggedIds: readonly string[];
};

function reviewFlagKey(userId: string | null): string {
  return userId
    ? `${REVIEW_FLAG_PREFIX}:${userId}`
    : `${REVIEW_FLAG_PREFIX}:guest`;
}

export function loadReviewFlaggedIds(
  userId: string | null = null,
): Set<string> {
  if (typeof window === "undefined") return new Set();

  try {
    const raw = localStorage.getItem(reviewFlagKey(userId));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

function persistReviewFlags(ids: Set<string>, userId: string | null): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(reviewFlagKey(userId), JSON.stringify([...ids]));
}

function notifyReviewFlagsUpdated(ids: Set<string>): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<ReviewFlagsUpdatedDetail>(REVIEW_FLAGS_UPDATED_EVENT, {
      detail: { flaggedIds: [...ids] },
    }),
  );
}

/** Oznacz zadanie jako „do powtórki” (np. po błędnej odpowiedzi). */
export function flagTaskForReview(
  taskId: string,
  userId: string | null = null,
): Set<string> {
  const ids = loadReviewFlaggedIds(userId);
  if (!ids.has(taskId)) {
    ids.add(taskId);
    persistReviewFlags(ids, userId);
    notifyReviewFlagsUpdated(ids);
  }
  return ids;
}

/** Usuń znacznik po zaciągnięciu zadania do harmonogramu powtórek. */
export function clearReviewFlag(
  taskId: string,
  userId: string | null = null,
): Set<string> {
  const ids = loadReviewFlaggedIds(userId);
  if (ids.has(taskId)) {
    ids.delete(taskId);
    persistReviewFlags(ids, userId);
    notifyReviewFlagsUpdated(ids);
  }
  return ids;
}

/**
 * Zapisz wynik podejścia do zadania. Błędna odpowiedź oznacza zadanie do
 * powtórki. Bezpieczny, additywny punkt integracji dla istniejących solverów.
 */
export function recordTaskResult(
  taskId: string,
  isCorrect: boolean,
  userId: string | null = null,
): void {
  if (!isCorrect) {
    flagTaskForReview(taskId, userId);
  }
}
