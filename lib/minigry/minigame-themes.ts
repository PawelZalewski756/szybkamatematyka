import type { MinigameTheme } from "@/components/minigry/MinigameShell";

/** Jednolity motyw minigier — bursztyn z design systemu. */
export const DEFAULT_MINIGAME_THEME: MinigameTheme = {
  label: "text-accent",
  badge: "border-accent/40 bg-accent/10 text-accent",
  tryText: "text-accent",
  hudShadow: "border-surface-border",
};

/** Klasy kart minigier (bez tęczowych gradientów). */
export const MINIGAME_CARD_CLASS = "bg-surface border border-accent/25";
export const MINIGAME_CARD_GLOW = "bg-accent/15";
export const MINIGAME_ANSWER_BORDER =
  "border-surface-border hover:border-accent/40 hover:bg-accent/5";

/** Nagłówek trybu gry (Time Attack, Survival…). */
export const MINIGAME_MODE_HEADER_CLASS =
  "rounded-2xl border border-accent/25 bg-surface p-6 sm:p-8";
