export type MinigamePlayMode = "time_attack" | "survival" | "marathon";

export const MARATHON_QUESTION_COUNT = 15;
export const TIME_ATTACK_SECONDS = 60;

export type MinigameModeConfig = {
  id: MinigamePlayMode;
  slug: string;
  title: string;
  description: string;
  /** Opcjonalny symbol — unikamy zbędnych emotek. */
  emoji: string;
  badge: string;
};

export const MINIGAME_MODES: MinigameModeConfig[] = [
  {
    id: "time_attack",
    slug: "time-attack",
    title: "Na czas",
    description: "60 sekund — jak najwięcej poprawnych odpowiedzi. Dobra passa daje combo.",
    emoji: "",
    badge: "60 s",
  },
  {
    id: "survival",
    slug: "survival",
    title: "Przetrwanie",
    description: "Bez limitu czasu. Pierwszy błąd kończy rundę.",
    emoji: "",
    badge: "1 życie",
  },
  {
    id: "marathon",
    slug: "marathon",
    title: "Maraton",
    description: "Dokładnie 15 pytań. Liczy się wynik i czas ukończenia.",
    emoji: "",
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
  switch (mode) {
    case "time_attack":
      return "Masz 60 sekund. Odpowiadaj szybko — seria poprawnych odpowiedzi buduje combo.";
    case "survival":
      return "Bez timera. Jeden błąd kończy grę.";
    case "marathon":
      return "15 pytań z rzędu. Na końcu zobaczysz wynik i czas.";
  }
}

/** Krótka etykieta HUD (bez angielskich nazw). */
export function modeHudLabel(mode: MinigamePlayMode): string {
  switch (mode) {
    case "time_attack":
      return "Na czas";
    case "survival":
      return "Przetrwanie";
    case "marathon":
      return "Maraton";
  }
}
