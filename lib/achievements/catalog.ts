/**
 * KATALOG osiągnięć — czyste predykaty wyliczane z PlayerStats.
 *
 * Ten moduł jest w pełni czysty (bez importów React/lucide ani localStorage),
 * dzięki czemu da się go w całości pokryć testami jednostkowymi
 * (tests/achievements.test.ts). Każda odznaka udostępnia funkcję `measure`,
 * która zwraca aktualną i docelową wartość metryki; odblokowanie i procent
 * postępu liczymy jednolicie w `evaluateAchievement`.
 */

import type {
  Achievement,
  AchievementCategory,
  AchievementProgress,
  AchievementStatus,
  AchievementTier,
  PlayerStats,
} from "@/lib/achievements/types";

/** Czytelne etykiety kategorii (PL) — używane do filtrów w UI. */
export const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  zadania: "Zadania",
  poziom: "Poziom",
  seria: "Seria",
  wyzwania: "Wyzwania",
  minigry: "Minigry",
  pojedynki: "Pojedynki",
  specjalne: "Specjalne",
};

/** Kolejność kategorii w UI (filtry / sekcje). */
export const CATEGORY_ORDER: AchievementCategory[] = [
  "zadania",
  "poziom",
  "seria",
  "wyzwania",
  "minigry",
  "pojedynki",
  "specjalne",
];

/** Etykiety poziomów rzadkości. */
export const TIER_LABELS: Record<AchievementTier, string> = {
  braz: "Brąz",
  srebro: "Srebro",
  zloto: "Złoto",
  platyna: "Platyna",
};

/** Pomocnik: odznaka progowa (metryka rośnie do progu). */
function threshold(
  get: (stats: PlayerStats) => number,
  target: number,
): (stats: PlayerStats) => AchievementProgress {
  return (stats) => ({ current: Math.max(0, get(stats)), target });
}

/** Pomocnik: odznaka typu „tak/nie" (flaga boolowska). */
function flag(
  get: (stats: PlayerStats) => boolean,
): (stats: PlayerStats) => AchievementProgress {
  return (stats) => ({ current: get(stats) ? 1 : 0, target: 1 });
}

/**
 * Pełny katalog odznak. Kolejność w obrębie kategorii — od najłatwiejszej do
 * najtrudniejszej. ID są stabilne (używane jako klucz w localStorage „seen").
 */
