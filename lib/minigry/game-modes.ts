export type MinigamePlayMode = "time_attack" | "survival" | "marathon";

export const MARATHON_QUESTION_COUNT = 15;
export const TIME_ATTACK_SECONDS = 60;

export type MinigameModeConfig = {
  id: MinigamePlayMode;
  slug: string;
  title: string;
  description: string;
  badge: string;
};

export const MINIGAME_MODES: MinigameModeConfig[] = [
  {
    id: "time_attack",
    slug: "time-attack",
    title: "Na czas",
    description: "60 sekund na jak najwięcej poprawnych odpowiedzi.",
    badge: "60 s",
  },
  {
    id: "survival",
    slug: "survival",
    title: "Bez limitu czasu",
    description: "Pierwsza błędna odpowiedź kończy rundę.",
    badge: "1 błąd",
  },
  {
    id: "marathon",
    slug: "marathon",
    title: "15 pytań",
    description: "Po 15 pytaniach zobaczysz wynik i czas.",
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
  return MINIGAME_MODES.find((m) => m.id === mode) ?? MINIGAME_MODES[0]!;
}

export function modeDescription(mode: MinigamePlayMode): string {
  return getModeConfig(mode).description;
}

/** Krótka etykieta HUD (bez angielskich nazw). */
export function modeHudLabel(mode: MinigamePlayMode): string {
  switch (mode) {
    case "time_attack":
      return "Na czas";
    case "survival":
      return "Bez limitu czasu";
    case "marathon":
      return "15 pytań";
  }
}
