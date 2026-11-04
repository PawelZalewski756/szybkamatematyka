"use client";

import { AccountLevelBar } from "@/components/minigry/AccountLevelBar";
import {
  groupMinigames,
  type MinigameGroup,
  type MinigameGroupVisual,
} from "@/components/minigry/minigame-groups";
import { useLearningPath } from "@/components/LearningPathProvider";
import {
  getMinigamesForPath,
  type MinigameEntry,
} from "@/lib/minigry/minigames-catalog";
import {
  MINIGAME_MODES,
  type MinigamePlayMode,
} from "@/lib/minigry/game-modes";
import { learningPathLabel } from "@/lib/learning-path";
import { useGameAccount } from "@/lib/minigry/use-game-account";
import {
  ArrowRight,
  Calculator,
  ChevronDown,
  Circle,
  Divide,
  Equal,
  Grid2X2,
  Layers,
  LineChart,
  Minus,
  MoveHorizontal,
  Percent,
  Plus,
  Radical,
  Ruler,
  Scale,
  ShieldCheck,
  Sigma,
  Sparkles,
  Square,
  Target,
  Timer,
  Triangle,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

function gameCountLabel(count: number): string {
  if (count === 1) return "1 gra";
  if (count >= 2 && count <= 4) return `${count} gry`;
  return `${count} gier`;
}

const SHARED_VISUAL_TONE = {
  panel: "border-accent/25 bg-accent/10",
  glow: "bg-accent/10",
  text: "text-accent",
  strong: "bg-accent",
} as const;

const VISUAL_TONES = {
  amber: SHARED_VISUAL_TONE,
  sky: SHARED_VISUAL_TONE,
  violet: SHARED_VISUAL_TONE,
  rose: SHARED_VISUAL_TONE,
  emerald: SHARED_VISUAL_TONE,
  cyan: SHARED_VISUAL_TONE,
  orange: SHARED_VISUAL_TONE,
  indigo: SHARED_VISUAL_TONE,
  fuchsia: SHARED_VISUAL_TONE,
  lime: SHARED_VISUAL_TONE,
  teal: SHARED_VISUAL_TONE,
  slate: SHARED_VISUAL_TONE,
} as const;

type VisualTone = keyof typeof VISUAL_TONES;
type VisualMotif =
  | "grid"
  | "dots"
  | "orbit"
  | "rays"
  | "bars"
  | "triangle"
  | "fraction"
  | "axis"
  | "waves"
  | "squares"
  | "formula"
  | "chart"
  | "layers";

type GameVisual = {
  icon: LucideIcon;
  label: string;
  marker: string;
  motif: VisualMotif;
  tone: VisualTone;
};

const GAME_VISUALS: Record<string, GameVisual> = {
  "prawda-falsz": {
    icon: Scale,
    label: "Prawda/fałsz",
    marker: "T/N",
    motif: "axis",
    tone: "violet",
  },
  mnozenie: {
    icon: Calculator,
    label: "Tabliczka",
    marker: "×",
    motif: "grid",
    tone: "amber",
  },
  dodawanie: {
    icon: Plus,
    label: "Sumowanie",
    marker: "+",
    motif: "rays",
    tone: "orange",
  },
  odejmowanie: {
    icon: Minus,
    label: "Różnica",
    marker: "−",
    motif: "axis",
    tone: "rose",
  },
  dzielenie: {
    icon: Divide,
    label: "Iloraz",
    marker: "÷",
    motif: "fraction",
    tone: "sky",
  },
  porownaj: {
    icon: Scale,
    label: "Relacje",
    marker: "≷",
    motif: "axis",
    tone: "indigo",
  },
  ulamki: {
    icon: Grid2X2,
    label: "Ułamki",
    marker: "½",
    motif: "fraction",
    tone: "cyan",
  },
  procenty: {
    icon: Percent,
    label: "Procenty",
    marker: "%",
    motif: "dots",
    tone: "lime",
  },
  potegi: {
    icon: Zap,
    label: "Potęgi",
    marker: "x²",
    motif: "rays",
    tone: "violet",
  },
  pierwiastki: {
    icon: Radical,
    label: "Pierwiastki",
    marker: "√",
    motif: "formula",
    tone: "teal",
  },
  rownania: {
    icon: Equal,
    label: "Równania",
    marker: "x=",
    motif: "formula",
    tone: "fuchsia",
  },
  ciag: {
    icon: MoveHorizontal,
    label: "Ciągi",
    marker: "…",
    motif: "dots",
    tone: "emerald",
  },
  nawiasy: {
    icon: Calculator,
    label: "Kolejność",
    marker: "( )",
    motif: "squares",
    tone: "orange",
  },
  funkcje: {
    icon: LineChart,
    label: "Funkcje",
    marker: "f(x)",
    motif: "chart",
    tone: "emerald",
  },
  wzory: {
    icon: Sparkles,
    label: "Wzory",
    marker: "a²",
    motif: "formula",
    tone: "fuchsia",
  },
  logarytmy: {
    icon: Target,
    label: "Logarytmy",
    marker: "log",
    motif: "orbit",
    tone: "indigo",
  },
  pole: {
    icon: Square,
    label: "Pola",
    marker: "a·b",
    motif: "squares",
    tone: "rose",
  },
  obwod: {
    icon: Ruler,
    label: "Obwody",
    marker: "2a+2b",
    motif: "axis",
    tone: "sky",
  },
  nwd: {
    icon: Grid2X2,
    label: "Dzielniki",
    marker: "NWD",
    motif: "grid",
    tone: "amber",
  },
  zaokraglenie: {
    icon: Circle,
    label: "Przybliżenia",
    marker: "≈",
    motif: "orbit",
    tone: "teal",
  },
  przeciwna: {
    icon: MoveHorizontal,
    label: "Oś liczbowa",
    marker: "−x",
    motif: "axis",
    tone: "indigo",
  },
  "potegi-10": {
    icon: Zap,
    label: "Dziesiątki",
    marker: "10ⁿ",
    motif: "bars",
    tone: "amber",
  },
  trojkat: {
    icon: Triangle,
    label: "Kąty",
    marker: "180°",
    motif: "triangle",
    tone: "rose",
  },
  "ulamki-plus": {
    icon: Plus,
    label: "Ułamki",
    marker: "⅓+",
    motif: "fraction",
    tone: "cyan",
  },
  sinusy: {
    icon: LineChart,
    label: "Sinus",
    marker: "sin",
    motif: "waves",
    tone: "sky",
  },
  kosinusy: {
    icon: LineChart,
    label: "Kosinus",
    marker: "cos",
    motif: "waves",
    tone: "violet",
  },
  nww: {
    icon: Grid2X2,
    label: "Wielokrotności",
    marker: "NWW",
    motif: "grid",
    tone: "lime",
  },
  kwadrat: {
    icon: Square,
    label: "Kwadraty",
    marker: "x²",
    motif: "squares",
    tone: "orange",
  },
  modulo: {
    icon: Divide,
    label: "Reszta",
    marker: "mod",
    motif: "bars",
    tone: "fuchsia",
  },
  "wartosc-bezwzgledna": {
    icon: MoveHorizontal,
    label: "Odległość",
    marker: "|x|",
    motif: "axis",
    tone: "teal",
  },
  "ulamki-minus": {
    icon: Minus,
    label: "Ułamki",
    marker: "⅔−",
    motif: "fraction",
    tone: "orange",
  },
  "pole-kola": {
    icon: Circle,
    label: "Koło",
    marker: "πr²",
    motif: "orbit",
    tone: "rose",
  },
  srednia: {
    icon: Sigma,
    label: "Statystyka",
    marker: "x̄",
    motif: "chart",
    tone: "emerald",
  },
  "procent-odwrotny": {
    icon: Percent,
    label: "Proporcje",
    marker: "p%",
    motif: "dots",
    tone: "lime",
  },
};

const DEFAULT_GAME_VISUAL: GameVisual = {
  icon: Sparkles,
  label: "Minigra",
  marker: "∎",
  motif: "layers",
  tone: "slate",
};

function getGameVisual(game: MinigameEntry): GameVisual {
  return GAME_VISUALS[game.id] ?? DEFAULT_GAME_VISUAL;
}

const GROUP_ICONS: Record<MinigameGroupVisual["icon"], LucideIcon> = {
  calculator: Calculator,
  sigma: Sigma,
  radical: Radical,
  triangle: Triangle,
  "line-chart": LineChart,
  layers: Layers,
};

function VisualMotif({
  motif,
  tone,
}: {
  motif: VisualMotif;
  tone: VisualTone;
}) {
  const motifClass = `pointer-events-none absolute inset-0 opacity-25 ${VISUAL_TONES[tone].text}`;
  const dotClass = "h-1.5 w-1.5 rounded-full bg-current";

  switch (motif) {
    case "grid":
      return (
        <span
          className={`${motifClass} grid grid-cols-3 place-content-center gap-1.5 p-3`}
          aria-hidden
        >
          {Array.from({ length: 9 }, (_, index) => (
            <span key={index} className="h-1.5 w-1.5 rounded-sm bg-current" />
          ))}
        </span>
      );
    case "dots":
      return (
        <span
          className={`${motifClass} grid grid-cols-2 place-content-center gap-2 p-4`}
          aria-hidden
        >
          {Array.from({ length: 4 }, (_, index) => (
            <span key={index} className={dotClass} />
          ))}
        </span>
      );
    case "orbit":
      return (
        <span className={motifClass} aria-hidden>
          <span className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-current" />
          <span className="absolute left-1/2 top-1/2 h-8 w-20 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[50%] border border-current" />
          <span className="absolute left-[68%] top-[27%] h-2 w-2 rounded-full bg-current" />
        </span>
      );
    case "rays":
      return (
        <span className={motifClass} aria-hidden>
          <span className="absolute left-1/2 top-1/2 h-20 w-1 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-current" />
          <span className="absolute left-1/2 top-1/2 h-20 w-1 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-current" />
          <span className="absolute left-1/2 top-1/2 h-16 w-1 -translate-x-1/2 -translate-y-1/2 rotate-90 rounded-full bg-current" />
        </span>
      );
    case "bars":
      return (
        <span
          className={`${motifClass} flex items-end justify-center gap-1.5 p-4`}
          aria-hidden
        >
          <span className="h-5 w-1.5 rounded-full bg-current" />
          <span className="h-9 w-1.5 rounded-full bg-current" />
          <span className="h-7 w-1.5 rounded-full bg-current" />
          <span className="h-12 w-1.5 rounded-full bg-current" />
        </span>
      );
    case "triangle":
      return (
        <span className={motifClass} aria-hidden>
          <span className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-md border-2 border-current" />
          <span className="absolute left-1/2 top-[28%] h-2 w-2 -translate-x-1/2 rounded-full bg-current" />
        </span>
      );
    case "fraction":
      return (
        <span className={`${motifClass} flex flex-col items-center justify-center gap-1`} aria-hidden>
          <span className="text-xs font-bold">1</span>
          <span className="h-px w-8 bg-current" />
          <span className="text-xs font-bold">2</span>
        </span>
      );
    case "axis":
      return (
        <span className={motifClass} aria-hidden>
          <span className="absolute left-4 right-4 top-1/2 h-px bg-current" />
          <span className="absolute left-1/2 top-4 bottom-4 w-px bg-current" />
          <span className="absolute left-[30%] top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-current" />
          <span className="absolute left-[70%] top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-current" />
        </span>
      );
    case "waves":
      return (
        <span className={motifClass} aria-hidden>
          <span className="absolute left-1/2 top-1/2 h-10 w-20 -translate-x-1/2 -translate-y-1/2 -rotate-6 rounded-[50%] border-2 border-current" />
          <span className="absolute left-1/2 top-1/2 h-6 w-20 -translate-x-1/2 -translate-y-1/2 rotate-6 rounded-[50%] border-2 border-current" />
        </span>
      );
    case "squares":
      return (
        <span className={motifClass} aria-hidden>
          <span className="absolute left-[25%] top-[25%] h-8 w-8 rounded-md border-2 border-current" />
          <span className="absolute bottom-[25%] right-[25%] h-8 w-8 rounded-md border-2 border-current" />
        </span>
      );
    case "formula":
      return (
        <span className={`${motifClass} flex flex-col justify-center gap-2 px-4`} aria-hidden>
          <span className="h-1 w-12 rounded-full bg-current" />
          <span className="h-1 w-8 rounded-full bg-current" />
          <span className="h-1 w-10 rounded-full bg-current" />
        </span>
      );
    case "chart":
      return (
        <span className={motifClass} aria-hidden>
          <span className="absolute bottom-5 left-4 h-px w-16 bg-current" />
          <span className="absolute bottom-5 left-4 h-16 w-px bg-current" />
          <span className="absolute bottom-6 left-7 h-8 w-8 -rotate-45 border-l-2 border-t-2 border-current" />
          <span className="absolute bottom-10 left-12 h-8 w-8 rotate-12 border-l-2 border-t-2 border-current" />
        </span>
      );
    case "layers":
      return (
        <span className={motifClass} aria-hidden>
          <span className="absolute left-1/2 top-[32%] h-8 w-14 -translate-x-1/2 rotate-45 rounded-md border-2 border-current" />
          <span className="absolute left-1/2 top-[48%] h-8 w-14 -translate-x-1/2 rotate-45 rounded-md border-2 border-current" />
          <span className="absolute left-1/2 top-[64%] h-8 w-14 -translate-x-1/2 rotate-45 rounded-md border-2 border-current" />
        </span>
      );
  }
}

const GAME_VISUAL_SIZES = {
  card: "min-h-[144px] w-20 rounded-none border-y-0 border-l-0 border-r sm:w-24",
  hero: "h-20 w-20 rounded-2xl",
  group: "h-12 w-12 rounded-2xl",
} as const;

function GameVisual({
  visual,
  size,
}: {
  visual: GameVisual;
  size: keyof typeof GAME_VISUAL_SIZES;
}) {
  const Icon = visual.icon;
  const tone = VISUAL_TONES[visual.tone];

  return (
    <span
      className={`relative isolate flex shrink-0 items-center justify-center overflow-hidden border ${tone.panel} ${GAME_VISUAL_SIZES[size]}`}
      aria-hidden
    >
      <span className={`absolute -right-5 -top-5 h-16 w-16 rounded-full blur-2xl ${tone.glow}`} />
      <VisualMotif motif={visual.motif} tone={visual.tone} />
      <span className={`relative z-10 flex items-center justify-center rounded-2xl border border-current/30 bg-background/20 p-2.5 ${tone.text}`}>
        <Icon className={size === "hero" ? "h-7 w-7" : "h-6 w-6"} strokeWidth={1.8} />
      </span>
    </span>
  );
}

const MODE_VISUALS: Record<
  MinigamePlayMode,
  { eyebrow: string; icon: LucideIcon; motif: VisualMotif; tone: VisualTone }
> = {
  time_attack: {
    eyebrow: "60 sekund",
    icon: Timer,
    motif: "rays",
    tone: "amber",
  },
  survival: {
    eyebrow: "Bez limitu czasu",
    icon: ShieldCheck,
    motif: "orbit",
    tone: "rose",
  },
  marathon: {
    eyebrow: "15 pytań",
    icon: Trophy,
    motif: "bars",
    tone: "sky",
  },
};

function ModeHubCard({
  mode,
  recommended,
}: {
  mode: (typeof MINIGAME_MODES)[number];
  recommended: boolean;
}) {
  const visual = MODE_VISUALS[mode.id];
  const Icon = visual.icon;
  const tone = VISUAL_TONES[visual.tone];

  return (
    <Link
      href={`/minigry/modes/${mode.slug}`}
      data-testid={`minigame-mode-${mode.id}`}
      className={`group relative isolate flex min-h-0 flex-col overflow-hidden border-b border-surface-border p-0 transition last:border-b-0 hover:bg-surface-hover md:border-b-0 md:border-r md:last:border-r-0 ${
        recommended ? "border-accent/50 bg-accent-soft" : ""
      }`}
    >
      <span className={`pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl ${tone.glow}`} aria-hidden />
      <span className="relative flex items-start justify-between gap-3 p-4 sm:p-5">
        <span className={`relative isolate flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border ${tone.panel}`}>
          <VisualMotif motif={visual.motif} tone={visual.tone} />
          <Icon className={`relative z-10 h-6 w-6 ${tone.text}`} strokeWidth={1.8} aria-hidden />
        </span>
        <span className="flex min-w-0 flex-col items-end gap-2 text-right">
          <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${tone.panel} ${tone.text}`}>
            {mode.badge}
          </span>
          {recommended ? (
            <span className="text-xs font-bold text-accent">Proponowana minigra</span>
          ) : null}
        </span>
      </span>
      <span className="relative mt-auto p-4 pt-0 sm:p-5 sm:pt-0">
        <span className={`text-[11px] font-bold uppercase tracking-[0.16em] ${tone.text}`}>
          {visual.eyebrow}
        </span>
        <h3 className="mt-1 text-lg font-bold text-foreground">{mode.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">{mode.description}</p>
        <span className={`mt-4 flex items-center gap-2 text-sm font-bold ${tone.text}`}>
          Wybierz minigrę
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
        </span>
      </span>
    </Link>
  );
}

function RecommendedStart({
  game,
  pathLabel,
}: {
  game?: MinigameEntry;
  pathLabel: string;
}) {
  if (!game) {
    return (
      <section className="rounded-2xl border border-surface-border bg-surface p-5 sm:p-6">
        <p className="text-sm text-muted">
          Brak dostępnej minigry dla tej ścieżki. Wybierz tryb poniżej, aby
          zobaczyć pełną bibliotekę.
        </p>
      </section>
    );
  }

  const visual = getGameVisual(game);
  const tone = VISUAL_TONES[visual.tone];

  return (
    <Link
      href={`${game.href}?mode=time_attack`}
      data-testid="minigame-recommended-start"
      className="group relative isolate overflow-hidden rounded-r-2xl border-y border-r border-accent/35 border-l-4 border-l-accent bg-accent-soft/30 p-0 transition hover:bg-accent-soft/50"
    >
      <span className={`pointer-events-none absolute -right-14 -top-16 h-56 w-56 rounded-full blur-3xl ${tone.glow}`} aria-hidden />
      <span className="relative flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center">
        <span className="flex shrink-0 items-center gap-3">
          <GameVisual visual={visual} size="hero" />
          <span className={`hidden text-[11px] font-bold uppercase tracking-[0.16em] sm:block lg:hidden ${tone.text}`}>
            {visual.label}
          </span>
        </span>
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-overline text-accent">Proponowana minigra</span>
            <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${tone.panel} ${tone.text}`}>
              {visual.label}
            </span>
          </span>
          <h2 className="mt-1 text-lg font-bold text-foreground sm:text-xl">
            {game.title}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            {game.description}
          </p>
        </span>
      </span>
      <span className="relative flex flex-col items-start gap-3 border-t border-accent/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <span className="btn-chunky px-4 py-2.5 text-sm">
          Otwórz minigrę
          <ArrowRight className="h-4 w-4" aria-hidden />
        </span>
        <span className="text-xs font-semibold text-muted">
          {pathLabel} · Na czas · 60 s
        </span>
      </span>
    </Link>
  );
}