export const ACHIEVEMENTS: readonly Achievement[] = [
  // ---------------------------------------------------------------- Zadania
  {
    id: "first-task",
    title: "Pierwszy krok",
    description: "Rozwiąż swoje pierwsze zadanie.",
    unlockedHint: "Każdy mistrz kiedyś zaczynał od jednego zadania.",
    icon: "footprints",
    category: "zadania",
    tier: "braz",
    measure: threshold((s) => s.solvedCount, 1),
  },
  {
    id: "solved-10",
    title: "Rozgrzewka",
    description: "Rozwiąż 10 zadań.",
    icon: "target",
    category: "zadania",
    tier: "braz",
    measure: threshold((s) => s.solvedCount, 10),
  },
  {
    id: "solved-50",
    title: "Wytrwały",
    description: "Rozwiąż 50 zadań.",
    icon: "target",
    category: "zadania",
    tier: "srebro",
    measure: threshold((s) => s.solvedCount, 50),
  },
  {
    id: "solved-100",
    title: "Setka!",
    description: "Rozwiąż 100 zadań.",
    unlockedHint: "Trzycyfrowy klub rozwiązanych zadań.",
    icon: "medal",
    category: "zadania",
    tier: "zloto",
    measure: threshold((s) => s.solvedCount, 100),
  },
  {
    id: "solved-500",
    title: "Maszyna do liczenia",
    description: "Rozwiąż 500 zadań.",
    unlockedHint: "Liczby drżą na Twój widok.",
    icon: "brain",
    category: "zadania",
    tier: "platyna",
    measure: threshold((s) => s.solvedCount, 500),
  },

  // ----------------------------------------------------------------- Poziom
  {
    id: "level-5",
    title: "Adept",
    description: "Osiągnij 5. poziom konta.",
    icon: "star",
    category: "poziom",
    tier: "braz",
    measure: threshold((s) => s.level, 5),
  },
  {
    id: "level-10",
    title: "Wojownik wiedzy",
    description: "Osiągnij 10. poziom konta.",
    icon: "trophy",
    category: "poziom",
    tier: "srebro",
    measure: threshold((s) => s.level, 10),
  },
  {
    id: "level-25",
    title: "Mistrz matematyki",
    description: "Osiągnij 25. poziom konta.",
    unlockedHint: "Elita platformy.",
    icon: "crown",
    category: "poziom",
    tier: "zloto",
    measure: threshold((s) => s.level, 25),
  },
  {
    id: "xp-10000",
    title: "Kolekcjoner XP",
    description: "Zdobądź łącznie 10 000 XP.",
    icon: "gem",
    category: "poziom",
    tier: "zloto",
    measure: threshold((s) => s.xp, 10000),
  },

  // ------------------------------------------------------------------- Seria
  {
    id: "streak-3",
    title: "Rozpęd",
    description: "Utrzymaj serię 3 dni z grą.",
    icon: "flame",
    category: "seria",
    tier: "braz",
    measure: threshold((s) => s.streak, 3),
  },
  {
    id: "streak-7",
    title: "Tydzień ognia",
    description: "Utrzymaj serię 7 dni z grą.",
    icon: "flame",
    category: "seria",
    tier: "srebro",
    measure: threshold((s) => s.streak, 7),
  },
  {
    id: "streak-30",
    title: "Niezłomny",
    description: "Utrzymaj serię 30 dni z grą.",
    unlockedHint: "Miesiąc bez ani jednej przerwy.",
    icon: "flame",
    category: "seria",
    tier: "platyna",
    measure: threshold((s) => s.streak, 30),
  },

  // ---------------------------------------------------------------- Wyzwania
  {
    id: "challenge-1",
    title: "Pierwsze wyzwanie",
    description: "Ukończ pierwsze dzienne wyzwanie.",
    icon: "calendar",
    category: "wyzwania",
    tier: "braz",
    measure: threshold((s) => s.challengesCompleted, 1),
  },
  {
    id: "challenge-10",
    title: "Codzienny rytuał",
    description: "Ukończ 10 dziennych wyzwań.",
    icon: "calendar",
    category: "wyzwania",
    tier: "srebro",
    measure: threshold((s) => s.challengesCompleted, 10),
  },
  {
    id: "challenge-30",
    title: "Miesiąc wyzwań",
    description: "Ukończ 30 dziennych wyzwań.",
    unlockedHint: "Dzień w dzień, wyzwanie za wyzwaniem.",
    icon: "calendar",
    category: "wyzwania",
    tier: "zloto",
    measure: threshold((s) => s.challengesCompleted, 30),
  },
  {
    id: "challenge-streak-7",
    title: "Wyzwaniowy płomień",
    description: "Osiągnij serię 7 dni w dziennych wyzwaniach.",
    icon: "zap",
    category: "wyzwania",
    tier: "srebro",
    measure: threshold((s) => s.challengeBestStreak, 7),
  },

  // ----------------------------------------------------------------- Minigry
  {
    id: "minigry-500",
    title: "Gracz",
    description: "Zdobądź 500 XP w minigrach.",
    icon: "gamepad",
    category: "minigry",
    tier: "braz",
    measure: threshold((s) => s.minigryXp, 500),
  },
  {
    id: "minigry-2500",
    title: "Arcade as",
    description: "Zdobądź 2 500 XP w minigrach.",
    icon: "gamepad",
    category: "minigry",
    tier: "srebro",
    measure: threshold((s) => s.minigryXp, 2500),
  },
  {
    id: "minigry-level-10",
    title: "Mistrz minigier",
    description: "Osiągnij 10. poziom konta minigier.",
    unlockedHint: "Zręczność i głowa w jednym.",
    icon: "rocket",
    category: "minigry",
    tier: "zloto",
    measure: threshold((s) => s.minigryLevel, 10),
  },

  // --------------------------------------------------------------- Pojedynki
  {
    id: "duel-1",
    title: "Rzucam wyzwanie",
    description: "Utwórz swój pierwszy pojedynek.",
    icon: "swords",
    category: "pojedynki",
    tier: "braz",
    measure: threshold((s) => s.duelChallengesCreated, 1),
  },
  {
    id: "duel-5",
    title: "Pojedynkowicz",
    description: "Utwórz 5 pojedynków.",
    icon: "swords",
    category: "pojedynki",
    tier: "srebro",
    measure: threshold((s) => s.duelChallengesCreated, 5),
  },

  // --------------------------------------------------------------- Specjalne
  {
    id: "night-owl",
    title: "Nocny marek",
    description: "Odwiedź platformę między północą a 5:00.",
    unlockedHint: "Matematyka nie śpi.",
    icon: "moon",
    category: "specjalne",
    tier: "srebro",
    measure: flag((s) => s.nightOwl),
  },
  {
    id: "early-bird",
    title: "Ranny ptaszek",
    description: "Odwiedź platformę między 5:00 a 8:00.",
    icon: "sunrise",
    category: "specjalne",
    tier: "braz",
    measure: flag((s) => s.earlyBird),
  },
  {
    id: "weekend-warrior",
    title: "Weekendowy wojownik",
    description: "Ucz się w sobotę lub niedzielę.",
    icon: "sparkles",
    category: "specjalne",
    tier: "braz",
    measure: flag((s) => s.weekendWarrior),
  },
  {
    id: "review-master",
    title: "Praca nad błędami",
    description: "Zbierz 10 zadań w skrzynce powtórek.",
    unlockedHint: "Z błędów rodzi się mistrzostwo.",
    icon: "brain",
    category: "specjalne",
    tier: "srebro",
    measure: threshold((s) => s.reviewFlaggedCount, 10),
  },
  {
    id: "all-rounder",
    title: "Wszechstronny",
    description:
      "Rozwiąż zadanie, ukończ wyzwanie i zagraj w minigrę (po co najmniej jednym).",
    unlockedHint: "Mistrz każdego trybu gry.",
    icon: "award",
    category: "specjalne",
    tier: "zloto",
    measure: (s) => ({
      current: [
        s.solvedCount > 0,
        s.challengesCompleted > 0,
        s.minigryXp > 0,
      ].filter(Boolean).length,
      target: 3,
    }),
  },
];

