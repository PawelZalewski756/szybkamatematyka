import {
  Calculator,
  Circle,
  Divide,
  Equal,
  Grid2X2,
  LineChart,
  Minus,
  MoveHorizontal,
  Percent,
  Plus,
  Radical,
  Ruler,
  Scale,
  Sigma,
  Square,
  Target,
  Triangle,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type VisualTone =
  | "amber"
  | "sky"
  | "violet"
  | "rose"
  | "emerald"
  | "cyan"
  | "orange"
  | "indigo"
  | "fuchsia"
  | "lime"
  | "teal"
  | "slate";

export type GameVisual = {
  icon: LucideIcon;
  label: string;
  tone: VisualTone;
};

const SHARED_VISUAL_TONE = {
  panel: "border-accent/25 bg-accent/10",
  text: "text-accent",
  strong: "bg-accent",
} as const;

export const VISUAL_TONES = {
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

export const GAME_VISUALS: Record<string, GameVisual> = {
  "prawda-falsz": {
    icon: Scale,
    label: "Prawda/fałsz",
    tone: "violet",
  },
  mnozenie: {
    icon: Calculator,
    label: "Tabliczka",
    tone: "amber",
  },
  dodawanie: {
    icon: Plus,
    label: "Sumowanie",
    tone: "orange",
  },
  odejmowanie: {
    icon: Minus,
    label: "Różnica",
    tone: "rose",
  },
  dzielenie: {
    icon: Divide,
    label: "Iloraz",
    tone: "sky",
  },
  porownaj: {
    icon: Scale,
    label: "Relacje",
    tone: "indigo",
  },
  ulamki: {
    icon: Grid2X2,
    label: "Ułamki",
    tone: "cyan",
  },
  procenty: {
    icon: Percent,
    label: "Procenty",
    tone: "lime",
  },
  potegi: {
    icon: Zap,
    label: "Potęgi",
    tone: "violet",
  },
  pierwiastki: {
    icon: Radical,
    label: "Pierwiastki",
    tone: "teal",
  },
  rownania: {
    icon: Equal,
    label: "Równania",
    tone: "fuchsia",
  },
  ciag: {
    icon: MoveHorizontal,
    label: "Ciągi",
    tone: "emerald",
  },
  nawiasy: {
    icon: Calculator,
    label: "Kolejność",
    tone: "orange",
  },
  funkcje: {
    icon: LineChart,
    label: "Funkcje",
    tone: "emerald",
  },
  wzory: {
    icon: Equal,
    label: "Wzory",
    tone: "fuchsia",
  },
  logarytmy: {
    icon: Target,
    label: "Logarytmy",
    tone: "indigo",
  },
  pole: {
    icon: Square,
    label: "Pola",
    tone: "rose",
  },
  obwod: {
    icon: Ruler,
    label: "Obwody",
    tone: "sky",
  },
  nwd: {
    icon: Grid2X2,
    label: "Dzielniki",
    tone: "amber",
  },
  zaokraglenie: {
    icon: Circle,
    label: "Przybliżenia",
    tone: "teal",
  },
  przeciwna: {
    icon: MoveHorizontal,
    label: "Oś liczbowa",
    tone: "indigo",
  },
  "potegi-10": {
    icon: Zap,
    label: "Dziesiątki",
    tone: "amber",
  },
  trojkat: {
    icon: Triangle,
    label: "Kąty",
    tone: "rose",
  },
  "ulamki-plus": {
    icon: Plus,
    label: "Ułamki",
    tone: "cyan",
  },
  sinusy: {
    icon: LineChart,
    label: "Sinus",
    tone: "sky",
  },
  kosinusy: {
    icon: LineChart,
    label: "Kosinus",
    tone: "violet",
  },
  nww: {
    icon: Grid2X2,
    label: "Wielokrotności",
    tone: "lime",
  },
  kwadrat: {
    icon: Square,
    label: "Kwadraty",
    tone: "orange",
  },
  modulo: {
    icon: Divide,
    label: "Reszta",
    tone: "fuchsia",
  },
  "wartosc-bezwzgledna": {
    icon: MoveHorizontal,
    label: "Odległość",
    tone: "teal",
  },
  "ulamki-minus": {
    icon: Minus,
    label: "Ułamki",
    tone: "orange",
  },
  "pole-kola": {
    icon: Circle,
    label: "Koło",
    tone: "rose",
  },
  srednia: {
    icon: Sigma,
    label: "Statystyka",
    tone: "emerald",
  },
  "procent-odwrotny": {
    icon: Percent,
    label: "Proporcje",
    tone: "lime",
  },
};


const DEFAULT_GAME_VISUAL: GameVisual = {
  icon: Calculator,
  label: "Minigra",
  tone: "slate",
};

export function getGameVisual(game: { id: string }): GameVisual {
  return GAME_VISUALS[game.id] ?? DEFAULT_GAME_VISUAL;
}


const GAME_VISUAL_SIZES = {
  card: "h-12 w-12 rounded-xl",
  hero: "h-14 w-14 rounded-xl",
} as const;

export function MinigameGlyph({
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
      <Icon
        className={`${size === "hero" ? "h-6 w-6" : "h-5 w-5"} ${tone.text}`}
        strokeWidth={1.8}
      />
    </span>
  );
}
