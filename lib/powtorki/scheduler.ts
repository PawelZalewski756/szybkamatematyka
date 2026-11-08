import type { ReviewItem } from "@/lib/powtorki/types";

/**
 * Lekki wariant algorytmu SM-2 (jak w Anki/SuperMemo).
 *
 * Odpowiedź jest binarna (poprawna / błędna), więc mapujemy ją na „jakość”:
 *   - poprawna  → q = 5
 *   - błędna    → q = 2  (poniżej progu 3 = reset powtórek)
 *
 * Po poprawnej odpowiedzi interwał rośnie: 1 dzień → 3 dni → interwał × EF.
 * Po błędnej - reset: zadanie wraca do kolejki po krótkim czasie (tego samego
 * dnia / w następnej sesji), a EF lekko maleje.
 */

export const MIN_EASINESS = 1.3;
export const DEFAULT_EASINESS = 2.5;
export const FIRST_INTERVAL_DAYS = 1;
export const SECOND_INTERVAL_DAYS = 3;
/** Po błędzie zadanie wraca po tym czasie (krótki interwał - ta sama sesja/dzień). */
export const WRONG_RETRY_MINUTES = 10;

const DAY_MS = 24 * 60 * 60 * 1000;

export function createReviewItem(
  taskId: string,
  now: number = Date.now(),
): ReviewItem {
  return {
    taskId,
    repetitions: 0,
    intervalDays: 0,
    easiness: DEFAULT_EASINESS,
    nextReviewAt: now,
    lastResult: null,
    lastReviewedAt: null,
    addedAt: now,
  };
}

function nextEasiness(current: number, quality: number): number {
  const updated =
    current + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  return Math.max(MIN_EASINESS, Number(updated.toFixed(4)));
}

/** Zwraca NOWY obiekt z zaktualizowanym harmonogramem po podejściu. */
export function gradeReviewItem(
  item: ReviewItem,
  correct: boolean,
  now: number = Date.now(),
): ReviewItem {
  const quality = correct ? 5 : 2;
  const easiness = nextEasiness(item.easiness, quality);

  if (!correct) {
    return {
      ...item,
      repetitions: 0,
      intervalDays: 0,
      easiness,
      lastResult: "wrong",
      lastReviewedAt: now,
      nextReviewAt: now + WRONG_RETRY_MINUTES * 60 * 1000,
    };
  }

  const repetitions = item.repetitions + 1;
  let intervalDays: number;
  if (repetitions === 1) {
    intervalDays = FIRST_INTERVAL_DAYS;
  } else if (repetitions === 2) {
    intervalDays = SECOND_INTERVAL_DAYS;
  } else {
    intervalDays = Math.max(1, Math.round(item.intervalDays * easiness));
  }

  return {
    ...item,
    repetitions,
    intervalDays,
    easiness,
    lastResult: "correct",
    lastReviewedAt: now,
    nextReviewAt: now + intervalDays * DAY_MS,
  };
}

export function isDue(item: ReviewItem, now: number = Date.now()): boolean {
  return item.nextReviewAt <= now;
}

/** Czytelny opis kolejnego terminu, np. „za 3 dni” / „dziś”. */
export function describeNextReview(
  item: ReviewItem,
  now: number = Date.now(),
): string {
  const diffMs = item.nextReviewAt - now;
  if (diffMs <= 0) return "dziś";
  const days = Math.round(diffMs / DAY_MS);
  if (days <= 0) {
    const minutes = Math.max(1, Math.round(diffMs / (60 * 1000)));
    if (minutes < 60) return `za ${minutes} min`;
    const hours = Math.round(minutes / 60);
    return `za ${hours} godz.`;
  }
  if (days === 1) return "jutro";
  return `za ${days} dni`;
}