/** Liczba osiągnięć w katalogu (wygodne dla UI / testów). */
export const ACHIEVEMENTS_TOTAL = ACHIEVEMENTS.length;

function clampPercent(current: number, target: number): number {
  if (target <= 0) return 100;
  return Math.max(0, Math.min(100, Math.round((current / target) * 100)));
}

/** Ewaluuje pojedynczą odznakę względem statystyk gracza. */
export function evaluateAchievement(
  achievement: Achievement,
  stats: PlayerStats,
): AchievementStatus {
  const { current, target } = achievement.measure(stats);
  const safeTarget = target > 0 ? target : 1;
  const cappedCurrent = Math.min(current, safeTarget);
  return {
    id: achievement.id,
    current: cappedCurrent,
    target: safeTarget,
    unlocked: current >= safeTarget,
    percent: clampPercent(current, safeTarget),
  };
}

/** Ewaluuje cały katalog. Kolejność zgodna z `ACHIEVEMENTS`. */
export function evaluateAll(stats: PlayerStats): AchievementStatus[] {
  return ACHIEVEMENTS.map((a) => evaluateAchievement(a, stats));
}

/** Zbiór ID odblokowanych odznak dla danych statystyk. */
export function unlockedIds(stats: PlayerStats): Set<string> {
  const ids = new Set<string>();
  for (const a of ACHIEVEMENTS) {
    if (evaluateAchievement(a, stats).unlocked) ids.add(a.id);
  }
  return ids;
}

/** Liczba odblokowanych odznak. */
export function unlockedCount(stats: PlayerStats): number {
  return unlockedIds(stats).size;
}

/** Wyszukuje odznakę po ID. */
export function findAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