function MinigameCard({ game }: { game: MinigameEntry }) {
  const visual = getGameVisual(game);
  const tone = VISUAL_TONES[visual.tone];

  return (
    <Link
      href={`${game.href}?mode=time_attack`}
      data-testid="minigame-game-card"
      className="group flex min-h-[144px] overflow-hidden rounded-2xl border border-surface-border bg-surface transition-[border-color,background-color,transform] hover:-translate-y-0.5 hover:border-accent/45 hover:bg-surface-hover"
    >
      <GameVisual visual={visual} size="card" />
      <span className="flex min-w-0 flex-1 flex-col justify-between gap-3 p-4">
        <span className="min-w-0">
          <span className="flex items-start justify-between gap-2">
            <span className="min-w-0">
              <span className={`block text-[10px] font-bold uppercase tracking-[0.14em] ${tone.text}`}>
                {visual.label}
              </span>
              <span className="mt-1 block line-clamp-1 text-sm font-bold text-foreground">
                {game.title}
              </span>
            </span>
            <ArrowRight className={`mt-0.5 h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-1 ${tone.text}`} aria-hidden />
          </span>
          <span className="mt-2 block line-clamp-2 text-xs leading-relaxed text-muted">
            {game.description}
          </span>
        </span>
        <span className="flex items-center gap-2 text-[11px] font-semibold text-muted">
          <span className={`h-1.5 w-1.5 rounded-full ${tone.strong}`} aria-hidden />
          Na czas · 60 s
        </span>
      </span>
    </Link>
  );
}

