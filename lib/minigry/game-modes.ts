export type MinigamePlayMode = "time_attack" | "survival" | "marathon";

export const MARATHON_QUESTION_COUNT = 15;
export const TIME_ATTACK_SECONDS = 60;

export type MinigameModeConfig = {
  id: MinigamePlayMode;
  slug: string;
  title: string;
  description: string;
  emoji: string;
  badge: string;
};

export const MINIGAME_MODES: MinigameModeConfig[] = [
  {
    id: "time_attack",
    slug: "time-attack",
    title: "Time Attack",
    description: "60 sekund na maksymalny wynik — każda dobra odpowiedź buduje combo.",
    emoji: "⏱️",
    badge: "Klasyczny",
  },
  {
    id: "survival",
    slug: "survival",
    title: "Survival",
    description: "Bez limitu czasu — gra kończy się przy pierwszym błędzie.",
    emoji: "💀",
    badge: "Hardcore",
  },
  {
    id: "marathon",
    slug: "marathon",
    title: "Marathon",
    description: "Dokładnie 15 pytań — wygrywa ten, kto zrobi to najszybciej.",
    emoji: "🏃",
    badge: "15 pytań",
  },
];

export function parseMinigameMode(value: string | null | undefined): MinigamePlayMode {
  if (value === "survival" || value === "marathon" || value === "time_attack") {
    return value;
  }
  return "time_attack";
}

export function modeFromSlug(slug: string): MinigamePlayMode | null {
  const found = MINIGAME_MODES.find((m) => m.slug === slug);
  return found?.id ?? null;
}

export function getModeConfig(mode: MinigamePlayMode): MinigameModeConfig {
  return MINIGAME_MODES.find((m) => m.id === mode) ?? MINIGAME_MODES[0];
}

export function modeDescription(mode: MinigamePlayMode): string {
  switch (mode) {
    case "time_attack":
      return "60 sekund — odpowiadaj jak najszybciej i buduj combo.";
    case "survival":
      return "Bez timera — jeden błąd kończy grę.";
    case "marathon":
      return "15 pytań — liczy się czas ukończenia i wynik.";
  }
}
