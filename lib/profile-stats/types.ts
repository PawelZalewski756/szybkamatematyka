import type { DuelStats } from "@/lib/supabase/duel-results";

/** Punkt na wykresie aktywności (jeden dzień). */
export type ActivityPoint = {
  date: string;
  /** Czy gracz był aktywny tego dnia (trening, wyzwanie, minigra itd.). */
  active: boolean;
  /** Skrócona etykieta osi X (np. „pn.", „29.05"). */
  label: string;
};

/** Migawka statystyk wyświetlanych w sekcji profilu. */
export type ProfileStatsSnapshot = {
  solvedCount: number;
  xp: number;
  level: number;
  streak: number;
  challengesCompleted: number;
  duelStats: DuelStats;
  achievementsUnlocked: number;
  achievementsTotal: number;
  /** Postęp XP w bieżącym poziomie (0–500). */
  currentLevelXp: number;
  xpForNextLevel: number;
  activity7: ActivityPoint[];
  activity14: ActivityPoint[];
  /** Czy mamy jakąkolwiek historię aktywności (localStorage lub last_played). */
  hasActivityHistory: boolean;
};