function GroupVisual({ group }: { group: MinigameGroup }) {
  const Icon = GROUP_ICONS[group.visual.icon];
  const tone = VISUAL_TONES[group.visual.tone];

  return (
    <span className={`relative isolate flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border ${tone.panel}`}>
      <VisualMotif motif={group.visual.motif} tone={group.visual.tone} />
      <Icon className={`relative z-10 h-5 w-5 ${tone.text}`} strokeWidth={1.8} aria-hidden />
    </span>
  );
}

function MinigameGroupDisclosure({ group }: { group: MinigameGroup }) {
  const tone = VISUAL_TONES[group.visual.tone];

  return (
    <details
      className="group overflow-hidden border-t border-surface-border bg-background"
      data-testid={`minigame-group-${group.id}`}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-3 marker:content-none sm:gap-4 sm:p-4">
        <span className="flex min-w-0 items-center gap-3">
          <GroupVisual group={group} />
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className={`text-[10px] font-bold uppercase tracking-[0.14em] ${tone.text}`}>
                {group.visual.eyebrow}
              </span>
              <span className="text-xs font-semibold text-muted">
                {gameCountLabel(group.games.length)}
              </span>
            </span>
            <span className="mt-1 block text-sm font-bold text-foreground sm:text-base">
              {group.title}
            </span>
            <span className="mt-0.5 block line-clamp-2 text-xs text-muted">
              {group.description}
            </span>
          </span>
        </span>
        <span className={`flex shrink-0 items-center gap-2 text-xs font-semibold ${tone.text}`}>
          <span className="hidden sm:inline">Otwórz</span>
          <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" aria-hidden />
        </span>
      </summary>
      <div className="border-t border-surface-border p-3 sm:p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {group.games.map((game) => (
            <MinigameCard key={game.id} game={game} />
          ))}
        </div>
      </div>
    </details>
  );
}

