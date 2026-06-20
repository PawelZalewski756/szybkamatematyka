import { BASE_POINTS } from "@/lib/minigry/game-constants";
import type {
  DuelOutcome,
  DuelQuestion,
  DuelResult,
} from "@/lib/pojedynki/duel-types";

/**
 * Punkty za poprawną odpowiedź przy danym combo — identyczna formuła jak w
 * minigrach (BASE_POINTS * combo), więc wyniki pojedynku są spójne z resztą
 * aplikacji.
 */
export function pointsForCombo(combo: number): number {
  return BASE_POINTS * combo;
}

/** Sprawdza odpowiedź gracza względem znormalizowanego pytania. */
export function isAnswerCorrect(
  question: DuelQuestion,
  answer: number | boolean | string,
): boolean {
  if (question.kind === "choice") return answer === question.q.correct;
  if (question.kind === "true-false") return answer === question.q.isCorrect;
  return answer === question.q.correct;
}

/**
 * Rozstrzyga pojedynek na podstawie dwóch wyników.
 * Kryteria (po kolei): więcej punktów → więcej poprawnych → krótszy czas.
 */
export function resolveDuel(me: DuelResult, opponent: DuelResult): DuelOutcome {
  if (me.score !== opponent.score) {
    return me.score > opponent.score ? "win" : "loss";
  }
  if (me.correct !== opponent.correct) {
    return me.correct > opponent.correct ? "win" : "loss";
  }
  if (me.durationMs !== opponent.durationMs) {
    return me.durationMs < opponent.durationMs ? "win" : "loss";
  }
  return "draw";
}

/** Formatuje czas trwania (ms) jako m:ss. */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Procent poprawnych odpowiedzi (0–100). */
export function accuracyPercent(result: DuelResult): number {
  if (result.total <= 0) return 0;
  return Math.round((result.correct / result.total) * 100);
}
