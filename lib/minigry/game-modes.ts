export type MinigamePlayMode = "time_attack" | "survival" | "marathon";

export const MARATHON_QUESTION_COUNT = 15;
export const TIME_ATTACK_SECONDS = 60;

export type MinigameModeConfig = {
  id: MinigamePlayMode;
  slug: string;
  title: string;
  description: string;
  emoji: string;
  gradient: string;
  glow: string;
  badge: string;
};

export const MINIGAME_MODES: MinigameModeConfig[] = [
  {
    id: "time_attack",
    slug: "time-attack",
    title: "Time Attack",
    description: "60 sekund na maksymalny wynik — każda dobra odpowiedź buduje combo.",
    emoji: "⏱️",
    gradient: "from-violet-600 via-fuchsia-500 to-pink-500",
    glow: "bg-fuchsia-400",
    badge: "Klasyczny",
  },
  {
    id: "survival",
    slug: "survival",
    title: "Survival",
    description: "Bez limitu czasu — gra kończy się przy pierwszym błędzie.",
    emoji: "💀",
    gradient: "from-red-600 via-orange-500 to-amber-500",
    glow: "bg-orange-400",
    badge: "Hardcore",
  },
  {
    id: "marathon",
    slug: "marathon",
    title: "Marathon",
    description: "Dokładnie 15 pytań — wygrywa ten, kto zrobi to najszybciej.",
    emoji: "🏃",
    gradient: "from-cyan-600 via-teal-500 to-emerald-600",
    glow: "bg-cyan-400",
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
