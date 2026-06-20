import { getMinigameBySlug } from "@/lib/minigry/minigame-registry";
import type {
  ChoiceQuestion,
  CompareQuestion,
  TrueFalseQuestion,
} from "@/lib/minigry/questions/types";
import type { LearningPath } from "@/lib/learning-path";
import type { DuelConfig, DuelQuestion } from "@/lib/pojedynki/duel-types";
import { withSeededRandom } from "@/lib/pojedynki/duel-rng";

/**
 * Generuje deterministyczny zestaw pytań pojedynku, reużywając istniejący
 * silnik minigier (rejestr + generatory). Cały ciąg generowany jest w jednym
 * bloku `withSeededRandom`, więc te same parametry → identyczne pytania.
 */
export function generateDuelQuestions(config: DuelConfig): DuelQuestion[] {
  const def = getMinigameBySlug(config.slug);
  if (!def) return [];

  return withSeededRandom(config.seed, () => {
    const questions: DuelQuestion[] = [];
    for (let i = 0; i < config.questionCount; i += 1) {
      const raw = def.generate(config.path);
      if (def.mode === "choice") {
        questions.push({ kind: "choice", q: raw as ChoiceQuestion });
      } else if (def.mode === "true-false") {
        questions.push({ kind: "true-false", q: raw as TrueFalseQuestion });
      } else {
        questions.push({ kind: "compare", q: raw as CompareQuestion });
      }
    }
    return questions;
  });
}

/** Czy dany slug minigry nadaje się do pojedynku (istnieje w rejestrze). */
export function isDuelMinigame(slug: string): boolean {
  return getMinigameBySlug(slug) !== undefined;
}

/** Bezpieczny tytuł minigry (do nagłówków UI). */
export function duelMinigameTitle(slug: string): string {
  return getMinigameBySlug(slug)?.title ?? "Pojedynek";
}

/**
 * Deterministyczna „odpowiedź" duela/bota dla danego pytania na podstawie jego
 * trudności symulowanej przez prawdopodobieństwo poprawności. Używane, by
 * odtworzyć przebieg ducha bez przechowywania pełnej listy odpowiedzi.
 */
export function questionCorrectValue(
  question: DuelQuestion,
): number | boolean | string {
  if (question.kind === "choice") return question.q.correct;
  if (question.kind === "true-false") return question.q.isCorrect;
  return question.q.correct;
}

export type { LearningPath };
