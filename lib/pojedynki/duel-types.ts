import type { LearningPath } from "@/lib/learning-path";
import type {
  ChoiceQuestion,
  CompareQuestion,
  TrueFalseQuestion,
} from "@/lib/minigry/questions/types";

/**
 * Znormalizowane pytanie pojedynku. Reużywa istniejące typy pytań minigier
 * (choice / true-false / compare), opakowując je dyskryminatorem `kind`,
 * dzięki czemu jeden komponent areny obsługuje wszystkie minigry.
 */
export type DuelQuestion =
  | { kind: "choice"; q: ChoiceQuestion }
  | { kind: "true-false"; q: TrueFalseQuestion }
  | { kind: "compare"; q: CompareQuestion };

/**
 * Deterministyczna konfiguracja pojedynku. Ten sam `seed` + `slug` + `path`
 * + `questionCount` gwarantuje identyczny zestaw pytań u obu graczy.
 */
export type DuelConfig = {
  slug: string;
  path: LearningPath;
  questionCount: number;
  seed: number;
};

/** Wynik jednego gracza po ukończeniu pojedynku. */
export type DuelResult = {
  /** Punkty (BASE_POINTS * combo, jak w minigrach). */
  score: number;
  /** Liczba poprawnych odpowiedzi. */
  correct: number;
  /** Łączna liczba pytań. */
  total: number;
  /** Czas ukończenia w milisekundach (tie-break). */
  durationMs: number;
};

/** Postęp gracza w trakcie rozgrywki (do podglądu rywala na żywo). */
export type DuelProgress = {
  answered: number;
  correct: number;
  score: number;
  finished: boolean;
};

/** Etykieta strony pojedynku. */
export type DuelSide = "me" | "opponent";

/** Rozstrzygnięcie pojedynku. */
export type DuelOutcome = "win" | "loss" | "draw";

/** Tryb realizacji pojedynku wybrany przez gracza. */
export type DuelDeliveryMode = "online" | "challenge" | "local" | "bot";

/** Lekki profil rywala wyświetlany w UI. */
export type DuelOpponentInfo = {
  name: string;
  /** Czy to bot/duch (offline), czy realny gracz online. */
  kind: "human" | "bot" | "ghost";
};
