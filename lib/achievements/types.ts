/**
 * Typy systemu osiągnięć / odznak. Osiągnięcia są WYLICZANE z istniejących
 * statystyk gracza (PlayerStats) — bez nowej tabeli Supabase i bez migracji.
 * Stan „świeżo odblokowane / zobaczone" trzymany jest wyłącznie w localStorage.
 */

/** Kategorie tematyczne odznak (do filtrowania w UI). */
export type AchievementCategory =
  | "zadania"
  | "poziom"
  | "seria"
  | "wyzwania"
  | "minigry"
  | "pojedynki"
  | "specjalne";

/** Poziom „rzadkości" odznaki (kolorystyka w UI). */
export type AchievementTier = "braz" | "srebro" | "zloto" | "platyna";

/**
 * Klucz ikony (lucide). Trzymamy string zamiast komponentu, aby moduł katalogu
 * pozostał w 100% czysty i lekki do testów (bez importu React/lucide).
 * Mapowanie klucz → komponent żyje w warstwie UI.
 */
export type AchievementIcon =
  | "footprints"
  | "flame"
  | "target"
  | "trophy"
  | "medal"
  | "crown"
  | "star"
  | "sparkles"
  | "swords"
  | "gamepad"
  | "calendar"
  | "zap"
  | "moon"
  | "sunrise"
  | "rocket"
  | "brain"
  | "gem"
  | "award";

/**
 * Migawka statystyk gracza, z której wyliczane są wszystkie osiągnięcia.
 * Wszystkie pola pochodzą z już istniejących źródeł (profil Supabase,
 * localStorage rozwiązanych zadań / wyzwań / pojedynków, czas wizyty).
 */
export type PlayerStats = {
  /** Łączne XP konta (profiles.xp). */
  xp: number;
  /** Poziom konta (wyliczany z xp). */
  level: number;
  /** Seria dni aktywności (profiles.streak). */
  streak: number;
  /** XP zdobyte w minigrach (profiles.minigry_xp). */
  minigryXp: number;
  /** Poziom „minigrowy" (wyliczany z minigryXp tą samą krzywą). */
  minigryLevel: number;
  /** Liczba unikalnych rozwiązanych zadań (localStorage). */
  solvedCount: number;
  /** Liczba zadań oznaczonych do powtórki (localStorage). */
  reviewFlaggedCount: number;
  /** Łączna liczba ukończonych dziennych wyzwań (localStorage). */
  challengesCompleted: number;
  /** Najlepsza seria dziennych wyzwań (localStorage). */
  challengeBestStreak: number;
  /** Liczba utworzonych wyzwań pojedynkowych (localStorage). */
  duelChallengesCreated: number;
  /** Czy gracz odwiedził platformę nocą (00:00–04:59). */
  nightOwl: boolean;
  /** Czy gracz odwiedził platformę wcześnie rano (05:00–07:59). */
  earlyBird: boolean;
  /** Czy gracz odwiedził platformę w weekend (sobota/niedziela). */
  weekendWarrior: boolean;
};

/** Postęp pojedynczej odznaki względem celu. */
export type AchievementProgress = {
  /** Aktualna wartość metryki. */
  current: number;
  /** Wartość docelowa (>0). Dla odznak typu „tak/nie" wynosi 1. */
  target: number;
};

/** Definicja pojedynczej odznaki (czysta — bez zależności runtime od React). */
export type Achievement = {
  id: string;
  title: string;
  /** Jak zdobyć odznakę (widoczne dla zablokowanych). */
  description: string;
  /** Krótki opis-„flavour" pokazywany po odblokowaniu (opcjonalny). */
  unlockedHint?: string;
  icon: AchievementIcon;
  category: AchievementCategory;
  tier: AchievementTier;
  /** Czysta funkcja postępu — wyliczana z PlayerStats. */
  measure: (stats: PlayerStats) => AchievementProgress;
};

/** Wynik ewaluacji odznaki dla danego gracza. */
export type AchievementStatus = {
  id: string;
  current: number;
  target: number;
  unlocked: boolean;
  /** Procent postępu 0–100 (zaokrąglony). */
  percent: number;
};