function MinigameLibraryDisclosure({
  title,
  description,
  groups,
  testId,
  open = false,
}: {
  title: string;
  description: string;
  groups: MinigameGroup[];
  testId: string;
  open?: boolean;
}) {
  const gameCount = groups.reduce((total, group) => total + group.games.length, 0);

  return (
    <details
      open={open}
      className="group overflow-hidden border-y border-surface-border bg-surface"
      data-testid={testId}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 marker:content-none sm:p-5">
        <span className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-base font-bold text-foreground">{title}</span>
            <span className="mt-1 block text-sm text-muted">{description}</span>
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2 text-xs font-semibold text-muted">
          {gameCountLabel(gameCount)}
          <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden />
        </span>
      </summary>
      <div className="space-y-3 border-t border-surface-border p-3 sm:p-4">
        {groups.map((group) => (
          <MinigameGroupDisclosure key={group.id} group={group} />
        ))}
      </div>
    </details>
  );
}

export default function MinigryPage() {
  const { path } = useLearningPath();
  const { account, loading, displayProgress } = useGameAccount();
  const { recommended, other } = getMinigamesForPath(path);
  const pathLabel = learningPathLabel(path);
  const recommendedStart = recommended[0] ?? other[0];
  const recommendedGames = recommended.filter(
    (game) => game.id !== recommendedStart?.id,
  );
  const otherGames = other.filter((game) => game.id !== recommendedStart?.id);
  const recommendedGroups = groupMinigames(recommendedGames);
  const otherGroups = groupMinigames(otherGames);

  return (
    <div className="page-container flex w-full flex-1 flex-col py-6 sm:py-10">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-surface-border pb-6 sm:pb-7"
      >
        <span className="relative block">
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-overline">Krótkie rundy</span>
              <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-accent">
                3 tryby
              </span>
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Minigry · <span className="text-gradient-brand">{pathLabel}</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
              Wybierz jedną rundę i zacznij ćwiczyć.
            </p>
          </span>
        </span>
      </motion.header>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)]">
        <RecommendedStart game={recommendedStart} pathLabel={pathLabel} />

        <aside>
          <p className="mb-3 text-overline">Twój progres</p>
          {loading ? (
            <div className="h-[92px] animate-pulse rounded-2xl bg-surface" />
          ) : (
            <>
              <AccountLevelBar
                level={displayProgress.level}
                xp={displayProgress.xp}
                subtitle={
                  account?.isLoggedIn && account.profile
                    ? account.profile.nick
                    : "Gość · progres lokalny"
                }
              />
              {!account?.isLoggedIn && (
                <p className="mt-2 text-sm text-muted">
                  <Link href="/login" className="font-semibold text-accent">
                    Zaloguj się
                  </Link>{" "}
                  — zapisuj XP w chmurze na każdym urządzeniu.
                </p>
              )}
            </>
          )}
        </aside>
      </div>

      <section
        className="mt-9"
        aria-labelledby="minigame-mode-selection"
        data-testid="minigame-mode-selection"
      >
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <p className="text-overline">Sposób gry</p>
            <h2
              id="minigame-mode-selection"
              className="mt-1 text-xl font-bold text-foreground"
            >
              Wybierz tryb
            </h2>
          </div>
          <p className="max-w-xl text-xs text-muted sm:text-sm">
            Zmienisz tryb, gdy będziesz mieć ochotę na inną rundę.
          </p>
        </div>
        <div className="mt-4 grid grid-cols-1 overflow-hidden rounded-xl border border-surface-border bg-surface md:grid-cols-3">
          {MINIGAME_MODES.map((mode) => (
            <ModeHubCard key={mode.id} mode={mode} recommended={mode.id === "time_attack"} />
          ))}
        </div>
      </section>

      <section className="mt-10" aria-labelledby="minigame-library">
        <div>
          <p className="text-overline">Biblioteka</p>
          <h2
            id="minigame-library"
            className="mt-1 text-xl font-bold text-foreground"
          >
            Odkrywaj według tematu
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Otwórz obszar, który chcesz teraz przećwiczyć.
          </p>
        </div>

        <div className="mt-5 space-y-3">
          {recommendedGroups.length > 0 ? (
            <MinigameLibraryDisclosure
              title={`Dopasowane do: ${pathLabel}`}
              description={`${gameCountLabel(recommendedGames.length)} poza polecanym startem.`}
              groups={recommendedGroups}
              testId="minigame-matched-library"
              open
            />
          ) : null}

          {otherGroups.length > 0 ? (
            <MinigameLibraryDisclosure
              title="Pełna biblioteka"
              description="Pozostałe minigry z innych ścieżek i poziomów."
              groups={otherGroups}
              testId="minigame-other-library"
            />
          ) : null}

          {!recommendedStart ? (
            <p className="rounded-2xl border border-surface-border bg-surface p-4 text-sm text-muted">
              Brak minigier — spróbuj zmienić ścieżkę w ustawieniach.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
