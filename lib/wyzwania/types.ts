import type { QuestionTrack } from "@/lib/learning-path";

/** Pojedyncze pytanie dziennego wyzwania (oceń prawda/fałsz). */
export type ChallengeQuestion = {
  id: string;
  /** Twierdzenie/równanie pokazane graczowi. */
  claim: string;
  /** Czy pokazane twierdzenie jest poprawne. */
  isTrue: boolean;
};

/** Deterministyczny zestaw na dany dzień. */
export type DailyChallenge = {
  /** Data w formacie YYYY-MM-DD (lokalna). */
  date: string;
  track: QuestionTrack;
  questions: ChallengeQuestion[];
};

/** Wynik ukończenia (nagroda + seria). */
export type ChallengeReward = {
  xp: number;
  correct: number;
  total: number;
  /** Seria po zaliczeniu dzisiejszego wyzwania. */
  streak: number;
  /** Czy ukończenie podbiło poziom (tylko zalogowani). */
  leveledUp: boolean;
};

/** Lokalny zapis postępu (fallback bez Supabase / dla gości). */
export type ChallengeProgress = {
  lastCompletedDate: string | null;
  streak: number;
  bestStreak: number;
  totalCompleted: number;
  lastReward: ChallengeReward | null;
};
